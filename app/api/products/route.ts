import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

// Helper to escape regex special characters
function escapeRegex(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const limit = Number.parseInt(searchParams.get("limit") || "15");
    const skip = Number.parseInt(searchParams.get("skip") || "0");

    if (!category) {
      return NextResponse.json({ error: "Category is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("amtronics");

    // Build query for category
    const query = {
      en_category: { $regex: escapeRegex(category), $options: "i" },
    };

    // Fetch products
    const products = await db
      .collection("products")
      .find(query, {
        projection: {
          _id: 1,
          en_name: 1,
          ar_name: 1,
          price: 1,
          image: 1,
          ave_cost: 1,
          priorityIndex: 1,
        },
      })
      .toArray();

    // Sort: products with priorityIndex first, sorted by ascending priorityIndex, then others
    const sortedProducts = [
      ...products
        .filter((p) => typeof p.priorityIndex === "number")
        .sort((a, b) => a.priorityIndex - b.priorityIndex),
      ...products.filter((p) => typeof p.priorityIndex !== "number"),
    ];

    // Apply pagination
    const paginatedProducts = sortedProducts.slice(skip, skip + limit);

    // Get total count
    const total = await db.collection("products").countDocuments(query);

    return NextResponse.json({ products: paginatedProducts, total });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}