"use client"

import Link from "next/link"
import { CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useCart } from "@/lib/context"

export default function OrderSuccessPage() {
  const { state } = useCart()
  const isArabic = state.language === "ar"

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl">{isArabic ? "تم تأكيد طلبك!" : "Order Confirmed!"}</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              {isArabic
                ? "شكراً لك! تم استلام طلبك وسيتم التواصل معك قريباً لتأكيد التوصيل."
                : "Thank you! Your order has been received and we will contact you soon to confirm delivery."}
            </p>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">{isArabic ? "تفاصيل التوصيل" : "Delivery Details"}</h3>
              <p className="text-sm text-gray-600">
                {isArabic ? "سيتم التوصيل خلال 1-3 أيام عمل" : "Delivery within 1-3 business days"}
              </p>
              <p className="text-sm text-gray-600">
                {isArabic ? "الدفع: نقداً عند التسليم" : "Payment: Cash on Delivery"}
              </p>
            </div>

            <div className="space-y-2">
              <Link href="/products" className="block">
                <Button className="w-full">{isArabic ? "متابعة التسوق" : "Continue Shopping"}</Button>
              </Link>
              <Link href="/" className="block">
                <Button variant="outline" className="w-full">
                  {isArabic ? "العودة للرئيسية" : "Back to Home"}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
