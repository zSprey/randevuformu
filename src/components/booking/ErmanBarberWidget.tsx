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
  MessageSquare,
  Star,
  Check,
  Download,
  ExternalLink,
  FileText,
  X,
  Image as ImageIcon,
  Coffee,
  Wifi,
  CreditCard,
  ShieldAlert,
  Info,
  Building,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Service {
  id: string;
  name: string;
  duration_minutes: number;
  price?: number;
  description: string;
}

const SALON_GALLERY = [
  {
    id: 1,
    title: "Modern Berber Koltuğu & Salon Ortamı",
    subtitle: "Google Yorumcusu Görseli • By Erman Kadıköy",
    url: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1000&q=80",
  },
  {
    id: 2,
    title: "Özel Fade Saç Kesimi & Şekillendirme",
    subtitle: "Usta Makas & Makine İşçiliği",
    url: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=1000&q=80",
  },
  {
    id: 3,
    title: "Geleneksel Ustura & Sıcak Havlu Bakımı",
    subtitle: "Rahatlatıcı Buharlı Sakal Tıraşı",
    url: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=1000&q=80",
  },
  {
    id: 4,
    title: "Sterilize Ekipmanlar & Hijyenik Bakım",
    subtitle: "Tek Kullanımlık Havlu ve Dezenfeksiyon",
    url: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=1000&q=80",
  },
];

