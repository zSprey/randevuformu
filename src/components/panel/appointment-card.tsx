// components/panel/appointment-card.tsx
'use client';

import { Clock, Phone, User, Mic } from 'lucide-react';

// Prisma'dan gelen verinin tipini basitleştirilmiş olarak tanımlıyoruz
interface AppointmentProps {
  appointment: {
    id: string;
    customerName: string;
    customerPhone: string;
    startTime: Date;
    status: string;
    service: {
      name: string;
      durationMin: number;
    };
    notes?: {
      structuredSummary?: string | null;
    } | null;
  };
}

export function AppointmentCard({ appointment }: AppointmentProps) {
  const timeString = new Date(appointment.startTime).toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit'
  });

  // Duruma göre rozet renkleri
  const statusColors: Record<string, string> = {
    PENDING: 'bg-amber-100 text-amber-800',
    CONFIRMED: 'bg-emerald-100 text-emerald-800',
    COMPLETED: 'bg-zinc-100 text-zinc-800',
    NOSHOW: 'bg-red-100 text-red-800',
  };

  const statusLabels: Record<string, string> = {
    PENDING: 'Onay Bekliyor',
    CONFIRMED: 'Onaylandı',
    COMPLETED: 'Tamamlandı',
    NOSHOW: 'Gelmeyen (No-Show)',
  };

  return (
    <article className="flex flex-col justify-between gap-4 rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm sm:flex-row sm:items-center">
      
      {/* Sol: Saat ve Müşteri Bilgisi */}
      <div className="flex items-start gap-4">
        <div className="flex flex-col items-center justify-center rounded-lg bg-zinc-50 p-3 border border-zinc-100">
          <Clock className="mb-1 h-5 w-5 text-zinc-400" />
          <span className="font-mono text-[16px] font-bold tabular-nums text-zinc-900">{timeString}</span>
        </div>
        
        <div className="space-y-1">
          <h3 className="font-semibold text-zinc-900">{appointment.customerName}</h3>
          <div className="flex items-center gap-3 text-sm text-zinc-500">
            <span className="flex items-center gap-1">
              <User className="h-4 w-4" />
              {appointment.service.name} ({appointment.service.durationMin} dk)
            </span>
            <a href={`tel:${appointment.customerPhone}`} className="flex items-center gap-1 hover:text-zinc-900">
              <Phone className="h-4 w-4" />
              <span className="font-mono tabular-nums">{appointment.customerPhone}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Sağ: Aksiyonlar ve Rozetler */}
      <div className="flex flex-col items-end gap-3">
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColors[appointment.status] || statusColors.PENDING}`}>
          {statusLabels[appointment.status] || 'Belirsiz'}
        </span>
        
        <div className="flex gap-2">
          {appointment.status === 'COMPLETED' ? (
            <button className="flex min-h-[36px] items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100">
              {appointment.notes?.structuredSummary ? "Klinik Özeti Gör" : <><Mic className="h-4 w-4"/> Sesli Not Ekle</>}
            </button>
          ) : (
            <>
              <button className="min-h-[36px] rounded-lg border border-zinc-200 px-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50">
                Düzenle
              </button>
              {appointment.status === 'PENDING' && (
                <button className="min-h-[36px] rounded-lg bg-zinc-900 px-3 text-sm font-medium text-white transition-opacity hover:opacity-90">
                  Onayla
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </article>
  );
}

export default AppointmentCard;
