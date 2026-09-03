import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import {
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Zap,
  Sparkles,
  HelpCircle,
  TrendingUp,
  MessageCircle,
} from "lucide-react";
import { SEKTOR_DATA } from "@/lib/sektorler";

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
        mainEntity: sector.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
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
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
      />

      {/* Background glow effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-600/15 blur-[140px] rounded-full" />
        <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-purple-600/10 blur-[120px] rounded-full" />
      </div>

      {/* Header Bar */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/70 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 font-black text-lg text-white">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
              <Calendar className="w-4 h-4" />
            </div>
            <span>randevuformu<span className="text-indigo-400">.com</span></span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href={`/${sector.exampleSlug}`}
              className="hidden sm:inline-flex px-4 py-2 rounded-xl text-xs font-semibold bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 transition-all"
            >
              Canlı Örnek Form
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all hover:scale-105"
            >
              Ücretsiz Başla
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-16 pb-12 sm:pt-24 sm:pb-20 max-w-5xl mx-auto px-4 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          {sector.badge}
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15]">
          {sector.heroHeadline}
        </h1>

        <p className="text-sm sm:text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed">
          {sector.heroSub}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all"
          >
            1 Dakikada Formunu Oluştur
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href={`/${sector.exampleSlug}`}
            className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 font-semibold text-sm flex items-center justify-center gap-2 transition-all"
          >
            {sector.exampleName} Önizle
          </Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 sm:gap-6 pt-10 max-w-3xl mx-auto">
          {sector.stats.map((st, i) => (
            <div
              key={i}
              className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-center"
            >
              <div className="text-xl sm:text-3xl font-black text-indigo-400">{st.value}</div>
              <div className="text-[11px] sm:text-xs text-slate-400 mt-1 font-medium">{st.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Pain Points vs Solutions */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Eski Usül Randevu Almayı Bırakın
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Telefon trafiğini, son dakika iptallerini ve gelir kayıplarını geride bırakın.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {sector.painPoints.map((pp, i) => (
            <div
              key={i}
              className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                  ✕ Eski Yöntem
                </div>
                <p className="text-xs text-slate-400">{pp.problem}</p>
              </div>
              <div className="pt-4 border-t border-slate-800 space-y-2">
                <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> randevuformu Çözümü
                </div>
                <p className="text-xs text-slate-200 font-medium">{pp.solution}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Sektörünüze Özel Gelişmiş Özellikler
          </h2>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          {sector.features.map((ft, i) => (
            <div
              key={i}
              className="p-6 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 space-y-3"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">{ft.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{ft.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-black text-white flex items-center justify-center gap-2">
            <HelpCircle className="w-6 h-6 text-indigo-400" /> Sıkça Sorulan Sorular
          </h2>
        </div>

        <div className="space-y-3">
          {sector.faqs.map((faq, i) => (
            <details
              key={i}
              className="group p-5 rounded-2xl bg-slate-900/60 border border-slate-800 open:border-indigo-500/40 transition-all"
            >
              <summary className="font-bold text-sm text-white cursor-pointer list-none flex items-center justify-between">
                <span>{faq.question}</span>
                <span className="text-indigo-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="text-xs text-slate-400 mt-3 pt-3 border-t border-slate-800 leading-relaxed">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="max-w-5xl mx-auto px-4 pt-12">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-indigo-900/50 via-purple-900/40 to-slate-900 border border-indigo-500/30 text-center space-y-6 shadow-2xl">
          <h2 className="text-2xl sm:text-4xl font-black text-white">
            {sector.category} İçin Randevu Altyapınızı Bugün Kurun
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
            Kredi kartı gerekmez. 1 dakika içinde formunuzu yayınlayın, Instagram ve WhatsApp üzerinden randevu toplamaya başlayın.
          </p>
          <Link
            href="/login"
            className="inline-flex px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 items-center gap-2 transition-all hover:scale-105"
          >
            Hemen Ücretsiz Başlayın
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-20 py-8 border-t border-white/5 text-center text-xs text-slate-500">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span>randevuformu.com — {sector.category} Çözümleri</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/ornek" className="hover:text-white transition-colors">Örnekler</Link>
            <Link href="/contact" className="hover:text-white transition-colors">İletişim</Link>
            <a href="mailto:destek@randevuformu.com" className="text-indigo-400 hover:underline">
              destek@randevuformu.com
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
