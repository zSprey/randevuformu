"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Check,
  X,
  Minus,
  Sparkles,
  ArrowRight,
  Info,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ComparisonItem {
  id: string;
  category: "payment" | "communication" | "legal" | "calendar" | "cost";
  title: string;
  subtitle: string;
  whyItMatters: string;
  randevuformu: {
    status: "yes" | "partial" | "no";
    text: string;
    badge?: string;
  };
  calendly: {
    status: "yes" | "partial" | "no";
    text: string;
  };
  calcom: {
    status: "yes" | "partial" | "no";
    text: string;
  };
}

const COMPARISON_DATA: ComparisonItem[] = [
  {
    id: "pos",
    category: "payment",
    title: "Yerli Sanal POS & Kredi Kartı Altyapısı",
    subtitle: "İyzico, PayTR ve Paratika doğrudan entegrasyonu",
    whyItMatters: "Yurt içi debit ve kredi kartlarında Stripe kullanılamaz veya yüksek 3D Secure ret oranlarına yol açar. Yerli POS doğrudan TL tahsilatı sağlar.",
    randevuformu: {
      status: "yes",
      text: "İyzico, PayTR & Paratika (₺)",
      badge: "Doğrudan TL",
    },
    calendly: {
      status: "no",
      text: "Sadece Stripe & PayPal ($/€)",
    },
    calcom: {
      status: "no",
      text: "Sadece Stripe ($/€)",
    },
  },
  {
    id: "deposit",
    category: "payment",
    title: "Online Kapora & Rezervasyon Ön Ödemesi",
    subtitle: "Kısmi kapora tutarı tahsil ederek no-show iptallerini önleme",
    whyItMatters: "Özellikle klinik ve güzellik merkezlerinde randevuya gelmeyen müşteriler için tam seans ücreti yerine ₺200-₺500 gibi kapora almak iptal oranını %80 azaltır.",
    randevuformu: {
      status: "yes",
      text: "Esnek Kapora veya Tam Ücret",
      badge: "İptal Önleyici",
    },
    calendly: {
      status: "partial",
      text: "Yalnızca Tam Ücret (Kapora yok)",
    },
    calcom: {
      status: "partial",
      text: "Yalnızca Tam Ücret Tahsilatı",
    },
  },
  {
    id: "invoice",
    category: "payment",
    title: "GİB Uyumlu Otomatik E-Arşiv Fatura",
    subtitle: "Gelir İdaresi Başkanlığı UBL-TR XML standartlarında fatura kesimi",
    whyItMatters: "Randevu tamamlandığında veya ödeme alındığında muhasebenize doğrudan entegre yasal e-arşiv faturası otomatik üretilir.",
    randevuformu: {
      status: "yes",
      text: "GİB UBL-TR Otomatik E-Arşiv",
      badge: "%100 Yasal",
    },
    calendly: {
      status: "no",
      text: "Türkiye Vergi Entegrasyonu Yok",
    },
    calcom: {
      status: "no",
      text: "Türkiye Vergi Entegrasyonu Yok",
    },
  },
  {
    id: "sms-otp",
    category: "communication",
    title: "Yerli SMS Gateway ile OTP Telefon Doğrulama",
    subtitle: "Netgsm & İletiMerkezi ile başlıklı SMS ve doğrulama kodu",
    whyItMatters: "Sahte veya geçersiz numaralarla randevu alınmasını engeller. Yabancı araçlardaki Twilio SMS Türkiye GSM operatörlerinde BTK regülasyonları nedeniyle engellenebilir.",
    randevuformu: {
      status: "yes",
      text: "Netgsm / İletiMerkezi (TR Başlıklı)",
      badge: "BTK Onaylı",
    },
    calendly: {
      status: "no",
      text: "Twilio ile Ek Fatura ($/SMS)",
    },
    calcom: {
      status: "no",
      text: "Twilio ile Ek Fatura ($/SMS)",
    },
  },
  {
    id: "whatsapp",
    category: "communication",
    title: "WhatsApp Randevu Onayı ve Akıllı Hatırlatma",
    subtitle: "Randevu öncesi 24 saat ve 2 saat kala otomatik WhatsApp mesajı",
    whyItMatters: "Türkiye pazarında danışanların %94'ü e-posta yerine WhatsApp bildirimlerine yanıt verir. Telefon teyit aramalarını tamamen ortadan kaldırır.",
    randevuformu: {
      status: "yes",
      text: "Otomatik Çift Yönlü WhatsApp",
      badge: "Yüksek Teyit",
    },
    calendly: {
      status: "no",
      text: "Yok (Zapier ile ek lisans ücreti)",
    },
    calcom: {
      status: "partial",
      text: "Ek Ücretli Webhook / API Kurulumu",
    },
  },
  {
    id: "tv-board",
    category: "communication",
    title: "4K Bekleme Salonu Canlı TV Sıra Ekranı",
    subtitle: "Klinik bekleme odasında danışan isimlerini KVKK maskeli gösteren ekran",
    whyItMatters: "Fiziksel klinik ve ofislerde resepsiyon yükünü hafifletir, danışanın oda numarasını ve sırasını TV ekranından takip etmesini sağlar.",
    randevuformu: {
      status: "yes",
      text: "Canlı 4K TV Ekranı (/tv/[slug])",
      badge: "Klinik OS",
    },
    calendly: {
      status: "no",
      text: "Fiziksel Ekran Desteği Yok",
    },
    calcom: {
      status: "no",
      text: "Fiziksel Ekran Desteği Yok",
    },
  },
  {
    id: "kvkk",
    category: "legal",
    title: "6698 Sayılı KVKK ve Yerel Veri Mevzuatı",
    subtitle: "Sağlık ve kişisel verilerin Türkiye veri merkezlerinde saklanması",
    whyItMatters: "Diş hekimliği, klinik ve hukuk bürolarında danışan verilerinin yurt dışı sunucularda tutulması KVKK kapsamında ağır idari para cezası riskine gebedir.",
    randevuformu: {
      status: "yes",
      text: "%100 KVKK 6698 & Türkiye Sunucuları",
      badge: "Sıfır Risk",
    },
    calendly: {
      status: "partial",
      text: "Yalnızca AB GDPR / ABD AWS Cloud",
    },
    calcom: {
      status: "partial",
      text: "Yalnızca AB GDPR / ABD Sunucuları",
    },
  },
  {
    id: "concurrency",
    category: "calendar",
    title: "0 ms Atomik Kilit ile Çakışma Önleme",
    subtitle: "Aynı saniyede gelen taleplerde çifte rezervasyonu kesin bloklama",
    whyItMatters: "Özellikle popüler hekimlerde ve reklam kampanyalarında aynı slot için birden fazla ödeme veya randevu oluşmasını milisaniyelik kilit engeller.",
    randevuformu: {
      status: "yes",
      text: "Atomik Slot Concurrency Kilidi",
      badge: "0 ms Tolerans",
    },
    calendly: {
      status: "partial",
      text: "Periyodik Kontrol (Çakışma Yaşanabilir)",
    },
    calcom: {
      status: "partial",
      text: "Veritabanı Kilidi (Trafikte Gecikmeli)",
    },
  },
  {
    id: "wallet",
    category: "calendar",
    title: "Apple & Google Wallet Dijital VIP Randevu Kartı",
    subtitle: "Danışanın telefon cüzdanına konuma duyarlı bilet ekleme",
    whyItMatters: "Danışan kliniğe yaklaştığında telefon kilit ekranında randevu saati ve adresi otomatik belirir.",
    randevuformu: {
      status: "yes",
      text: "Dinamik .pkpass Dijital Cüzdan Kartı",
      badge: "Mobil Cüzdan",
    },
    calendly: {
      status: "no",
      text: "Cüzdan Kartı Desteği Yok",
    },
    calcom: {
      status: "no",
      text: "Cüzdan Kartı Desteği Yok",
    },
  },
  {
    id: "currency",
    category: "cost",
    title: "Yerel Para Birimi (₺) & Kur Riskinden Korunma",
    subtitle: "Dolar kuru dalgalanmalarından etkilenmeyen sabit maliyet",
    whyItMatters: "Calendly ve Cal.com kullanıcı başı aylık 15 USD talep eder (5 kişilik bir ekip için aylık ~₺3.000+ KDV). Kur arttıkça maliyetiniz katlanır.",
    randevuformu: {
      status: "yes",
      text: "Sabit Türk Lirası (₺)",
      badge: "%70 Avantaj",
    },
    calendly: {
      status: "no",
      text: "$12 - $16 / kullanıcı / ay",
    },
    calcom: {
      status: "no",
      text: "$15 / kullanıcı / ay",
    },
  },
  {
    id: "support",
    category: "cost",
    title: "Türkçe B2B Teknik Destek & Hızlı Yanıt",
    subtitle: "WhatsApp ve telefon üzerinden yerli mühendislik desteği",
    whyItMatters: "Kritik randevu saatlerinde veya ödeme aksaklıklarında yabancı saat dilimlerindeki e-posta desteklerine günlerce beklemek zorunda kalmazsınız.",
    randevuformu: {
      status: "yes",
      text: "7/24 Türkçe Teknik Destek & Çağrı",
      badge: "Doğrudan Ekip",
    },
    calendly: {
      status: "no",
      text: "Yalnızca İngilizce E-Posta / Bilet",
    },
    calcom: {
      status: "no",
      text: "Topluluk Formu / İngilizce Doküman",
    },
  },
];

