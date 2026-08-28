import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { Calendar, Sparkles, ArrowRight, CheckCircle2, Star, ExternalLink } from "lucide-react";
import { SEKTOR_DATA } from "@/lib/sektorler";

export const metadata: Metadata = {
  title: "Örnek Randevu Formları & Sektörel Şablonlar | randevuformu.com",
  description: "Diş hekimleri, kuaförler, diyetisyenler, avukatlar ve daha fazlası için canlı örnek randevu alma formlarını inceleyin.",
};

export default function OrneklerCatalogPage() {
  const examples = Object.values(SEKTOR_DATA);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white pb-24">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-600/15 blur-[140px] rounded-full" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/70 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 font-black text-lg text-white">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
              <Calendar className="w-4 h-4" />
            </div>
            <span>randevuformu<span className="text-indigo-400">.com</span></span>
          </Link>
          <Link
            href="/login"
            className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all hover:scale-105"
          >
            Kendi Formunu Oluştur
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-16 pb-12 max-w-5xl mx-auto px-4 text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          Canlı Örnek Şablonlar
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Sektörünüze Özel Canlı Örnek Randevu Sayfaları
        </h1>
        <p className="text-xs sm:text-base text-slate-400 max-w-2xl mx-auto">
          Gerçek kullanıcı deneyimini test etmek için aşağıdaki örnek formlardan birini seçin ve rezervasyon akışını deneyimleyin.
        </p>
      </section>

      {/* Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {examples.map((item) => (
            <div
              key={item.slug}
              className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 transition-all flex flex-col justify-between space-y-6 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 text-[11px] font-bold">
                    {item.category}
                  </span>
                  <span className="text-indigo-400 text-xs font-bold flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-indigo-400" /> Canlı Demo
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">
                  {item.exampleName}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {item.heroSub}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <Link
                  href={`/ornek/${item.exampleSlug}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Canlı Formu Dene <ExternalLink className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href={`/sektorler/${item.slug}`}
                  className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                >
                  Sektör Detayı →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
