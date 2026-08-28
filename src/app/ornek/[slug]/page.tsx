import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { Calendar, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import BookingWidget from "@/components/booking/BookingWidget";
import { SEKTOR_DATA } from "@/lib/sektorler";

interface OrnekPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: OrnekPageProps): Promise<Metadata> {
  const { slug } = await params;
  const sector = Object.values(SEKTOR_DATA).find((s) => s.exampleSlug === slug);

  if (!sector) {
    return { title: "Örnek Randevu Formu | randevuformu.com" };
  }

  return {
    title: `${sector.exampleName} - Canlı Örnek Randevu Formu | randevuformu.com`,
    description: `${sector.category} sektörü için canlı örnek randevu alma formu şablonu.`,
  };
}

export default async function OrnekDetailPage({ params }: OrnekPageProps) {
  const { slug } = await params;
  const sector = Object.values(SEKTOR_DATA).find((s) => s.exampleSlug === slug);

  // Fallback if not specifically found in SEKTOR_DATA
  const businessName = sector?.exampleName || "Dr. Ahmet Yılmaz Diş Kliniği";
  const category = sector?.category || "Örnek Hizmet";

  const defaultServices = [
    {
      id: "srv-1",
      name: "Genel Muayene & Teşhis",
      duration_minutes: 30,
      price_text: "750 ₺",
      price: 750,
      description: "Detaylı ön inceleme ve tedavi planı oluşturulması.",
    },
    {
      id: "srv-2",
      name: "VIP Seans / Kapsamlı Bakım",
      duration_minutes: 60,
      price_text: "1.500 ₺",
      price: 1500,
      description: "Özel uzman konsültasyonu ve tam kapsamlı seans.",
    },
    {
      id: "srv-3",
      name: "Hızlı Kontrol Randevusu",
      duration_minutes: 20,
      price_text: "Ücretsiz",
      price: 0,
      description: "Önceki işlemin rutin durum değerlendirmesi.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Demo Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900 text-white px-4 py-2.5 text-center text-xs font-bold flex items-center justify-center gap-2 border-b border-indigo-500/30">
        <Sparkles className="w-4 h-4 text-indigo-300 shrink-0" />
        <span>
          💡 <strong>CANLI ÖRNEK SAYFA:</strong> Bu sayfa sistem özelliklerini göstermek amacıyla hazırlanmış bir demodur.
        </span>
        <Link
          href="/login"
          className="ml-2 underline underline-offset-4 hover:text-indigo-200 transition-colors inline-flex items-center gap-1"
        >
          Kendi Sayfanızı 1 Dakikada Oluşturun <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <main className="flex-1 py-10 px-4 flex items-center justify-center">
        <BookingWidget
          businessName={businessName}
          businessSlug={slug}
          category={category}
          services={defaultServices}
          tenantId="demo-tenant"
        />
      </main>

      <footer className="py-6 text-center text-xs text-slate-500 border-t border-white/5">
        <div className="max-w-md mx-auto flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-indigo-400" />
          <span>Güvenli & KVKK Uyumlu Randevu Altyapısı — Powered by randevuformu.com</span>
        </div>
      </footer>
    </div>
  );
}
