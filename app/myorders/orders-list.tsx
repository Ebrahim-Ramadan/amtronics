"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Copy } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Order } from "@/lib/types"
import { useCart } from "@/lib/context"
import { useSearchParams, useRouter } from "next/navigation"
import { Pagination } from "@/components/ui/pagination"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import LoadingDots from "@/components/ui/loading-spinner"

const ITEMS_PER_PAGE = 5

export default function OrdersList() {
  const { state: cartState } = useCart()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [totalOrders, setTotalOrders] = useState(0)

  const isArabic = cartState.language === "ar"
  const dir = isArabic ? "rtl" : "ltr"

  const currentPage = Number(searchParams.get("page")) || 1

  useEffect(() => {
    setLoadingOrders(true)
    try {
      // Read orders from localStorage
      const storedOrders = localStorage.getItem("orders")
      let allOrders: Order[] = []

      if (storedOrders) {
        const ordersObj = JSON.parse(storedOrders) as { [key: string]: Order }
        // Sort orders by createdAt in descending order (latest first)
        allOrders = Object.values(ordersObj).sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
      }

      // Update state
      setTotalOrders(allOrders.length)

      // Apply pagination
      const skip = (currentPage - 1) * ITEMS_PER_PAGE
      const paginatedOrders = allOrders.slice(skip, skip + ITEMS_PER_PAGE)
      setOrders(paginatedOrders)
    } catch (error) {
      console.error("Error parsing orders from localStorage:", error)
      setOrders([])
      setTotalOrders(0)
    } finally {
      setLoadingOrders(false)
    }
  }, [currentPage])

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", String(newPage))
    router.push(`/myorders?${params.toString()}`)
  }

  const totalPages = Math.ceil(totalOrders / ITEMS_PER_PAGE)

  // const getStatusVariant = (
  //   status: string,
  // ): "secondary" | "warning" | "info" | "success" | "destructive" => {
  //   switch (status) {
  //     case "pending":
  //       return "secondary"
  //     case "processing":
  //       return "warning"
  //     case "shipped":
  //       return "info"
  //     case "delivered":
  //       return "success"
  //     case "cancelled":
  //       return "destructive"
  //     default:
  //       return "secondary"
  //   }
  // }

  // const translateStatus = (status: string) => {
  //   if (!isArabic) return status
  //   switch (status) {
  //     case "pending":
  //       return "قيد الانتظار"
  //     case "processing":
  //       return "قيد المعالجة"
  //     case "shipped":
  //       return "تم الشحن"
  //     case "delivered":
  //       return "تم التوصيل"
  //     case "cancelled":
  //       return "ملغاة"
  //     default:
  //       return status
  //   }1
  // }

  return (
    <>
      {loadingOrders ? (
        <div className="py-12 text-center">
          <LoadingDots />
        </div>
      ) : orders.length === 0 ? (
        <div className="space-y-6 py-12 text-center">
          <p className="text-lg text-neutral-600">
            {isArabic ? "لا توجد طلبات حتى الآن." : "You have no orders yet."}
          </p>
          <Link href="/products">
            <Button className="rounded-full bg-[#00B8DB] px-6 py-3 text-base text-white hover:bg-[#009bb8]">
              {isArabic ? "تسوق الآن" : "Shop Now"}
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {orders.map((order, index) => (
            <Card
              key={order._id}
              className={`group  overflow-hidden rounded-lg shadow-sm transition-all duration-200 hover:shadow-md ${
                index === 0 && currentPage === 1
                  ? "border-2 border-[#FEEE18]" // Highlight the latest order only on the first page
                  : "border border-neutral-100"
              }`}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 md:p-6">
                <CardTitle className="flex flex-col">
                  <div 
                   onClick={(e) => {
                    e.stopPropagation() // Prevent card click when copying
                    navigator.clipboard.writeText(order._id as string)
                    toast.success(
                      isArabic ? "تم نسخ رقم الطلب" : "Copied order ID",
                    )
                  }}
                  className="group/id flex items-center gap-2 text-base font-semibold text-neutral-800 md:text-lg">
                    {isArabic ? "رقم الطلب:" : "Order ID:"}
                    <span className="break-all font-normal">
                      {order._id}
                    </span>
                    <Copy
                     
                      size={14}
                      className="cursor-pointer text-neutral-500 transition-colors hover:text-[#00B8DB] group-hover/id:text-[#00B8DB]"
                    />
                  </div>
                  <div className="mt-1 text-sm text-neutral-500">
                    {isArabic
                      ? `التاريخ: ${new Date(order.createdAt).toLocaleDateString("ar-KW")}`
                      : `Date: ${new Date(order.createdAt).toLocaleDateString()}`}
                  </div>
                </CardTitle>
                {/* <Badge
                  variant={getStatusVariant(order.status)}
                  className="px-3 py-1 text-sm rounded-full"
                >
                  {translateStatus(order.status)}
                </Badge> */}
              </CardHeader>
              <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
                <div className="mb-4 grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-4">
                  <div>
                    <h3 className="mb-1 text-sm font-semibold text-neutral-800">
                      {isArabic ? "معلومات العميل" : "Customer Info"}
                    </h3>
                    <p className="text-sm text-neutral-600">
                      {isArabic ? "الاسم:" : "Name:"}{" "}
                      <span className="font-medium">
                        {order.customerInfo.name}
                      </span>
                    </p>
                    <p className="text-sm text-neutral-600">
                      {isArabic ? "الهاتف:" : "Phone:"}{" "}
                      <span className="font-medium">
                        {order.customerInfo.phone}
                      </span>
                    </p>
                  </div>
                  <div>
                    <h3 className="mb-1 text-sm font-semibold text-neutral-800">
                      {isArabic ? "عنوان الشحن" : "Shipping Address"}
                    </h3>
                    <p className="text-sm text-neutral-600">
                      {order.customerInfo.block} | {order.customerInfo.area} |{" "}
                      {order.customerInfo.city} | {order.customerInfo.country}
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="mb-3 text-sm font-semibold text-neutral-800">
                    {isArabic ? "تفاصيل العناصر" : "Item Details"}
                  </h3>
                  <ul className="space-y-3">
                    {order.items.map((item) => (
                      <li
                        key={item.product._id}
                        className="flex flex-col items-end justify-between gap-2 md:flex-row md:items-start md:gap-4"
                      >
                        <div className="flex w-full items-center gap-3">
                          <div className="relative h-16 w-16 flex-shrink-0  rounded-md border shadow-sm md:h-20 md:w-20">
                            {item.product.image ? (
                              <img
                                src={item.product.image.split(",")[0]}
                                alt={
                                  isArabic
                                    ? item.product.ar_name
                                    : item.product.en_name
                                }
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
                            <span className="font-semibold text-neutral-800">
                              {isArabic
                                ? item.product.ar_name
                                : item.product.en_name}
                            </span>
                            <span className="text-sm text-neutral-500">
                              {isArabic
                                ? `سعر الوحدة: ${item.product.price.toFixed(2)} د.ك`
                                : `Unit Price: ${item.product.price.toFixed(
                                    2,
                                  )} KD`}
                            </span>
                          </div>
                        </div>
                        <span className="font-semibold text-neutral-800">
                          {(item.product.price * item.quantity).toFixed(2)}{" "}
                          {isArabic ? "د.ك" : "KD"}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center justify-between border-t border-dashed border-neutral-200 pt-4">
                  <span className="text-lg font-bold text-neutral-800">
                    {isArabic ? "المجموع الكلي:" : "Total Amount:"}
                  </span>
                  <span className="text-lg font-bold text-[#00B8DB]">
                    {order.total.toFixed(2)} {isArabic ? "د.ك" : "KD"}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            className="flex space-x-2"
          />
        </div>
      )}
    </>
  )
} 