"use client"

import { Suspense } from "react"
import Link from "next/link"
import { CheckCircle, ChevronLeft } from "lucide-react"
import { useCart } from "@/lib/context"
import LoadingDots from "@/components/ui/loading-spinner"
import OrdersList from "./orders-list"

export default function MyOrdersPage() {
  const { state: cartState } = useCart()

  const isArabic = cartState.language === "ar"
  const dir = isArabic ? "rtl" : "ltr"

  return (
    <div className="container mx-auto px-4 py-4 md:py-12" dir={dir}>
      <Link
        href="/"
        className="mb-6 inline-flex items-center text-sm text-neutral-600 transition-colors duration-200 hover:text-[#00B8DB] md:text-base"
      >
        <ChevronLeft className="mr-1 h-5 w-5" />
        {isArabic ? "العودة للرئيسية" : "Back to Home"}
      </Link>
      <div className="mb-4 flex justify-center">
        <CheckCircle className="h-20 w-20 text-green-500 md:h-28 md:w-28" />
      </div>
      <h1 className="mb-4 text-center text-4xl font-bold text-neutral-800 md:mb-6 md:text-5xl">
        {isArabic ? "طلباتي" : "My Orders"}
      </h1>

      <Suspense fallback={<LoadingDots />}>
        <OrdersList />
      </Suspense>
    </div>
  )
}