"use client";

import Image from "next/image";
import Link from "next/link";
import { Trash2, Plus, Minus, CheckCircle, HeartPlus, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useCart } from "@/lib/context";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useWishlist } from "@/lib/wishlist-context";
import type { Product } from "@/lib/types";
import type { ProjectCartItem } from "@/lib/types";
import { EmptyCart } from "@/components/empty-cart";

const policyItems = {
  en: [
    "Secure payment guaranteed",
    "30-day return policy",
  ],
  ar: [
    "الدفع الآمن مضمون",
    "سياسة الإرجاع خلال 30 يومًا",
  ],
};

export default function CartPage() {
  const { state, dispatch } = useCart();
  const isArabic = state.language === "ar";
  const dir = isArabic ? "rtl" : "ltr";

  const { state: wishlistState, dispatch: wishlistDispatch } = useWishlist();

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) {
      const confirmMessage = isArabic
        ? "هل أنت متأكد من إزالة هذا المنتج من السلة؟"
        : "Are you sure you want to remove this item from the cart?";
      if (confirm(confirmMessage)) {
        dispatch({ type: "REMOVE_ITEM", payload: productId });
        toast.info("Item Removed");
      }
    } else if (quantity > 99) {
      toast.info("Maximum Quantity");
    } else {
      dispatch({ type: "UPDATE_QUANTITY", payload: { productId, quantity } });
      toast.info("Quantity Updated");
    }
  };

  const removeItem = (productId: string) => {
    const confirmMessage = isArabic
      ? "هل أنت متأكد من إزالة هذا المنتج من السلة؟"
      : "Are you sure you want to remove this item from the cart?";
    if (confirm(confirmMessage)) {
      dispatch({ type: "REMOVE_ITEM", payload: productId });
      toast.info("Item Removed");
    }
  };

  const toggleWishlist = (product: Product) => {
    const isWishlisted = wishlistState.items.some((item) => item._id === product._id);
    if (isWishlisted) {
      wishlistDispatch({ type: "REMOVE_ITEM", payload: product._id });
      toast.info(isArabic ? "تمت الإزالة من قائمة الرغبات" : "Removed from wishlist");
    } else {
      wishlistDispatch({ type: "ADD_ITEM", payload: product });
      toast.success(isArabic ? "تمت الإضافة إلى قائمة الرغبات" : "Added to wishlist");
    }
  };

  const subtotal = state.total;
  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);

  if (state.items.length === 0) {
    return <EmptyCart isArabic={isArabic} />;
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8" dir={dir}>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">
          {isArabic ? "سلة التسوق" : "Shopping Cart"}
        </h1>
        <Badge variant="secondary" className="text-xs sm:text-sm mt-2 sm:mt-0">
          {isArabic ? `${itemCount} عناصر` : `${itemCount} Items`}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {state.items.map((item, idx) => {
            if ("type" in item && item.type === "project-bundle") {
              // ProjectCartItem rendering
              const engineerCount = (item.engineerNames || []).length;
              const bundleCount = engineerCount; // If you have bundle info, adjust accordingly
              const productCount = item.products.length;
              return (
                <Card
                  key={item.projectId}
                  className="overflow-hidden hover:shadow-lg transition-shadow border-2 border-[#FEEE00]"
                >
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-base sm:text-lg text-[#0F172B]">
                            {isArabic ? "مشروع:" : "Project:"} {item.projectName}
                          </h3>
                          <span className="bg-[#FEEE00]/80 text-[#0F172B] px-2 py-0.5 rounded-full text-xs font-medium border border-[#FEEE00]">{engineerCount} {isArabic ? "مهندس" : "Engineers"}</span>
                          <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-medium border border-blue-200">{bundleCount} {isArabic ? "حزمة" : "Bundles"}</span>
                          <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs font-medium border border-green-200">{productCount} {isArabic ? "منتج" : "Products"}</span>
                          <Badge variant="secondary" className="text-xs">
                            {item.engineerNames.length} {isArabic ? "مهندس" : "Engineers"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-2 sm:mt-0">
                          <Button
                            variant={
                              wishlistState.items.some(
                                (w) => w._id === item.projectId && (w as any).type === "project"
                              )
                                ? "outline"
                                : "ghost"
                            }
                            size="icon"
                            onClick={() => {
                              const isWishlisted = wishlistState.items.some(
                                (w) => w._id === item.projectId && (w as any).type === "project"
                              );
                              if (isWishlisted) {
                                wishlistDispatch({ type: "REMOVE_ITEM", payload: item.projectId });
                                toast.info(isArabic ? "تمت الإزالة من قائمة الرغبات" : "Removed from wishlist");
                              } else {
                                wishlistDispatch({
                                  type: "ADD_ITEM",
                                  payload: { _id: item.projectId, name: item.projectName, type: "project", engineers: item.engineerNames },
                                });
                                toast.success(isArabic ? "تمت الإضافة إلى قائمة الرغبات" : "Added to wishlist");
                              }
                            }}
                            aria-label={isArabic ? "قائمة الرغبات للمشروع" : "Project wishlist"}
                            className={
                              wishlistState.items.some(
                                (w) => w._id === item.projectId && (w as any).type === "project"
                              )
                                ? "text-red-500 border-red-500 hover:text-red-600"
                                : "text-gray-500 hover:text-red-500"
                            }
                          >
                            <HeartPlus
                              className={`h-5 w-5 ${
                                wishlistState.items.some(
                                  (w) => w._id === item.projectId && (w as any).type === "project"
                                )
                                  ? "fill-red-500"
                                  : "fill-transparent"
                              }`}
                            />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(item.projectId)}
                            className="text-red-600 hover:text-red-700"
                            aria-label={isArabic ? "إزالة المشروع" : "Remove project"}
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {item.engineerNames.map((eng, i) => (
                          <span
                            key={i}
                            className="bg-[#FEEE00]/80 text-[#0F172B] px-2 py-0.5 rounded-full text-xs font-medium border border-[#FEEE00]"
                          >
                            {eng}
                          </span>
                        ))}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        {item.products.map((prod, i) => (
                          <div
                            key={prod._id + i}
                            className="flex items-center gap-3 bg-white rounded-lg border border-gray-200 p-2 sm:p-3"
                          >
                            <Image
                              src={prod.image.split(",")[0] || "/placeholder.svg?height=64&width=64"}
                              alt={isArabic ? prod.ar_name : prod.en_name}
                              width={48}
                              height={48}
                              className="rounded-md object-contain w-12 h-12 sm:w-16 sm:h-16"
                            />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-[#0F172B]">
                                {isArabic ? prod.ar_name : prod.en_name}
                              </p>
                              <p className="text-xs text-gray-600">
                                {prod.price.toFixed(2)} {isArabic ? "د.ك" : "KD"}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-end mt-2">
                        <p className="font-semibold text-base sm:text-lg">
                          {(item.products.reduce((sum, p) => sum + p.price, 0) * item.quantity).toFixed(2)} {isArabic ? "د.ك" : "KD"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            } else if ("product" in item) {
              // Regular product rendering
              return (
                <Card
                  key={item.product._id}
                  className="overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                      <div className="relative h-24 w-full sm:h-32 sm:w-32">
                        <Image
                          src={item.product.image.split(",")[0] || "/placeholder.svg?height=128&width=128"}
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
                          className={`hover:bg-[#FEEE00] border-neutral-100 border-1 backdrop-blur-xl rounded-full w-fit absolute -top-2 -right-2 text-gray-500 hover:text-red-500 ${
                            wishlistState.items.some(
                              (wishlistItem) => wishlistItem._id === item.product._id && !(wishlistItem as any).type
                            )
                              ? "text-red-500"
                              : ""
                          }`}
                          aria-label={
                            isArabic
                              ? wishlistState.items.some(
                                  (wishlistItem) =>
                                    wishlistItem._id === item.product._id && !(wishlistItem as any).type
                                )
                                ? "إزالة من قائمة الرغبات"
                                : "أضف إلى قائمة الرغبات"
                              : wishlistState.items.some(
                                  (wishlistItem) =>
                                    wishlistItem._id === item.product._id && !(wishlistItem as any).type
                                )
                              ? "Remove from wishlist"
                              : "Add to wishlist"
                          }
                        >
                          <HeartPlus
                            className={`h-5 w-5 ${
                              wishlistState.items.some(
                                (wishlistItem) =>
                                  wishlistItem._id === item.product._id && !(wishlistItem as any).type
                              )
                                ? "fill-red-500"
                                : "fill-transparent"
                            }`}
                          />
                        </Button>
                      </div>
                      <div className="flex-1 space-y-3">
                        <div>
                          <h3 className="font-semibold text-base sm:text-lg">
                            {isArabic ? item.product.ar_name : item.product.en_name}
                          </h3>
                        </div>
                        <div className="flex items-center gap-4">
                          <p className="font-medium text-primary text-sm sm:text-base">
                            {item.product.price.toFixed(2)} {isArabic ? "د.ك" : "KD"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="flex items-center gap-1 sm:gap-2 border rounded-md">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 sm:h-9 sm:w-9"
                              onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                              aria-label={isArabic ? "تقليل الكمية" : "Decrease quantity"}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateQuantity(item.product._id, parseInt(e.target.value) || 1)}
                              className="w-12 sm:w-16 text-center h-8 sm:h-9 border-none"
                              min={1}
                              max={99}
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 sm:h-9 sm:w-9"
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
                            className="block sm:hidden text-red-600 hover:text-red-700"
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
                          className="hidden sm:block bg-neutral-50 rounded-full text-red-600 hover:text-red-700"
                          aria-label={isArabic ? "إزالة المنتج" : "Remove product"}
                        >
                          <XIcon className="h-5 w-5" />
                        </Button>
                        <p className="font-semibold text-base sm:text-lg">
                          {(item.product.price * item.quantity).toFixed(2)} {isArabic ? "د.ك" : "KD"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            }
            return null;
          })}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="shadow-lg border-2 border-[#FEEE00]">
            <CardHeader>
              <p className="text-base sm:text-lg font-semibold">
                {isArabic ? "ملخص الطلب" : "Order Summary"}
              </p>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <div className="space-y-4 pt-4 border-t">
                <div className="flex justify-between text-sm sm:text-base">
                  <span>{isArabic ? "المجموع الفرعي" : "Subtotal"}</span>
                  <span>
                    {subtotal.toFixed(2)} {isArabic ? "د.ك" : "KD"}
                  </span>
                </div>
                <div className="flex justify-between text-sm sm:text-base">
                  <span>{isArabic ? "عدد العناصر" : "Items"}</span>
                  <span>{itemCount}</span>
                </div>
                <div className="flex justify-between text-base sm:text-lg font-bold pt-4 border-t">
                  <span>{isArabic ? "المجموع الكلي" : "Total"}</span>
                  <span>
                    {subtotal.toFixed(2)} {isArabic ? "د.ك" : "KD"}
                  </span>
                </div>
              </div>
              <Link href="/checkout" className="block">
                <Button
                  className="w-full h-10 sm:h-12 text-sm sm:text-base font-semibold bg-[#0F172B] hover:bg-primary/90 transition-colors"
                  size="lg"
                >
                  <Image
                    src="/payment_menu_icon.svg"
                    alt={isArabic ? "إتمام الطلب" : "Proceed to Checkout"}
                    width={18}
                    height={18}
                    className="mr-2"
                  />
                  {isArabic ? "إتمام الطلب" : "Proceed to Checkout"}
                </Button>
              </Link>
            </CardContent>
          </Card>
          <div className="my-4 text-xs sm:text-sm text-neutral-600 space-y-2">
            {policyItems[isArabic ? "ar" : "en"].map((item, index) => (
              <div className="flex gap-2" key={index}>
                <CheckCircle color="green" size={16} />
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}