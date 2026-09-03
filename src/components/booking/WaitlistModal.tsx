'use client';

import React, { useState } from 'react';
import { Bell, X, CheckCircle2, Loader2 } from 'lucide-react';
import { joinWaitlist } from '@/app/actions/waitlist';

interface WaitlistModalProps {
  businessId: string;
  serviceId?: string;
  targetDate?: string;
  businessName?: string;
}

export function WaitlistModal({
  businessId,
  serviceId = 'srv_general_default',
  targetDate = new Date().toISOString().split('T')[0],
  businessName = 'İşletme',
}: WaitlistModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [phone, setPhone] = useState('');
  const [timeRange, setTimeRange] = useState('Fark Etmez');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;

    setLoading(true);
    setStatus(null);

    const fd = new FormData();
    fd.append('businessId', businessId);
    fd.append('serviceId', serviceId);
    fd.append('customerPhone', phone.trim());
    fd.append('targetDate', targetDate);
    fd.append('timeRange', timeRange);

    const res = await joinWaitlist(fd);
    setLoading(false);
    setStatus(res);

    if (res.success) {
      setTimeout(() => {
        setIsOpen(false);
        setStatus(null);
        setPhone('');
      }, 2500);
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-2.5 text-xs font-semibold text-zinc-700 hover:border-zinc-900 hover:bg-zinc-100 transition-colors"
      >
        <Bell className="h-4 w-4 text-zinc-500" />
        <span>Bu gün için yer açılırsa bana haber ver (Yedek Liste)</span>
      </button>

      {/* Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-50 text-amber-600 border border-amber-200/60">
                  <Bell className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">Akıllı Bekleme Listesi</h3>
                  <p className="text-[11px] text-zinc-500">{businessName} — {targetDate}</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {status?.success ? (
              <div className="py-6 text-center space-y-2">
                <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
                <p className="text-sm font-semibold text-zinc-900">Sıraya Alındınız!</p>
                <p className="text-xs text-zinc-600 leading-relaxed">{status.message}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-xs text-zinc-600 leading-relaxed">
                  İstediğiniz gün tamamen doluysa telefon numaranızı bırakın. Bir iptal olduğunda sistem otomatik olarak ilk size SMS veya WhatsApp ile haber verir.
                </p>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Telefon Numaranız
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="05XX XXX XX XX"
                    required
                    className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 font-mono tabular-nums text-[16px] text-zinc-900 focus:outline-none focus:border-zinc-900 min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Tercih Ettiğiniz Saat Aralığı
                  </label>
                  <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 min-h-[44px]"
                  >
                    <option value="Fark Etmez">Fark Etmez (Herhangi bir boşluk)</option>
                    <option value="Sabah (09:00 - 12:00)">Sabah (09:00 - 12:00)</option>
                    <option value="Öğleden Sonra (12:00 - 17:00)">Öğleden Sonra (12:00 - 17:00)</option>
                    <option value="Akşam (17:00 - 20:00)">Akşam (17:00 - 20:00)</option>
                  </select>
                </div>

                {status?.message && !status.success && (
                  <div className="rounded-lg bg-red-50 p-2.5 text-xs text-red-600">
                    {status.message}
                  </div>
                )}

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="min-h-[44px] rounded-xl border border-zinc-200 px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-50"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !phone.trim()}
                    className="min-h-[44px] inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-2 text-xs font-semibold text-white hover:bg-zinc-800 disabled:opacity-50"
                  >
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    <span>Yedek Listeye Kaydol</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default WaitlistModal;
