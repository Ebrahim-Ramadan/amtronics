"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/context"
import Link from "next/link"

const banners = [
  {
    id: 1,
    en_title: "Electronics Lab Revolution!",
    ar_title: "ثورة مختبر الإلكترونيات!",
    en_subtitle: "Get up to 30% off on all educational kits & components",
    ar_subtitle: "احصل على خصم يصل إلى 30% على جميع الأطقم التعليمية والمكونات",
    image: "/placeholder.svg?height=400&width=600",
    color: "bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600",
    link: "/products?category=Kits",
  },
  {
    id: 2,
    en_title: "Raspberry Pi 5 Now Available!",
    ar_title: "راسبيري باي 5 متوفر الآن!",
    en_subtitle: "Latest technology for your next innovative project",
    ar_subtitle: "أحدث التقنيات لمشروعك المبتكر القادم",
    image: "/placeholder.svg?height=400&width=600",
    color: "bg-gradient-to-r from-green-500 via-emerald-500 to-teal-600",
    link: "/products?search=raspberry",
  },
  {
    id: 3,
    en_title: "Build Your Smart Home",
    ar_title: "اصنع منزلك الذكي",
    en_subtitle: "IoT sensors, modules & microcontrollers in stock",
    ar_subtitle: "حساسات إنترنت الأشياء والوحدات والمتحكمات الدقيقة متوفرة",
    image: "/placeholder.svg?height=400&width=600",
    color: "bg-gradient-to-r from-orange-500 via-red-500 to-pink-600",
    link: "/products",
  },
  {
    id: 4,
    en_title: "Student Discount Program",
    ar_title: "برنامج خصم الطلاب",
    en_subtitle: "Special prices for students & educational institutions",
    ar_subtitle: "أسعار خاصة للطلاب والمؤسسات التعليمية",
    image: "/placeholder.svg?height=400&width=600",
    color: "bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600",
    link: "/products?featured=true",
  },
]

export default function HeroBanner() {
  const { state } = useCart()
  const [currentSlide, setCurrentSlide] = useState(0)
  const isArabic = state.language === "ar"

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length)
  }

  const currentBanner = banners[currentSlide]

  return (
    <div className="relative h-[400px] overflow-hidden rounded-lg">
      <div
        className={`absolute inset-0 ${currentBanner.color} flex items-center justify-between px-8 text-white transition-all duration-500`}
      >
        <div className={`flex-1 ${isArabic ? "text-right" : "text-left"}`}>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            {isArabic ? currentBanner.ar_title : currentBanner.en_title}
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            {isArabic ? currentBanner.ar_subtitle : currentBanner.en_subtitle}
          </p>
          <Link href={currentBanner.link}>
            <Button size="lg" variant="secondary" className="text-lg px-8 py-3">
              {isArabic ? "تسوق الآن" : "Shop Now"}
            </Button>
          </Link>
        </div>
        <div className="flex-1 flex justify-center">
          <Image
          unoptimized
            src={currentBanner.image || "/placeholder.svg"}
            alt={isArabic ? currentBanner.ar_title : currentBanner.en_title}
            width={400}
            height={300}
            className="object-contain"
          />
        </div>
      </div>

      {/* Navigation buttons */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20"
        onClick={prevSlide}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20"
        onClick={nextSlide}
      >
        <ChevronRight className="h-6 w-6" />
      </Button>

      {/* Dots indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {banners.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-colors ${index === currentSlide ? "bg-white" : "bg-white/50"}`}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>
    </div>
  )
}
