"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Check,
  ArrowRight,
  Clock,
  Menu,
  X,
  ChevronDown,
  Calendar,
  Stethoscope,
  Apple,
  Scissors,
  Scale,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [previewTab, setPreviewTab] = useState<"client" | "admin">("client");
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const businessNeeds = [
    {
      id: "01",
      badge: "İhtiyaç 1: Kesintisiz İletişim",
      title: "Telefon trafiğini ve randevu kaybını sonlandırın.",
      description:
        "Mesai saatleri dışında gelen randevu taleplerini kaçırmayın. Danışanlarınız web sitenizden veya Instagram profilinizden 7/24 anında randevu alsın; SMS ve WhatsApp onaylarıyla teyit aramalarına gerek kalmasın.",
      features: [
        "Web sitenize veya Instagram biyografinize 1 tıkla entegrasyon",
        "Netgsm ile SMS OTP telefon teyidi",
        "Otomatik WhatsApp randevu onayı ve hatırlatma mesajları",
        "Klinik bekleme odası için QR masa standı desteği",
      ],
      linkText: "Form Oluşturucuyu İncele",
      linkHref: "/forms",
    },
    {
      id: "02",
      badge: "İhtiyaç 2: Takvim Disiplini",
      title: "Sıfır çifte rezervasyon, çift yönlü takvim uyumu.",
      description:
        "Kişisel takviminiz ile randevu ajandanız anlık senkronize çalışsın. Atomik kilit mimarisiyle aynı saniyede gelen talepler dahi çakışma olmadan yönetilir.",
      features: [
        "Google Takvim & Outlook 2 yönlü anlık senkronizasyon",
        "Milisaniyelik atomik slot kilidi (%100 çakışma koruması)",
        "Danışanlar için esnek randevu iptali veya erteleme bağlantısı",
        "Hizmet bazlı tampon süre (mola ve hazırlık payı) ayarı",
      ],
      linkText: "Takvim Modülünü Gör",
      linkHref: "/calendar",
    },
    {
      id: "03",
      badge: "İhtiyaç 3: Tahsilat Güvencesi",
      title: "Gelir kaybını ve 'gelinmeyen randevuları' önleyin.",
      description:
        "Randevuya gelmeyen (no-show) danışanların önüne geçmek için online kapora veya tam ücret tahsil edin. Gelir İdaresi Başkanlığı standartlarında otomatik e-arşiv fatura kesin.",
      features: [
        "İyzico güvenli altyapısıyla kredi kartı ve kapora tahsilatı",
        "Çoklu seans paketleri ve bakiye takip sistemi",
        "GİB UBL-TR uyumlu otomatik E-Arşiv fatura oluşturma",
        "Apple & Google Wallet VIP randevu kartı (Pass) üretimi",
      ],
      linkText: "Paket & Ödeme Altyapısı",
      linkHref: "/packages",
    },
    {
      id: "04",
      badge: "İhtiyaç 4: Ekip ve Danışan CRM",
      title: "Çoklu hekim, uzman ve danışan geçmişi tek panelde.",
      description:
        "Ekibinizdeki uzmanların çalışma saatlerini bağımsız planlayın. Randevuları sıralı (Round-Robin) paylaştırın, danışanlarınızın seans notlarını KVKK uyumlu güvenli arşivde saklayın.",
      features: [
        "Çoklu hekim, koltuk ve uzman yönetimi (Multi-Staff)",
        "Müsaitlik ve iş yükü dengeleme algoritmaları",
        "Danışan profili, önceki randevular ve görüşme notları",
        "4K klinik karşılama ve bekleme salonu canlı TV ekranı",
      ],
      linkText: "Ekip Yönetimini Keşfet",
      linkHref: "/staff",
    },
  ];

  const primarySectors = [
    {
      name: "Diş Hekimi & Klinik",
      slug: "diyetisyen",
      icon: Stethoscope,
      description: "Panoramik analiz, implant ve ortodonti seansları",
    },
    {
      name: "Diyetisyen & Beslenme",
      slug: "diyetisyen",
      icon: Apple,
      description: "Online seans, vücut analizi ve beslenme takibi",
    },
    {
      name: "Kuaför & Güzellik",
      slug: "kuafor",
      icon: Scissors,
      description: "Koltuk ve uzman bazlı kaporalı rezervasyon",
    },
    {
      name: "Hukuk & Avukat",
      slug: "avukat",
      icon: Scale,
      description: "Ön danışmanlık, vekalet ve Google Meet görüşmeleri",
    },
  ];

  const faqs = [
    {
      q: "Calendly veya Cal.com yerine neden randevuformu.com tercih edilmeli?",
      a: "randevuformu.com, Türkiye'deki işletmelerin gerçek ihtiyaçlarına göre tasarlandı. Yerli İyzico sanal POS ile kapora tahsilatı, Netgsm ile SMS OTP doğrulaması, WhatsApp bildirimleri, Türkçe zaman dilimi ve 6698 Sayılı KVKK veri mevzuatına tam uyum sunar.",
    },
    {
      q: "Randevu çakışması (çifte rezervasyon) nasıl engelleniyor?",
      a: "Atomik concurrency kilidi algoritmamız sayesinde iki danışan aynı saniye içinde aynı uzmana veya koltuğa randevu oluşturmaya çalışsa dahi milisaniyelik kilit devreye girer. Ayrıca Google ve Outlook Takviminizdeki kişisel etkinlikler taranarak meşgul saatler otomatik bloke edilir.",
    },
    {
      q: "Başlamak için kurulum veya kredi kartı gerekiyor mu?",
      a: "Hayır. 30 saniye içinde ücretsiz hesabınızı oluşturabilir, randevu linkinizi web sitenize veya Instagram biyografinize ekleyerek hemen rezervasyon kabul etmeye başlayabilirsiniz.",
    },
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
      "Modern işletmeler için WhatsApp bildirimli, SMS teyitli ve takvim entegrasyonlu randevu yönetim platformu.",
    url: "https://randevuformu.com",
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#080C14] text-slate-100 selection:bg-slate-700 selection:text-white font-sans antialiased">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 1. Minimal Top Announcement Bar */}
      <div className="bg-[#0B0F17] border-b border-slate-800/80 py-2 px-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
        <span className="text-slate-300">Türkiye&apos;nin yeni nesil randevu altyapısı</span>
        <span className="text-slate-600">•</span>
        <a
          href="mailto:randevuformuu@gmail.com"
          className="text-slate-300 hover:text-white underline underline-offset-4 transition-colors"
        >
          Kurumsal Destek: randevuformuu@gmail.com
        </a>
      </div>

      {/* 2. Focused, Clean Navigation */}
      <header className="sticky top-0 w-full z-50 bg-[#080C14]/90 backdrop-blur-xl border-b border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white text-slate-950 flex items-center justify-center shadow-sm">
              <CalendarDays className="w-4 h-4 text-slate-950" />
            </div>
            <span className="font-bold text-base tracking-tight text-white">
              randevuformu<span className="text-slate-400 font-normal">.com</span>
            </span>
          </Link>

          {/* Clean 4 Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-slate-300">
            <a href="#ihtiyaclar" className="hover:text-white transition-colors">
              İhtiyaçlar & Çözümler
            </a>
            <a href="#sektorler" className="hover:text-white transition-colors">
              Sektörler
            </a>
            <Link href="/ornek" className="hover:text-white transition-colors">
              Canlı Demolar
            </Link>
            <Link href="/kesfet" className="hover:text-white transition-colors">
              Uzman Dizini
            </Link>
            <Link href="/contact" className="hover:text-white transition-colors">
              İletişim
            </Link>
          </nav>

          {/* Auth Action Buttons */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-medium text-slate-300 hover:text-white transition-colors px-2 py-1.5"
            >
              Giriş Yap
            </Link>
            <Link
              href="/login?mode=signup"
              className="text-xs font-semibold bg-white text-slate-950 px-3.5 py-2 rounded-xl hover:bg-slate-200 transition-colors shadow-sm"
            >
              Ücretsiz Başla
            </Link>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
              aria-label="Menü"
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
              className="md:hidden bg-[#0B0F17] border-b border-slate-800 px-4 py-5 space-y-3 overflow-hidden"
            >
              <nav className="flex flex-col space-y-2 text-xs font-medium text-slate-300">
                <a
                  href="#ihtiyaclar"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-lg bg-slate-900/60 hover:bg-slate-800 transition-colors"
                >
                  İhtiyaçlar & Çözümler
                </a>
                <a
                  href="#sektorler"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-lg bg-slate-900/60 hover:bg-slate-800 transition-colors"
                >
                  Sektörel Şablonlar
                </a>
                <Link
                  href="/ornek"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-lg bg-slate-900/60 hover:bg-slate-800 transition-colors"
                >
                  Canlı Örnek Şablonlar
                </Link>
                <Link
                  href="/kesfet"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-lg bg-slate-900/60 hover:bg-slate-800 transition-colors"
                >
                  Uzman ve Klinik Keşfet
                </Link>
                <Link
                  href="/calendar"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-lg bg-slate-900/60 hover:bg-slate-800 transition-colors"
                >
                  Takvim ve Randevu Paneli
                </Link>
                <Link
                  href="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-lg bg-slate-900/60 hover:bg-slate-800 transition-colors"
                >
                  B2B İletişim
                </Link>
              </nav>
              <div className="pt-2 border-t border-slate-800">
                <Link
                  href="/login?mode=signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full block py-2.5 rounded-xl bg-white text-slate-950 text-xs font-semibold text-center"
                >
                  Ücretsiz Başla
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-1">
        {/* 3. Hero Section (Radical Minimalist & Value-Driven) */}
        <section className="pt-24 pb-16 px-4 sm:px-6 max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-medium text-indigo-400 mb-6 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Yeni Nesil Randevu & Rezervasyon Platformu
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-[1.15]">
            Müşterileriniz Kolayca Randevu Alsın,{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-300 to-indigo-200">
              İşiniz Büyüsün.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed">
            Telefon trafiğine son verin. Danışanlarınıza veya müşterilerinize sadece 30 saniyede randevu alabilecekleri şık, güvenli ve sade bir deneyim sunun.
          </p>

          {/* Quick Action CTA */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
              <Link
                href="/login?mode=signup"
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-slate-950 px-6 py-3 rounded-xl font-medium text-sm hover:bg-slate-200 transition-colors shadow-sm"
              >
                Ücretsiz Hesap Aç
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </Link>
              <Link
                href="/ornek"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium text-sm text-slate-300 bg-slate-900 border border-slate-800 hover:border-slate-700 hover:text-white transition-colors"
              >
                Canlı Şablonları Gör
              </Link>
            </div>
          </div>

          {/* 4. Elegant Interactive Preview Card (Breathing & Informative) */}
          <div className="mt-14 max-w-4xl mx-auto">
            <div className="rounded-2xl bg-[#0B0F17] border border-slate-800 shadow-xl overflow-hidden">
              {/* Card Mode Switcher Tabs */}
              <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-800 bg-slate-900/40">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-700 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-700 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-700 inline-block" />
                </div>
                <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
                  <button
                    type="button"
                    onClick={() => setPreviewTab("client")}
                    className={`px-3 py-1 rounded-lg transition-colors font-medium ${
                      previewTab === "client"
                        ? "bg-slate-800 text-white shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Danışan Deneyimi
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewTab("admin")}
                    className={`px-3 py-1 rounded-lg transition-colors font-medium ${
                      previewTab === "admin"
                        ? "bg-slate-800 text-white shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Klinik & Yönetim Ekranı
                  </button>
                </div>
              </div>

              {/* Tab Content 1: Client Experience Preview */}
              {previewTab === "client" ? (
                <div className="p-6 sm:p-8 grid md:grid-cols-12 gap-6 items-center">
                  <div className="md:col-span-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 text-white font-semibold flex items-center justify-center text-xs">
                        ES
                      </div>
                      <div>
                        <div className="font-semibold text-white text-sm flex items-center gap-1.5">
                          Dr. Emre Sarıkaya
                          <span className="text-emerald-400 text-xs">✓</span>
                        </div>
                        <p className="text-xs text-slate-400">Ortodonti & Diş Hekimliği • Nişantaşı</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center text-xs">
                        <span className="text-white font-medium">İlk Muayene & Dijital Röntgen</span>
                        <span className="text-slate-300 font-semibold">₺1.000</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 flex justify-between items-center text-xs">
                        <span className="text-white font-medium">Şeffaf Plak Analiz Seansı</span>
                        <span className="text-emerald-400 font-semibold">Seçildi</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Bugün müsait saatler: 11:00, 14:30, 16:00</span>
                    </div>
                  </div>

                  <div className="md:col-span-6 bg-slate-900/70 border border-slate-800 p-5 rounded-xl space-y-3">
                    <div className="text-xs font-semibold text-white flex items-center justify-between">
                      <span>Randevu Özeti</span>
                      <span className="text-emerald-400 text-[11px] font-mono">SMS Teyitli</span>
                    </div>
                    <div className="text-xs text-slate-400 space-y-1">
                      <p>Tarih: <span className="text-slate-200">Bugün 14:30</span></p>
                      <p>Konum: <span className="text-slate-200">Klinik İçi (Nişantaşı)</span></p>
                      <p>Hatırlatma: <span className="text-slate-200">1 Gün Önce SMS & WhatsApp</span></p>
                    </div>
                    <Link
                      href="/ornek"
                      className="w-full block py-2.5 rounded-lg bg-white text-slate-950 text-xs font-semibold text-center hover:bg-slate-200 transition-colors"
                    >
                      Canlı Rezervasyon Yapın
                    </Link>
                  </div>
                </div>
              ) : (
                /* Tab Content 2: Business & Admin Overview */
                <div className="p-6 sm:p-8 grid md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="text-xs text-slate-400">Bugünkü Randevular</span>
                    <div className="text-2xl font-bold text-white font-mono">14 Danışan</div>
                    <p className="text-[11px] text-emerald-400">Tamamı SMS ile teyit edildi</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="text-xs text-slate-400">Takvim Senkronizasyonu</span>
                    <div className="text-2xl font-bold text-white font-mono">Google & Outlook</div>
                    <p className="text-[11px] text-slate-400">Çift yönlü aktif (0 ms çakışma)</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="text-xs text-slate-400">Kapora & Tahsilat</span>
                    <div className="text-2xl font-bold text-emerald-400 font-mono">₺28.400</div>
                    <p className="text-[11px] text-slate-400">İyzico korumalı güvence</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 5. Minimal Reliability Row */}
        <section className="py-8 border-y border-slate-800 bg-[#070B12]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-xs">
              <div>
                <div className="text-xl font-bold text-white font-mono">0 ms</div>
                <div className="text-slate-400 mt-0.5">Çakışma Toleransı</div>
              </div>
              <div>
                <div className="text-xl font-bold text-emerald-400 font-mono">%99.98</div>
                <div className="text-slate-400 mt-0.5">Bulut Uptime (SLA)</div>
              </div>
              <div>
                <div className="text-xl font-bold text-white font-mono">&lt; 30 sn</div>
                <div className="text-slate-400 mt-0.5">Form Yayınlama Süresi</div>
              </div>
              <div>
                <div className="text-xl font-bold text-indigo-400 font-mono">%100</div>
                <div className="text-slate-400 mt-0.5">KVKK & GİB Uyumlu</div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. NEED-BASED ARCHITECTURE ("İhtiyaçları Alt Başlıklara Koy") */}
        <section id="ihtiyaclar" className="py-20 px-4 sm:px-6 max-w-6xl mx-auto">
          <div className="text-center mb-14 space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400 text-xs font-medium">
              <span>İşletme Çözümleri</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              İşletmenizin 4 Temel İhtiyacı İçin Tasarlandı
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
              Karmaşık paneller yerine işletmenizin gerçek sorunlarını çözen odaklı modüller.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {businessNeeds.map((need) => (
              <div
                key={need.id}
                className="p-7 rounded-2xl bg-[#0B0F17] border border-slate-800 hover:border-slate-700 transition-colors flex flex-col justify-between"
              >
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase">
                    {need.badge}
                  </span>
                  <h3 className="text-lg font-bold text-white mt-1 mb-2.5">
                    {need.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-5">
                    {need.description}
                  </p>

                  <ul className="space-y-2 mb-6">
                    {need.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-slate-800/80">
                  <Link
                    href={need.linkHref}
                    className="text-xs font-semibold text-slate-300 hover:text-white inline-flex items-center gap-1.5 transition-colors"
                  >
                    <span>{need.linkText}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 7. Streamlined Sectors Section */}
        <section id="sektorler" className="py-16 px-4 sm:px-6 max-w-6xl mx-auto border-t border-slate-800">
          <div className="text-center mb-10 space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Her Uzmanlık İçin Hazır Randevu Şablonları
            </h2>
            <p className="text-xs text-slate-400">
              Sektörünüze özel form alanları, süreler ve fiyatlandırma hazır gelir.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {primarySectors.map((sec, idx) => {
              const Icon = sec.icon;
              return (
                <Link
                  key={idx}
                  href={`/sektorler/${sec.slug}`}
                  className="p-5 rounded-xl bg-[#0B0F17] border border-slate-800 hover:border-slate-700 transition-colors group"
                >
                  <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center mb-3">
                    <Icon className="w-4 h-4 text-slate-300" />
                  </div>
                  <h3 className="text-sm font-semibold text-white group-hover:text-white">
                    {sec.name}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {sec.description}
                  </p>
                </Link>
              );
            })}
          </div>

          <div className="text-center mt-6">
            <Link
              href="/ornek"
              className="text-xs font-semibold text-slate-400 hover:text-white inline-flex items-center gap-1.5 transition-colors"
            >
              <span>15+ Sektörel Canlı Demoyu Gör</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>

        {/* 9. FAQ Accordion */}
        <section className="py-16 px-4 sm:px-6 max-w-3xl mx-auto border-t border-slate-800">
          <div className="text-center mb-8 space-y-1.5">
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Sıkça Sorulan Sorular
            </h2>
            <p className="text-xs text-slate-400">
              Aklınıza takılan soruların yanıtları
            </p>
          </div>

          <div className="space-y-2.5">
            {faqs.map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-xl bg-[#0B0F17] border border-slate-800 overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setActiveFaq(isOpen ? null : index)}
                    className="w-full p-4 text-left flex items-center justify-between gap-4 font-semibold text-xs text-white hover:text-slate-200 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${
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
                        className="px-4 pb-4 text-xs text-slate-400 leading-relaxed border-t border-slate-800/60 pt-2"
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
      </main>

      {/* 10. Clean, Structured 4-Column Footer */}
      <footer className="bg-[#05080E] border-t border-slate-800/80 py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-xs pb-10 border-b border-slate-800/60">
          <div className="space-y-3 col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 font-bold text-white text-sm">
              <div className="w-6 h-6 rounded-lg bg-white text-slate-950 flex items-center justify-center">
                <CalendarDays className="w-3.5 h-3.5 text-slate-950" />
              </div>
              <span>randevuformu.com</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Modern işletmeler için akıllı randevu ve danışan yönetim altyapısı.
            </p>
            <p className="text-slate-500 text-[11px]">
              Destek: <a href="mailto:randevuformuu@gmail.com" className="text-slate-400 hover:text-white underline">randevuformuu@gmail.com</a>
            </p>
          </div>

          <div className="space-y-2.5">
            <span className="font-semibold text-white block">Çözümler</span>
            <ul className="space-y-2 text-slate-400">
              <li><Link href="/forms" className="hover:text-white transition-colors">Form Oluşturucu</Link></li>
              <li><Link href="/calendar" className="hover:text-white transition-colors">Takvim & Randevu</Link></li>
              <li><Link href="/staff" className="hover:text-white transition-colors">Ekip Yönetimi</Link></li>
              <li><Link href="/packages" className="hover:text-white transition-colors">Paket & Seanslar</Link></li>
            </ul>
          </div>

          <div className="space-y-2.5">
            <span className="font-semibold text-white block">Sektörler</span>
            <ul className="space-y-2 text-slate-400">
              <li><Link href="/sektorler/diyetisyen" className="hover:text-white transition-colors">Diş Hekimi</Link></li>
              <li><Link href="/sektorler/diyetisyen" className="hover:text-white transition-colors">Diyetisyen</Link></li>
              <li><Link href="/sektorler/veteriner" className="hover:text-white transition-colors">Veteriner</Link></li>
              <li><Link href="/sektorler/avukat" className="hover:text-white transition-colors">Avukat</Link></li>
            </ul>
          </div>

          <div className="space-y-2.5">
            <span className="font-semibold text-white block">Platform</span>
            <ul className="space-y-2 text-slate-400">
              <li><Link href="/kesfet" className="hover:text-white transition-colors">Uzman Dizini</Link></li>
              <li><Link href="/ornek" className="hover:text-white transition-colors">Canlı Demolar</Link></li>
              <li><Link href="/blog" className="hover:text-white transition-colors">Blog & Rehber</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">B2B İletişim</Link></li>
            </ul>
          </div>
        </div>

        <div className="max-w-6xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} randevuformu.com — Tüm hakları saklıdır.</p>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hover:text-slate-300 transition-colors">Giriş Yap</Link>
            <Link href="/contact" className="hover:text-slate-300 transition-colors">İletişim</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
