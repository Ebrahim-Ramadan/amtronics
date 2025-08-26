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

  return (
         <Suspense fallback={<div className="flex items-center justify-center w-full"><LoadingDots /></div>}>
        <OrdersList />
      </Suspense>
  )
}