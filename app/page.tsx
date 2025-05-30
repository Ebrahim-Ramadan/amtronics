import EnhancedHeroSlider from "@/components/enhanced-hero-slider"
import EnhancedCategories from "@/components/enhanced-categories"
import PromotionalGrid from "@/components/promotional-grid"
import ProductCarousel from "@/components/product-carousel"
import BrandShowcase from "@/components/brand-showcase"

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Hero Slider */}
      <div className="container mx-auto px-4 pt-6">
        <EnhancedHeroSlider />
      </div>

      {/* Enhanced Categories */}
      <div className="container mx-auto px-4">
        <EnhancedCategories />
      </div>

      {/* Promotional Grid Sections */}
      <div className="container mx-auto px-4">
        <PromotionalGrid />
      </div>

      {/* Product Carousels */}
      <div className="container mx-auto px-4 space-y-8 py-8">
        <ProductCarousel
          title="Best Sellers in Electronics"
          arTitle="الأكثر مبيعاً في الإلكترونيات"
          type="bestsellers"
          bgColor="bg-white"
        />

        <ProductCarousel
          title="Today's Deals"
          arTitle="عروض اليوم"
          type="deals"
          bgColor="bg-gradient-to-r from-yellow-50 to-orange-50"
        />

        <ProductCarousel title="Recommended for You" arTitle="موصى لك" type="recommended" bgColor="bg-white" />
      </div>

      {/* Brand Showcase */}
      <div className="container mx-auto px-4">
        <BrandShowcase />
      </div>
    </div>
  )
}
