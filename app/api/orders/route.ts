import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { sendOrderConfirmationEmail, sendOrderCancellationEmail } from "@/lib/mailer"
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
            if (item.type === "project-bundle") {
              // Handle project bundle items
              const productsWithAveCost = await Promise.all(
                item.products.map(async (product: any) => {
                  if (product.ave_cost !== undefined && product.ave_cost !== null) {
                    return product
                  }
                  const prodId = product._id || product.id
                  let dbProduct = null
                  if (ObjectId.isValid(prodId)) {
                    dbProduct = await db.collection("products").findOne(
                      { _id: new ObjectId(prodId) },
                      { projection: { ave_cost: 1 } }
                    )
                  } else {
                    dbProduct = await db.collection("products").findOne(
                      { id: prodId },
                      { projection: { ave_cost: 1 } }
                    )
                  }
                  return {
                    ...product,
                    ave_cost: dbProduct?.ave_cost ?? null,
                  }
                })
              )
              return {
                ...item,
                products: productsWithAveCost,
              }
            } else {
              // Handle regular product items
              if (item.product.ave_cost !== undefined && item.product.ave_cost !== null) {
                return item
              }
              const prodId = item.product._id || item.product.id
              let dbProduct = null
              if (ObjectId.isValid(prodId)) {
                dbProduct = await db.collection("products").findOne(
                  { _id: new ObjectId(prodId) },
                  { projection: { ave_cost: 1 } }
                )
              } else {
                dbProduct = await db.collection("products").findOne(
                  { id: prodId },
                  { projection: { ave_cost: 1 } }
                )
              }
              return {
                ...item,
                product: {
                  ...item.product,
                  ave_cost: dbProduct?.ave_cost ?? null,
                },
              }
            }
          })
        )

        // Prepare bulk operations to decrement inventory
        // const bulkOps: any[] = [];
        
        // for (const item of itemsWithAveCost) {
        //   if (item.type === "project-bundle") {
        //     // Handle project bundle items
        //     for (const product of item.products) {
        //       const prodId = product._id || product.id;
        //       const quantity = product.quantity || 1;
              
        //       if (ObjectId.isValid(prodId)) {
        //         bulkOps.push({
        //           updateOne: {
        //             filter: { _id: new ObjectId(prodId) },
        //             update: { $inc: { quantity_on_hand: -quantity } }
        //           }
        //         });
        //       } else {
        //         bulkOps.push({
        //           updateOne: {
        //             filter: { id: prodId },
        //             update: { $inc: { quantity_on_hand: -quantity } }
        //           }
        //         });
        //       }
        //     }
        //   } else {
        //     // Handle regular product items
        //     const prodId = item.product._id || item.product.id;
        //     const quantity = item.quantity || 1;
            
        //     if (ObjectId.isValid(prodId)) {
        //       bulkOps.push({
        //         updateOne: {
        //           filter: { _id: new ObjectId(prodId) },
        //           update: { $inc: { quantity_on_hand: -quantity } }
        //         }
        //       });
        //     } else {
        //       bulkOps.push({
        //         updateOne: {
        //           filter: { id: prodId },
        //           update: { $inc: { quantity_on_hand: -quantity } }
        //         }
        //       });
        //     }
        //   }
        // }

        // // Execute bulk inventory updates
        // if (bulkOps.length > 0) {
        //   await db.collection("products").bulkWrite(bulkOps, { session });
        // }

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
    const limit = Number.parseInt(searchParams.get('limit') || '5');
    const skip = Number.parseInt(searchParams.get('skip') || '0');

    if (!orderIdsString) {
      return NextResponse.json({ error: "No order IDs provided" }, { status: 400 });
    }

    const ids = orderIdsString.split(',').map(id => new ObjectId(id.trim()));

    const client = await clientPromise;
    const db = client.db("amtronics");

    const total = await db.collection("orders").countDocuments({ _id: { $in: ids } });

    const orders = await db.collection("orders").find(
      { _id: { $in: ids } },
      { projection: { _id: 1, status: 1 } }
    )
    .skip(skip)
    .limit(limit)
    .toArray();

    return NextResponse.json({ orders, total });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderIdString = searchParams.get('id');

    if (!orderIdString) {
      return NextResponse.json({ error: "No order ID provided" }, { status: 400 });
    }

    if (!ObjectId.isValid(orderIdString)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    }

    const orderId = new ObjectId(orderIdString);
    const client = await clientPromise;
    const db = client.db("amtronics");

    // Start a session for transaction
    const session = client.startSession();
    
    try {
      let result: any = null;
      
      await session.withTransaction(async () => {
        // First, get the order to check if it exists and get its items
        const order = await db.collection("orders").findOne(
          { _id: orderId },
          { session }
        );

        if (!order) {
          throw new Error("Order not found");
        }

        if (order.status === "canceled") {
          throw new Error("Order is already canceled");
        }

        // Prepare bulk operations to restore inventory (increment quantities back)
        const bulkOps: any[] = [];
        
        for (const item of order.items) {
          if (item.type === "project-bundle") {
            // Handle project bundle items
            for (const product of item.products) {
              const prodId = product._id || product.id;
              const quantity = product.quantity || 1;
              
              if (ObjectId.isValid(prodId)) {
                bulkOps.push({
                  updateOne: {
                    filter: { _id: new ObjectId(prodId) },
                    update: { $inc: { quantity_on_hand: quantity } }
                  }
                });
              } else {
                bulkOps.push({
                  updateOne: {
                    filter: { id: prodId },
                    update: { $inc: { quantity_on_hand: quantity } }
                  }
                });
              }
            }
          } else {
            // Handle regular product items
            const prodId = item.product._id || item.product.id;
            const quantity = item.quantity || 1;
            
            if (ObjectId.isValid(prodId)) {
              bulkOps.push({
                updateOne: {
                  filter: { _id: new ObjectId(prodId) },
                  update: { $inc: { quantity_on_hand: quantity } }
                }
              });
            } else {
              bulkOps.push({
                updateOne: {
                  filter: { id: prodId },
                  update: { $inc: { quantity_on_hand: quantity } }
                }
              });
            }
          }
        }

        // Execute bulk inventory restoration
        if (bulkOps.length > 0) {
          await db.collection("products").bulkWrite(bulkOps, { session });
        }

        // Update order status to canceled
        const updateResult = await db.collection("orders").updateOne(
          { _id: orderId },
          { 
            $set: { 
              status: "canceled",
              canceledAt: new Date()
            }
          },
          { session }
        );

        result = { updateResult, order };
      });

      if (result && result.updateResult.matchedCount === 0) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      // Send cancellation email in the background
      if (result?.order?.customerInfo?.email) {
        sendOrderCancellationEmail(
          result.order.customerInfo.email, 
          orderIdString, 
          result.order.customerInfo.name
        );
      }

      return NextResponse.json({ 
        success: true, 
        message: "Order canceled successfully and inventory restored" 
      });

    } finally {
      await session.endSession();
    }

  } catch (error) {
    console.error("Error canceling order:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to cancel order" }, { status: 500 });
  }
}
