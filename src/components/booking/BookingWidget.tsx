"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays,
  Clock,
  Check,
  User,
  Phone,
  Mail,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  Lock,
  Wallet,
  Calendar,
  Download,
  Video,
  Smartphone,
  MapPin,
  MessageCircle,
  Building2,
  Sparkles,
  X,
} from "lucide-react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  addDays,
  isBefore,
  startOfToday,
} from "date-fns";
import { tr } from "date-fns/locale";
import SmartWaitlistWidget from "./SmartWaitlistWidget";

export interface ServiceItem {
  id: string;
  name: string;
  duration_minutes: number;
  price_text: string;
  price?: number;
  description?: string;
}

export interface BookingWidgetProps {
  businessName: string;
  businessSlug: string;
  category?: string;
  services: ServiceItem[];
  tenantId?: string;
}

interface StaffOption {
  id: string;
  name: string;
  role: string;
}

export default function BookingWidget({
  businessName,
  businessSlug,
  category = "Profesyonel Hizmet",
  services,
  tenantId = "default-tenant",
}: BookingWidgetProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(services[0] || null);
  
  // Calendar month state
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  
  // Staff state
  const [staffList, setStaffList] = useState<StaffOption[]>([
    { id: "ANY_STAFF", name: "⚡ İlk Müsait Uzman", role: "En Hızlı Seans" },
  ]);
  const [selectedStaff, setSelectedStaff] = useState<string>("ANY_STAFF");
  
  const [availableSlots, setAvailableSlots] = useState<{ displayTime: string; isAvailable: boolean; startUtc: string }[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Form Fields
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");
  const [kvkkConsent, setKvkkConsent] = useState(false);
  const [showKvkkModal, setShowKvkkModal] = useState(false);

  // Flow & Feedback State
  const [paymentMethod, setPaymentMethod] = useState<"VENUE" | "STRIPE" | "IYZICO">("VENUE");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [lockTimer, setLockTimer] = useState<number | null>(null);
  const [walletSuccess, setWalletSuccess] = useState(false);

  // Load custom staff for this business dynamically
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(`rf_staff_${tenantId}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const dynamicStaff: StaffOption[] = parsed
              .filter((s: any) => s.is_active !== false)
              .map((s: any) => ({
                id: s.id,
                name: s.display_name || s.name,
                role: s.title || s.role || "Uzman",
              }));
            setStaffList([
              { id: "ANY_STAFF", name: "⚡ İlk Müsait Uzman", role: "En Hızlı Seans" },
              ...dynamicStaff,
            ]);
            return;
          }
        }
      } catch {}
    }
  }, [tenantId]);

  // Fetch live calculated slots for the selected date
  const fetchSlots = async (date: string, duration: number) => {
    setLoadingSlots(true);
    try {
      const res = await fetch(`/api/slots?slug=${businessSlug}&date=${date}&duration=${duration}`);
      const data = await res.json();
      if (data.slots && data.slots.length > 0) {
        setAvailableSlots(data.slots);
      } else {
        const isByErman = businessSlug === "byerman" || businessSlug === "ermankuafor";
        const defaultTimes = isByErman
          ? [
              "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
              "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
              "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
              "18:00", "18:30", "19:00", "19:30"
            ]
          : ["09:00", "09:45", "10:30", "11:15", "14:00", "14:45", "15:30", "16:15", "17:00"];

        setAvailableSlots(
          defaultTimes.map((t) => ({
            displayTime: t,
            isAvailable: true,
            startUtc: `${date}T${t}:00+03:00`,
          }))
        );
      }
    } catch {
      const defaultTimes = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"];
      setAvailableSlots(
        defaultTimes.map((t) => ({
          displayTime: t,
          isAvailable: true,
          startUtc: `${date}T${t}:00+03:00`,
        }))
      );
    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => {
    if (selectedService) {
      fetchSlots(selectedDate, selectedService.duration_minutes);
    }
  }, [selectedDate, selectedService]);

  // Lock slot on select
  const handleSlotSelect = async (slotTime: string, startUtc: string) => {
    setSelectedSlot(slotTime);
    setLockTimer(300); // 5 minutes atomic lock
    try {
      await fetch("/api/slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId,
          serviceId: selectedService?.id,
          startUtc,
          sessionId: `${Date.now()}-${Math.random()}`,
        }),
      });
    } catch {
      // Non-blocking fallback
    }
  };

  // Submission handler
  const handleCompleteBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim() || !customerEmail.trim()) {
      setErrorMessage("Lütfen tüm zorunlu alanları doldurun.");
      return;
    }

    if (!kvkkConsent) {
      setErrorMessage("Lütfen KVKK onay kutusunu işaretleyin.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const resolvedStaffId = selectedStaff === "ANY_STAFF" ? "auto-assigned-staff" : selectedStaff;

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_slug: businessSlug,
          service_id: selectedService?.id || "default",
          customer_name: customerName,
          user_name: customerName,
          customer_email: customerEmail,
          user_email: customerEmail,
          customer_phone: customerPhone,
          user_phone: customerPhone,
          notes: customerNotes,
          staff_id: resolvedStaffId,
          start_time: `${selectedDate}T${selectedSlot}:00+03:00`,
          end_time: `${selectedDate}T${selectedSlot}:00+03:00`,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        const servicePrice =
          selectedService?.price ||
          parseFloat(selectedService?.price_text?.replace(/[^0-9.]/g, "") || "0") ||
          0;

        // Online Payment Flow (if enabled and price > 0)
        if (paymentMethod === "STRIPE" && servicePrice > 0) {
          try {
            const payRes = await fetch("/api/checkout/stripe", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                appointmentId: data.booking?.id || `bk_${Date.now()}`,
                serviceName: selectedService?.name,
                amount: servicePrice,
                customerEmail,
                customerName,
                tenantId,
                returnSlug: businessSlug,
              }),
            });
            const payData = await payRes.json();
            if (payData.url) {
              window.location.href = payData.url;
              return;
            }
          } catch (payErr) {
            console.warn("Stripe redirect fallback:", payErr);
          }
        } else if (paymentMethod === "IYZICO" && servicePrice > 0) {
          try {
            const payRes = await fetch("/api/checkout/iyzico", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                appointmentId: data.booking?.id || `bk_${Date.now()}`,
                serviceName: selectedService?.name,
                amount: servicePrice,
                customerName,
                customerEmail,
                customerPhone,
                returnSlug: businessSlug,
              }),
            });
            const payData = await payRes.json();
            if (payData.redirectUrl) {
              window.location.href = payData.redirectUrl;
              return;
            }
          } catch (payErr) {
            console.warn("Iyzico redirect fallback:", payErr);
          }
        }

        setStep(4);
      } else {
        setErrorMessage(data.error || "Randevu oluşturulamadı. Lütfen tekrar deneyin.");
      }
    } catch {
      setErrorMessage("Bağlantı hatası oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Monthly Calendar Generator Helpers
  const today = startOfToday();
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calendarDays: Date[] = [];
  let dayIterator = startDate;
  while (dayIterator <= endDate) {
    calendarDays.push(dayIterator);
    dayIterator = addDays(dayIterator, 1);
  }

  const selectedDateObj = new Date(selectedDate);
  const formattedSelectedDateHeader = format(selectedDateObj, "EEEE, d MMMM", { locale: tr });

  // Optional Pricing badge check
  const hasPrice = Boolean(
    selectedService &&
    selectedService.price &&
    selectedService.price > 0
  );

  return (
    <div className="w-full max-w-5xl mx-auto bg-white border border-slate-200/90 rounded-2xl shadow-xl overflow-hidden text-slate-800 transition-all">
      {/* Top Header Bar — Calendly Corporate Aesthetic */}
      <div className="bg-[#0F2A4A] px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-white">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center font-bold text-[#00BCD4] text-sm">
            {businessName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-sm sm:text-base text-white">{businessName}</h2>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
            <p className="text-xs text-slate-300">{category}</p>
          </div>
        </div>

        {/* Step Indicator Pills */}
        <div className="flex items-center gap-1.5 text-xs font-medium">
          {[
            { num: 1, label: "Hizmet" },
            { num: 2, label: "Tarih & Saat" },
            { num: 3, label: "Bilgiler" },
            { num: 4, label: "Onay" },
          ].map((s) => (
            <div
              key={s.num}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] transition-colors ${
                step === s.num
                  ? "bg-[#00BCD4] text-[#0F2A4A] font-bold shadow-xs"
                  : step > s.num
                  ? "bg-emerald-500/20 text-emerald-300 font-medium"
                  : "text-slate-400 bg-white/5"
              }`}
            >
              <span>{s.num}.</span>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Split Layout: Left Info Summary / Right Action View */}
      <div className="grid lg:grid-cols-12 min-h-[540px]">
        {/* Left Summary Sidebar (Calendly Style Host Details) */}
        <div className="lg:col-span-4 p-6 sm:p-7 bg-[#FAFBFC] border-b lg:border-b-0 lg:border-r border-slate-200/80 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                İşletme Detayı
              </span>
              <h3 className="text-lg font-bold text-[#0F2A4A] leading-tight">
                {selectedService ? selectedService.name : "Hizmet Seçimi"}
              </h3>
            </div>

            {selectedService && (
              <div className="space-y-2.5 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#0062FF] shrink-0" />
                  <span className="font-medium">{selectedService.duration_minutes} Dakika</span>
                </div>

                {/* Optional Price: Only renders if price > 0, completely omitted otherwise */}
                {hasPrice ? (
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center font-bold text-[#0062FF] bg-[#0062FF]/10 px-2.5 py-0.5 rounded-md text-xs">
                      ₺{selectedService.price?.toLocaleString("tr-TR")}
                    </span>
                    <span className="text-[11px] text-slate-400">Sabit Seans Ücreti</span>
                  </div>
                ) : null}

                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Otomatik WhatsApp &amp; Takvim Teyitli</span>
                </div>

                {selectedDate && selectedSlot && (
                  <div className="p-3 bg-blue-50/70 border border-blue-200/60 rounded-xl space-y-1 text-slate-700">
                    <p className="text-[11px] text-[#0062FF] font-semibold">Seçilen Randevu Zamanı:</p>
                    <p className="font-bold text-xs text-[#0F2A4A]">
                      {formattedSelectedDateHeader} • Saat: {selectedSlot}
                    </p>
                  </div>
                )}
              </div>
            )}

            {selectedService?.description && (
              <p className="text-xs text-slate-500 leading-relaxed pt-2 border-t border-slate-200">
                {selectedService.description}
              </p>
            )}
          </div>

          <div className="pt-4 border-t border-slate-200/80 text-[11px] text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              256-Bit SSL Şifreleme
            </span>
            <span className="font-mono text-[10px]">randevuformu.com</span>
          </div>
        </div>

        {/* Right Interaction Column */}
        <div className="lg:col-span-8 p-6 sm:p-8 flex flex-col justify-between">
          <AnimatePresence mode="wait">
            {/* ═══════════════════════════════════════
                STEP 1: SERVICE SELECTION
                ═══════════════════════════════════════ */}
            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                className="space-y-4"
              >
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-[#0F2A4A]">
                    Almak İstediğiniz Hizmeti Seçin
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    İşletmemizin sunduğu seanslar ve süreleri
                  </p>
                </div>

                <div className="grid gap-2.5 sm:grid-cols-2 pt-2">
                  {services.map((s) => {
                    const isSelected = selectedService?.id === s.id;
                    const itemHasPrice = Boolean(s.price && s.price > 0);
                    return (
                      <div
                        key={s.id}
                        onClick={() => setSelectedService(s)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                          isSelected
                            ? "bg-[#0062FF]/5 border-[#0062FF] ring-2 ring-[#0062FF]/20 shadow-sm"
                            : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/70"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            <h4 className={`font-semibold text-xs sm:text-sm ${isSelected ? "text-[#0062FF]" : "text-[#0F2A4A]"}`}>
                              {s.name}
                            </h4>
                            <p className="text-[11px] text-slate-400 line-clamp-2">
                              {s.description || "Standart seans ve danışmanlık hizmeti."}
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

                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                          <span className="text-slate-500 flex items-center gap-1 text-[11px]">
                            <Clock className="w-3 h-3 text-slate-400" /> {s.duration_minutes} dk
                          </span>

                          {/* Optional Price badge */}
                          {itemHasPrice ? (
                            <span className="font-bold text-[#0062FF] bg-[#0062FF]/10 px-2 py-0.5 rounded-md text-xs">
                              ₺{s.price?.toLocaleString("tr-TR")}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-6 flex justify-end">
                  <button
                    type="button"
                    disabled={!selectedService}
                    onClick={() => setStep(2)}
                    className="px-6 py-3 rounded-xl bg-[#0062FF] hover:bg-[#0051d4] active:scale-[0.99] text-white font-semibold text-xs shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    Tarih ve Saat Seçimine Geç <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ═══════════════════════════════════════
                STEP 2: CALENDLY MONTH CALENDAR & SLOTS
                ═══════════════════════════════════════ */}
            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-[#0F2A4A]">
                      Tarih ve Saat Seçin
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {selectedService?.name} • {selectedService?.duration_minutes} dk
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs font-semibold text-slate-500 hover:text-[#0F2A4A] flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" /> Hizmeti Değiştir
                  </button>
                </div>

                {/* Specialist Selector Chips */}
                {staffList.length > 1 && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Uzman / Temsilci Tercihi
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {staffList.map((st) => {
                        const isSelected = selectedStaff === st.id;
                        return (
                          <button
                            key={st.id}
                            type="button"
                            onClick={() => {
                              setSelectedStaff(st.id);
                              setSelectedSlot(null);
                            }}
                            className={`px-3 py-1.5 rounded-xl border text-xs transition-all flex items-center gap-1.5 ${
                              isSelected
                                ? "bg-[#0062FF] text-white border-[#0062FF] font-semibold shadow-xs"
                                : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                            }`}
                          >
                            <span>{st.name}</span>
                            <span className={`text-[10px] ${isSelected ? "text-blue-100" : "text-slate-400"}`}>
                              ({st.role})
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Dual Grid: Monthly Calendar on Left, Time Slots on Right */}
                <div className="grid md:grid-cols-12 gap-6 items-start">
                  {/* Monthly Interactive Calendar */}
                  <div className="md:col-span-6 bg-slate-50/60 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                    {/* Month Nav Header */}
                    <div className="flex items-center justify-between px-1">
                      <span className="text-xs font-bold text-[#0F2A4A] capitalize">
                        {format(currentMonth, "MMMM yyyy", { locale: tr })}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-white border border-transparent hover:border-slate-200 transition-colors"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-white border border-transparent hover:border-slate-200 transition-colors"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Weekday Labels */}
                    <div className="grid grid-cols-7 text-center text-[10px] font-semibold text-slate-400">
                      {["Pzt", "Sal", "Çar", "Per", "Cum", "Cts", "Paz"].map((d) => (
                        <div key={d} className="py-1">{d}</div>
                      ))}
                    </div>

                    {/* Calendar Days Matrix */}
                    <div className="grid grid-cols-7 gap-1 text-center text-xs">
                      {calendarDays.map((calDay) => {
                        const dateIso = format(calDay, "yyyy-MM-dd");
                        const isCurrentM = isSameMonth(calDay, currentMonth);
                        const isPast = isBefore(calDay, today);
                        const isDaySelected = selectedDate === dateIso;
                        const isToday = isSameDay(calDay, today);

                        if (!isCurrentM) {
                          return <div key={dateIso} className="py-2 text-slate-200 select-none text-[11px]">—</div>;
                        }

                        if (isPast) {
                          return (
                            <div
                              key={dateIso}
                              className="py-2 text-slate-300 cursor-not-allowed select-none text-[11px]"
                            >
                              {format(calDay, "d")}
                            </div>
                          );
                        }

                        return (
                          <button
                            key={dateIso}
                            type="button"
                            onClick={() => {
                              setSelectedDate(dateIso);
                              setSelectedSlot(null);
                            }}
                            className={`py-2 rounded-xl font-medium transition-all text-[11px] relative ${
                              isDaySelected
                                ? "bg-[#0062FF] text-white font-bold shadow-xs scale-105"
                                : isToday
                                ? "border border-[#0062FF] text-[#0062FF] font-bold hover:bg-blue-50"
                                : "text-slate-700 hover:bg-white hover:shadow-2xs"
                            }`}
                          >
                            {format(calDay, "d")}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Time Slots Column */}
                  <div className="md:col-span-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#0F2A4A]">
                        {formattedSelectedDateHeader}
                      </span>
                      {lockTimer && (
                        <span className="text-[10px] font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Lock className="w-3 h-3" /> Slot Rezerve Edildi
                        </span>
                      )}
                    </div>

                    {loadingSlots ? (
                      <div className="py-12 text-center text-xs text-slate-400 bg-slate-50/60 rounded-2xl border border-slate-100 animate-pulse">
                        Müsait saatler hesaplanıyor...
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[280px] overflow-y-auto pr-1">
                        {availableSlots.map((slot) => {
                          const isSelected = selectedSlot === slot.displayTime;
                          return (
                            <button
                              key={slot.displayTime}
                              type="button"
                              disabled={!slot.isAvailable}
                              onClick={() => handleSlotSelect(slot.displayTime, slot.startUtc)}
                              className={`py-2.5 px-2 text-xs font-semibold rounded-xl border transition-all ${
                                isSelected
                                  ? "bg-[#0062FF] text-white border-[#0062FF] shadow-xs scale-102"
                                  : slot.isAvailable
                                  ? "bg-white text-slate-700 border-slate-200 hover:border-[#0062FF] hover:bg-blue-50/50"
                                  : "bg-slate-50 text-slate-400 border-slate-100 cursor-not-allowed line-through opacity-50"
                              }`}
                            >
                              {slot.displayTime}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Waitlist fallback if needed */}
                    <div className="pt-2">
                      <SmartWaitlistWidget
                        tenantId={tenantId}
                        serviceId={selectedService?.id}
                        businessName={businessName}
                        selectedDate={selectedDate}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Geri
                  </button>
                  <button
                    type="button"
                    disabled={!selectedSlot}
                    onClick={() => setStep(3)}
                    className="px-6 py-2.5 rounded-xl bg-[#0062FF] hover:bg-[#0051d4] text-white text-xs font-semibold shadow-md flex items-center gap-1.5 disabled:opacity-40 transition-all active:scale-[0.99]"
                  >
                    İletişim Bilgilerine Geç <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ═══════════════════════════════════════
                STEP 3: CUSTOMER DETAILS FORM
                ═══════════════════════════════════════ */}
            {step === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                className="space-y-5"
              >
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-[#0F2A4A]">
                    İletişim &amp; Teyit Bilgileri
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Randevu onayınız WhatsApp ve e-posta ile otomatik iletilecektir.
                  </p>
                </div>

                {errorMessage && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <form onSubmit={handleCompleteBooking} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-[#0F2A4A] mb-1">
                        Ad Soyad *
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="Adınız ve Soyadınız"
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#0062FF] focus:ring-2 focus:ring-[#0062FF]/10 text-xs text-slate-800 placeholder-slate-400 outline-none transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#0F2A4A] mb-1">
                        Telefon Numarası (WhatsApp Teyidi) *
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
                      E-Posta Adresi (Takvim Daveti İçin) *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="eposta@adresiniz.com"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#0062FF] focus:ring-2 focus:ring-[#0062FF]/10 text-xs text-slate-800 placeholder-slate-400 outline-none transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#0F2A4A] mb-1">
                      Özel Not veya İstekleriniz (Opsiyonel)
                    </label>
                    <textarea
                      rows={2}
                      value={customerNotes}
                      onChange={(e) => setCustomerNotes(e.target.value)}
                      placeholder="Belirtmek istediğiniz ek bir durum veya tercihiniz..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#0062FF] focus:ring-2 focus:ring-[#0062FF]/10 text-xs text-slate-800 placeholder-slate-400 outline-none transition"
                    />
                  </div>

                  {/* Payment Method Selector */}
                  <div className="space-y-2 pt-1">
                    <label className="block text-xs font-semibold text-[#0F2A4A]">
                      Ödeme Yöntemi Tercihi
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("VENUE")}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          paymentMethod === "VENUE"
                            ? "border-[#0062FF] bg-[#0062FF]/5 ring-1 ring-[#0062FF]/20"
                            : "border-slate-200 hover:border-slate-300 bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-semibold text-xs text-[#0F2A4A] mb-0.5">
                          <Wallet className="w-3.5 h-3.5 text-[#0062FF]" />
                          <span>İşletmede / Yerinde</span>
                        </div>
                        <p className="text-[10px] text-slate-500">Randevu günü nakit veya POS ile ödeyin.</p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod("STRIPE")}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          paymentMethod === "STRIPE"
                            ? "border-[#0062FF] bg-[#0062FF]/5 ring-1 ring-[#0062FF]/20"
                            : "border-slate-200 hover:border-slate-300 bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-semibold text-xs text-[#0F2A4A] mb-0.5">
                          <CreditCard className="w-3.5 h-3.5 text-[#0062FF]" />
                          <span>Kredi Kartı (Stripe)</span>
                        </div>
                        <p className="text-[10px] text-slate-500">Global kart altyapısıyla güvenli ödeme.</p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod("IYZICO")}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          paymentMethod === "IYZICO"
                            ? "border-[#0062FF] bg-[#0062FF]/5 ring-1 ring-[#0062FF]/20"
                            : "border-slate-200 hover:border-slate-300 bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-semibold text-xs text-[#0F2A4A] mb-0.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>İyzico 3D Secure</span>
                        </div>
                        <p className="text-[10px] text-slate-500">Yerli bankalar ve taksit imkanı.</p>
                      </button>
                    </div>
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
                      className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      Geri
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || !kvkkConsent}
                      className="px-7 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md flex items-center gap-1.5 disabled:opacity-40 transition-all active:scale-[0.99]"
                    >
                      {isSubmitting ? "Oluşturuluyor..." : "Randevuyu Onayla"}
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* ═══════════════════════════════════════
                STEP 4: CALENDLY-GRADE SUCCESS CONFIRMATION
                ═══════════════════════════════════════ */}
            {step === 4 && (
              <motion.div
                key="step-4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6 space-y-5"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-9 h-9" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl sm:text-2xl font-bold text-[#0F2A4A]">
                    Randevunuz Başarıyla Oluşturuldu!
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Detaylar ve takvim davetiyesi <span className="font-semibold text-slate-700">{customerEmail}</span> adresine iletildi.
                  </p>
                </div>

                {/* Summary Card */}
                <div className="max-w-md mx-auto p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-left text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Hizmet:</span>
                    <span className="font-semibold text-[#0F2A4A]">{selectedService?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Tarih &amp; Saat:</span>
                    <span className="font-semibold text-[#0062FF]">
                      {formattedSelectedDateHeader} • {selectedSlot}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Danışan:</span>
                    <span className="font-semibold text-[#0F2A4A]">{customerName}</span>
                  </div>
                  {hasPrice && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Tutar:</span>
                      <span className="font-semibold text-emerald-600">
                        ₺{selectedService?.price?.toLocaleString("tr-TR")}
                      </span>
                    </div>
                  )}
                </div>

                {/* Calendar Add & Meeting Actions */}
                <div className="max-w-md mx-auto space-y-2.5 pt-2">
                  <a
                    href={`https://meet.google.com/rf-${(selectedSlot || "1400").replace(":", "")}-live`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 px-4 rounded-xl bg-[#0F2A4A] hover:bg-[#1a385c] text-white font-semibold text-xs shadow-sm flex items-center justify-center gap-2 transition-colors"
                  >
                    <Video className="w-4 h-4 text-[#00BCD4]" />
                    <span>Google Meet Görüşmesine Katıl</span>
                  </a>

                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(businessName + " - " + (selectedService?.name || "Randevu"))}&dates=${(selectedDate || "20261001").replace(/-/g, "")}T${(selectedSlot || "1400").replace(":", "")}00Z/${(selectedDate || "20261001").replace(/-/g, "")}T${(selectedSlot || "1400").replace(":", "")}00Z&details=${encodeURIComponent("Online Randevu — randevuformu.com")}`}
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
                        const icsData = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:${businessName} - ${selectedService?.name}\nDESCRIPTION:Randevu Onayı\nSTATUS:CONFIRMED\nEND:VEVENT\nEND:VCALENDAR`;
                        const blob = new Blob([icsData], { type: "text/calendar;charset=utf-8;" });
                        const link = document.createElement("a");
                        link.href = URL.createObjectURL(blob);
                        link.setAttribute("download", `randevu-${selectedDate || "onay"}.ics`);
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

                  {/* Digital Wallet Card — Clean In-App Feedback (No alert popup!) */}
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await fetch("/api/wallet/pass", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            bookingId: `bk-${Date.now()}`,
                            customerName,
                            businessName,
                            serviceName: selectedService?.name,
                            appointmentDate: selectedDate,
                            appointmentTime: selectedSlot,
                          }),
                        });
                        setWalletSuccess(true);
                      } catch {
                        setWalletSuccess(true);
                      }
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    <Smartphone className="w-3.5 h-3.5 text-slate-600" />
                    <span>{walletSuccess ? "✓ Dijital Cüzdan Kartı Hazırlandı" : "Apple & Google Cüzdan Kartı Ekle"}</span>
                  </button>

                  {walletSuccess && (
                    <p className="text-[11px] text-emerald-600 font-medium animate-fade-in">
                      ✓ Randevu kartınız hazırlandı. Apple Wallet / Google Cüzdan uygulamanıza aktarılabilir.
                    </p>
                  )}
                </div>

                <div className="pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setSelectedSlot(null);
                      setWalletSuccess(false);
                    }}
                    className="px-5 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-[#0F2A4A] transition-colors"
                  >
                    Yeni Bir Randevu Oluştur
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* KVKK Aydınlatma Metni & Açık Rıza Modalı (Hukuki Koruma) */}
      <AnimatePresence>
        {showKvkkModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden text-left"
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

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto text-xs text-slate-600 leading-relaxed space-y-4">
                <div>
                  <h4 className="font-bold text-slate-800 text-xs mb-1">1. Veri Sorumlusunun Kimliği</h4>
                  <p>
                    İşbu Aydınlatma Metni, 6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;) uyarınca, veri sorumlusu sıfatıyla <strong>{businessName}</strong> ve teknik altyapı sağlayıcısı <strong>randevuformu.com</strong> tarafından, randevu oluşturma ve iletişim süreçlerinde kişisel verilerinizin işlenmesine ilişkin sizleri bilgilendirmek amacıyla hazırlanmıştır.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-800 text-xs mb-1">2. İşlenen Kişisel Veriler</h4>
                  <p>Randevu esnasında paylaştığınız;</p>
                  <ul className="list-disc pl-5 mt-1 space-y-0.5">
                    <li><strong>Kimlik Bilgisi:</strong> Ad ve Soyad</li>
                    <li><strong>İletişim Bilgisi:</strong> Telefon Numarası, E-posta Adresi</li>
                    <li><strong>Randevu Bilgisi:</strong> Tercih edilen hizmet, randevu günü ve saati, müşteriye ait özel notlar</li>
                    <li><strong>İşlem Güvenliği:</strong> Randevu onay zaman damgası ve doğrulama kaydı</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-slate-800 text-xs mb-1">3. Kişisel Verilerin İşlenme Amaçları</h4>
                  <p>Toplanan kişisel verileriniz;</p>
                  <ul className="list-disc pl-5 mt-1 space-y-0.5">
                    <li>Randevu rezervasyonunuzun başarıyla kaydedilmesi ve teyit edilmesi,</li>
                    <li>Randevu saatinizden önce tarafınıza WhatsApp, SMS ve E-posta yoluyla hatırlatma ve takvim davetiyesi iletilmesi,</li>
                    <li>Randevu çakışmalarının ve mükerrer rezervasyonların engellenmesi,</li>
                    <li>Olası saat değişikliği, rötar veya iptal durumlarında sizinle irtibat kurulması,</li>
                    <li>Yetkili kamu kurum ve kuruluşlarına yasal bildirim yükümlülüklerinin yerine getirilmesi</li>
                  </ul>
                  <p className="mt-1">amaçlarıyla sınırlı ve ölçülü olarak işlenmektedir.</p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-800 text-xs mb-1">4. Verilerin Aktarımı ve Güvenliği</h4>
                  <p>
                    Kişisel verileriniz <strong>asla üçüncü şahıs veya kurumlara ticari veya reklam amaçlı devredilmez veya satılmaz.</strong> Yalnızca randevu bildirim mesajlarının (WhatsApp/SMS/E-posta) tarafınıza ulaştırılması amacıyla entegre iletişim servis sağlayıcıları altyapısı üzerinden SSL şifreleme ile iletilmektedir.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-800 text-xs mb-1">5. İlgili Kişinin Hakları (KVKK Madde 11)</h4>
                  <p>
                    KVKK’nın 11. maddesi uyarınca veri sahibi olarak; kişisel verilerinizin işlenip işlenmediğini öğrenme, işlenmişse bilgi talep etme, eksik veya yanlış işlenmişse düzeltilmesini isteme ve silinmesini (KVKK Madde 7) talep etme haklarına sahipsiniz.
                  </p>
                  <p className="mt-1 font-medium text-slate-700">
                    Başvuru ve Bilgi Talebi: kvkk@randevuformu.com üzerinden veri sorumlusuna iletilebilir.
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
    </div>
  );
}
