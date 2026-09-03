// components/booking/checkout-form.tsx
'use client';

import { useState } from 'react';
import { createBooking } from '@/app/actions/booking';
import { CheckCircle2, MessageCircle, Loader2 } from 'lucide-react';

interface CheckoutFormProps {
  businessId: string;
  serviceId: string;
  selectedStartTime: string;
  selectedEndTime: string;
}

export function CheckoutForm({ businessId, serviceId, selectedStartTime, selectedEndTime }: CheckoutFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.append('businessId', businessId);
    formData.append('serviceId', serviceId);
    formData.append('startTime', selectedStartTime);
    formData.append('endTime', selectedEndTime);

    const result = await createBooking(formData);

    if (result.success) {
      setIsSuccess(true);
      if (result.whatsappRedirectUrl) {
        setWhatsappUrl(result.whatsappRedirectUrl);
        // Form başarılı olunca işletmenin WhatsApp'ına otomatik yönlendir veya buton sun
        setTimeout(() => {
          window.location.href = result.whatsappRedirectUrl as string;
        }, 1500);
      }
    } else {
      setError(result.message || "Bir hata oluştu.");
      setIsSubmitting(false);
    }
  }

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 rounded-xl border border-emerald-200 bg-emerald-50 p-8 text-center shadow-sm">
        <CheckCircle2 className="h-12 w-12 text-emerald-600" />
        <h3 className="text-xl font-bold text-zinc-900">Randevunuz Alındı!</h3>
        <p className="text-sm text-zinc-600">
          İşleminiz başarıyla kaydedildi. İşletmeye WhatsApp üzerinden onay mesajı göndermek için yönlendiriliyorsunuz...
        </p>
        {whatsappUrl && (
          <a
            href={whatsappUrl}
            className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-[#25D366] px-6 py-3 font-medium text-white transition-opacity hover:opacity-90 min-h-[44px]"
          >
            <MessageCircle className="h-5 w-5" />
            WhatsApp'a Git
          </a>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4 rounded-xl border border-zinc-200/80 bg-white p-6 shadow-sm">
      <div className="mb-6 rounded-lg bg-zinc-50 p-4 border border-zinc-200">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-zinc-600">Ödeme Yöntemi</span>
          <span className="text-sm font-bold text-zinc-900">Yerinde Ödeme</span>
        </div>
        <p className="mt-1 text-xs text-zinc-500">Ücreti hizmeti aldıktan sonra klinikte/salonda ödeyebilirsiniz.</p>
      </div>

      <div className="space-y-1">
        <label htmlFor="customerName" className="text-sm font-medium text-zinc-900">Adınız Soyadınız</label>
        <input
          id="customerName"
          name="customerName"
          type="text"
          required
          className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-[16px] transition-colors focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 min-h-[44px]"
          placeholder="Örn: Yunus Emre Eren"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="customerPhone" className="text-sm font-medium text-zinc-900">Telefon Numaranız</label>
        <input
          id="customerPhone"
          name="customerPhone"
          type="tel"
          required
          className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-[16px] font-mono tabular-nums transition-colors focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 min-h-[44px]"
          placeholder="0555 123 45 67"
        />
      </div>

      {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-6 flex min-h-[44px] w-full items-center justify-center rounded-lg bg-zinc-900 px-4 font-medium text-white transition-opacity disabled:opacity-50"
      >
        {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Randevuyu Onayla"}
      </button>
    </form>
  );
}

export default CheckoutForm;
