"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Copy, Maximize, Maximize2, MoveDiagonal, ZoomIn } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useCart } from "@/lib/context";
import { toast } from "sonner";
import type { Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { HeartPlus } from "lucide-react";
import { useWishlist } from "@/lib/wishlist-context";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Bundle {
  id: string;
  product: Product | null;
  quantity?: number;
}

interface Engineer {
  name: string;
  email: string;
  bundle: Bundle[];
}

interface Project {
  _id: string;
  name: string;
  engineers?: Engineer[];
  createdAt: string;
}

export default function ProjectDialog({ project }: { project: Project }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { dispatch } = useCart();
  const { state: wishlistState, dispatch: wishlistDispatch } = useWishlist();
  const router = useRouter();
  const isWishlisted = wishlistState.items.some(item => item._id === project._id);

  const [selectedBundles, setSelectedBundles] = useState<{ [engIdx: number]: number[] }>({});

  useEffect(() => {
    if (project.engineers) {
      const initial: { [engIdx: number]: number[] } = {};
      project.engineers.forEach((eng, idx) => {
        initial[idx] = eng.bundle.length > 0 ? [0] : [];
      });
      setSelectedBundles(initial);
    }
  }, [project.engineers]);

  const allProducts =
    project.engineers?.flatMap((eng, engIdx) =>
      selectedBundles[engIdx]
        ? selectedBundles[engIdx]
            .map(bIdx => {
              const b = eng.bundle[bIdx];
              if (!b || !b.product) return null;
              return {
                ...b.product,
                _id: b.id,
                quantity: b.quantity ?? 1,
              } as Product & { quantity: number };
            })
            .filter((p): p is Product & { quantity: number } => !!p)
        : []
    ) || [];

  const WantedArray =
    project.engineers?.flatMap((eng, engIdx) =>
      selectedBundles[engIdx]?.map(bIdx => ({ engineerIdx: engIdx, bundleIdx: bIdx })) || []
    ) || [];

  const handleAddToCart = () => {
    if (!allProducts.length) return toast.error("No products to add");
    dispatch({
      type: "ADD_PROJECT_BUNDLE",
      payload: {
        type: "project-bundle",
        projectId: project._id,
        projectName: project.name,
        engineerNames: project.engineers?.map((e) => e.name) || [],
        engineerEmails: project.engineers?.map((e) => e.email) || [],
        bundleIds: WantedArray,
        products: allProducts,
        quantity: 1,
      },
    });
    toast.success("Project bundle added to cart!");
    setOpen(false);
  };

  const handleBuyNow = () => {
    if (!allProducts.length) return toast.error("No products to buy");
    setLoading(true);
    dispatch({
      type: "ADD_PROJECT_BUNDLE",
      payload: {
        type: "project-bundle",
        projectId: project._id,
        projectName: project.name,
        engineerNames: project.engineers?.map((e) => e.name) || [],
        engineerEmails: project.engineers?.map((e) => e.email) || [],
        bundleIds: WantedArray,
        products: allProducts,
        quantity: 1,
      },
    });
    toast.success("Project bundle added to cart!");
    setOpen(false);
    setLoading(false);
    router.push("/checkout");
  };

  const totalPrice =
    project.engineers?.reduce((sum, eng, engIdx) => {
      return (
        sum +
        (selectedBundles[engIdx]?.reduce(
          (bundleSum, bIdx) =>
            bundleSum +
            ((eng.bundle[bIdx]?.product?.price || 0) * (eng.bundle[bIdx]?.quantity ?? 1)),
          0
        ) || 0)
      );
    }, 0) || 0;

  const toggleWishlist = () => {
    if (isWishlisted) {
      wishlistDispatch({ type: "REMOVE_ITEM", payload: project._id });
      toast.success("Removed from wishlist");
    } else {
      wishlistDispatch({ type: "ADD_ITEM", payload: project });
      toast.success("Added to wishlist");
    }
  };

  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(2);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function updateVisibleCount() {
      if (window.innerWidth < 640) {
        setVisibleCount(1);
      } else if (window.innerWidth < 1024) {
        setVisibleCount(2);
      } else {
        setVisibleCount(3);
      }
    }
    updateVisibleCount();
    window.addEventListener('resize', updateVisibleCount);
    return () => window.removeEventListener('resize', updateVisibleCount);
  }, []);

  const maxIndex = Math.max(0, (project.engineers?.length || 0) - visibleCount);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev < maxIndex ? prev + 1 : prev));
  };
  const prevSlide = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const engineerWidth = 340;
  const containerWidth = visibleCount * engineerWidth;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div
        onClick={() => setOpen(true)}
        className="min-w-[300px] max-w-xs bg-white/60 backdrop-blur-xl border border-[#00B8DB]/10 rounded-2xl hover:shadow-lg transition p-4 md:p-6 flex-shrink-0 group relative overflow-hidden transition-all duration-200 cursor-pointer"
        style={{ boxShadow: "0 4px 24px 0 rgba(254,238,0,0.08)" }}
      >
       <div className="flex items-center justify-between">
         <h3 className="capitalize text-xl font-bold mb-2 text-[#0F172B] group-hover:text-[#00B8DB] transition-colors">
          {project.name}
        </h3>
        <Maximize2  className="h-3 w-3 group-hover:w-4 transition-all duration-200 text-[#de6270] group-hover:text-[#ba2990cc]"  />
       </div>
        {/* <div className="flex gap-2 mb-2">
          <span className="bg-[#FEEE00]/80 text-[#0F172B] px-2 py-0.5 rounded-full text-[10px] font-medium border border-[#FEEE00]">
            {project.engineers?.length ?? 0} Engineer{(project.engineers?.length ?? 0) === 1 ? '' : 's'}
          </span>
          <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-[10px] font-medium border border-blue-200">
            {project.engineers?.reduce((sum, eng) => sum + (eng.bundle?.length || 0), 0)} Bundles
          </span>
          <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-[10px] font-medium border border-green-200">
            {project.engineers?.reduce((sum, eng) => sum + (eng.bundle?.filter(b => b.product).length || 0), 0)} Products
          </span>
        </div> */}
        <span className="text-sm text-[#00B8DB] font-semibold mb-1 gap-2 flex ">
          {project.engineers?.map((eng, idx) => (
            <span
              key={idx}
              className="bg-[#FEEE00]/80 text-[#0F172B] px-2 py-0.5 rounded-full text-xs font-medium border border-[#FEEE00]"
            >
              {eng.name}
            </span>
          ))}
        </span>
        <div className="flex gap-2 mt-4 flex flex-row items-center justify-between w-full">
          <div className="flex gap-2 w-full">
            <Button
              size="sm"
              variant="default"
              className="px-3 py-1 text-xs font-semibold"
              onClick={e => { e.stopPropagation(); handleAddToCart(); }}
            >
              <Image
                src={"/quick-atc-add-to-cart-grey.svg"}
                width={20}
                height={20}
                alt="Add to Cart"
              />
              Add to Cart
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="px-3 py-1 text-xs font-bold border border-[#00B8DB]/10"
              onClick={e => { e.stopPropagation(); handleBuyNow(); }}
              disabled={loading}
            >
              {loading ? "Processing..." : "Buy Now"}
            </Button>
          </div>
          <Button
            size="sm"
            variant={isWishlisted ? "outline" : "ghost"}
            className={isWishlisted ? "text-red-500 border-red-500 hover:text-red-600" : "text-gray-500 hover:text-red-500"}
            onClick={e => { e.stopPropagation(); toggleWishlist(); }}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <HeartPlus className={` ${isWishlisted ? 'fill-red-500' : 'fill-transparent'}`} />
          </Button>
        </div>
      </div>

      <DialogContent
        className="sm:max-w-[900px] bg-white rounded-2xl p-6"
        style={{ maxHeight: "90vh", overflowY: "hidden" }}
      >
        <DialogHeader>
          <div className="flex items-center justify-between gap-2">
            <DialogTitle className="text-2xl font-bold text-[#0F172B]">
              {project.name}
            </DialogTitle>
          </div>
          <DialogDescription className="text-gray-500 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              Project ID: {project._id}
              <Copy
                onClick={() => {
                  navigator.clipboard.writeText(project._id);
                  toast.success("ID Copied to clipboard");
                }}
                size={16}
                className="cursor-pointer text-gray-400 hover:text-black"
              />
            </div>
            <Button
              variant={isWishlisted ? "outline" : "ghost"}
              size="icon"
              onClick={toggleWishlist}
              aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
              className={isWishlisted ? "text-red-500 border-red-500 hover:text-red-600" : "text-gray-500 hover:text-red-500"}
            >
              <HeartPlus className={`h-6 w-6 fill-current ${isWishlisted ? '' : 'fill-transparent'}`} />
            </Button>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div className="flex justify-end gap-2 mb-2" style={{ maxWidth: 900, margin: "0 auto" }}>
            <Button variant="outline" size="icon" onClick={prevSlide} disabled={currentIndex === 0}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={nextSlide}
              disabled={currentIndex >= maxIndex}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="w-full" style={{ maxWidth: 900, margin: "0 auto" }}>
            <div
              ref={carouselRef}
              className="flex gap-6 transition-transform duration-300 sm:overflow-x-visible overflow-x-auto"
              style={{
                minWidth: "100%",
                transform: visibleCount === 1 ? undefined : `translateX(-${currentIndex * (engineerWidth + 24)}px)`,
                width: visibleCount === 1 ? undefined : `${(project.engineers?.length || 1) * (engineerWidth + 24)}px`,
              }}
            >
              {project.engineers?.map((eng, engIdx) => (
                <div
                  key={engIdx}
                  className="min-w-[300px] max-w-[340px] w-[340px] bg-[#FEEE00]/10 border border-[#FEEE00] rounded-xl p-4 flex flex-col gap-2 shadow-sm"
                  style={{
                    maxHeight: "450px",
                    overflowY: "hidden",
                    flex: visibleCount === 1 ? '0 0 auto' : undefined,
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-[#FEEE00]/80 text-[#0F172B] px-3 py-1 rounded-full text-xs font-medium border border-[#FEEE00]">
                      {eng.name}
                    </span>
                    {/* {eng.email && (
                      <span className="text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                        {eng.email}
                      </span>
                    )} */}
                    {/* <span className="text-xs text-gray-500">{eng.bundle.length} Bundle{eng.bundle.length !== 1 ? 's' : ''}</span> */}
                  </div>
                  <div
                    className="flex flex-col gap-3 pb-2"
                    style={{
                      maxHeight: "144px", // 2 products * 72px each (approx)
                      overflowY: "auto",
                    }}
                  >
                    {eng.bundle.map((b, bIdx) => b.product ? (
                      <label
                        key={bIdx}
                        className="flex-shrink-0 flex items-center gap-3 bg-white rounded-lg border border-gray-200 p-2 cursor-pointer"
                        style={{ minHeight: "64px", maxHeight: "72px" }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedBundles[engIdx]?.includes(bIdx) || false}
                          onChange={() => {
                            setSelectedBundles(prev => {
                              const current = prev[engIdx] || [];
                              let updated: number[];
                              if (current.includes(bIdx)) {
                                updated = current.filter(idx => idx !== bIdx);
                              } else {
                                updated = [...current, bIdx];
                              }
                              if (updated.length === 0 && eng.bundle.length > 0) {
                                updated = [bIdx];
                              }
                              return { ...prev, [engIdx]: updated };
                            });
                          }}
                          className="form-checkbox accent-[#FEEE00] h-4 w-4"
                        />
                        <img
                          src={b.product.image.split(',')[0] || '/placeholder-image.jpg'}
                          alt={b.product.en_name}
                          className="w-12 h-12 object-cover rounded-md border border-gray-100"
                          onError={e => (e.currentTarget.src = "/placeholder-image.jpg")}
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-[#0F172B]">{b.product.en_name}</p>
                          <p className="text-xs text-gray-600">
                            kwd {b.product.price.toFixed(2)}
                            {b.quantity && b.quantity > 1 && (
                              <span className="ml-2 text-xs text-gray-500">× {b.quantity}</span>
                            )}
                          </p>
                          <p className="text-xs text-gray-500">Quantity: {b.quantity ?? 1}</p>
                        </div>
                      </label>
                    ) : (
                      <div key={bIdx} className="text-xs text-gray-400">No product</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div >
          <h4 className="text-lg font-semibold text-[#0F172B] mb-2">Total: kwd {totalPrice.toFixed(2)}</h4>
        </div>
        <div className="flex gap-4 pt-4 border-t">
          <Button
            className="flex-1 font-bold"
            size="lg"
            onClick={handleAddToCart}
          >
            <Image
              src={"/quick-atc-add-to-cart-grey.svg"}
              width={20}
              height={20}
              alt="Add to Cart"
            />
            Add to Cart
          </Button>
          <Button
            className="flex-1 font-bold border border-[#00B8DB]/10"
            size="lg"
            variant="secondary"
            onClick={handleBuyNow}
            disabled={loading}
          >
            {loading ? "Processing..." : "Buy Now"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}