import Image from 'next/image'
import React from 'react'

export const FixedWhatsappIcon = () => {
  return (
    <a
      className="group hover:scale-110 transition-transform duration-200 flex z-50 items-center gap-2 p-2 rounded-full bg-white/50 backdrop-blur-md fixed md:bottom-10 md:right-10 bottom-4 right-4"
      href="https://wa.me/+96555501387"
      target="_blank"
      rel="noopener noreferrer"
    >
      {/* Animated text */}
      <span
        className="absolute md:right-20 md:font-medium right-16 bg-green-600 text-white text-xs md:text-sm px-3 py-1 rounded-md opacity-0 group-hover:opacity-100 animate-[slideOut_4s_ease-in-out_forwards]  min-w-max shadow-lg whitespace-pre-line"
        style={{ whiteSpace: 'pre-line' }}
      >
        Want to customize a whole new product?{'\n'}Chat with us!
      </span>

      <Image
        src="/whatsapp.webp"
        alt="WhatsApp Icon"
        width={300}
        height={300}
        priority={false}
        className="md:h-14 md:w-14 h-10 w-10"
      />
    </a>
  )
}