import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET(request: Request) {
  try {
    const client = await clientPromise
    const db = client.db("amtronics")

    const query: any = {}
    query.active = true

    // Get only the active offer(s)
    const offers = await db.collection("offers").find(query).sort({ _id: -1 }).limit(1).toArray()

    return NextResponse.json(offers)
  } catch (error) {
    console.error("Error fetching offers:", error)
    return NextResponse.json({ error: "Failed to fetch offers" }, { status: 500 })
  }
}