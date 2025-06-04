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
    let newORderID
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
        newORderID = orderResult["insertedId"];
        

        // // bulkupdate unstead of Update product quantities
        // const productUpdates = orderData.items.map((item: any) => ({
        //   updateOne: {
        //     filter: { _id: new ObjectId(item.product._id) },
        //     update: {
        //       $inc: {
        //         quantity_on_hand: -item.quantity,
        //         sold_quantity: item.quantity,
        //       },
        //     },
        //   },
        // }))
        // await db.collection("products").bulkWrite(productUpdates, { session })


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

      return NextResponse.json({ newORderID, success: true, message: "Order placed successfully" ,})
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
