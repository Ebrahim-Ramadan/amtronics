import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { sendOrderConfirmationEmail } from "@/lib/mailer"
import { sendWhatsAppTemplate } from "@/lib/twilio"

export async function POST(request: Request) {
  try {
    const orderData = await request.json()
    const { customerInfo } = orderData

    const client = await clientPromise
    const db = client.db("amtronics")

    // Start a session for transaction
    const session = client.startSession()
    let newOrderID: ObjectId | undefined
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
        newOrderID = orderResult.insertedId
      })

      if (newOrderID) {
        // Do not await these, let them run in the background
        if (customerInfo.email) {
          sendOrderConfirmationEmail(customerInfo.email, newOrderID.toHexString(), customerInfo.name)
        }

        const total = (orderData.total - orderData.discount).toFixed(2)

        // sendWhatsAppTemplate(customerInfo.phone, {
        //   "1": customerInfo.name,
        //   "2": newOrderID.toHexString(),
        //   "3": `${total} KD`,
        // })
      }

      return NextResponse.json({ newOrderID, success: true, message: "Order placed successfully" })
    } finally {
      await session.endSession()
    }
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderIdsString = searchParams.get('ids');
    const limit = Number.parseInt(searchParams.get('limit') || '5'); // Default limit to 5
    const skip = Number.parseInt(searchParams.get('skip') || '0'); // Default skip to 0

    if (!orderIdsString) {
      return NextResponse.json({ error: "No order IDs provided" }, { status: 400 });
    }

    const ids = orderIdsString.split(',').map(id => new ObjectId(id.trim()));

    const client = await clientPromise;
    const db = client.db("amtronics");

    // Fetch total count first (optional but good for pagination)
    const total = await db.collection("orders").countDocuments({ _id: { $in: ids } });

    const orders = await db.collection("orders").find(
      { _id: { $in: ids } },
      { projection: { _id: 1, status: 1, total: 1, createdAt: 1, customerInfo: 1 } }
    )
    .skip(skip)
    .limit(limit)
    .toArray();

    return NextResponse.json({ orders, total }); // Return both orders and total count
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
