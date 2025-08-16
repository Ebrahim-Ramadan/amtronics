"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/lib/context"
import Link from "next/link"
import { STATIC_PRODUCTS } from "@/lib/mock-products"

const getRandomProducts = <T,>(arr: T[], count: number): T[] => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

const heroSlides = [
  {
    id: 1,
    en_title: "Electronics Lab Essentials",
    ar_title: "أساسيات الإلكترونيات",
    en_subtitle: "Everything for your next project",
    ar_subtitle: "كل ما تحتاجه لمشروعك القادم",
    discount: "Up to 40% OFF",
    ar_discount: "خصم يصل إلى 40%",
    image: "/hero-slider/electronics-lab-essentials-slide-imae.webp",
    bgColor: "bg-gradient-to-r from-blue-800 via-purple-700 to-indigo-700",
    link: "/products?category=Kits",
    products: getRandomProducts(STATIC_PRODUCTS.bestsellers, 3).map(p => ({
      id: p._id,
      name: p.en_name,
      price: p.price.toFixed(2),
      image: Array.isArray(p.image) ? p.image[0] : (p.image?.split(",")[0] || "/placeholder.svg"),
    })),
  },
  {
    id: 2,
    en_title: "Smart Home Revolution",
    ar_title: "ثورة المنزل الذكي",
    en_subtitle: "IoT sensors & automation modules",
    ar_subtitle: "حساسات إنترنت الأشياء ووحدات الأتمتة",
    discount: "Buy 2 Get 1 FREE",
    ar_discount: "اشتري 2 واحصل على 1 مجاناً",
    image: "/hero-slider/smart-home-revolution-slide-image.webp",
    bgColor: "bg-gradient-to-r from-green-700 via-emerald-600 to-teal-700",
    link: "/products?search=sensor",
    products: getRandomProducts(STATIC_PRODUCTS.deals, 3).map(p => ({
      id: p._id,
      name: p.en_name,
      price: p.price.toFixed(2),
      image: Array.isArray(p.image) ? p.image[0] : (p.image?.split(",")[0] || "/placeholder.svg"),
    })),
  },
  {
    id: 3,
    en_title: "Student Special Deals",
    ar_title: "عروض خاصة للطلاب",
    en_subtitle: "Educational kits at unbeatable prices",
    ar_subtitle: "أطقم تعليمية بأسعار لا تُقاوم",
    discount: "25% Student Discount",
    ar_discount: "خصم 25% للطلاب",
    image: "/hero-slider/soldering-slide-image.webp",
    bgColor: "bg-gradient-to-r from-orange-700 via-red-600 to-pink-600",
    link: "/products?featured=true",
    products: getRandomProducts(STATIC_PRODUCTS.recommended, 3).map(p => ({
      id: p._id,
      name: p.en_name,
      price: p.price.toFixed(2),
      image: Array.isArray(p.image) ? p.image[0] : (p.image?.split(",")[0] || "/placeholder.svg"),
    })),
  },
]

