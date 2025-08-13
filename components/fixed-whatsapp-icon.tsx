import Image from 'next/image'
import React from 'react'

export const FixedWhatsappIcon = () => {
  return (
    <a className="hover:scale-110 transition-transform duration-200 flex z-50 items-center gap-2 p-2 rounded-full bg-white/50 backdrop-blur-md fixed md:bottom-10 md:right-10 bottom-4 right-4" href="https://wa.me/+96555501387" target="_blank" rel="noopener noreferrer">
    <Image
      src="/whatsapp.webp"
      alt="WhatsApp Icon"
      width={300}
      height={300}
      // quality={100}
      priority = {false}
      className="h-14 w-14 "
      />
    {/* <p className="text-sm">+965 555 01387</p> */}
  </a>
  )
}
