"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  CheckCircle2,
  MessageCircle,
  ArrowRight,
  Sparkles,
  Zap,
  Shield,
  Clock,
  Building2,
  Lock,
  ChevronRight,
  Calendar,
  Check,
  Star,
  Users,
  CreditCard,
  Mail,
  ShieldCheck,
  LayoutGrid,
  FileText,
} from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const [selectedService, setSelectedService] = useState("implant");
  const [selectedTime, setSelectedTime] = useState("14:30");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "randevuformu.com",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "TRY",
      description: "Temel randevu alma özellikleri tamamen ücretsiz.",
    },
    description:
      "Diş hekimi, güzellik salonu, psikolog veya avukatlar için WhatsApp bildirimli, SMS hatırlatmalı ücretsiz online randevu yönetim sistemi.",
    url: "https://randevuformu.com",
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F17] text-white selection:bg-indigo-500 selection:text-white font-sans antialiased overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Top Notification Bar with Direct Contact Email */}
      <div className="bg-gradient-to-r from-indigo-950 via-purple-950 to-slate-950 border-b border-white/5 py-2 px-4 text-center text-xs text-slate-300 flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
        <span>Kurumsal B2B & İş Ortaklığı İçin:</span>
        <a
          href="mailto:randevuformuu@gmail.com"
          className="text-indigo-400 font-bold hover:text-indigo-300 underline underline-offset-4 flex items-center gap-1"
        >
          <Mail className="w-3 h-3" />
          randevuformuu@gmail.com
        </a>
      </div>

      {/* Modern Glassmorphic Navbar */}
      <header className="sticky top-0 w-full z-50 bg-[#0B0F17]/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 text-white p-2 rounded-xl group-hover:scale-105 transition-transform shadow-lg shadow-indigo-600/30">
              <CalendarDays className="w-6 h-6" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400">
              randevuformu<span className="text-indigo-400">.com</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-7 text-xs font-semibold text-slate-300">
            <Link
              href="/ornek"
              className="hover:text-white transition-colors flex items-center gap-1.5"
            >
              <span>Örnek Şablonlar</span>
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/30">
                Demo
              </span>
            </Link>
            <Link href="/sektorler/diyetisyen" className="hover:text-white transition-colors">
              Sektörler
            </Link>
            <Link href="/calendar" className="hover:text-white transition-colors">
              Takvim & Randevular
            </Link>
            <Link href="/staff" className="hover:text-white transition-colors">
              Ekip Yönetimi
            </Link>
            <Link href="/contact" className="hover:text-white transition-colors">
              İletişim & B2B
            </Link>
            <Link
              href="/admin/login"
              className="hover:text-white transition-colors flex items-center gap-1 text-red-400"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Admin Girişi
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-semibold text-slate-300 hover:text-white transition-colors px-3 py-2"
            >
              Giriş Yap
            </Link>
            <Link
              href="/login"
              className="text-xs font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2.5 rounded-full hover:shadow-lg hover:shadow-indigo-500/25 transition-all hover:scale-105 active:scale-95 border border-indigo-400/30"
            >
              Ücretsiz Başla
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative pt-20 md:pt-28 pb-20 px-4 sm:px-6 overflow-hidden">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-gradient-to-r from-indigo-600/30 via-purple-600/20 to-pink-600/10 blur-[140px] rounded-full -z-10 pointer-events-none" />
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500/15 blur-[100px] rounded-full -z-10 pointer-events-none" />

          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-indigo-300 text-xs sm:text-sm font-semibold mb-8 shadow-inner"
            >
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Türkiye'nin Yeni Nesil Rezervasyon Altyapısı (Calendly & Cal.com Alternatifi)</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.1] mb-6"
            >
              Randevuları yönetmenin <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                en kusursuz yolu.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 font-normal leading-relaxed"
            >
              Telefon trafiğine ve çifte rezervasyon karmaşasına son verin. Danışanlarınız saniyeler içinde randevu alsın, Google Calendar ve SMS/WhatsApp anında senkronize olsun.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link
                href="/login"
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white px-8 py-4 rounded-full font-bold text-base hover:shadow-xl hover:shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95 border border-indigo-400/30"
              >
                Hemen Ücretsiz Başla
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/ornek"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-full font-semibold text-slate-200 bg-white/10 border border-white/15 hover:bg-white/15 hover:border-white/25 transition-all hover:scale-105 active:scale-95 backdrop-blur-md"
              >
                Canlı Örnek Şablonları Gör
              </Link>
            </motion.div>
          </div>

          {/* Interactive Live Hero Booking Widget */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-16 max-w-4xl mx-auto"
          >
            <div className="p-1 rounded-[2.5rem] bg-gradient-to-b from-white/20 via-white/5 to-transparent backdrop-blur-2xl shadow-2xl shadow-indigo-950/80">
              <div className="bg-[#111827]/90 border border-white/10 rounded-[2.3rem] p-6 sm:p-8 backdrop-blur-xl">
                {/* Header of Mockup */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400 font-bold text-lg">
                      AY
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white text-lg">Dr. Ahmet Yılmaz</h3>
                        <span className="p-1 bg-blue-500/20 text-blue-400 rounded-full">
                          <Check className="w-3 h-3" />
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        Diş Hekimi & Estetik Gülüş Tasarımı • randevuformu.com/ornek/dr-ahmet
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1.5 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    Müsait Saatler Canlı
                  </div>
                </div>

                {/* Body of Interactive Widget */}
                <div className="grid md:grid-cols-12 gap-6 mt-6">
                  {/* Left Column: Services Selection */}
                  <div className="md:col-span-6 space-y-3">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                      1. Hizmet Seçin
                    </label>
                    <div
                      onClick={() => setSelectedService("implant")}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        selectedService === "implant"
                          ? "bg-indigo-600/20 border-indigo-500 shadow-md shadow-indigo-500/10"
                          : "bg-white/5 border-white/10 hover:bg-white/10"
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-white text-sm">İmplant Konsültasyonu & Analiz</div>
                        <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                          <Clock className="w-3 h-3" /> 30 Dakika • Ön Muayene
                        </div>
                      </div>
                      <span className="text-xs font-bold px-2.5 py-1 bg-indigo-500/30 text-indigo-300 rounded-lg">
                        Ücretsiz
                      </span>
                    </div>

                    <div
                      onClick={() => setSelectedService("bleach")}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        selectedService === "bleach"
                          ? "bg-indigo-600/20 border-indigo-500 shadow-md shadow-indigo-500/10"
                          : "bg-white/5 border-white/10 hover:bg-white/10"
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-white text-sm">Lazerli Diş Beyazlatma</div>
                        <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                          <Clock className="w-3 h-3" /> 60 Dakika • Tek Seans
                        </div>
                      </div>
                      <span className="text-xs font-bold px-2.5 py-1 bg-white/10 text-slate-200 rounded-lg">
                        ₺3.000
                      </span>
                    </div>
                  </div>

                  {/* Right Column: Time Slot Selection */}
                  <div className="md:col-span-6 space-y-3">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                      2. Bugün İçin Saat Seçin
                    </label>
                    <div className="grid grid-cols-3 gap-2.5">
                      {["09:30", "11:00", "14:30", "16:00", "17:15", "18:30"].map((time) => (
                        <button
                          key={time}
                          type="button"
                          onClick={() => setSelectedTime(time)}
                          className={`py-3 px-2 text-xs font-semibold rounded-xl border transition-all ${
                            selectedTime === time
                              ? "bg-indigo-600 text-white border-indigo-400 shadow-lg shadow-indigo-600/30 scale-105"
                              : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:text-white"
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>

                    <Link
                      href="/ornek/dr-ahmet"
                      className="w-full mt-4 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 transition-all"
                    >
                      <span>{selectedTime} İçin Randevuyu Tamamla</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Feature Highlights Grid */}
        <section className="py-24 px-4 sm:px-6 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-4">
              Neden Türkiye'nin En İyisi?
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
              Global randevu araçlarının Türkiye'deki eksiklerini (yerli POS, SMS, Türkçe dil ve KVKK) tek bir platformda çözdük.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-indigo-500/40 transition-all hover:-translate-y-1">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-6">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Milisaniyelik Çakışma Koruması</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Aynı saniyede 10 kişi randevu almaya çalışsa bile gelişmiş concurrency lock algoritmamız çifte randevuyu %100 engeller.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-purple-500/40 transition-all hover:-translate-y-1">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-6">
                <MessageCircle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Otomatik E-Posta & Takvim</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Randevu onaylandığında veya iptal edildiğinde müşterinize ve size anında profesyonel HTML onay mailleri ve Google Takvim daveti gider.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-emerald-500/40 transition-all hover:-translate-y-1">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-6">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Çoklu Personel & No-Code Form</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Birden fazla hekim veya personeli Round-Robin ile yönetin, özel form alanlarınızı sürükle-bırak kolaylığında oluşturun.
              </p>
            </div>
          </div>
        </section>

        {/* Quick Links Banner */}
        <section className="py-12 px-4 sm:px-6 max-w-7xl mx-auto">
          <div className="p-8 rounded-3xl bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-slate-900 border border-indigo-500/20 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">Platformun Tüm Bölümlerini Keşfedin</h3>
              <p className="text-slate-400 text-sm">
                Aşağıdaki bağlantılar ile yönetim panellerine ve şablonlara doğrudan erişebilirsiniz.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/calendar"
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-all flex items-center gap-1.5"
              >
                📅 Takvim Paneli
              </Link>
              <Link
                href="/staff"
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-all flex items-center gap-1.5"
              >
                👥 Ekip Yönetimi
              </Link>
              <Link
                href="/forms"
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-all flex items-center gap-1.5"
              >
                📝 Form Oluşturucu
              </Link>
              <Link
                href="/settings"
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-all flex items-center gap-1.5"
              >
                ⚙️ Entegrasyonlar
              </Link>
              <Link
                href="/contact"
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white transition-all flex items-center gap-1.5"
              >
                ✉️ İletişim
              </Link>
              <Link
                href="/admin/login"
                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-semibold text-white transition-all flex items-center gap-1.5 shadow-md"
              >
                👑 Super Admin
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Modern Footer with Direct Contact */}
      <footer className="bg-[#070A0F] border-t border-white/10 py-12 px-4 sm:px-6 mt-16">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 text-white p-2 rounded-xl">
                <CalendarDays className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-lg text-white">randevuformu.com</span>
                <p className="text-xs text-slate-400">Yeni Nesil Akıllı Randevu Yönetim Platformu</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
              <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
              <div className="text-xs">
                <span className="text-slate-400">Resmi İletişim: </span>
                <a
                  href="mailto:randevuformuu@gmail.com"
                  className="font-bold text-indigo-300 hover:text-white underline"
                >
                  randevuformuu@gmail.com
                </a>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-6 text-xs text-slate-400">
            <div className="flex flex-wrap items-center gap-6">
              <Link href="/ornek" className="hover:text-white transition-colors">
                Örnek Şablonlar
              </Link>
              <Link href="/sektorler/diyetisyen" className="hover:text-white transition-colors">
                Diyetisyen
              </Link>
              <Link href="/sektorler/veteriner" className="hover:text-white transition-colors">
                Veteriner
              </Link>
              <Link href="/sektorler/avukat" className="hover:text-white transition-colors">
                Avukat
              </Link>
              <Link href="/login" className="hover:text-white transition-colors">
                Giriş Yap
              </Link>
              <Link href="/dashboard" className="hover:text-white transition-colors">
                Yönetim Paneli
              </Link>
              <Link href="/contact" className="hover:text-white transition-colors">
                Kurumsal İletişim
              </Link>
              <Link href="/admin/login" className="hover:text-red-400 transition-colors">
                Super Admin
              </Link>
            </div>
            <p className="text-slate-500">
              &copy; {new Date().getFullYear()} randevuformu.com — Tüm hakları saklıdır.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
