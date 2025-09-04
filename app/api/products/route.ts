import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

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

    const query: any = { visible_in_catalog: 1 }

    if (category) {
      query.$or = [
        { en_main_category: { $regex: category, $options: "i" } },
        { ar_main_category: { $regex: category, $options: "i" } },
      ]
    }

    if (search) {
      query.$or = [
        { en_name: { $regex: search, $options: "i" } },
        { ar_name: { $regex: search, $options: "i" } },
        { en_description: { $regex: search, $options: "i" } },
        { ar_description: { $regex: search, $options: "i" } },
      ]
    }

    let sort: any = {}
    if (featured === "true") {
      // Simulate featured products by combining sold_quantity and random factor
      // In a real scenario, you might have a featured flag in the database
      sort = { sold_quantity: -1, price: -1 }
    } else if (recent === "true") {
      // Simulate recent products by sorting by _id (newest first) and price
      sort = { _id: -1, price: 1 }
    } else {
      // Default sorting
      sort = { sold_quantity: -1 }
    }

    // Add some randomization for featured products to make it more dynamic
    if (featured === "true") {
      // You can add additional logic here to randomize featured products
      // For now, we'll use a combination of sold_quantity and price
    }

    // Only fetch summary fields for product list
    const projection = {
      _id: 1,
      en_name: 1,
      ar_name: 1,
      price: 1,
      image: 1,
      ave_cost: 1,
      // add more summary fields if needed
    }

    const products = await db.collection("products").find(query, { projection }).sort(sort).skip(skip).limit(limit).toArray()
    const total = await db.collection("products").countDocuments(query);

    return NextResponse.json({ products, total })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}