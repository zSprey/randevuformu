import React from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import {
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
  Sparkles,
  HelpCircle,
} from "lucide-react";
import { SEKTOR_DATA } from "@/lib/sektorler";
import ChatbotWidget from "@/components/ChatbotWidget";
import { getAeoDirectAnswer, getCompetitiveComparisonMatrix } from "@/lib/seo/geoEngine";

interface SektorPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return Object.keys(SEKTOR_DATA).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: SektorPageProps): Promise<Metadata> {
  const { slug } = await params;
  const sector = SEKTOR_DATA[slug];

  if (!sector) {
    return { title: "Sektörel Randevu Çözümleri | randevuformu.com" };
  }

  return {
    title: sector.metaTitle,
    description: sector.metaDescription,
    keywords: sector.keywords,
    openGraph: {
      title: sector.metaTitle,
      description: sector.metaDescription,
      url: `https://randevuformu.com/sektorler/${slug}`,
      siteName: "randevuformu.com",
      type: "website",
    },
    alternates: {
      canonical: `https://randevuformu.com/sektorler/${slug}`,
    },
  };
}

export default async function SektorLandingPage({ params }: SektorPageProps) {
  const { slug } = await params;
  const sector = SEKTOR_DATA[slug];

  if (!sector) {
    notFound();
  }

  const aeoData = getAeoDirectAnswer(sector.category, "Türkiye");
  const comparisonMatrix = getCompetitiveComparisonMatrix(sector.category);

  const jsonLdData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": sector.schemaType || "LocalBusiness",
        name: sector.title,
        description: sector.metaDescription,
        url: `https://randevuformu.com/sektorler/${slug}`,
        areaServed: "TR",
        priceRange: "₺₺",
      },
      {
        "@type": "SoftwareApplication",
        name: `randevuformu.com - ${sector.category} Randevu Yazılımı`,
        operatingSystem: "Web, iOS, Android",
        applicationCategory: "BusinessApplication",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "TRY",
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: aeoData.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: aeoData.directAnswer,
            },
          },
          ...sector.faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: faq.answer,
            },
          })),
        ],
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Ana Sayfa", item: "https://randevuformu.com" },
          { "@type": "ListItem", position: 2, name: "Sektörler", item: "https://randevuformu.com/sektorler" },
          { "@type": "ListItem", position: 3, name: sector.badge, item: `https://randevuformu.com/sektorler/${slug}` },
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[#FAFBFC] text-slate-900 selection:bg-[#0062FF]/10 selection:text-[#0062FF] pb-20 font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
      />

      {/* Header Bar */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/90 border-b border-slate-200/80 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-base text-[#0F2A4A] group">
            <div className="relative h-9 w-auto flex items-center shrink-0">
              <Image
                src="/logo.png"
                alt="Logo"
                width={36}
                height={36}
                className="h-9 w-auto object-contain transition-transform group-hover:scale-105"
                priority
              />
            </div>
            <span>randevuformu<span className="text-[#0062FF]">.com</span></span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href={`/ornek/${sector.exampleSlug}`}
              className="hidden sm:inline-flex px-3.5 py-1.5 rounded-xl text-xs font-medium bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 transition-all active:scale-[0.98]"
            >
              Canlı Örnek Form
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 rounded-xl text-xs font-medium bg-[#0F2A4A] hover:bg-[#163a66] text-white shadow-xs border border-[#0F2A4A]/10 transition-all active:scale-[0.98]"
            >
              Hemen Başla
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-14 pb-10 sm:pt-20 sm:pb-16 max-w-5xl mx-auto px-4 text-center space-y-5">
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-50 border border-blue-200/60 text-[#0062FF] text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          {sector.badge}
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#0F2A4A] tracking-tight leading-[1.15]">
          {sector.heroHeadline}
        </h1>

        <p className="text-sm sm:text-base text-slate-500 max-w-3xl mx-auto leading-relaxed">
          {sector.heroSub}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/login"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#0062FF] hover:bg-[#0051d4] text-white font-semibold text-xs shadow-xs flex items-center justify-center gap-2 transition-all"
          >
            1 Dakikada Formunu Oluştur
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href={`/ornek/${sector.exampleSlug}`}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-2xs"
          >
            {sector.exampleName} Önizle
          </Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 sm:gap-5 pt-8 max-w-2xl mx-auto">
          {sector.stats.map((st, i) => (
            <div
              key={i}
              className="p-4 rounded-2xl bg-white border border-slate-200/90 text-center shadow-xs"
            >
              <div className="text-xl sm:text-2xl font-bold text-[#0062FF]">{st.value}</div>
              <div className="text-[11px] sm:text-xs text-slate-500 mt-0.5 font-medium">{st.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Pain Points vs Solutions */}
      <section className="max-w-5xl mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F2A4A]">
            Eski Usül Randevu Almayı Bırakın
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Telefon trafiğini, son dakika iptallerini ve gelir kayıplarını geride bırakın.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {sector.painPoints.map((pp, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">
                  ✕ Eski Yöntem
                </div>
                <p className="text-xs text-slate-500">{pp.problem}</p>
              </div>
              <div className="pt-3.5 border-t border-slate-100 space-y-1.5">
                <div className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> randevuformu Çözümü
                </div>
                <p className="text-xs text-slate-800 font-medium">{pp.solution}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-5xl mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F2A4A]">
            Sektörünüze Özel Gelişmiş Özellikler
          </h2>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          {sector.features.map((ft, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2.5"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0062FF] border border-blue-100 flex items-center justify-center">
                <Zap className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#0F2A4A]">{ft.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{ft.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Gingiris GEO & AEO Direct Answer Block */}
      <section className="max-w-4xl mx-auto px-4 py-8">
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-blue-900 via-indigo-950 to-[#0A192F] text-white shadow-lg border border-blue-800/40 relative overflow-hidden">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Yanıt & GEO Özet</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold mb-3 tracking-tight">
            {aeoData.question}
          </h2>
          <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-normal">
            {aeoData.directAnswer}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10">
            {aeoData.keyStatistics.map((stat, i) => (
              <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                <div className="text-xs text-blue-200 font-medium leading-snug">{stat}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison Matrix for LLM Knowledge Graph & CRO */}
      <section className="max-w-5xl mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold mb-2">
            Şeffaf Analiz
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F2A4A]">
            Neden RandevuFormu? — Alternatifler ile Karşılaştırma
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto mt-2">
            İşletmeniz için en yüksek dönüşümlü ve en düşük maliyetli randevu altyapısını karşılaştırın.
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200/90 bg-white shadow-xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-700">
                <th className="p-4 font-bold">Özellik</th>
                <th className="p-4 font-extrabold text-[#0062FF] bg-blue-50/50">randevuformu.com</th>
                <th className="p-4 font-semibold text-slate-500">Calendly</th>
                <th className="p-4 font-semibold text-slate-500">Kolay Randevu</th>
                <th className="p-4 font-semibold text-slate-500">Manuel Defter / Telefon</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {comparisonMatrix.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 font-semibold text-[#0F2A4A]">{row.feature}</td>
                  <td className="p-4 font-bold text-[#0062FF] bg-blue-50/20">{row.randevuformu}</td>
                  <td className="p-4 text-slate-600">{row.calendly}</td>
                  <td className="p-4 text-slate-600">{row.kolayRandevu}</td>
                  <td className="p-4 text-slate-500">{row.manuelDefter}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-3xl mx-auto px-4 py-10">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-extrabold text-[#0F2A4A] flex items-center justify-center gap-2">
            <HelpCircle className="w-5 h-5 text-[#0062FF]" /> Sıkça Sorulan Sorular
          </h2>
        </div>

        <div className="space-y-2.5">
          {sector.faqs.map((faq, i) => (
            <details
              key={i}
              className="group p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs"
            >
              <summary className="font-semibold text-xs sm:text-sm text-[#0F2A4A] cursor-pointer list-none flex items-center justify-between">
                <span>{faq.question}</span>
                <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="text-xs text-slate-600 mt-2.5 pt-2.5 border-t border-slate-100 leading-relaxed">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="max-w-5xl mx-auto px-4 pt-10">
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-blue-50/80 via-white to-slate-50 border border-blue-200/60 text-center space-y-4 shadow-xs">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F2A4A]">
            {sector.category} İçin Randevu Altyapınızı Bugün Kurun
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
            Kredi kartı gerekmez. 1 dakika içinde formunuzu yayınlayın, Instagram ve WhatsApp üzerinden randevu toplamaya başlayın.
          </p>
          <Link
            href="/login"
            className="inline-flex px-6 py-3 rounded-xl bg-[#0062FF] hover:bg-[#0051d4] text-white font-semibold text-xs shadow-xs items-center gap-2 transition-all"
          >
            Hemen Ücretsiz Başlayın
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-16 py-6 border-t border-slate-200 text-center text-xs text-slate-500 bg-white">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-slate-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>randevuformu.com — {sector.category} Çözümleri</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/ornek" className="hover:text-slate-800 transition-colors">Örnekler</Link>
            <Link href="/contact" className="hover:text-slate-800 transition-colors">İletişim</Link>
            <a href="mailto:destek@randevuformu.com" className="text-[#0062FF] hover:underline">
              destek@randevuformu.com
            </a>
          </div>
        </div>
      </footer>

      {/* Sektöre Özel Eğitilmiş Akıllı Asistan */}
      <ChatbotWidget mode="customer" businessSlug={slug} />
    </div>
  );
}
