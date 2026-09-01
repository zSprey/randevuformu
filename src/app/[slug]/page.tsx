"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { CalendarDays, ArrowLeft, Loader2, Sparkles, Building2, ShieldCheck, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import BookingWidget from "@/components/booking/BookingWidget";
import SchemaMarkup from "@/components/SchemaMarkup";
import { SEKTOR_DATA } from "@/lib/sektorler";

interface PageProps {
  params: Promise<{ slug: string }> | { slug: string };
}

export default function BusinessBookingPage({ params }: PageProps) {
  const resolvedParams = "then" in params ? use(params as Promise<{ slug: string }>) : params;
  const slug = resolvedParams?.slug || "dr-ahmet";

  const [loading, setLoading] = useState(true);
  const [business, setBusiness] = useState<any>(null);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    async function loadBusinessData() {
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
          // Check if this matches a known showcase demo slug
          const matchedSector = Object.values(SEKTOR_DATA).find((s) => s.exampleSlug === slug);

          if (slug === "byerman" || slug === "ermankuafor") {
            setIsDemo(false);
            setBusiness({
              id: "byerman-id",
              name: "By Erman Hair Studio & Men Grooming",
              slug: slug,
              category: "VIP Kuaför & Saç Tasarım",
              description: "Kişiye özel saç kesimi, sakal tasarımı, keratin ve cilt bakımı. Her 30 dakikada bir açık randevu imkanı.",
              services: [
                {
                  id: "ek-1",
                  name: "Saç Kesimi, Yıkama & Şekillendirme",
                  duration_minutes: 30,
                  price_text: "₺350",
                  price: 350,
                  description: "Yüz tipine özel modern kesim, saç yıkama ve fön işlemi.",
                },
                {
                  id: "ek-2",
                  name: "Sakal Tıraşı & Buharlı Sıcak Havlu",
                  duration_minutes: 30,
                  price_text: "₺200",
                  price: 200,
                  description: "Ustura ile sakal hattı tasarımı, buharlı yumuşatma ve sıcak havlu kompresi.",
                },
                {
                  id: "ek-3",
                  name: "Saç & Sakal VIP Bakım Paketi",
                  duration_minutes: 60,
                  price_text: "₺500",
                  price: 500,
                  description: "Saç kesimi, sakal tıraşı, saç yıkama, fön ve canlandırıcı yüz maskesi.",
                },
                {
                  id: "ek-4",
                  name: "Saç Boyama & Beyaz Kamuflaj",
                  duration_minutes: 30,
                  price_text: "₺600",
                  price: 600,
                  description: "Doğal görünümü koruyan tonlama ve beyaz kapatma işlemi.",
                },
                {
                  id: "ek-5",
                  name: "Keratin Saç Botoksu & Bakım Maskesi",
                  duration_minutes: 60,
                  price_text: "₺850",
                  price: 850,
                  description: "Yıpranmış telleri onaran, kabarmayı önleyen keratin terapisi.",
                },
                {
                  id: "ek-6",
                  name: "Cilt Bakımı, Kil Maskesi & Ozon Buharı",
                  duration_minutes: 30,
                  price_text: "₺300",
                  price: 300,
                  description: "Gözenek temizleme, siyah nokta arındırma ve nemlendirici masaj.",
                },
              ],
            });
          } else if (matchedSector || slug === "dr-ahmet" || slug === "studio-nova") {
            setIsDemo(true);
            setBusiness({
              id: "demo-id",
              name: matchedSector?.exampleName || (slug === "dr-ahmet" ? "Dr. Ahmet Yılmaz Diş Kliniği" : "Örnek Randevu İşletmesi"),
              slug: slug,
              category: matchedSector?.category || "Sağlık & Estetik",
              services: [
                {
                  id: "s1",
                  name: "İmplant ve Gülüş Tasarımı Konsültasyonu",
                  duration_minutes: 30,
                  price_text: "Ücretsiz",
                  price: 0,
                  description: "3D Tomografi analizi ve ağız içi tarama planlaması.",
                },
                {
                  id: "s2",
                  name: "Lazerli Diş Beyazlatma (Bleaching)",
                  duration_minutes: 60,
                  price_text: "₺3.000",
                  price: 3000,
                  description: "Tek seansta 3-4 tona kadar etkili beyazlatma.",
                },
                {
                  id: "s3",
                  name: "Estetik Kompozit Dolgu & Bakım",
                  duration_minutes: 45,
                  price_text: "₺1.200",
                  price: 1200,
                  description: "Kırık, aşınmış veya çürük diş onarımı.",
                },
              ],
            });
          } else {
            // Empty clean state for brand new unregistered business slug
            setIsDemo(false);
            setBusiness({
              id: "new-user-id",
              name: slug.replace(/-/g, " ").toUpperCase(),
              slug: slug,
              category: "Randevu Formu",
              services: [],
            });
          }
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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
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

      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none -z-10" />

      {/* Top Demo Banner if this is an example showcase */}
      {isDemo && (
        <div className="max-w-4xl mx-auto w-full mb-6 p-3.5 rounded-2xl bg-gradient-to-r from-indigo-900/60 to-purple-900/60 border border-indigo-500/30 text-center text-xs text-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 shadow-lg">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>💡 <strong>Örnek Şablon Sayfası:</strong> Bu sayfa sistem özelliklerini göstermek amacıyla hazırlanmış bir demodur.</span>
          </div>
          <Link
            href="/login"
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1 shrink-0 transition-all hover:scale-105"
          >
            Kendi Sayfanı Oluştur <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-4xl mx-auto w-full">
        {business?.services && business.services.length > 0 ? (
          <BookingWidget
            businessName={business.name}
            businessSlug={business.slug}
            category={business.category}
            services={business.services}
            tenantId={business.id}
          />
        ) : (
          <div className="p-12 rounded-3xl bg-slate-900/80 border border-slate-800 text-center space-y-4 max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mx-auto">
              <CalendarDays className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-white">{business?.name || slug}</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Bu işletmeye ait henüz aktif bir hizmet veya randevu formu tanımlanmamış.
            </p>
            <div className="pt-2">
              <Link
                href="/login"
                className="inline-flex px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all hover:scale-105"
              >
                İşletme Girişi Yap & Formu Düzenle
              </Link>
            </div>
          </div>
        )}
      </main>

      <footer className="mt-12 text-center text-xs text-slate-500">
        <div className="flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-indigo-400" />
          <span>Güvenli & KVKK Uyumlu Randevu Altyapısı — randevuformu.com</span>
        </div>
      </footer>
    </div>
  );
}
