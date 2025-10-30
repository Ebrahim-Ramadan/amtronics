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
        { projection: { en_name: 1, ar_name: 1, image: 1, price: 1, _id: 1, hasVarieties: 1, varieties: 1 } }
      )
      .toArray();

    // Map products to a dictionary for easy lookup
    const productMap = new Map(
      products.map((product) => [product._id.toString(), product])
    );

    // Enrich projects with product details and quantity
    const enrichedProjects = projects.map((project) => ({
      ...project,
      _id: project._id.toString(),
      engineers: project.engineers?.map(
        (eng: { name: string; email?: string; bundle: { id: string; quantity?: number }[] }) => ({
          ...eng,
          email: eng.email ?? null,
          bundle: eng.bundle.map((b) => {
            const product = productMap.get(b.id) || null;
            let enrichedProduct = product;
            let overridePrice = undefined;
            let overrideImage = undefined;
            let overrideName = undefined;

            // If product has varieties, try to match the variety by name in the project doc
            if (product && product.hasVarieties && Array.isArray(product.varieties)) {
              // Try to find the variety name in the project doc's bundle name
              // Example: "Micro SD Card  - Micro SD Card-128GB"
              // Look for a variety whose en_name_variant is included in the bundle name
              const bundleName = eng.name || ""; // Or use another field if the variety name is elsewhere
              // Actually, the project doc's bundle name is not clear, so let's try to match by the engineer's bundle array
              // If the project doc's bundle has a name field, use it, otherwise try to match by en_name_variant
              // We'll try to match by en_name_variant being included in the bundleName or in the product name in the project doc

              // Try to find the variety by checking if any en_name_variant is included in the bundleName or in the project doc
              let foundVariety = null;
              if (b.name) {
                foundVariety = product.varieties.find(
                  (v: any) =>
                    b.name.includes(v.en_name_variant) ||
                    v.en_name_variant.includes(b.name)
                );
              } else if (eng.name) {
                foundVariety = product.varieties.find(
                  (v: any) =>
                    eng.name.includes(v.en_name_variant) ||
                    v.en_name_variant.includes(eng.name)
                );
              }
              // Fallback: try to match by en_name_variant containing the product en_name
              if (!foundVariety) {
                foundVariety = product.varieties.find(
                  (v: any) =>
                    v.en_name_variant &&
                    (v.en_name_variant.includes(product.en_name) ||
                      product.en_name.includes(v.en_name_variant))
                );
              }
              // If still not found, try to match by the most specific (longest) en_name_variant that is included in the bundleName
              if (!foundVariety && eng.name) {
                foundVariety = product.varieties
                  .filter((v: any) => eng.name.includes(v.en_name_variant))
                  .sort((a: any, b: any) => b.en_name_variant.length - a.en_name_variant.length)[0];
              }

              if (foundVariety) {
                overridePrice = foundVariety.price;
                overrideImage = foundVariety.image || product.image;
                overrideName = foundVariety.en_name_variant;
              }
            }

            return {
              id: b.id,
              quantity: b.quantity ?? 1,
              product: enrichedProduct
                ? {
                    ...enrichedProduct,
                    price: overridePrice !== undefined ? overridePrice : enrichedProduct.price,
                    image: overrideImage || enrichedProduct.image,
                    en_name: overrideName || enrichedProduct.en_name,
                  }
                : null,
            };
          }),
        })
      ) || [],
    }));

    return NextResponse.json(enrichedProjects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}