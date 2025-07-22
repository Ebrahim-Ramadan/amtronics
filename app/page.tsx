import EnhancedHeroSlider from "@/components/enhanced-hero-slider";
import EnhancedCategories from "@/components/enhanced-categories";
import PromotionalGrid from "@/components/promotional-grid";
import ProductCarousel from "@/components/product-carousel";
import BrandShowcase from "@/components/brand-showcase";
import LazyLoad from "@/components/lazyload";
import ProjectDialog from "@/components/project-dialog"; // Import the new client component

async function fetchProjects() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/projects`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

export default async function Home() {
  const projects = await fetchProjects();
  console.log('projects', projects);
  return (
    <div className="min-h-screen w-full bg-gray-50">
      {/* Enhanced Hero Slider */}
      <EnhancedHeroSlider />

      {/* Enhanced Categories */}
      <EnhancedCategories />

      
      {/* Projects Slider */}
      {projects && projects.length > 0 && (
        <section className="my-8 px-2">
          <div className="rounded-xl bg-gradient-to-r from-yellow-50 via-white to-green-50 shadow-md py-6 px-2">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-[#0F172B] flex items-center gap-2">
              <span className="inline-block w-2 h-6 bg-gradient-to-b from-[#FEEE00] to-[#00B8DB] rounded-full mr-2"></span>
              Featured Projects
            </h2>
            <div className="flex gap-6 overflow-x-auto scrollbar-hidden pb-2">
              {projects.map((project: any) => (
                <ProjectDialog key={project._id} project={project} />
              ))}
            </div>
          </div>
        </section>
      )}



      {/* Promotional Grid Sections */}
      <div className="px-2">
        {/* <PromotionalGrid /> */}
      </div>

      {/* Product Carousels */}
      <div className="px-2 space-y-4 py-4">
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
          <ProductCarousel
            title="Recommended for You"
            arTitle="موصى لك"
            type="recommended"
            bgColor="bg-gradient-to-br from-red-50 to-red-100"
          />
        </LazyLoad>
      </div>

      {/* Brand Showcase */}
      <BrandShowcase />
    </div>
  );
}