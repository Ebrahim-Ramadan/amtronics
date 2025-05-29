import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const search = searchParams.get("search")
    const featured = searchParams.get("featured")
    const recent = searchParams.get("recent")
    const limit = Number.parseInt(searchParams.get("limit") || "20")

    const client = await clientPromise
    const db = client.db("ecommerce")

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
      // Featured products could be based on sold_quantity or custom field
      sort = { sold_quantity: -1 }
    } else if (recent === "true") {
      sort = { _id: -1 }
    }

    const products = await db.collection("products").find(query).sort(sort).limit(limit).toArray()

    return NextResponse.json(products)
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}