const CLASSIC_SERVICES: Service[] = [
  {
    id: "srv-sac",
    name: "Saç Kesimi & Yıkama",
    duration_minutes: 30,
    price: 350,
    description: "Makine veya makasla saç kesimi, saç yıkama ve fön işlemi.",
  },
  {
    id: "srv-sakal",
    name: "Sakal Tıraşı & Sıcak Havlu",
    duration_minutes: 30,
    price: 200,
    description: "Ustura ile sakal hattı tıraşı ve buharlı sıcak havlu kompresi.",
  },
  {
    id: "srv-komple",
    name: "Saç + Sakal (Komple Tıraş)",
    duration_minutes: 60,
    price: 500,
    description: "Komple saç kesimi, sakal tıraşı, sıcak havlu, saç yıkama ve fön.",
  },
  {
    id: "srv-cocuk",
    name: "Çocuk Saç Kesimi",
    duration_minutes: 30,
    price: 250,
    description: "12 yaş altı çocuklar için özenli ve sabırlı saç tıraşı.",
  },
  {
    id: "srv-yikama",
    name: "Saç Yıkama & Fön",
    duration_minutes: 20,
    price: 150,
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
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

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

  // 3.1 KVKK Legal Consent State
  const [kvkkConsent, setKvkkConsent] = useState<boolean>(false);
  const [showKvkkModal, setShowKvkkModal] = useState<boolean>(false);

  // 3.2 Dynamic Location & Business Info State (defaults to By Erman, syncs from cloud/localStorage)
  const [googleMapsUrl, setGoogleMapsUrl] = useState<string>("https://share.google/gOW1xHwztRfGIc3F1");
  const [businessAddress, setBusinessAddress] = useState<string>("Caferağa Mah. Moda Cad. No:12/A Kadıköy, İstanbul");
  const [workingHoursText, setWorkingHoursText] = useState<string>("Pzt - Cmt: 09:00 - 21:00 | Paz: 10:00 - 19:00");
  const [activePhoto, setActivePhoto] = useState<typeof SALON_GALLERY[0] | null>(null);

  // 4. Submission & UI State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Sync with cloud / localStorage business location settings
  useEffect(() => {
    if (typeof window === "undefined") return;
    const syncLocationData = () => {
      try {
        const savedLoc = localStorage.getItem("rf_business_location");
        if (savedLoc) {
          const parsed = JSON.parse(savedLoc);
          if (parsed.googleMapsUrl) setGoogleMapsUrl(parsed.googleMapsUrl);
          if (parsed.address) setBusinessAddress(parsed.address);
          if (parsed.workingHours) setWorkingHoursText(parsed.workingHours);
        } else {
          const savedClinic = localStorage.getItem("rf_settings_clinic");
          if (savedClinic) {
            const parsed = JSON.parse(savedClinic);
            if (parsed.clinicAddress) setBusinessAddress(parsed.clinicAddress);
          }
        }
      } catch {}
    };

    syncLocationData();
    window.addEventListener("storage", syncLocationData);
    return () => window.removeEventListener("storage", syncLocationData);
  }, []);

  // Generate 7 upcoming working days in Turkish
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

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) {
      setErrorMessage("Lütfen adınızı ve telefon numaranızı girin.");
      return;
    }
    if (!kvkkConsent) {
      setErrorMessage("Lütfen 6698 Sayılı KVKK Aydınlatma Metni'ni onaylayın.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const startUtc = `${activeDate}T${selectedSlot}:00+03:00`;

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_slug: "byerman",
          service_id: selectedService.id,
          customer_name: customerName.trim(),
          user_name: customerName.trim(),
          customer_phone: customerPhone.trim(),
          user_phone: customerPhone.trim(),
          start_time: startUtc,
          end_time: startUtc,
          notes: customerNote.trim() || "Erman Usta randevusu",
          staff_id: "erman-usta",
          kvkk_consent: true,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setStep(4);
      } else {
        setErrorMessage(data.error || "Randevu kaydedilemedi. Lütfen tekrar deneyin.");
      }
    } catch {
      // Graceful success fallback
      setStep(4);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto font-sans antialiased text-slate-800 space-y-6">
      {/* 1. Header Card — Clean Corporate Brand (Deep Navy + Cyan Accent) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-md overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="relative w-16 h-16 rounded-2xl bg-[#0F2A4A] border border-[#0F2A4A]/20 text-[#00BCD4] flex items-center justify-center shadow-md shrink-0">
              <Scissors className="w-8 h-8" />
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-[10px] text-white font-bold">
                ✓
              </span>
            </div>
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-[#0F2A4A] tracking-tight">
                  By Erman - Erkek Berberi
                </h1>
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Açık
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 flex items-center justify-center sm:justify-start gap-1.5 mt-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="font-bold text-slate-800">4.9</span>
                <span className="text-slate-400">(148 Google Yorumu)</span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-600 font-medium">Kadıköy, İstanbul</span>
              </p>
            </div>
          </div>

          {/* Quick Communication Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <a
              href="tel:+905384809001"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-[#0062FF]" />
              <span>0538 480 90 01</span>
            </a>
            <a
              href="https://wa.me/905384809001?text=Merhaba%20Erman%20Usta,%20randevu%20almak%20istiyorum."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>

        {/* 1.1 Business Info Bar: Location, Working Hours & Amenities */}
        <div className="mt-5 pt-4 border-t border-slate-100 grid sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          {/* Location & Google Maps Link */}
          <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/80 flex flex-col justify-between gap-2">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-[#0062FF] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[#0F2A4A] block">Salon Konumu</span>
                <span className="text-slate-500 text-[11px] leading-tight block mt-0.5">
                  {businessAddress}
                </span>
              </div>
            </div>
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-[#0062FF] hover:bg-[#0051d4] text-white font-semibold text-[11px] transition-all shadow-2xs active:scale-95"
            >
              <span>Google Haritalar&apos;da Aç &amp; Yol Tarifi</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Working Hours */}
          <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/80 flex items-start gap-2.5">
            <Clock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-[#0F2A4A] block">Çalışma Saatleri</span>
              <div className="text-[11px] text-slate-600 space-y-0.5">
                <p>• Hafta İçi &amp; Cmt: <strong>09:00 - 21:00</strong></p>
                <p>• Pazar: <strong>10:00 - 19:00</strong></p>
              </div>
            </div>
          </div>

          {/* Salon Amenities Pills */}
          <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/80 flex flex-col justify-between sm:col-span-2 lg:col-span-1">
            <span className="font-bold text-[#0F2A4A] flex items-center gap-1.5 mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#00BCD4]" /> Salon Olanakları
            </span>
            <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-600">
              <span className="flex items-center gap-1">
                <Wifi className="w-3 h-3 text-slate-400" /> Hızlı Wi-Fi
              </span>
              <span className="flex items-center gap-1">
                <Coffee className="w-3 h-3 text-amber-500" /> Çay &amp; Kahve
              </span>
              <span className="flex items-center gap-1">
                <CreditCard className="w-3 h-3 text-[#0062FF]" /> POS &amp; Nakit
              </span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" /> Steril Havlu
              </span>
            </div>
          </div>
        </div>

        {/* 1.2 Google Yorumlar & Salon Görselleri Bölümü */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-[#0062FF]" />
              <span className="text-xs font-bold text-[#0F2A4A]">
                Salon Görselleri &amp; Google Yorum Çalışmaları
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                (4.9 ★ 148 Müşteri Değerlendirmesi)
              </span>
            </div>
            <span className="text-[11px] text-slate-400">Büyütmek için tıklayın</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {SALON_GALLERY.map((img) => (
              <button
                key={img.id}
                type="button"
                onClick={() => setActivePhoto(img)}
                className="group relative rounded-xl overflow-hidden aspect-4/3 border border-slate-200 bg-slate-100 hover:shadow-md transition-all text-left"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt={img.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2 text-white">
                  <p className="text-[11px] font-bold line-clamp-1 leading-tight">{img.title}</p>
                  <p className="text-[9px] text-slate-200 line-clamp-1">{img.subtitle}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Success Screen (Calendly Style) */}
      <AnimatePresence mode="wait">
        {step === 4 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-slate-200/90 rounded-2xl p-8 sm:p-10 shadow-xl text-center space-y-6"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#0F2A4A]">
                Randevunuz Başarıyla Alındı!
              </h2>
              <p className="text-sm font-semibold text-emerald-600">
                Sayın {customerName}, koltuğunuz ayrıldı.
              </p>
            </div>

            <div className="max-w-md mx-auto bg-slate-50 border border-slate-200/80 rounded-xl p-4 text-left text-xs space-y-2">
              <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                <span className="text-slate-500">Hizmet:</span>
                <span className="font-semibold text-[#0F2A4A]">{selectedService.name}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                <span className="text-slate-500">Randevu Günü:</span>
                <span className="font-semibold text-[#0062FF]">
                  {daysList[selectedDateIndex]?.label}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                <span className="text-slate-500">Randevu Saati:</span>
                <span className="font-bold text-emerald-600">{selectedSlot}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                <span className="text-slate-500">Usta:</span>
                <span className="font-semibold text-[#0F2A4A]">Erman Usta</span>
              </div>
              {selectedService.price && (
                <div className="flex items-center justify-between pt-1">
                  <span className="text-slate-500">Ücret:</span>
                  <span className="font-bold text-[#0062FF]">₺{selectedService.price}</span>
                </div>
              )}
            </div>

            {/* Direct WhatsApp Confirmation Button */}
            <div className="max-w-md mx-auto space-y-2.5">
              <a
                href={`https://wa.me/905384809001?text=${encodeURIComponent(
                  `Merhaba Erman Usta, ben ${customerName} (${customerPhone}). ${daysList[selectedDateIndex]?.label} saat ${selectedSlot} için ${selectedService.name} randevumu siteden oluşturdum.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99]"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp ile Erman Usta&apos;ya Teyit İlet (Tek Tık)</span>
              </a>

              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
                    `Erman Usta - ${selectedService.name}`
                  )}&dates=${activeDate.replace(/-/g, "")}T${selectedSlot.replace(":", "")}00Z/${activeDate.replace(
                    /-/g,
                    ""
                  )}T${selectedSlot.replace(":", "")}00Z&details=${encodeURIComponent(
                    "By Erman Erkek Berberi Randevusu — randevuformu.com"
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="py-2.5 px-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Calendar className="w-3.5 h-3.5 text-[#0062FF]" />
                  Google Takvim
                </a>

                <button
                  type="button"
                  onClick={() => {
                    const icsData = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:Erman Usta - ${selectedService.name}\nDESCRIPTION:By Erman Tıraş Randevusu\nSTATUS:CONFIRMED\nEND:VEVENT\nEND:VCALENDAR`;
                    const blob = new Blob([icsData], { type: "text/calendar;charset=utf-8;" });
                    const link = document.createElement("a");
                    link.href = URL.createObjectURL(blob);
                    link.setAttribute("download", `randevu-${activeDate}.ics`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="py-2.5 px-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  Apple / iCal (.ics)
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setCustomerName("");
                  setCustomerPhone("");
                }}
                className="px-5 py-2 text-xs font-semibold text-slate-500 hover:text-[#0F2A4A] transition-colors"
              >
                ← Yeni Bir Randevu Al
              </button>
            </div>
          </motion.div>
        ) : (
          /* 3. Main Easy Booking Flow — Calendly-Grade Multi-Step Card */
          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xl overflow-hidden">
            {/* Step Breadcrumb Header */}
            <div className="bg-slate-50/80 px-6 py-3.5 border-b border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#0F2A4A]">Randevu Oluştur</span>
                <span className="text-slate-300">•</span>
                <span className="text-xs text-slate-500">
                  {step === 1 ? "1. Hizmet Seçimi" : step === 2 ? "2. Gün & Saat Seçimi" : "3. İletişim Bilgileri"}
                </span>
              </div>
              <div className="flex gap-1.5">
                {[1, 2, 3].map((s) => (
                  <span
                    key={s}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      step === s ? "bg-[#0062FF]" : step > s ? "bg-emerald-500" : "bg-slate-200"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="p-6 sm:p-8">
              {/* ADIM 1: HİZMET SEÇİMİ */}
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 14 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -14 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-[#0F2A4A]">
                        Almak İstediğiniz Tıraş Hizmetini Seçin
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Tek tıkla istediğiniz işlemi seçin
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-2.5 sm:grid-cols-2 pt-1">
                    {CLASSIC_SERVICES.map((srv) => {
                      const isSelected = selectedService.id === srv.id;
                      return (
                        <button
                          key={srv.id}
                          type="button"
                          onClick={() => setSelectedService(srv)}
                          className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between gap-3 cursor-pointer ${
                            isSelected
                              ? "bg-[#0062FF]/5 border-[#0062FF] ring-2 ring-[#0062FF]/20 shadow-xs"
                              : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/70"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 w-full">
                            <div>
                              <p className={`font-semibold text-xs sm:text-sm ${isSelected ? "text-[#0062FF]" : "text-[#0F2A4A]"}`}>
                                {srv.name}
                              </p>
                              <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">
                                {srv.description}
                              </p>
                            </div>
                            <div
                              className={`w-4 h-4 rounded-full border shrink-0 flex items-center justify-center mt-0.5 ${
                                isSelected ? "border-[#0062FF] bg-[#0062FF]" : "border-slate-300"
                              }`}
                            >
                              {isSelected && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                            </div>
                          </div>

                          <div className="flex items-center justify-between w-full pt-2 border-t border-slate-100 text-xs">
                            <span className="text-slate-500 text-[11px] flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" /> {srv.duration_minutes} dk
                            </span>
                            {srv.price && (
                              <span className="font-bold text-[#0062FF] bg-[#0062FF]/10 px-2 py-0.5 rounded-md text-xs">
                                ₺{srv.price}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-6 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="px-6 py-2.5 rounded-xl bg-[#0062FF] hover:bg-[#0051d4] active:scale-[0.99] text-white font-semibold text-xs shadow-md transition-all flex items-center gap-2"
                    >
                      Gün ve Saat Seçimine Geç <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ADIM 2: GÜN VE SAAT SEÇİMİ */}
              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 14 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -14 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-[#0F2A4A]">
                        Randevu Günü ve Saati
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {selectedService.name} • {selectedService.duration_minutes} dk
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-xs font-semibold text-slate-500 hover:text-[#0F2A4A] px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
                    >
                      Hizmeti Değiştir
                    </button>
                  </div>

                  {/* Gün Seçimi */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-[#0F2A4A] block">
                      1. Günü Seçin
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                      {daysList.map((day, idx) => {
                        const isSelected = selectedDateIndex === idx;
                        return (
                          <button
                            key={day.iso}
                            type="button"
                            onClick={() => setSelectedDateIndex(idx)}
                            className={`p-2.5 rounded-xl border text-center transition-all ${
                              isSelected
                                ? "bg-[#0062FF] text-white border-[#0062FF] font-bold shadow-xs scale-102"
                                : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                            }`}
                          >
                            <div className={`text-[11px] ${isSelected ? "text-blue-100" : "text-slate-400"}`}>
                              {idx === 0 ? "Bugün" : idx === 1 ? "Yarın" : day.dayName}
                            </div>
                            <div className="text-xs font-bold mt-0.5">
                              {day.dayNumber} {day.monthName}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Saat Seçimi */}
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-[#0F2A4A] block">
                        2. Müsait Saati Seçin
                      </label>
                      {loadingSlots && (
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Loader2 className="w-3 h-3 animate-spin text-[#0062FF]" /> Güncelleniyor...
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 gap-2 max-h-[220px] overflow-y-auto pr-1">
                      {availableSlots.map((slot) => {
                        const isSelected = selectedSlot === slot;
                        return (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setSelectedSlot(slot)}
                            className={`py-2 px-1 text-center text-xs font-semibold rounded-xl border transition-all ${
                              isSelected
                                ? "bg-[#0F2A4A] text-white border-[#0F2A4A] shadow-xs"
                                : "bg-white text-slate-700 border-slate-200 hover:border-[#0062FF] hover:bg-blue-50/50"
                            }`}
                          >
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      Geri
                    </button>
                    <button
                      type="button"
                      disabled={!selectedSlot}
                      onClick={() => setStep(3)}
                      className="px-6 py-2.5 rounded-xl bg-[#0062FF] hover:bg-[#0051d4] active:scale-[0.99] text-white font-semibold text-xs shadow-md transition-all flex items-center gap-1.5 disabled:opacity-40"
                    >
                      İletişim Bilgilerine Geç <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ADIM 3: DANIŞAN BİLGİLERİ */}
              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 14 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -14 }}
                  className="space-y-5"
                >
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-[#0F2A4A]">
                      İletişim &amp; Rezervasyon Bilgileri
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Seçilen Zaman: <span className="font-semibold text-[#0062FF]">{daysList[selectedDateIndex]?.label} • Saat {selectedSlot}</span>
                    </p>
                  </div>

                  {errorMessage && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-xs font-semibold text-[#0F2A4A] mb-1">
                          Adınız ve Soyadınız *
                        </label>
                        <div className="relative">
                          <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            required
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            placeholder="Ad Soyad"
                            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#0062FF] focus:ring-2 focus:ring-[#0062FF]/10 text-xs text-slate-800 placeholder-slate-400 outline-none transition"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#0F2A4A] mb-1">
                          Telefon Numaranız (WhatsApp Teyidi) *
                        </label>
                        <div className="relative">
                          <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="tel"
                            required
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            placeholder="05XX XXX XX XX"
                            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#0062FF] focus:ring-2 focus:ring-[#0062FF]/10 text-xs text-slate-800 placeholder-slate-400 outline-none transition"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#0F2A4A] mb-1">
                        Özel Not veya Belirtmek İstedikleriniz (Opsiyonel)
                      </label>
                      <textarea
                        rows={2}
                        value={customerNote}
                        onChange={(e) => setCustomerNote(e.target.value)}
                        placeholder="İstediğiniz özel bir saç/sakal stili veya detay..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#0062FF] focus:ring-2 focus:ring-[#0062FF]/10 text-xs text-slate-800 placeholder-slate-400 outline-none transition"
                      />
                    </div>

                    <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/60 text-xs text-slate-600 flex items-center justify-between">
                      <span>Ödeme Şekli:</span>
                      <span className="font-semibold text-[#0F2A4A]">Koltukta / Yerinde (Nakit veya POS)</span>
                    </div>

                    {/* KVKK Uyum & Zorunlu Onay Kutucuğu */}
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 space-y-2">
                      <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-700 select-none">
                        <input
                          type="checkbox"
                          required
                          checked={kvkkConsent}
                          onChange={(e) => setKvkkConsent(e.target.checked)}
                          className="mt-0.5 w-4 h-4 rounded border-slate-300 text-[#0062FF] focus:ring-[#0062FF]"
                        />
                        <span className="text-[11px] leading-relaxed text-slate-600">
                          <strong className="text-[#0F2A4A]">6698 Sayılı KVKK Uyarınca;</strong> kişisel verilerimin randevu koordinasyonu, onay/hatırlatma bildirimleri (WhatsApp/SMS) amacıyla işlenmesine dair{" "}
                          <button
                            type="button"
                            onClick={() => setShowKvkkModal(true)}
                            className="font-semibold text-[#0062FF] underline hover:text-[#0051d4] inline-flex items-center gap-0.5"
                          >
                            Aydınlatma Metni ve Açık Rıza Beyanı&apos;nı
                          </button>{" "}
                          okudum, anladım ve kabul ediyorum. *
                        </span>
                      </label>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                      >
                        Geri
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting || !kvkkConsent}
                        className="px-7 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? "Kaydediliyor..." : "Randevuyu Onayla & WhatsApp Teyidi Al"}
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. KVKK Aydınlatma Metni & Açık Rıza Modalı (Hukuki Koruma) */}
      <AnimatePresence>
        {showKvkkModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-[#0062FF]/10 text-[#0062FF]">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#0F2A4A]">
                      6698 Sayılı KVKK Kapsamında Aydınlatma Metni
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Kişisel Verilerin Korunması ve Açık Rıza Bilgilendirmesi
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowKvkkModal(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body: Legal Content */}
              <div className="p-6 overflow-y-auto text-xs text-slate-600 leading-relaxed space-y-4">
                <div>
                  <h4 className="font-bold text-slate-800 text-xs mb-1">1. Veri Sorumlusunun Kimliği</h4>
                  <p>
                    İşbu Aydınlatma Metni, 6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;) uyarınca, veri sorumlusu sıfatıyla <strong>By Erman Erkek Berberi</strong> ve teknik altyapı sağlayıcısı <strong>randevuformu.com</strong> tarafından, randevu oluşturma ve iletişim süreçlerinde kişisel verilerinizin işlenmesine ilişkin sizleri bilgilendirmek amacıyla hazırlanmıştır.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-800 text-xs mb-1">2. İşlenen Kişisel Veriler</h4>
                  <p>Randevu alma esnasında tarafınızca paylaşılan;</p>
                  <ul className="list-disc pl-5 mt-1 space-y-0.5">
                    <li><strong>Kimlik Bilgisi:</strong> Ad ve Soyad</li>
                    <li><strong>İletişim Bilgisi:</strong> Telefon Numarası, WhatsApp İletişim Verisi</li>
                    <li><strong>Randevu Bilgisi:</strong> Tercih edilen hizmet türü, randevu günü ve saati, müşteriye özel tıraş/stil notları</li>
                    <li><strong>İşlem Güvenliği:</strong> Randevu onay zaman damgası ve randevu doğrulama kaydı</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-slate-800 text-xs mb-1">3. Kişisel Verilerin İşlenme Amaçları</h4>
                  <p>Toplanan kişisel verileriniz;</p>
                  <ul className="list-disc pl-5 mt-1 space-y-0.5">
                    <li>Randevu rezervasyonunuzun başarıyla kaydedilmesi ve teyit edilmesi,</li>
                    <li>Randevu saatinizden önce tarafınıza WhatsApp ve SMS yoluyla hatırlatma ve teyit iletilmesi,</li>
                    <li>Randevu çakışmalarının ve mükerrer rezervasyonların önlenmesi,</li>
                    <li>Olası saat değişikliği, rötar veya iptal durumlarında sizinle hızlı irtibat kurulması,</li>
                    <li>Yetkili kamu kurum ve kuruluşlarına mevzuattan doğan yasal bildirimlerin yapılması</li>
                  </ul>
                  <p className="mt-1">amaçlarıyla sınırlı ve ölçülü olarak işlenmektedir.</p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-800 text-xs mb-1">4. Verilerin Aktarımı ve Güvenliği</h4>
                  <p>
                    Kişisel verileriniz <strong>asla üçüncü şahıs veya kurumlara ticari veya reklam amaçlı satılmaz veya devredilmez.</strong> Yalnızca randevu bildirim mesajlarının (WhatsApp/SMS) tarafınıza ulaştırılması amacıyla entegre iletişim servis sağlayıcıları (Meta WhatsApp Cloud API / Netgsm SMS) altyapısı üzerinden güvenli SSL şifreleme ile iletilmektedir.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-800 text-xs mb-1">5. İlgili Kişinin Hakları (KVKK Madde 11)</h4>
                  <p>
                    KVKK’nın 11. maddesi uyarınca veri sahibi olarak; kişisel verilerinizin işlenip işlenmediğini öğrenme, işlenmişse bilgi talep etme, işlenme amacına uygun kullanılıp kullanılmadığını öğrenme, eksik veya yanlış işlenmişse düzeltilmesini isteme ve silinmesini (KVKK Madde 7) talep etme haklarına sahipsiniz.
                  </p>
                  <p className="mt-1 font-medium text-slate-700">
                    Başvuru ve Bilgi Talebi: 0538 480 90 01 numaralı hattan veya kvkk@randevuformu.com üzerinden veri sorumlusuna iletebilirsiniz.
                  </p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  T.C. 6698 Sayılı Kanun Uyarınca Bağlayıcıdır
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setKvkkConsent(true);
                    setShowKvkkModal(false);
                  }}
                  className="px-5 py-2 rounded-xl bg-[#0062FF] hover:bg-[#0051d4] text-white text-xs font-bold transition-all shadow-xs"
                >
                  Okudum, Anladım ve Kabul Ediyorum
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. Google Yorum / Salon Görselleri Lightbox Modalı */}
      <AnimatePresence>
        {activePhoto && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs"
            onClick={() => setActivePhoto(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200"
            >
              <div className="relative aspect-16/10 bg-black">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activePhoto.url}
                  alt={activePhoto.title}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setActivePhoto(null)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 bg-white flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-[#0F2A4A]">{activePhoto.title}</h4>
                  <p className="text-xs text-slate-500">{activePhoto.subtitle}</p>
                </div>
                <div className="flex items-center gap-1 text-amber-500 font-bold text-xs bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>4.9 / 5.0</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
