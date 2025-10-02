"use client"

import { useState, useEffect } from "react"
import { CheckCheck, HeartPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/context"
import type { Product } from "@/lib/types"
import { useRouter } from "next/navigation"
import LoadingDots from "@/components/ui/loading-spinner"
import { toast } from "sonner"
import Image from "next/image"
import { useWishlist } from "@/lib/wishlist-context"
import ShareButton from "@/components/ShareButton"

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

  type Variety = Product["varieties"][number]
  const initialVariety: Variety | null =
    product.hasVarieties && product.varieties?.length
      ? product.varieties[0]
      : null

  const [selectedVariety, setSelectedVariety] = useState<Variety | null>(initialVariety)
  
  // Track the available stock based on selected variant
  const [availableStock, setAvailableStock] = useState<number>(
    product.hasVarieties 
      ? (initialVariety?.quantity ?? 0) 
      : (product.quantity_on_hand ?? 0)
  )

  const router = useRouter()

  // Update available stock when variant changes
  useEffect(() => {
    if (product.hasVarieties) {
      setAvailableStock(selectedVariety?.quantity ?? 0)
      // Reset quantity if it exceeds available stock
      if (quantity > (selectedVariety?.quantity ?? 0)) {
        setQuantity(Math.max(1, selectedVariety?.quantity ?? 0))
      }
    } else {
      setAvailableStock(product.quantity_on_hand ?? 0)
    }
  }, [selectedVariety, product.hasVarieties, product.quantity_on_hand])

  const isOutOfStock = availableStock <= 0
  const isQuantityMaxed = quantity >= availableStock
  const isLoading = shopNowLoading || addToCartLoading

  // Unit price logic:
  // If hasVarieties is true use selected variety price; otherwise use product.price
  const unitPrice = product.hasVarieties
    ? (selectedVariety?.price ?? 0)
    : product.price

  const totalPrice = unitPrice * quantity

  const buildCartItem = () => {
    if (product.hasVarieties) {
      if (!selectedVariety) {
        toast.error(isArabic ? "يرجى اختيار نوع المنتج" : "Please select a product variety")
        return null
      }
      
      // Check if variant has enough stock
      if (selectedVariety.quantity < quantity) {
        toast.error(isArabic 
          ? `المخزون غير كافٍ. المتوفر: ${selectedVariety.quantity}` 
          : `Insufficient stock. Available: ${selectedVariety.quantity}`
        )
        return null
      }
      
      return {
        ...product,
        price: selectedVariety.price,
        variety: selectedVariety.en_name_variant,
        quantity_on_hand: selectedVariety.quantity, // Include variant's stock
        // Remove the varieties array to avoid storing all varieties
        varieties: undefined,
        hasVarieties: true
      }
    }
    
    // Check if product has enough stock
    if (product.quantity_on_hand < quantity) {
      toast.error(isArabic 
        ? `المخزون غير كافٍ. المتوفر: ${product.quantity_on_hand}` 
        : `Insufficient stock. Available: ${product.quantity_on_hand}`
      )
      return null
    }
    
    return { 
      ...product, 
      price: product.price,
      varieties: undefined // Clean up for consistency
    }
  }

  const addToCart = () => {
    const item = buildCartItem()
    if (!item) return
    setAddToCartLoading(true)
    setShowCheck(false)
    setTimeout(() => {
      dispatch({ 
        type: "ADD_ITEM", 
        payload: { ...item, quantity: quantity } // Pass quantity directly
      })
      toast.success(isArabic ? "تمت إضافة المنتج إلى السلة" : "Product Added to Cart")
      setAddToCartLoading(false)
      setShowCheck(true)
      setTimeout(() => setShowCheck(false), 1000)
    }, 150)
  }

  const handleShopNow = () => {
    const item = buildCartItem()
    if (!item) return
    setShopNowLoading(true)
    dispatch({ 
      type: "ADD_ITEM", 
      payload: { ...item, quantity: quantity } // Pass quantity directly
    })
    toast.success(isArabic ? "تمت إضافة المنتج إلى السلة" : "Product Added to Cart")
    router.push("/checkout")
  }

  const isWishlisted = wishlistState.items.some(item => item._id === product._id)
  const toggleWishlist = () => {
    if (isWishlisted) {
      wishlistDispatch({ type: "REMOVE_ITEM", payload: product._id })
      toast.info(isArabic ? "تمت الإزالة من قائمة الرغبات" : "Removed from wishlist")
    } else {
      wishlistDispatch({ type: "ADD_ITEM", payload: buildCartItem() ?? product })
      toast.success(isArabic ? "تمت الإضافة إلى قائمة الرغبات" : "Added to wishlist")
    }
  }

  return (
    <div className="space-y-4">
      {product.hasVarieties && product.varieties?.length > 0 && (
        <div className="flex flex-col gap-2">
          <label className="font-medium" htmlFor="variety-select">
            {isArabic ? "النوع:" : "Variety:"}
          </label>
          <select
            id="variety-select"
            value={selectedVariety?.en_name_variant || ""}
            onChange={(e) => {
              const sel = product.varieties.find(v => v.en_name_variant === e.target.value)
              if (sel) setSelectedVariety(sel)
            }}
            className="border rounded p-2"
          >
            {product.varieties.map(v => (
              <option 
                key={v.en_name_variant} 
                value={v.en_name_variant}
                disabled={v.quantity <= 0}
              >
                {v.en_name_variant} - {v.price.toFixed(2)} {isArabic ? "د.ك" : "KD"}
                {v.quantity <= 0 ? (isArabic ? " (نفذت الكمية)" : " (Out of stock)") : 
                 v.quantity < 5 ? (isArabic ? ` (${v.quantity} متبقي)` : ` (${v.quantity} left)`) : ''}
              </option>
            ))}
          </select>
          
          {/* Show selected variant's stock */}
          {selectedVariety && (
            <p className={`text-sm ${selectedVariety.quantity < 5 ? "text-amber-600" : "text-green-600"}`}>
              {isArabic 
                ? `المتوفر: ${selectedVariety.quantity} قطعة` 
                : `Available: ${selectedVariety.quantity} units`}
            </p>
          )}
        </div>
      )}

      {!product.hasVarieties && (
        <>
          <div className="text-xl font-bold">
            {product.price.toFixed(2)} {isArabic ? "د.ك" : "KD"}
          </div>
          
          {/* Show product stock */}
          <p className={`text-sm ${availableStock < 5 ? "text-amber-600" : "text-green-600"}`}>
            {isArabic 
              ? `المتوفر: ${availableStock} قطعة` 
              : `Available: ${availableStock} units`}
          </p>
        </>
      )}

      <div className="flex items-center gap-4">
        <label className="font-medium" htmlFor="quantity-input">
          {isArabic ? "الكمية:" : "Quantity:"}
        </label>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setQuantity(q => Math.max(1, q - 1))}
            disabled={isLoading || isOutOfStock}
          >-</Button>
          <span className="w-12 text-center" id="quantity-input">{quantity}</span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setQuantity(q => q + 1)}
            disabled={isQuantityMaxed || isLoading || isOutOfStock}
          >+</Button>
        </div>
      </div>

      <div className="text-lg font-bold">
        {isArabic ? "الإجمالي:" : "Total:"} {totalPrice.toFixed(2)} {isArabic ? "د.ك" : "KD"}
      </div>

      <div className="flex flex-col gap-2 w-full">
        <Button
          onClick={addToCart}
          size="lg"
          className="w-full"
          disabled={isOutOfStock || isLoading}
        >
          {addToCartLoading
            ? <LoadingDots />
            : showCheck
              ? <CheckCheck className="h-5 w-5 text-white" />
              : (
                <>
                  <Image
                    unoptimized
                    src="/quick-atc-add-to-cart-grey.svg"
                    width={20}
                    height={20}
                    alt=""
                  />
                  {isOutOfStock 
                    ? (isArabic ? "نفذت الكمية" : "Out of Stock")
                    : (isArabic ? "أضف للسلة" : "Add to Cart")}
                </>
              )}
        </Button>

        <div className="flex flex-row gap-2 w-full">
          <Button
            onClick={handleShopNow}
            size="lg"
            className="flex-1"
            disabled={isOutOfStock || isLoading}
          >
            {shopNowLoading 
              ? <LoadingDots /> 
              : isOutOfStock
                ? (isArabic ? "نفذت الكمية" : "Out of Stock")
                : (isArabic ? "اشتري الآن" : "Buy Now")}
          </Button>

          <Button
            variant="outline"
            size="lg"
            className={`flex-1 ${isWishlisted ? "text-red-500 border-red-500" : "text-gray-500"}`}
            onClick={toggleWishlist}
            disabled={isLoading}
          >
            <HeartPlus className={`h-5 w-5 ${isWishlisted ? "" : "fill-transparent"}`} />
            {isArabic ? "قائمة الرغبات" : "Wishlist"}
          </Button>

          <ShareButton product_id={product._id} />
        </div>
      </div>
    </div>
  )
}