const CATEGORIES = [
  { id: "all", label: "Tüm Kriterler" },
  { id: "payment", label: "Ödeme & Kapora" },
  { id: "communication", label: "SMS & WhatsApp" },
  { id: "legal", label: "Mevzuat & KVKK" },
  { id: "calendar", label: "Takvim & Slot Kilidi" },
  { id: "cost", label: "Maliyet & Destek" },
];

export default function PlatformComparison() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const filteredItems = COMPARISON_DATA.filter((item) =>
    activeCategory === "all" ? true : item.category === activeCategory
  );

  return (
    <section className="py-20 px-4 sm:px-6 max-w-6xl mx-auto border-t border-slate-800">
      {/* Header */}
      <div className="text-center mb-12 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs font-medium">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Kurumsal Karşılaştırma Matrisi</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
          Neden Calendly veya Cal.com Yerine randevuformu.com?
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Yabancı araçlar Türkiye pazarının yerel ödeme, SMS OTP, WhatsApp ve KVKK mevzuat ihtiyaçlarını karşılayamaz.
          İşte teknik ve operasyonel farklar:
        </p>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 pt-4">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                activeCategory === cat.id
                  ? "bg-white text-slate-950 shadow-sm font-semibold"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Comparison Matrix Table Container */}
      <div className="rounded-2xl bg-[#0B0F17] border border-slate-800 overflow-hidden shadow-2xl">
        {/* Table Top Platform Header */}
        <div className="grid grid-cols-12 border-b border-slate-800 bg-slate-900/70 p-4 sm:p-5 items-center text-xs font-semibold">
          <div className="col-span-5 sm:col-span-5 text-slate-400">
            Özellik & Mimari Yetenek
          </div>

          {/* randevuformu.com (Highlighted Column) */}
          <div className="col-span-3 sm:col-span-3 text-center sm:text-left bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-2.5 sm:px-3.5 sm:py-2">
            <div className="flex items-center justify-between gap-1">
              <span className="font-bold text-white text-xs sm:text-sm">randevuformu.com</span>
              <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Türkiye Standartı
              </span>
            </div>
            <span className="text-[10px] text-slate-400 hidden sm:block mt-0.5">Yerli & Bütünleşik Çözüm</span>
          </div>

          {/* Calendly */}
          <div className="col-span-2 sm:col-span-2 text-center text-slate-300 font-medium">
            <span className="text-xs sm:text-sm font-semibold">Calendly</span>
            <span className="text-[10px] text-slate-500 block">Global SaaS</span>
          </div>

          {/* Cal.com */}
          <div className="col-span-2 sm:col-span-2 text-center text-slate-300 font-medium">
            <span className="text-xs sm:text-sm font-semibold">Cal.com</span>
            <span className="text-[10px] text-slate-500 block">Açık Kaynak</span>
          </div>
        </div>

        {/* Comparison Rows */}
        <div className="divide-y divide-slate-800/80">
          {filteredItems.map((item) => {
            const isExpanded = expandedItem === item.id;
            return (
              <div key={item.id} className="transition-colors hover:bg-slate-900/30">
                <div className="grid grid-cols-12 p-4 sm:p-5 items-center text-xs">
                  {/* Left Column: Feature Title & Info Toggle */}
                  <div className="col-span-5 sm:col-span-5 pr-2 sm:pr-4">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-white text-xs sm:text-sm">{item.title}</span>
                      <button
                        type="button"
                        onClick={() => setExpandedItem(isExpanded ? null : item.id)}
                        className="text-slate-500 hover:text-slate-300 p-0.5"
                        title="Detaylı bilgi"
                      >
                        <Info className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 hidden sm:block">{item.subtitle}</p>
                  </div>

                  {/* Column: randevuformu.com */}
                  <div className="col-span-3 sm:col-span-3 bg-emerald-950/15 border-x border-emerald-500/10 px-2 sm:px-3.5 py-1.5 rounded-lg">
                    <div className="flex items-start gap-1.5">
                      <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3" />
                      </div>
                      <div>
                        <span className="font-medium text-white text-[11px] sm:text-xs block leading-tight">
                          {item.randevuformu.text}
                        </span>
                        {item.randevuformu.badge && (
                          <span className="text-[10px] text-emerald-400 font-mono mt-0.5 inline-block">
                            {item.randevuformu.badge}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Column: Calendly */}
                  <div className="col-span-2 sm:col-span-2 text-center px-1 sm:px-2">
                    <div className="flex items-center justify-center gap-1">
                      {item.calendly.status === "yes" && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                      {item.calendly.status === "partial" && <Minus className="w-3.5 h-3.5 text-amber-400" />}
                      {item.calendly.status === "no" && <X className="w-3.5 h-3.5 text-slate-600" />}
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-0.5 hidden sm:block">
                      {item.calendly.text}
                    </span>
                  </div>

                  {/* Column: Cal.com */}
                  <div className="col-span-2 sm:col-span-2 text-center px-1 sm:px-2">
                    <div className="flex items-center justify-center gap-1">
                      {item.calcom.status === "yes" && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                      {item.calcom.status === "partial" && <Minus className="w-3.5 h-3.5 text-amber-400" />}
                      {item.calcom.status === "no" && <X className="w-3.5 h-3.5 text-slate-600" />}
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-0.5 hidden sm:block">
                      {item.calcom.text}
                    </span>
                  </div>
                </div>

                {/* Expandable "Why It Matters" Explanatory Drawer */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="px-5 pb-4 pt-1 bg-slate-900/50 border-t border-slate-800/60"
                    >
                      <div className="text-xs text-slate-300 bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-start gap-2">
                        <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-white block mb-0.5">Neden Önemli?</span>
                          <p className="text-slate-400 leading-relaxed text-[11px]">{item.whyItMatters}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Enterprise Migration & Cost Benefit Banner at the Bottom */}
        <div className="p-6 sm:p-8 bg-[#0D121D] border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-semibold text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Yıllık ~%70 Maliyet Tasarrufu & Sıfır Dolar Kuru Riski</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white">
              Calendly veya Cal.com&apos;dan 60 Saniyede Geçiş Yapın
            </h3>
            <p className="text-xs text-slate-400 max-w-xl">
              Google veya Outlook takviminizi tek tıkla bağlayın; tüm randevularınız, uzmanlarınız ve müsaitlik saatleriniz anında randevuformu.com&apos;a aktarılsın.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
            <Link
              href="/login"
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white text-slate-950 font-semibold text-xs text-center hover:bg-slate-200 transition-colors shadow-sm flex items-center justify-center gap-1.5"
            >
              <span>Hemen Ücretsiz Başla</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-950" />
            </Link>
            <Link
              href="/contact"
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-medium text-xs text-center hover:border-slate-700 hover:text-white transition-colors"
            >
              Kurumsal Geçiş Desteği
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
