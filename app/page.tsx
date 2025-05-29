import HeroBanner from "@/components/hero-banner"
import PromotionalBanner from "@/components/promotional-banner"
import CategoryCircles from "@/components/category-circles"
import DealsSection from "@/components/deals-section"
import BrandShowcase from "@/components/brand-showcase"
import ProductSection from "@/components/product-sections"

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Promotional Banner */}
      <div className="container mx-auto px-4 pt-4">
        <PromotionalBanner />
      </div>

      {/* Hero Banner */}
      <div className="container mx-auto px-4">
        <HeroBanner />
      </div>

      {/* Category Circles */}
      <div className="container mx-auto px-4">
        <CategoryCircles />
      </div>

      {/* Deals Sections */}
      <div className="container mx-auto px-4 space-y-8 py-8">
        {/* Flash Deals */}
        <DealsSection
          title="Flash Deals"
          arTitle="عروض خاطفة"
          bgColor="bg-gradient-to-r from-red-500 to-pink-500"
          dealType="flash"
        />

        {/* Mega Deals */}
        <DealsSection
          title="Mega Deals"
          arTitle="عروض ضخمة"
          bgColor="bg-gradient-to-r from-blue-500 to-purple-500"
          dealType="mega"
        />

        {/* Featured Products */}
        <DealsSection
          title="Featured Products"
          arTitle="منتجات مميزة"
          bgColor="bg-gradient-to-r from-green-500 to-teal-500"
          dealType="featured"
        />
      </div>

      {/* Brand Showcase */}
      <div className="container mx-auto px-4">
        <BrandShowcase />
      </div>

      {/* Traditional Product Sections */}
      <div className="container mx-auto px-4 space-y-16 py-8">
        <ProductSection title="New Arrivals" arTitle="الإضافات الحديثة" type="recent" />
        <ProductSection title="Best Sellers" arTitle="الأكثر مبيعاً" type="featured" />
      </div>
    </div>
  )
}
