
"use client"

import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"

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

  // State for selected primary image
  const [selectedImage, setSelectedImage] = useState(imageUrls[0])

  return (
    <div className="relative">
      {/* Primary Image */}
      <Image
        src={selectedImage}
        alt={isArabic ? `${ar_name} - صورة 1` : `${en_name} - Image 1`}
        width={500}
        height={500}
        className="w-full h-auto rounded-lg"
        priority
      />
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
                width={100}
                height={100}
                className="w-10 h-10 object-cover rounded-md"
              />
            </button>
          ))}
        </div>
      )}
      {discount !=0 && (
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
