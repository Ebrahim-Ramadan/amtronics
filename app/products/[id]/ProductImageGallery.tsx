"use client"

import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

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
  console.log('discount', discount)
  
  // Parse image URLs
  const imageUrls = image
    ? image.split(",").map(url => url.trim()).filter(url => url)
    : ["/placeholder.svg?height=500&width=500"]

  // State for selected primary image index
  const [currentIndex, setCurrentIndex] = useState(0)

  // Update selected image based on index
  useEffect(() => {
    setSelectedImage(imageUrls[currentIndex]);
  }, [currentIndex, imageUrls]);

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? imageUrls.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === imageUrls.length - 1 ? 0 : prevIndex + 1
    );
  };

  // State for selected primary image (keeping this for consistency with the return block for now)
  const [selectedImage, setSelectedImage] = useState(imageUrls[0])

  return (
    <div className="relative group">
      {/* Primary Image */}
      <Image
        src={selectedImage}
        alt={isArabic ? `${ar_name} - صورة 1` : `${en_name} - Image 1`}
        width={500}
        height={500}
        className="w-full h-auto rounded-lg shadow-sm"
        priority
      />

      {/* Navigation Buttons */}
      {imageUrls.length > 1 && (
        <>
          <button
            className="cursor-pointer absolute left-2 top-9/20 transform -translate-y-1/2 bg-white bg-opacity-50 rounded-full p-1 shadow-md opacity-0 backdrop-blur-xl hover:bg-[#FEEE00]/90 group-hover:opacity-100 transition-all z-10"
            onClick={handlePrevious}
            aria-label={isArabic ? "الصورة السابقة" : "Previous image"}
          >
            <ChevronLeft className="h-6 w-6 text-gray-800" />
          </button>
          <button
            className="cursor-pointer absolute right-2 top-9/20 transform -translate-y-1/2 bg-white bg-opacity-50 rounded-full p-1 shadow-md opacity-0 backdrop-blur-xl hover:bg-[#FEEE00]/90 group-hover:opacity-100 transition-all z-10"
            onClick={handleNext}
            aria-label={isArabic ? "الصورة التالية" : "Next image"}
          >
            <ChevronRight className="h-6 w-6 text-gray-800" />
          </button>
        </>
      )}

      {/* Thumbnails */}
      {imageUrls.length > 1 && (
        <div
          className="flex gap-2  overflow-x-auto p-2"
          style={{ direction: isArabic ? "rtl" : "ltr" }}
        >
          {imageUrls.map((url, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(url)}
              className={`flex-shrink-0 focus:outline-none rounded-md ${
                url === selectedImage ? "ring-2 ring-blue-500" : "hover:opacity-80"
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
      {discount && (
        <Badge
          className="absolute top-4 left-4 bg-red-500 text-white"
          aria-label={isArabic ? `خصم ${discount}%` : `${discount}% off`}
        >
          -{discount}%
        </Badge>
      )}
    </div>
  )
}
