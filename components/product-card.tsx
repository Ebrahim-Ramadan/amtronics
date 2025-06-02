"use client"

import Image from "next/image"
import Link from "next/link"
import {  Star,  CheckCheck, Heart, HeartPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import type { Product } from "@/lib/types"
import { useCart } from "@/lib/context"
import { toast } from "sonner"
import { useState } from "react"
import { useWishlist } from "@/lib/wishlist-context"

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { state, dispatch } = useCart()
  const { state: wishlistState, dispatch: wishlistDispatch } = useWishlist()
  const isArabic = state.language === "ar"
  const [showCheck, setShowCheck] = useState(false)
  const [addToCartLoading, setAddToCartLoading] = useState(false)

  const addToCart = () => {
    setAddToCartLoading(true)
    setShowCheck(false)
    setTimeout(() => {
      dispatch({ type: "ADD_ITEM", payload: product })
      toast.success(isArabic ? "تمت الإضافة إلى السلة" : "Added to cart")
      setAddToCartLoading(false)
      setShowCheck(true)
      setTimeout(() => setShowCheck(false), 2000)
    }, 200)
  }

  const isWishlisted = wishlistState.items.some(item => item._id === product._id)

  const toggleWishlist = () => {
    if (isWishlisted) {
      wishlistDispatch({ type: "REMOVE_ITEM", payload: product._id })
      toast.info(isArabic ? "تمت الإزالة من قائمة الرغبات" : "Removed from wishlist")
    } else {
      wishlistDispatch({ type: "ADD_ITEM", payload: product })
      toast.success(isArabic ? "تمت الإضافة إلى قائمة الرغبات" : "Added to wishlist")
    }
  }

  const discountedPrice = product.discount ? product.price - product.price * (product.discount / 100) : product.price

  return (
    <Card className="group hover:shadow-md transition-shadow duration-300">
      <div className="relative overflow-hidden">
        <Link href={`/products/${product._id}`}>
          <Image
            src={(product.image && product.image.split(',')[0]) || "/placeholder.svg?height=250&width=250"}
            alt={isArabic ? product.ar_name : product.en_name}
            width={250}
            height={250}
            className="w-full h-48 object-contain group-hover:scale-105 transition-transform duration-300"
          />
        </Link>
        {product.discount && <Badge className="absolute top-2 left-2 bg-red-500">-{product.discount}%</Badge>}
        {product.quantity_on_hand === 0 && (
          <Badge variant="secondary" className="absolute top-2 right-2">
            {isArabic ? "نفذ المخزون" : "Out of Stock"}
          </Badge>
        )}
      </div>

      <CardContent className="p-2">
        <Link href={`/products/${product._id}`}>
          <h3 className="font-semibold text-lg line-clamp-1 leading-6 hover:text-blue-600 transition-colors">
            {isArabic ? product.ar_name : product.en_name}
          </h3>
        </Link>
        <p className="text-gray-600 text-sm  line-clamp-2">
          {isArabic ? product.ar_description : product.en_description}
        </p>

        <div className="flex items-center gap-2 mb-1">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`h-2 w-2 ${i < 4 ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
            ))}
          </div>
          <span className="text-sm text-gray-500">
            ({product.sold_quantity} {isArabic ? "مبيع" : "sold"})
          </span>
        </div>

        <div className="flex items-center gap-2">
          {product.discount ? (
            <>
              <span className="text-2xl font-bold text-green-600">
                {discountedPrice.toFixed(2)} <span className="text-sm">{isArabic ? "د.ك" : "KD"}</span>
              </span>
              <span className="text-sm text-gray-500 line-through">
                {product.price.toFixed(2)} <span className="text-sm">{isArabic ? "د.ك" : "KD"}</span>
              </span>
            </>
          ) : (
            <span className="text-2xl font-bold">
              {product.price.toFixed(2)} <span className="text-sm">{isArabic ? "د.ك" : "KD"}</span>
            </span>
          )}
          <Button
            variant="ghost"
            size="icon"
            className={`hover:bg-[#FEEE00]  ml-auto ${isWishlisted ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
            onClick={toggleWishlist}
            aria-label={isArabic ? (isWishlisted ? "إزالة من قائمة الرغبات" : "أضف إلى قائمة الرغبات") : (isWishlisted ? "Remove from wishlist" : "Add to wishlist")}
          >
            <HeartPlus className={`h-6 w-6 fill-current ${isWishlisted ? '' : 'fill-transparent'}`} />
          </Button>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button onClick={addToCart} className="w-full" disabled={product.quantity_on_hand === 0 || addToCartLoading}>
          {!addToCartLoading && !showCheck &&
            <Image
            src='/quick-atc-add-to-cart-grey.svg'
            width={20}
            height={20}
            alt="Add to Cart"
            />
          }
          {addToCartLoading ? (
            <span className="h-4 w-4 mr-2 animate-spin border-2 border-gray-300 border-t-transparent rounded-full inline-block align-middle"></span>
          ) : showCheck ? (
            <><CheckCheck className="h-4 w-4 mr-2 text-green-500" />{isArabic ? "تمت الإضافة" : "Added"}</>
          ) : (
            isArabic ? "أضف للسلة" : "Add to Cart"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
