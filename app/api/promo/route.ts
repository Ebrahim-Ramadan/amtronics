import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function POST(request: Request) {
  try {
    const { code } = await request.json()
console.log('Received promo code:', code);

    const client = await clientPromise
    const db = client.db("amtronics")

    const promoCode = await db.collection("promocodes").findOne({
      code: code,
      active: true,
      expiry: { $gte: new Date().toISOString() },
    })
console.log('route promoCode', promoCode);

    if (!promoCode) {
      return NextResponse.json({ error: "Invalid or expired promo code" }, { status: 400 })
    }

    return NextResponse.json(promoCode)
  } catch (error) {
    console.error("Error validating promo code:", error)
    return NextResponse.json({ error: "Failed to validate promo code" }, { status: 500 })
  }
}
