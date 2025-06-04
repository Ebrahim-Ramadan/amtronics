"use client"

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function MyOrdersPage() {
  const [orderIds, setOrderIds] = useState<string[]>([]);
  const isArabic = false;
  const dir = isArabic ? "rtl" : "ltr";

  useEffect(() => {
    // Read order IDs from local storage
    const storedOrderIds = localStorage.getItem('orderIds');
    if (storedOrderIds) {
      try {
        setOrderIds(JSON.parse(storedOrderIds));
      } catch (error) {
        console.error('Error parsing order IDs from local storage:', error);
        setOrderIds([]); // Clear if parsing fails
      }
    }
  }, []); // Empty dependency array means this effect runs only once on mount

  return (
    <div className="mx-auto md:px-20 py-4 md:py-6" dir={dir}>
      <Link href="/" className="font-medium text-neutral-500 hover:text-[#00B8DB] text-xs md:text-sm flex justify-start items-center mb-2 text-center">
        <ChevronLeft className="h-4 w-4" />
        {isArabic ? "العودة للرئيسية" : "Back to Home"}
      </Link>
      <h1 className="text-3xl md:text-5xl font-bold mb-4 md:mb-8 text-center">{isArabic ? "طلباتي" : "My Orders"}</h1>

      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-xl md:text-3xl">{isArabic ? "قائمة الطلبات" : "Order List"}</CardTitle>
        </CardHeader>
        <CardContent className="px-3 md:px-6">
          {orderIds.length === 0 ? (
            <div className="text-center py-8 space-y-4">
              <p className="text-gray-600 text-lg">{isArabic ? "لا توجد طلبات حتى الآن." : "You have no orders yet."}</p>
              <Link href="/products">
                <Button>{isArabic ? "تسوق الآن" : "Shop Now"}</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <ul className="list-none p-0 space-y-2">
                {orderIds.map((id) => (
                  <li key={id} className="bg-gray-100 p-3 rounded-md text-sm md:text-base">
                    {isArabic ? `رقم الطلب: ${id}` : `Order ID: ${id}`}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 