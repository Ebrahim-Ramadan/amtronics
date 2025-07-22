import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("amtronics");

    // Fetch all projects
    const projects = await db.collection("projects").find({}).toArray();

    // Extract unique bundle IDs from all projects
    const bundleIds = Array.from(
      new Set(
        projects
          .flatMap((project) =>
            project.engineers?.flatMap((eng: { bundle: { id: string }[] }) =>
              eng.bundle.map((b) => b.id)
            ) || []
          )
      )
    );

    // Fetch product details for all bundle IDs
    const products = await db
      .collection("products")
      .find(
        { _id: { $in: bundleIds.map((id) => new ObjectId(id)) } },
        { projection: { name: 1, image: 1, price: 1, _id: 1 } }
      )
      .toArray();

    // Map products to a dictionary for easy lookup
    const productMap = new Map(
      products.map((product) => [product._id.toString(), product])
    );

    // Enrich projects with product details
    const enrichedProjects = projects.map((project) => ({
      ...project,
      _id: project._id.toString(),
      engineers: project.engineers?.map((eng: { name: string; bundle: { id: string }[] }) => ({
        ...eng,
        bundle: eng.bundle.map((b) => ({
          id: b.id,
          product: productMap.get(b.id) || null,
        })),
      })) || [],
    }));

    console.log("Enriched projects:", enrichedProjects);
    return NextResponse.json(enrichedProjects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}