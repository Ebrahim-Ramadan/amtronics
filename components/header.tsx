"use client"

import type React from "react"
import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { Search, ShoppingCart, Globe, Menu, ChevronLeft, ChevronRight, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/lib/context"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { categories } from "@/lib/utils"
import { useWishlist } from "@/lib/wishlist-context"

export default function Header() {
  const { state, dispatch } = useCart()
  const [searchQuery, setSearchQuery] = useState("")
  const [badgeAnimate, setBadgeAnimate] = useState(false)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  const navRef = useRef<HTMLDivElement | null>(null)
  const { state: wishlistState } = useWishlist()


  useEffect(() => {
    const query = searchParams.get('q')
    if (query) {
      setSearchQuery(query)
    }
  }, [searchParams])

  useEffect(() => {
    if (state.items.length > 0) {
      setBadgeAnimate(true)
      const timeout = setTimeout(() => setBadgeAnimate(false), 1000)
      return () => clearTimeout(timeout)
    }
  }, [state.items.reduce((sum, item) => sum + item.quantity, 0)])


  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  const toggleLanguage = () => {
    dispatch({ type: "SET_LANGUAGE", payload: state.language === "en" ? "ar" : "en" })
  }

  const updateScrollButtons = () => {
    if (navRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = navRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1)
    }
  }

  const scrollLeft = () => {
    if (navRef.current) {
      navRef.current.scrollBy({ left: -200, behavior: "smooth" })
    }
  }

  const scrollRight = () => {
    if (navRef.current) {
      navRef.current.scrollBy({ left: 200, behavior: "smooth" })
    }
  }

  useEffect(() => {
    updateScrollButtons()
    const navElement = navRef.current
    if (navElement) {
      navElement.addEventListener("scroll", updateScrollButtons)
      return () => navElement.removeEventListener("scroll", updateScrollButtons)
    }
  }, [])

  const isArabic = state.language === "ar"
  const wishlistCount = wishlistState.items.length

  return (
    <header className="sticky top-0 z-50">
      {/* Top bar - Yellow */}
      <div className="bg-[#FEEE00] py-1  md:py-2">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="text-2xl font-bold text-gray-800">
              <Image
                src="/amtronics-logo.png"
                width={200}
                className="w-12 md:w-20"
                height={200}
                alt="Amtronics Logo"
              />
            </Link>

            {/* Search bar */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-8">
              <div className="relative w-full">
                <Input
                  type="search"
                  placeholder={isArabic ? "البحث عن المنتجات..." : "What are you looking for?"}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-12 rounded-full border-0 shadow-md h-11 bg-white"
                  dir={isArabic ? "rtl" : "ltr"}
                />
                <Button type="submit" size="sm" className="absolute right-1 top-1 h-9 w-9 p-0 rounded-full">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </form>

            {/* Right side icons */}
            <div className="flex items-center md:gap-4">
              <Button variant="ghost" size="sm" onClick={toggleLanguage} className="text-gray-800">
                <Globe className="h-5 w-5 mr-1" />
                {isArabic ? "English" : "العربية"}
              </Button>

              <Link href="/wishlist">
                <Button variant="ghost" size="sm" className="relative text-gray-800 z-10">
                  <Heart className="h-5 w-5" />
                  {wishlistCount > 0 && (
                    <Badge
                      className={`absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs bg-red-500 text-white transition-transform duration-300 cart-badge-animate`}
                    >
                      {wishlistCount}
                    </Badge>
                  )}
                </Button>
              </Link>

              <Link href="/cart">
                <Button variant="ghost" size="sm" className="relative text-gray-800 z-0">
                  <ShoppingCart className="h-5 w-5" />
                  {state.items.length > 0 && (
                    <Badge
                      className={`font-medium absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs bg-[#00B8DB] transition-transform duration-300 ${badgeAnimate ? 'cart-badge-animate' : ''}`}
                    >
                      {state.items.reduce((sum, item) => sum + item.quantity, 0)}
                    </Badge>
                  )}
                </Button>
              </Link>

            </div>
          </div>

          {/* Mobile search */}
          <div className="md:hidden mt-1">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Input
                  type="search"
                  placeholder={isArabic ? "البحث عن المنتجات..." : "What are you looking for?"}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10 rounded-full border-0 shadow-md bg-white"
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
      <div className="bg-[#091638] text-white relative">
        <div className=" mx-auto md:px-4">
          <div className="relative flex items-center">
            {/* Left Arrow */}
            <Button
              variant="ghost"
              size="sm"
              onClick={scrollLeft}
              className={`absolute left-0 h-8 w-8 p-0 rounded-full bg-[#091638] text-white ${!canScrollLeft ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!canScrollLeft}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            {/* Scrollable Nav */}
            <nav
              ref={navRef}
              className={`block overflow-x-auto whitespace-nowrap scrollbar-hidden flex-1 mx-10`}
            >
              <div className="flex gap-4 md:gap-8 py-1">
                {categories.map((category) => (
                  <Link
                    key={category}
                    href={`/products?category=${encodeURIComponent(category)}`}
                    className="py-1 hover:text-[#FEEE00] border-b-2 border-transparent hover:border-[#FEEE00] transition-all duration-300 font-medium inline-block"
                  >
                    {category}
                  </Link>
                ))}
              </div>
            </nav>

            {/* Right Arrow */}
            <Button
              variant="ghost"
              size="sm"
              onClick={scrollRight}
              className={`absolute right-0 h-8 w-8 p-0 rounded-full bg-[#091638] text-white ${!canScrollRight ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!canScrollRight}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

    
    </header>
  )
}