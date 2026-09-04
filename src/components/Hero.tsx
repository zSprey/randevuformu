"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Play,
  Shield,
  Clock,
  CheckCircle2,
  CalendarCheck,
  Star,
  Scissors,
  Check,
  MessageCircle,
} from "lucide-react";
import { motion } from "framer-motion";

/* ── Interactive Live Booking Preview (Authentic Appointment Experience) ── */
function LiveBookingPreview() {
  const [selectedService, setSelectedService] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState("11:00");
  const [isBooked, setIsBooked] = useState(false);

  const previewServices = [
    { id: 0, name: "Saç Kesimi & Yıkama", duration: "30 dk", price: 350 },
    { id: 1, name: "Sakal Tıraşı & Sıcak Havlu", duration: "30 dk", price: 200 },
    { id: 2, name: "Saç + Sakal (Komple Tıraş)", duration: "60 dk", price: 500 },
    { id: 3, name: "Özel Stil Danışmanlığı", duration: "15 dk", price: null }, // Opsiyonel fiyat: girilmezse fiyat etiketi gizlenir
  ];

  const slots = ["09:30", "11:00", "14:30", "16:00"];

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xl overflow-hidden">
      {/* Real Booking Header — By Erman Şablonu Minimizasyonu */}
      <div className="bg-[#0F2A4A] p-5 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-[#00BCD4]">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-white">Erman Usta - Erkek Berberi</h3>
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              </div>
              <p className="text-xs text-slate-300 flex items-center gap-1 mt-0.5">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> 4.9 (148 Yorum) • Kadıköy, İstanbul
              </p>
            </div>
          </div>
          <span className="text-[11px] font-medium bg-[#00BCD4]/20 text-[#00BCD4] border border-[#00BCD4]/30 px-2.5 py-1 rounded-full">
            Canlı Şablon
          </span>
        </div>
      </div>

      {isBooked ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 text-center space-y-4"
        >
          <div className="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h4 className="text-base font-bold text-[#0F2A4A]">Randevunuz Başarıyla Alındı!</h4>
            <p className="text-xs text-slate-500">
              {previewServices[selectedService].name} • Saat: {selectedSlot}
            </p>
          </div>
          <div className="p-3.5 bg-emerald-50/60 border border-emerald-200/80 rounded-xl text-left flex items-start gap-3">
            <MessageCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-emerald-900">WhatsApp Bildirimi Gönderildi</p>
              <p className="text-[11px] text-emerald-700 mt-0.5">
                Erman Usta&apos;ya ve müşteriye takvim davetiyle birlikte anında onay mesajı iletildi.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsBooked(false)}
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
          >
            Yeni Randevu Simüle Et
          </button>
        </motion.div>
      ) : (
        <div className="p-5 space-y-5">
          {/* Hizmet Seçimi */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#0F2A4A] flex items-center gap-1.5">
                <Scissors className="w-3.5 h-3.5 text-[#0062FF]" />
                1. Hizmet Seçin (İstediğinizi Özelleştirin)
              </span>
              <span className="text-[11px] text-slate-400">Tek tıkla seçin</span>
            </div>
            <div className="space-y-1.5">
              {previewServices.map((svc) => {
                const isSelected = selectedService === svc.id;
                return (
                  <button
                    key={svc.id}
                    onClick={() => setSelectedService(svc.id)}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between text-xs ${
                      isSelected
                        ? "border-[#0062FF] bg-[#0062FF]/[0.04] shadow-sm ring-1 ring-[#0062FF]/20"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/60"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected ? "border-[#0062FF] bg-[#0062FF]" : "border-slate-300"
                        }`}
                      >
                        {isSelected && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                      </div>
                      <div>
                        <p className={`font-medium ${isSelected ? "text-[#0F2A4A]" : "text-slate-700"}`}>
                          {svc.name}
                        </p>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" /> {svc.duration}
                        </span>
                      </div>
                    </div>
                    {/* Opsiyonel Fiyat: Fiyat tanımlıysa gösterilir, boşsa DOM'dan tamamen gizlenir */}
                    {svc.price && svc.price > 0 ? (
                      <span className="font-semibold text-[#0062FF] bg-[#0062FF]/10 px-2 py-0.5 rounded-md text-xs">
                        ₺{svc.price}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Saat Seçimi */}
          <div className="space-y-2">
            <span className="font-semibold text-xs text-[#0F2A4A] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#00BCD4]" />
              2. Uygun Saati Seçin
            </span>
            <div className="grid grid-cols-4 gap-2">
              {slots.map((slot) => {
                const isSelected = selectedSlot === slot;
                return (
                  <button
                    key={slot}
                    onClick={() => setSelectedSlot(slot)}
                    className={`py-2 px-1 text-center text-xs font-semibold rounded-lg border transition ${
                      isSelected
                        ? "bg-[#0F2A4A] text-white border-[#0F2A4A] shadow-sm"
                        : "border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Aksiyon Butonu */}
          <button
            onClick={() => setIsBooked(true)}
            className="w-full py-3 bg-[#0062FF] hover:bg-[#0052d9] active:scale-[0.99] text-white text-xs font-semibold rounded-xl shadow-md transition flex items-center justify-center gap-2"
          >
            <CalendarCheck className="w-4 h-4" />
            Randevuyu Onayla &amp; WhatsApp Teyidi Al
          </button>
        </div>
      )}

      {/* Canlı Sistem Bildirimi */}
      <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Otomatik WhatsApp &amp; Takvim Senkronizasyonu
        </span>
        <span className="font-mono text-slate-400">randevuformu.com</span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   HERO SECTION
   ═══════════════════════════════════════ */
export default function Hero() {
  return (
    <section className="relative bg-[#FAFBFC] overflow-hidden">
      {/* Subtle geometric accent — NOT a neon glow */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-[#00BCD4]/[0.04] to-transparent rounded-full -translate-y-1/3 translate-x-1/3 pointer-events-none" />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-20 sm:py-28">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* ── Left Column: Value Proposition ── */}
          <div className="space-y-8">
            {/* Pill Badge */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="inline-flex items-center gap-2 text-[12px] font-medium text-[#0062FF] bg-[#0062FF]/[0.06] border border-[#0062FF]/[0.12] px-3 py-1.5 rounded-lg">
                <Shield className="w-3.5 h-3.5" strokeWidth={1.75} />
                Online Randevu Sistemi &amp; Randevu Formu
              </span>
            </motion.div>

            {/* Headline */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-4"
            >
              <h1 className="text-3xl sm:text-5xl lg:text-[3.25rem] font-bold tracking-[-0.03em] leading-[1.15] text-[#0F2A4A]">
                Yeni Nesil <span className="text-[#0062FF]">Randevu Formu</span> &amp; Online Randevu Sistemi
              </h1>
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-lg">
                Kuaför, berber, klinik ve danışmanlar için WhatsApp onaylı randevu formu. Rezervasyonlarınızı 30 saniyede otomatikleştirin.
              </p>
            </motion.div>

            {/* CTA Group */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 bg-[#00BCD4] hover:bg-[#00acc1] text-white text-sm font-medium px-6 py-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-150 active:scale-[0.98]"
              >
                Ücretsiz Başlayın
                <ArrowRight className="w-4 h-4" strokeWidth={2} />
              </Link>
              <Link
                href="/ornek"
                className="inline-flex items-center justify-center gap-2 bg-white text-slate-700 text-sm font-medium px-6 py-3 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-sm transition-all duration-150"
              >
                <Play className="w-3.5 h-3.5 text-slate-400" strokeWidth={2} />
                Canlı Demoyu İncele
              </Link>
            </motion.div>

            {/* Social Proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="flex items-center gap-4 pt-2"
            >
              <div className="flex -space-x-2">
                {[
                  "bg-[#0062FF]",
                  "bg-[#00BCD4]",
                  "bg-[#0F2A4A]",
                  "bg-slate-400",
                ].map((bg, i) => (
                  <div
                    key={i}
                    className={`w-8 h-8 rounded-full ${bg} border-2 border-white flex items-center justify-center text-[10px] font-bold text-white`}
                  >
                    {["A", "B", "E", "+"][i]}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-3.5 h-3.5 fill-amber-400 text-amber-400"
                      strokeWidth={0}
                    />
                  ))}
                </div>
                <p className="text-[12px] text-slate-400 mt-0.5">
                  500+ işletme tarafından tercih ediliyor
                </p>
              </div>
            </motion.div>
          </div>

          {/* ── Right Column: Interactive Live Booking Preview ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <LiveBookingPreview />

            {/* Floating Mini Notification */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="absolute -bottom-4 -left-4 bg-white border border-slate-200 rounded-xl shadow-lg px-3.5 py-2.5 flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" strokeWidth={2} />
              </div>
              <div>
                <p className="text-[12px] font-semibold text-[#0F2A4A]">Koltuk Rezerve Edildi</p>
                <p className="text-[11px] text-slate-500">WhatsApp teyidi anında iletildi</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
