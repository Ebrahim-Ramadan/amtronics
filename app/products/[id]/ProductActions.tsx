"use client"

import { useState } from "react"
import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/context"
import type { Product } from "@/lib/types"

interface ProductActionsProps {
  product: Product
  isArabic: boolean
}

export default function ProductActions({ product, isArabic }: ProductActionsProps) {
  
  const { dispatch } = useCart()
  const [quantity, setQuantity] = useState(1)

  const addToCart = () => {
    for (let i = 0; i < quantity; i++) {
      dispatch({ type: "ADD_ITEM", payload: product })
    }
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

      <Button onClick={addToCart} size="lg" className="w-full" disabled={product.quantity_on_hand === 0}>
        <ShoppingCart className="h-5 w-5 mr-2" />
        {isArabic ? "أضف للسلة" : "Add to Cart"}
      </Button>
    </div>
  )
}