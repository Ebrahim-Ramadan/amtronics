"use client"

import { useState } from "react"
import { ShoppingCart, Check, CheckCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/context"
import type { Product } from "@/lib/types"
import { useRouter } from "next/navigation"
import LoadingDots from "@/components/ui/loading-spinner"
import { toast } from "sonner"
import Image from "next/image"

interface ProductActionsProps {
  product: Product
  isArabic: boolean
}

export default function ProductActions({ product, isArabic }: ProductActionsProps) {
  
  const { dispatch } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [shopNowLoading, setShopNowLoading] = useState(false)
  const [addtoCartLoading, setaddtoCartLoading] = useState(false)
  const [showCheck, setShowCheck] = useState(false)
  const router = useRouter()

  const addToCart = () => {
    setaddtoCartLoading(true)
    setShowCheck(false)
    setTimeout(() => {
      for (let i = 0; i < quantity; i++) {
        dispatch({ type: "ADD_ITEM", payload: product })
      }
      toast.success('Product Added to Cart')
      setaddtoCartLoading(false)
      setShowCheck(true)
      setTimeout(() => setShowCheck(false), 1000)
    }, 200)
  }

  const handleShopNow = async () => {
    setShopNowLoading(true)
    for (let i = 0; i < quantity; i++) {
      dispatch({ type: "ADD_ITEM", payload: product })
    }
    toast.success('Product Added to Cart')
    // Wait a moment to show spinner and ensure cart is updated
    setTimeout(() => {
      router.push("/checkout")
    }, 200)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <label className="font-medium">{isArabic ? "الكمية:" : "Quantity:"}</label>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
            -
          </Button>
          <span className="w-12 text-center">{quantity}</span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setQuantity(quantity + 1)}
            disabled={quantity >= product.quantity_on_hand}
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
  disabled={product.quantity_on_hand === 0 || shopNowLoading || addtoCartLoading}
>
  {!addtoCartLoading && !showCheck && 
  
  <Image
  src='/quick-atc-add-to-cart-grey.svg'
  width={20}
  height={20}
  alt="Add to Cart"
  />
  }
  {addtoCartLoading ? (
    <LoadingDots />
  ) : showCheck ? (
    <>
    <CheckCheck className="h-5 w-5 text-white" />
    Added
    </>
  ) : (
    isArabic ? "أضف للسلة" : "Add to Cart"
  )}
</Button>
        <Button
          onClick={handleShopNow}
          size="lg"
          className="md:flex-1 flex items-center justify-center"
          disabled={product.quantity_on_hand === 0 || shopNowLoading}
        >
          {shopNowLoading ? <LoadingDots /> : (isArabic ? "اشتري الآن" : "Shop Now")}
        </Button>
      </div>
    </div>
  )
}