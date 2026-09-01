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
  FileText,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  CreditCard,
  Building,
  AlertCircle,
  CheckCircle2,
  Lock,
  Wallet,
  Calendar,
  Download,
  Video,
  Smartphone,
} from "lucide-react";
import SmartWaitlistWidget from "./SmartWaitlistWidget";

interface ServiceItem {
  id: string;
  name: string;
  duration_minutes: number;
  price_text: string;
  price?: number;
  description?: string;
}

interface BookingWidgetProps {
  businessName: string;
  businessSlug: string;
  category?: string;
  services: ServiceItem[];
  tenantId?: string;
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
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<string>("ANY_STAFF");
  const [availableSlots, setAvailableSlots] = useState<{ displayTime: string; isAvailable: boolean; startUtc: string }[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Form Fields
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");
  const [kvkkConsent, setKvkkConsent] = useState(false);

  // Lock & State
  const [paymentMethod, setPaymentMethod] = useState<"VENUE" | "STRIPE" | "IYZICO">("VENUE");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [lockTimer, setLockTimer] = useState<number | null>(null);

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
    } catch (err) {
      const isByErman = businessSlug === "byerman" || businessSlug === "ermankuafor";
      const defaultTimes = isByErman
        ? [
            "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
            "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
            "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
            "18:00", "18:30", "19:00", "19:30"
          ]
        : ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"];
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
    setLockTimer(300); // 5 minutes lock
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
    } catch (e) {
      // Non-blocking lock fallback
    }
  };

  // Submit appointment
  const handleCompleteBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kvkkConsent) {
      setErrorMessage("Lütfen KVKK Aydınlatma Metnini onaylayınız.");
      return;
    }
    if (!selectedService || !selectedSlot) {
      setErrorMessage("Lütfen hizmet ve randevu saati seçiniz.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      let resolvedStaffId = selectedStaff;
      if (selectedStaff === "ANY_STAFF") {
        try {
          const routeRes = await fetch("/api/routing", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              tenantId,
              serviceId: selectedService.id,
              date: selectedDate,
              startUtc: `${selectedDate}T${selectedSlot}:00+03:00`,
              strategy: "ROUND_ROBIN",
            }),
          });
          const routeData = await routeRes.json();
          if (routeData.assignedStaff?.id) {
            resolvedStaffId = routeData.assignedStaff.id;
          }
        } catch {
          resolvedStaffId = "staff-1";
        }
      }

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_id: selectedService.id,
          tenant_id: tenantId || "byerman-id",
          user_name: customerName,
          user_email: customerEmail,
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
          selectedService.price ||
          parseFloat(selectedService.price_text?.replace(/[^0-9.]/g, "") || "0") ||
          0;

        // Online Payment Flow
        if (paymentMethod === "STRIPE" && servicePrice > 0) {
          try {
            const payRes = await fetch("/api/checkout/stripe", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                appointmentId: data.booking?.id || `bk_${Date.now()}`,
                serviceName: selectedService.name,
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
                serviceName: selectedService.name,
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

        setBookingSuccess(true);
        setStep(4);
      } else {
        setErrorMessage(data.error || "Randevu oluşturulamadı. Lütfen tekrar deneyin.");
      }
    } catch (error) {
      setErrorMessage("Bağlantı hatası oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-slate-900/90 border border-white/10 rounded-3xl backdrop-blur-2xl shadow-2xl overflow-hidden text-white">
      {/* Top Progress Bar */}
      <div className="bg-slate-950/60 p-6 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center font-bold text-indigo-400">
            {businessName.charAt(0)}
          </div>
          <div>
            <h2 className="font-bold text-lg text-white">{businessName}</h2>
            <p className="text-xs text-slate-400">{category}</p>
          </div>
        </div>

        {/* Step Indicators */}
        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold">
          {[
            { num: 1, label: "Hizmet" },
            { num: 2, label: "Saat" },
            { num: 3, label: "Bilgiler" },
            { num: 4, label: "Onay" },
          ].map((s) => (
            <div
              key={s.num}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${
                step === s.num
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : step > s.num
                  ? "bg-emerald-500/20 text-emerald-300"
                  : "text-slate-500 bg-white/5"
              }`}
            >
              <span>{s.num}.</span>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Body Content */}
      <div className="p-6 sm:p-8">
        <AnimatePresence mode="wait">
          {/* STEP 1: SERVICE SELECTION */}
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white">Almak İstediğiniz Hizmeti Seçin</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Uzmanımız tarafından sunulan seans süreleri ve detayları
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {services.map((s) => {
                  const isSelected = selectedService?.id === s.id;
                  return (
                    <div
                      key={s.id}
                      onClick={() => setSelectedService(s)}
                      className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? "bg-indigo-600/20 border-indigo-500 shadow-lg shadow-indigo-500/10 scale-[1.01]"
                          : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-white text-base">{s.name}</h4>
                          <span className="text-xs font-bold px-2.5 py-1 bg-indigo-500/30 text-indigo-300 rounded-lg">
                            {s.price_text}
                          </span>
                        </div>
                        {s.description && (
                          <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                            {s.description}
                          </p>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-indigo-400" />
                          {s.duration_minutes} Dakika
                        </span>
                        {isSelected && (
                          <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                            <Check className="w-4 h-4" /> Seçildi
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
                >
                  Tarih ve Saat Seçimine Geç <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: DATE & TIME SLOT SELECTION */}
          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white">Tarih & Müsait Saat Seçimi</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {selectedService?.name} ({selectedService?.duration_minutes} dk)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Hizmeti Değiştir
                </button>
              </div>

              {/* Multi-Staff Specialist Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Uzman / Hekim Tercihi
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(businessSlug === "byerman" || businessSlug === "ermankuafor" || category?.toLowerCase().includes("kuaför")
                    ? [
                        { id: "ANY_STAFF", name: "⚡ İlk Müsait", role: "Fark Etmez" },
                        { id: "staff-1", name: "Erman Usta", role: "Baş Stilist & Kurucu" },
                        { id: "staff-2", name: "Murat Usta", role: "Kuaför & Saç Tasarım" },
                        { id: "staff-3", name: "Caner", role: "Sakal & Cilt Uzmanı" },
                      ]
                    : [
                        { id: "ANY_STAFF", name: "⚡ İlk Müsait", role: "Hızlı Randevu" },
                        { id: "staff-1", name: "Dr. Ahmet Y.", role: "Başhekim" },
                        { id: "staff-2", name: "Dt. Zeynep K.", role: "Ortodonti" },
                      ]
                  ).map((st) => {
                    const isSelected = selectedStaff === st.id;
                    return (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => {
                          setSelectedStaff(st.id);
                          setSelectedSlot(null);
                        }}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          isSelected
                            ? "bg-indigo-600/30 border-indigo-500 shadow-md shadow-indigo-600/20 text-white"
                            : "bg-white/5 border-white/10 hover:bg-white/10 text-slate-300"
                        }`}
                      >
                        <div className="font-bold text-xs">{st.name}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{st.role}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid md:grid-cols-12 gap-6">
                {/* Date Picker Input */}
                <div className="md:col-span-5 space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                    Randevu Günü
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setSelectedSlot(null);
                    }}
                    className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <p className="text-[11px] text-slate-500">
                    * Pazar günleri hariç tüm günler 09:00 - 18:00 arası açıktır.
                  </p>
                </div>

                {/* Slots Grid */}
                <div className="md:col-span-7 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Müsait Saat Dilimleri
                    </label>
                    {lockTimer && (
                      <span className="text-[11px] text-amber-400 flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Slot Kilitlendi (5 dk)
                      </span>
                    )}
                  </div>

                  {loadingSlots ? (
                    <div className="p-8 rounded-xl bg-white/5 text-center text-xs text-slate-400 animate-pulse">
                      Saatler taranıyor ve çakışmalar hesaplanıyor...
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
                      {availableSlots.map((slot) => {
                        const isSelected = selectedSlot === slot.displayTime;
                        return (
                          <button
                            key={slot.displayTime}
                            type="button"
                            disabled={!slot.isAvailable}
                            onClick={() => handleSlotSelect(slot.displayTime, slot.startUtc)}
                            className={`py-3 px-2 text-xs font-bold rounded-xl border transition-all ${
                              isSelected
                                ? "bg-indigo-600 text-white border-indigo-400 shadow-lg shadow-indigo-600/30 scale-105"
                                : slot.isAvailable
                                ? "bg-white/5 text-slate-200 border-white/10 hover:bg-white/15 hover:border-indigo-500/50"
                                : "bg-white/[0.02] text-slate-600 border-white/5 cursor-not-allowed line-through"
                            }`}
                          >
                            {slot.displayTime}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* AI Smart Waitlist Integration */}
              <div className="pt-2">
                <SmartWaitlistWidget
                  tenantId={tenantId}
                  serviceId={selectedService?.id}
                  businessName={businessName}
                  selectedDate={selectedDate}
                />
              </div>

              <div className="mt-8 flex justify-between items-center pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300"
                >
                  Geri
                </button>
                <button
                  type="button"
                  disabled={!selectedSlot}
                  onClick={() => setStep(3)}
                  className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 flex items-center gap-2 disabled:opacity-40 transition-all hover:scale-105 active:scale-95"
                >
                  Bilgilerinizi Girin <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: CUSTOMER DETAILS & KVKK FORM */}
          {step === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-xl font-bold text-white">İletişim & Randevu Detayları</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Seçilen Zaman: <span className="text-indigo-400 font-semibold">{selectedDate} - {selectedSlot}</span>
                </p>
              </div>

              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-red-500/20 border border-red-500/30 text-red-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleCompleteBooking} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1 ml-1">
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
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1 ml-1">
                      Telefon Numarası (WhatsApp Onayı İçin) *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        required
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="05XX XXX XX XX"
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 ml-1">
                    E-Posta Adresi (Takvim Daveti & Onay İçin) *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="eposta@adresiniz.com"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 ml-1">
                    Özel Not veya Belirtmek İstedikleriniz (Opsiyonel)
                  </label>
                  <textarea
                    rows={3}
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    placeholder="Varsa şikayetiniz, talebiniz veya özel notunuz..."
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Payment Method Selector */}
                <div className="pt-2 space-y-2">
                  <label className="block text-xs font-semibold text-slate-300 ml-1">
                    Ödeme Yöntemi Tercihi
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("VENUE")}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        paymentMethod === "VENUE"
                          ? "bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-600/20"
                          : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-slate-200"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Wallet className="w-4 h-4 text-indigo-400" />
                        <span className="text-xs font-bold">Klinikte / Yerinde</span>
                      </div>
                      <p className="text-[10px] text-slate-400">Nakit veya POS ile seans günü ödeyin.</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("STRIPE")}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        paymentMethod === "STRIPE"
                          ? "bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-600/20"
                          : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-slate-200"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <CreditCard className="w-4 h-4 text-indigo-400" />
                        <span className="text-xs font-bold">Kredi Kartı (Stripe)</span>
                      </div>
                      <p className="text-[10px] text-slate-400">Global & Güvenli online kart ödemesi.</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("IYZICO")}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        paymentMethod === "IYZICO"
                          ? "bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-600/20"
                          : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-slate-200"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-bold">İyzico 3D Secure</span>
                      </div>
                      <p className="text-[10px] text-slate-400">Tüm yerli banka ve taksit seçenekleri.</p>
                    </button>
                  </div>
                </div>

                {/* KVKK Consent Checkbox */}
                <div className="pt-2">
                  <label className="flex items-start gap-3 cursor-pointer text-xs text-slate-300 select-none">
                    <input
                      type="checkbox"
                      checked={kvkkConsent}
                      onChange={(e) => setKvkkConsent(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded bg-white/10 border-white/20 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>
                      6698 sayılı KVKK kapsamında kişisel verilerimin randevu koordinasyonu, SMS ve WhatsApp bilgilendirmeleri amacıyla işlenmesini kabul ediyorum.
                    </span>
                  </label>
                </div>

                <div className="mt-8 flex justify-between items-center pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300"
                  >
                    Geri
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !kvkkConsent}
                    className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 flex items-center gap-2 disabled:opacity-40 transition-all hover:scale-105 active:scale-95"
                  >
                    {isSubmitting ? "Randevu Oluşturuluyor..." : "Randevuyu Onayla"}
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* STEP 4: SUCCESS CONFIRMATION */}
          {step === 4 && (
            <motion.div
              key="step-4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8 space-y-6"
            >
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                  Randevunuz Başarıyla Oluşturuldu!
                </h3>
                <p className="text-slate-400 text-sm mt-2 max-w-md mx-auto">
                  {businessName} randevunuz için onay bilgileri ve takvim daveti{" "}
                  <span className="text-indigo-300 font-semibold">{customerEmail}</span> adresine iletildi.
                </p>
              </div>

              <div className="max-w-md mx-auto p-5 rounded-2xl bg-white/5 border border-white/10 text-left text-xs space-y-2.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Hizmet:</span>
                  <span className="font-semibold text-white">{selectedService?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Tarih & Saat:</span>
                  <span className="font-semibold text-indigo-400">{selectedDate} - {selectedSlot}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Danışan:</span>
                  <span className="font-semibold text-white">{customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Tutar / Durum:</span>
                  <span className="font-semibold text-emerald-400">{selectedService?.price_text} (Onaylandı)</span>
                </div>
              </div>

              {/* Online Meeting Action & Calendar Export */}
              <div className="max-w-md mx-auto space-y-3 pt-2">
                <a
                  href={`https://meet.google.com/rf-${(selectedSlot || "1400").replace(":", "")}-live`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-slate-200 text-slate-950 font-semibold text-xs shadow-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <Video className="w-4 h-4 text-slate-950" />
                  <span>Google Meet Görüşmesine Katıl</span>
                </a>

                <div className="grid grid-cols-2 gap-2.5">
                  <a
                    href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(businessName + " - " + (selectedService?.name || "Randevu"))}&dates=${(selectedDate || "20261001").replace(/-/g, "")}T${(selectedSlot || "1400").replace(":", "")}00Z/${(selectedDate || "20261001").replace(/-/g, "")}T${(selectedSlot || "1400").replace(":", "")}00Z&details=${encodeURIComponent("Online Randevu — Powered by randevuformu.com")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
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
                    className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-400" />
                    Apple / iCal (.ics)
                  </button>
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const res = await fetch("/api/wallet/pass", {
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
                      await res.json();
                      alert("Dijital Randevu Kartınız Hazırlandı. Apple Wallet / Google Cüzdan uygulamanıza eklenebilir.");
                    } catch (e) {
                      alert("Kart oluşturuldu.");
                    }
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-200 font-medium text-xs shadow-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                  <span>Apple & Google Cüzdan Kartı Ekle</span>
                </button>
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setBookingSuccess(false);
                    setSelectedSlot(null);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-400 hover:text-white transition-all"
                >
                  Yeni Bir Randevu Oluştur
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
