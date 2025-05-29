"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Search, ShoppingCart, Globe, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/lib/context"
import { useRouter } from "next/navigation"

export default function Header() {
  const { state, dispatch } = useCart()
  const [searchQuery, setSearchQuery] = useState("")
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  const toggleLanguage = () => {
    dispatch({ type: "SET_LANGUAGE", payload: state.language === "en" ? "ar" : "en" })
  }

  const isArabic = state.language === "ar"

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        {/* Top bar */}
        <div className="flex justify-between items-center py-2 text-sm border-b">
          <div className="text-gray-600">
            {isArabic ? "توصيل مجاني للطلبات أكثر من 50 د.ك" : "Free delivery for orders over 50 KD"}
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={toggleLanguage}>
              <Globe className="h-4 w-4 mr-1" />
              {isArabic ? "English" : "العربية"}
            </Button>
          </div>
        </div>

        {/* Main header */}
        <div className="flex items-center justify-between py-4">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            {isArabic ? "أمترونيكس" : "Amtronics"}
          </Link>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Input
                type="search"
                placeholder={isArabic ? "البحث عن المنتجات..." : "Search products..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
                dir={isArabic ? "rtl" : "ltr"}
              />
              <Button type="submit" size="sm" className="absolute right-1 top-1 h-8 w-8 p-0">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </form>

          {/* Cart */}
          <div className="flex items-center gap-4">
            <Link href="/cart">
              <Button variant="ghost" size="sm" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {state.items.length > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs">
                    {state.items.reduce((sum, item) => sum + item.quantity, 0)}
                  </Badge>
                )}
              </Button>
            </Link>
            <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile search */}
        <div className="md:hidden pb-4">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Input
                type="search"
                placeholder={isArabic ? "البحث عن المنتجات..." : "Search products..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                dir={isArabic ? "rtl" : "ltr"}
              />
              <Button type="submit" size="sm" className="absolute right-1 top-1 h-8 w-8 p-0">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>

        {/* Navigation */}
        <nav className={`${isMenuOpen ? "block" : "hidden"} md:block pb-4`}>
          <div className="flex flex-col md:flex-row gap-4 md:gap-8">
            <Link href="/products" className="text-gray-700 hover:text-blue-600 transition-colors">
              {isArabic ? "جميع المنتجات" : "All Products"}
            </Link>
            <Link href="/products?category=Kits" className="text-gray-700 hover:text-blue-600 transition-colors">
              {isArabic ? "أطقم" : "Kits"}
            </Link>
            <Link href="/products?featured=true" className="text-gray-700 hover:text-blue-600 transition-colors">
              {isArabic ? "المنتجات المميزة" : "Featured"}
            </Link>
            <Link href="/products?recent=true" className="text-gray-700 hover:text-blue-600 transition-colors">
              {isArabic ? "إضافات حديثة" : "New Arrivals"}
            </Link>
          </div>
        </nav>
      </div>
    </header>
  )
}
