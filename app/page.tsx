import HeroBanner from "@/components/hero-banner"
import ProductSection from "@/components/product-sections"

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <HeroBanner />

      <div className="space-y-16 mt-16">
        <ProductSection title="Featured Products" arTitle="المنتجات المميزة" type="featured" />

        <ProductSection title="New Arrivals" arTitle="الإضافات الحديثة" type="recent" />

        <ProductSection title="Best Sellers" arTitle="الأكثر مبيعاً" type="featured" />
      </div>
    </div>
  )
}
