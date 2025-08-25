import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { Button } from './ui/button'

export const EmptyCart = ({isArabic} : {isArabic: boolean}) => {
  return (
    <div className="mx-auto px-4 py-8 min-h-[60vh] flex items-center justify-center">
        <div className="text-center py-12 space-y-2 md:space-y-6 flex flex-col items-center justify-center">
          <img src="/empty-cart.webp"  alt="shopping cart" />
          <h1 className="text-xl md:text-3xl font-bold">{isArabic ? "سلة التسوق فارغة" : "Your Amtronics Cart is Empty"}</h1>
          <p className="text-xs md:text-sm text-gray-600  mx-auto">
            {isArabic
              ? "ابدأ التسوق الآن لإضافة منتجات رائعة إلى سلتك!"
              : "Start shopping now to add amazing products to your cart!"}
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/products">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                {isArabic ? "تسوق الآن" : "Shop Now"}
              </Button>
            </Link>
            <Link href="/">
              <Button size="lg" variant="outline">
                {isArabic ? "العودة إلى الرئيسية" : "Return to Home"}
              </Button>
            </Link>
          </div>
        </div>
      </div>
  )
}
