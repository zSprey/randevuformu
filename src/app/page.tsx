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
  Award,
  Globe,
  Stethoscope,
  Apple,
  Dog,
  Scale,
  Scissors,
  Brain,
  Activity,
  Settings,
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
      name: "İlk Muayene & Panoramik Röntgen",
      duration: "30 Dakika",
      badge: "Klinik İçi",
      price: "₺1.000",
      highlight: true,
    },
    {
      id: "bleach",
      name: "Ortodonti & Şeffaf Plak Analizi",
      duration: "45 Dakika",
      badge: "Uzman Hekim",
      price: "₺1.500",
      highlight: false,
    },
    {
      id: "smile",
      name: "Estetik Gülüş & Dijital Tarama",
      duration: "45 Dakika",
      badge: "3D Dijital",
      price: "₺2.000",
      highlight: false,
    },
    {
      id: "zircon",
      name: "Zirkonyum Kaplama Ön Konsültasyonu",
      duration: "30 Dakika",
      badge: "Planlama",
      price: "₺1.200",
      highlight: false,
    },
  ];

  const currentServiceObj = servicesData.find((s) => s.id === selectedService) || servicesData[0];

  const faqs = [
    {
      q: "Calendly veya Cal.com yerine neden randevuformu.com tercih edilmeli?",
      a: "randevuformu.com, Türkiye'deki işletmelerin ihtiyaçlarına tam uyumlu geliştirilmiştir. İyzico altyapısıyla kredi kartı ve kapora tahsilatı, Netgsm ile SMS OTP teyidi, WhatsApp API entegrasyonu, Türkçe zaman dilimi ve 6698 Sayılı KVKK veri mevzuatına tam uyum sunar.",
    },
    {
      q: "Randevu çakışması (çifte rezervasyon) nasıl engelleniyor?",
      a: "Atomik concurrency kilidi algoritmamız sayesinde iki danışan aynı saniye içinde aynı uzmana veya koltuğa randevu oluşturmaya çalışsa dahi milisaniyelik kilit devreye girer. Ayrıca Google ve Outlook Takviminizdeki kişisel etkinlikler taranarak meşgul saatler otomatik bloke edilir.",
    },
    {
      q: "Başlamak için kurulum veya kredi kartı gerekiyor mu?",
      a: "Hayır. 30 saniye içinde hesabınızı oluşturabilir, randevu linkinizi web sitenize veya Instagram biyografinize ekleyerek hemen rezervasyon kabul etmeye başlayabilirsiniz.",
    },
  ];

  const sectors = [
    { name: "Diş Hekimi", slug: "dis-hekimi", icon: Stethoscope, desc: "Konsültasyon, cerrahi & estetik" },
    { name: "Diyetisyen", slug: "diyetisyen", icon: Apple, desc: "Online seans & kilo yönetimi" },
    { name: "Veteriner", slug: "veteriner", icon: Dog, desc: "Aşı, muayene & cerrahi operasyon" },
    { name: "Hukuk & Avukat", slug: "avukat", icon: Scale, desc: "Müvekkil görüşmeleri & danışmanlık" },
    { name: "Kuaför & Stüdyo", slug: "kuafor", icon: Scissors, desc: "Personel ve koltuk rezervasyonu" },
    { name: "Psikolog & Terapi", slug: "psikolog", icon: Brain, desc: "Bireysel terapi & Google Meet" },
    { name: "Fizyoterapist", slug: "fizyoterapist", icon: Activity, desc: "Manuel terapi & rehabilitasyon" },
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
      <div className="bg-[#0B0F17] border-b border-slate-800/80 py-2 px-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2 relative z-50">
        <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
        <span className="hidden sm:inline text-slate-300">Kurumsal B2B Entegrasyon & Özel Yazılım Çözümleri:</span>
        <span className="sm:hidden text-slate-300">Kurumsal İletişim:</span>
        <a
          href="mailto:randevuformuu@gmail.com"
          className="text-slate-200 font-medium hover:text-white underline underline-offset-4 flex items-center gap-1 transition-colors"
        >
          <Mail className="w-3.5 h-3.5 text-slate-400" />
          randevuformuu@gmail.com
        </a>
      </div>

      {/* Modern High-End Navbar */}
      <header className="sticky top-0 w-full z-50 bg-[#080C14]/90 backdrop-blur-xl border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-white text-slate-950 flex items-center justify-center shadow-sm">
              <CalendarDays className="w-5 h-5 text-slate-950" />
            </div>
            <span className="font-bold text-lg tracking-tight text-white">
              randevuformu<span className="text-slate-400 font-normal">.com</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-medium text-slate-300">
            <Link
              href="/kesfet"
              className="hover:text-white transition-colors flex items-center gap-1.5"
            >
              <span>Uzman Dizini</span>
              <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-slate-800 text-slate-300 rounded border border-slate-700">
                Pazar Yeri
              </span>
            </Link>
            <Link
              href="/ornek"
              className="hover:text-white transition-colors flex items-center gap-1.5"
            >
              <span>Örnek Şablonlar</span>
              <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-slate-800 text-slate-300 rounded border border-slate-700">
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
          </nav>

          {/* Desktop CTA & Mobile Hamburger Trigger */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden sm:inline-flex text-xs font-medium text-slate-300 hover:text-white transition-colors px-3 py-2"
            >
              Giriş Yap
            </Link>
            <Link
              href="/login"
              className="text-xs font-semibold bg-white text-slate-950 px-4 py-2 rounded-xl hover:bg-slate-200 transition-colors shadow-sm"
            >
              Ücretsiz Başla
            </Link>

            {/* Mobile Hamburger Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors"
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
              transition={{ duration: 0.2 }}
              className="lg:hidden bg-[#0B0F17] border-b border-slate-800 px-4 py-6 space-y-4 overflow-hidden"
            >
              <nav className="grid grid-cols-2 gap-2 text-xs font-medium text-slate-300">
                <Link
                  href="/ornek"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 flex items-center justify-between"
                >
                  <span>Örnek Şablonlar</span>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-semibold">
                    Demo
                  </span>
                </Link>
                <Link
                  href="/calendar"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>Takvim Paneli</span>
                </Link>
                <Link
                  href="/staff"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 flex items-center gap-2"
                >
                  <Users className="w-4 h-4 text-slate-400" />
                  <span>Ekip Yönetimi</span>
                </Link>
                <Link
                  href="/forms"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 flex items-center gap-2"
                >
                  <FileText className="w-4 h-4 text-slate-400" />
                  <span>Form Oluşturucu</span>
                </Link>
                <Link
                  href="/qr-stand"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 flex items-center gap-2"
                >
                  <QrCode className="w-4 h-4 text-slate-400" />
                  <span>QR Stand & Widget</span>
                </Link>
                <Link
                  href="/blog"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 flex items-center gap-2"
                >
                  <BookOpen className="w-4 h-4 text-slate-400" />
                  <span>Blog & Rehber</span>
                </Link>
                <Link
                  href="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 flex items-center gap-2"
                >
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span>B2B İletişim</span>
                </Link>
              </nav>

              <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3 rounded-xl bg-white text-slate-950 font-semibold text-xs text-center shadow-sm"
                >
                  Ücretsiz Giriş Yap / Hesap Aç
                </Link>
                <a
                  href="mailto:randevuformuu@gmail.com"
                  className="text-center text-xs text-slate-400 hover:text-white py-1"
                >
                  Destek: randevuformuu@gmail.com
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Modern Restrained Hero Section */}
        <section className="relative pt-16 sm:pt-24 pb-20 px-4 sm:px-6 overflow-hidden">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs font-medium mb-6"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
              <span>Türkiye&apos;nin Yeni Nesil Rezervasyon Altyapısı</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-[1.15] mb-6"
            >
              Modern işletmeler için akıllı randevu ve danışan yönetim altyapısı.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="text-sm sm:text-lg text-slate-400 max-w-2xl mx-auto mb-8 font-normal leading-relaxed"
            >
              Telefon trafiğine ve çifte rezervasyon karmaşasına son verin. Danışanlarınız web sitenizden veya WhatsApp üzerinden saniyeler içinde randevu alsın; takvimleriniz, SMS bildirimleri ve hatırlatmalar kusursuz senkronize kalsın.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-3"
            >
              <Link
                href="/login"
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-slate-950 px-6 py-3.5 rounded-xl font-medium text-sm hover:bg-slate-200 transition-colors shadow-sm"
              >
                Ücretsiz Hesap Oluştur
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </Link>
              <Link
                href="/ornek"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-medium text-sm text-slate-300 bg-slate-900 border border-slate-800 hover:border-slate-700 hover:text-white transition-colors"
              >
                Canlı Demoyu İncele
              </Link>
            </motion.div>
          </div>

          {/* Interactive Live Hero Booking Widget */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-14 max-w-4xl mx-auto"
          >
            <div className="rounded-2xl bg-[#0B0F17] border border-slate-800 p-6 sm:p-8 shadow-2xl">
              {/* Header of Mockup */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-slate-800 border border-slate-700 text-white font-semibold flex items-center justify-center text-sm shadow-sm">
                    ES
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white text-base">Dr. Emre Sarıkaya</h3>
                      <span className="p-0.5 bg-emerald-500/10 text-emerald-400 rounded" title="Doğrulanmış Klinik">
                        <Check className="w-3 h-3" />
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Ortodonti & Estetik Diş Hekimliği • randevuformu.com/dr-emre
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-3 py-1 rounded-full font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Müsait Saatler Canlı
                </div>
              </div>

              {/* Body of Interactive Widget */}
              <div className="grid md:grid-cols-12 gap-6 mt-6">
                {/* Left Column: Services Selection */}
                <div className="md:col-span-6 space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    1. Hizmet Seçimi
                  </label>
                  {servicesData.map((svc) => {
                    const isSelected = selectedService === svc.id;
                    return (
                      <div
                        key={svc.id}
                        onClick={() => setSelectedService(svc.id)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? "bg-slate-800/90 border-slate-600 shadow-sm"
                            : "bg-slate-900/50 border-slate-800 hover:border-slate-700"
                        }`}
                      >
                        <div>
                          <div className="font-medium text-white text-sm">{svc.name}</div>
                          <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                            <Clock className="w-3 h-3 text-slate-500" /> {svc.duration} • {svc.badge}
                          </div>
                        </div>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 border border-slate-700">
                          {svc.price}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Right Column: Time Slot Selection */}
                <div className="md:col-span-6 space-y-3 flex flex-col justify-between">
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                      2. Müsait Saat Seçimi
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {["09:30", "11:00", "14:30", "16:00", "17:15", "18:30"].map((time) => {
                        const isSelected = selectedTime === time;
                        return (
                          <button
                            key={time}
                            type="button"
                            onClick={() => setSelectedTime(time)}
                            className={`py-2.5 px-2 text-xs font-medium rounded-xl border transition-all ${
                              isSelected
                                ? "bg-white text-slate-950 border-white shadow-sm"
                                : "bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white"
                            }`}
                          >
                            {time}
                          </button>
                        );
                      })}
                    </div>

                    <div className="p-3.5 mt-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Seçilen İşlem:</span>
                        <span className="font-medium text-white">{currentServiceObj.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Randevu Saati:</span>
                        <span className="font-medium text-slate-200">Bugün {selectedTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Hizmet Bedeli:</span>
                        <span className="font-semibold text-emerald-400">{currentServiceObj.price}</span>
                      </div>
                    </div>
                  </div>

                  <Link
                    href="/ornek/dr-ahmet"
                    className="w-full mt-4 py-3 rounded-xl bg-white text-slate-950 font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 hover:bg-slate-200 transition-colors shadow-sm"
                  >
                    <span>{selectedTime} İçin Randevuyu Tamamla</span>
                    <ChevronRight className="w-4 h-4 text-slate-950" />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Live Reliability Metrics Row */}
        <section className="py-10 border-y border-slate-800 bg-[#070B12]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="p-4">
                <div className="text-2xl sm:text-3xl font-bold text-white font-mono">
                  0 ms
                </div>
                <div className="text-xs text-slate-400 mt-1 font-medium">Çakışma Toleransı (Atomik Kilit)</div>
              </div>
              <div className="p-4">
                <div className="text-2xl sm:text-3xl font-bold text-emerald-400 font-mono">
                  %99.98
                </div>
                <div className="text-xs text-slate-400 mt-1 font-medium">Bulut Çalışma Süresi (SLA)</div>
              </div>
              <div className="p-4">
                <div className="text-2xl sm:text-3xl font-bold text-white font-mono">
                  &lt; 30 sn
                </div>
                <div className="text-xs text-slate-400 mt-1 font-medium">Ortalama Form Kurulum Süresi</div>
              </div>
              <div className="p-4">
                <div className="text-2xl sm:text-3xl font-bold text-indigo-400 font-mono">
                  %100
                </div>
                <div className="text-xs text-slate-400 mt-1 font-medium">KVKK 6698 & GİB E-Fatura Uyumu</div>
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

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-7 rounded-2xl bg-[#0B0F17] border border-slate-800 hover:border-slate-700 transition-colors shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 flex items-center justify-center mb-5">
                <Zap className="w-5 h-5 text-slate-300" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Milisaniyelik Çakışma Koruması</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Aynı saniyede onlarca kişi randevu almaya çalışsa bile atomik concurrency lock mimarimiz çifte rezervasyonu %100 engeller.
              </p>
            </div>

            <div className="p-7 rounded-2xl bg-[#0B0F17] border border-slate-800 hover:border-slate-700 transition-colors shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 flex items-center justify-center mb-5">
                <MessageCircle className="w-5 h-5 text-slate-300" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Otomatik SMS & WhatsApp Teyidi</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Randevu onaylandığında veya ertelendiğinde danışanınıza ve ekibinize anında bildirim, Google Meet linki ve takvim daveti iletilir.
              </p>
            </div>

            <div className="p-7 rounded-2xl bg-[#0B0F17] border border-slate-800 hover:border-slate-700 transition-colors shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 flex items-center justify-center mb-5">
                <Shield className="w-5 h-5 text-slate-300" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Çoklu Uzman & Özel Form Alanları</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Birden fazla hekim veya personeli Round-Robin dağıtımıyla yönetin, danışanlarınızdan almak istediğiniz özel soruları kolayca ekleyin.
              </p>
            </div>
          </div>
        </section>

        {/* Sector Showcase Section */}
        <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto border-t border-slate-800">
          <div className="text-center mb-12 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Her Uzmanlık İçin Hazır Şablonlar
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto">
              Sektörünüze özel yapılandırılmış randevu akışını seçin ve hemen yayına alın.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {sectors.map((sec) => {
              const IconComp = sec.icon;
              return (
                <Link
                  key={sec.slug}
                  href={`/sektorler/${sec.slug === "dis-hekimi" ? "diyetisyen" : sec.slug}`}
                  className="p-5 rounded-2xl bg-[#0B0F17] border border-slate-800 hover:border-slate-700 transition-colors group flex flex-col justify-between"
                >
                  <div>
                    <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-3 group-hover:border-slate-700 transition-colors">
                      <IconComp className="w-4 h-4 text-slate-300" />
                    </div>
                    <h3 className="font-semibold text-sm text-white group-hover:text-white transition-colors">
                      {sec.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1">{sec.desc}</p>
                  </div>
                </Link>
              );
            })}

            <Link
              href="/ornek"
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors group flex flex-col justify-between"
            >
              <div>
                <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-3">
                  <LayoutGrid className="w-4 h-4 text-slate-200" />
                </div>
                <h3 className="font-semibold text-sm text-white transition-colors">
                  Tüm Canlı Şablonlar
                </h3>
                <p className="text-[11px] text-slate-400 mt-1">15+ sektörel demoyu canlı test edin.</p>
              </div>
              <span className="text-xs font-semibold text-slate-300 mt-3 inline-flex items-center gap-1">
                İncele <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
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
          <div className="p-8 rounded-2xl bg-[#0B0F17] border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
            <div>
              <h3 className="text-xl font-bold text-white mb-1.5">Platform Modülleri</h3>
              <p className="text-slate-400 text-xs">
                Yönetim paneline ve entegre araçlara doğrudan erişebilirsiniz.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/calendar"
                className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-medium text-slate-200 transition-colors flex items-center gap-1.5"
              >
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Takvim Paneli
              </Link>
              <Link
                href="/staff"
                className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-medium text-slate-200 transition-colors flex items-center gap-1.5"
              >
                <Users className="w-3.5 h-3.5 text-slate-400" /> Ekip Yönetimi
              </Link>
              <Link
                href="/forms"
                className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-medium text-slate-200 transition-colors flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5 text-slate-400" /> Form Oluşturucu
              </Link>
              <Link
                href="/qr-stand"
                className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-medium text-slate-200 transition-colors flex items-center gap-1.5"
              >
                <QrCode className="w-3.5 h-3.5 text-slate-400" /> QR Stand
              </Link>
              <Link
                href="/settings"
                className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-medium text-slate-200 transition-colors flex items-center gap-1.5"
              >
                <Settings className="w-3.5 h-3.5 text-slate-400" /> Ayarlar
              </Link>
              <Link
                href="/contact"
                className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-medium text-slate-200 transition-colors flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5 text-slate-400" /> İletişim
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
