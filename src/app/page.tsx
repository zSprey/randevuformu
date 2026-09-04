"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Stethoscope,
  Apple,
  Scissors,
  Scale,
  ChevronDown,
  ArrowRight,
  Briefcase,
  Heart,
  Dog,
  Dumbbell,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import ChatbotWidget from "@/components/ChatbotWidget";

export default function Home() {
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const primarySectors = [
    {
      name: "Diş Hekimi & Klinik",
      slug: "dis-hekimi",
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
    {
      name: "Psikoloji & Terapi",
      slug: "psikolog",
      icon: Heart,
      description: "KVKK uyumlu gizli seans takvimi ve tampon süreler",
    },
    {
      name: "Veteriner Klinik",
      slug: "veteriner",
      icon: Dog,
      description: "Periyodik aşı takibi ve otomatik randevu hatırlatma",
    },
    {
      name: "Fizyoterapi & Pilates",
      slug: "fizyoterapist",
      icon: Dumbbell,
      description: "Seans paketleri ve değişken süreli randevu yönetimi",
    },
    {
      name: "Danışmanlık & Koçluk",
      slug: "avukat",
      icon: Briefcase,
      description: "Ücretli ön görüşme, online toplantı entegrasyonu",
    },
  ];

  const faqs = [
    {
      q: "randevuformu.com işletmeme ne tür kolaylıklar sağlar?",
      a: "Telefon trafiğinizi sonlandırır. Müşterileriniz web sitenizden veya Instagram biyografinizden 7/24 anında randevu alabilir, randevular SMS ve WhatsApp ile doğrulanır, Google ve Outlook takviminizle çakışmasız senkronize çalışır.",
    },
    {
      q: "Randevu çakışması (çifte rezervasyon) nasıl engelleniyor?",
      a: "Atomik concurrency kilidi algoritmamız sayesinde iki danışan aynı saniye içinde aynı uzmana veya koltuğa randevu oluşturmaya çalışsa dahi milisaniyelik kilit devreye girer. Ayrıca Google ve Outlook Takviminizdeki kişisel etkinlikler taranarak meşgul saatler otomatik bloke edilir.",
    },
    {
      q: "Başlamak için kurulum veya kredi kartı gerekiyor mu?",
      a: "Hayır. 30 saniye içinde ücretsiz hesabınızı oluşturabilir, randevu linkinizi web sitenize veya Instagram biyografinize ekleyerek hemen rezervasyon kabul etmeye başlayabilirsiniz.",
    },
    {
      q: "Verilerim güvende mi? KVKK uyumlu mu?",
      a: "Evet. Tüm danışan verileri şifreli biçimde saklanır, KVKK (6698 sayılı kanun) gereksinimleri karşılanır. Sağlık sektörü müşterilerimiz için medikal geçmiş bilgileri ek güvenlik katmanlarıyla korunur.",
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
    <div className="min-h-screen flex flex-col bg-[#FAFBFC] text-[#0F172A] font-sans antialiased">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── Navbar ── */}
      <Navbar />

      {/* ── Hero ── */}
      <Hero />

      {/* ── Features Bento Grid ── */}
      <Features />

      {/* ═══════════════════════════════════════
          SECTORS GRID
          ═══════════════════════════════════════ */}
      <section id="sektorler" className="bg-white py-20 sm:py-28 border-t border-slate-100">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-[12px] font-semibold text-[#0062FF] uppercase tracking-widest">
              Sektörler
            </span>
            <h2 className="text-3xl sm:text-[2.5rem] font-bold text-[#0F2A4A] tracking-[-0.03em] mt-3 mb-4 leading-tight">
              Her sektöre özel
              <br />
              <span className="text-[#00BCD4]">randevu çözümleri.</span>
            </h2>
            <p className="text-base text-slate-500 leading-relaxed">
              Diş kliniğinden kuaföre, diyetisyenden avukata kadar 30&apos;dan fazla sektör
              için optimize edilmiş randevu altyapısı.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {primarySectors.map((sector) => (
              <Link
                key={sector.slug + sector.name}
                href={`/sektorler/${sector.slug}`}
                className="group bg-white border border-slate-200/80 rounded-xl p-5 hover:border-[#0062FF]/30 hover:shadow-md transition-all duration-200 text-center"
              >
                <div className="w-12 h-12 mx-auto rounded-lg bg-[#0F2A4A]/[0.06] flex items-center justify-center mb-3 group-hover:bg-[#0062FF]/[0.08] transition-colors">
                  <sector.icon
                    className="w-5 h-5 text-[#0F2A4A] group-hover:text-[#0062FF] transition-colors"
                    strokeWidth={1.75}
                  />
                </div>
                <h3 className="text-[13px] font-semibold text-[#0F2A4A] mb-1">
                  {sector.name}
                </h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {sector.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FAQ SECTION
          ═══════════════════════════════════════ */}
      <section className="bg-[#FAFBFC] py-20 sm:py-28 border-t border-slate-100">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="text-center mb-12">
            <span className="text-[12px] font-semibold text-[#00BCD4] uppercase tracking-widest">
              SSS
            </span>
            <h2 className="text-3xl sm:text-[2.5rem] font-bold text-[#0F2A4A] tracking-[-0.03em] mt-3 leading-tight">
              Sıkça sorulan sorular.
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-white border border-slate-200/80 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                >
                  <span className="text-[14px] font-medium text-[#0F2A4A] pr-4">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                      activeFaq === i ? "rotate-180" : ""
                    }`}
                    strokeWidth={2}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {activeFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-4 text-[13px] text-slate-500 leading-relaxed">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          CTA BAND
          ═══════════════════════════════════════ */}
      <section className="bg-[#0F2A4A] py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-[-0.02em] mb-4">
            İşletmenizin randevu yönetimini modernize edin.
          </h2>
          <p className="text-sm text-slate-300 mb-8 max-w-lg mx-auto leading-relaxed">
            30 saniyede ücretsiz randevu formunuzu oluşturun. Kredi kartı gerekmez.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 bg-[#00BCD4] hover:bg-[#00acc1] text-white text-sm font-medium px-6 py-3 rounded-lg shadow-sm transition-all duration-150 active:scale-[0.98]"
            >
              Ücretsiz Başlayın
              <ArrowRight className="w-4 h-4" strokeWidth={2} />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center text-sm font-medium text-slate-300 hover:text-white px-6 py-3 rounded-lg border border-slate-600 hover:border-slate-400 transition-all duration-150"
            >
              Kurumsal İletişim
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FOOTER
          ═══════════════════════════════════════ */}
      <footer className="bg-[#0F2A4A] border-t border-slate-700/30 py-12 px-4 sm:px-6 text-sm">
        <div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8 pb-8 border-b border-slate-700/30">
          <div className="space-y-2.5">
            <span className="font-semibold text-white block text-[13px]">Ürün</span>
            <ul className="space-y-2 text-slate-400 text-[13px]">
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">
                  Gösterge Paneli
                </Link>
              </li>
              <li>
                <Link href="/calendar" className="hover:text-white transition-colors">
                  Takvim & Randevu
                </Link>
              </li>
              <li>
                <Link href="/staff" className="hover:text-white transition-colors">
                  Ekip Yönetimi
                </Link>
              </li>
              <li>
                <Link href="/forms" className="hover:text-white transition-colors">
                  Form Oluşturucu
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-2.5">
            <span className="font-semibold text-white block text-[13px]">Sektörler</span>
            <ul className="space-y-2 text-slate-400 text-[13px]">
              <li>
                <Link href="/sektorler/dis-hekimi" className="hover:text-white transition-colors">
                  Diş Hekimi
                </Link>
              </li>
              <li>
                <Link href="/sektorler/diyetisyen" className="hover:text-white transition-colors">
                  Diyetisyen
                </Link>
              </li>
              <li>
                <Link href="/sektorler/kuafor" className="hover:text-white transition-colors">
                  Kuaför & Güzellik
                </Link>
              </li>
              <li>
                <Link href="/sektorler/veteriner" className="hover:text-white transition-colors">
                  Veteriner
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-2.5">
            <span className="font-semibold text-white block text-[13px]">Platform</span>
            <ul className="space-y-2 text-slate-400 text-[13px]">
              <li>
                <Link href="/kesfet" className="hover:text-white transition-colors">
                  Uzman Dizini
                </Link>
              </li>
              <li>
                <Link href="/ornek" className="hover:text-white transition-colors">
                  Canlı Demolar
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-white transition-colors">
                  Blog & Rehber
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  B2B İletişim
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-2.5">
            <span className="font-semibold text-white block text-[13px]">Şirket</span>
            <ul className="space-y-2 text-slate-400 text-[13px]">
              <li>
                <a href="mailto:destek@randevuformu.com" className="hover:text-white transition-colors">
                  destek@randevuformu.com
                </a>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Giriş Yap
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-6xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[12px] text-slate-500">
          <p>&copy; {new Date().getFullYear()} randevuformu.com — Tüm hakları saklıdır.</p>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hover:text-slate-300 transition-colors">
              Giriş Yap
            </Link>
            <Link href="/contact" className="hover:text-slate-300 transition-colors">
              İletişim
            </Link>
          </div>
        </div>
      </footer>

      {/* Müşteri AI Chatbot Asistanı */}
      <ChatbotWidget mode="customer" />
    </div>
  );
}
