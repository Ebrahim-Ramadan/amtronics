"use client"

import Link from "next/link"
import Image from "next/image"
import { useCart } from "@/lib/context"

const categories = [
  {
    en_name: "Lab Kits",
    ar_name: "أطقم المختبر",
    image: "/placeholder.svg?height=80&width=80",
    color: "bg-gradient-to-br from-blue-400 to-blue-600",
    link: "/products?category=Kits",
    count: "50+ items",
  },
  {
    en_name: "Raspberry Pi",
    ar_name: "راسبيري باي",
    image: "/placeholder.svg?height=80&width=80",
    color: "bg-gradient-to-br from-green-400 to-green-600",
    link: "/products?search=raspberry",
    count: "25+ items",
  },
  {
    en_name: "Arduino",
    ar_name: "أردوينو",
    image: "/placeholder.svg?height=80&width=80",
    color: "bg-gradient-to-br from-teal-400 to-teal-600",
    link: "/products?search=arduino",
    count: "40+ items",
  },
  {
    en_name: "Sensors",
    ar_name: "حساسات",
    image: "/placeholder.svg?height=80&width=80",
    color: "bg-gradient-to-br from-purple-400 to-purple-600",
    link: "/products?category=Sensors",
    count: "80+ items",
  },
  {
    en_name: "Components",
    ar_name: "مكونات",
    image: "/placeholder.svg?height=80&width=80",
    color: "bg-gradient-to-br from-red-400 to-red-600",
    link: "/products?category=Components",
    count: "200+ items",
  },
  {
    en_name: "Tools",
    ar_name: "أدوات",
    image: "/placeholder.svg?height=80&width=80",
    color: "bg-gradient-to-br from-yellow-400 to-orange-500",
    link: "/products?category=Tools",
    count: "30+ items",
  },
  {
    en_name: "Modules",
    ar_name: "وحدات",
    image: "/placeholder.svg?height=80&width=80",
    color: "bg-gradient-to-br from-indigo-400 to-indigo-600",
    link: "/products?category=Modules",
    count: "60+ items",
  },
  {
    en_name: "New Arrivals",
    ar_name: "وصل حديثاً",
    image: "/placeholder.svg?height=80&width=80",
    color: "bg-gradient-to-br from-pink-400 to-pink-600",
    link: "/products?recent=true",
    count: "15+ items",
  },
]

export default function EnhancedCategories() {
  const { state } = useCart()
  const isArabic = state.language === "ar"

  return (
    <div className="py-8">
      <h2 className="text-2xl font-bold text-center mb-6">{isArabic ? "تسوق حسب الفئة" : "Shop by Category"}</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        {categories.map((category, index) => (
          <Link key={index} href={category.link} className="group">
            <div className="text-center">
              <div
                className={`${category.color} rounded-2xl p-4 mb-3 group-hover:scale-105 transition-transform duration-200 shadow-lg`}
              >
                <Image
                  src={category.image || "/placeholder.svg"}
                  alt={isArabic ? category.ar_name : category.en_name}
                  width={80}
                  height={80}
                  className="mx-auto filter brightness-0 invert"
                />
              </div>
              <h3 className="font-medium text-sm text-gray-800 mb-1">
                {isArabic ? category.ar_name : category.en_name}
              </h3>
              <p className="text-xs text-gray-500">{category.count}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
