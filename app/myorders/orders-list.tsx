"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowUpCircle, Copy, X, RefreshCw, ChevronLeft, CheckCircle } from "lucide-react";
import { Card,  CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { Order, ProjectBundleItem, CartItem } from "@/lib/types";
import { useCart } from "@/lib/context";
import { useSearchParams, useRouter } from "next/navigation";
import { Pagination } from "@/components/ui/pagination";
import { toast } from "sonner";
import LoadingDots from "@/components/ui/loading-spinner";
import Cookies from "js-cookie";

// Hardcoded credentials (replace with env or secure storage in production)
// const AUTH_EMAIL = "admin@amtronics.com";
// const AUTH_PASSWORD = "supersecret";
// Load credentials from environment variables
const AUTH_EMAIL = process.env.NEXT_PUBLIC_AUTH_EMAIL;
const AUTH_PASSWORD = process.env.NEXT_PUBLIC_AUTH_PASSWORD;

const ITEMS_PER_PAGE = 5;

export default function OrdersList() {
  const { state: cartState } = useCart();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [totalOrders, setTotalOrders] = useState(0);
  const [cancelingOrderId, setCancelingOrderId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [cancelPassword, setCancelPassword] = useState("");
  const [cancelError, setCancelError] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);

  const isArabic = cartState.language === "ar";
  const currentPage = Number(searchParams.get("page")) || 1;

  useEffect(() => {
    const fetchOrdersWithStatus = async () => {
      setLoadingOrders(true);
      try {
        // Read orders from localStorage
        const storedOrders = localStorage.getItem("orders");
        let allOrders: Order[] = [];

        if (storedOrders) {
          const ordersObj = JSON.parse(storedOrders) as { [key: string]: Order };
          allOrders = Object.values(ordersObj);

          // Extract order IDs to fetch latest statuses
          const orderIds = allOrders.map(order => order._id).filter(Boolean);
          
          if (orderIds.length > 0) {
            try {
              // Fetch latest order statuses from server
              const response = await fetch(`/api/orders?ids=${orderIds.join(',')}&limit=${orderIds.length}`);
              
              if (response.ok) {
                const { orders: serverOrders } = await response.json();
                
                // Create a map of server order statuses
                const serverOrderMap = new Map();
                serverOrders.forEach((serverOrder: any) => {
                  serverOrderMap.set(serverOrder._id, {
                    status: serverOrder.status
                  });
                });

                // Update local orders with server statuses
                let hasUpdates = false;
                const updatedOrdersObj = { ...ordersObj };
                
                allOrders.forEach(order => {
                  const serverData = serverOrderMap.get(order._id);
                  if (serverData && serverData.status !== order.status) {
                    updatedOrdersObj[order._id as string] = {
                      ...order,
                      status: serverData.status
                    };
                    hasUpdates = true;
                  }
                });

                // Update localStorage if there are changes
                if (hasUpdates) {
                  localStorage.setItem("orders", JSON.stringify(updatedOrdersObj));
                  allOrders = Object.values(updatedOrdersObj);
                  
                  // Sort again after updates
                  allOrders.sort((a, b) => 
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                  );
                }
              }
            } catch (fetchError) {
              console.error("Error fetching order statuses:", fetchError);
              // Continue with local data if server fetch fails
            }
          }

          // Sort orders by createdAt in descending order (latest first)
          allOrders.sort((a, b) => 
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
    };

    fetchOrdersWithStatus();
  }, [currentPage]);

  const refreshOrderStatuses = async () => {
    setRefreshing(true);
    try {
      const storedOrders = localStorage.getItem("orders");
      if (!storedOrders) return;

      const ordersObj = JSON.parse(storedOrders) as { [key: string]: Order };
      const orderIds = Object.keys(ordersObj);
      
      if (orderIds.length > 0) {
        const response = await fetch(`/api/orders?ids=${orderIds.join(',')}&limit=${orderIds.length}`);
        
        if (response.ok) {
          const { orders: serverOrders } = await response.json();
          
          const serverOrderMap = new Map();
          serverOrders.forEach((serverOrder: any) => {
            serverOrderMap.set(serverOrder._id, {
              status: serverOrder.status
            });
          });

          let hasUpdates = false;
          const updatedOrdersObj = { ...ordersObj };
          
          Object.keys(ordersObj).forEach(orderId => {
            const serverData = serverOrderMap.get(orderId);
            if (serverData && serverData.status !== ordersObj[orderId].status) {
              updatedOrdersObj[orderId] = {
                ...ordersObj[orderId],
                status: serverData.status
              };
              hasUpdates = true;
            }
          });

          if (hasUpdates) {
            localStorage.setItem("orders", JSON.stringify(updatedOrdersObj));
            
            // Update current page orders with new status
            const allOrders = Object.values(updatedOrdersObj).sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            
            // Update total orders count
            setTotalOrders(allOrders.length);
            
            // Update current page orders
            const skip = (currentPage - 1) * ITEMS_PER_PAGE;
            const paginatedOrders = allOrders.slice(skip, skip + ITEMS_PER_PAGE);
            setOrders(paginatedOrders);
            
            toast.success(isArabic ? "تم تحديث حالة الطلبات" : "Order statuses updated");
          } else {
            toast.success(isArabic ? "جميع الطلبات محدثة" : "All orders are up to date");
          }
        }
      }
    } catch (error) {
      console.error("Error refreshing order statuses:", error);
      toast.error(isArabic ? "فشل في تحديث حالة الطلبات" : "Failed to refresh order statuses");
    } finally {
      setRefreshing(false);
    }
  };

  const handleCancelOrder = async (order: Order) => {
    // Check cookie before opening dialog
  const cookieAuth = Cookies.get("amtronics_order_auth");
  if (cookieAuth === "true") {
    setIsAuthorized(true);
  } else {
    setIsAuthorized(false);
  }
    setOrderToCancel(order);
    setDialogOpen(true);
  };

  const handleAuthLogin = () => {
    setAuthError("");
    console.log(authEmail, authPassword);
    console.log(AUTH_EMAIL, AUTH_PASSWORD);
    
    
    if (authEmail === AUTH_EMAIL && authPassword === AUTH_PASSWORD) {
      Cookies.set("amtronics_order_auth", "true", { expires: 5 }); // Expires in 3 days
      setIsAuthorized(true);
      setAuthEmail("");
      setAuthPassword("");
      setAuthError("");
      toast.success(isArabic ? "تم تسجيل الدخول بنجاح" : "Login successful");
    } else {
      setAuthError(isArabic ? "بيانات الدخول غير صحيحة" : "Invalid credentials");
    }
  };

  const confirmCancelOrder = async () => {
    if (!orderToCancel) return;
    setCancelError("");
    if (!isAuthorized) {
      setCancelError(isArabic ? "يجب تسجيل الدخول أولاً" : "You must login first");
      return;
    }
    setCancelingOrderId(orderToCancel._id as string);
    try {
      const response = await fetch(`/api/orders?id=${orderToCancel._id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        // Update local storage - mark order as canceled
        const storedOrders = localStorage.getItem("orders");
        if (storedOrders) {
          const ordersObj = JSON.parse(storedOrders);
          if (ordersObj[orderToCancel._id as string]) {
            ordersObj[orderToCancel._id as string] = {
              ...ordersObj[orderToCancel._id as string],
              status: "canceled"
            };
            localStorage.setItem("orders", JSON.stringify(ordersObj));
            
            // Update the orders state immediately
            const allOrders = Object.values(ordersObj).sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            
            // Update total orders count
            setTotalOrders(allOrders.length);
            
            // Update current page orders
            const skip = (currentPage - 1) * ITEMS_PER_PAGE;
            const paginatedOrders = allOrders.slice(skip, skip + ITEMS_PER_PAGE);
            setOrders(paginatedOrders);
          }
        }

        toast.success(isArabic ? "تم إلغاء الطلب بنجاح" : "Order canceled successfully");
        setDialogOpen(false);
        setOrderToCancel(null);
        setCancelPassword("");
        setCancelError("");
      } else {
        toast.error(data.error || (isArabic ? "فشل في إلغاء الطلب" : "Failed to cancel order"));
      }
    } catch (error) {
      console.error("Error canceling order:", error);
      toast.error(isArabic ? "حدث خطأ أثناء إلغاء الطلب" : "An error occurred while canceling the order");
    } finally {
      setCancelingOrderId(null);
    }
  };

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
    <div className="w-full  px-4 py-3 md:py-6" dir={isArabic ? "rtl" : "ltr"}>
      {/* Header with refresh button */}
      <div className="w-full flex flex-col items-center mb-3 md:mb-6 gap-4">
         <div className="flex items-center w-full gap-2 justify-between">
          <Link
        href="/"
        className=" flex items-center text-sm text-neutral-600 transition-colors duration-200 hover:text-[#00B8DB] md:text-base"
      >
        <ChevronLeft className="mr-1 h-5 w-5" />
        {isArabic ? "العودة للرئيسية" : "Back to Home"}
      </Link>
      <Button
          variant="outline"
          size="sm"
          onClick={refreshOrderStatuses}
          disabled={refreshing || loadingOrders}
          className="gap-2"
        >
          <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
          {/* {isArabic ? "تحديث" : "Refresh"} */}
        </Button>
         </div>
      <div className="md:mb-4 flex justify-center">
        <CheckCircle className="h-20 w-20 text-green-500 md:h-28 md:w-28" />
      </div>
      <h1 className="mb-4 text-center text-4xl font-bold text-neutral-800 md:mb-6 md:text-5xl">
        {isArabic ? "طلباتي" : "My Orders"}
      </h1>
        
      </div>

      {loadingOrders ? (
        <div className="py-12 text-center">
          <LoadingDots />
        </div>
      ) : orders.length === 0 ? (
        <div className="space-y-6 py-12 text-center">
          <p className="text-base sm:text-lg text-neutral-600">
            {isArabic ? "لا توجد طلبات حتى الآن." : "You have no orders yet."}
          </p>
          <Link href="/products" prefetch={false}>
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
                className={`group overflow-hidden rounded-lg py-2 shadow-sm transition-all duration-200 hover:shadow-md ${
                  index === 0 && currentPage === 1
                    ? "border-2 border-[#FEEE18]"
                    : "border border-neutral-100"
                }`}
              >
                <div className="flex flex-col-reverse w-full md:flex-row items-center justify-between gap-2 p-2 md:p-6  relative">
                  
                  <div className="flex flex-col flex-1 w-full">
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
                          {order._id?.substring(0, 8)}...
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
                  </div>
                  <div className="flex flex-col items-end gap-2 justify-end md:w-fit w-full">
                    {/* Order Status */}
                    <Badge
  variant="default"
  className={
    order.status === "canceled"
      ? "bg-red-100 text-red-800"
      : order.status === "completed"
      ? "bg-blue-100 text-blue-800"
      : "bg-green-100 text-green-800"
  }
>
  {
    order.status === "canceled"
      ? (isArabic ? "ملغى" : "Canceled")
      : order.status === "completed"
      ? (isArabic ? "مكتمل" : "Completed")
      : (isArabic ? "قيد التنفيذ" : "Pending")
  }

  {index === 0 && currentPage === 1 && (
    <div className="flex items-center text-xs px-2 py-1 text-[#52A8FF] bg-neutral-100 font-semibold rounded-md gap-1">
      <ArrowUpCircle size={14} className="text-[#52A8FF]" />
      {isArabic ? "الحالي" : "Current"}
    </div>
  )}
</Badge>

                    
                    
                  </div>
                </div>
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
                      {/* Payment Method */}
      <p className="text-xs sm:text-sm text-neutral-600">
        {isArabic ? "طريقة الدفع:" : "Payment Method:"}{" "}
        <span className="font-medium">
          {order.paymentMethod === "knet"
            ? isArabic ? "كي نت في المحل" : "In shop (Knet)"
            : isArabic ? "الدفع عند التسليم" : "Cash on Delivery"}
        </span>
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
                            key={isProjectBundleItem ? `bundle-${itemIndex}` : ((item as CartItem).product?._id || `item-${itemIndex}`)}
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
                                    {(item as ProjectBundleItem).engineerEmails && (item as ProjectBundleItem).engineerEmails.length > 0 && (
                                      <span className="text-xs sm:text-sm text-blue-700 block mt-1">
                                        {isArabic ? "البريد الإلكتروني:" : "Email:"} {(item as ProjectBundleItem).engineerEmails.join(", ")}
                                      </span>
                                    )}
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
                                    {(item as CartItem).product?.image ? (
                                      <img
                                        src={(item as CartItem).product.image.split(",")[0]}
                                        alt={isArabic ? (item as CartItem).product.ar_name : (item as CartItem).product.en_name}
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
                                      {isArabic ? (item as CartItem).product?.ar_name || "منتج" : (item as CartItem).product?.en_name || "Product"}
                                    </span>
                                    {/* Show variety if exists */}
                {(item as CartItem).product?.variety && (
                  <span className="block text-xs text-gray-500">
                    {isArabic ? "النوع:" : "Variety:"} {(item as CartItem).product.variety}
                  </span>
                )}
                                    <span className="text-xs sm:text-sm text-neutral-500">
                                      {isArabic
                                        ? `سعر الوحدة: ${((item as CartItem).product?.price?.toFixed(2) || "0.00")} د.ك`
                                        : `Unit Price: ${((item as CartItem).product?.price?.toFixed(2) || "0.00")} KD`}
                                    </span>
                                     {(item as CartItem).welding && (
                  <span className="text-xs sm:text-sm text-[#52A8FF] font-semibold mt-1">
                    {isArabic ? "تم اختيار التلحيم" : "Welding checked"}
                  </span>
                )}
                                  </div>
                                </div>
                                <div className="flex flex-col items-end leading-tight">
                                  {(item as CartItem).product?.discount && (item as CartItem).product?.discount > 0 ? (
                                    <>
                                      <span className="font-semibold text-sm sm:text-base text-green-600">
                                        {(() => {
                                          const product = (item as CartItem).product!;
                                          const discountAmount = product.price * (product.discount! / 100)
                                          return (product.price - discountAmount).toFixed(2);
                                        })()}{" "}
                                        {isArabic ? "د.ك" : "KD"}
                                      </span>
                                      <span className="text-xs sm:text-sm text-neutral-500 line-through">
                                        {(item as CartItem).product!.price.toFixed(2)} {isArabic ? "د.ك" : "KD"}
                                      </span>
                                    </>
                                  ) : (
                                    <span className="font-semibold text-sm sm:text-base text-neutral-800">
                                      {((item as CartItem).product?.price || 0).toFixed(2)} {isArabic ? "د.ك" : "KD"}
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
                        {Math.max(0, Number(order.total) - Number(order.discount || 0)).toFixed(2)} {isArabic ? "د.ك" : "KD"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm sm:text-base text-neutral-700">
                        {isArabic ? "رسوم التوصيل:" : "Shipping Fee:"}
                      </span>
                      <span className="text-sm sm:text-base text-neutral-700">
                        {(Number(order.shippingFee) ?? 0).toFixed(2)} {isArabic ? "د.ك" : "KD"}
                      </span>
                    </div>
                    {order.discount > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm sm:text-base text-green-600 font-semibold">
                          {isArabic ? "الخصم المطبق:" : "Applied Discount:"}
                        </span>
                        <span className="text-sm sm:text-base text-green-600 font-semibold">
                          -{Number(order.discount).toFixed(2)} {isArabic ? "د.ك" : "KD"}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between border-t border-dashed border-neutral-200 pt-3">
                      <span className="text-base sm:text-lg font-bold text-neutral-800">
                        {isArabic ? "المجموع الكلي:" : "Total Amount:"}
                      </span>
                      <span className="text-base sm:text-lg font-bold text-[#00B8DB]">
                        {(Math.max(0, Number(order.total) - Number(order.discount || 0)) + Number(order.shippingFee ?? 0)).toFixed(2)} {isArabic ? "د.ك" : "KD"}
                      </span>
                    </div>
                    
                  </div>
                   {/* Cancel Button - only show if order is not already canceled */}
                    {order.status !== "canceled" && (
                      <div className="flex w-full justify-end py-4 sm:py-6">
                        <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancelOrder(order);
                        }}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                        disabled={cancelingOrderId === order._id}
                      >
                        {cancelingOrderId === order._id ? (
                          <LoadingDots />
                        ) : (
                          <>
                            <X size={14} className="mr-1" />
                            {isArabic ? "إلغاء الطلب" : "Cancel Order"}
                          </>
                        )}
                      </Button>
                      </div>
                    )}
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

      {/* Cancel Order Confirmation Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {isArabic ? "تأكيد إلغاء الطلب" : "Confirm Order Cancellation"}
            </DialogTitle>
            <DialogDescription>
  {isArabic 
    ? `هل أنت متأكد من أنك تريد إلغاء الطلب رقم ${orderToCancel?._id?.substring(0, 8)}...؟ لا يمكن التراجع عن هذا الإجراء.`
    : `Are you sure you want to cancel order ${orderToCancel?._id?.substring(0, 8)}...? This action cannot be undone.`
  }
  <div className="mt-2 text-sm text-yellow-700 bg-yellow-50 rounded p-2">
    {isArabic
      ? <>
          <p>ملاحظة: لا يمكن إلغاء الطلب إلا من قبل المستخدمين المخولين (مثلاً: الإدارة أو الدعم).</p>
          <p>إذا لم تكن مسؤول المتجر، يرجى التواصل معنا عبر واتساب على الرقم <a href="https://wa.me/+96555501387" className="underline text-blue-600">+96555501387</a> لإلغاء الطلب.</p>
        </>
      : <>
          <p>Note: Only authorized roles (e.g., admin or support) can cancel orders.</p>
          <p>If you are not a shop admin, please contact us via WhatsApp at <a href="https://wa.me/+96555501387" className="underline text-blue-600">+96555501387</a> to cancel the order.</p>
        </>
    }
  </div>
</DialogDescription>
          </DialogHeader>
          {!isAuthorized ? (
            <div className="my-4 space-y-2">
              <label className="block text-sm font-medium mb-1" htmlFor="auth-email">
                {isArabic ? "البريد الإلكتروني" : "Email"}
              </label>
              <input
                id="auth-email"
                type="email"
                className="w-full border rounded px-3 py-2"
                value={authEmail}
                onChange={e => setAuthEmail(e.target.value)}
                disabled={cancelingOrderId !== null}
                autoFocus
              />
              <label className="block text-sm font-medium mb-1" htmlFor="auth-password">
                {isArabic ? "كلمة المرور" : "Password"}
              </label>
              <input
                id="auth-password"
                type="password"
                className="w-full border rounded px-3 py-2"
                value={authPassword}
                onChange={e => setAuthPassword(e.target.value)}
                disabled={cancelingOrderId !== null}
              />
              {authError && <div className="text-red-600 text-sm mt-1">{authError}</div>}
              <Button
                variant="default"
                className="mt-2"
                onClick={handleAuthLogin}
                disabled={cancelingOrderId !== null}
              >
                {isArabic ? "تسجيل الدخول" : "Login"}
              </Button>
            </div>
          ) : (
            <div className="my-4">
              <div className="mb-2 text-green-700 font-semibold">
                {isArabic ? "تم تسجيل الدخول كمستخدم مخول." : "Logged in as authorized user."}
              </div>
              {cancelError && <div className="text-red-600 text-sm mt-1">{cancelError}</div>}
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setDialogOpen(false)
                setOrderToCancel(null)
                setCancelPassword("")
                setCancelError("")
                setAuthEmail("")
                setAuthPassword("")
                setAuthError("")
              }}
              disabled={cancelingOrderId !== null}
            >
              {isArabic ? "إلغاء" : "Cancel"}
            </Button>
            <Button
              variant="destructive"
              onClick={confirmCancelOrder}
              disabled={cancelingOrderId !== null || !isAuthorized}
            >
              {cancelingOrderId !== null ? (
                <LoadingDots />
              ) : (
                isArabic ? "تأكيد الإلغاء" : "Confirm Cancellation"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}