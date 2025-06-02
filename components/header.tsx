"use client"
import Fuse from 'fuse.js';
import type React from "react"
import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { Search, ShoppingCart, Globe, Menu, ChevronLeft, ChevronRight, Heart, SearchIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/lib/context"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { categories } from "@/lib/utils"
import { useWishlist } from "@/lib/wishlist-context"

// Placeholder for robotics/maker electronics suggestions
const productSuggestions = [
  "Arduino",
  "Capacitor",
  "Resistor",
  "Inductor",
  "Diode",
  "Transistor",
  "Potentiometer",
  "LED",
  "Motor",
  "Servo Motor",
  "Stepper Motor",
  "Microcontroller", // e.g., Arduino, ESP32
  "Sensor", // e.g., Ultrasonic, Infrared
  "Relay",
  "Breadboard",
  "Jumper Wires",
  "Power Supply",
  "Voltage Regulator",
  "Integrated Circuit (IC)",
  "Development Board", // e.g., Arduino Uno, Raspberry Pi Pico
  "Shield", // e.g., Arduino Motor Shield
  "Breakout Board",
  "Oscilloscope",
  "Multimeter",
  "Soldering Iron",
  "Wire",
  "Connector",
  "Fuse",
  "Bread board",
  "Jumper Wires",
  "Power Supply",
  "Voltage Regulator",
  "Integrated Circuit (IC)",
  "Development Board", // e.g., Arduino Uno, Raspberry Pi Pico
  "Shield", // e.g., Arduino Motor Shield
  "Breakout Board",
  "Oscilloscope",
  "Multimeter",
  "Soldering Iron",
  "Wire",
  "Connector",
];

export default function Header() {
  const { state, dispatch } = useCart()
  const [searchQuery, setSearchQuery] = useState("")
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [badgeAnimate, setBadgeAnimate] = useState(false)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  const navRef = useRef<HTMLDivElement | null>(null)
  const { state: wishlistState } = useWishlist()
  const searchInputRef = useRef<HTMLInputElement | null>(null);


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
    setShowSuggestions(false);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (value) {
      // const filteredSuggestions = productSuggestions.filter(suggestion =>
      //   suggestion.toLowerCase().includes(value.toLowerCase())
      // );
      // setSuggestions(filteredSuggestions.slice(0, 5)); // Limit to a few suggestions
      // setShowSuggestions(true);
      const fuse = new Fuse(productSuggestions, {threshold: 0.6});
      const results = fuse.search(value).map(result => result.item);
      
      setSuggestions(results.slice(0, 5));
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    router.push(`/search?q=${encodeURIComponent(suggestion)}`);
  };

  const handleInputBlur = () => {
    // Keep suggestions visible for a short moment to allow clicking
    setTimeout(() => {
      setShowSuggestions(false);
    }, 100);
  };

  const handleInputFocus = () => {
    if (searchQuery) {
      const filteredSuggestions = productSuggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSuggestions(filteredSuggestions.slice(0, 5));
      setShowSuggestions(true);
    }
  };


  const isArabic = state.language === "ar"
  const wishlistCount = wishlistState.items?.length || 0

  return (
    <header className="sticky top-0 z-50">
      {/* Top bar - Yellow */}
      <div className="bg-[#FEEE00]/90 backdrop-blur-lg py-1  md:py-2">
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
                  ref={searchInputRef}
                  type="search"
                  placeholder={isArabic ? "البحث عن المنتجات..." : "What are you looking for?"}
                  value={searchQuery}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  onFocus={handleInputFocus}
                  className="pr-12 rounded-full border-0 shadow-md h-11 bg-white"
                  dir={isArabic ? "rtl" : "ltr"}
                />
                <Button type="submit" size="sm" className="absolute right-1 top-1 h-9 w-9 p-0 rounded-full">
                  <Search className="h-4 w-4" />
                </Button>
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white shadow-md rounded-md mt-1 z-50">
                    <ul>
                      {suggestions.map((suggestion) => (
                        <li
                          key={suggestion}
                          className="flex flex-row items-center px-4 py-2 font-medium text-neutral-800 hover:bg-neutral-100 cursor-pointer"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          <SearchIcon size={16} className="mr-2 text-neutral-400" />
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
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
                  {state.items?.length > 0 && (
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
                  ref={searchInputRef}
                  type="search"
                  placeholder={isArabic ? "البحث عن المنتجات..." : "What are you looking for?"}
                  value={searchQuery}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  onFocus={handleInputFocus}
                  className="pr-10 rounded-full border-0 shadow-md bg-white"
                  dir={isArabic ? "rtl" : "ltr"}
                />
                <Button type="submit" size="sm" className="absolute right-1 top-1/2  -translate-y-1/2 h-8 w-8 p-0 rounded-full">
                  <Search className="h-4 w-4" />
                </Button>
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white shadow-md rounded-md mt-1 z-20">
                    <ul>
                      {suggestions.map((suggestion) => (
                        <li
                          key={suggestion}
                          className="px-4 py-2 text-gray-800 hover:bg-gray-100 cursor-pointer"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Navigation - Teal */}
      <div className="bg-[#091638]/90 backdrop-blur-lg text-white relative -z-40">
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