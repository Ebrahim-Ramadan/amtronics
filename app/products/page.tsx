"use client"
import type React from "react"
import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import ProductCard from "@/components/product-card"
import type { Product } from "@/lib/types"
import { useCart } from "@/lib/context"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { categories } from "@/lib/utils"

export default function ProductsPage() {
  const { state } = useCart()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "")
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "")
  const isArabic = state.language === "ar"

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        let url = "/api/products?"
        const params = new URLSearchParams()
        if (searchQuery) params.append("search", searchQuery)
        if (selectedCategory) params.append("category", selectedCategory)
        if (searchParams.get("featured")) params.append("featured", "true")
        if (searchParams.get("recent")) params.append("recent", "true")

        url += params.toString()

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

  }, [searchQuery, selectedCategory, searchParams])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    if (searchQuery) {
      params.set("search", searchQuery)
    } else {
      params.delete("search")
    }
    router.push(`/products?${params.toString()}`)
  }

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value)
    const params = new URLSearchParams(searchParams.toString())
    if (value === "all") {
      params.delete("category")
    } else {
      params.set("category", value)
    }
    router.push(`/products?${params.toString()}`)
  }

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedCategory("")
    router.push("/products")
  }

  return (
    <div className="container mx-auto px-2 py-4 md:px-4 md:py-6">
      <h1 className="text-3xl font-bold mb-2 md:mb-4">{isArabic ? "المنتجات" : "Products"}</h1>
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-2 md:gap-4 mb-2 md:mb-8">
        <form onSubmit={handleSearch} className="flex-1">
          <Input
            type="search"
            placeholder={isArabic ? "البحث عن المنتجات..." : "Search products..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            dir={isArabic ? "rtl" : "ltr"}
          />
        </form>

        <Select value={selectedCategory} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder={isArabic ? "اختر الفئة" : "Select Category"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{isArabic ? "جميع الفئات" : "All Categories"}</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {(searchQuery || selectedCategory) && (
          <Button
            variant="outline"
            onClick={clearFilters}
          >
            {isArabic ? "مسح الفلاتر" : "Clear Filters"}
          </Button>
        )}
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="bg-gray-200 animate-pulse h-80 rounded-lg"></div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">{isArabic ? "لم يتم العثور على منتجات" : "No products found"}</p>
        </div>
      )}
    </div>
  )
}