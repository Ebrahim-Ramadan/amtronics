"use client"

import Link from "next/link"
import { useCart } from "@/lib/context"

const categories = [
  {
    en_name: "Lab Kits",
    ar_name: "أطقم المختبر",
    icon: "🔬",
    color: "bg-blue-500",
    link: "/products?category=Kits",
  },
  {
    en_name: "Raspberry Pi",
    ar_name: "راسبيري باي",
    icon: "🖥️",
    color: "bg-green-500",
    link: "/products?search=raspberry",
  },
  {
    en_name: "Electronics",
    ar_name: "إلكترونيات",
    icon: "⚡",
    color: "bg-yellow-500",
    link: "/products?category=Electronics",
  },
  {
    en_name: "Components",
    ar_name: "مكونات",
    icon: "🔧",
    color: "bg-purple-500",
    link: "/products?category=Components",
  },
  {
    en_name: "Sensors",
    ar_name: "حساسات",
    icon: "📡",
    color: "bg-red-500",
    link: "/products?category=Sensors",
  },
  {
    en_name: "Modules",
    ar_name: "وحدات",
    icon: "📱",
    color: "bg-indigo-500",
    link: "/products?category=Modules",
  },
  {
    en_name: "Tools",
    ar_name: "أدوات",
    icon: "🛠️",
    color: "bg-orange-500",
    link: "/products?category=Tools",
  },
  {
    en_name: "New Arrivals",
    ar_name: "وصل حديثاً",
    icon: "✨",
    color: "bg-pink-500",
    link: "/products?recent=true",
  },
]

export default function CategoryCircles() {
  const { state } = useCart()
  const isArabic = state.language === "ar"

  return (
    <div className="py-8">
      <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide">
        {categories.map((category, index) => (
          <Link key={index} href={category.link} className="flex-shrink-0 flex flex-col items-center group">
            <div
              className={`w-16 h-16 ${category.color} rounded-full flex items-center justify-center text-2xl mb-2 group-hover:scale-110 transition-transform duration-200 shadow-lg`}
            >
              {category.icon}
            </div>
            <span className="text-xs text-center font-medium text-gray-700 max-w-[80px] leading-tight">
              {isArabic ? category.ar_name : category.en_name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
