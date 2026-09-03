// components/panel/appointment-card.tsx
'use client';

import { Clock, Phone } from 'lucide-react';

interface AppointmentCardProps {
  appointment: {
    id: string;
    customerName: string;
    customerPhone: string;
    startTime: Date | string;
    endTime: Date | string;
    status: string;
    totalAmount?: number | null;
    service?: {
      name: string;
      price: number;
      durationMin: number;
    } | null;
    notes?: {
      audioUrl?: string | null;
      structuredSummary?: string | null;
    } | null;
  };
}

export function AppointmentCard({ appointment }: AppointmentCardProps) {
  const start = new Date(appointment.startTime);
  const end = new Date(appointment.endTime);

  const timeStr = `${start.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`;

  const statusMap: Record<string, { label: string; bg: string; text: string }> = {
    CONFIRMED: { label: 'Onaylandı', bg: 'bg-emerald-50', text: 'text-emerald-700' },
    PENDING: { label: 'Onay Bekliyor', bg: 'bg-amber-50', text: 'text-amber-700' },
    CANCELLED: { label: 'İptal Edildi', bg: 'bg-red-50', text: 'text-red-700' },
    COMPLETED: { label: 'Tamamlandı', bg: 'bg-blue-50', text: 'text-blue-700' },
    NOSHOW: { label: 'Gelmedi', bg: 'bg-zinc-100', text: 'text-zinc-600' },
  };

  const currentStatus = statusMap[appointment.status] || {
    label: appointment.status,
    bg: 'bg-zinc-50',
    text: 'text-zinc-700',
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-900 font-mono font-bold tabular-nums">
          {start.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-zinc-900">{appointment.customerName}</h4>
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${currentStatus.bg} ${currentStatus.text}`}>
              {currentStatus.label}
            </span>
          </div>
          <p className="text-sm text-zinc-600">{appointment.service?.name || 'Genel Randevu'}</p>
          <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500">
            <span className="flex items-center gap-1 font-mono tabular-nums">
              <Clock className="h-3.5 w-3.5" />
              {timeStr}
            </span>
            <a
              href={`tel:${appointment.customerPhone}`}
              className="flex items-center gap-1 font-mono tabular-nums hover:text-zinc-900"
            >
              <Phone className="h-3.5 w-3.5" />
              {appointment.customerPhone}
            </a>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-3 sm:pt-0 border-zinc-100">
        <div className="text-right">
          <span className="block font-mono text-lg font-bold tabular-nums text-zinc-900">
            ₺{appointment.totalAmount || appointment.service?.price || 0}
          </span>
          <span className="text-[11px] text-zinc-500">Yerinde Ödeme</span>
        </div>
      </div>
    </div>
  );
}

export default AppointmentCard;
