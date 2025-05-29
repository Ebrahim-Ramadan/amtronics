"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import { ShoppingCart, Star, Truck, Shield, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { Product } from "@/lib/types"
import { useCart } from "@/lib/context"

export default function ProductPage() {
  const { state, dispatch } = useCart()
  const params = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const isArabic = state.language === "ar"

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${params.id}`)
        const data = await response.json()
        setProduct(data)
      } catch (error) {
        console.error("Error fetching product:", error)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchProduct()
    }
  }, [params.id])

  const addToCart = () => {
    if (product) {
      for (let i = 0; i < quantity; i++) {
        dispatch({ type: "ADD_ITEM", payload: product })
      }
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gray-200 h-96 rounded-lg"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-10 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">{isArabic ? "المنتج غير موجود" : "Product not found"}</h1>
        </div>
      </div>
    )
  }

  const discountedPrice = product.discount ? product.price - product.price * (product.discount / 100) : product.price
  console.log('discountedPrice', discountedPrice);

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
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <label className="font-medium">{isArabic ? "الكمية:" : "Quantity:"}</label>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                  -
                </Button>
                <span className="w-12 text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={quantity >= product.quantity_on_hand}
                >
                  +
                </Button>
              </div>
            </div>

            <Button onClick={addToCart} size="lg" className="w-full" disabled={product.quantity_on_hand === 0}>
              <ShoppingCart className="h-5 w-5 mr-2" />
              {isArabic ? "أضف للسلة" : "Add to Cart"}
            </Button>
          </div>

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
