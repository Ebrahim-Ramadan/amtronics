import EnhancedHeroSlider from "@/components/enhanced-hero-slider"
import EnhancedCategories from "@/components/enhanced-categories"
import PromotionalGrid from "@/components/promotional-grid"
import ProductCarousel from "@/components/product-carousel"
import BrandShowcase from "@/components/brand-showcase"
import LazyLoad from "@/components/lazyload"

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-gray-50">
      {/* Enhanced Hero Slider */}
      <EnhancedHeroSlider />


      {/* Enhanced Categories */}
      <EnhancedCategories />


      {/* Promotional Grid Sections */}
      <div className=" px-2 ">
        {/* <PromotionalGrid /> */}
      </div>

      {/* Product Carousels */}
      <div className=" px-2  space-y-4 py-4">
        <LazyLoad>
          <ProductCarousel
            title="Best Sellers in Electronics"
            arTitle="الأكثر مبيعاً في الإلكترونيات"
            type="bestsellers"
            bgColor="bg-gradient-to-br from-green-50 to-green-100"
          />
        </LazyLoad>

        <LazyLoad>
          <ProductCarousel
            title="Today's Deals"
            arTitle="عروض اليوم"
            type="deals"
            bgColor="bg-gradient-to-r from-yellow-50 to-orange-50"
          />
        </LazyLoad>

        <LazyLoad>
          <ProductCarousel title="Recommended for You" arTitle="موصى لك" type="recommended" bgColor="bg-gradient-to-br from-red-50 to-red-100" />
        </LazyLoad>
      </div>

      {/* Brand Showcase */}
      <BrandShowcase />
    </div>
  )
}
