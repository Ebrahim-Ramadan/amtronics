import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { sendOrderConfirmationEmail } from "@/lib/mailer"
import { sendWhatsAppTemplate } from "@/lib/twilio"

export async function POST(request: Request) {
  try {
    const orderData = await request.json()
    console.log('orderData', orderData);
    
    const { customerInfo } = orderData

    const client = await clientPromise
    const db = client.db("amtronics")

    // Start a session for transaction
    const session = client.startSession()
    let newOrderID: ObjectId | undefined
    try {
      await session.withTransaction(async () => {
        // Ensure ave_cost is present for each product in items
        const itemsWithAveCost = await Promise.all(
          orderData.items.map(async (item: any) => {
            if (item.product.ave_cost !== undefined && item.product.ave_cost !== null) {
              return item
            }
            const prodId = item.product._id || item.product.id
            let dbProduct = null
            if (ObjectId.isValid(prodId)) {
              dbProduct = await db.collection("products").findOne({ _id: new ObjectId(prodId) }, { projection: { ave_cost: 1 } })
            } else {
              dbProduct = await db.collection("products").findOne({ id: prodId }, { projection: { ave_cost: 1 } })
            }
            return {
              ...item,
              product: {
                ...item.product,
                ave_cost: dbProduct?.ave_cost ?? null,
              },
            }
          })
        )

        // Insert order
        const orderResult = await db.collection("orders").insertOne(
          {
            ...orderData,
            items: itemsWithAveCost,
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
