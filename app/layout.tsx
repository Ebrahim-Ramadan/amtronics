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
    "electronics Kuwait",
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
  authors: [{ name: "OSOSS", url: "https://ososs.com/ar" }],
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
      "en-US": "https://amtronics.co/en",
      "ar-KW": "https://amtronics.co/ar",
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
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link
          rel="preload"
          as="image"
          href="https://zfloos-production-storage.s3.eu-central-1.amazonaws.com/public/upload/companies/4247/store/51738236149679b60f571f792_62994080.png"
          fetchPriority="high"
        />
        <link
          rel="preload"
          as="image"
          href="https://zfloos-production-storage.s3.eu-central-1.amazonaws.com/public/upload/companies/4247/store/41738236144679b60f0ade336_29263303.png"
          fetchPriority="high"
        />
        <link rel="canonical" href="https://amtronics.co" />
        <link rel="alternate" hrefLang="en" href="https://amtronics.co/en" />
        <link rel="alternate" hrefLang="ar" href="https://amtronics.co/ar" />
        <link rel="alternate" hrefLang="x-default" href="https://amtronics.co" />
        <meta name="application-name" content="AMTRONICS" />
        <meta name="author" content="OSOSS" />
        <link rel="author" href="https://ososs.com/ar" />
        <meta name="generator" content="OSOSS" />
        <meta name="referrer" content="origin-when-cross-origin" />
        <meta name="creator" content="OSOSS" />
        <meta name="publisher" content="OSOSS" />
        <meta name="robots" content="index, follow, nocache" />
        <meta
          name="googlebot"
          content="index, follow, max-video-preview:-1, max-image-preview:large, max-snippet:-1"
        />
        <meta name="format-detection" content="telephone=no, address=no, email=no" />
        <meta property="og:title" content="Amtronics - Electronics & Educational Kits Store" />
        <meta property="og:url" content="https://amtronics.co" />
        <meta property="og:locale" content="ar" />
        <meta property="og:locale:alternate" content="en_US" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Amtronics - Electronics & Educational Kits Store" />
        <link
          rel="shortcut icon"
          href="https://zfloos-production-storage.s3.eu-central-1.amazonaws.com/public/upload/companies/4247/null/21738234027679b58ab726a27_44203094.png"
        />
        <link
          rel="icon"
          href="https://zfloos-production-storage.s3.eu-central-1.amazonaws.com/public/upload/companies/4247/null/21738234027679b58ab726a27_44203094.png"
        />
        <link
          rel="apple-touch-icon"
          href="https://zfloos-production-storage.s3.eu-central-1.amazonaws.com/public/upload/companies/4247/null/21738234027679b58ab726a27_44203094.png"
        />
        <link
          rel="apple-touch-icon-precomposed"
          href="https://zfloos-production-storage.s3.eu-central-1.amazonaws.com/public/upload/companies/4247/null/21738234027679b58ab726a27_44203094.png"
        />
        <meta name="next-size-adjust" content="" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              name: "Amtronics",
              description:
                "Amtronics is a Kuwait-based company specializing in electronics, educational kits, Raspberry Pi, 3D printing, web/app design, and software solutions. أمترونيكس - متجر إلكترونيات وخدمات تقنية في الكويت.",
              url: "https://amtronics.co",
              address: {
                "@type": "PostalAddress",
                addressLocality: "Kuwait City",
                addressCountry: "KW",
              },
              telephone: "+9 655 550 1493", // Replace with actual phone number
              openingHours: "Mo-Su 09:00-18:00", // Replace with actual hours
              sameAs: [
                "https://x.com/amtronics_kw", // Replace with actual social media links
                "https://www.instagram.com/amtronics_kw",
              ],
              "@graph": [
                {
                  "@type": "Product",
                  name: "Raspberry Pi 5",
                  description: "Buy Raspberry Pi 5 in Kuwait with free delivery from Amtronics.",
                  url: "https://amtronics.co/products/raspberry-pi-5",
                  image: "https://amtronics.co/images/raspberry-pi-5.jpg",
                  offers: {
                    "@type": "Offer",
                    priceCurrency: "KWD",
                    price: "50.000", // Replace with actual price
                    availability: "https://schema.org/InStock",
                  },
                },
                {
                  "@type": "Service",
                  name: "3D Printing Services",
                  description: "Custom 3D printing services in Kuwait for prototypes and designs.",
                  url: "https://amtronics.co/services/3d-printing",
                },
              ],
            }),
          }}
        />
      </head>
      <body className={`${inter.className} ${isArabic ? notoSansArabic.className : ""}`}>
        <WishlistProvider>
          <CartProvider>
            <SavedAddressesProvider>
              <TopPromotionalBanner />
              <Suspense>
                <Header />
              </Suspense>
              <main className="min-h-screen w-full px-1 md:px-2 bg-[#FBFAF9]">{children}</main>
              <Footer />
            </SavedAddressesProvider>
          </CartProvider>
        </WishlistProvider>
        <Toaster richColors={true} position="bottom-right" toastOptions={{ duration: 3000 }} />
      </body>
    </html>
  );
}