import { notFound } from "next/navigation"
import { Star, Truck, Shield, RefreshCw } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import type { Product } from "@/lib/types"
import ProductActions from "./ProductActions"
import Link from "next/link"
import ProductImageGallery from "./ProductImageGallery"
import { Suspense } from "react"
import LoadingProductPage from "./product-loading"

async function getProduct(id: string): Promise<Product | null> {
  try {
    const client = await clientPromise
    const db = client.db("amtronics")
    const product = await db.collection("products").findOne(
      { _id: new ObjectId(id) },
      {
        projection: {
          _id: 1,
          id: 1,
          sku: 1,
          en_name: 1,
          ar_name: 1,
          en_description: 1,
          ar_description: 1,
          en_long_description: 1,
          ar_long_description: 1,
          en_main_category: 1,
          ar_main_category: 1,
          en_category: 1,
          ar_category: 1,
          price: 1,
          image: 1,
          quantity_on_hand: 1,
          sold_quantity: 1,
          visible_in_catalog: 1,
          visible_in_search: 1,
          slug_url: 1,
          discount: 1,
          discount_type: 1,
          ar_brand: 1,
          en_brand: 1,
          ave_cost: 1

        }
      }
    )
    return product as Product | null
  } catch (error) {
    console.error("Error fetching product:", error)
    return null
  }
}

interface ProductPageProps {
  params: { id: string }
  searchParams: { lang?: string }
}

export async function generateMetadata({ params, searchParams }: ProductPageProps) {
  const product = await getProduct(params.id)
  const isArabic = searchParams.lang === "ar"

  if (!product) {
    return {
      title: isArabic ? "المنتج غير موجود" : "Product Not Found",
      description: isArabic
        ? "المنتج المطلوب غير متوفر."
        : "The requested product is not available.",
    }
  }

  return {
    title: isArabic ? product.ar_name : product.en_name,
    description: isArabic ? product.ar_description : product.en_description,
  }
}

export default function ProductPageWrapper(props: ProductPageProps) {
  return (
    <Suspense fallback={<LoadingProductPage />}>
      <ProductPage {...props} />
    </Suspense>
  )
}

