"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/context"

type Offer = {
  _id: string
  offerDescription: string
  offerText: string
  ar_offerDescription?: string
  ar_offerText?: string
  active: boolean
}

export default function TopPromotionalBanner() {
  const { state } = useCart()
  const [isVisible, setIsVisible] = useState(true)
  const [offer, setOffer] = useState<Offer | null>(null)
  const isArabic = state.language === "ar"

  useEffect(() => {
    async function fetchOffer() {
      const res = await fetch("/api/offers", { cache: "no-store" })
      if (res.ok) {
        const data = await res.json()
        // If you expect only one active offer, use data[0]
        console.log('data[0]', data[0]);
        
        setOffer(Array.isArray(data) ? data[0] : data)
      }
    }
    fetchOffer()
  }, [])

  if (!isVisible || !offer || !offer.active) return null

  return (
    <div className="bg-[#091638]/90 text-white py-1 md:py-2 relative">
      <div className="container mx-auto px-2 md:px-4 flex items-center md:justify-center">
        <div className="text-center">
          <p className="font-bold text-sm md:text-lg">
            {isArabic ? offer.ar_offerText : offer.offerText}
          </p>
          <p className="text-xs md:text-sm opacity-90">
            {isArabic ? offer.ar_offerDescription : offer.offerDescription}
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
