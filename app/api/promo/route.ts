import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function POST(request: Request) {
  try {
    const { code } = await request.json()

    const client = await clientPromise
    const db = client.db("ecommerce")

    const promoCode = await db.collection("promocodes").findOne({
      code: code,
      active: true,
      expiry: { $gte: new Date() },
    })

    if (!promoCode) {
      return NextResponse.json({ error: "Invalid or expired promo code" }, { status: 400 })
    }

    return NextResponse.json(promoCode)
  } catch (error) {
    console.error("Error validating promo code:", error)
    return NextResponse.json({ error: "Failed to validate promo code" }, { status: 500 })
  }
}
