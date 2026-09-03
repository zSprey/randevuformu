'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Sparkles, X, CheckCircle2, Loader2, Volume2 } from 'lucide-react';

interface VoiceNoteRecorderProps {
  appointmentId: string;
  customerName: string;
  serviceName: string;
  onSuccess: (summary: string) => void;
  onClose: () => void;
}

export function VoiceNoteRecorder({
  appointmentId,
  customerName,
  serviceName,
  onSuccess,
  onClose,
}: VoiceNoteRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState(0);
  const [quickNote, setQuickNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setTimer((prev) => {
          if (prev >= 30) {
            stopRecording();
            return 30;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const startRecording = async () => {
    setError(null);
    setTimer(0);
    try {
      if (typeof window !== 'undefined' && navigator.mediaDevices) {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      }
      setIsRecording(true);
    } catch {
      setError('Mikrofon erişimine izin verilmedi. Dilerseniz aşağıya hızlı not yazabilirsiniz.');
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
  };

  const handleSubmit = async () => {
    setIsProcessing(true);
    setError(null);

    const noteText = quickNote.trim() || `Seans tamamlandı. Danışan ${customerName} gayet memnun kaldı.`;

    try {
      const res = await fetch('/api/ai/audio-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId,
          rawNotes: noteText,
          customerName,
          serviceName,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        onSuccess(data.structuredSummary);
      } else {
        throw new Error('Özet üretilemedi.');
      }
    } catch (err: any) {
      setError(err.message || 'Klinik özeti işlenirken bir hata oluştu.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-600 border border-red-200/60">
              <Mic className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900">Personel Sesli Not & AI Klinik Özeti</h3>
              <p className="text-[11px] text-zinc-500">{customerName} — {serviceName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Recording Interface */}
        <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-6 text-center space-y-4">
          <div className="flex justify-center">
            {isRecording ? (
              <button
                type="button"
                onClick={stopRecording}
                className="relative flex h-16 w-16 items-center justify-center rounded-full bg-red-600 text-white shadow-lg shadow-red-600/30 animate-pulse hover:bg-red-700"
                aria-label="Kaydı Durdur"
              >
                <Square className="h-6 w-6" />
                <span className="absolute -bottom-1 h-3 w-3 rounded-full bg-red-400 animate-ping" />
              </button>
            ) : (
              <button
                type="button"
                onClick={startRecording}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-900 text-white shadow-lg hover:bg-zinc-800 transition-transform active:scale-95"
                aria-label="Kaydı Başlat"
              >
                <Mic className="h-7 w-7 text-white" />
              </button>
            )}
          </div>

          <div>
            <div className="font-mono text-xl font-bold tabular-nums text-zinc-900">
              00:{timer < 10 ? `0${timer}` : timer} / 00:30
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              {isRecording
                ? 'Konuşun... Seans detaylarını ve tavsiyelerinizi aktarın.'
                : 'Mikrofona basarak 15-30 sn ses kaydı bırakın.'}
            </p>
          </div>
        </div>

        {/* Fallback Text Input */}
        <div>
          <label className="block text-xs font-semibold text-zinc-700 mb-1">
            Veya Hızlı Not Yazın (AI bunu 3 maddelik rapora dönüştürür)
          </label>
          <textarea
            rows={2}
            value={quickNote}
            onChange={(e) => setQuickNote(e.target.value)}
            placeholder="Örn: Dolgu sorunsuz bitti, sağ alt azıda hafif hassasiyet vardı, 3 hafta sonra kontrole çağrıldı."
            className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900"
          />
        </div>

        {error && (
          <div className="rounded-lg bg-amber-50 p-2.5 text-xs text-amber-800 border border-amber-200">
            {error}
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-2 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] rounded-xl border border-zinc-200 px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-50"
          >
            Vazgeç
          </button>
          <button
            type="button"
            disabled={isProcessing}
            onClick={handleSubmit}
            className="min-h-[44px] inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-2 text-xs font-semibold text-white hover:bg-zinc-800 disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>AI Özeti Hazırlanıyor...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 text-amber-400" />
                <span>AI Klinik Özeti Oluştur</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default VoiceNoteRecorder;
