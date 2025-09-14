"use client"

import Image from "next/image"
import Link from "next/link"
import { Star, CheckCheck, HeartPlus, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import type { Product } from "@/lib/types"
import { useCart } from "@/lib/context"
import { toast } from "sonner"
import { useState, useEffect, useRef } from "react"
import { useWishlist } from "@/lib/wishlist-context"

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { state, dispatch } = useCart()
  const { state: wishlistState, dispatch: wishlistDispatch } = useWishlist()
  const isArabic = state.language === "ar"
  const [showCheck, setShowCheck] = useState(false)
  const [addToCartLoading, setAddToCartLoading] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null)
  const [isSliding, setIsSliding] = useState(false)
  const [nextImageIndex, setNextImageIndex] = useState<number | null>(null)
  const [arrowHover, setArrowHover] = useState<{ left: boolean; right: boolean }>({ left: false, right: false })
  const sliderRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef<number | null>(null)
  const touchEndX = useRef<number | null>(null)

  const images = product.image ? product.image.split(',').map(img => img.trim()) : ["/placeholder.svg?height=250&width=250"]

  // Mouse move for arrow animation
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!sliderRef.current) return
      const rect = sliderRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const proximity = 40 // px
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

  const addToCart = () => {
    setAddToCartLoading(true)
    setShowCheck(false)
    setTimeout(() => {
      dispatch({ type: "ADD_ITEM", payload: product })
      toast.success(isArabic ? "تمت الإضافة إلى السلة" : "Added to cart")
      setAddToCartLoading(false)
      setShowCheck(true)
      setTimeout(() => setShowCheck(false), 2000)
    }, 200)
  }

  const isWishlisted = wishlistState.items.some(item => item._id === product._id)

  const toggleWishlist = () => {
    if (isWishlisted) {
      wishlistDispatch({ type: "REMOVE_ITEM", payload: product._id })
      toast.info(isArabic ? "تمت الإزالة من قائمة الرغبات" : "Removed from wishlist")
    } else {
      wishlistDispatch({ type: "ADD_ITEM", payload: product })
      toast.success(isArabic ? "تمت الإضافة إلى قائمة الرغبات" : "Added to wishlist")
    }
  }

  const discountedPrice = product.discount ? product.price - product.price * (product.discount / 100) : product.price

  const handlePrevImage = () => {
    if (isSliding) return
    setSlideDirection('left')
    setNextImageIndex((currentImageIndex - 1 + images.length) % images.length)
    setIsSliding(true)
    setTimeout(() => {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
      setIsSliding(false)
      setNextImageIndex(null)
    }, 400)
  }

  const handleNextImage = () => {
    if (isSliding) return
    setSlideDirection('right')
    setNextImageIndex((currentImageIndex + 1) % images.length)
    setIsSliding(true)
    setTimeout(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length)
      setIsSliding(false)
      setNextImageIndex(null)
    }, 400)
  }

  const handleDotClick = (index: number) => {
    if (isSliding || index === currentImageIndex) return
    setSlideDirection(index > currentImageIndex ? 'right' : 'left')
    setNextImageIndex(index)
    setIsSliding(true)
    setTimeout(() => {
      setCurrentImageIndex(index)
      setIsSliding(false)
      setNextImageIndex(null)
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
        if (diff > 0) handleNextImage()
        else handlePrevImage()
      }
    }
    touchStartX.current = null
    touchEndX.current = null
  }

  // Render single image
  const renderImage = (index: number, transitionClass: string) => {
    return (
      <div
        key={index}
        className={`absolute inset-0 w-full h-full transition-all duration-400 ${transitionClass}`}
        style={{ willChange: isSliding ? 'transform' : undefined }}
      >
        <Link href={`/products/${product._id}`} prefetch={false}>
          <img
          // unoptimized
            src={images[index]}
            alt={`${isArabic ? product.ar_name : product.en_name} - Image ${index + 1}`}
            // width={250}
            // height={250}
            className="w-full h-48 object-contain group-hover:scale-105 transition-transform duration-300"
          />
        </Link>
      </div>
    )
  }

  return (
    <Card className="group hover:shadow-md transition-shadow duration-300 gap-4 md:px-2">
      <div
        ref={sliderRef}
        className="relative overflow-hidden h-48"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Images */}
        <div className="relative w-full h-full">
          {/* Current Image */}
          {renderImage(
            currentImageIndex,
            isSliding && nextImageIndex !== null
              ? slideDirection === 'right'
                ? 'z-10 animate-slide-out-left'
                : 'z-10 animate-slide-out-right'
              : 'z-20'
          )}
          {/* Next Image (only during transition) */}
          {isSliding && nextImageIndex !== null && renderImage(
            nextImageIndex,
            slideDirection === 'right'
              ? 'z-20 animate-slide-in-right'
              : 'z-20 animate-slide-in-left'
          )}
        </div>

        {/* Navigation Buttons */}
        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className={`absolute top-1/2 left-2 transform -translate-y-1/2 border-1 border-neutral-100 backdrop-blur-xl bg-white/80 hover:bg-yellow-400 rounded-full transition-all duration-300 z-30 ${
                arrowHover.left ? 'scale-110 bg-yellow-400 text-black shadow-lg' : ''
              }`}
              onClick={handlePrevImage}
              onMouseEnter={() => setArrowHover((prev) => ({ ...prev, left: true }))}
              onMouseLeave={() => setArrowHover((prev) => ({ ...prev, left: false }))}
              style={{ pointerEvents: isSliding ? 'none' : 'auto' }}
              aria-label={isArabic ? "الصورة السابقة" : "Previous image"}
            >
              <ChevronLeft className={`h-6 w-6 ${arrowHover.left ? 'scale-110' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`absolute top-1/2 right-2 transform -translate-y-1/2 border-1 border-neutral-100 backdrop-blur-xl bg-white/80 hover:bg-yellow-400 rounded-full transition-all duration-300 z-30 ${
                arrowHover.right ? 'scale-110 bg-yellow-400 text-black shadow-lg' : ''
              }`}
              onClick={handleNextImage}
              onMouseEnter={() => setArrowHover((prev) => ({ ...prev, right: true }))}
              onMouseLeave={() => setArrowHover((prev) => ({ ...prev, right: false }))}
              style={{ pointerEvents: isSliding ? 'none' : 'auto' }}
              aria-label={isArabic ? "الصورة التالية" : "Next image"}
            >
              <ChevronRight className={`h-6 w-6 ${arrowHover.right ? 'scale-110' : ''}`} />
            </Button>
           
          </>
        )}
        {product.discount && <Badge className="absolute top-2 left-2 bg-red-500 z-30">-{product.discount}%</Badge>}
        {product.quantity_on_hand === 0 && (
          <Badge variant="secondary" className="absolute top-2 right-2 z-30">
            {isArabic ? "نفذ المخزون" : "Out of Stock"}
          </Badge>
        )}
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
     
      <div className="w-full justify-center items-center flex gap-1">
              {images.length > 1 && images.map((_, index) => (
                <button
                  key={index}
                  className={`h-1 rounded-full transition-all ${
                    index === currentImageIndex ? "w-3 bg-[#FEEE00] scale-125" : "w-2 bg-neutral-300"
                  }`}
                  onClick={() => handleDotClick(index)}
                  style={{ pointerEvents: isSliding ? 'none' : 'auto' }}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
      <CardContent className="p-2">
        <Link href={`/products/${product._id}`}>
          <h3 className="font-semibold text-lg line-clamp-1 leading-6 hover:text-blue-600 transition-colors">
            {isArabic ? product.ar_name : product.en_name}
          </h3>
        </Link>
        <p className="text-gray-600 text-sm line-clamp-2">
          {product.en_name}
        </p>

        {/* <div className="flex items-center gap-2 mb-1">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`h-2 w-2 ${i < 4 ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
            ))}
          </div>
          <span className="text-sm text-gray-500">
            ({product.sold_quantity} {isArabic ? "مبيع" : "sold"})
          </span>
        </div> */}

        <div className="flex items-center gap-2">
          {product.discount ? (
            <>
              <span className="text-2xl font-bold text-green-600">
                {discountedPrice.toFixed(2)} <span className="text-sm">{isArabic ? "د.ك" : "KD"}</span>
              </span>
              <span className="text-sm text-gray-500 line-through">
                {product.price.toFixed(2)} <span className="text-sm">{isArabic ? "د.ك" : "KD"}</span>
              </span>
            </>
          ) : (
            <span className="text-2xl font-bold">
              {product.price.toFixed(2)} <span className="text-sm">{isArabic ? "د.ك" : "KD"}</span>
            </span>
          )}
          <Button
            variant="ghost"
            size="icon"
            className={`hover:bg-[#FEEE00] ml-auto ${isWishlisted ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
            onClick={toggleWishlist}
            aria-label={isArabic ? (isWishlisted ? "إزالة من قائمة الرغبات" : "أضف إلى قائمة الرغبات") : (isWishlisted ? "Remove from wishlist" : "Add to wishlist")}
          >
            <HeartPlus className={`h-6 w-6 fill-current ${isWishlisted ? '' : 'fill-transparent'}`} />
          </Button>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button onClick={addToCart} className="w-full" disabled={product.quantity_on_hand === 0 || addToCartLoading}>
          {!addToCartLoading && !showCheck &&
            <img
            // unoptimized
              src='/quick-atc-add-to-cart-grey.svg'
              // width={20}
              // height={20}
              alt="Add to Cart"
            />
          }
          {addToCartLoading ? (
            <span className="h-4 w-4 mr-2 animate-spin border-2 border-gray-300 border-t-transparent rounded-full inline-block align-middle"></span>
          ) : showCheck ? (
            <><CheckCheck className="h-4 w-4 mr-2 text-green-500" />{isArabic ? "تمت الإضافة" : "Added"}</>
          ) : (
            isArabic ? "أضف للسلة" : "Add to Cart"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}