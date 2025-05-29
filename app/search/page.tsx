"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import ProductCard from "@/components/product-card"
import type { Product } from "@/lib/types"
import { useCart } from "@/lib/context"

export default function SearchPage() {
  const { state } = useCart()
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const searchQuery = searchParams.get("q") || ""
  const isArabic = state.language === "ar"

  useEffect(() => {
    const fetchProducts = async () => {
      if (!searchQuery) {
        setProducts([])
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const response = await fetch(`/api/products?search=${encodeURIComponent(searchQuery)}`)
        const data = await response.json()
        setProducts(data)
      } catch (error) {
        console.error("Error fetching search results:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [searchQuery])

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">
        {isArabic ? `نتائج البحث عن: "${searchQuery}"` : `Search results for: "${searchQuery}"`}
      </h1>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-gray-200 animate-pulse h-80 rounded-lg"></div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <>
          <p className="text-gray-600 mb-6">
            {isArabic ? `تم العثور على ${products.length} منتج` : `Found ${products.length} products`}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">{isArabic ? "لم يتم العثور على نتائج" : "No results found"}</p>
          <p className="text-gray-400">
            {isArabic ? "جرب البحث بكلمات مختلفة" : "Try searching with different keywords"}
          </p>
        </div>
      )}
    </div>
  )
}
