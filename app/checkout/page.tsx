"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useCart } from "@/lib/context"
import type { CustomerInfo } from "@/lib/types"

export default function CheckoutPage() {
  const { state, dispatch } = useCart()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: "",
    phone: "",
    email: "",
    country: "Kuwait",
    city: "",
    area: "",
    block: "",
    street: "",
    house: "",
  })
  const isArabic = state.language === "ar"

  const handleInputChange = (field: keyof CustomerInfo, value: string) => {
    setCustomerInfo((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const orderData = {
        items: state.items,
        customerInfo,
        total: state.total,
        discount: 0, // You can add discount logic here
        promoCode: "", // Add promo code if applied
      }

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      })

      if (response.ok) {
        dispatch({ type: "CLEAR_CART" })
        router.push("/order-success")
      } else {
        alert(isArabic ? "حدث خطأ في الطلب" : "Error placing order")
      }
    } catch (error) {
      console.error("Error placing order:", error)
      alert(isArabic ? "حدث خطأ في الطلب" : "Error placing order")
    } finally {
      setLoading(false)
    }
  }

  if (state.items.length === 0) {
    router.push("/cart")
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{isArabic ? "إتمام الطلب" : "Checkout"}</h1>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Customer Information Form */}
        <Card>
          <CardHeader>
            <CardTitle>{isArabic ? "معلومات التوصيل" : "Delivery Information"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="mb-1" htmlFor="name">{isArabic ? "الاسم الكامل" : "Full Name"} *</Label>
                  <Input
                    id="name"
                    required
                    value={customerInfo.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    dir={isArabic ? "rtl" : "ltr"}
                  />
                </div>
                <div>
                  <Label className="mb-1" htmlFor="phone">{isArabic ? "رقم الهاتف" : "Phone Number"} *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    required
                    value={customerInfo.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label className="mb-1" htmlFor="email">{isArabic ? "البريد الإلكتروني" : "Email Address"}</Label>
                <Input
                  id="email"
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="mb-1" htmlFor="country">{isArabic ? "الدولة" : "Country"} *</Label>
                  <Input
                    id="country"
                    required
                    value={customerInfo.country}
                    onChange={(e) => handleInputChange("country", e.target.value)}
                    dir={isArabic ? "rtl" : "ltr"}
                  />
                </div>
                <div>
                  <Label className="mb-1" htmlFor="city">{isArabic ? "المدينة" : "City"} *</Label>
                  <Input
                    id="city"
                    required
                    value={customerInfo.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    dir={isArabic ? "rtl" : "ltr"}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="mb-1" htmlFor="area">{isArabic ? "المنطقة" : "Area"} *</Label>
                  <Input
                    id="area"
                    required
                    value={customerInfo.area}
                    onChange={(e) => handleInputChange("area", e.target.value)}
                    dir={isArabic ? "rtl" : "ltr"}
                  />
                </div>
                <div>
                  <Label className="mb-1" htmlFor="block">{isArabic ? "القطعة" : "Block"} *</Label>
                  <Input
                    id="block"
                    required
                    value={customerInfo.block}
                    onChange={(e) => handleInputChange("block", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="mb-1" htmlFor="street">{isArabic ? "الشارع" : "Street"} *</Label>
                  <Input
                    id="street"
                    required
                    value={customerInfo.street}
                    onChange={(e) => handleInputChange("street", e.target.value)}
                    dir={isArabic ? "rtl" : "ltr"}
                  />
                </div>
                <div>
                  <Label className="mb-1" htmlFor="house">{isArabic ? "رقم المنزل" : "House Number"} *</Label>
                  <Input
                    id="house"
                    required
                    value={customerInfo.house}
                    onChange={(e) => handleInputChange("house", e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading
                    ? isArabic
                      ? "جاري إتمام الطلب..."
                      : "Processing Order..."
                    : isArabic
                      ? "تأكيد الطلب - دفع عند التسليم"
                      : "Confirm Order - Cash on Delivery"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle>{isArabic ? "ملخص الطلب" : "Order Summary"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {state.items.map((item) => (
              <div key={item.product._id} className="flex justify-between">
                <span>
                  {isArabic ? item.product.ar_name : item.product.en_name} × {item.quantity}
                </span>
                <span>
                  {(item.product.price * item.quantity).toFixed(2)} {isArabic ? "د.ك" : "KD"}
                </span>
              </div>
            ))}

            <div className="border-t pt-4">
              <div className="flex justify-between text-lg font-bold">
                <span>{isArabic ? "المجموع" : "Total"}</span>
                <span>
                  {state.total.toFixed(2)} {isArabic ? "د.ك" : "KD"}
                </span>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">{isArabic ? "طريقة الدفع" : "Payment Method"}</h3>
              <p className="text-sm text-gray-600">{isArabic ? "الدفع عند التسليم - نقداً" : "Cash on Delivery"}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
