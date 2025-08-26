"use client"

import { useCart } from "@/lib/context"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function PromotionalBanner() {
  const { state } = useCart()
  const isArabic = state.language === "ar"

  return (
    <div className="bg-gradient-to-r from-gray-900 to-gray-700 text-white py-4 mb-6 rounded-lg">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-bold">
            {isArabic ? "عرض خاص" : "SPECIAL OFFER"}
          </div>
          <div>
            <h3 className="font-bold text-lg">{isArabic ? "خصم 25% على جميع أطقم المختبر" : "25% OFF All Lab Kits"}</h3>
            <p className="text-sm opacity-90">
              {isArabic ? "لفترة محدودة - استخدم كود: LAB25" : "Limited time - Use code: LAB25"}
            </p>
          </div>
        </div>
        <Link href="/products?category=Kits" prefetch={false}>
          <Button variant="secondary" className="bg-yellow-400 text-black hover:bg-yellow-300">
            {isArabic ? "تسوق الآن" : "Shop Now"}
          </Button>
        </Link>
      </div>
    </div>
  )
}
