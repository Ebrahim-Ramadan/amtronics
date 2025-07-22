import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(request: Request) {
  try {
    const { projectId, engineerIndex, bundleIndex, customerInfo, promoCode } = await request.json()
    const client = await clientPromise
    const db = client.db("amtronics")

    // Fetch the project and bundle
    const project = await db.collection("projects").findOne({ _id: new ObjectId(projectId) })
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }
    const engineer = project.engineers[engineerIndex]
    if (!engineer) {
      return NextResponse.json({ error: "Engineer not found" }, { status: 404 })
    }
    const bundle = engineer.bundles[bundleIndex]
    if (!bundle) {
      return NextResponse.json({ error: "Bundle not found" }, { status: 404 })
    }

    // Fetch product details for all items in the bundle
    const productIds = bundle.items.map((id: string) => new ObjectId(id))
    const products = await db.collection("products").find(
      { _id: { $in: productIds } },
      { projection: { en_name: 1, ar_name: 1, price: 1, image: 1 } }
    ).toArray()
    if (products.length !== bundle.items.length) {
      return NextResponse.json({ error: "Some products not found" }, { status: 400 })
    }

    // Calculate total price
    const total = products.reduce((sum, p) => sum + (p.price || 0), 0)
    let discount = 0
    if (promoCode) {
      // Apply promo code logic (reuse from /api/promo)
      const promo = await db.collection("promocodes").findOne({ code: promoCode, active: true, expiry: { $gte: new Date().toISOString() } })
      if (promo) {
        discount = (total * promo.percentage) / 100
      }
    }

    // Insert order
    const orderResult = await db.collection("orders").insertOne({
      items: products.map(p => ({ product: p, quantity: 1 })),
      customerInfo,
      total,
      discount,
      promoCode: promoCode || "",
      status: "pending",
      createdAt: new Date(),
       projectBundle: {
        type: 'project-bundle',
        projectId,
        projectName: project.name,
        engineerIndex,
        bundleIndex,
        engineerNames: [engineer.name],
        bundleIds: [bundle.id || bundle._id?.toString()]
      }
    })

    // Increment numberOfPurchases for the bundle
    const updatePath = `engineers.${engineerIndex}.bundles.${bundleIndex}.numberOfPurchases`
    await db.collection("projects").updateOne(
      { _id: new ObjectId(projectId) },
      { $inc: { [updatePath]: 1 } }
    )

    return NextResponse.json({ newOrderID: orderResult.insertedId, success: true })
  } catch (error) {
    console.error("Error placing bundle order:", error)
    return NextResponse.json({ error: "Failed to place bundle order" }, { status: 500 })
  }
}