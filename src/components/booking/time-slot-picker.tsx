// components/booking/time-slot-picker.tsx
'use client';

import { useState } from 'react';
import { WaitlistModal } from '@/components/booking/WaitlistModal';

// Demo verisi (Faz 3'te veritabanından gelecek)
const availableSlots = [
  { id: '1', time: '09:00', isDiscounted: false },
  { id: '2', time: '09:30', isDiscounted: false },
  { id: '3', time: '14:00', isDiscounted: true }, // %20 İndirimli boşluk
  { id: '4', time: '14:30', isDiscounted: true },
  { id: '5', time: '16:00', isDiscounted: false },
];

export function TimeSlotPicker() {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  return (
    <div className="w-full max-w-md space-y-4 rounded-xl border border-zinc-200/80 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-zinc-900">Randevu Saati Seçin</h3>
      
      <div className="grid grid-cols-3 gap-3">
        {availableSlots.map((slot) => (
          <button
            key={slot.id}
            onClick={() => {
              setSelectedSlot(slot.id);
              // Kural 14: Dokunma geri bildirimi (Mobil cihazlar için)
              if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
                window.navigator.vibrate(15);
              }
            }}
            className={`
              relative flex min-h-[44px] flex-col items-center justify-center rounded-lg border px-3 py-2 transition-colors
              ${selectedSlot === slot.id 
                ? 'border-zinc-900 bg-zinc-900 text-white' 
                : 'border-zinc-200 bg-transparent text-zinc-700 hover:border-zinc-400'
              }
            `}
          >
            {/* Kural: Saatler daima tabular-nums ve font-mono olmalı */}
            <span className="font-mono text-[16px] font-medium tabular-nums">
              {slot.time}
            </span>
            
            {/* Modül 3: Dinamik İndirim Rozeti */}
            {slot.isDiscounted && (
              <span className={`absolute -top-2 -right-2 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${selectedSlot === slot.id ? 'bg-white text-zinc-900' : 'bg-red-500 text-white'}`}>
                -%20
              </span>
            )}
          </button>
        ))}
      </div>

      <button 
        disabled={!selectedSlot}
        className="mt-6 flex min-h-[44px] w-full items-center justify-center rounded-lg bg-zinc-900 px-4 font-medium text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
      >
        Devam Et
      </button>

      {/* Modül 4: Akıllı Bekleme Listesi (Dolu gün veya alternatif saat arayanlar için) */}
      <div className="pt-2 border-t border-zinc-100">
        <WaitlistModal businessId="cl_demo_business_123" />
      </div>
    </div>
  );
}

export default TimeSlotPicker;
