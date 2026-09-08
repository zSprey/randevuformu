"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { CalendarDays, Loader2, Info, ShieldCheck, ArrowRight } from "lucide-react";
import BookingWidget from "@/components/booking/BookingWidget";
import { CustomerChatbot } from "@/components/ai/CustomerChatbot";

interface BookingPageClientProps {
  slug: string;
  initialBusiness: any;
  isDemo?: boolean;
}

export default function BookingPageClient({
  slug,
  initialBusiness,
  isDemo = false,
}: BookingPageClientProps) {
  const isErman = slug === "byerman" || slug === "ermankuafor";
  const [business, setBusiness] = useState<any>(initialBusiness);
  const [loading, setLoading] = useState(false);

  // Client-side synchronization: Check if localStorage has fresher services from recent admin edits
  useEffect(() => {
    let isMounted = true;

    async function syncServices() {
      try {
        const targetKey = isErman ? "byerman" : slug;
        if (typeof window !== "undefined") {
          const cached = localStorage.getItem(`rf_business_services_${targetKey}`);
          if (cached) {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0 && isMounted) {
              setBusiness((prev: any) => ({
                ...prev,
                services: parsed,
              }));
            }
          }
        }

        // Also fetch from API to get any cloud updates
        const srvRes = await fetch(`/api/business/services?slug=${encodeURIComponent(slug)}`);
        if (srvRes.ok) {
          const srvData = await srvRes.json();
          if (srvData.success && Array.isArray(srvData.services) && srvData.services.length > 0 && isMounted) {
            setBusiness((prev: any) => ({
              ...prev,
              services: srvData.services,
            }));
          }
        }
      } catch (err) {
        // Fallback to initialBusiness is already active
        console.debug("BookingPageClient sync notice:", err);
      }
    }

    syncServices();

    return () => {
      isMounted = false;
    };
  }, [slug, isErman]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFBFC] flex items-center justify-center text-slate-700">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#0062FF] animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Randevu sayfası yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFBFC] text-slate-800 flex flex-col justify-between py-8 px-4 sm:px-6 relative overflow-hidden font-sans antialiased">
      {/* Subtle Corporate Blue Geometric Accent */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-[#0062FF]/[0.04] to-transparent rounded-full -translate-y-1/3 translate-x-1/3 pointer-events-none -z-10" />

      {/* Top Demo Banner if this is an example showcase — 100% Brand Palette */}
      {isDemo && (
        <div className="max-w-5xl mx-auto w-full mb-6 p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200/80 text-center text-xs text-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2 text-left">
            <Info className="w-4 h-4 text-[#0062FF] shrink-0" />
            <span>
              💡 <strong>Örnek {business?.category || "Sektör"} Şablonu:</strong> Bu sayfa sistem özelliklerini göstermek amacıyla hazırlanmış canlı bir demodur.
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/settings"
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-[#0F2A4A] border border-slate-200 font-semibold text-xs transition-colors shadow-2xs"
            >
              Hizmetleri Düzenle
            </Link>
            <Link
              href="/login"
              className="px-3.5 py-1.5 rounded-xl bg-[#0062FF] hover:bg-[#0052d9] text-white font-semibold text-xs flex items-center gap-1 transition-all shadow-xs active:scale-95"
            >
              Kendi Sayfanı Oluştur <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-5xl mx-auto w-full">
        {business?.services && business.services.length > 0 ? (
          <BookingWidget
            businessName={business.name}
            businessSlug={business.slug}
            category={business.category}
            services={business.services}
            tenantId={business.id}
          />
        ) : (
          <div className="p-10 rounded-2xl bg-white border border-slate-200 shadow-md text-center space-y-4 max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-[#0062FF]/10 text-[#0062FF] flex items-center justify-center mx-auto">
              <CalendarDays className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-[#0F2A4A]">{business?.name || slug}</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Bu işletmeye ait henüz aktif bir randevu hizmeti tanımlanmamış.
            </p>
            <div className="pt-2">
              <Link
                href="/login"
                className="inline-flex px-5 py-2.5 rounded-xl bg-[#0062FF] hover:bg-[#0052d9] text-white text-xs font-bold transition-all shadow-sm"
              >
                İşletme Girişi Yap &amp; Formu Düzenle
              </Link>
            </div>
          </div>
        )}
      </main>

      <footer className="mt-12 text-center text-xs text-slate-500">
        <div className="flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#0062FF]" />
          <span>Güvenli &amp; KVKK Uyumlu Randevu Altyapısı — randevuformu.com</span>
        </div>
      </footer>

      {/* Modül 2: Müşteri AI Randevu Asistanı Chatbotu */}
      <CustomerChatbot
        businessSlug={slug}
        businessName={business?.name || (isErman ? "Erman Usta" : "Randevu Asistanı")}
      />
    </div>
  );
}
