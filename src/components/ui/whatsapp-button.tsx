'use client';

import { MessageCircle } from 'lucide-react';

interface WhatsAppButtonProps {
  phoneNumber: string;
  defaultMessage?: string;
}

export function WhatsAppButton({ phoneNumber, defaultMessage = "Merhaba, randevu almak istiyorum." }: WhatsAppButtonProps) {
  // WhatsApp wa.me linkini oluştur
  const encodedMessage = encodeURIComponent(defaultMessage);
  const whatsappUrl = `https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}?text=${encodedMessage}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      // bottom-safe: globals.css'den gelir, iOS barının üstünde durmasını sağlar
      className="fixed right-4 bottom-safe z-50 flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-white shadow-lg transition-transform hover:scale-105 active:scale-95 min-h-[44px]"
      aria-label="WhatsApp'tan Mesaj Gönder"
    >
      <MessageCircle className="h-6 w-6" />
      <span className="font-medium tracking-tight">Hızlı İletişim</span>
    </a>
  );
}

export default WhatsAppButton;
