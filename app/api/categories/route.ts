import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("amtronics")

    const categories = await db
      .collection("products")
      .aggregate([
        {  },
        {
          $group: {
            _id: null,
            en_categories: { $addToSet: "$en_main_category" },
            ar_categories: { $addToSet: "$ar_main_category" },
          },
        },
      ])
      .toArray()

    return NextResponse.json(categories[0] || { en_categories: [], ar_categories: [] })
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 })
  }
}
