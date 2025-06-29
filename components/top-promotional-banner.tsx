"use client"

import { X } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/context"

export default function TopPromotionalBanner() {
  const { state } = useCart()
  const [isVisible, setIsVisible] = useState(true)
  const isArabic = state.language === "ar"

  if (!isVisible) return null

  return (
    <div className="bg-[#091638]/90 text-white py-1 md:py-2 relative">
      <div className="container mx-auto px-2 md:px-4 flex items-center md:justify-center">
        <div className="text-center">
          <p className="font-bold text-sm md:text-lg">
            {isArabic ? "🎉 عرض خاص: خصم 30% على جميع أطقم المختبر!" : "🎉 Special Offer: 30% OFF All Lab Kits!"}
          </p>
          <p className="text-xs md:text-sm opacity-90">
            {isArabic ? "استخدم كود: LAB30 - لفترة محدودة" : "Use code: LAB30 - Limited time only"}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 md:right-4 text-white hover:bg-white/20"
          onClick={() => setIsVisible(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
