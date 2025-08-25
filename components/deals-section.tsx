"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { Product } from "@/lib/types"
import { useCart } from "@/lib/context"

interface DealsSectionProps {
  title: string
  arTitle: string
  bgColor: string
  dealType: "flash" | "mega" | "featured"
}

export default function DealsSection({ title, arTitle, bgColor, dealType }: DealsSectionProps) {
  const { state } = useCart()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const isArabic = state.language === "ar"

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let url = "/api/products?limit=4"
        if (dealType === "featured") url += "&featured=true"
        if (dealType === "mega") url += "&recent=true"

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
  }, [dealType])

  if (loading) {
    return (
      <div className={`${bgColor} rounded-lg p-6`}>
        <h2 className="text-2xl font-bold mb-4 text-white">{isArabic ? arTitle : title}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white/20 animate-pulse h-48 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`${bgColor} rounded-lg p-6`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">{isArabic ? arTitle : title}</h2>
        <Link href="/products?featured=true">
          <Button variant="secondary" size="sm">
            {isArabic ? "عرض الكل" : "View All"}
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.slice(0, 4).map((product) => (
          <Card key={product._id} className="group hover:shadow-lg transition-shadow">
            <CardContent className="p-3">
              <Link href={`/products/${product._id}`}>
                <div className="relative mb-3">
                  <img
                  // unoptimized
                    src={product.image || "/placeholder.svg?height=150&width=150"}
                    alt={isArabic ? product.ar_name : product.en_name}
                    // width={150}
                    // height={150}
                    className="w-full h-32 object-cover rounded group-hover:scale-105 transition-transform"
                  />
                  {dealType === "flash" && (
                    <Badge className="absolute top-2 left-2 bg-red-500">{isArabic ? "عرض خاطف" : "Flash Deal"}</Badge>
                  )}
                </div>
                <h3 className="font-medium text-sm line-clamp-2 mb-2">
                  {isArabic ? product.ar_name : product.en_name}
                </h3>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-green-600">
                    {product.price.toFixed(2)} {isArabic ? "د.ك" : "KD"}
                  </span>
                  {dealType === "flash" && (
                    <span className="text-xs text-gray-500 line-through">
                      {(product.price * 1.3).toFixed(2)} {isArabic ? "د.ك" : "KD"}
                    </span>
                  )}
                </div>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
