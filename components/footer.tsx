"use client"

import { useCart } from "@/lib/context"
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function Footer() {
  const { state } = useCart()
  const isArabic = state.language === "ar"
  const dir = isArabic ? "rtl" : "ltr"

  return (
    <footer 
      className="bg-[#091638] text-white py-12 relative overflow-hidden"
      style={{
        backgroundImage: `url('/my-durves-vector.webp')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
      dir={dir}
    >
      <div className="container mx-auto px-4">
       {/* Overlay with blur effect for better text readability */}
       <div className="z-0 absolute inset-0 bg-[#091638]/40 backdrop-blur-lg"></div>
        
        <div className="relative grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold">
              {isArabic ? "أمترونيكس" : "Amtronics"}
            </h3>
            <p className="text-sm">
              {isArabic 
                ? "مزودك الموثوق لمكونات الإلكترونيات في الكويت"
                : "Your trusted provider for electronic components in Kuwait"}
            </p>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5" color="#FEEE00" />
              <p className="text-sm">
                {isArabic 
                  ? "شارع السور، مدينة الكويت، الكويت"
                  : "Al Soor Street, Kuwait City, Kuwait"}
              </p>
            </div>
            <a className="flex items-center gap-2" href="https://wa.me/+96555501387" target="_blank" rel="noopener noreferrer">
              <Phone className="h-5 w-5" color="#FEEE00" />
              <p className="text-sm">+9 655 550 1387</p>
            </a>
            <a className="flex items-center gap-2" href="tel:+96555501493">
              <Phone className="h-5 w-5" color="#FEEE00" />
              <p className="text-sm">+9 655 550 1493</p>
            </a>
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5" color="#FEEE00" />
              <p className="text-sm">support@amtronics.kw</p>
            </div>
          </div>
         {/* Product Categories */}
         <div className="space-y-4">
            <h3 className="text-xl font-bold">
              {isArabic ? "الفئات" : "Categories"}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/products?category=Kits" className="hover:underline">
                  {isArabic ? "الأطقم" : "Kits"}
                </Link>
              </li>
              <li>
                <Link href="/products?category=Resistor" className="hover:underline">
                  {isArabic ? "المقاومه" : "Resistor"}
                </Link>
              </li>
              <li>
                <Link href="/products?category=Sensor" className="hover:underline">
                  {isArabic ? "المستشعرات" : "Sensor"}
                </Link>
              </li>
              <li>
                <Link href="/products?category=Capacitors" className="hover:underline">
                  {isArabic ? "المكثفات" : "Capacitors"}
                </Link>
              </li>
              <li>
                <Link href="/products?category=Arduino" className="hover:underline">
                  {isArabic ? "أردوينو" : "Arduino"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold">
              {isArabic ? "خدمة العملاء" : "Customer Service"}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/faq" className="hover:underline">
                  {isArabic ? "الأسئلة الشائعة" : "FAQ"}
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:underline">
                  {isArabic ? "الشحن والتوصيل" : "Shipping & Delivery"}
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:underline">
                  {isArabic ? "سياسة الإرجاع" : "Return Policy"}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:underline">
                  {isArabic ? "اتصل بنا" : "Contact Us"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Media & Newsletter */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold">
              {isArabic ? "تابعنا" : "Follow Us"}
            </h3>
            <div className="flex gap-4">
              <a href="https://facebook.com/amtronics" aria-label="Facebook" className="hover:opacity-80">
                <Facebook className="h-6 w-6"  color="#FEEE00"/>
              </a>
              <a href="https://twitter.com/amtronics" aria-label="Twitter" className="hover:opacity-80">
                <Twitter className="h-6 w-6"  color="#FEEE00"/>
              </a>
              <a href="https://instagram.com/amtronics" aria-label="Instagram" className="hover:opacity-80">
                <Instagram className="h-6 w-6"  color="#FEEE00"/>
              </a>
            </div>
            <div className="space-y-2">
              <p className="text-sm">
                {isArabic ? "اشترك في النشرة الإخبارية" : "Subscribe to our Newsletter"}
              </p>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder={isArabic ? "أدخل بريدك الإلكتروني" : "Enter your email"}
                  className="px-3 py-2 rounded-md text-black w-full max-w-[200px] text-sm"
                />
                <Button  variant="secondary" size="sm" >
                  {isArabic ? "اشتراك" : "Subscribe"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        {/* <div className="mt-12 pt-6 border-t border-gray-700 text-center z-50">
          <p className="text-sm">
            © 2025 Amtronics. {isArabic ? "جميع الحقوق محفوظة" : "All rights reserved."}
          </p>
        </div> */}
      </div>
    </footer>
  )
}