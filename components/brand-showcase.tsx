"use client"

import Image from "next/image"
import Link from "next/link"
import { useCart } from "@/lib/context"

const brands = [
  {
    name: "Raspberry Pi",
    logo: "/categories/raspberry-pi.webp",
    link: "/products?category=Raspberry+Pi",
  },
  {
    name: "Keyestudio",
    logo: "/categories/Keyestudio-Logo.jpg",
    link: "/products?category=Keyestudio",
  },
  {
    name: "Arduino",
    logo: "/categories/arduino.webp",
    link: "/products?category=Arduino",
  },
  {
    name: "Adafruit",
    logo: "/brands/adafruit.png",
    link: "/products?search=adafruit",
  },
  {
    name: "SparkFun",
    logo: "/brands/sparkfun.png",
    link: "/products?category=Sparkfun",
  },
]

export default function BrandShowcase() {
  const { state } = useCart()
  const isArabic = state.language === "ar"

  return (
    <div className="bg-gray-50 rounded-lg px-6 mb-8">
      <h2 className="text-2xl font-bold text-center mb-6">
        {isArabic ? "العلامات التجارية المميزة" : "Featured Brands"}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
        {brands.map((brand, index) => (
          <Link
            key={index}
            href={brand.link}
            className="flex items-center justify-center  bg-white rounded-lg hover:shadow-md transition-shadow group"
          >
            <Image
            unoptimized
              src={brand.logo || "/placeholder.svg"}
              alt={brand.name}
              width={200}
              height={100}
              className="py-2 object-contain group-hover:scale-105 transition-transform"
            />
          </Link>
        ))}
      </div>
    </div>
  )
}
