"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { CalendarDays, ArrowLeft, Loader2, Sparkles, Building2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import BookingWidget from "@/components/booking/BookingWidget";
import SchemaMarkup from "@/components/SchemaMarkup";

interface PageProps {
  params: Promise<{ slug: string }> | { slug: string };
}

export default function BusinessBookingPage({ params }: PageProps) {
  // Handle both sync and async params in Next.js App Router
  const resolvedParams = "then" in params ? use(params as Promise<{ slug: string }>) : params;
  const slug = resolvedParams?.slug || "dr-ahmet";

  const [loading, setLoading] = useState(true);
  const [business, setBusiness] = useState<any>(null);

  useEffect(() => {
    async function loadBusinessData() {
      try {
        const { data, error } = await supabase
          .from("businesses")
          .select("*, services(*)")
          .eq("slug", slug)
          .single();

        if (data) {
          setBusiness(data);
        } else {
          // Fallback business profile if not yet in Supabase
          setBusiness({
            id: "fallback-id",
            name: slug === "dr-ahmet" ? "Dr. Ahmet Yılmaz Diş Kliniği" : "Örnek Randevu İşletmesi",
            slug: slug,
            category: "Sağlık & Estetik",
            services: [
              {
                id: "s1",
                name: "İmplant ve Gülüş Tasarımı Konsültasyonu",
                duration_minutes: 30,
                price_text: "Ücretsiz",
                description: "3D Tomografi analizi ve ağız içi tarama planlaması.",
              },
              {
                id: "s2",
                name: "Lazerli Diş Beyazlatma (Bleaching)",
                duration_minutes: 60,
                price_text: "₺3.000",
                description: "Tek seansta 3-4 tona kadar etkili beyazlatma.",
              },
              {
                id: "s3",
                name: "Estetik Kompozit Dolgu & Bakım",
                duration_minutes: 45,
                price_text: "₺1.200",
                description: "Kırık, aşınmış veya çürük diş onarımı.",
              },
            ],
          });
        }
      } catch (err) {
        console.error("Error loading business:", err);
      } finally {
        setLoading(false);
      }
    }

    loadBusinessData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070A0F] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-xs text-slate-400">Randevu sayfası yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0F17] via-[#0D131F] to-[#070A0F] text-white flex flex-col justify-between py-8 px-4 sm:px-6 relative overflow-hidden">
      {/* Dynamic SEO JSON-LD Schema */}
      <SchemaMarkup
        type="LocalBusiness"
        data={{
          name: business?.name,
          url: `https://randevuformu.com/${slug}`,
          department: business?.category,
        }}
      />

      {/* Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none -z-10" />

      {/* Top Navbar */}
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-3.5 py-2 rounded-xl border border-white/10"
        >
          <ArrowLeft className="w-4 h-4" />
          Ana Sayfa
        </Link>

        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-indigo-600 text-white">
            <CalendarDays className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-slate-300">randevuformu.com</span>
        </div>
      </header>

      {/* Main Interactive Booking Component */}
      <main className="max-w-4xl mx-auto w-full flex-1">
        <BookingWidget
          businessName={business?.name || "İşletme"}
          businessSlug={slug}
          category={business?.category || "Hizmet Sağlayıcı"}
          services={business?.services || []}
          tenantId={business?.id}
        />
      </main>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto w-full text-center mt-12 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-white/5">
        <p>© {new Date().getFullYear()} {business?.name} • Tüm hakları saklıdır.</p>
        <p className="flex items-center gap-1 text-slate-400">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          Altyapı: <span className="font-semibold text-white">randevuformu.com</span>
        </p>
      </footer>
    </div>
  );
}
