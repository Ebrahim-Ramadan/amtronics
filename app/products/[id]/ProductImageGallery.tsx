"use client"

import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useState, useEffect, useRef } from "react"

interface ProductImageGalleryProps {
  image: string | null | undefined
  ar_name: string
  en_name: string
  isArabic: boolean
  discount?: number
}

export default function ProductImageGallery({
  image,
  ar_name,
  en_name,
  isArabic,
  discount,
}: ProductImageGalleryProps) {
  const images = image
    ? image.split(",").map(url => url.trim()).filter(url => url)
    : ["/placeholder.svg?height=500&width=500"];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);
  const [isSliding, setIsSliding] = useState(false);
  const [nextImageIndex, setNextImageIndex] = useState<number | null>(null);
  const [arrowHover, setArrowHover] = useState<{ left: boolean; right: boolean }>({ left: false, right: false });
  const sliderRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!sliderRef.current) return;
      const rect = sliderRef.current.getBoundingClientRect();
      const proximity = 40;
      setArrowHover({
        left: e.clientX - rect.left < proximity,
        right: e.clientX - rect.left > rect.width - proximity,
      });
    };
    const handleMouseLeave = () => setArrowHover({ left: false, right: false });
    const slider = sliderRef.current;
    if (slider) {
      slider.addEventListener("mousemove", handleMouseMove);
      slider.addEventListener("mouseleave", handleMouseLeave);
    }
    return () => {
      if (slider) {
        slider.removeEventListener("mousemove", handleMouseMove);
        slider.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, []);

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

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current !== null && touchEndX.current !== null) {
      const diff = touchStartX.current - touchEndX.current;
      if (Math.abs(diff) > 50) {
        if (diff > 0) handleNextImage();
        else handlePrevImage();
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const renderImage = (index: number, transitionClass: string) => (
    <div
      key={index}
      className={`absolute inset-0 w-full h-fit transition-all duration-400 ${transitionClass}`}
      style={{ willChange: isSliding ? 'transform' : undefined }}
    >
      <Image
        src={images[index]}
        alt={isArabic ? `${ar_name} - صورة ${index + 1}` : `${en_name} - Image ${index + 1}`}
        width={500}
        height={500}
        className="w-full h-auto object-contain"
        priority
        quality={100}
      />
    </div>
  );

  return (
    <div className="relative group">
      <div
        ref={sliderRef}
        className="relative overflow-hidden h-[320px] md:h-[500px]"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="relative w-full h-fit">
          {renderImage(
            currentImageIndex,
            isSliding && nextImageIndex !== null
              ? slideDirection === 'right'
                ? 'z-10 animate-slide-out-left'
                : 'z-10 animate-slide-out-right'
              : 'z-20'
          )}
          {isSliding && nextImageIndex !== null && renderImage(
            nextImageIndex,
            slideDirection === 'right'
              ? 'z-20 animate-slide-in-right'
              : 'z-20 animate-slide-in-left'
          )}
        </div>

        {images.length > 1 && (
          <>
            <button
              className={`hidden md:block absolute top-1/2 left-2 transform -translate-y-1/2 border border-neutral-100 backdrop-blur-xl bg-white/80 hover:bg-yellow-400 rounded-full p-1 transition-all duration-300 z-30 ${
                arrowHover.left ? 'scale-110 bg-yellow-400 text-black shadow-lg' : ''
              }`}
              onClick={handlePrevImage}
              onMouseEnter={() => setArrowHover((prev) => ({ ...prev, left: true }))}
              onMouseLeave={() => setArrowHover((prev) => ({ ...prev, left: false }))}
              style={{ pointerEvents: isSliding ? 'none' : 'auto' }}
              aria-label={isArabic ? "الصورة السابقة" : "Previous image"}
            >
              <ChevronLeft className={`h-6 w-6 ${arrowHover.left ? 'scale-110' : ''}`} />
            </button>
            <button
              className={`hidden md:block absolute top-1/2 right-2 transform -translate-y-1/2 border border-neutral-100 backdrop-blur-xl bg-white/80 hover:bg-yellow-400 rounded-full p-1 transition-all duration-300 z-30 ${
                arrowHover.right ? 'scale-110 bg-yellow-400 text-black shadow-lg' : ''
              }`}
              onClick={handleNextImage}
              onMouseEnter={() => setArrowHover((prev) => ({ ...prev, right: true }))}
              onMouseLeave={() => setArrowHover((prev) => ({ ...prev, right: false }))}
              style={{ pointerEvents: isSliding ? 'none' : 'auto' }}
              aria-label={isArabic ? "الصورة التالية" : "Next image"}
            >
              <ChevronRight className={`h-6 w-6 ${arrowHover.right ? 'scale-110' : ''}`} />
            </button>
          </>
        )}
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

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto p-2" style={{ direction: isArabic ? "rtl" : "ltr" }}>
          {images.map((url, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={`flex-shrink-0 focus:outline-none rounded-md ${
                index === currentImageIndex ? "ring-2 ring-blue-500" : "hover:opacity-80"
              } transition-opacity`}
              aria-label={
                isArabic
                  ? `عرض صورة ${index + 1} لـ ${ar_name}`
                  : `View image ${index + 1} of ${en_name}`
              }
            >
              <Image
                src={url}
                alt={
                  isArabic
                    ? `${ar_name} - صورة ${index + 1}`
                    : `${en_name} - Image ${index + 1}`
                }
                width={10}
                height={10}
                quality={10}
                priority={false}
                className="w-10 h-10 object-cover rounded-md"
              />
            </button>
          ))}
        </div>
      )}

      {discount && discount > 0 && (
        <Badge
          className="absolute top-4 left-4 bg-red-500 text-white"
          aria-label={isArabic ? `خصم ${discount}%` : `${discount}% off`}
        >
          -{discount}%
        </Badge>
      )}
    </div>
  );
}