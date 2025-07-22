"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowUpCircle, Copy } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Order, ProjectBundleItem } from "@/lib/types";
import { useCart } from "@/lib/context";
import { useSearchParams, useRouter } from "next/navigation";
import { Pagination } from "@/components/ui/pagination";
import { toast } from "sonner";
import LoadingDots from "@/components/ui/loading-spinner";

const ITEMS_PER_PAGE = 5;

export default function OrdersList() {
  const { state: cartState } = useCart();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [totalOrders, setTotalOrders] = useState(0);

  const isArabic = cartState.language === "ar";
  const currentPage = Number(searchParams.get("page")) || 1;

  useEffect(() => {
    setLoadingOrders(true);
    try {
      // Read orders from localStorage
      const storedOrders = localStorage.getItem("orders");
      let allOrders: Order[] = [];

      if (storedOrders) {
        const ordersObj = JSON.parse(storedOrders) as { [key: string]: Order };
        // Sort orders by createdAt in descending order (latest first)
        allOrders = Object.values(ordersObj).sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }

      // Update state
      setTotalOrders(allOrders.length);

      // Apply pagination
      const skip = (currentPage - 1) * ITEMS_PER_PAGE;
      const paginatedOrders = allOrders.slice(skip, skip + ITEMS_PER_PAGE);
      setOrders(paginatedOrders);
    } catch (error) {
      console.error("Error parsing orders from localStorage:", error);
      setOrders([]);
      setTotalOrders(0);
    } finally {
      setLoadingOrders(false);
    }
  }, [currentPage]);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`/myorders?${params.toString()}`);
  };

  const totalPages = Math.ceil(totalOrders / ITEMS_PER_PAGE);

  const dateTimeOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  };

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8" dir={isArabic ? "rtl" : "ltr"}>
      {loadingOrders ? (
        <div className="py-12 text-center">
          <LoadingDots />
        </div>
      ) : orders.length === 0 ? (
        <div className="space-y-6 py-12 text-center">
          <p className="text-base sm:text-lg text-neutral-600">
            {isArabic ? "لا توجد طلبات حتى الآن." : "You have no orders yet."}
          </p>
          <Link href="/products">
            <Button className="rounded-full bg-[#00B8DB] px-6 py-2 sm:py-3 text-sm sm:text-base text-white hover:bg-[#009bb8]">
              {isArabic ? "تسوق الآن" : "Shop Now"}
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
          {orders.map((order, index) => {
            // Calculate project bundle metrics
            const numBundles = order.items?.filter(
              (item) => "type" in item && item.type === "project-bundle"
            ).reduce((sum, item) => sum + (item as ProjectBundleItem).bundleIds?.length || 0, 0) || 0;
            const numEngineers = order.items?.filter(
              (item) => "type" in item && item.type === "project-bundle"
            ).reduce((sum, item) => sum + (item as ProjectBundleItem).engineerNames?.length || 0, 0) || 0;
            const numProducts = order.items?.filter(
              (item) => "type" in item && item.type === "project-bundle"
            ).length || order.items?.length || 0;
            const bundlePrice = order.items
              ?.filter((item) => "type" in item && item.type === "project-bundle")
              .reduce((sum, item) => sum + ((item as ProjectBundleItem).products?.reduce((s: number, p: any) => s + p.price, 0) || 0) * item.quantity, 0) || 0;

            return (
              <Card
                key={order._id}
                className={`group overflow-hidden rounded-lg shadow-sm transition-all duration-200 hover:shadow-md ${
                  index === 0 && currentPage === 1
                    ? "border-2 border-[#FEEE18]"
                    : "border border-neutral-100"
                }`}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 sm:p-6 relative">
                  {index === 0 && currentPage === 1 && (
                    <div className="flex items-center text-xs sm:text-sm px-2 py-1 text-[#52A8FF] bg-neutral-100 font-semibold rounded-md gap-1 absolute -top-3 sm:top-2 right-0 sm:right-2">
                      <ArrowUpCircle size={14} className="text-[#52A8FF]" />
                      {isArabic ? "الحالي" : "Current"}
                    </div>
                  )}
                  <CardTitle className="flex flex-col">
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(order._id as string);
                        toast.success(isArabic ? "تم نسخ رقم الطلب" : "Copied order ID");
                      }}
                      className="group/id flex items-center gap-2 text-sm sm:text-base font-semibold text-neutral-800"
                    >
                      {isArabic ? "رقم الطلب:" : "Order ID:"}
                      <span className="break-all font-normal">
                        {order._id.substring(0, 8)}...
                      </span>
                      <Copy
                        size={14}
                        className="cursor-pointer text-neutral-500 transition-colors hover:text-[#00B8DB] group-hover/id:text-[#00B8DB]"
                      />
                    </div>
                    <div className="mt-1 text-xs sm:text-sm text-neutral-500">
                      {isArabic
                        ? `التاريخ: ${new Date(order.createdAt).toLocaleString("ar-KW", dateTimeOptions)}`
                        : `Date: ${new Date(order.createdAt).toLocaleString(undefined, dateTimeOptions)} `}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
                  <div className="mb-4 grid grid-cols-1 gap-2 sm:gap-4 sm:grid-cols-2">
                    <div>
                      <h3 className="mb-1 text-sm font-semibold text-neutral-800">
                        {isArabic ? "معلومات العميل" : "Customer Info"}
                      </h3>
                      <p className="text-xs sm:text-sm text-neutral-600">
                        {isArabic ? "الاسم:" : "Name:"}{" "}
                        <span className="font-medium">{order.customerInfo.name}</span>
                      </p>
                      <p className="text-xs sm:text-sm text-neutral-600">
                        {isArabic ? "الهاتف:" : "Phone:"}{" "}
                        <span className="font-medium">{order.customerInfo.phone}</span>
                      </p>
                      <p className="text-xs sm:text-sm text-neutral-600">
                        {isArabic ? "البريد الإلكتروني:" : "Email:"}{" "}
                        <span className="font-medium">{order.customerInfo.email}</span>
                      </p>
                    </div>
                    <div>
                      <h3 className="mb-1 text-sm font-semibold text-neutral-800">
                        {isArabic ? "عنوان الشحن" : "Shipping Address"}
                      </h3>
                      <p className="text-xs sm:text-sm text-neutral-600">
                        {order.customerInfo.block} | {order.customerInfo.street} |{" "}
                        {order.customerInfo.area} | {order.customerInfo.city} |{" "}
                        {order.customerInfo.country}
                      </p>
                      {order.customerInfo.house && (
                        <p className="text-xs sm:text-sm text-neutral-600">
                          {isArabic ? "المنزل:" : "House:"}{" "}
                          <span className="font-medium">{order.customerInfo.house}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mb-4">
                    <h3 className="mb-3 text-sm font-semibold text-neutral-800">
                      {isArabic ? "تفاصيل العناصر" : "Item Details"}
                    </h3>
                    <ul className="space-y-3">
                      {order.items.map((item, itemIndex) => {
                        const isProjectBundleItem = "type" in item && item.type === "project-bundle";
                        return (
                          <li
                            key={isProjectBundleItem ? `bundle-${itemIndex}` : (item.product?._id || `item-${itemIndex}`)}
                            className={isProjectBundleItem ? "flex flex-col rounded-md bg-blue-50 p-3" : "flex flex-col sm:flex-row items-start gap-2 sm:gap-4"}
                          >
                            {isProjectBundleItem ? (
                              <>
                                <div className="mb-2 flex items-center justify-between">
                                  <div className="flex flex-col">
                                    <span className="font-semibold text-blue-700">
                                      {isArabic ? "مشروع:" : "Project Bundle:"} {(item as ProjectBundleItem).projectName}
                                    </span>
                                    <span className="text-xs sm:text-sm text-blue-600">
                                      {isArabic ? "المهندس:" : "Engineer:"} {(item as ProjectBundleItem).engineerNames.join(", ")}
                                    </span>
                                  </div>
                                  <span className="rounded-full bg-blue-100 px-2 sm:px-3 py-1 text-xs font-medium text-blue-800">
                                    {isArabic ? "حزمة مشروع" : "Project Bundle"}
                                  </span>
                                </div>
                                <div className="mt-2 rounded-md bg-blue-100/50 p-2 sm:p-3 text-xs sm:text-sm">
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                                    <div className="flex items-center justify-between">
                                      <span className="font-medium text-blue-800">
                                        {isArabic ? "معرف المشروع:" : "Project ID:"}
                                      </span>
                                      <span className="text-blue-700 flex items-center">
                                        {(item as ProjectBundleItem).projectId.substring(0, 8)}...
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            navigator.clipboard.writeText((item as ProjectBundleItem).projectId || "");
                                            toast.success(isArabic ? "تم نسخ معرف المشروع" : "Project ID copied");
                                          }}
                                          className="ml-1 inline-flex items-center text-blue-600 hover:text-blue-800"
                                        >
                                          <Copy size={12} />
                                        </button>
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="font-medium text-blue-800">
                                        {isArabic ? "عدد الحزم:" : "Bundles:"}
                                      </span>
                                      <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-medium border border-blue-200">
                                        {(item as ProjectBundleItem).bundleIds?.length || 0} {isArabic ? "حزمة" : "Bundles"}
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="font-medium text-blue-800">
                                        {isArabic ? "عدد المهندسين:" : "Engineers:"}
                                      </span>
                                      <span className="bg-[#FEEE00]/80 text-[#0F172B] px-2 py-0.5 rounded-full text-xs font-medium border border-[#FEEE00]">
                                        {(item as ProjectBundleItem).engineerNames?.length || 0} {isArabic ? "مهندس" : "Engineers"}
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="font-medium text-blue-800">
                                        {isArabic ? "عدد المنتجات:" : "Products:"}
                                      </span>
                                      <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs font-medium border border-green-200">
                                        {(item as ProjectBundleItem).products?.length || 0} {isArabic ? "منتج" : "Products"}
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="font-medium text-blue-800">
                                        {isArabic ? "الكمية:" : "Quantity:"}
                                      </span>
                                      <span className="text-blue-700 font-semibold">
                                        x{(item as ProjectBundleItem).quantity}
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="font-medium text-blue-800">
                                        {isArabic ? "سعر الحزمة:" : "Bundle Price:"}
                                      </span>
                                      <span className="text-blue-700 font-semibold">
                                        {((item as ProjectBundleItem).products?.reduce((sum, p) => sum + p.price, 0) || 0).toFixed(2)} {isArabic ? "د.ك" : "KD"}
                                      </span>
                                    </div>
                                    {order.discount > 0 && (
                                      <div className="flex items-center justify-between">
                                        <span className="font-medium text-green-700">
                                          {isArabic ? "الخصم:" : "Discount:"}
                                        </span>
                                        <span className="text-green-700 font-semibold">
                                          {order.discount.toFixed(2)} {isArabic ? "د.ك" : "KD"}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="mt-2 sm:mt-3 pt-2 border-t border-blue-200">
                                    <div className="flex items-center justify-between">
                                      <span className="font-medium text-blue-800">
                                        {isArabic ? "نوع الحزمة:" : "Bundle Type:"}
                                      </span>
                                      <Badge variant="secondary" className="text-xs">
                                        {(item as ProjectBundleItem).engineerNames.length} {isArabic ? "مهندس" : "Engineers"}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="flex w-full items-center gap-2 sm:gap-3">
                                  <div className="relative h-14 w-14 sm:h-16 sm:w-16 flex-shrink-0 rounded-md border shadow-sm">
                                    {item.product?.image ? (
                                      <img
                                        src={item.product.image.split(",")[0]}
                                        alt={isArabic ? item.product.ar_name : item.product.en_name}
                                        className="h-full w-full object-cover"
                                      />
                                    ) : (
                                      <div className="flex h-full w-full items-center justify-center bg-gray-100 text-xs text-gray-500">
                                        <span>{isArabic ? "لا صورة" : "No Image"}</span>
                                      </div>
                                    )}
                                    <span className="absolute -right-2 -top-2 z-10 flex min-h-[1.25rem] min-w-[1.25rem] items-center justify-center rounded-full bg-[#00B8DB] px-1 py-0.5 text-xs font-semibold text-white">
                                      x{item.quantity}
                                    </span>
                                  </div>
                                  <div className="flex flex-col leading-tight">
                                    <span className="font-semibold text-sm sm:text-base text-neutral-800">
                                      {isArabic ? item.product?.ar_name || "منتج" : item.product?.en_name || "Product"}
                                    </span>
                                    <span className="text-xs sm:text-sm text-neutral-500">
                                      {isArabic
                                        ? `سعر الوحدة: ${(item.product?.price?.toFixed(2) || "0.00")} د.ك`
                                        : `Unit Price: ${(item.product?.price?.toFixed(2) || "0.00")} KD`}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex flex-col items-end leading-tight">
                                  {item.product?.discount && item.product.discount > 0 ? (
                                    <>
                                      <span className="font-semibold text-sm sm:text-base text-green-600">
                                        {(
                                          item.product.price -
                                          (item.product.discount_type === "percentage"
                                            ? item.product.price * (item.product.discount / 100)
                                            : item.product.discount)
                                        ).toFixed(2)}{" "}
                                        {isArabic ? "د.ك" : "KD"}
                                      </span>
                                      <span className="text-xs sm:text-sm text-neutral-500 line-through">
                                        {item.product.price.toFixed(2)} {isArabic ? "د.ك" : "KD"}
                                      </span>
                                    </>
                                  ) : (
                                    <span className="font-semibold text-sm sm:text-base text-neutral-800">
                                      {(item.product?.price || 0).toFixed(2)} {isArabic ? "د.ك" : "KD"}
                                    </span>
                                  )}
                                </div>
                              </>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-center justify-between border-t border-dashed border-neutral-200 pt-3">
                      <span className="text-sm sm:text-base text-neutral-700 font-semibold">
                        {isArabic ? "المجموع الفرعي:" : "Subtotal:"}
                      </span>
                      <span className="text-sm sm:text-base text-neutral-700 font-semibold">
                        {(order.total - (order.discount || 0)).toFixed(2)} {isArabic ? "د.ك" : "KD"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm sm:text-base text-neutral-700">
                        {isArabic ? "رسوم التوصيل:" : "Shipping Fee:"}
                      </span>
                      <span className="text-sm sm:text-base text-neutral-700">
                        {(order.shippingFee ?? 0).toFixed(2)} {isArabic ? "د.ك" : "KD"}
                      </span>
                    </div>
                    {order.discount > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm sm:text-base text-green-600 font-semibold">
                          {isArabic ? "الخصم المطبق:" : "Applied Discount:"}
                        </span>
                        <span className="text-sm sm:text-base text-green-600 font-semibold">
                          -{order.discount.toFixed(2)} {isArabic ? "د.ك" : "KD"}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between border-t border-dashed border-neutral-200 pt-3">
                      <span className="text-base sm:text-lg font-bold text-neutral-800">
                        {isArabic ? "المجموع الكلي:" : "Total Amount:"}
                      </span>
                      <span className="text-base sm:text-lg font-bold text-[#00B8DB]">
                        {(order.total - (order.discount || 0) + (order.shippingFee ?? 0)).toFixed(2)} {isArabic ? "د.ك" : "KD"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6 sm:mt-8 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            className="flex space-x-2"
          />
        </div>
      )}
    </div>
  );
}