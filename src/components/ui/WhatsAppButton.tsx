'use client'

import { MessageCircle } from 'lucide-react'

export default function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/447000000000"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-[80px] right-4 lg:bottom-6 lg:right-6 z-30 w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-gold text-charcoal inline-flex items-center justify-center shadow-md hover:bg-gold-light transition-colors"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle size={20} strokeWidth={1.75} />
    </a>
  )
}
