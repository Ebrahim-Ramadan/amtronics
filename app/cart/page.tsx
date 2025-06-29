"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Trash2, Plus, Minus, CheckCircle, HeartPlus, Trash, XIcon, CheckCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { useCart } from "@/lib/context"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { useWishlist } from "@/lib/wishlist-context"
import type { Product } from "@/lib/types"
import { EmptyCart } from "@/components/empty-cart"

const policyItems = {
  en: [
    // "Free shipping on orders over 50 KD",
    "Secure payment guaranteed",
    "30-day return policy",
  ],
  ar: [
    // "الشحن المجاني للطلبات فوق 50 د.ك",
    "الدفع الآمن مضمون",
    "سياسة الإرجاع خلال 30 يومًا",
  ],
};

export default function CartPage() {
  const { state, dispatch } = useCart()
  const [promoCode, setPromoCode] = useState("")
  const [promoError, setPromoError] = useState("")
  const [isApplyingPromo, setIsApplyingPromo] = useState(false)
  const isArabic = state.language === "ar"
  const dir = isArabic ? "rtl" : "ltr"

  const { state: wishlistState, dispatch: wishlistDispatch } = useWishlist()

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


  const subtotal = state.total
  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0)

  const toggleWishlist = (product: Product) => {
    const isWishlisted = wishlistState.items.some(item => item._id === product._id)
    if (isWishlisted) {
      wishlistDispatch({ type: "REMOVE_ITEM", payload: product._id })
      toast.info(isArabic ? "تمت الإزالة من قائمة الرغبات" : "Removed from wishlist")
    } else {
      wishlistDispatch({ type: "ADD_ITEM", payload: product })
      toast.success(isArabic ? "تمت الإضافة إلى قائمة الرغبات" : "Added to wishlist")
    }
  }
console.log('state.items', state.items)

  if (state.items.length === 0) {
    return (
      <EmptyCart isArabic={isArabic} />
    )
  }

  return (
    <div className="container mx-auto px-2 md:px-4 py-8" dir={dir}>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">{isArabic ? "سلة التسوق" : "Shopping Cart"}</h1>
        <Badge variant="secondary" className="text-sm">
          ({isArabic ? `${itemCount} عناصر` : `${itemCount} Items`})
        </Badge>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-6">
          {state.items.map((item) => (
            <Card key={item.product._id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="relative h-32 w-full md:w-32">
                    <Image
                      src={item.product.image.split(',')[0] || "/placeholder.svg?height=128&width=128"}
                      alt={isArabic ? item.product.ar_name : item.product.en_name}
                      fill
                      className="rounded-lg object-contain"
                      sizes="(max-width: 640px) 100vw, 128px"
                      priority
                    />
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleWishlist(item.product)}
                        className={`hover:bg-[#FEEE00] border-neutral-100 border-1 backdrop-blur-xl rounded-full w-fit absolute -top-2 -right-2 text-gray-500 hover:text-red-500 ${wishlistState.items.some(wishlistItem => wishlistItem._id === item.product._id) ? 'text-red-500' : ''}`}
                        aria-label={isArabic ? (wishlistState.items.some(wishlistItem => wishlistItem._id === item.product._id) ? "إزالة من قائمة الرغبات" : "أضف إلى قائمة الرغبات") : (wishlistState.items.some(wishlistItem => wishlistItem._id === item.product._id) ? "Remove from wishlist" : "Add to wishlist")}
                      >
                        <HeartPlus className={`h-5 w-5 ${wishlistState.items.some(wishlistItem => wishlistItem._id === item.product._id) ? 'fill-red-500' : 'fill-transparent'}`} />
                      </Button>
                  </div>

                  <div className="flex-1 space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {isArabic ? item.product.ar_name : item.product.en_name}
                      </h3>

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
                        className="block md:hidden text-red-600 hover:text-red-700"
                        aria-label={isArabic ? "إزالة المنتج" : "Remove product"}
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                      
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-between">
                  <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.product._id)}
                        className="hidden md:block bg-neutral-50 rounded-full text-red-600 hover:text-red-700"
                        aria-label={isArabic ? "إزالة المنتج" : "Remove product"}
                      >
                        <XIcon className="h-5 w-5" />
                      </Button>
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
          <Card className="shadow-lg gap-2 md:gap-4 border-2 border-[#FEEE00]">
            <CardHeader>
              <p className="text-lg font-semibold">{isArabic ? "ملخص الطلب" : "Order Summary"}</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Promo Code */}
              

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
                <div className="flex justify-between text-lg font-bold pt-4 border-t">
                  <span>{isArabic ? "المجموع الكلي" : "Total"}</span>
                  <span>
                    {subtotal.toFixed(2)} {isArabic ? "د.ك" : "KD"}
                  </span>
                </div>
              </div>

              <Link href="/checkout" className="block">
                <Button
                  className="w-full h-12 text-base font-semibold bg-[#0F172B] hover:bg-primary/90 transition-colors"
                  size="lg"
                >
                  <Image
                  src="/payment_menu_icon.svg"
                  alt={isArabic ? "إتمام الطلب" : "Proceed to Checkout"}
                  width={20}    
                  height={20}
                  />
                  {isArabic ? "إتمام الطلب" : "Proceed to Checkout"}
                </Button>
              </Link>
            </CardContent>
          </Card>

        {/* Additional Info */}
<div className="my-4 text-sm text-neutral-600 space-y-2">
  {policyItems[isArabic ? 'ar' : 'en'].map((item, index) => (
    <div className="flex gap-2 text-sm sm:truncate" key={index}>
      <CheckCircle color="green" size="16" />
      {item}
    </div>
  ))}
</div>
        </div>
      </div>
    </div>
  )
}