"use client"

import { useState, useEffect } from "react"
import ProductCard from "./product-card"
import type { Product } from "@/lib/types"
import { useCart } from "@/lib/context"

interface ProductSectionProps {
  title: string
  arTitle: string
  type: "featured" | "recent" | "sale"
}

export default function ProductSection({ title, arTitle, type }: ProductSectionProps) {
  const { state } = useCart()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const isArabic = state.language === "ar"

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let url = "/api/products?limit=8"
        if (type === "featured") url += "&featured=true"
        if (type === "recent") url += "&recent=true"

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

  if (loading) {
    return (
      <section className="py-12">
        <h2 className="text-3xl font-bold text-center mb-8">{isArabic ? arTitle : title}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-gray-200 animate-pulse h-80 rounded-lg"></div>
          ))}
        </div>
      </section>
    )
  }

  return (
    <section className="py-12">
      <h2 className="text-3xl font-bold text-center mb-8">{isArabic ? arTitle : title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </section>
  )
}
