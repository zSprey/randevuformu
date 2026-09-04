import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import { Sparkles, Star, ExternalLink } from "lucide-react";
import { SEKTOR_DATA } from "@/lib/sektorler";

export const metadata: Metadata = {
  title: "Örnek Randevu Formları & Sektörel Şablonlar | randevuformu.com",
  description: "Diş hekimleri, kuaförler, diyetisyenler, avukatlar ve daha fazlası için canlı örnek randevu alma formlarını inceleyin.",
};

export default function OrneklerCatalogPage() {
  const examples = Object.values(SEKTOR_DATA);

  return (
    <div className="min-h-screen bg-[#FAFBFC] text-slate-900 selection:bg-[#0062FF]/10 selection:text-[#0062FF] pb-20 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/90 border-b border-slate-200/80 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-base text-[#0F2A4A]">
            <div className="relative w-6 h-6 rounded-md overflow-hidden flex items-center justify-center">
              <Image
                src="/logo.png"
                alt="Logo"
                width={24}
                height={24}
                className="object-contain"
                priority
              />
            </div>
            <span>randevuformu<span className="text-[#0062FF]">.com</span></span>
          </Link>
          <Link
            href="/login"
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#0062FF] hover:bg-[#0051d4] text-white shadow-xs transition-all"
          >
            Kendi Formunu Oluştur
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-12 pb-10 max-w-4xl mx-auto px-4 text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-50 border border-blue-200/60 text-[#0062FF] text-[11px] font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          Canlı Örnek Şablonlar
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0F2A4A] tracking-tight">
          Sektörünüze Özel Canlı Örnek Randevu Sayfaları
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
          Kullanıcı deneyimini canlı test etmek için aşağıdaki örnek formlardan birini seçin ve rezervasyon akışını deneyimleyin.
        </p>
      </section>

      {/* Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {examples.map((item) => (
            <div
              key={item.slug}
              className="p-6 rounded-2xl bg-white border border-slate-200/90 hover:border-[#0062FF]/40 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-5 group"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200/60 text-[#0062FF] text-[11px] font-semibold">
                    {item.category}
                  </span>
                  <span className="text-amber-600 text-xs font-semibold flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> Canlı Demo
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#0F2A4A] group-hover:text-[#0062FF] transition-colors">
                  {item.exampleName}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {item.heroSub}
                </p>
              </div>

              <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
                <Link
                  href={`/ornek/${item.exampleSlug}`}
                  className="inline-flex items-center gap-1 text-[#0062FF] hover:text-[#0051d4] transition-colors"
                >
                  Canlı Formu Dene <ExternalLink className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href={`/sektorler/${item.slug}`}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
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
