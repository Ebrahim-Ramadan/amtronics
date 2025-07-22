"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Copy } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/lib/context";
import { toast } from "sonner";
import type { Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { HeartPlus } from "lucide-react";
import { useWishlist } from "@/lib/wishlist-context";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface Bundle {
  id: string;
  product: Product | null;
}

interface Engineer {
  name: string;
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
  const [loading, setLoading] = useState(false); // Add loading state
  const { dispatch } = useCart();
  const { state: wishlistState, dispatch: wishlistDispatch } = useWishlist();
  const router = useRouter();
  const isWishlisted = wishlistState.items.some(item => item._id === project._id);
  const toggleWishlist = () => {
    if (isWishlisted) {
      wishlistDispatch({ type: "REMOVE_ITEM", payload: project._id });
      toast.info("Removed from wishlist");
    } else {
      wishlistDispatch({ type: "ADD_ITEM", payload: { _id: project._id, name: project.name, type: 'project', engineers: project.engineers } });
      toast.success("Added to wishlist");
    }
  };

  // Gather all products from all bundles
  const allProducts = (project.engineers?.flatMap((eng) =>
    eng.bundle.map((b) => {
      const p = b.product;
      if (!p) return null;
      return {
        _id: b.id,
        id: 0,
        sku: '',
        en_name: p.en_name || '',
        ar_name: '',
        en_description: '',
        ar_description: '',
        en_long_description: '',
        ar_long_description: '',
        en_main_category: '',
        ar_main_category: '',
        en_category: '',
        ar_category: '',
        price: p.price,
        image: p.image,
        quantity_on_hand: 0,
        sold_quantity: 0,
        visible_in_catalog: 1,
        visible_in_search: 1,
        slug_url: '',
        discount: 0,
        discount_type: '',
        ar_brand: '',
        en_brand: '',
        ave_cost: 0,
      } as Product;
    })
  ).filter((p): p is Product => !!p)) || [];

  const handleAddToCart = () => {
    if (!allProducts.length) return toast.error("No products to add");
    dispatch({
      type: "ADD_PROJECT_BUNDLE",
      payload: {
        type: "project-bundle",
        projectId: project._id,
        projectName: project.name,
        engineerNames: project.engineers?.map((e) => e.name) || [],
        bundleIds: project.engineers?.flatMap((e) => e.bundle.map((b) => b.id)) || [],
        products: allProducts,
        quantity: 1,
      },
    });
    toast.success("Project bundle added to cart!");
    setOpen(false);
  };

  const handleBuyNow = () => {
    if (!allProducts.length) return toast.error("No products to buy");
    setLoading(true); // Set loading state
    dispatch({
      type: "ADD_PROJECT_BUNDLE",
      payload: {
        type: "project-bundle",
        projectId: project._id,
        projectName: project.name,
        engineerNames: project.engineers?.map((e) => e.name) || [],
        bundleIds: project.engineers?.flatMap((e) => e.bundle.map((b) => b.id)) || [],
        products: allProducts,
        quantity: 1,
      },
    });
    toast.success("Project bundle added to cart!");
    setOpen(false);
    setLoading(false); // Reset loading state
    router.push("/checkout");
  };

  const totalPrice =
    project.engineers?.reduce((sum, eng) => {
      return (
        sum +
        (eng.bundle?.reduce(
          (bundleSum, b) => bundleSum + (b.product?.price || 0),
          0
        ) || 0)
      );
    }, 0) || 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div
        onClick={() => setOpen(true)}
        className="min-w-[400px] max-w-xs bg-white/80 border border-[#FEEE00] rounded-2xl shadow hover:shadow-xl transition p-6 flex-shrink-0 group relative overflow-hidden transition-all duration-200 cursor-pointer"
        style={{ boxShadow: "0 4px 24px 0 rgba(254,238,0,0.08)" }}
      >
        <h3 className="text-xl font-bold mb-2 text-[#0F172B] group-hover:text-[#00B8DB] transition-colors">
          {project.name}
        </h3>
        <div className="flex gap-2 mb-2">
          <span className="bg-[#FEEE00]/80 text-[#0F172B] px-2 py-0.5 rounded-full text-[10px] font-medium border border-[#FEEE00]">
            {project.engineers?.length ?? 0} Engineer{(project.engineers?.length ?? 0) === 1 ? '' : 's'}
          </span>
          <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-[10px] font-medium border border-blue-200">
            {project.engineers?.reduce((sum, eng) => sum + (eng.bundle?.length || 0), 0)} Bundles
          </span>
          <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-[10px] font-medium border border-green-200">
            {project.engineers?.reduce((sum, eng) => sum + (eng.bundle?.filter(b => b.product).length || 0), 0)} Products
          </span>
        </div>
        <span className="text-sm text-[#00B8DB] font-semibold mb-1">
          {project.engineers?.map((eng, idx) => (
            <span
              key={idx}
              className="bg-[#FEEE00]/80 text-[#0F172B] px-2 py-0.5 rounded-full text-xs font-medium border border-[#FEEE00]"
            >
              {eng.name}
            </span>
          ))}
        </span>
        <div className="flex gap-2 mt-4 flex flex-col md:flex-row items-center justify-between w-full">
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
              className="px-3 py-1 text-xs font-semibold"
              onClick={e => { e.stopPropagation(); handleBuyNow(); }}
              disabled={loading}
            >
              {loading ? "Processing..." : "Buy Now"}
            </Button>
          </div>
          <Button
            size="icon"
            variant={isWishlisted ? "outline" : "ghost"}
            className={isWishlisted ? "text-red-500 border-red-500 hover:text-red-600" : "text-gray-500 hover:text-red-500"}
            onClick={e => { e.stopPropagation(); toggleWishlist(); }}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <HeartPlus className={`h-5 w-5 ${isWishlisted ? 'fill-red-500' : 'fill-transparent'}`} />
          </Button>
        </div>
      </div>

      <DialogContent className="sm:max-w-[650px] bg-white rounded-2xl p-6">
        <DialogHeader>
          <div className="flex items-center justify-between gap-2">
            <DialogTitle className="text-2xl font-bold text-[#0F172B]">
              {project.name}
            </DialogTitle>
          </div>
          <DialogDescription className="text-gray-500 flex items-center justify-between gap-2">
            <p className="flex items-center gap-2">
              Project ID: {project._id}
              <Copy
                onClick={() => {
                  navigator.clipboard.writeText(project._id);
                  toast.success("ID Copied to clipboard");
                }}
                size={16}
                className="cursor-pointer text-gray-400 hover:text-black"
              />
            </p>
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
        <div className="border-t pt-4 space-y-6">
          <h4 className="text-lg font-semibold text-[#0F172B] mb-2">Engineers & Bundles</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {project.engineers?.map((eng, idx) => (
              <div key={idx} className="bg-[#FEEE00]/10 border border-[#FEEE00] rounded-xl p-4 flex flex-col gap-2 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-[#FEEE00]/80 text-[#0F172B] px-3 py-1 rounded-full text-xs font-medium border border-[#FEEE00]">
                    {eng.name}
                  </span>
                  <span className="text-xs text-gray-500">{eng.bundle.length} Bundle{eng.bundle.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {eng.bundle.map((b, bidx) => b.product ? (
                    <div key={bidx} className="flex items-center gap-3 bg-white rounded-lg border border-gray-200 p-2">
                      <img
                        src={b.product.image}
                        alt={b.product.en_name}
                        className="w-12 h-12 object-cover rounded-md border border-gray-100"
                        onError={e => (e.currentTarget.src = "/placeholder-image.jpg")}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-[#0F172B]">{b.product.en_name}</p>
                        <p className="text-xs text-gray-600">${b.product.price.toFixed(2)}</p>
                      </div>
                    </div>
                  ) : (
                    <div key={bidx} className="text-xs text-gray-400">No product</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="border-t pt-4">
          <h4 className="text-lg font-semibold text-[#0F172B] mb-2">Total Price ${totalPrice.toFixed(2)}</h4>
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
            className="flex-1 font-bold"
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