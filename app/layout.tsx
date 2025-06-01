import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { CartProvider } from "@/lib/context"
import Header from "@/components/header"
import TopPromotionalBanner from "@/components/top-promotional-banner"
import { Suspense } from "react"
import { Toaster, toast } from 'sonner'
import Footer from "@/components/footer"
import { WishlistProvider } from "@/lib/wishlist-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Amtronics - Electronics & Educational Kits Store",
  description:
    "Shop premium electronics, educational kits, Raspberry Pi, and lab equipment. Free delivery in Kuwait. أمترونيكس - متجر الإلكترونيات والأطقم التعليمية",
  keywords: "electronics, raspberry pi, lab kits, educational kits, kuwait, أمترونيكس, إلكترونيات",
  openGraph: {
    title: "Amtronics - Electronics & Educational Kits Store",
    description:
      "Shop premium electronics, educational kits, Raspberry Pi, and lab equipment. Free delivery in Kuwait.",
    type: "website",
    locale: "en_US",
    alternateLocale: "ar_KW",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
       <Toaster richColors={true} position="bottom-right" toastOptions={{ duration: 3000 }} />
      <head>
        <link rel="alternate" hrefLang="ar" href="/ar" />
        <link rel="canonical" href="https://amtronics.co" />
      </head>
      <body className={inter.className}>
        <WishlistProvider>
          <CartProvider>
            <TopPromotionalBanner />

            <Suspense>
              <Header />
            </Suspense>

            <main className="min-h-screen w-full px-1 md:px-2 bg-[#FBFAF9]">{children}</main>
            <Footer/>
          </CartProvider>
        </WishlistProvider>
      </body>
    </html>
  )
}
