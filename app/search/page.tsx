"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ProductCard from "@/components/product-card";
import type { Product } from "@/lib/types";
import { useCart } from "@/lib/context";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination } from "@/components/ui/pagination"; // Assuming you have a Pagination component
import { categories } from "@/lib/utils"; // Assuming categories is an array of category names

const ITEMS_PER_PAGE = 15;

export default function SearchPage() {
  const { state } = useCart();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const searchQuery = searchParams.get("q") || "";
  const selectedCategory = searchParams.get("category") || "all";
  const currentPage = Number(searchParams.get("page")) || 1;
  const isArabic = state.language === "ar";

  // Fetch products when searchQuery, category, or page changes
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let url = "/api/products?";
        const params = new URLSearchParams();
        if (searchQuery) params.append("search", searchQuery);
        if (selectedCategory !== "all") params.append("category", selectedCategory);
        params.append("limit", String(ITEMS_PER_PAGE));
        params.append("skip", String((currentPage - 1) * ITEMS_PER_PAGE));

        url += params.toString();

        const response = await fetch(url);
        const data = await response.json();
        setProducts(data.products || []);
        setTotalProducts(data.total || 0);
      } catch (error) {
        console.error("Error fetching search results:", error);
        setProducts([]);
        setTotalProducts(0);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchQuery, selectedCategory, currentPage]);

  // Handle category selection
  const handleCategoryChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("category");
    } else {
      params.set("category", value);
    }
    params.delete("page"); // Reset to page 1 on category change
    router.push(`/search?${params.toString()}`);
  };

  // Clear all filters
  // const clearFilters = () => {
  //   const params = new URLSearchParams();
  //   router.push(`/search`); // Clear all parameters, including q
  // };

  // Handle page navigation
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`/search?${params.toString()}`);
  };

  const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);

  return (
    <div className="mx-auto px-2 py-4 md:px-12 md:py-6">
      <div className="flex md:items-center justify-between mb-4 flex-col md:flex-row">
      <h1 className="text-xl md:text-2xl font-bold mb-2 md:mb-4">
        {isArabic ? `نتائج البحث عن: "${searchQuery}"` : `Search results for: "${searchQuery}"`}
      </h1>

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
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(ITEMS_PER_PAGE)].map((_, i) => (
            <div key={i} className="bg-gray-200 animate-pulse h-80 rounded-lg"></div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <>
         
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">
            {isArabic ? "لم يتم العثور على نتائج" : "No results found"}
          </p>
          <p className="text-gray-400">
            {isArabic ? "جرب البحث بكلمات مختلفة" : "Try searching with different keywords"}
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && !loading && products.length > 0 && (
        <div className="mt-6 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}