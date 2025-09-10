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
import type { WishlistItem } from "@/lib/wishlist-context";
import type { Product } from "@/lib/types";

export default function WishlistPage() {
  const { state, dispatch } = useWishlist()
  const { state: cartState, dispatch: cartDispatch } = useCart()
  const isArabic = cartState.language === "ar"

  const removeItem = (itemId: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: itemId })
  }

  const [showCheck, setShowCheck] = useState<{ [key: string]: boolean }>({})
  const [addToCartLoading, setAddToCartLoading] = useState<{ [key: string]: boolean }>({})

  const addToCart = (product: Product) => {
    setAddToCartLoading((prevState) => ({ ...prevState, [product._id]: true }))
    setShowCheck((prevState) => ({ ...prevState, [product._id]: false }))
    setTimeout(() => {
      cartDispatch({ type: "ADD_ITEM", payload: product })
      toast.success(isArabic ? "تمت إضافة المنتج إلى السلة" : "Product Added to Cart")
      setAddToCartLoading((prevState) => ({ ...prevState, [product._id]: false }))
      setShowCheck((prevState) => ({ ...prevState, [product._id]: true }))
      setTimeout(() => setShowCheck((prevState) => ({ ...prevState, [product._id]: false })), 2000)
    }, 200)
  }

  const addProjectToCart = (project: any) => {
    if (!project.engineers || !Array.isArray(project.engineers)) return;
    // Gather all products from all bundles
    const allProducts = project.engineers.flatMap((eng: any) =>
      (eng.bundle || []).map((b: any) => b.product).filter((p: any) => !!p)
    );
    if (!allProducts.length) return toast.error(isArabic ? "لا توجد منتجات في المشروع" : "No products in project");
    allProducts.forEach((product: Product) => {
      cartDispatch({ type: "ADD_ITEM", payload: product });
    });
    toast.success(isArabic ? "تمت إضافة منتجات المشروع إلى السلة" : "Project products added to cart");
  }

  const clearWishlist = () => {
    const confirmMessage = isArabic
      ? "هل أنت متأكد من إزالة جميع المنتجات من قائمة الرغبات؟"
      : "Are you sure you want to remove all items from your wishlist?"
    if (confirm(confirmMessage)) {
      dispatch({ type: "CLEAR_WISHLIST" })
      toast.info(isArabic ? "تم مسح قائمة الرغبات" : "Wishlist cleared")
    }
  }

  if (state.items.length === 0) {
    return (
      <div className="bg-[#FBFAF9] mx-auto px-2 md:px-4 py-8 min-h-[60vh] flex items-center justify-center">
        <div className="text-center py-12 space-y-2 md:space-y-6 flex flex-col items-center justify-center">
          <img src="/empty-wishlist-1.webp" alt="My Durves" />
          <h1 className="text-xl md:text-3xl font-bold">{isArabic ? "قائمة الرغبات فارغة" : "Your Wishlist is Empty"}</h1>
          <p className="text-xs md:text-sm text-gray-600 max-w-md mx-auto">
            {isArabic
              ? "ابدأ في إضافة المنتجات التي تعجبك إلى قائمة الرغبات لمتابعتها لاحقاً!"
              : "Start adding products you like to your wishlist to keep track of them!"}
          </p>
          <Link href="/products" prefetch={false}>
            <Button className="bg-cyan-500 hover:bg-primary/90 size-sm md:size-lg">
              {isArabic ? "تسوق الآن" : "Shop Now"}
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#FBFAF9] mx-auto px-2 md:px-4 py-8 min-h-[80vh]">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold flex self-start">{isArabic ? "قائمة الرغبات" : "Wishlist"} </h1>
        <Button variant="destructive" onClick={clearWishlist} disabled={state.items.length === 0}>
          <Trash2 className="h-5 w-5" />
          {isArabic ? " مسح الكل" : "Clear All "}
          ({state.items.length})
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        {state.items.map((item: WishlistItem) => {
          if ((item as any).type === 'project') {
            // Project wishlist card
            const project = item as any;
            const engineerCount = (project.engineers || []).length;
            const bundleCount = (project.engineers || []).reduce((sum: number, eng: any) => sum + ((eng.bundle || []).length), 0);
            const productCount = (project.engineers || []).reduce((sum: number, eng: any) => sum + (eng.bundle ? eng.bundle.filter((b: any) => b.product).length : 0), 0);
            return (
              <Card key={project._id} className="overflow-hidden hover:shadow-lg transition-shadow border-2 border-[#FEEE00]">
                <CardContent className="p-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-lg text-[#0F172B]">{isArabic ? "مشروع:" : "Project:"} {project.name}</h3>
                        <div className="flex gap-2 mt-1">
                          <span className="bg-[#FEEE00]/80 text-[#0F172B] px-2 py-0.5 rounded-full text-xs font-medium border border-[#FEEE00]">{engineerCount} {isArabic ? "مهندس" : "Engineers"}</span>
                          <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-medium border border-blue-200">{bundleCount} {isArabic ? "حزمة" : "Bundles"}</span>
                          <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs font-medium border border-green-200">{productCount} {isArabic ? "منتج" : "Products"}</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(project._id)}
                        className="text-red-600 hover:text-red-700"
                        aria-label={isArabic ? "إزالة المشروع" : "Remove project"}
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {(project.engineers || []).map((eng: any, i: number) => (
                        <span key={i} className="bg-[#FEEE00]/80 text-[#0F172B] px-2 py-0.5 rounded-full text-xs font-medium border border-[#FEEE00]">{eng.name || eng}</span>
                      ))}
                    </div>
                    {(project.engineers || []).some((eng: any) => eng.email) && (
                      <div className="text-xs text-blue-700 mb-2">
                        {isArabic ? "البريد الإلكتروني:" : "Engineer Email:"}{" "}
                        {(project.engineers || []).map((eng: any) => eng.email).filter(Boolean).join(", ")}
                      </div>
                    )}
                    <div className="grid grid-cols-1 gap-2">
                      {(project.engineers || []).flatMap((eng: any) =>
                        (eng.bundle || []).map((b: any, bidx: number) =>
                          b.product ? (
                            <div key={`${eng.name || ""}-${bidx}`} className="flex items-center gap-3 bg-white rounded-lg border border-gray-200 p-2">
                              <img
                                src={b.product.image?.split(',')[0] || "/placeholder.svg?height=128&width=128"}
                                alt={isArabic ? b.product.ar_name : b.product.en_name}
                                className="rounded-md object-contain"
                              />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-[#0F172B]">{isArabic ? b.product.ar_name : b.product.en_name}</p>
                                <p className="text-xs text-gray-600">{b.product.price?.toFixed(2)} {isArabic ? "د.ك" : "KD"}</p>
                              </div>
                            </div>
                          ) : null
                        )
                      )}
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Button
                        onClick={() => addProjectToCart(project)}
                        size="sm"
                        className="flex-1"
                      >
                        {isArabic ? "أضف منتجات المشروع للسلة" : "Add Project to Cart"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          } else {
            // Product wishlist card
            const product = item as Product;
            return (
              <Card key={product._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col items-center text-center space-y-2">
                    <Link href={`/products/${product._id}`} prefetch={false}>
                      <img
                        src={product.image.split(",")[0] || "/placeholder.svg?height=150&width=150"}
                        alt={isArabic ? product.ar_name : product.en_name}
                        // width={150}
                        // height={150}
                        className="object-contain rounded-lg"
                      />
                    </Link>
                    <Link href={`/products/${product._id}`} prefetch={false} className="hover:underline">
                      <h3 className="font-semibold text-lg line-clamp-2 leading-5">
                        {isArabic ? product.ar_name : product.en_name}
                      </h3>
                    </Link>
                    <p className="text-gray-500 text-sm">{isArabic ? product.ar_brand : product.en_brand}</p>
                  
                    <div className="flex items-center gap-2">
      <p className="text-gray-600 font-semibold text-base">
        {Number(product.price - (product.discount && product.discount > 0
          ? product.price * (product.discount / 100)
          : 0
        )).toFixed(2)} {isArabic ? "د.ك" : "KD"}
      </p>
      {/* {product.discount && product.discount > 0 && (
        <p className="text-red-500 text-sm line-through">
          {product.price.toFixed(2)} {isArabic ? "د.ك" : "KD"}
        </p>
      )} */}
    </div>
                    <div className="flex w-full gap-2">
                      <Button
                        onClick={() => addToCart(product)}
                        size="sm"
                        className="flex-grow w-3/4"
                        disabled={product.quantity_on_hand === 0 || addToCartLoading[product._id]}
                      >
                        {addToCartLoading[product._id] ? (
                          <span className="h-4 w-4 mr-2 animate-spin border-2 border-gray-300 border-t-transparent rounded-full inline-block align-middle"></span>
                        ) : showCheck[product._id] ? (
                          <>
                            <CheckCheck className="h-4 w-4 mr-2 text-green-500" />
                            {isArabic ? "تمت الإضافة" : "Added"}
                          </>
                        ) : (
                          <>
                            <img
                              src="/quick-atc-add-to-cart-grey.svg"
                              // width={20}
                              // height={20}
                              alt={isArabic ? "أضف إلى السلة" : "Add to Cart"}
                            />
                            {isArabic ? "أضف للسلة" : "Add to Cart"}
                          </>
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(product._id)}
                        className="text-red-600 hover:text-red-700 w-1/4"
                        aria-label={isArabic ? "إزالة من قائمة الرغبات" : "Remove from wishlist"}
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          }
        })}
      </div>
    </div>
  )
}