"use client";
import type React from "react";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ProductCard from "@/components/product-card";
import type { Product } from "@/lib/types";
import { useCart } from "@/lib/context";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { categories } from "@/lib/utils";
import { Pagination } from "@/components/ui/pagination"; // Assuming you have a Pagination component

const ITEMS_PER_PAGE = 15;

export default function ProductsPage() {
  const { state } = useCart();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const selectedCategory = searchParams.get("category") || "all";
  const currentPage = Number(searchParams.get("page")) || 1;
  const [totalProducts, setTotalProducts] = useState(0);
  const isArabic = state.language === "ar";

  // Update searchQuery state when URL parameters change
  useEffect(() => {
    setSearchQuery(searchParams.get("search") || "");
  }, [searchParams]);

  useEffect(() => {
    const fetchProducts = async () => {
      console.log('fetching');
      setLoading(true);
      try {
        let url = "/api/products?";
        const params = new URLSearchParams();
        
        // Use searchParams directly instead of searchQuery state to avoid stale state issues
        const urlSearchQuery = searchParams.get("search");
        if (urlSearchQuery) params.append("search", urlSearchQuery);
        if (selectedCategory !== "all") params.append("category", selectedCategory);
        if (searchParams.get("featured")) params.append("featured", "true");
        if (searchParams.get("recent")) params.append("recent", "true");
        params.append("limit", String(ITEMS_PER_PAGE));
        params.append("skip", String((currentPage - 1) * ITEMS_PER_PAGE));

        url += params.toString();

        // const response = await fetch(url);
        const response = await fetch(url, {
          next: { revalidate: 1000 }, // Enable Next.js caching for 5 minutes
          cache: "force-cache",      // Use cached response if available
        });
        const data = await response.json();
        console.log("data", data);
        setProducts(data.products);
        setTotalProducts(data.total);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchParams, selectedCategory, currentPage]);



  const handleCategoryChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("category");
    } else {
      params.set("category", value);
    }
    params.delete("page"); // Reset to page 1 on category change
    router.push(`/products?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearchQuery("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("search");
    params.delete("category");
    params.delete("page"); // Reset to page 1 on clearing filters
    router.push(`/products?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`/products?${params.toString()}`);
  };

  const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);

  return (
    <div className=" mx-auto px-2 py-4 md:px-12 md:py-6">
<div className="flex items-center justify-between flex-col md:flex-row mb-4">
      <h1 className="gap-2 flex items-center text-3xl font-bold w-full">{isArabic ? "المنتجات" : "Products"} <span className="text-gray-500 font-normal text-sm">({products.length})</span></h1>

 <div className="flex flex-row gap-2 md:gap-4 self-end w-full md:w-auto mt-4 md:mt-0">
      

        <Select value={selectedCategory} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder={isArabic ? "اختر الفئة" : "Select Category"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{isArabic ? "جميع الفئات" : "All Categories"}</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {(searchQuery || selectedCategory !== "all") && (
          <Button variant="outline" onClick={clearFilters}>
            {isArabic ? "مسح الفلاتر" : "Clear Filters"}
          </Button>
        )}
      </div>
</div>
      {/* Filters */}
     

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(ITEMS_PER_PAGE)].map((_, i) => (
            <div key={i} className="bg-gray-200 animate-pulse h-80 rounded-lg"></div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">{isArabic ? "لم يتم العثور على منتجات" : "No products found"}</p>
        </div>
      )}

{totalPages > 1 && !loading && products.length > 0 && (
  <div className="mt-6 flex justify-center">
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={handlePageChange}
      disabled={loading} // Pass loading state
    />
  </div>
)}
    </div>
  );
}