"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Trash2, Plus, Minus, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useCart } from "@/lib/context"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

export default function CartPage() {
  const { state, dispatch } = useCart()
  const [promoCode, setPromoCode] = useState("")
  const [discount, setDiscount] = useState(0)
  const [promoError, setPromoError] = useState("")
  const [isApplyingPromo, setIsApplyingPromo] = useState(false)
  const isArabic = state.language === "ar"
  const dir = isArabic ? "rtl" : "ltr"

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) {
      const confirmMessage = isArabic 
      ? "هل أنت متأكد من إزالة هذا المنتج من السلة؟" 
      : "Are you sure you want to remove this item from the cart?"
    console.log(confirmMessage)
    if (confirm(confirmMessage)) {

      dispatch({ type: "REMOVE_ITEM", payload: productId })
      toast.info('Item Removed')
    }

    } else if (quantity > 99) {
      toast.info("Maximum Quantity")
    } else {
      dispatch({ type: "UPDATE_QUANTITY", payload: { productId, quantity } })
      toast.info("Quantity Updated")
    }
  }

  const removeItem = (productId: string) => {
    const confirmMessage = isArabic 
      ? "هل أنت متأكد من إزالة هذا المنتج من السلة؟" 
      : "Are you sure you want to remove this item from the cart?"
    
    if (confirm(confirmMessage)) {
      dispatch({ type: "REMOVE_ITEM", payload: productId })
      toast.info("Item Removed")
    }
  }

  const applyPromoCode = async () => {
    if (!promoCode) {
      setPromoError(isArabic ? "الرجاء إدخال كود خصم" : "Please enter a promo code")
      return
    }
    setIsApplyingPromo(true)
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
        toast.info("Discount Applied")
      } else {
        const error = await response.json()
        setPromoError(error.error)
        setDiscount(0)
      }
    } catch (error) {
      setPromoError(isArabic ? "خطأ في التحقق من الكود" : "Error validating promo code")
    } finally {
      setIsApplyingPromo(false)
    }
  }

  const subtotal = state.total
  const discountAmount = (subtotal * discount) / 100
  const total = subtotal - discountAmount
  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0)

  if (state.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-[60vh] flex items-center justify-center">
        <div className="text-center py-12 space-y-6">
          <ShoppingCart className="mx-auto h-16 w-16 text-gray-400" />
          <h1 className="text-3xl font-bold">{isArabic ? "سلة التسوق فارغة" : "Your Cart is Empty"}</h1>
          <p className="text-gray-600 max-w-md mx-auto">
            {isArabic 
              ? "ابدأ التسوق الآن لإضافة منتجات رائعة إلى سلتك!"
              : "Start shopping now to add amazing products to your cart!"}
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/products">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                {isArabic ? "تسوق الآن" : "Shop Now"}
              </Button>
            </Link>
            <Link href="/">
              <Button size="lg" variant="outline">
                {isArabic ? "العودة إلى الرئيسية" : "Return to Home"}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8" dir={dir}>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">{isArabic ? "سلة التسوق" : "Shopping Cart"}</h1>
        <Badge variant="secondary" className="text-sm">
          {isArabic ? `${itemCount} عناصر` : `${itemCount} Items`}
        </Badge>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-6">
          {state.items.map((item) => (
            <Card key={item.product._id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="relative h-32 w-32">
                    <Image
                      src={item.product.image || "/placeholder.svg?height=128&width=128"}
                      alt={isArabic ? item.product.ar_name : item.product.en_name}
                      fill
                      className="rounded-lg object-cover"
                      sizes="(max-width: 640px) 100vw, 128px"
                      priority
                    />
                  </div>

                  <div className="flex-1 space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {isArabic ? item.product.ar_name : item.product.en_name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {isArabic ? item.product.ar_description : item.product.en_description}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="font-medium text-primary">
                        {item.product.price.toFixed(2)} {isArabic ? "د.ك" : "KD"}
                      </p>
                      {/* {item.product.stock < 10 && (
                        <Badge variant="destructive">
                          {isArabic ? `متبقي ${item.product.stock} فقط` : `Only ${item.product.stock} left`}
                        </Badge>
                      )} */}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 border rounded-md">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                          aria-label={isArabic ? "تقليل الكمية" : "Decrease quantity"}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.product._id, parseInt(e.target.value) || 1)}
                          className="w-16 text-center h-8 border-none"
                          min={1}
                          max={99}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                          aria-label={isArabic ? "زيادة الكمية" : "Increase quantity"}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.product._id)}
                        className="text-red-600 hover:text-red-700"
                        aria-label={isArabic ? "إزالة المنتج" : "Remove product"}
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold text-lg">
                      {(item.product.price * item.quantity).toFixed(2)} {isArabic ? "د.ك" : "KD"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:sticky lg:top-4">
          <Card className="shadow-lg gap-2 md:gap-4">
            <CardHeader>
              <p className="text-lg font-semibold">{isArabic ? "ملخص الطلب" : "Order Summary"}</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Promo Code */}
              <div>
                <div className="flex gap-2">
                  <Input
                    placeholder={isArabic ? "كود الخصم" : "Promo Code"}
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="h-10"
                    disabled={isApplyingPromo}
                  />
                  <Button 
                    onClick={applyPromoCode} 
                    variant="outline" 
                    className="h-10"
                    disabled={isApplyingPromo}
                  >
                    {isApplyingPromo ? (
                      <span className="animate-pulse">{isArabic ? "جارٍ التطبيق..." : "Applying..."}</span>
                    ) : (
                      <span>{isArabic ? "تطبيق" : "Apply"}</span>
                    )}
                  </Button>
                </div>
                {promoError && (
                  <p className="text-red-600 text-sm mt-2 animate-fade-in">{promoError}</p>
                )}
                {discount > 0 && (
                  <p className="text-green-600 text-sm mt-2 animate-fade-in">
                    {isArabic ? `خصم ${discount}% مطبق` : `${discount}% discount applied`}
                  </p>
                )}
              </div>

              {/* Totals */}
              <div className="space-y-4 pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span>{isArabic ? "المجموع الفرعي" : "Subtotal"}</span>
                  <span>
                    {subtotal.toFixed(2)} {isArabic ? "د.ك" : "KD"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>{isArabic ? "عدد العناصر" : "Items"}</span>
                  <span>{itemCount}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>{isArabic ? "الخصم" : "Discount"}</span>
                    <span>
                      -{discountAmount.toFixed(2)} {isArabic ? "د.ك" : "KD"}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-4 border-t">
                  <span>{isArabic ? "المجموع الكلي" : "Total"}</span>
                  <span>
                    {total.toFixed(2)} {isArabic ? "د.ك" : "KD"}
                  </span>
                </div>
              </div>

              <Link href="/checkout" className="block">
                <Button 
                  className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 transition-colors" 
                  size="lg"
                >
                  {isArabic ? "إتمام الطلب" : "Proceed to Checkout"}
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <div className="mt-4 text-sm text-gray-600 space-y-2">
            <p>{isArabic ? "الشحن المجاني للطلبات فوق 50 د.ك" : "Free shipping on orders over 50 KD"}</p>
            <p>{isArabic ? "الدفع الآمن مضمون" : "Secure payment guaranteed"}</p>
            <p>{isArabic ? "سياسة الإرجاع خلال 30 يومًا" : "30-day return policy"}</p>
          </div>
        </div>
      </div>
    </div>
  )
}