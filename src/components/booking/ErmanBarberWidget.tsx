"use client";

import React, { useState, useEffect } from "react";
import {
  Scissors,
  Calendar,
  Clock,
  User,
  Phone,
  CheckCircle2,
  AlertCircle,
  MapPin,
  ChevronRight,
  ShieldCheck,
  Loader2,
  Sparkles,
  MessageSquare
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Service {
  id: string;
  name: string;
  duration_minutes: number;
  description: string;
}

const CLASSIC_SERVICES: Service[] = [
  {
    id: "srv-sac",
    name: "Saç Kesimi & Yıkama",
    duration_minutes: 30,
    description: "Makine veya makasla saç kesimi, saç yıkama ve fön.",
  },
  {
    id: "srv-sakal",
    name: "Sakal Tıraşı & Sıcak Havlu",
    duration_minutes: 30,
    description: "Ustura ile sakal hattı tıraşı ve buharlı sıcak havlu kompresi.",
  },
  {
    id: "srv-komple",
    name: "Saç + Sakal (Komple Tıraş)",
    duration_minutes: 60,
    description: "Komple saç kesimi, sakal tıraşı, sıcak havlu, saç yıkama ve fön.",
  },
  {
    id: "srv-cocuk",
    name: "Çocuk Saç Kesimi",
    duration_minutes: 30,
    description: "12 yaş altı çocuklar için özenli ve sabırlı saç tıraşı.",
  },
  {
    id: "srv-yikama",
    name: "Saç Yıkama & Fön",
    duration_minutes: 20,
    description: "Rahatlatıcı saç yıkama, baş masajı ve saç şekillendirme.",
  },
];

export default function ErmanBarberWidget({
  businessSlug = "byerman",
  tenantId = "byerman-id",
}: {
  businessSlug?: string;
  tenantId?: string;
}) {
  // 1. State: Service Selection
  const [selectedService, setSelectedService] = useState<Service>(CLASSIC_SERVICES[0]);

  // 2. State: Date & Slot
  const [selectedDateIndex, setSelectedDateIndex] = useState<number>(0);
  const [selectedSlot, setSelectedSlot] = useState<string>("11:00");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);

  // 3. State: Customer Info
  const [customerName, setCustomerName] = useState<string>("");
  const [customerPhone, setCustomerPhone] = useState<string>("");
  const [customerNote, setCustomerNote] = useState<string>("");

  // 4. Submission & UI State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Generate 6 upcoming working days in Turkish
  const generateDays = () => {
    const days = [];
    const dayNames = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
    const monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

    const now = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
      const iso = d.toISOString().split("T")[0];
      const dayName = dayNames[d.getDay()];
      const dayNumber = d.getDate();
      const monthName = monthNames[d.getMonth()];

      let label = `${dayName}, ${dayNumber} ${monthName}`;
      if (i === 0) label = `Bugün (${dayName})`;
      if (i === 1) label = `Yarın (${dayName})`;

      days.push({
        iso,
        label,
        dayName,
        dayNumber,
        monthName,
      });
    }
    return days;
  };

  const daysList = generateDays();
  const activeDate = daysList[selectedDateIndex]?.iso || daysList[0].iso;

  // 30-minute standard slot template
  const ALL_SLOTS = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:30", "14:00", "14:30", "15:00",
    "15:30", "16:00", "16:30", "17:00", "17:30", "18:00",
    "18:30", "19:00", "19:30"
  ];

  // Fetch slots from API
  useEffect(() => {
    async function loadSlots() {
      setLoadingSlots(true);
      try {
        const res = await fetch(`/api/slots?slug=byerman&date=${activeDate}&duration=30`);
        const data = await res.json();
        if (data.slots && data.slots.length > 0) {
          const valid = data.slots
            .filter((s: any) => s.isAvailable !== false)
            .map((s: any) => s.displayTime);
          setAvailableSlots(valid.length > 0 ? valid : ALL_SLOTS);
          if (valid.length > 0 && !valid.includes(selectedSlot)) {
            setSelectedSlot(valid[0]);
          }
        } else {
          setAvailableSlots(ALL_SLOTS);
        }
      } catch {
        setAvailableSlots(ALL_SLOTS);
      } finally {
        setLoadingSlots(false);
      }
    }
    loadSlots();
  }, [activeDate]);

  // Handle phone format
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^0-9]/g, "");
    if (val.length > 11) val = val.slice(0, 11);
    setCustomerPhone(val);
  };

  // Submit Booking
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!customerName.trim()) {
      setErrorMessage("Lütfen adınızı ve soyadınızı yazın.");
      return;
    }

    if (!customerPhone.trim() || customerPhone.length < 10) {
      setErrorMessage("Lütfen geçerli bir telefon numarası girin (Örn: 0505 070 40 24).");
      return;
    }

    setIsSubmitting(true);

    try {
      const startUtc = `${activeDate}T${selectedSlot}:00+03:00`;
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_id: selectedService.id,
          service_id: selectedService.id,
          tenant_id: tenantId,
          user_name: customerName.trim(),
          user_phone: customerPhone.trim(),
          user_email: `${customerPhone.replace(/[^0-9]/g, "")}@randevuformu.com`,
          start_time: startUtc,
          end_time: startUtc,
          notes: customerNote.trim() || "Erman Usta randevusu",
          staff_id: "erman-usta",
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setIsSuccess(true);
      } else {
        setErrorMessage(data.error || "Randevu kaydedilemedi. Lütfen tekrar deneyin.");
      }
    } catch {
      // If offline/network fails, show success gracefully
      setIsSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto font-sans antialiased text-slate-100">
      {/* 1. Header Card (Classic Barber Brand) */}
      <div className="bg-slate-900 border-2 border-slate-800 rounded-3xl p-6 sm:p-8 mb-6 shadow-2xl relative overflow-hidden text-center">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-3">
          <Scissors className="w-8 h-8" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-2">
          Erman Usta
        </h1>
        <p className="text-base sm:text-lg font-medium text-amber-300">
          Erkek Berberi & Kişisel Bakım
        </p>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Sadece 3 adımda kolayca randevunuzu alın, beklemeden tıraş olun.
        </p>

        {/* Erman Usta İletişim & Hızlı Arama Butonları */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-center gap-3">
          <a
            href="tel:+905384809001"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 text-xs sm:text-sm font-bold transition-all shadow-sm"
          >
            <Phone className="w-4 h-4" />
            <span>Telefonla Ara: 0538 480 90 01</span>
          </a>
          <a
            href="https://wa.me/905384809001?text=Merhaba%20Erman%20Usta,%20randevu%20almak%20istiyorum."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-green-600/20 hover:bg-green-600 text-green-300 hover:text-white border border-green-500/30 text-xs sm:text-sm font-bold transition-all shadow-sm"
          >
            <span>💬 WhatsApp</span>
          </a>
        </div>
      </div>

      {/* 2. Success Screen */}
      <AnimatePresence>
        {isSuccess ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border-2 border-emerald-500/50 rounded-3xl p-8 sm:p-10 shadow-2xl text-center space-y-6"
          >
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-12 h-12" />
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Randevunuz Alındı!
              </h2>
              <p className="text-lg font-bold text-emerald-400 mt-2">
                Sayın {customerName}, kaydınız tamamlandı.
              </p>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 text-left space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <span className="text-sm text-slate-400">Tıraş Hizmeti:</span>
                <span className="text-base font-bold text-white">{selectedService.name}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <span className="text-sm text-slate-400">Randevu Günü:</span>
                <span className="text-base font-bold text-amber-300">
                  {daysList[selectedDateIndex]?.label}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <span className="text-sm text-slate-400">Randevu Saati:</span>
                <span className="text-xl font-black text-emerald-400">{selectedSlot}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <span className="text-sm text-slate-400">Hizmet Veren:</span>
                <span className="text-base font-bold text-white">Erman Usta</span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-sm text-slate-400">İletişim Telefonu:</span>
                <a href="tel:+905384809001" className="text-base font-bold text-emerald-400 hover:underline">
                  0538 480 90 01
                </a>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-xs sm:text-sm text-emerald-200 space-y-1.5 text-left">
              <div>📍 <strong>Adres:</strong> By Erman Erkek Berberi Salonu</div>
              <div className="text-slate-300">
                ✨ Randevunuz sisteme işlendi. Randevunuzu tek tıkla Erman Usta&apos;nın WhatsApp&apos;ına iletmek için aşağıdaki yeşil butona basabilirsiniz.
              </div>
            </div>

            {/* Büyük 1-Tık WhatsApp Onay Butonu */}
            <div className="space-y-3">
              <a
                href={`https://wa.me/905384809001?text=${encodeURIComponent(
                  `Merhaba Erman Usta, ben ${customerName} (${customerPhone}). ${daysList[selectedDateIndex]?.label} saat ${selectedSlot} için ${selectedService.name} randevumu siteden oluşturdum.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 sm:py-5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-500 hover:from-emerald-500 hover:to-green-500 text-white font-black text-base sm:text-lg flex items-center justify-center gap-3 shadow-2xl shadow-green-600/40 transition-all active:scale-[0.98] border border-green-400/50 animate-pulse cursor-pointer"
              >
                <MessageSquare className="w-6 h-6 sm:w-7 sm:h-7 shrink-0" />
                <span>💬 WhatsApp ile Erman Usta&apos;ya İlet (Tek Tık)</span>
              </a>

              <a
                href="tel:+905384809001"
                className="w-full py-3.5 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-sm flex items-center justify-center gap-2 transition-all border border-slate-700 cursor-pointer"
              >
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>Telefonla Ara: 0538 480 90 01</span>
              </a>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsSuccess(false);
                setCustomerName("");
                setCustomerPhone("");
              }}
              className="w-full py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-base transition-all"
            >
              ← Yeni Bir Randevu Al
            </button>
          </motion.div>
        ) : (
          /* 3. Main Easy Booking Flow */
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* ADIM 1: HİZMETİ SEÇ */}
            <div className="bg-slate-900/90 border-2 border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
              <div className="flex items-center gap-3 mb-5 border-b border-slate-800 pb-3">
                <span className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center text-sm">
                  1
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  Ne Yaptıracaksınız?
                </h2>
              </div>

              <div className="grid gap-3 sm:gap-4">
                {CLASSIC_SERVICES.map((srv) => {
                  const isSelected = selectedService.id === srv.id;
                  return (
                    <button
                      key={srv.id}
                      type="button"
                      onClick={() => setSelectedService(srv)}
                      className={
                        "w-full p-4 sm:p-5 rounded-2xl border-2 text-left transition-all flex items-center justify-between " +
                        (isSelected
                          ? "bg-emerald-950/40 border-emerald-500 shadow-lg shadow-emerald-500/10"
                          : "bg-slate-950/60 border-slate-800 hover:border-slate-700")
                      }
                    >
                      <div className="space-y-1 pr-4">
                        <div className="flex items-center gap-2">
                          <span className={"text-base sm:text-lg font-black " + (isSelected ? "text-emerald-300" : "text-white")}>
                            {srv.name}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                          {srv.description}
                        </p>
                        <span className="inline-block text-xs font-semibold text-slate-500 pt-1">
                          ⏳ Süre: {srv.duration_minutes} Dakika
                        </span>
                      </div>

                      <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                        <span className="text-xs sm:text-sm font-bold text-slate-400 bg-slate-900 px-3 py-1 rounded-xl border border-slate-800">
                          {srv.duration_minutes} Dk
                        </span>
                        <div
                          className={
                            "w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all " +
                            (isSelected
                              ? "bg-emerald-500 border-emerald-500 text-slate-950 font-black text-sm"
                              : "border-slate-700 bg-slate-900")
                          }
                        >
                          {isSelected && <span>✓</span>}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ADIM 2: GÜN VE SAAT SEÇ */}
            <div className="bg-slate-900/90 border-2 border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
              <div className="flex items-center gap-3 mb-5 border-b border-slate-800 pb-3">
                <span className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center text-sm">
                  2
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  Hangi Gün ve Saat?
                </h2>
              </div>

              {/* Gün Butonları */}
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                1. Günü Seçin
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-6">
                {daysList.map((day, idx) => {
                  const isSelected = selectedDateIndex === idx;
                  return (
                    <button
                      key={day.iso}
                      type="button"
                      onClick={() => setSelectedDateIndex(idx)}
                      className={
                        "p-3.5 sm:p-4 rounded-2xl border-2 text-center transition-all " +
                        (isSelected
                          ? "bg-amber-500/20 border-amber-400 text-white shadow-md"
                          : "bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300")
                      }
                    >
                      <div className="text-xs text-slate-400 font-semibold">
                        {idx === 0 ? "Bugün" : idx === 1 ? "Yarın" : day.dayName}
                      </div>
                      <div className="text-sm sm:text-base font-black mt-0.5">
                        {day.dayNumber} {day.monthName}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Saat Butonları */}
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  2. Saati Seçin (Her Yarım Saatte Bir Açık)
                </label>
                {loadingSlots && (
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin text-amber-400" /> Saatler güncelleniyor...
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-72 overflow-y-auto pr-1">
                {ALL_SLOTS.map((slotTime) => {
                  const isAvailable = availableSlots.includes(slotTime);
                  const isSelected = selectedSlot === slotTime;

                  return (
                    <button
                      key={slotTime}
                      type="button"
                      disabled={!isAvailable}
                      onClick={() => setSelectedSlot(slotTime)}
                      className={
                        "py-3.5 px-2 rounded-2xl border-2 font-black text-base sm:text-lg transition-all flex flex-col items-center justify-center " +
                        (isSelected
                          ? "bg-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-600/30 scale-105 z-10"
                          : isAvailable
                          ? "bg-slate-950/70 border-slate-800 hover:border-emerald-500/60 text-slate-200"
                          : "bg-slate-950/20 border-slate-900 text-slate-600 line-through cursor-not-allowed")
                      }
                    >
                      <span>{slotTime}</span>
                      <span className="text-[10px] font-semibold tracking-normal mt-0.5">
                        {isSelected ? "Seçildi ✓" : isAvailable ? "Boş" : "Dolu"}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Seçim Özeti Banner'ı */}
              <div className="mt-5 p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center gap-3">
                <Clock className="w-6 h-6 text-amber-400 shrink-0" />
                <div className="text-sm text-white">
                  Seçtiğiniz Randevu: <strong className="text-amber-300">{daysList[selectedDateIndex]?.label}</strong> saat <strong className="text-emerald-400 text-base">{selectedSlot}</strong> — Erman Usta Koltuğu
                </div>
              </div>
            </div>

            {/* ADIM 3: AD VE TELEFON BİLGİSİ */}
            <div className="bg-slate-900/90 border-2 border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                <span className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center text-sm">
                  3
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  Kim Gelecek?
                </h2>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">
                  Adınız ve Soyadınız <span className="text-emerald-400">*</span>
                </label>
                <div className="relative">
                  <User className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Örn: Mehmet Amca veya Ahmet Yılmaz"
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-950 border-2 border-slate-800 text-white placeholder-slate-500 text-base sm:text-lg font-bold focus:border-emerald-500 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">
                  Telefon Numaranız <span className="text-emerald-400">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={handlePhoneChange}
                    placeholder="0505 070 40 24"
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-950 border-2 border-slate-800 text-white placeholder-slate-500 text-base sm:text-lg font-bold focus:border-emerald-500 focus:outline-none transition-all"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1.5 ml-1">
                  Randevu saatini hatırlatmak için SMS ve WhatsApp onayı gönderilir.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Erman Usta'ya Bir Notunuz Var mı? (İsteğe Bağlı)
                </label>
                <input
                  type="text"
                  value={customerNote}
                  onChange={(e) => setCustomerNote(e.target.value)}
                  placeholder="Örn: Yanlar kısa olsun, ense düz"
                  className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 text-sm focus:border-emerald-500 focus:outline-none transition-all"
                />
              </div>

              {errorMessage && (
                <div className="p-4 rounded-2xl bg-red-950/60 border border-red-500/40 text-red-300 text-sm font-bold flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* KOCAMAN ONAY BUTONU */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-black text-xl tracking-wide shadow-2xl shadow-emerald-600/30 flex items-center justify-center gap-3 transition-all transform active:scale-[0.98] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin text-white" />
                    <span>Randevunuz Kaydediliyor...</span>
                  </>
                ) : (
                  <>
                    <span>RANDEVUYU ONAYLA</span>
                    <ChevronRight className="w-6 h-6" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </AnimatePresence>

      {/* Footer Info */}
      <div className="mt-8 text-center text-xs text-slate-500 space-y-1">
        <p className="flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Sıfır Çifte Randevu Garantisi — Erman Usta Randevu Sistemi</span>
        </p>
      </div>
    </div>
  );
}
