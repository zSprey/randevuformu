// components/panel/appointment-card.tsx
'use client';

import { useState } from 'react';
import { Clock, Phone, User, Mic, Sparkles } from 'lucide-react';
import { VoiceNoteRecorder } from '@/components/panel/VoiceNoteRecorder';
import { ClinicalSummaryModal } from '@/components/panel/ClinicalSummaryModal';

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
  const [showRecorder, setShowRecorder] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [currentSummary, setCurrentSummary] = useState(appointment.notes?.structuredSummary || null);

  const timeString = new Date(appointment.startTime).toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
  });

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
    <>
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
              <button
                type="button"
                onClick={() => {
                  if (currentSummary) {
                    setShowSummary(true);
                  } else {
                    setShowRecorder(true);
                  }
                }}
                className="flex min-h-[44px] items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100"
              >
                {currentSummary ? (
                  <>
                    <Sparkles className="h-4 w-4 text-emerald-600" />
                    <span>Klinik Özeti Gör</span>
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4 text-zinc-600" />
                    <span>Sesli Not Ekle</span>
                  </>
                )}
              </button>
            ) : (
              <>
                <button className="min-h-[44px] rounded-xl border border-zinc-200 px-3.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50">
                  Düzenle
                </button>
                {appointment.status === 'PENDING' && (
                  <button className="min-h-[44px] rounded-xl bg-zinc-900 px-4 text-xs font-semibold text-white transition-opacity hover:opacity-90">
                    Onayla
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </article>

      {/* Modül 6: Ses Kaydı Modalı */}
      {showRecorder && (
        <VoiceNoteRecorder
          appointmentId={appointment.id}
          customerName={appointment.customerName}
          serviceName={appointment.service.name}
          onSuccess={(summary) => {
            setCurrentSummary(summary);
            setShowRecorder(false);
            setShowSummary(true);
          }}
          onClose={() => setShowRecorder(false)}
        />
      )}

      {/* Modül 6: Yapılandırılmış Klinik Kartı Modalı */}
      {showSummary && currentSummary && (
        <ClinicalSummaryModal
          customerName={appointment.customerName}
          serviceName={appointment.service.name}
          summary={currentSummary}
          onClose={() => setShowSummary(false)}
        />
      )}
    </>
  );
}

export default AppointmentCard;
