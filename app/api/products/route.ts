import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

// Helper to escape regex special characters
function escapeRegex(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const search = searchParams.get("search")
    const featured = searchParams.get("featured")
    const recent = searchParams.get("recent")
    const limit = Number.parseInt(searchParams.get("limit") || "15")
    const skip = Number.parseInt(searchParams.get("skip") || "0")

    const client = await clientPromise
    const db = client.db("amtronics")

    const queryBase: any = {  }
    let products: any[] = []
    let total = 0

    // Helper to build $or for a category string
    const buildCategoryOr = (cat: string) => [
      { en_category: { $regex: escapeRegex(cat), $options: "i" } },
      { en_name: { $regex: escapeRegex(cat), $options: "i" } },
      { en_long_description: { $regex: escapeRegex(cat), $options: "i" } },
    ]

    if (category && category.includes("&")) {

      // Split and trim categories
      const categories = category.split("&").map(c => c.trim())
      if (category.includes("Motor & Pump")) categories.push("Servo", "Stepper Motor");

      // Search each category individually and combine results
      let combinedProducts: any[] = []
      for (const cat of categories) {
        const query = { ...queryBase, $or: buildCategoryOr(cat) }
        const result = await db.collection("products").find(query, { projection: {
          _id: 1,
          en_name: 1,
          ar_name: 1,
          price: 1,
          image: 1,
          ave_cost: 1,
        }}).toArray()
        combinedProducts = combinedProducts.concat(result)
      }
      // Remove duplicates by _id
      const uniqueProducts = Array.from(new Map(combinedProducts.map(p => [p._id.toString(), p])).values())
      products = uniqueProducts

      // Now search with all combined as a single string
      const combinedCategory = categories.join(" ")
      const query = { ...queryBase, $or: buildCategoryOr(combinedCategory) }
      const result = await db.collection("products").find(query, { projection: {
        _id: 1,
        en_name: 1,
        ar_name: 1,
        price: 1,
        image: 1,
        ave_cost: 1,
      }}).toArray()
      // Add new results, avoiding duplicates
      const allProductsMap = new Map(products.map(p => [p._id.toString(), p]))
      for (const prod of result) {
        allProductsMap.set(prod._id.toString(), prod)
      }
      products = Array.from(allProductsMap.values())
      total = products.length

      // Apply limit and skip
      products = products.slice(skip, skip + 15)
    } else {
      // Normal category or no category
      const query: any = { ...queryBase }
      if (category) {
        query.$or = buildCategoryOr(category)
      }
      if (search) {
        const safeSearch = escapeRegex(search)
        query.$or = [
          { en_name: { $regex: safeSearch, $options: "i" } },
          { ar_name: { $regex: safeSearch, $options: "i" } },
          // { en_description: { $regex: safeSearch, $options: "i" } },
          { en_long_description: { $regex: safeSearch, $options: "i" } },
          { en_category: { $regex: safeSearch, $options: "i" } },
        ]
      }

      let sort: any = {}
      if (featured === "true") {
        sort = { sold_quantity: -1, price: -1 }
      } else if (recent === "true") {
        sort = { _id: -1, price: 1 }
      } else {
        sort = { sold_quantity: -1 }
      }

      products = await db.collection("products").find(query, { projection: {
        _id: 1,
        en_name: 1,
        ar_name: 1,
        price: 1,
        image: 1,
        ave_cost: 1,
      }}).sort(sort).skip(skip).limit(limit).toArray()
      total = await db.collection("products").countDocuments(query)
    }

    return NextResponse.json({ products, total })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}