"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Search, ShoppingCart, Globe, Menu, User, Heart } from "lucide-react"
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
    <header className="sticky top-0 z-50">
      {/* Top bar - Yellow */}
      <div className="bg-yellow-400 py-3">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="text-2xl font-bold text-gray-800">
              {isArabic ? "أمترونيكس" : "Amtronics"}
            </Link>

            {/* Search bar */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-8">
              <div className="relative w-full">
                <Input
                  type="search"
                  placeholder={isArabic ? "البحث عن المنتجات..." : "What are you looking for?"}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10 rounded-full border-0 shadow-md h-11"
                  dir={isArabic ? "rtl" : "ltr"}
                />
                <Button type="submit" size="sm" className="absolute right-1 top-1 h-9 w-9 p-0 rounded-full">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </form>

            {/* Right side icons */}
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={toggleLanguage} className="text-gray-800">
                <Globe className="h-5 w-5 mr-1" />
                {isArabic ? "English" : "العربية"}
              </Button>


              <Link href="/cart">
                <Button variant="ghost" size="sm" className="relative text-gray-800">
                  <ShoppingCart className="h-5 w-5" />
                  {state.items.length > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs bg-blue-600">
                      {state.items.reduce((sum, item) => sum + item.quantity, 0)}
                    </Badge>
                  )}
                </Button>
              </Link>

              <Button
                variant="ghost"
                size="sm"
                className="md:hidden text-gray-800"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Mobile search */}
          <div className="md:hidden mt-3">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Input
                  type="search"
                  placeholder={isArabic ? "البحث عن المنتجات..." : "What are you looking for?"}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10 rounded-full border-0 shadow-md"
                  dir={isArabic ? "rtl" : "ltr"}
                />
                <Button type="submit" size="sm" className="absolute right-1 top-1 h-8 w-8 p-0 rounded-full">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Navigation - Teal */}
      <div className="bg-teal-500 text-white">
        <div className="container mx-auto px-4">
          <nav className={`${isMenuOpen ? "block" : "hidden"} md:block py-3`}>
            <div className="flex flex-col md:flex-row gap-4 md:gap-8 justify-center">
              <Link href="/products" className="hover:text-yellow-200 transition-colors font-medium">
                {isArabic ? "جميع المنتجات" : "All Products"}
              </Link>
              <Link href="/products?category=Kits" className="hover:text-yellow-200 transition-colors font-medium">
                {isArabic ? "أطقم" : "Kits"}
              </Link>
              <Link
                href="/products?category=Electronics"
                className="hover:text-yellow-200 transition-colors font-medium"
              >
                {isArabic ? "إلكترونيات" : "Electronics"}
              </Link>
              <Link
                href="/products?category=Components"
                className="hover:text-yellow-200 transition-colors font-medium"
              >
                {isArabic ? "مكونات" : "Components"}
              </Link>
              <Link href="/products?featured=true" className="hover:text-yellow-200 transition-colors font-medium">
                {isArabic ? "المنتجات المميزة" : "Featured"}
              </Link>
              <Link href="/products?recent=true" className="hover:text-yellow-200 transition-colors font-medium">
                {isArabic ? "إضافات حديثة" : "New Arrivals"}
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </header>
  )
}
