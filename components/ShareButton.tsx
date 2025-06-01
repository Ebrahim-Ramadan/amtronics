"use client"

import { Button } from "./ui/button"
import { Share2, Upload } from "lucide-react"
import { toast } from "sonner"
import { useCart } from "@/lib/context"
import { copyToClipboard } from "@/lib/utils"

export default function ShareButton({product_id}: {product_id: string}) {
  const { state } = useCart()
  const isArabic = state.language === "ar"

  const handleShare = async () => {
    copyToClipboard(`https://amtronics.co/products/${product_id}`);
    toast.success(isArabic ? "تم نسخ الرابط إلى الحافظة" : "Link copied to clipboard")
  };

  return (
    <Button variant="outline" size="icon" onClick={handleShare} aria-label={isArabic ? "مشاركة المنتج" : "Share product"}>
      <Upload className="h-5 w-5" />
    </Button>
  );
} 