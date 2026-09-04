"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { CalendarDays, ArrowLeft, Loader2, Sparkles, Building2, ShieldCheck, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import BookingWidget from "@/components/booking/BookingWidget";
import ErmanBarberWidget from "@/components/booking/ErmanBarberWidget";
import SchemaMarkup from "@/components/SchemaMarkup";
import { SEKTOR_DATA } from "@/lib/sektorler";
import { WhatsAppButton } from "@/components/ui/whatsapp-button";
import { CustomerChatbot } from "@/components/ai/CustomerChatbot";

const ERMAN_USTA_DATA = {
  id: "byerman-id",
  name: "Erman Usta - Erkek Berberi",
  slug: "byerman",
  phone: "+90 538 480 90 01",
  category: "Erkek Berberi",
  description: "Usta ellerde klasik Türk erkek berberi hizmeti. Sıcak havlu, ustura sakal tıraşı ve saç kesimi.",
  services: [
    {
      id: "srv-sac",
      name: "Saç Kesimi & Yıkama",
      duration_minutes: 30,
      description: "Makine veya makasla saç kesimi, saç yıkama ve fön.",
    },
    {
      id: "srv-sakal",
      name: "Sakal Tıraşı & Sıcak Havlu",
      duration_minutes: 30,
      description: "Ustura ile sakal hattı tıraşı ve buharlı sıcak havlu kompresi.",
    },
    {
      id: "srv-komple",
      name: "Saç + Sakal (Komple Tıraş)",
      duration_minutes: 60,
      description: "Komple saç kesimi, sakal tıraşı, sıcak havlu, saç yıkama ve fön.",
    },
    {
      id: "srv-cocuk",
      name: "Çocuk Saç Kesimi",
      duration_minutes: 30,
      description: "12 yaş altı çocuklar için özenli ve sabırlı saç tıraşı.",
    },
    {
      id: "srv-yikama",
      name: "Saç Yıkama & Fön",
      duration_minutes: 20,
      description: "Rahatlatıcı saç yıkama, baş masajı ve saç şekillendirme.",
    },
  ],
};

interface PageProps {
  params: Promise<{ slug: string }> | { slug: string };
}

