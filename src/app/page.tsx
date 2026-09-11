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
  Sparkles,
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
      name: "Berber & Erkek Bakımı",
      slug: "berber",
      icon: Scissors,
      description: "Saç-sakal tıraşı, usta seçimi ve WhatsApp teyidi",
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
      name: "Hukuk & Avukatlık",
      slug: "avukat",
      icon: Briefcase,
      description: "Müvekkil randevuları, danışmanlık ücreti tahsili ve toplantılar",
    },
  ];

  const faqs = [
    {
      q: "RandevuFormu nedir?",
      a: "RandevuFormu, berber, kuaför, güzellik merkezi, diş hekimi, diyetisyen, veteriner ve klinik gibi tüm randevulu hizmet işletmeleri için geliştirilmiş yeni nesil online randevu ve müşteri yönetim sistemidir. İşletmelere kendi markalarına özel subdomain (isletme.randevuformu.com) sağlar.",
    },
    {
      q: "RandevuFormu nasıl çalışır?",
      a: "1) 30 saniyede ücretsiz işletme profilinizi oluşturun. 2) Hizmetlerinizi ve çalışma saatlerinizi ekleyin. 3) Randevu linkinizi Instagram biyografinize veya web sitenize ekleyin. Müşterileriniz 7/24 dilediği saatte randevu alsın, randevular anında Google Takviminize işlensin ve taraflara WhatsApp onayı gitsin.",
    },
    {
      q: "Müşterilerin randevu alırken uygulama indirmesi gerekir mi?",
      a: "Hayır. RandevuFormu tamamen web tabanlıdır. Danışanlarınız herhangi bir mobil uygulama indirmeden veya karmaşık üyelik oluşturmadan doğrudan tarayıcı üzerinden 30 saniyede randevusunu oluşturabilir.",
    },
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
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "@id": "https://randevuformu.com/#software",
        name: "randevuformu.com - Online Randevu Sistemi & Randevu Formu",
        applicationCategory: "BusinessApplication",
        applicationSubCategory: "AppointmentScheduling",
        operatingSystem: "Web, iOS, Android",
        browserRequirements: "Requires JavaScript. Requires HTML5.",
        url: "https://randevuformu.com",
        description:
          "Berber, kuaför, güzellik salonu, diş hekimi ve klinikler için WhatsApp onaylı, çakışma önleyici ücretsiz online randevu formu ve randevu yazılımı.",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "TRY",
          availability: "https://schema.org/InStock",
          description: "Temel randevu formu özellikleri tamamen ücretsizdir.",
        },
        featureList: [
          "Online Randevu Formu",
          "Otomatik WhatsApp ve SMS Hatırlatma",
          "Atomik Çakışma Kilidi (Concurrency Lock)",
          "Google Takvim ve Outlook Senkronizasyonu",
          "Kuaför ve Berber Randevu Programı Altyapısı",
          "İyzico Sanal POS ile Ön Kapora Tahsilatı",
        ],
      },
      {
        "@type": "FAQPage",
        "@id": "https://randevuformu.com/#faq",
        mainEntity: faqs.map((faq) => ({
          "@type": "Question",
          name: faq.q,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.a,
          },
        })),
      },
    ],
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
          HOW IT WORKS & BRAND DEFINITION (SEO REINFORCEMENT)
          ═══════════════════════════════════════ */}
      <section className="bg-slate-50 py-16 sm:py-24 border-t border-slate-200/80">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-[11px] font-bold text-[#0062FF] uppercase tracking-wider bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
              Hızlı Başlangıç Rehberi
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#0F2A4A] tracking-tight mt-4 mb-3">
              RandevuFormu Nedir? Nasıl Çalışır?
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              <strong>RandevuFormu</strong>, Türkiye&apos;deki berber, kuaför, diş hekimi, diyetisyen ve klinikler için geliştirilmiş yeni nesil online randevu ve müşteri rezervasyon altyapısıdır. Telefon trafiğine son verir, randevuları takviminize otomatik işler.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#0062FF]/10 text-[#0062FF] font-black text-lg flex items-center justify-center">
                1
              </div>
              <h3 className="text-base font-bold text-[#0F2A4A]">30 Saniyede Formunuzu Açın</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                İşletme adınızı girerek anında kendinize özel <strong>isletmeadi.randevuformu.com</strong> adresinizi alın. Hizmetlerinizi, işlem sürelerinizi ve fiyatlarınızı belirleyin.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#0062FF]/10 text-[#0062FF] font-black text-lg flex items-center justify-center">
                2
              </div>
              <h3 className="text-base font-bold text-[#0F2A4A]">Instagram &amp; Web Sitenize Ekleyin</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Oluşan randevu linkinizi Instagram biyografinize, Google Haritalar profilinize veya web sitenize ekleyin. Müşterileriniz 7/24 dilediği saatte randevu alsın.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#0062FF]/10 text-[#0062FF] font-black text-lg flex items-center justify-center">
                3
              </div>
              <h3 className="text-base font-bold text-[#0F2A4A]">Otomatik WhatsApp Teyidi &amp; Takvim</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Alınan her randevu Google ve Outlook takviminizle anında senkronize olur. Müşteriye ve size otomatik WhatsApp / SMS onay ve hatırlatma bildirimi gider.
              </p>
            </div>
          </div>
        </div>
      </section>

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
              <span className="text-[#0062FF]">randevu çözümleri.</span>
            </h2>
            <p className="text-base text-slate-500 leading-relaxed">
              Diş kliniğinden kuaföre, diyetisyenden avukata kadar 30&apos;dan fazla sektör
              için optimize edilmiş randevu altyapısı.
            </p>
          </div>

          {/* Her Sektör İçin Randevu AEO & Direct Answer Bilgi Bloğu */}
          <div className="mb-12 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#0F2A4A] via-[#163558] to-[#0A192F] text-white border border-blue-900/40 shadow-lg">
            <div className="flex items-center gap-2 text-blue-300 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Yapay Zeka & Arama Motoru Doğrudan Yanıtı (AEO / GEO)</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold mb-3">
              Her Sektör ve Berberler İçin Online Randevu Sistemi Nasıl Çalışır?
            </h3>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-4xl">
              randevuformu.com; berberler, kuaförler, diş poliklinikleri, güzellik merkezleri, diyetisyenler ve danışmanlar dahil her sektörün 30 saniyede kendi markasına özel online randevu formu kurmasını sağlar. Sistem; usta ve personel seçimi, çift yönlü Google/Outlook Takvim senkronizasyonu, otomatik WhatsApp randevu teyidi ve online kapora/ödeme altyapısını tek çatı altında sunar.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10">
              <div className="bg-white/10 rounded-xl p-3 text-center">
                <div className="text-xs font-bold text-blue-200">30 Saniyede Kurulum</div>
                <div className="text-[11px] text-slate-300 mt-0.5">Kodlama gerektirmez</div>
              </div>
              <div className="bg-white/10 rounded-xl p-3 text-center">
                <div className="text-xs font-bold text-blue-200">%90 No-Show Düşüşü</div>
                <div className="text-[11px] text-slate-300 mt-0.5">WhatsApp teyitli</div>
              </div>
              <div className="bg-white/10 rounded-xl p-3 text-center">
                <div className="text-xs font-bold text-blue-200">Koltuk & Usta Seçimi</div>
                <div className="text-[11px] text-slate-300 mt-0.5">Berber & salon uyumlu</div>
              </div>
              <div className="bg-white/10 rounded-xl p-3 text-center">
                <div className="text-xs font-bold text-blue-200">7/24 Randevu Kabulü</div>
                <div className="text-[11px] text-slate-300 mt-0.5">%65 mesai dışı hacim</div>
              </div>
            </div>
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

          {/* Canlı Berber Referansı — By Erman Subdomain Otorite Kartı */}
          <div className="mt-8 p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Canlı İşletme Örneği
              </div>
              <h4 className="text-base font-bold text-[#0F2A4A]">
                By Erman — Erkek Berberi (Ümraniye, İstanbul)
              </h4>
              <p className="text-xs text-slate-500 max-w-xl">
                By Erman Erkek Berberi için çalışan usta seçimi, hizmet listesi ve WhatsApp onaylı randevu akışını canlı olarak inceleyin.
              </p>
            </div>
            <a
              href="https://byerman.randevuformu.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0062FF] hover:bg-[#0052d9] text-white text-xs font-bold transition-all shadow-xs shrink-0"
            >
              byerman.randevuformu.com <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FAQ SECTION
          ═══════════════════════════════════════ */}
      <section className="bg-[#FAFBFC] py-20 sm:py-28 border-t border-slate-100">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="text-center mb-12">
            <span className="text-[12px] font-semibold text-[#0062FF] uppercase tracking-widest">
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
          CTA BAND — Clean Light Corporate Design
          ═══════════════════════════════════════ */}
      <section className="bg-gradient-to-b from-white to-slate-50/80 py-16 sm:py-24 border-t border-slate-200/90">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#0062FF] bg-blue-50 border border-blue-200/60 px-3 py-1 rounded-full inline-block mb-3.5">
            Hemen Başlayın
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0F2A4A] tracking-[-0.02em] mb-3 leading-tight">
            İşletmenizin Randevu Yönetimini Modernize Edin
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mb-8 max-w-lg mx-auto leading-relaxed">
            30 saniyede ücretsiz randevu formunuzu oluşturun. Kredi kartı gerekmez.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 bg-[#0F2A4A] hover:bg-[#163a66] text-white text-sm font-medium px-7 py-3.5 rounded-xl shadow-xs border border-[#0F2A4A]/10 transition-all duration-150 active:scale-[0.98]"
            >
              Ücretsiz Başlayın
              <ArrowRight className="w-4 h-4" strokeWidth={2} />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center text-sm font-medium text-slate-700 hover:text-[#0F2A4A] px-7 py-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 shadow-xs transition-all duration-150 active:scale-[0.98]"
            >
              Kurumsal İletişim
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FOOTER — Clean Light Corporate Design
          ═══════════════════════════════════════ */}
      <footer className="bg-white border-t border-slate-200/90 py-12 px-4 sm:px-6 text-sm">
        <div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8 pb-8 border-b border-slate-100">
          <div className="space-y-2.5">
            <span className="font-bold text-[#0F2A4A] block text-xs uppercase tracking-wider">Ürün</span>
            <ul className="space-y-2 text-slate-600 text-[13px]">
              <li>
                <Link href="/dashboard" className="hover:text-[#0062FF] transition-colors">
                  Gösterge Paneli
                </Link>
              </li>
              <li>
                <Link href="/calendar" className="hover:text-[#0062FF] transition-colors">
                  Takvim &amp; Randevu
                </Link>
              </li>
              <li>
                <Link href="/staff" className="hover:text-[#0062FF] transition-colors">
                  Ekip Yönetimi
                </Link>
              </li>
              <li>
                <Link href="/qr-stand" className="hover:text-[#0062FF] transition-colors">
                  QR Stand &amp; Masa Kartı
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-2.5">
            <span className="font-bold text-[#0F2A4A] block text-xs uppercase tracking-wider">Sektörler</span>
            <ul className="space-y-2 text-slate-600 text-[13px]">
              <li>
                <Link href="/sektorler/dis-hekimi" className="hover:text-[#0062FF] transition-colors">
                  Diş Hekimi
                </Link>
              </li>
              <li>
                <Link href="/sektorler/diyetisyen" className="hover:text-[#0062FF] transition-colors">
                  Diyetisyen
                </Link>
              </li>
              <li>
                <Link href="/sektorler/kuafor" className="hover:text-[#0062FF] transition-colors">
                  Kuaför &amp; Güzellik
                </Link>
              </li>
              <li>
                <Link href="/sektorler/veteriner" className="hover:text-[#0062FF] transition-colors">
                  Veteriner
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-2.5">
            <span className="font-bold text-[#0F2A4A] block text-xs uppercase tracking-wider">Platform</span>
            <ul className="space-y-2 text-slate-600 text-[13px]">
              <li>
                <Link href="/ornek" className="hover:text-[#0062FF] transition-colors">
                  Canlı Demolar
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-[#0062FF] transition-colors">
                  Blog &amp; Rehber
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#0062FF] transition-colors">
                  B2B İletişim
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-2.5">
            <span className="font-bold text-[#0F2A4A] block text-xs uppercase tracking-wider">Kurumsal &amp; Hukuk</span>
            <ul className="space-y-2 text-slate-600 text-[13px]">
              <li>
                <Link href="/kvkk" className="hover:text-[#0062FF] transition-colors font-medium">
                  KVKK Aydınlatma Metni
                </Link>
              </li>
              <li>
                <Link href="/gizlilik" className="hover:text-[#0062FF] transition-colors">
                  Gizlilik ve Çerez Politikası
                </Link>
              </li>
              <li>
                <Link href="/kullanim-kosullari" className="hover:text-[#0062FF] transition-colors">
                  Kullanım Koşulları
                </Link>
              </li>
              <li>
                <a href="mailto:destek@randevuformu.com" className="hover:text-[#0062FF] transition-colors">
                  destek@randevuformu.com
                </a>
              </li>
              <li>
                <Link href="/login" className="hover:text-[#0062FF] transition-colors">
                  Giriş Yap
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-6xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[12px] text-slate-500">
          <p>&copy; {new Date().getFullYear()} randevuformu.com — Tüm hakları saklıdır.</p>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[12px]">
            <Link href="/kvkk" className="hover:text-[#0062FF] transition-colors font-medium">
              KVKK Metni
            </Link>
            <Link href="/gizlilik" className="hover:text-[#0062FF] transition-colors">
              Gizlilik Politikası
            </Link>
            <Link href="/kullanim-kosullari" className="hover:text-[#0062FF] transition-colors">
              Kullanım Koşulları
            </Link>
            <Link href="/contact" className="hover:text-[#0062FF] transition-colors">
              İletişim
            </Link>
          </div>
        </div>
      </footer>

      {/* Platform Danışman AI Chatbot */}
      <ChatbotWidget mode="platform" />
    </div>
  );
}
