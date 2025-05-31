"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Plus, Star, Check, CheckCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import type { Product } from "@/lib/types"
import { useCart } from "@/lib/context"
import { toast } from "sonner"

interface ProductCarouselProps {
  title: string
  arTitle: string
  type: "bestsellers" | "deals" | "recommended"
  bgColor?: string
}

export default function ProductCarousel({ title, arTitle, type, bgColor = "bg-white" }: ProductCarouselProps) {
  const { state, dispatch } = useCart()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const isArabic = state.language === "ar"
  const [addLoading, setAddLoading] = useState<{[id: string]: boolean}>({})
  const [showCheck, setShowCheck] = useState<{[id: string]: boolean}>({})

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let url = "/api/products?limit=12"
        if (type === "bestsellers") url += "&featured=true"
        if (type === "deals") url += "&featured=true"
        if (type === "recommended") url += "&recent=true"

        const response = await fetch(url)
        const data = await response.json()
        setProducts(data)
      } catch (error) {
        console.error("Error fetching products:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [type])

  const addToCart = (product: Product) => {
    setAddLoading((prev) => ({ ...prev, [product._id]: true }))
    setShowCheck((prev) => ({ ...prev, [product._id]: false }))
    setTimeout(() => {
      dispatch({ type: "ADD_ITEM", payload: product })
      toast.success(isArabic ? "تمت الإضافة إلى السلة" : "Added to cart")
      setAddLoading((prev) => ({ ...prev, [product._id]: false }))
      setShowCheck((prev) => ({ ...prev, [product._id]: true }))
      setTimeout(() => setShowCheck((prev) => ({ ...prev, [product._id]: false })), 2000)
    }, 200)
  }

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % Math.max(1, products.length - 4))
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + Math.max(1, products.length - 4)) % Math.max(1, products.length - 4))
  }

  if (loading) {
    return (
      <div className={`${bgColor} rounded-lg p-6`}>
        <h2 className="text-2xl font-bold"> 
        {isArabic ? (
            <>
              <span className="text-red-600">{arTitle.split(" ")[0]}</span>{" "}
              {arTitle.split(" ").slice(1).join(" ")}
            </>
          ) : (
            <>
              <span className="text-red-600">{title.split(" ")[0]}</span>{" "}
              {title.split(" ").slice(1).join(" ")}
            </>
          )}
        </h2>
          
        <div className="flex gap-4 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-64 h-80 bg-gray-200 animate-pulse rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`${bgColor} rounded-lg p-3 md:p-6 relative shadow-xs hover:shadow-sm transition-shadow duration-300`}>
<div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
  <h2 className="text-xl md:text-2xl font-bold">
    {isArabic ? (
      <>
        <span className="text-red-600">{arTitle.split(" ")[0]}</span>{" "}
        {arTitle.split(" ").slice(1).join(" ")}
      </>
    ) : (
      <>
        <span className="text-red-600">{title.split(" ")[0]}</span>{" "}
        {title.split(" ").slice(1).join(" ")}
      </>
    )}
  </h2>
  <div className="flex gap-2 self-end md:self-center">
    <Button variant="outline" size="icon" onClick={prevSlide} disabled={currentIndex === 0}>
      <ChevronLeft className="h-4 w-4" />
    </Button>
    <Button variant="outline" size="icon" onClick={nextSlide} disabled={currentIndex >= products.length - 4}>
      <ChevronRight className="h-4 w-4" />
    </Button>
  </div>
</div>

      <div className="overflow-hidden">
        <div
          className="flex gap-4 transition-transform duration-300"
          style={{ transform: `translateX(-${currentIndex * 272}px)` }}
        >
          {products.map((product) => (
            <Card key={product._id} className="flex-shrink-0 bg-white/70 w-64 group hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <Link href={`/products/${product._id}`}>
                  <div className="relative mb-3">
                    <Image
                      src={product.image || "/placeholder.svg?height=200&width=200"}
                      alt={isArabic ? product.ar_name : product.en_name}
                      width={200}
                      height={200}
                      className="w-full h-48 object-cover rounded group-hover:scale-105 transition-transform"
                    />
                    {type === "deals" && (
                      <Badge className="absolute top-2 left-2 bg-red-500">
                        {isArabic ? "عرض خاص" : "Special Deal"}
                      </Badge>
                    )}
                    {type === "bestsellers" && (
                      <Badge className="absolute top-2 left-2 bg-[#FEEE00] text-black">
                        #{products.indexOf(product) + 1} {isArabic ? "الأكثر مبيعاً" : "Best Seller"}
                      </Badge>
                    )}
                  </div>
                </Link>

                <h3 className="font-medium text-sm line-clamp-2 mb-2">
                  {isArabic ? product.ar_name : product.en_name}
                </h3>

                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${i < 4 ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                    />
                  ))}
                  <span className="text-xs text-gray-500 ml-1">({product.sold_quantity})</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-bold text-green-600">
                    {product.price.toFixed(2)} {isArabic ? "د.ك" : "KD"}
                  </span>
                  <Button size="sm" onClick={() => addToCart(product)} className="bg-[#091638] text-xs px-3" disabled={addLoading[product._id]}>
                    {!addLoading[product._id] && !showCheck[product._id] && 
                    <Image
                    src='/quick-atc-add-to-cart-grey.svg'
                    width={20}
                    height={20}
                    alt="Add to Cart"
                    />
                    }
                    {addLoading[product._id] ? (
                      <span className="h-4 w-4 mr-1 animate-spin border-2 border-gray-300 border-t-transparent rounded-full inline-block align-middle"></span>
                    ) : showCheck[product._id] ? (
                      <><CheckCheck className="h-4 w-4 mr-1 text-white" />{isArabic ? "تمت الإضافة" : "Added"}</>
                    ) : (
                      isArabic ? "أضف" : "Add"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
