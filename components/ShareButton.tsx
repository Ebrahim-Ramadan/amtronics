"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Share, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { copyToClipboard } from "@/lib/utils"


export default function ShareButton() {

  const handleShare = async () => {
    copyToClipboard(window.location.href)
    toast.success("Link copied to clipboard!")
  }

  return (
    <button onClick={handleShare} className="absolute top-4 right-4 flex items-center gap-2 bg-[#FEEE00] text-white w-8 h-8 flex justify-center rounded-full">
    <Share size='16' color="#102245"/>
              </button>
  )
} 