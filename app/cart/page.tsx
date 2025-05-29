"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Trash2, Plus, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useCart } from "@/lib/context"

export default function CartPage() {
  const { state, dispatch } = useCart()
  const [promoCode, setPromoCode] = useState("")
  const [discount, setDiscount] = useState(0)
  const [promoError, setPromoError] = useState("")
  const isArabic = state.language === "ar"

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      dispatch({ type: "REMOVE_ITEM", payload: productId })
    } else {
      dispatch({ type: "UPDATE_QUANTITY", payload: { productId, quantity } })
    }
  }

  const removeItem = (productId: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: productId })
  }

  const applyPromoCode = async () => {
    try {
      const response = await fetch("/api/promo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoCode }),
      })

      if (response.ok) {
        const promo = await response.json()
        setDiscount(promo.percentage)
        setPromoError("")
      } else {
        const error = await response.json()
        setPromoError(error.error)
        setDiscount(0)
      }
    } catch (error) {
      setPromoError(isArabic ? "خطأ في التحقق من الكود" : "Error validating promo code")
    }
  }

  const subtotal = state.total
  const discountAmount = (subtotal * discount) / 100
  const total = subtotal - discountAmount

  if (state.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold mb-4">{isArabic ? "سلة التسوق فارغة" : "Your cart is empty"}</h1>
          <p className="text-gray-600 mb-8">
            {isArabic ? "ابدأ التسوق لإضافة منتجات إلى سلتك" : "Start shopping to add items to your cart"}
          </p>
          <Link href="/products">
            <Button size="lg">{isArabic ? "تسوق الآن" : "Shop Now"}</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{isArabic ? "سلة التسوق" : "Shopping Cart"}</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {state.items.map((item) => (
            <Card key={item.product._id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Image
                    src={item.product.image || "/placeholder.svg?height=80&width=80"}
                    alt={isArabic ? item.product.ar_name : item.product.en_name}
                    width={80}
                    height={80}
                    className="rounded object-cover"
                  />

                  <div className="flex-1">
                    <h3 className="font-semibold">{isArabic ? item.product.ar_name : item.product.en_name}</h3>
                    <p className="text-gray-600 text-sm">
                      {item.product.price.toFixed(2)} {isArabic ? "د.ك" : "KD"}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold">
                      {(item.product.price * item.quantity).toFixed(2)} {isArabic ? "د.ك" : "KD"}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.product._id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? "ملخص الطلب" : "Order Summary"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Promo Code */}
              <div>
                <div className="flex gap-2">
                  <Input
                    placeholder={isArabic ? "كود الخصم" : "Promo code"}
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                  />
                  <Button onClick={applyPromoCode} variant="outline">
                    {isArabic ? "تطبيق" : "Apply"}
                  </Button>
                </div>
                {promoError && <p className="text-red-600 text-sm mt-1">{promoError}</p>}
                {discount > 0 && (
                  <p className="text-green-600 text-sm mt-1">
                    {isArabic ? `خصم ${discount}% مطبق` : `${discount}% discount applied`}
                  </p>
                )}
              </div>

              {/* Totals */}
              <div className="space-y-2 pt-4 border-t">
                <div className="flex justify-between">
                  <span>{isArabic ? "المجموع الفرعي" : "Subtotal"}</span>
                  <span>
                    {subtotal.toFixed(2)} {isArabic ? "د.ك" : "KD"}
                  </span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>{isArabic ? "الخصم" : "Discount"}</span>
                    <span>
                      -{discountAmount.toFixed(2)} {isArabic ? "د.ك" : "KD"}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>{isArabic ? "المجموع" : "Total"}</span>
                  <span>
                    {total.toFixed(2)} {isArabic ? "د.ك" : "KD"}
                  </span>
                </div>
              </div>

              <Link href="/checkout" className="block">
                <Button className="w-full" size="lg">
                  {isArabic ? "إتمام الطلب" : "Proceed to Checkout"}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
