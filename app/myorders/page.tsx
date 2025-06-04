"use client"

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CheckCircle, ChevronLeft, Copy } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Order, CustomerInfo } from '@/lib/types'; // Import Order and CustomerInfo types
import { useCart } from '@/lib/context'; // Import useCart hook
import { useSearchParams, useRouter } from 'next/navigation'; // Import navigation hooks
import { Pagination } from '@/components/ui/pagination'; // Import Pagination component
import { Badge } from '@/components/ui/badge'; // Import Badge component
import { toast } from 'sonner';

const ITEMS_PER_PAGE = 5; // Define items per page for pagination

export default function MyOrdersPage() {
  const { state: cartState } = useCart(); // Get language from cart state
  const searchParams = useSearchParams(); // Get search params for pagination
  const router = useRouter(); // Get router for navigation
  const [orderIds, setOrderIds] = useState<string[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [totalOrders, setTotalOrders] = useState(0); // State to store total orders count

  const isArabic = cartState.language === "ar";
  const dir = isArabic ? "rtl" : "ltr";

  const currentPage = Number(searchParams.get('page')) || 1; // Get current page from URL

  useEffect(() => {
    // Read order IDs from local storage
    const storedOrderIds = localStorage.getItem('orderIds');
    if (storedOrderIds) {
      try {
        const ids = JSON.parse(storedOrderIds) as string[];
        setOrderIds(ids);
      } catch (error) {
        console.error('Error parsing order IDs from local storage:', error);
        setOrderIds([]);
        setLoadingOrders(false);
      }
    } else {
      setLoadingOrders(false);
    }
  }, []);

  useEffect(() => {
    // Fetch order details when orderIds or currentPage change
    const fetchOrders = async () => {
      if (orderIds.length > 0) {
        setLoadingOrders(true);
        const skip = (currentPage - 1) * ITEMS_PER_PAGE;
        try {
          const response = await fetch(`/api/orders?ids fuzzy=${orderIds.join(',')}&limit=${ITEMS_PER_PAGE}&skip=${skip}`);
          if (response.ok) {
            const data = await response.json() as { orders: Order[], total: number }; // Expecting orders and total
            console.log('orderdata', data);
            setOrders(data.orders);
            setTotalOrders(data.total); // Set total orders count

            // Identify and remove IDs not found in the database from local storage
            const fetchedOrderIds = new Set(data.orders.map(order => order._id)); // Use fetched orders for set
            const filteredOrderIds = orderIds.filter(id => fetchedOrderIds.has(id));

            if (filteredOrderIds.length !== orderIds.length) {
              // Update state and local storage only if there are changes
              setOrderIds(filteredOrderIds);
              localStorage.setItem('orderIds', JSON.stringify(filteredOrderIds));
              console.log(`Removed ${orderIds.length - filteredOrderIds.length} non-existent order IDs from local storage.`);
            }
          } else {
            console.error('Error fetching orders:', response.statusText);
            setOrders([]);
            setTotalOrders(0); // Reset total on error
          }
        } catch (error) {
          console.error('Error fetching orders:', error);
          setOrders([]);
          setTotalOrders(0); // Reset total on error
        } finally {
          setLoadingOrders(false);
        }
      } else {
        setOrders([]);
        setTotalOrders(0); // Reset total if no order IDs
        setLoadingOrders(false);
      }
    };

    fetchOrders();
  }, [orderIds, currentPage]); // Depend on orderIds and currentPage

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(newPage));
    router.push(`/myorders?${params.toString()}`);
  };

  const totalPages = Math.ceil(totalOrders / ITEMS_PER_PAGE); // Calculate total pages

  // Helper function to get status badge variant
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'processing':
        return 'warning';
      case 'shipped':
        return 'info';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  // Helper function for Arabic status translation
  const translateStatus = (status: string) => {
    if (!isArabic) return status;
    switch (status) {
      case 'pending':
        return 'قيد الانتظار';
      case 'processing':
        return 'قيد المعالجة';
      case 'shipped':
        return 'تم الشحن';
      case 'delivered':
        return 'تم التوصيل';
      case 'cancelled':
        return 'ملغاة';
      default:
        return status;
    }
  };

  return (
    <div className="container mx-auto px-4 py-2 md:py-8" dir={dir}>
      <Link
        href="/"
        className="inline-flex items-center text-sm md:text-base text-neutral-600 hover:text-[#00B8DB] transition-colors duration-200 mb-3 md:mb-4"
      >
        <ChevronLeft className="h-5 w-5 mr-1" />
        {isArabic ? "العودة للرئيسية" : "Back to Home"}
      </Link>
      <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 md:h-32 w-16 md:w-32 text-green-500" />
            </div>
      <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-4 md:mb-8 text-neutral-800">
        {isArabic ? "طلباتي" : "My Orders"}
      </h1>

      {loadingOrders ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00B8DB] mx-auto"></div>
              <p className="mt-4 text-neutral-600">{isArabic ? "جاري تحميل الطلبات..." : "Loading orders..."}</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 space-y-6">
              <p className="text-lg text-neutral-600">{isArabic ? "لا توجد طلبات حتى الآن." : "You have no orders yet."}</p>
              <Link href="/products">
                <Button className="bg-[#00B8DB] hover:bg-[#009bb8] text-white px-6 py-3 rounded-full text-base">
                  {isArabic ? "تسوق الآن" : "Shop Now"}
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              <ul className="space-y-4">
                {orders.map((order) => (
                  <li
                    key={order._id}
                    className="bg-white p-3 md:p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border border-neutral-100"
                  >
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-3 md:space-y-0">
                      <div className="flex items-center gap-2 font-semibold text-lg text-neutral-800 break-all">
                        {isArabic ? `رقم الطلب: ${order._id}` : `Order ID: ${order._id}`} <Copy 
                        onClick={() => {
                          navigator.clipboard.writeText(order._id as string)
                          toast.success(isArabic ? "تم نسخ رقم الطلب" : "Copied order ID")
                        }}
                        size={14} className="text-neutral-500" />
                      </div>
                      <Badge
                        variant={getStatusVariant(order.status)}
                        className="text-sm px-3 py-1 rounded-full"
                      >
                        {translateStatus(order.status)}
                      </Badge>
                    </div>
                    <div className="text-base text-neutral-700 mt-2">
                      {isArabic ? `المجموع: ${order.total.toFixed(2)} د.ك` : `Total: ${order.total.toFixed(2)} KD`}
                    </div>
                    <div className="text-sm text-neutral-500 mt-1">
                      {isArabic
                        ? `التاريخ: ${new Date(order.createdAt).toLocaleDateString('ar-KW')}`
                        : `Date: ${new Date(order.createdAt).toLocaleDateString()}`}
                    </div>
                    <div className="text-sm text-neutral-500 mt-2 space-y-1">
                      <p>{isArabic ? `الاسم: ${order.customerInfo.name}` : `Name: ${order.customerInfo.name}`}</p>
                      <p>{isArabic ? `الهاتف: ${order.customerInfo.phone}` : `Phone: ${order.customerInfo.phone}`}</p>
                      <p>To: {order.customerInfo.block} | {order.customerInfo.area} | {order.customerInfo.city} | {order.customerInfo.country}</p>
                    
                    </div>
                  </li>
                ))}
              </ul>
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
            </div>
          )}
    </div>
  );
}