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
		name: "Arduino",
		logo: "/categories/arduino.webp",
		link: "/products?category=Arduino",
	},
	{
		name: "SparkFun",
		logo: "/brands/sparkfun.png",
		link: "/products?category=Sparkfun",
	},
	{
		name: "Yahboom",
		logo: "/brands/Yahboom.webp",
		link: "/products?category=Yahboom",
	},
	{
		name: "Acebott",
		logo: "/brands/Acebott.webp",
		link: "/products?category=Acebott",
	},
]

export default function BrandShowcase() {
	const { state } = useCart()
	const isArabic = state.language === "ar"

	return (
		<div className="bg-gray-50 rounded-lg px-6 mb-8">
			{/* Official Keyestudio Reseller Section - Vercel Inspired */}
			<section
				id="official-resellers"
				className="mb-12 flex flex-col items-center justify-center"
			>
				<div className="relative flex flex-col items-center justify-center w-full max-w-xl rounded-2xl border border-neutral-200 bg-gradient-to-br from-yellow-50 via-white to-yellow-100 shadow-sm py-10 px-6 md:px-16">
					<div className="absolute top-4 right-4">
						<span className="px-3 py-1 rounded-full bg-yellow-400 text-yellow-900 text-xs font-semibold shadow-lg">
							{isArabic ? "موزع رسمي" : "Official Distributor"}
						</span>
					</div>
					<img
						src="/categories/Keyestudio-Logo.jpg"
						alt="Keyestudio"
						// width={120}
						// height={120}
						className="mb-4 rounded-lg shadow-md bg-white"
						// unoptimized
					/>
					<h3 className="text-2xl md:text-3xl font-extrabold text-yellow-700 mb-2 tracking-tight text-center">
						{isArabic
							? "نحن الموزع الرسمي لـ Keyestudio"
							: "We are the Official Keyestudio Distributor"}
					</h3>
					<p className="text-neutral-700 text-center mb-4 max-w-md">
						{isArabic
							? "احصل على منتجات Keyestudio الأصلية مباشرة من الموزع الرسمي في الكويت. الجودة والضمان والدعم المميز."
							: "Get genuine Keyestudio products directly from the Official Distributor in Kuwait. Quality, warranty, and premium support."}
					</p>
					<Link
					prefetch={false}
						href="/products?category=Keyestudio"
						className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold shadow transition"
					>
						{isArabic ? "تسوق Keyestudio" : "Shop Keyestudio"}
						<svg
							width="18"
							height="18"
							fill="none"
							viewBox="0 0 24 24"
						>
							<path
								d="M5 12h14M13 6l6 6-6 6"
								stroke="#783f04"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
					</Link>
				</div>
			</section>

			<h2 className="text-2xl font-bold text-center mb-6">
				{isArabic ? "العلامات التجارية المميزة" : "Featured Brands"}
			</h2>
			<div className="grid grid-cols-2 md:grid-cols-5 gap-6">
				{brands.map((brand, index) => (
					<Link
						key={index}
						href={brand.link}
						className="flex items-center justify-center bg-white rounded-lg hover:shadow-md transition-shadow group"
					>
						<img
							src={brand.logo || "/placeholder.svg"}
							alt={brand.name}
							className="py-2 object-contain group-hover:scale-105 transition-transform"
						/>
					</Link>
				))}
			</div>
		</div>
	)
}
