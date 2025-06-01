import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(request: Request) {
  try {
    const orderData = await request.json()

    const client = await clientPromise
    const db = client.db("amtronics")

    // Start a session for transaction
    const session = client.startSession()

    try {
      await session.withTransaction(async () => {
        // Insert order
        const orderResult = await db.collection("orders").insertOne(
          {
            ...orderData,
            status: "pending",
            createdAt: new Date(),
          },
          { session },
        )

        // bulkupdate unstead of Update product quantities
        // for (const item of orderData.items) {
        //   await db.collection("products").updateOne(
        //     { _id: new ObjectId(item.product._id) },
        //     {
        //       $inc: {
        //         quantity_on_hand: -item.quantity,
        //         sold_quantity: item.quantity,
        //       },
        //     },
        //     { session },
        //   )
        // }
        const productUpdates = orderData.items.map((item: any) => ({
          updateOne: {
            filter: { _id: new ObjectId(item.product._id) },
            update: {
              $inc: {
                quantity_on_hand: -item.quantity,
                sold_quantity: item.quantity,
              },
            },
          },
        }))
        await db.collection("products").bulkWrite(productUpdates, { session })


        // Insert subscriber if email provided
        // if (orderData.customerInfo.email) {
        //   await db.collection("subscribers").updateOne(
        //     { email: orderData.customerInfo.email },
        //     {
        //       $set: {
        //         name: orderData.customerInfo.name,
        //         phone: orderData.customerInfo.phone,
        //         email: orderData.customerInfo.email,
        //         lastOrderDate: new Date(),
        //       },
        //     },
        //     { upsert: true, session },
        //   )
        // }
      })

      return NextResponse.json({ success: true, message: "Order placed successfully" })
    } finally {
      await session.endSession()
    }
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}
