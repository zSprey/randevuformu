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
  Menu,
  X,
  QrCode,
  BookOpen,
  ChevronDown,
  Phone,
  Layers,
  Sparkle,
  Award,
  Globe,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedService, setSelectedService] = useState("implant");
  const [selectedTime, setSelectedTime] = useState("14:30");
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const servicesData = [
    {
      id: "implant",
      name: "İmplant Konsültasyonu & Analiz",
      duration: "30 Dakika",
      badge: "Ön Muayene",
      price: "Ücretsiz",
      highlight: true,
    },
    {
      id: "bleach",
      name: "Lazerli Diş Beyazlatma",
      duration: "60 Dakika",
      badge: "Tek Seans",
      price: "₺3.000",
      highlight: false,
    },
    {
      id: "smile",
      name: "Estetik Gülüş Tasarımı",
      duration: "45 Dakika",
      badge: "3D Simülasyon",
      price: "₺1.500",
      highlight: false,
    },
    {
      id: "zircon",
      name: "Zirkonyum Kaplama Ön Analizi",
      duration: "45 Dakika",
      badge: "Klinik Çekim",
      price: "₺1.000",
      highlight: false,
    },
  ];

  const currentServiceObj = servicesData.find((s) => s.id === selectedService) || servicesData[0];

  const faqs = [
    {
      q: "Calendly veya Cal.com yerine neden randevuformu.com kullanmalıyım?",
      a: "randevuformu.com tamamen Türkiye pazarı için tasarlanmıştır. Yerli İyzico sanal POS, Netgsm SMS OTP teyidi, WhatsApp API hatırlatmaları, %100 Türkçe dil desteği ve KVKK veri koruma mevzuatına tam uyum sunar. Yabancı platformlarda olmayan yerel ödeme ve faturalandırma avantajlarına sahiptir.",
    },
    {
      q: "Randevu çakışması (çifte rezervasyon) nasıl engelleniyor?",
      a: "Gelişmiş atomik concurrency lock mekanizmamız sayesinde aynı saniyede birden fazla danışan aynı koltuğa veya hekime randevu almaya çalışsa bile milisaniyelik kilit devreye girer. Ayrıca Google ve Outlook Takviminizdeki kişisel etkinlikleriniz taranarak o saatler anında bloke edilir.",
    },
    {
      q: "Kendi web siteme veya Instagram profilime entegre edebilir miyim?",
      a: "Evet! Size özel oluşturulan randevu linkinizi (örn: randevuformu.com/dr-ahmet) Instagram 'Biyografi' alanına ekleyebilir, hazır tek satırlık iframe kodumuz ile WordPress, Wix veya özel web sitenize gömebilir ya da kliniğiniz için QR masa standı çıktısı alabilirsiniz.",
    },
    {
      q: "Çoklu hekim veya çalışan (Multi-Staff) desteği var mı?",
      a: "Evet! Ekibinizdeki tüm hekim veya uzmanları ekleyebilir, her birinin çalışma saatlerini bağımsız belirleyebilir ve 'İlk Müsait Uzman' seçeneğinde Round-Robin (sıralı) veya Least-Busy (yük dengeleme) algoritmasıyla randevuları otomatik paylaştırabilirsiniz.",
    },
    {
      q: "Başlamak için kredi kartı bilgisi gerekiyor mu?",
      a: "Hayır. 30 saniye içinde ücretsiz hesabınızı oluşturabilir, randevu formunuzu yayınlayabilir ve danışanlarınızdan rezervasyon kabul etmeye hemen başlayabilirsiniz.",
    },
  ];

  const sectors = [
    { name: "Diş Hekimi", slug: "dis-hekimi", icon: "🦷", desc: "Konsültasyon, cerrahi & estetik" },
    { name: "Diyetisyen", slug: "diyetisyen", icon: "🥗", desc: "Online seans & kilo kontrolü" },
    { name: "Veteriner", slug: "veteriner", icon: "🐾", desc: "Aşı, muayene & pet oteli" },
    { name: "Avukat", slug: "avukat", icon: "⚖️", desc: "Ön danışmanlık & vekalet" },
    { name: "Kuaför & Güzellik", slug: "kuafor", icon: "✂️", desc: "Kaporalı koltuk rezervasyonu" },
    { name: "Psikolog", slug: "psikolog", icon: "🧠", desc: "Bireysel terapi & Google Meet" },
    { name: "Fizyoterapist", slug: "fizyoterapist", icon: "💪", desc: "Manuel terapi & egzersiz" },
  ];

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
    <div className="min-h-screen flex flex-col bg-[#070B12] text-slate-100 selection:bg-indigo-500 selection:text-white font-sans antialiased overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Top Notification Bar with Direct Contact Email */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 border-b border-white/5 py-2 px-4 text-center text-xs text-slate-300 flex items-center justify-center gap-2 relative z-50">
        <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
        <span className="hidden sm:inline">Kurumsal B2B Entegrasyon & Özel Yazılım Çözümleri:</span>
        <span className="sm:hidden">Kurumsal İletişim:</span>
        <a
          href="mailto:randevuformuu@gmail.com"
          className="text-indigo-400 font-bold hover:text-indigo-300 underline underline-offset-4 flex items-center gap-1 transition-colors"
        >
          <Mail className="w-3.5 h-3.5" />
          randevuformuu@gmail.com
        </a>
      </div>

      {/* Modern Glassmorphic Navbar */}
      <header className="sticky top-0 w-full z-50 bg-[#070B12]/80 backdrop-blur-2xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 text-white p-2.5 rounded-2xl group-hover:scale-105 transition-transform shadow-lg shadow-indigo-600/30">
              <CalendarDays className="w-5 h-5" />
            </div>
            <span className="font-black text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400">
              randevuformu<span className="text-indigo-400">.com</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-300">
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
            <Link href="/forms" className="hover:text-white transition-colors">
              Form Oluşturucu
            </Link>
            <Link href="/qr-stand" className="hover:text-white transition-colors">
              QR Stand
            </Link>
            <Link href="/blog" className="hover:text-white transition-colors">
              Blog & Rehber
            </Link>
            <Link href="/contact" className="hover:text-white transition-colors">
              İletişim & B2B
            </Link>
            <Link
              href="/admin/login"
              className="hover:text-red-300 transition-colors flex items-center gap-1 text-red-400"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Admin
            </Link>
          </nav>

          {/* Desktop CTA & Mobile Hamburger Trigger */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden sm:inline-flex text-xs font-semibold text-slate-300 hover:text-white transition-colors px-3 py-2"
            >
              Giriş Yap
            </Link>
            <Link
              href="/login"
              className="text-xs font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2.5 rounded-full hover:shadow-lg hover:shadow-indigo-500/25 transition-all hover:scale-105 active:scale-95 border border-indigo-400/30"
            >
              Ücretsiz Başla
            </Link>

            {/* Mobile Hamburger Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Menüyü Aç"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="lg:hidden bg-[#0B0F17]/95 border-b border-white/10 backdrop-blur-2xl px-4 py-6 space-y-4 overflow-hidden"
            >
              <nav className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-300">
                <Link
                  href="/ornek"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-between"
                >
                  <span>Örnek Şablonlar</span>
                  <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded font-bold">
                    Demo
                  </span>
                </Link>
                <Link
                  href="/calendar"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4 text-indigo-400" />
                  <span>Takvim Paneli</span>
                </Link>
                <Link
                  href="/staff"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 flex items-center gap-2"
                >
                  <Users className="w-4 h-4 text-purple-400" />
                  <span>Ekip Yönetimi</span>
                </Link>
                <Link
                  href="/forms"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 flex items-center gap-2"
                >
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span>Form Oluşturucu</span>
                </Link>
                <Link
                  href="/qr-stand"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 flex items-center gap-2"
                >
                  <QrCode className="w-4 h-4 text-blue-400" />
                  <span>QR Stand & Widget</span>
                </Link>
                <Link
                  href="/blog"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 flex items-center gap-2"
                >
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  <span>Blog & Rehber</span>
                </Link>
                <Link
                  href="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 flex items-center gap-2"
                >
                  <Mail className="w-4 h-4 text-pink-400" />
                  <span>İletişim & B2B</span>
                </Link>
                <Link
                  href="/admin/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3 rounded-2xl bg-red-950/40 border border-red-800/50 text-red-300 hover:bg-red-900/40 flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4 text-red-400" />
                  <span>Admin Girişi</span>
                </Link>
              </nav>

              <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xs text-center shadow-lg shadow-indigo-600/30"
                >
                  Ücretsiz Giriş Yap / Hesap Aç
                </Link>
                <a
                  href="mailto:randevuformuu@gmail.com"
                  className="text-center text-[11px] text-slate-400 hover:text-indigo-300"
                >
                  B2B Destek: randevuformuu@gmail.com
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative pt-16 sm:pt-24 pb-20 px-4 sm:px-6 overflow-hidden">
          {/* Ambient Glows */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[550px] bg-gradient-to-r from-indigo-600/25 via-purple-600/20 to-pink-600/10 blur-[150px] rounded-full -z-10 pointer-events-none" />
          <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-blue-500/15 blur-[120px] rounded-full -z-10 pointer-events-none" />

          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-indigo-300 text-xs sm:text-sm font-semibold mb-6 shadow-inner"
            >
              <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
              <span>Türkiye&apos;nin Yeni Nesil Rezervasyon Altyapısı (Calendly & Cal.com Alternatifi)</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white leading-[1.08] mb-6"
            >
              Randevuları yönetmenin <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                en kusursuz ve akıllı yolu.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 font-normal leading-relaxed"
            >
              Telefon trafiğine ve çifte rezervasyon karmaşasına son verin. Danışanlarınız saniyeler içinde randevu alsın; Google Takvim, SMS ve WhatsApp anında senkronize olsun.
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
            <div className="p-1 rounded-[2.5rem] bg-gradient-to-b from-indigo-500/30 via-white/10 to-transparent backdrop-blur-2xl shadow-2xl shadow-indigo-950/80">
              <div className="bg-[#0D131F]/95 border border-white/10 rounded-[2.3rem] p-6 sm:p-8 backdrop-blur-xl">
                {/* Header of Mockup */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 border border-indigo-400/40 flex items-center justify-center text-white font-black text-lg shadow-md shadow-indigo-600/25">
                      AY
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white text-lg">Dr. Ahmet Yılmaz</h3>
                        <span className="p-1 bg-blue-500/20 text-blue-400 rounded-full" title="Doğrulanmış Klinik">
                          <Check className="w-3 h-3" />
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        Diş Hekimi & Estetik Gülüş Tasarımı • randevuformu.com/dr-ahmet
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/50 border border-emerald-500/40 px-3.5 py-1.5 rounded-full font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    Müsait Saatler Canlı
                  </div>
                </div>

                {/* Body of Interactive Widget */}
                <div className="grid md:grid-cols-12 gap-6 mt-6">
                  {/* Left Column: Services Selection */}
                  <div className="md:col-span-6 space-y-2.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                      1. Hizmet Seçin
                    </label>
                    {servicesData.map((svc) => {
                      const isSelected = selectedService === svc.id;
                      return (
                        <div
                          key={svc.id}
                          onClick={() => setSelectedService(svc.id)}
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? "bg-indigo-600/25 border-indigo-500 shadow-md shadow-indigo-500/20 scale-[1.01]"
                              : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                          }`}
                        >
                          <div>
                            <div className="font-semibold text-white text-sm">{svc.name}</div>
                            <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                              <Clock className="w-3 h-3 text-indigo-400" /> {svc.duration} • {svc.badge}
                            </div>
                          </div>
                          <span
                            className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                              svc.price === "Ücretsiz"
                                ? "bg-indigo-500/30 text-indigo-300"
                                : "bg-white/10 text-slate-200"
                            }`}
                          >
                            {svc.price}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Right Column: Time Slot Selection */}
                  <div className="md:col-span-6 space-y-3 flex flex-col justify-between">
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                        2. Bugün İçin Saat Seçin
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {["09:30", "11:00", "14:30", "16:00", "17:15", "18:30"].map((time) => {
                          const isSelected = selectedTime === time;
                          return (
                            <button
                              key={time}
                              type="button"
                              onClick={() => setSelectedTime(time)}
                              className={`py-3 px-2 text-xs font-bold rounded-xl border transition-all ${
                                isSelected
                                  ? "bg-indigo-600 text-white border-indigo-400 shadow-lg shadow-indigo-600/30 scale-105"
                                  : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:text-white"
                              }`}
                            >
                              {time}
                            </button>
                          );
                        })}
                      </div>

                      <div className="p-3 mt-4 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 space-y-1">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Seçilen Hizmet:</span>
                          <span className="font-semibold text-white">{currentServiceObj.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Randevu Saati:</span>
                          <span className="font-semibold text-indigo-400">Bugün {selectedTime}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Tutar:</span>
                          <span className="font-semibold text-emerald-400">{currentServiceObj.price}</span>
                        </div>
                      </div>
                    </div>

                    <Link
                      href="/ornek/dr-ahmet"
                      className="w-full mt-4 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 transition-all hover:scale-105 active:scale-95"
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

        {/* Live Metrics Row */}
        <section className="py-10 border-y border-white/5 bg-[#090E17]/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="p-4">
                <div className="text-3xl sm:text-4xl font-black text-white bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                  1,200+
                </div>
                <div className="text-xs text-slate-400 mt-1 font-semibold">Aktif Sağlık & Hizmet İşletmesi</div>
              </div>
              <div className="p-4">
                <div className="text-3xl sm:text-4xl font-black text-emerald-400">
                  %99.98
                </div>
                <div className="text-xs text-slate-400 mt-1 font-semibold">Bulut Çalışma Süresi (SLA)</div>
              </div>
              <div className="p-4">
                <div className="text-3xl sm:text-4xl font-black text-purple-400">
                  0
                </div>
                <div className="text-xs text-slate-400 mt-1 font-semibold">Çifte Rezervasyon Çakışması</div>
              </div>
              <div className="p-4">
                <div className="text-3xl sm:text-4xl font-black text-indigo-400">
                  &lt; 10 sn
                </div>
                <div className="text-xs text-slate-400 mt-1 font-semibold">Ortalama Randevu Alma Hızı</div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Highlights Grid */}
        <section className="py-24 px-4 sm:px-6 max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              Neden randevuformu.com?
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
              Global Standartta Altyapı, %100 Türkiye Uyumu
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-xs sm:text-sm">
              Calendly, Cal.com gibi yabancı yazılımların Türkiye&apos;deki eksiklerini (yerli POS, SMS OTP, Türkçe dil, KVKK ve WhatsApp) tek bir platformda çözdük.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-slate-900/60 border border-white/10 hover:border-indigo-500/40 transition-all hover:-translate-y-1.5 shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-6">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-3">Milisaniyelik Çakışma Koruması</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Aynı saniyede onlarca kişi randevu almaya çalışsa bile concurrency lock algoritmamız çifte randevuyu %100 engeller.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-900/60 border border-white/10 hover:border-purple-500/40 transition-all hover:-translate-y-1.5 shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-6">
                <MessageCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-3">Otomatik E-Posta & WhatsApp</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Randevu onaylandığında veya iptal edildiğinde müşterinize ve size anında profesyonel HTML onay mailleri ve Google Takvim daveti gider.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-900/60 border border-white/10 hover:border-emerald-500/40 transition-all hover:-translate-y-1.5 shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-6">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-3">Çoklu Personel & No-Code Form</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Birden fazla hekim veya personeli Round-Robin ile yönetin, özel form alanlarınızı sürükle-bırak kolaylığında oluşturun.
              </p>
            </div>
          </div>
        </section>

        {/* Sector Showcase Section */}
        <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto border-t border-white/5">
          <div className="text-center mb-12 space-y-3">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              Her Sektör İçin Hazır Şablonlar
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto">
              Kendi sektörünüze uygun özelleştirilmiş randevu akışını tek tıkla seçin ve kullanmaya başlayın.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {sectors.map((sec) => (
              <Link
                key={sec.slug}
                href={`/sektorler/${sec.slug === "dis-hekimi" ? "diyetisyen" : sec.slug}`}
                className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800 hover:border-indigo-500/40 hover:bg-slate-850 transition-all group hover:-translate-y-1"
              >
                <div className="text-3xl mb-3">{sec.icon}</div>
                <h3 className="font-bold text-sm text-white group-hover:text-indigo-400 transition-colors">
                  {sec.name}
                </h3>
                <p className="text-[11px] text-slate-400 mt-1">{sec.desc}</p>
              </Link>
            ))}

            <Link
              href="/ornek"
              className="p-5 rounded-3xl bg-gradient-to-br from-indigo-950/60 to-purple-950/40 border border-indigo-500/30 hover:border-indigo-400 transition-all group hover:-translate-y-1 flex flex-col justify-between"
            >
              <div>
                <div className="text-3xl mb-3">✨</div>
                <h3 className="font-bold text-sm text-white group-hover:text-indigo-300 transition-colors">
                  Tüm Canlı Demolar
                </h3>
                <p className="text-[11px] text-slate-300 mt-1">15+ sektörel demoyu canlı test edin.</p>
              </div>
              <span className="text-xs font-bold text-indigo-400 mt-3 inline-flex items-center gap-1">
                İncele →
              </span>
            </Link>
          </div>
        </section>

        {/* Platform Comparison Table */}
        <section className="py-20 px-4 sm:px-6 max-w-5xl mx-auto">
          <div className="text-center mb-12 space-y-3">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              Neden randevuformu.com?
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm">
              Geleneksel yöntemler ve yabancı araçlarla karşılaştırma
            </p>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-xl">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 font-bold border-b border-slate-800 uppercase">
                <tr>
                  <th className="p-4 sm:p-5">Özellikler</th>
                  <th className="p-4 sm:p-5 text-indigo-400 font-black">randevuformu.com</th>
                  <th className="p-4 sm:p-5">Calendly / Cal.com</th>
                  <th className="p-4 sm:p-5">Telefon / Defter</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                <tr>
                  <td className="p-4 sm:p-5 font-semibold text-white">Yerli İyzico Sanal POS & Kapora</td>
                  <td className="p-4 sm:p-5 text-emerald-400 font-bold">✓ Tam Entegre (₺)</td>
                  <td className="p-4 sm:p-5 text-slate-500">✕ Sadece Stripe ($)</td>
                  <td className="p-4 sm:p-5 text-slate-500">✕ Manuel IBAN</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-semibold text-white">WhatsApp & SMS OTP Teyidi</td>
                  <td className="p-4 sm:p-5 text-emerald-400 font-bold">✓ Otomatik</td>
                  <td className="p-4 sm:p-5 text-slate-500">✕ Ek Ücret / Yok</td>
                  <td className="p-4 sm:p-5 text-slate-500">✕ Manuel Arama</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-semibold text-white">Milisaniyelik Çakışma Önleme</td>
                  <td className="p-4 sm:p-5 text-emerald-400 font-bold">✓ %100 Garantili</td>
                  <td className="p-4 sm:p-5 text-amber-400 font-bold">~ Kısmi</td>
                  <td className="p-4 sm:p-5 text-rose-400 font-bold">✕ Sıkça Çakışır</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-semibold text-white">QR Masa Standı & İframe Gömme</td>
                  <td className="p-4 sm:p-5 text-emerald-400 font-bold">✓ Hazır Baskı Şablonu</td>
                  <td className="p-4 sm:p-5 text-slate-500">✕ Stand Yok</td>
                  <td className="p-4 sm:p-5 text-slate-500">✕ Yok</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-semibold text-white">KVKK Mevzuatına Uyum</td>
                  <td className="p-4 sm:p-5 text-emerald-400 font-bold">✓ %100 Türk Hukuku</td>
                  <td className="p-4 sm:p-5 text-slate-500">✕ Sadece GDPR</td>
                  <td className="p-4 sm:p-5 text-slate-500">✕ Riskli</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Interactive FAQ Accordion */}
        <section className="py-20 px-4 sm:px-6 max-w-4xl mx-auto">
          <div className="text-center mb-12 space-y-3">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              Sıkça Sorulan Sorular
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm">
              Aklınıza takılan tüm soruların net yanıtları
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setActiveFaq(isOpen ? null : index)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-white hover:text-indigo-300 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-indigo-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="px-5 pb-5 text-xs text-slate-400 leading-relaxed border-t border-slate-800/60 pt-3"
                      >
                        {faq.a}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </section>

        {/* Quick Links Banner */}
        <section className="py-12 px-4 sm:px-6 max-w-7xl mx-auto">
          <div className="p-8 rounded-3xl bg-gradient-to-r from-indigo-950/70 via-purple-950/50 to-slate-900 border border-indigo-500/25 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">Platformun Tüm Bölümlerini Keşfedin</h3>
              <p className="text-slate-400 text-xs sm:text-sm">
                Aşağıdaki bağlantılar ile yönetim panellerine ve şablonlara doğrudan erişebilirsiniz.
              </p>
            </div>
            <div className="flex flex-wrap gap-2.5">
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
                href="/qr-stand"
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-all flex items-center gap-1.5"
              >
                🖨️ QR Stand
              </Link>
              <Link
                href="/settings"
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-all flex items-center gap-1.5"
              >
                ⚙️ Entegrasyonlar
              </Link>
              <Link
                href="/contact"
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white transition-all flex items-center gap-1.5 shadow-md"
              >
                ✉️ İletişim & B2B
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
      <footer className="bg-[#05080E] border-t border-white/10 py-12 px-4 sm:px-6 mt-16">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 text-white p-2.5 rounded-2xl shadow-lg shadow-indigo-600/30">
                <CalendarDays className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-lg text-white">randevuformu.com</span>
                <p className="text-xs text-slate-400">Yeni Nesil Akıllı Randevu Yönetim Platformu</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10">
              <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
              <div className="text-xs">
                <span className="text-slate-400">Resmi İletişim & Destek: </span>
                <a
                  href="mailto:randevuformuu@gmail.com"
                  className="font-bold text-indigo-300 hover:text-white underline ml-1"
                >
                  randevuformuu@gmail.com
                </a>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-6 text-xs text-slate-400">
            <div className="flex flex-wrap items-center gap-5">
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
              <Link href="/blog" className="hover:text-white transition-colors">
                Blog & Rehber
              </Link>
              <Link href="/qr-stand" className="hover:text-white transition-colors">
                QR Stand
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
