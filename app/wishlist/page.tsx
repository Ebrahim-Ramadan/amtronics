"use client"

import Link from "next/link"
import { Trash2, Heart, ShoppingCart, CheckCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useWishlist } from "@/lib/wishlist-context"
import Image from "next/image"
import { useCart } from "@/lib/context"
import { toast } from "sonner"
import { useState } from "react"
import { Product } from "@/lib/types"

export default function WishlistPage() {
  const { state, dispatch } = useWishlist()
  const { state: cartState, dispatch: cartDispatch } = useCart()
  const isArabic = cartState.language === "ar"

  const removeItem = (productId: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: productId })
  }

  const [showCheck, setShowCheck] = useState<{[key: string]: boolean}>({})
  const [addToCartLoading, setAddToCartLoading] = useState<{[key: string]: boolean}>({})

  const addToCart = (product: Product) => {
    setAddToCartLoading(prevState => ({...prevState, [product._id]: true}))
    setShowCheck(prevState => ({...prevState, [product._id]: false}))
    setTimeout(() => {
      cartDispatch({ type: "ADD_ITEM", payload: product })
      toast.success(isArabic ? "تمت إضافة المنتج إلى السلة" : "Product Added to Cart")
      setAddToCartLoading(prevState => ({...prevState, [product._id]: false}))
      setShowCheck(prevState => ({...prevState, [product._id]: true}))
      setTimeout(() => setShowCheck(prevState => ({...prevState, [product._id]: false})), 2000)
    }, 200)
  }

  if (state.items.length === 0) {
    return (
      <div className="bg-[#FBFAF9] mx-auto px-2 md:px-4 py-8 min-h-[60vh] flex items-center justify-center">
        <div className="text-center py-12 space-y-2 md:space-y-6 flex flex-col items-center justify-center">
        <Image
        src='/empty-wishlist-1.webp'
        width={100}
        height={100}
        alt="My Durves"
        />
          <h1 className="text-xl md:text-3xl font-bold">{isArabic ? "قائمة الرغبات فارغة" : "Your Wishlist is Empty"}</h1>
          <p className="text-xs md:text-sm text-gray-600 max-w-md mx-auto">
            {isArabic
              ? "ابدأ في إضافة المنتجات التي تعجبك إلى قائمة الرغبات لمتابعتها لاحقاً!"
              : "Start adding products you like to your wishlist to keep track of them!"}
          </p>
          <Link href="/products">
            <Button className="bg-primary hover:bg-primary/90 size-sm md:size-lg">
              {isArabic ? "تسوق الآن" : "Shop Now"}
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#FBFAF9] mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{isArabic ? "قائمة الرغبات" : "Wishlist"}</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {state.items.map((item) => (
          <Card key={item._id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center space-y-2">
                <Link href={`/products/${item._id}`}>
                  <Image
                    src={item.image || "/placeholder.svg?height=150&width=150"}
                    alt={isArabic ? item.ar_name : item.en_name}
                    width={150}
                    height={150}
                    className="object-contain rounded-lg"
                  />
                </Link>
                <Link href={`/products/${item._id}`} className="hover:underline">
                  <h3 className="font-semibold text-lg line-clamp-2">
                    {isArabic ? item.ar_name : item.en_name}
                  </h3>
                </Link>
                <p className="text-gray-600 text-sm">
                  {item.price.toFixed(2)} {isArabic ? "د.ك" : "KD"}
                </p>
                <div className="flex w-full gap-2">
                  <Button
                    onClick={() => addToCart(item)}
                    size="sm"
                    className="flex-grow w-3/4"
                    disabled={item.quantity_on_hand === 0 || addToCartLoading[item._id]}
                  >
                    {addToCartLoading[item._id] ? (
                      <span className="h-4 w-4 mr-2 animate-spin border-2 border-gray-300 border-t-transparent rounded-full inline-block align-middle"></span>
                    ) : showCheck[item._id] ? (
                      <><CheckCheck className="h-4 w-4 mr-2 text-green-500" />{isArabic ? "تمت الإضافة" : "Added"}</>
                    ) : (
                      <>
                        <Image
                src="/quick-atc-add-to-cart-grey.svg"
                width={20}
                height={20}
                alt={isArabic ? "أضف إلى السلة" : "Add to Cart"}
              />
                        {isArabic ? "أضف للسلة" : "Add to Cart"}
                      </>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(item._id)}
                    className="text-red-600 hover:text-red-700 w-1/4"
                    aria-label={isArabic ? "إزالة من قائمة الرغبات" : "Remove from wishlist"}
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 