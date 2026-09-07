"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays,
  Clock,
  User,
  Scissors,
  CheckCircle2,
  XCircle,
  Calendar,
  AlertTriangle,
  ArrowLeft,
  ChevronRight,
  Loader2,
  MessageCircle,
  ShieldCheck,
  Building2,
} from "lucide-react";

interface AppointmentDetails {
  id: string;
  customer_name: string;
  customer_phone: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  service_name: string;
  staff_name: string;
  tenant: string;
}

interface BusinessDetails {
  slug: string;
  name: string;
}

function ManageAppointmentContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const token = searchParams.get("token");
  const tenant = searchParams.get("tenant") || "byerman";

  const [loading, setLoading] = useState(true);
  const [appointment, setAppointment] = useState<AppointmentDetails | null>(null);
  const [business, setBusiness] = useState<BusinessDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Action states
  const [activeModal, setActiveModal] = useState<"cancel" | "reschedule" | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // Reschedule state
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    async function loadAppointment() {
      if (!id || !token) {
        setError("Geçersiz veya eksik bağlantı parametreleri. Lütfen SMS veya WhatsApp mesajınızdaki bağlantıyı kontrol edin.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `/api/bookings/manage?id=${encodeURIComponent(id)}&token=${encodeURIComponent(token)}&tenant=${encodeURIComponent(tenant)}`
        );
        const data = await res.json();

        if (res.ok && data.success && data.appointment) {
          setAppointment(data.appointment);
          setBusiness(data.business);
        } else {
          setError(data.error || "Randevu kaydına ulaşılamadı veya bağlantı süresi dolmuş.");
        }
      } catch {
        setError("Bağlantı hatası oluştu. Lütfen sayfayı yenileyin.");
      } finally {
        setLoading(false);
      }
    }

    loadAppointment();
  }, [id, token, tenant]);

  // Load available slots when new date selected for rescheduling
  useEffect(() => {
    async function loadSlots() {
      if (!newDate || !business?.slug) return;
      setLoadingSlots(true);
      try {
        const res = await fetch(`/api/slots?slug=${encodeURIComponent(business.slug)}&date=${encodeURIComponent(newDate)}&duration=30`);
        if (res.ok) {
          const data = await res.json();
          const slots = (data.slots || [])
            .filter((s: any) => s.isAvailable)
            .map((s: any) => s.displayTime);
          setAvailableSlots(slots.length > 0 ? slots : ["10:00", "11:30", "14:00", "15:30", "16:45"]);
        } else {
          setAvailableSlots(["10:00", "11:30", "14:00", "15:30", "16:45"]);
        }
      } catch {
        setAvailableSlots(["10:00", "11:30", "14:00", "15:30", "16:45"]);
      } finally {
        setLoadingSlots(false);
      }
    }

    if (activeModal === "reschedule" && newDate) {
      loadSlots();
    }
  }, [newDate, activeModal, business?.slug]);

  // Handle Cancel
  const handleCancelAppointment = async () => {
    if (!id || !token) return;
    setIsProcessing(true);

    try {
      const res = await fetch("/api/bookings/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          token,
          action: "cancel",
          reason: cancelReason,
          tenant,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setAppointment((prev) => (prev ? { ...prev, status: "cancelled" } : null));
        setActiveModal(null);
        setActionSuccessMessage("Randevunuz başarıyla iptal edildi. Boşalan saat sisteme bildirildi.");
      } else {
        alert(data.error || "İptal işlemi gerçekleştirilemedi.");
      }
    } catch {
      alert("İşlem sırasında bir hata oluştu.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Reschedule
  const handleRescheduleAppointment = async () => {
    if (!id || !token || !newDate || !newTime) return;
    setIsProcessing(true);

    try {
      const res = await fetch("/api/bookings/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          token,
          action: "reschedule",
          new_date: newDate,
          new_time: newTime,
          tenant,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setAppointment((prev) =>
          prev
            ? {
                ...prev,
                appointment_date: newDate,
                appointment_time: newTime,
                status: "confirmed",
              }
            : null
        );
        setActiveModal(null);
        setActionSuccessMessage(`Randevunuz başarıyla ${newDate} - ${newTime} saatine ertelendi.`);
      } else {
        alert(data.error || "Erteleme işlemi gerçekleştirilemedi.");
      }
    } catch {
      alert("İşlem sırasında bir hata oluştu.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFBFC] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="w-8 h-8 text-[#0062FF] animate-spin" />
          <p className="text-xs font-semibold text-slate-600">Randevu bilgileri doğrulanıyor...</p>
        </div>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="min-h-screen bg-[#FAFBFC] flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xl text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-[#0F2A4A]">Randevu Bulunamadı</h2>
          <p className="text-xs text-slate-500 leading-relaxed">{error}</p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#0062FF] hover:bg-[#0051d4] text-white font-semibold text-xs transition-all shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" /> Ana Sayfaya Dön
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isCancelled = appointment.status === "cancelled";
  const isCompleted = appointment.status === "completed";

  return (
    <div className="min-h-screen bg-[#FAFBFC] text-slate-800 py-10 px-4 sm:px-6 font-sans antialiased flex flex-col justify-between">
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-[#0062FF]/[0.03] to-transparent rounded-full -translate-y-1/3 translate-x-1/3 pointer-events-none -z-10" />

      <main className="max-w-lg mx-auto w-full space-y-6">
        {/* Success Alert Banner */}
        <AnimatePresence>
          {actionSuccessMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold flex items-center gap-2.5 shadow-2xs"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{actionSuccessMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Appointment Management Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-[#0F2A4A] p-6 text-white space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-blue-200 uppercase tracking-wider">
                Randevu Yönetim Masası
              </span>
              <span
                className={`px-3 py-1 rounded-full text-[11px] font-bold ${
                  isCancelled
                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                    : isCompleted
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "bg-blue-500/20 text-blue-200 border border-blue-500/30"
                }`}
              >
                {isCancelled ? "İptal Edildi" : isCompleted ? "Tamamlandı" : "Onaylı Randevu"}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold">{business?.name || "Randevu"}</h1>
            <p className="text-xs text-slate-300">
              Sayın <strong className="text-white">{appointment.customer_name}</strong>, randevu detaylarınızı aşağıdan inceleyebilir, erteleyebilir veya iptal edebilirsiniz.
            </p>
          </div>

          {/* Details Body */}
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-2 gap-3.5">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Tarih
                </span>
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#0F2A4A]">
                  <CalendarDays className="w-4 h-4 text-[#0062FF]" />
                  <span>{appointment.appointment_date}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Saat
                </span>
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#0F2A4A]">
                  <Clock className="w-4 h-4 text-[#0062FF]" />
                  <span className="font-mono">{appointment.appointment_time.slice(0, 5)}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Hizmet
                </span>
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#0F2A4A] truncate">
                  <Scissors className="w-4 h-4 text-[#0062FF] shrink-0" />
                  <span className="truncate">{appointment.service_name}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Uzman / Koltuk
                </span>
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#0F2A4A] truncate">
                  <User className="w-4 h-4 text-[#0062FF] shrink-0" />
                  <span className="truncate">{appointment.staff_name}</span>
                </div>
              </div>
            </div>

            {/* Actions for Confirmed appointments */}
            {!isCancelled && !isCompleted && (
              <div className="pt-2 space-y-3">
                <button
                  type="button"
                  onClick={() => {
                    setNewDate(appointment.appointment_date);
                    setActiveModal("reschedule");
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-[#0062FF] hover:bg-[#0051d4] active:scale-[0.99] text-white font-semibold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Randevumu Ertele / Tarihi Değiştir</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveModal("cancel")}
                  className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 font-semibold text-xs transition-colors flex items-center justify-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Randevumu İptal Et</span>
                </button>
              </div>
            )}

            {isCancelled && (
              <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 text-rose-800 text-xs space-y-1">
                <p className="font-bold">Bu randevu iptal edilmiştir.</p>
                <p className="text-[11px] text-rose-600">
                  Dilediğiniz zaman işletmenin randevu sayfasından yeni bir gün ve saat için rezervasyon oluşturabilirsiniz.
                </p>
                <div className="pt-2">
                  <Link
                    href={`/${business?.slug || tenant}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600 text-white font-semibold text-[11px]"
                  >
                    Yeni Randevu Al <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}

            {/* WhatsApp Contact Button */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Güvenli İptal &amp; Erteleme</span>
              </span>
              <a
                href={`https://wa.me/905384809001?text=${encodeURIComponent(`Merhaba, ${appointment.appointment_date} ${appointment.appointment_time.slice(0, 5)} tarihindeki randevum hakkında görüşmek istiyorum.`)}`}
                target="_blank"
                rel="noreferrer"
                className="text-[#0062FF] hover:underline font-semibold flex items-center gap-1"
              >
                <MessageCircle className="w-3.5 h-3.5" /> WhatsApp Destek
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Cancel Confirmation Modal */}
      {activeModal === "cancel" && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm p-6 rounded-3xl bg-white border border-slate-200 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-[#0F2A4A]">Randevuyu İptal Etmek İstiyor musunuz?</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Bu randevuyu iptal ettiğinizde saat diliminiz serbest kalacak ve bekleme listesindeki müşterilere teklif edilecektir.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                İptal Nedeni (İsteğe Bağlı)
              </label>
              <textarea
                rows={2}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Örn: Beklenmeyen bir program çakışması..."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0062FF]"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2.5">
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Vazgeç
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleCancelAppointment}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs disabled:opacity-50"
              >
                {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                <span>Evet, İptal Et</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {activeModal === "reschedule" && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-3xl bg-white border border-slate-200 shadow-2xl space-y-4">
            <div>
              <h3 className="text-base font-bold text-[#0F2A4A] flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#0062FF]" />
                Randevuyu Ertele
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Yeni bir tarih ve saat seçerek randevunuzu güncelleyin.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Yeni Tarih Seçin
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  value={newDate}
                  onChange={(e) => {
                    setNewDate(e.target.value);
                    setNewTime("");
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0062FF]"
                />
              </div>

              {newDate && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Müsait Saat Dilimi
                  </label>
                  {loadingSlots ? (
                    <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
                      <Loader2 className="w-4 h-4 animate-spin mx-auto text-[#0062FF] mb-1" />
                      Müsait saatler hesaplanıyor...
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto pr-1">
                      {availableSlots.map((slot) => {
                        const isSelected = newTime === slot;
                        return (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setNewTime(slot)}
                            className={`py-2 px-2 text-xs font-semibold rounded-xl border transition-all ${
                              isSelected
                                ? "bg-[#0062FF] text-white border-[#0062FF] shadow-xs"
                                : "bg-white text-slate-700 border-slate-200 hover:border-[#0062FF] hover:bg-blue-50/50"
                            }`}
                          >
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2.5">
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Vazgeç
              </button>
              <button
                type="button"
                disabled={isProcessing || !newDate || !newTime}
                onClick={handleRescheduleAppointment}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#0062FF] hover:bg-[#0051d4] text-white text-xs font-bold shadow-xs disabled:opacity-50 transition-all"
              >
                {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                <span>Randevuyu Güncelle</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="text-center text-xs text-slate-400 mt-8">
        <span>KVKK Uyumlu Randevu Altyapısı • randevuformu.com</span>
      </footer>
    </div>
  );
}

export default function ManageAppointmentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAFBFC] flex items-center justify-center p-4">
          <Loader2 className="w-8 h-8 text-[#0062FF] animate-spin" />
        </div>
      }
    >
      <ManageAppointmentContent />
    </Suspense>
  );
}
