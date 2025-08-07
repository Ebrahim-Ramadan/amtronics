import Image from 'next/image'
import React from 'react'

export const FixedWhatsappIcon = () => {
  return (
    <a className="flex z-50 items-center gap-2 p-2 rounded-full bg-white/70 backdrop-blur-md fixed md:bottom-10 md:right-10 bottom-4 right-4" href="https://wa.me/+96555501387" target="_blank" rel="noopener noreferrer">
    <Image
      src="/whatsapp.webp"
      alt="WhatsApp Icon"
      width={20}
      height={20}
      quality={50}
      priority = {false}
      className="h-8 w-8"
      />
    {/* <p className="text-sm">+965 555 01387</p> */}
  </a>
  )
}
