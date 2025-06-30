"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Star, CheckCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import type { Product } from "@/lib/types"
import { useCart } from "@/lib/context"
import { toast } from "sonner"
import { STATIC_PRODUCTS } from "@/lib/mock-products"

interface ProductCarouselProps {
  title: string
  arTitle: string
  type: "bestsellers" | "deals" | "recommended"
  bgColor?: string
}

function CarouselProductCard({ product, type, isArabic, addToCart, addLoading, showCheck, products }: {
  product: Product,
  type: string,
  isArabic: boolean,
  addToCart: (product: Product) => void,
  addLoading: { [id: string]: boolean },
  showCheck: { [id: string]: boolean },
  products: Product[],
}) {
  const images = product.image ? product.image.split(',').map(img => img.trim()) : ["/placeholder.svg?height=200&width=200"];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isSliding, setIsSliding] = useState(false);
  const [nextImageIndex, setNextImageIndex] = useState<number | null>(null);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  const handlePrevImage = () => {
    if (isSliding) return;
    setSlideDirection('left');
    setNextImageIndex((currentImageIndex - 1 + images.length) % images.length);
    setIsSliding(true);
    setTimeout(() => {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
      setIsSliding(false);
      setNextImageIndex(null);
    }, 400);
  };

  const handleNextImage = () => {
    if (isSliding) return;
    setSlideDirection('right');
    setNextImageIndex((currentImageIndex + 1) % images.length);
    setIsSliding(true);
    setTimeout(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
      setIsSliding(false);
      setNextImageIndex(null);
    }, 400);
  };

  const handleDotClick = (index: number) => {
    if (isSliding || index === currentImageIndex) return;
    setSlideDirection(index > currentImageIndex ? 'right' : 'left');
    setNextImageIndex(index);
    setIsSliding(true);
    setTimeout(() => {
      setCurrentImageIndex(index);
      setIsSliding(false);
      setNextImageIndex(null);
    }, 400);
  };

  // Render single image
  const renderImage = (index: number, transitionClass: string) => (
    <div
      key={index}
      className={`absolute inset-0 w-full h-full transition-all duration-400 ${transitionClass}`}
      style={{ willChange: isSliding ? 'transform' : undefined }}
    >
      <Image
        unoptimized
        src={images[index]}
        alt={`${isArabic ? product.ar_name : product.en_name} - Image ${index + 1}`}
        width={200}
        height={200}
        className="w-full h-48 object-cover rounded group-hover:scale-105 transition-transform"
      />
    </div>
  );

  return (
    <Link href={`/products/${product._id}`} className="block h-full">
      <Card className="flex-shrink-0 bg-white/70 w-64 group hover:shadow-lg transition-shadow h-full">
        <CardContent className="p-4">
          <div className="relative mb-3">
            <div ref={sliderRef} className="relative overflow-hidden h-48">
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
                    className="absolute top-1/2 left-2 transform -translate-y-1/2 border-1 border-neutral-100 backdrop-blur-xl bg-white/80 hover:bg-yellow-400 rounded-full transition-all duration-300 z-30"
                    onClick={e => { e.preventDefault(); handlePrevImage(); }}
                    style={{ pointerEvents: isSliding ? 'none' : 'auto' }}
                    aria-label={isArabic ? "الصورة السابقة" : "Previous image"}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-1/2 right-2 transform -translate-y-1/2 border-1 border-neutral-100 backdrop-blur-xl bg-white/80 hover:bg-yellow-400 rounded-full transition-all duration-300 z-30"
                    onClick={e => { e.preventDefault(); handleNextImage(); }}
                    style={{ pointerEvents: isSliding ? 'none' : 'auto' }}
                    aria-label={isArabic ? "الصورة التالية" : "Next image"}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </>
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
            {/* Dots */}
            <div className="w-full justify-center items-center flex gap-1 mt-1">
              {images.length > 1 && images.map((_, index) => (
                <button
                  key={index}
                  className={`h-1 rounded-full transition-all ${
                    index === currentImageIndex ? "w-3 bg-[#FEEE00] scale-125" : "w-2 bg-neutral-300"
                  }`}
                  onClick={e => { e.preventDefault(); handleDotClick(index); }}
                  style={{ pointerEvents: isSliding ? 'none' : 'auto' }}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
            {type === "deals" && (
              <Badge className="absolute top-2 left-2 bg-red-500">
                {isArabic ? "عرض خاص" : "Special Deal"}
              </Badge>
            )}
            {type === "bestsellers" && (
              <Badge className="absolute top-2 z-50 left-2 bg-[#FEEE00] text-black text-xs">
                #{products.indexOf(product) + 1} {isArabic ? "الأكثر مبيعاً" : "Best Seller"}
              </Badge>
            )}
          </div>
          <h3 className="font-medium text-sm line-clamp-2 mb-2">
            {isArabic ? product.ar_name : product.en_name}
          </h3>
          <div className="flex items-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${i < 4 ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
              />
            ))}
            <span className="text-xs text-gray-500 ml-1">({product.sold_quantity})</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-bold text-green-600">
              {product.price.toFixed(2)} {isArabic ? "د.ك" : "KD"}
            </span>
            <Button
              size="sm"
              onClick={e => { e.preventDefault(); addToCart(product); }}
              className="bg-[#091638] text-xs px-3"
              disabled={addLoading[product._id]}
            >
              {addLoading[product._id] ? (
                <span className="h-4 w-4 mr-1 animate-spin border-2 border-gray-300 border-t-transparent rounded-full inline-block align-middle"></span>
              ) : showCheck[product._id] ? (
                <><CheckCheck className="h-4 w-4 mr-1 text-white" />{isArabic ? "تمت الإضافة" : "Added"}</>
              ) : (
                <>
                  {isArabic ? "أضف" : "Add"}
                  <Image unoptimized src='/quick-atc-add-to-cart-grey.svg' width={20} height={20} alt="Add to Cart" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function ProductCarousel({ title, arTitle, type, bgColor = "bg-white" }: ProductCarouselProps) {
  const { state, dispatch } = useCart()
  const products = STATIC_PRODUCTS[type] || []
  const isArabic = state.language === "ar"
  const [addLoading, setAddLoading] = useState<{ [id: string]: boolean }>({})
  const [showCheck, setShowCheck] = useState<{ [id: string]: boolean }>({})
  const [currentIndex, setCurrentIndex] = useState(0)

  const addToCart = (product: Product) => {
    setAddLoading((prev) => ({ ...prev, [product._id]: true }))
    setShowCheck((prev) => ({ ...prev, [product._id]: false }))
    setTimeout(() => {
      dispatch({ type: "ADD_ITEM", payload: product })
      toast.success(isArabic ? "\u062A\u0645\u062A \u0627\u0644\u0625\u0636\u0627\u0641\u0629 \u0625\u0644\u0649 \u0627\u0644\u0633\u0644\u0629" : "Added to cart")
      setAddLoading((prev) => ({ ...prev, [product._id]: false }))
      setShowCheck((prev) => ({ ...prev, [product._id]: true }))
      setTimeout(() => setShowCheck((prev) => ({ ...prev, [product._id]: false })), 2000)
    }, 200)
  }

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % Math.max(1, products.length - 4))
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + Math.max(1, products.length - 4)) % Math.max(1, products.length - 4))

  return (
    <div className={`${bgColor} rounded-lg p-3 md:p-6 relative shadow-xs hover:shadow-sm transition-shadow duration-300`}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h2 className="text-xl md:text-2xl font-bold">
          {isArabic ? (
            <>
              <span className="text-red-600">{arTitle.split(" ")[0]}</span>{" "}
              {arTitle.split(" ").slice(1).join(" ")}
            </>
          ) : (
            <>
              <span className="text-red-600">{title.split(" ")[0]}</span>{" "}
              {title.split(" ").slice(1).join(" ")}
            </>
          )}
        </h2>
        <div className="flex gap-2 self-end md:self-center">
          <Button variant="outline" size="icon" onClick={prevSlide} disabled={currentIndex === 0}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextSlide} disabled={currentIndex >= products.length - 4}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="overflow-hidden">
        <div
          className="flex gap-4 transition-transform duration-300"
          style={{ transform: `translateX(-${currentIndex * 272}px)` }}
        >
          {products.map((product) => (
            <CarouselProductCard
              key={product._id}
              product={product}
              type={type}
              isArabic={isArabic}
              addToCart={addToCart}
              addLoading={addLoading}
              showCheck={showCheck}
              products={products}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