async function ProductPage({ params, searchParams }: ProductPageProps) {
  const product = await getProduct(params.id)
  console.log("product", product)

  const isArabic = searchParams.lang === "ar"

  if (!product) {
    notFound()
  }

  const discountedPrice = product.discount
    ? product.price - product.price * (product.discount / 100)
    : product.price
  console.log('discountedPrice', discountedPrice);

  // Breadcrumbs
  const category = isArabic ? product.ar_main_category : product.en_main_category
  const productName = isArabic ? product.ar_name : product.en_name

  // Stock status: Treat quantity_on_hand as Infinity if null
  const availableStock = product.quantity_on_hand ?? Infinity
  const isOutOfStock = availableStock === 0

  return (
    <div className="container mx-auto px-4 py-2 md:py-4">
      {/* Breadcrumbs */}
      <nav className="mb-6 text-[10px] md:text-xs" aria-label="Breadcrumb">
        <ol className="flex rtl:space-x-reverse text-gray-500">
          <li>
            <Link
              href={isArabic ? `/?lang=ar` : `/`}
              className="md:ml-2 hover:underline text-gray-700 font-medium"
            >
              {isArabic ? "الرئيسية" : "Home"}
            </Link>
          </li>
          <li className="mx-1 md:mx-2">/</li>
          <li>
            <Link
              href={
                isArabic
                  ? `/products?category=${encodeURIComponent(category)}&lang=ar`
                  : `/products?category=${encodeURIComponent(category)}`
              }
              className="hover:underline text-gray-700 font-medium line-clamp-1"
            >
              {category}
            </Link>
          </li>
          <li className="mx-1 md:mx-2">/</li>
          <li
            className="text-gray-400 truncate max-w-xs line-clamp-1"
            aria-current="page"
          >
            {productName}
          </li>
        </ol>
      </nav>
      <div className="grid md:grid-cols-2 gap-2 md:gap-8">
        {/* Product Image Gallery */}
        <ProductImageGallery
          image={product.image}
          ar_name={product.ar_name}
          en_name={product.en_name}
          isArabic={isArabic}
          discount={product.discount}
        />

        {/* Product Details */}
        <div className="space-y-2 md:space-y-4">
          <div>
            {(product.ar_brand || product.en_brand) && (
              <h1 className="text-3xl font-bold mb-2">
                {isArabic ? product.ar_brand : product.en_brand}
              </h1>
            )}
            <h1 className="text-xl md:text-3xl leading-6 md:leading-9 tracking-[.02em] font-bold mb-2">{isArabic ? product.ar_name : product.en_name}</h1>
            <p className="text-gray-600 leading-4 md:leading-5 text-sm md:text-base">{isArabic ? product.ar_description.substring(0, 200) : product.en_description.substring(0, 200)}
              {isArabic ? (
                <Link href="#description" className="text-[#00B9DA] cursor-pointer ml-2 hover:underline">عرض المزيد</Link>
              ) : (
                <Link href="#description" className="text-[#00B9DA] cursor-pointer ml-2 hover:underline">See More</Link>
              )}
            </p>
          </div>

          {/* Rating */}
          {/* <div className="flex items-center gap-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${i < 4 ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                  aria-hidden="true"
                />
              ))}
            </div>
            <span className="text-gray-500">
              ({product.sold_quantity ?? 0} {isArabic ? "مبيع" : "sold"})
            </span>
          </div> */}

          {/* Price */}
          <div className="space-y-2">
            {product.discount ? (
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-green-600">
                  {discountedPrice.toFixed(2)} {isArabic ? "د.ك" : "KD"}
                </span>
                <span className="text-xl text-gray-500 line-through">
                  {product.price.toFixed(2)} {isArabic ? "د.ك" : "KD"}
                </span>
              </div>
            ) : (
              <span className="text-3xl font-bold">
                {product.price.toFixed(2)} {isArabic ? "د.ك" : "KD"}
              </span>
            )}
          </div>

          {/* Stock Status */}
          <div>
            {isOutOfStock ? (
              <Badge
                variant="secondary"
                className="bg-red-100 text-red-800"
                aria-label={isArabic ? "نفذ المخزون" : "Out of Stock"}
              >
                {isArabic ? "نفذ المخزون" : "Out of Stock"}
              </Badge>
            ) : (
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-800"
                aria-label={
                  isArabic
                    ? `متوفر${product.quantity_on_hand != null ? ` (${product.quantity_on_hand})` : ""}`
                    : `In Stock${product.quantity_on_hand != null ? ` (${product.quantity_on_hand})` : ""}`
                }
              >
                {isArabic ? "متوفر" : "In Stock"}
                {product.quantity_on_hand != null && ` (${product.quantity_on_hand})`}
              </Badge>
            )}
          </div>

          {/* Quantity Selector and Add to Cart */}
          <ProductActions product={product} isArabic={isArabic} />

          {/* Features */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 gap-4">
                {/* <div className="flex items-center gap-3">
                  <Truck className="h-5 w-5 text-blue-600" />
                  <span className="text-sm">
                    {isArabic ? "توصيل مجاني للطلبات أكثر من 50 د.ك" : "Free delivery for orders over 50 KD"}
                  </span>
                </div> */}
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-green-600" />
                  <span className="text-sm">{isArabic ? "ضمان الجودة" : "Quality guarantee"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <RefreshCw className="h-5 w-5 text-orange-600" />
                  <span className="text-sm">{isArabic ? "إمكانية الإرجاع خلال 7 أيام" : "7-day return policy"}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Product Description */}
      <div id="description" className="scroll-mt-[10rem] md:scroll-ml-[24rem] scroll-smooth mt-12">
        <h2 className="text-2xl font-bold mb-4">{isArabic ? "وصف المنتج" : "Product Description"}</h2>
        <Separator className="mb-6" />
        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{
            __html: isArabic ? product.ar_long_description : product.en_long_description,
          }}
        />
      </div>
    </div>
  )
}