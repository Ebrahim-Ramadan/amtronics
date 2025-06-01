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
import { SavedAddressesProvider } from "@/lib/saved-addresses-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "Amtronics - Electronics & Educational Kits Store",
    template: "%s | Amtronics",
  },
  description:
    "Shop premium electronics, educational kits, Raspberry Pi, and lab equipment. Free delivery in Kuwait. أمترونيكس - متجر الإلكترونيات والأطقم التعليمية",
  keywords: [
    "electronics",
    "raspberry pi",
    "lab kits",
    "educational kits",
    "kuwait",
    "3D printing",
    "web development",
    "software solutions",
    "أمترونيكس",
    "إلكترونيات",
    "راسبيري باي",
    "أطقم تعليمية",
    "الكويت",
    "طباعة ثلاثية الأبعاد",
    "تصميم مواقع",
    "حلول برمجية",
  ],
  openGraph: {
    title: {
      default: "Amtronics - Electronics & Educational Kits Store",
      template: "%s | Amtronics",
    },
    description:
      "Shop premium electronics, educational kits, Raspberry Pi, and lab equipment. Free delivery in Kuwait.",
    type: "website",
    locale: "en_US",
    alternateLocale: "ar_KW",
    siteName: "Amtronics",
    images: [
      {
        url: "https://amtronics.co/og-image-en.jpg",
        width: 1200,
        height: 630,
        alt: "Amtronics Electronics Store",
      },
      {
        url: "https://amtronics.co/og-image-ar.jpg",
        width: 1200,
        height: 630,
        alt: "أمترونيكس - متجر الإلكترونيات",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Amtronics - Electronics & Educational Kits Store",
    description:
      "Shop premium electronics, educational kits, Raspberry Pi, and lab equipment. Free delivery in Kuwait.",
    images: ["https://amtronics.co/og-image-en.jpg"],
  },
  alternates: {
    canonical: "https://amtronics.co",
    languages: {
      "en-US": "https://amtronics.co/en",
      "ar-KW": "https://amtronics.co/ar",
    },
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
};

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
        <link rel="alternate" hrefLang="en" href="https://amtronics.co/en" />
        <link rel="alternate" hrefLang="ar" href="https://amtronics.co/ar" />
        <link rel="alternate" hrefLang="x-default" href="https://amtronics.co" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className={inter.className}>
        <WishlistProvider>
          <CartProvider>
            <SavedAddressesProvider>
              <TopPromotionalBanner />

              <Suspense>
                <Header />
              </Suspense>

              <main className="min-h-screen w-full px-1 md:px-2 bg-[#FBFAF9]">{children}</main>
              <Footer/>
            </SavedAddressesProvider>
          </CartProvider>
        </WishlistProvider>
      </body>
    </html>
  )
}
