'use client';

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/context";
import { ArrowUpRight } from "lucide-react";

const categories = [
  {
    en_name: "Lab Kits",
    ar_name: "أطقم المختبر",
    image: "/categories/lab-kit.webp",
    color: "bg-gradient-to-br from-blue-400 to-blue-600",
    link: "/products?category=Kits",
    count: "50+",
  },
  {
    en_name: "New Arrivals",
    ar_name: "وصل حديثاً",
    image: "/categories/new-arrivals.webp",
    color: "bg-gradient-to-br from-pink-400 to-pink-600",
    link: "/products?recent=true",
    count: "15+",
  },
  {
    en_name: "Raspberry Pi",
    ar_name: "راسبيري باي",
    image: "/categories/raspberry-pi.webp",
    color: "bg-gradient-to-br from-green-400 to-green-600",
    link: "/products?search=raspberry",
    count: "25+",
  },
  {
    en_name: "Tools",
    ar_name: "أدوات",
    image: "/categories/electronic-tools.webp",
    color: "bg-gradient-to-br from-yellow-400 to-orange-500",
    link: "/products?category=Tools",
    count: "30+",
  },
  {
    en_name: "Arduino",
    ar_name: "أردوينو",
    image: "/categories/arduino.webp",
    color: "bg-gradient-to-br from-teal-400 to-teal-600",
    link: "/products?search=arduino",
    count: "40+",
  },
  {
    en_name: "Components",
    ar_name: "مكونات",
    image: "/categories/electronics-components.webp",
    color: "bg-gradient-to-br from-red-400 to-red-600",
    link: "/products?category=Components",
    count: "200+",
  },
  {
    en_name: "Sensors",
    ar_name: "حساسات",
    image: "/categories/sensors.webp",
    color: "bg-gradient-to-br from-purple-400 to-purple-600",
    link: "/products?category=Sensors",
    count: "80+",
  },


  {
    en_name: "Modules",
    ar_name: "وحدات",
    image: "/categories/electronic-modules.webp",
    color: "bg-gradient-to-br from-indigo-400 to-indigo-600",
    link: "/products?category=Modules",
    count: "60+",
  },

];

export default function EnhancedCategories() {
  const { state } = useCart();
  const isArabic = state.language === "ar";

  return (
    <div>
      {/* Mobile: horizontal scroll, Desktop: grid */}
      <div className="flex md:grid md:grid-cols-8 gap-2 md:gap-4 pt-6 py-2 overflow-x-auto scrollbar-hide">
        {categories.map((category, index) => (
          <Link
          prefetch={false}
            key={index}
            href={category.link}
            className="group mb-1 md:mb-0 flex-shrink-0 md:flex-shrink md:w-auto min-w-[140px] md:min-w-0 flex flex-col items-center justify-center"
            style={{ maxWidth: '180px' }}
          >
            <div
              className={`${category.color} rounded-xl p-2 md:p-2 mb-2 group-hover:shadow-lg group-hover:scale-105 transition-all duration-300 shadow-sm flex items-center justify-center w-full`}
            >
              <div className="w-16 h-16 md:w-32 md:h-28 flex items-center justify-center">
                <Image
                  unoptimized
                  src={category.image || "/placeholder.svg"}
                  alt={isArabic ? category.ar_name : category.en_name}
                  width={96}
                  height={96}
                  className="object-contain w-full h-full rounded-xl"
                />
              </div>
            </div>
            <div className="flex flex-col items-center justify-center w-full">
              <h3 className="font-bold text-sm md:text-sm text-gray-800 md:mb-1 text-center">
                {isArabic ? category.ar_name : category.en_name}
              </h3>
              <div className="flex items-center justify-center">
                <p className="font-semibold text-[11px] text-cyan-500">{category.count}</p>
                <ArrowUpRight size={14} color="#00C3D1"/>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}