export default function BusinessBookingPage({ params }: PageProps) {
  const resolvedParams = "then" in params ? use(params as Promise<{ slug: string }>) : params;
  const slug = resolvedParams?.slug || "dr-ahmet";
  const isErman = slug === "byerman" || slug === "ermankuafor";

  const [loading, setLoading] = useState(!isErman);
  const [business, setBusiness] = useState<any>(isErman ? ERMAN_USTA_DATA : null);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    async function loadBusinessData() {
      if (isErman) return;
      try {
        const { data, error } = await supabase
          .from("businesses")
          .select("*, services(*)")
          .eq("slug", slug)
          .maybeSingle();

        if (data) {
          setBusiness(data);
          setIsDemo(false);
        } else {
          // Check if this matches a known showcase demo slug or direct sector slug
          const matchedSector = Object.values(SEKTOR_DATA).find(
            (s) => s.exampleSlug === slug || s.slug === slug
          );

          if (slug === "byerman" || slug === "ermankuafor") {
            setIsDemo(false);
            setBusiness({
              id: "byerman-id",
              name: "Erman Usta - Erkek Berberi",
              slug: slug,
              phone: "+90 538 480 90 01",
              category: "Erkek Berberi",
              description: "Usta ellerde klasik Türk erkek berberi hizmeti. Sıcak havlu, ustura sakal tıraşı ve saç kesimi.",
              services: [
                {
                  id: "srv-sac",
                  name: "Saç Kesimi & Yıkama",
                  duration_minutes: 30,
                  price_text: "₺350",
                  price: 350,
                  description: "Makine veya makasla saç kesimi, saç yıkama ve fön.",
                },
                {
                  id: "srv-sakal",
                  name: "Sakal Tıraşı & Sıcak Havlu",
                  duration_minutes: 25,
                  price_text: "₺200",
                  price: 200,
                  description: "Ustura ile sakal hattı tıraşı ve buharlı sıcak havlu kompresi.",
                },
                {
                  id: "srv-komple",
                  name: "Saç + Sakal (Komple Tıraş)",
                  duration_minutes: 55,
                  price_text: "₺500",
                  price: 500,
                  description: "Komple saç kesimi, sakal tıraşı, sıcak havlu, saç yıkama ve fön.",
                },
                {
                  id: "srv-cocuk",
                  name: "Çocuk Saç Kesimi",
                  duration_minutes: 30,
                  price_text: "₺250",
                  price: 250,
                  description: "12 yaş altı çocuklar için özenli ve sabırlı saç tıraşı.",
                },
                {
                  id: "srv-bakim",
                  name: "VIP Saç Bakımı & Cilt Maskesi",
                  duration_minutes: 35,
                  description: "Özel tonik bakımı, baş masajı ve canlandırıcı maske.",
                },
              ],
            });
          } else if (matchedSector) {
            setIsDemo(true);
            setBusiness({
              id: `demo-${matchedSector.slug}`,
              name: matchedSector.exampleName || matchedSector.title,
              slug: slug,
              category: matchedSector.category,
              services: matchedSector.services || [],
            });
          } else if (slug === "dr-ahmet") {
            const dental = SEKTOR_DATA["dis-hekimi"];
            setIsDemo(true);
            setBusiness({
              id: "demo-dr-ahmet",
              name: dental?.exampleName || "Dr. Ahmet Yılmaz Diş Kliniği",
              slug: slug,
              category: dental?.category || "Diş Sağlığı & Poliklinik",
              services: dental?.services || [],
            });
          } else if (slug === "studio-nova") {
            const kuafor = SEKTOR_DATA["kuafor"];
            setIsDemo(true);
            setBusiness({
              id: "demo-studio-nova",
              name: kuafor?.exampleName || "Studio Nova Kuaför & Saç Tasarım",
              slug: slug,
              category: kuafor?.category || "Kuaför & Saç Bakımı",
              services: kuafor?.services || [],
            });
          } else {
            // Check if user has saved custom services in localStorage
            let customServices = [];
            if (typeof window !== "undefined") {
              try {
                const saved = localStorage.getItem("rf_business_services");
                if (saved) {
                  const parsed = JSON.parse(saved);
                  if (Array.isArray(parsed) && parsed.length > 0) {
                    customServices = parsed;
                  }
                }
              } catch {}
            }

            // Clean state for brand new business slug
            setIsDemo(false);
            setBusiness({
              id: "user-tenant-id",
              name: slug.replace(/-/g, " ").toUpperCase(),
              slug: slug,
              category: "Randevu Hizmeti",
              services: customServices,
            });
          }
        }
      } catch (err) {
        console.error("Error loading business:", err);
        const kuafor = SEKTOR_DATA["kuafor"];
        setBusiness({
          id: "fallback-id",
          name: "Studio Nova Kuaför",
          slug: slug,
          category: "Kuaför & Saç Bakımı",
          services: kuafor.services,
        });
      } finally {
        setLoading(false);
      }
    }

    loadBusinessData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0F1C] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#0062FF] animate-spin" />
          <p className="text-xs text-slate-400">Randevu sayfası yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0F17] via-[#0D131F] to-[#070A0F] text-white flex flex-col justify-between py-8 px-4 sm:px-6 relative overflow-hidden">
      <SchemaMarkup
        type="LocalBusiness"
        data={{
          name: business?.name,
          url: `https://randevuformu.com/${slug}`,
          department: business?.category,
        }}
      />

      {/* Subtle Corporate Blue Ambient Glow — Purged Mor/Neon */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#0062FF]/10 blur-[130px] rounded-full pointer-events-none -z-10" />

      {/* Top Demo Banner if this is an example showcase — 100% Brand Palette */}
      {isDemo && (
        <div className="max-w-4xl mx-auto w-full mb-6 p-3.5 rounded-2xl bg-[#0F2A4A] border border-blue-500/30 text-center text-xs text-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg shadow-blue-950/20">
          <div className="flex items-center gap-2 text-left">
            <Sparkles className="w-4 h-4 text-[#00BCD4] shrink-0" />
            <span>💡 <strong>Örnek {business?.category || 'Sektör'} Şablonu:</strong> Bu sayfa sistem özelliklerini göstermek amacıyla hazırlanmış gerçekçi bir canlı demodur.</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/settings"
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white font-medium text-xs transition-colors"
            >
              Hizmetleri Düzenle
            </Link>
            <Link
              href="/login"
              className="px-3.5 py-1.5 rounded-xl bg-[#0062FF] hover:bg-[#0052d9] text-white font-semibold text-xs flex items-center gap-1 transition-all shadow-sm active:scale-95"
            >
              Kendi Sayfanı Oluştur <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-4xl mx-auto w-full">
        {slug === "byerman" || slug === "ermankuafor" ? (
          <ErmanBarberWidget
            businessSlug={slug}
            tenantId={business?.id || "byerman-id"}
          />
        ) : business?.services && business.services.length > 0 ? (
          <BookingWidget
            businessName={business.name}
            businessSlug={business.slug}
            category={business.category}
            services={business.services}
            tenantId={business.id}
          />
        ) : (
          <div className="p-12 rounded-3xl bg-slate-900/80 border border-slate-800 text-center space-y-4 max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-[#0062FF]/15 text-[#00BCD4] border border-blue-500/30 flex items-center justify-center mx-auto">
              <CalendarDays className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-white">{business?.name || slug}</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Bu işletmeye ait henüz aktif bir hizmet veya randevu formu tanımlanmamış.
            </p>
            <div className="pt-2">
              <Link
                href="/login"
                className="inline-flex px-5 py-2.5 rounded-xl bg-[#0062FF] hover:bg-[#0052d9] text-white text-xs font-bold transition-all hover:scale-105"
              >
                İşletme Girişi Yap & Formu Düzenle
              </Link>
            </div>
          </div>
        )}
      </main>

      <footer className="mt-12 text-center text-xs text-slate-500">
        <div className="flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#00BCD4]" />
          <span>Güvenli & KVKK Uyumlu Randevu Altyapısı — randevuformu.com</span>
        </div>
      </footer>

      {/* Modül 1: Sabit WhatsApp İletişim Butonu */}
      {business?.phone && (
        <WhatsAppButton
          phoneNumber={business.phone}
          defaultMessage={`Merhaba, ${business.name || 'işletmeniz'} için randevu almak istiyorum.`}
        />
      )}

      {/* Modül 2: Müşteri AI Randevu Asistanı Chatbotu */}
      <CustomerChatbot
        businessSlug={slug}
        businessName={business?.name || (isErman ? "Erman Usta" : "Randevu Asistanı")}
      />
    </div>
  );
}