export default function EnhancedHeroSlider() {
  const { state } = useCart()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [arrowHover, setArrowHover] = useState<{ left: boolean; right: boolean }>({ left: false, right: false })
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null)
  const [isSliding, setIsSliding] = useState(false)
  const [nextSlide, setNextSlide] = useState<number | null>(null)
  const isArabic = state.language === "ar"
  const sliderRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef<number | null>(null)
  const touchEndX = useRef<number | null>(null)

  // Mouse move for arrow animation
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!sliderRef.current) return
      const rect = sliderRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const proximity = 60 // px
      setArrowHover({
        left: x < proximity,
        right: x > rect.width - proximity,
      })
    }
    const handleMouseLeave = () => setArrowHover({ left: false, right: false })
    const slider = sliderRef.current
    if (slider) {
      slider.addEventListener("mousemove", handleMouseMove)
      slider.addEventListener("mouseleave", handleMouseLeave)
    }
    return () => {
      if (slider) {
        slider.removeEventListener("mousemove", handleMouseMove)
        slider.removeEventListener("mouseleave", handleMouseLeave)
      }
    }
  }, [])

  // Slide auto-advance
  // useEffect(() => {
  //   const timer = setInterval(() => {
  //     handleNextSlide()
  //   }, 6000)
  //   return () => clearInterval(timer)
  // }, [currentSlide])

  // Slide transition helpers
  const handleNextSlide = () => {
    if (isSliding) return
    setSlideDirection('right')
    setNextSlide((currentSlide + 1) % heroSlides.length)
    setIsSliding(true)
    setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
      setIsSliding(false)
      setNextSlide(null)
    }, 400)
  }
  const handlePrevSlide = () => {
    if (isSliding) return
    setSlideDirection('left')
    setNextSlide((currentSlide - 1 + heroSlides.length) % heroSlides.length)
    setIsSliding(true)
    setTimeout(() => {
      setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)
      setIsSliding(false)
      setNextSlide(null)
    }, 400)
  }
  const handleDotClick = (index: number) => {
    if (isSliding || index === currentSlide) return
    setSlideDirection(index > currentSlide ? 'right' : 'left')
    setNextSlide(index)
    setIsSliding(true)
    setTimeout(() => {
      setCurrentSlide(index)
      setIsSliding(false)
      setNextSlide(null)
    }, 400)
  }

  // Swipe gesture handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX
  }
  const handleTouchEnd = () => {
    if (touchStartX.current !== null && touchEndX.current !== null) {
      const diff = touchStartX.current - touchEndX.current
      if (Math.abs(diff) > 50) {
        if (diff > 0) handleNextSlide()
        else handlePrevSlide()
      }
    }
    touchStartX.current = null
    touchEndX.current = null
  }

  const currentSlideData = heroSlides[currentSlide]

  // Slide transition classes
  const slideTransition = isSliding
    ? slideDirection === 'right'
      ? 'animate-slide-left'
      : 'animate-slide-right'
    : ''

  // Helper to render a slide
  const renderSlide = (slideIdx: number, transitionClass: string) => {
    const slideData = heroSlides[slideIdx]
    return (
      <div
        key={slideIdx}
        className={`absolute inset-0 w-full h-full ${slideData.bgColor} transition-all duration-700 ${transitionClass}`}
        style={{ willChange: isSliding ? 'transform' : undefined }}
      >
        <div className=" md:px-12 w-full h-full flex items-center px-2">
          <div className="grid lg:grid-cols-2 gap-4 items-center w-full">
            {/* Left Content */}
            <div className={`text-white ${isArabic ? "text-right" : "text-left"}`}>
              {/* <Badge className="bg-yellow-400 text-black mb-4 text-sm font-bold px-3 py-1">
                {isArabic ? slideData.ar_discount : slideData.discount}
              </Badge> */}
              <h1 className="text-2xl md:text-5xl line-clamp-1 md:line-clamp-2 md:leading-14 lg:text-6xl font-bold mb-1 md:mb-3 ">
                {isArabic ? slideData.ar_title : slideData.en_title}
              </h1>
              <p className="text-sm md:text-xl lg:text-2xl mb-1 md:mb-2 opacity-90">
                {isArabic ? slideData.ar_subtitle : slideData.en_subtitle}
              </p>

              {/* Featured Products */}
              <div className="flex gap-2 md:gap-4  overflow-x-auto py-2">
                {slideData.products.map((product, idx) => (
                  <a href={`/products/${product.id}`} key={idx} className="bg-white/10 backdrop-blur-sm rounded-lg p-2  min-w-[100px] h-fit text-center">
                    <Image
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      width={150}
                      height={60}
                      quality={50}
                      priority
                      className=" mb-2 rounded-sm"
                    />
                    <p className="text-xs md:text-sm font-medium text-balance">
  {product.name.length > 30 ? product.name.slice(0, 30) + '...' : product.name}
</p>

                    <p className="text-sm md:text-base font-bold text-yellow-300">{product.price} KD</p>
                  </a>
                ))}
              </div>

              <Link href={slideData.link}>
                <Button  className="bg-white text-black hover:bg-gray-100 text-lg md:text-xl px-4 md:px-8 py-2 md:py-4 font-bold md:size-lg">
                  {isArabic ? "تسوق الآن" : "SHOP NOW"}
                </Button>
              </Link>
            </div>

            {/* Right Image */}
            <div className="hidden lg:flex justify-center">
              <Image
                src={slideData.image || "/placeholder.svg"}
                alt={isArabic ? slideData.ar_title : slideData.en_title}
                width={400}
                height={350}
                quality={50}
                priority
                className="bg-neutral-400 object-contain rounded-sm"
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={sliderRef}
      className="relative h-[350px] md:h-[400px] lg:h-[500px] overflow-hidden rounded-xl shadow-2xl mt-2"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slides */}
      <div className="relative w-full h-full">
        {/* Current Slide */}
        {renderSlide(
          currentSlide,
          isSliding && nextSlide !== null
            ? slideDirection === 'right'
              ? 'z-10 animate-slide-out-left'
              : 'z-10 animate-slide-out-right'
            : 'z-20'
        )}
        {/* Next Slide (only during transition) */}
        {isSliding && nextSlide !== null && renderSlide(
          nextSlide,
          slideDirection === 'right'
            ? 'z-20 animate-slide-in-right'
            : 'z-20 animate-slide-in-left'
        )}
      </div>

      {/* Navigation */}
      <button
        className={`cursor-pointer backdrop-blur-lg w-10 md:w-16 h-10 md:h-16 border-2 border-white/20 absolute left-2 md:left-4 top-1/2 rounded-full transform -translate-y-1/2 text-white bg-black/10 transition-all duration-300 z-30 flex items-center justify-center
          ${arrowHover.left ? 'scale-125 bg-yellow-400 text-black shadow-lg' : 'hover:bg-white/20'}`}
        onClick={handlePrevSlide}
        style={{ pointerEvents: isSliding ? 'none' : 'auto' }}
        aria-label="Previous Slide"
        onMouseEnter={() => setArrowHover((prev) => ({ ...prev, left: true }))}
        onMouseLeave={() => setArrowHover((prev) => ({ ...prev, left: false }))}
      >
        <ChevronLeft className={`w-6 md:w-10 h-6 md:h-10 ${arrowHover.left ? 'scale-125' : ''}`} />
      </button>
      <button
        className={`cursor-pointer backdrop-blur-lg w-10 md:w-16 h-10 md:h-16 border-2 border-white/20 absolute right-2 md:right-4 top-1/2 rounded-full transform -translate-y-1/2 text-white bg-black/20 transition-all duration-300 z-30 flex items-center justify-center
          ${arrowHover.right ? 'scale-125 bg-yellow-400 text-black shadow-lg' : 'hover:bg-white/20'}`}
        onClick={handleNextSlide}
        style={{ pointerEvents: isSliding ? 'none' : 'auto' }}
        aria-label="Next Slide"
        onMouseEnter={() => setArrowHover((prev) => ({ ...prev, right: true }))}
        onMouseLeave={() => setArrowHover((prev) => ({ ...prev, right: false }))}
      >
        <ChevronRight className={`w-6 md:w-10 h-6 md:h-10 ${arrowHover.right ? 'scale-125' : ''}`} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-2 md:bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-1 md:space-x-3 z-40">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            className={`w-3 md:w-6 h-1 cursor-pointer  rounded-xl transition-all ${
              index === currentSlide ? "bg-[#FEEE00] scale-125" : "bg-white/50"
            }`}
            onClick={() => handleDotClick(index)}
            style={{ pointerEvents: isSliding ? 'none' : 'auto' }}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
      {/* Slide transition keyframes */}
      <style jsx global>{`
        .animate-slide-out-left {
          animation: slideOutLeft 0.4s cubic-bezier(0.4,0,0.2,1) forwards;
        }
        .animate-slide-out-right {
          animation: slideOutRight 0.4s cubic-bezier(0.4,0,0.2,1) forwards;
        }
        .animate-slide-in-right {
          animation: slideInRight 0.4s cubic-bezier(0.4,0,0.2,1) forwards;
        }
        .animate-slide-in-left {
          animation: slideInLeft 0.4s cubic-bezier(0.4,0,0.2,1) forwards;
        }
        @keyframes slideOutLeft {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); opacity: 0.7; }
        }
        @keyframes slideOutRight {
          0% { transform: translateX(0); }
          100% { transform: translateX(100%); opacity: 0.7; }
        }
        @keyframes slideInRight {
          0% { transform: translateX(100%); opacity: 0.7; }
          100% { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideInLeft {
          0% { transform: translateX(-100%); opacity: 0.7; }
          100% { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
