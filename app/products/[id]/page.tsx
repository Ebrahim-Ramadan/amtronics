import Image from "next/image"
import { notFound } from "next/navigation"
import { ShoppingCart, Star, Truck, Shield, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import type { Product } from "@/lib/types"
import ProductActions from "./ProductActions"



async function getProduct(id: string): Promise<Product | null> {
  try {
    const client = await clientPromise
    const db = client.db("amtronics")
    const product = await db.collection("products").findOne({
      _id: new ObjectId(id),
    })
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


export default async function ProductPage({ params, searchParams }: ProductPageProps) {
  const product = await getProduct(params.id)
  const isArabic = searchParams.lang === "ar"

  if (!product) {
    notFound()
  }

  const discountedPrice = product.discount
    ? product.price - product.price * (product.discount / 100)
    : product.price

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="relative">
          <Image
            src={product.image || "/placeholder.svg?height=500&width=500"}
            alt={isArabic ? product.ar_name : product.en_name}
            width={500}
            height={500}
            className="w-full h-auto rounded-lg"
          />
          {product.discount && (
            <Badge className="absolute top-4 left-4 bg-red-500 text-white">-{product.discount}%</Badge>
          )}
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{isArabic ? product.ar_name : product.en_name}</h1>
            <p className="text-gray-600">{isArabic ? product.ar_description : product.en_description}</p>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`h-5 w-5 ${i < 4 ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
              ))}
            </div>
            <span className="text-gray-500">
              ({product.sold_quantity} {isArabic ? "مبيع" : "sold"})
            </span>
          </div>

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
            {product.quantity_on_hand > 0 ? (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {isArabic ? "متوفر" : "In Stock"} ({product.quantity_on_hand})
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-red-100 text-red-800">
                {isArabic ? "نفذ المخزون" : "Out of Stock"}
              </Badge>
            )}
          </div>

          {/* Quantity Selector and Add to Cart */}
          <ProductActions product={product} isArabic={isArabic} />

          {/* Features */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center gap-3">
                  <Truck className="h-5 w-5 text-blue-600" />
                  <span className="text-sm">
                    {isArabic ? "توصيل مجاني للطلبات أكثر من 50 د.ك" : "Free delivery for orders over 50 KD"}
                  </span>
                </div>
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
      <div className="mt-12">
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