"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { Product } from "@/lib/types"
import { useCart } from "@/lib/context"

const promotionalSections = [
  {
    en_title: "Electronics Essentials",
    ar_title: "أساسيات الإلكترونيات",
    en_subtitle: "Build your next project",
    ar_subtitle: "اصنع مشروعك القادم",
    bgColor: "bg-gradient-to-br from-blue-50 to-blue-100",
    link: "/products?category=Electronics",
    type: "grid",
  },
  {
    en_title: "Student Lab Kits",
    ar_title: "أطقم المختبر للطلاب",
    en_subtitle: "Educational bundles",
    ar_subtitle: "حزم تعليمية",
    bgColor: "bg-gradient-to-br from-green-50 to-green-100",
    link: "/products?category=Kits",
    type: "grid",
  },
  {
    en_title: "Hot Deals Under 25 KD",
    ar_title: "عروض ساخنة تحت 25 د.ك",
    en_subtitle: "Limited time offers",
    ar_subtitle: "عروض لفترة محدودة",
    bgColor: "bg-gradient-to-br from-red-50 to-red-100",
    link: "/products?featured=true",
    type: "grid",
  },
  {
    en_title: "New Arrivals This Week",
    ar_title: "وصل حديثاً هذا الأسبوع",
    en_subtitle: "Fresh tech products",
    ar_subtitle: "منتجات تقنية جديدة",
    bgColor: "bg-gradient-to-br from-purple-50 to-purple-100",
    link: "/products?recent=true",
    type: "grid",
  },
]

interface PromotionalGridProps {
  section: (typeof promotionalSections)[0]
}

function PromotionalGridSection({ section }: PromotionalGridProps) {
  const { state } = useCart()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const isArabic = state.language === "ar"

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let url = "/api/products?limit=4"
        if (section.link.includes("category=Electronics")) url += "&category=Electronics"
        if (section.link.includes("category=Kits")) url += "&category=Kits"
        if (section.link.includes("featured=true")) url += "&featured=true"
        if (section.link.includes("recent=true")) url += "&recent=true"

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
  }, [section.link])

  if (loading) {
    return (
      <Card className={`${section.bgColor} border-0`}>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-300 rounded mb-4"></div>
            <div className="grid grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-300 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`${section.bgColor} border-0 hover:shadow-md transition-shadow  duration-300`}>
      <CardContent className="p-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-800 mb-1">{isArabic ? section.ar_title : section.en_title}</h3>
          <p className="text-sm text-gray-600">{isArabic ? section.ar_subtitle : section.en_subtitle}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          {products.slice(0, 4).map((product) => (
            <Link key={product._id} href={`/products/${product._id}`} className="group" prefetch={false}>
              <div className="bg-white/70 rounded-lg p-3 hover:shadow-md transition-shadow">
                <Image
                unoptimized
                  src={product.image || "/placeholder.svg?height=80&width=80"}
                  alt={isArabic ? product.ar_name : product.en_name}
                  width={80}
                  height={80}
                  className="w-full h-20 object-cover rounded mb-2 group-hover:scale-105 transition-transform"
                />
                <p className="text-xs font-medium line-clamp-2 mb-1">{isArabic ? product.ar_name : product.en_name}</p>
                <p className="text-sm font-bold text-green-600">
                  {product.price.toFixed(2)} {isArabic ? "د.ك" : "KD"}
                </p>
              </div>
            </Link>
          ))}
        </div>

        <Link href={section.link} prefetch={false}>
          <Button variant="outline" size="sm" className="w-full">
            {isArabic ? "عرض الكل" : "See all deals"}
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}

export default function PromotionalGrid() {
  return (
    <div className="md:py-4">
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {promotionalSections.map((section, index) => (
          <PromotionalGridSection key={index} section={section} />
        ))}
      </div>
    </div>
  )
}
