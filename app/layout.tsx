import type React from "react";
import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/lib/context";
import Header from "@/components/header";
import TopPromotionalBanner from "@/components/top-promotional-banner";
import { Suspense } from "react";
import { Toaster } from 'sonner';
import Footer from "@/components/footer";
import { WishlistProvider } from "@/lib/wishlist-context";
import { SavedAddressesProvider } from "@/lib/saved-addresses-context";
import { Inter, Noto_Sans_Arabic } from "next/font/google";
import { Analytics } from "@vercel/analytics/next"
import { FixedWhatsappIcon } from "@/components/fixed-whatsapp-icon";

const inter = Inter({ subsets: ["latin"] });
const notoSansArabic = Noto_Sans_Arabic({ subsets: ["arabic"], weight: ["400", "700"] });

export const metadata: Metadata = {
  title: {
    default: "Amtronics - Electronics & Educational Kits Store",
    template: "%s | Amtronics",
  },
  description:
    "Shop premium electronics, educational kits, Raspberry Pi, and lab equipment. Free delivery in Kuwait. أمترونيكس - متجر الإلكترونيات والأطقم التعليمية",
  keywords: [
    // Core Business Keywords (English)
    "electronics amtronics Kuwait",
    "amtronics Kuwait",
    "amtronics electronics",
    "educational kits Kuwait",
    "Raspberry Pi Kuwait",
    "3D printing Kuwait",
    "web development Kuwait",
    "software solutions Kuwait",
    "electronics store Kuwait",
    "lab equipment Kuwait",
    "innovative projects Kuwait",
    "custom software Kuwait",
    "app development Kuwait",
    "Arduino Kuwait",
    "microcontrollers Kuwait",
    "STEM kits Kuwait",
    "robotics kits Kuwait",
    "circuit components Kuwait",
    "3D printing services Kuwait",
    "website design Kuwait",
    "mobile app development Kuwait",
    "free delivery electronics Kuwait",
    "Raspberry Pi 5 Kuwait",
    "electronics components Kuwait",
    "DIY electronics Kuwait",
    "coding kits Kuwait",
    "programming solutions Kuwait",
    "Kuwait tech store",
    "Amtronics Kuwait",
    "electronics projects Kuwait",
    "3D printed prototypes Kuwait",
    "custom web design Kuwait",
    "software development Kuwait",
    "educational technology Kuwait",
    "maker tools Kuwait",
    "IoT devices Kuwait",
    "open-source hardware Kuwait",
    // Core Business Keywords (Arabic)
    "أمترونيكس",
    "إلكترونيات الكويت",
    "أطقم تعليمية الكويت",
    "راسبيري باي الكويت",
    "طباعة ثلاثية الأبعاد الكويت",
    "تصميم مواقع الكويت",
    "حلول برمجية الكويت",
    "متجر إلكترونيات الكويت",
    "معدات مختبرات الكويت",
    "مشاريع مبتكرة الكويت",
    "برمجيات مخصصة الكويت",
    "تطوير تطبيقات الكويت",
    "أردوينو الكويت",
    "متحكمات دقيقة الكويت",
    "أطقم STEM الكويت",
    "أطقم روبوتات الكويت",
    "مكونات إلكترونية الكويت",
    "خدمات طباعة ثلاثية الأبعاد الكويت",
    "تصميم تطبيقات جوال الكويت",
    "توصيل مجاني إلكترونيات الكويت",
    "راسبيري باي 5 الكويت",
    "مكونات دوائر الكويت",
    "إلكترونيات DIY الكويت",
    "أطقم برمجة الكويت",
    "حلول برمجة الكويت",
    "متجر تقني الكويت",
    "مشاريع إلكترونيات الكويت",
    "نماذج ثلاثية الأبعاد الكويت",
    "تصميم ويب مخصص الكويت",
    "تطوير برمجيات الكويت",
    "تكنولوجيا تعليمية الكويت",
    "أدوات صانعي الكويت",
    "أجهزة إنترنت الأشياء الكويت",
    "أجهزة مفتوحة المصدر الكويت",
  ],
  applicationName: "AMTRONICS",
  // authors: [{ name: "OSOSS", url: "https://ososs.com/ar" }],
  generator: "OSOSS",
  creator: "OSOSS",
  publisher: "OSOSS",
  formatDetection: {
    telephone: false,
    address: false,
    email: false,
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://amtronics.co",
    languages: {
      "en-US": "https://amtronics.co/",
      "ar-KW": "https://amtronics.co/",
    },
  },
  openGraph: {
    title: {
      default: "Amtronics - Electronics & Educational Kits Store",
      template: "%s | Amtronics",
    },
    description:
      "Shop premium electronics, educational kits, Raspberry Pi, and lab equipment. Free delivery in Kuwait. أمترونيكس - متجر الإلكترونيات والأطقم التعليمية",
    type: "website",
    url: "https://amtronics.co",
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
};

export default function RootLayout({
  children,
  params: { locale = "en" },
}: {
  children: React.ReactNode;
  params: { locale?: string };
}) {
  const isArabic = locale === "ar";
  return (
    <html lang={isArabic ? "ar" : "en"} dir={isArabic ? "rtl" : "ltr"}>
      {/* <head>
<script
  crossOrigin="anonymous"
  src="//unpkg.com/react-scan/dist/auto.global.js"
></script>
      </head> */}
      <body className="bg-[#FBFAF9]">
        <FixedWhatsappIcon/>
        <WishlistProvider>
          <CartProvider>
            <SavedAddressesProvider>
              <TopPromotionalBanner />
              <Suspense>
                <Header />
              </Suspense>
              <main className="min-h-screen w-full md:px-2 bg-[#FBFAF9]">{children}</main>
              <Footer />
            </SavedAddressesProvider>
          </CartProvider>
        </WishlistProvider>
        <Toaster richColors={true} position="bottom-right" toastOptions={{ duration: 3000 }} />
        <Analytics/>
      </body>
    </html>
  );
}