"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/lib/context"
import Link from "next/link"

const heroSlides = [
  {
    id: 1,
    en_title: "Electronics Lab Essentials",
    ar_title: "أساسيات الإلكترونيات",
    en_subtitle: "Everything for your next project",
    ar_subtitle: "كل ما تحتاجه لمشروعك القادم",
    discount: "Up to 40% OFF",
    ar_discount: "خصم يصل إلى 40%",
    image: "/placeholder.svg?height=500&width=800",
    bgColor: "bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700",
    link: "/products?category=Kits",
    products: [
      { name: "Arduino Uno", price: "15.99", image: "/placeholder.svg?height=100&width=100" },
      { name: "Raspberry Pi 4", price: "89.99", image: "/placeholder.svg?height=100&width=100" },
      { name: "Breadboard Kit", price: "12.50", image: "/placeholder.svg?height=100&width=100" },
    ],
  },
  {
    id: 2,
    en_title: "Smart Home Revolution",
    ar_title: "ثورة المنزل الذكي",
    en_subtitle: "IoT sensors & automation modules",
    ar_subtitle: "حساسات إنترنت الأشياء ووحدات الأتمتة",
    discount: "Buy 2 Get 1 FREE",
    ar_discount: "اشتري 2 واحصل على 1 مجاناً",
    image: "/placeholder.svg?height=500&width=800",
    bgColor: "bg-gradient-to-r from-green-500 via-emerald-600 to-teal-700",
    link: "/products?search=sensor",
    products: [
      { name: "Motion Sensor", price: "8.99", image: "/placeholder.svg?height=100&width=100" },
      { name: "WiFi Module", price: "25.99", image: "/placeholder.svg?height=100&width=100" },
      { name: "Smart Relay", price: "18.50", image: "/placeholder.svg?height=100&width=100" },
    ],
  },
  {
    id: 3,
    en_title: "Student Special Deals",
    ar_title: "عروض خاصة للطلاب",
    en_subtitle: "Educational kits at unbeatable prices",
    ar_subtitle: "أطقم تعليمية بأسعار لا تُقاوم",
    discount: "25% Student Discount",
    ar_discount: "خصم 25% للطلاب",
    image: "/placeholder.svg?height=500&width=800",
    bgColor: "bg-gradient-to-r from-orange-500 via-red-500 to-pink-600",
    link: "/products?featured=true",
    products: [
      { name: "Lab Kit Pro", price: "45.99", image: "/placeholder.svg?height=100&width=100" },
      { name: "Multimeter", price: "32.99", image: "/placeholder.svg?height=100&width=100" },
      { name: "Soldering Kit", price: "28.50", image: "/placeholder.svg?height=100&width=100" },
    ],
  },
]

export default function EnhancedHeroSlider() {
  const { state } = useCart()
  const [currentSlide, setCurrentSlide] = useState(0)
  const isArabic = state.language === "ar"

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)

  const currentSlideData = heroSlides[currentSlide]

  return (
    <div className="relative h-[500px] overflow-hidden rounded-xl shadow-2xl">
      <div className={`absolute inset-0 ${currentSlideData.bgColor} transition-all duration-700`}>
        <div className="container mx-auto px-8 h-full flex items-center">
          <div className="grid lg:grid-cols-2 gap-8 items-center w-full">
            {/* Left Content */}
            <div className={`text-white ${isArabic ? "text-right" : "text-left"}`}>
              <Badge className="bg-yellow-400 text-black mb-4 text-sm font-bold px-3 py-1">
                {isArabic ? currentSlideData.ar_discount : currentSlideData.discount}
              </Badge>
              <h1 className="text-5xl lg:text-6xl font-bold mb-4 leading-tight">
                {isArabic ? currentSlideData.ar_title : currentSlideData.en_title}
              </h1>
              <p className="text-xl lg:text-2xl mb-8 opacity-90">
                {isArabic ? currentSlideData.ar_subtitle : currentSlideData.en_subtitle}
              </p>

              {/* Featured Products */}
              <div className="flex gap-4 mb-8 overflow-x-auto">
                {currentSlideData.products.map((product, idx) => (
                  <div key={idx} className="bg-white/10 backdrop-blur-sm rounded-lg p-3 min-w-[120px] text-center">
                    <Image
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      width={60}
                      height={60}
                      className="mx-auto mb-2 rounded"
                    />
                    <p className="text-xs font-medium">{product.name}</p>
                    <p className="text-sm font-bold text-yellow-300">{product.price} KD</p>
                  </div>
                ))}
              </div>

              <Link href={currentSlideData.link}>
                <Button size="lg" className="bg-white text-black hover:bg-gray-100 text-lg px-8 py-4 font-bold">
                  {isArabic ? "تسوق الآن" : "Shop Now"}
                </Button>
              </Link>
            </div>

            {/* Right Image */}
            <div className="hidden lg:flex justify-center">
              <Image
                src={currentSlideData.image || "/placeholder.svg"}
                alt={isArabic ? currentSlideData.ar_title : currentSlideData.en_title}
                width={500}
                height={400}
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20 bg-black/20"
        onClick={prevSlide}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20 bg-black/20"
        onClick={nextSlide}
      >
        <ChevronRight className="h-6 w-6" />
      </Button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentSlide ? "bg-white scale-125" : "bg-white/50"
            }`}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>
    </div>
  )
}
