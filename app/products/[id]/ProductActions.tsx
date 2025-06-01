"use client"

import { useState } from "react"
import { ShoppingCart, CheckCheck, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/context"
import type { Product } from "@/lib/types"
import { useRouter } from "next/navigation"
import LoadingDots from "@/components/ui/loading-spinner"
import { toast } from "sonner"
import Image from "next/image"
import { useWishlist } from "@/lib/wishlist-context"

interface ProductActionsProps {
  product: Product
  isArabic: boolean
}

export default function ProductActions({ product, isArabic }: ProductActionsProps) {
  const { dispatch } = useCart()
  const { state: wishlistState, dispatch: wishlistDispatch } = useWishlist()
  const [quantity, setQuantity] = useState(1)
  const [shopNowLoading, setShopNowLoading] = useState(false)
  const [addToCartLoading, setAddToCartLoading] = useState(false)
  const [showCheck, setShowCheck] = useState(false)
  const router = useRouter()

  // Treat quantity_on_hand as Infinity if null to allow unlimited purchases
  const availableStock = product.quantity_on_hand ?? Infinity

  const addToCart = () => {
    setAddToCartLoading(true)
    setShowCheck(false)
    setTimeout(() => {
      for (let i = 0; i < quantity; i++) {
        dispatch({ type: "ADD_ITEM", payload: product })
      }
      toast.success(isArabic ? "تمت إضافة المنتج إلى السلة" : "Product Added to Cart")
      setAddToCartLoading(false)
      setShowCheck(true)
      setTimeout(() => setShowCheck(false), 1000)
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

  const handleShopNow = async () => {
    setShopNowLoading(true)
    for (let i = 0; i < quantity; i++) {
      dispatch({ type: "ADD_ITEM", payload: product })
    }
    toast.success(isArabic ? "تمت إضافة المنتج إلى السلة" : "Product Added to Cart")
    router.push("/checkout")
  }

  const isOutOfStock = availableStock === 0
  const isQuantityMaxed = quantity >= availableStock
  const isLoading = shopNowLoading || addToCartLoading

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <label className="font-medium" htmlFor="quantity-input">
          {isArabic ? "الكمية:" : "Quantity:"}
        </label>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={isLoading}
            aria-label={isArabic ? "تقليل الكمية" : "Decrease quantity"}
          >
            -
          </Button>
          <span className="w-12 text-center" id="quantity-input">
            {quantity}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setQuantity(quantity + 1)}
            disabled={isQuantityMaxed || isLoading}
            aria-label={isArabic ? "زيادة الكمية" : "Increase quantity"}
          >
            +
          </Button>
        </div>
      </div>

      <div className="flex gap-2 w-full flex-col md:flex-row justify-center">
        <Button
          onClick={addToCart}
          size="lg"
          className="md:flex-1"
          disabled={isOutOfStock || isLoading}
          aria-label={isArabic ? "أضف إلى السلة" : "Add to Cart"}
        >
          {addToCartLoading ? (
            <LoadingDots aria-label={isArabic ? "جارٍ إضافة المنتج" : "Adding product"} />
          ) : showCheck ? (
            <>
              <CheckCheck className="h-5 w-5 text-white" />
              {isArabic ? "تمت الإضافة" : "Added"}
            </>
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
          onClick={handleShopNow}
          size="lg"
          className="md:flex-1 flex items-center justify-center"
          disabled={isOutOfStock || isLoading}
          aria-label={isArabic ? "اشتري الآن" : "Buy Now"}
        >
          {shopNowLoading ? (
            <LoadingDots aria-label={isArabic ? "جارٍ الانتقال إلى الدفع" : "Proceeding to checkout"} />
          ) : isArabic ? (
            "اشتري الآن"
          ) : (
            "Buy Now"
          )}
        </Button>
        <Button
          variant="outline"
          size="lg"
          className={`md:flex-1 ${isWishlisted ? 'text-red-500 border-red-500 hover:text-red-600' : 'text-gray-500 hover:text-red-500'}`}
          onClick={toggleWishlist}
          disabled={isLoading}
          aria-label={isArabic ? (isWishlisted ? "إزالة من قائمة الرغبات" : "أضف إلى قائمة الرغبات") : (isWishlisted ? "Remove from wishlist" : "Add to wishlist")}
        >
          <Heart className={`h-5 w-5 mr-2 fill-current ${isWishlisted ? '' : 'fill-transparent'}`} />
          {isArabic ? "قائمة الرغبات" : "Wishlist"}
        </Button>
      </div>
    </div>
  )
}