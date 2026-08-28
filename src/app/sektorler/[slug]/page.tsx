"use client";

import React, { use } from "react";
import Link from "next/link";
import {
  CalendarDays,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Shield,
  Zap,
  MessageCircle,
  Star,
  Users,
  Building2,
  ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";

interface SektorConfig {
  title: string;
  badge: string;
  heroHeadline: string;
  heroSub: string;
  painPoints: string[];
  features: { title: string; desc: string }[];
  exampleSlug: string;
  exampleName: string;
}

const SEKTOR_DATA: Record<string, SektorConfig> = {
  "dis-hekimi": {
    title: "Diş Hekimleri & Diş Klinikleri İçin Online Randevu Yazılımı",
    badge: "🦷 Diş Sağlığı & Poliklinik Çözümü",
    heroHeadline: "Hastalarınız 7/24 Randevu Alsın, Tedavi Planlarınız Aksamasın.",
    heroSub: "Telefon trafiğini %80 azaltın. İmplant, kanal tedavisi ve ortodonti randevularını SMS ve WhatsApp onaylı yönetin.",
    painPoints: ["Randevuya gelmeyen hastalar (No-show)", "Sekreterya telefon yoğunluğu", "Çakışan seans saatleri"],
    features: [
      { title: "3D Tomografi & Ön Muayene Formu", desc: "Hastalar randevu alırken şikayetlerini ve röntgen dosyalarını iletsin." },
      { title: "Otomatik WhatsApp Hatırlatma", desc: "Randevudan 24 saat ve 2 saat önce giden onay mesajları ile no-show'u bitirin." },
      { title: "Çoklu Hekim & Koltuk Yönetimi", desc: "Her hekime ve tedavi koltuğuna özel bağımsız çalışma takvimleri." },
    ],
    exampleSlug: "dr-ahmet",
    exampleName: "Dr. Ahmet Yılmaz Diş Kliniği",
  },
  "kuafor": {
    title: "Kuaför & Güzellik Salonları İçin Online Rezervasyon Sistemi",
    badge: "✂️ Kuaför & Beauty Studio Çözümü",
    heroHeadline: "Güzellik Salonunuz İçin VIP Randevu Deneyimi.",
    heroSub: "Saç kesimi, sombre, keratin bakımı ve tırnak işlemlerinde müşterileriniz istediği uzmandan saniyeler içinde yer ayırsın.",
    painPoints: ["Instagram DM'lerinden randevu yakalama karmaşası", "Hangi uzmanın hangi saatte dolu olduğunu takip edememe", "Yoğun Cumartesi kuyrukları"],
    features: [
      { title: "Uzman Bazlı Randevu Seçimi", desc: "Müşteriler dilediği kuaför veya maniküristi seçerek randevu alsın." },
      { title: "Hizmet Süresi & Fiyat Netliği", desc: "İşlem süreleri (90 dk, 120 dk) takvimde otomatik kilitlensin." },
      { title: "Ön Kapora / İyzico Ödeme", desc: "Randevu sırasında güvenli kapora alarak iptalleri sıfırlayın." },
    ],
    exampleSlug: "studio-nova",
    exampleName: "Studio Nova Kuaför",
  },
  "psikolog": {
    title: "Psikologlar & Terapistler İçin Güvenli Online Seans Takvimi",
    badge: "🧠 Psikoloji & Terapi Danışmanlığı",
    heroHeadline: "Danışanlarınız İçin Gizli, KVKK Uyumlu ve Güvenli Seans Yönetimi.",
    heroSub: "Bireysel terapi, çift terapisi ve online seanslarınızı Google Meet / Zoom linkleri ile otomatik senkronize edin.",
    painPoints: ["Seans ücreti tahsilat takibi", "Zaman dilimi karışıklıkları", "KVKK ve danışan gizliliği"],
    features: [
      { title: "Otomatik Online Toplantı Linki", desc: "Randevu oluştuğu an Zoom/Google Meet bağlantısı oluşturulup iletilir." },
      { title: "KVKK Uyumlu Şifreli Altyapı", desc: "Danışan bilgileri banka seviyesinde SSL ve KVKK ile korunur." },
      { title: "Dinamik Ön Görüşme Formu", desc: "Seans öncesi danışan öyküsü için özel sorular tanımlayın." },
    ],
    exampleSlug: "psk-melis",
    exampleName: "Uzm. Psk. Melis Aktaş",
  },
};

export default function SektorLandingPage({ params }: { params: Promise<{ slug: string }> | { slug: string } }) {
  const resolvedParams = "then" in params ? use(params as Promise<{ slug: string }>) : params;
  const slug = resolvedParams?.slug || "dis-hekimi";

  const data = SEKTOR_DATA[slug] || SEKTOR_DATA["dis-hekimi"];

  return (
    <div className="min-h-screen bg-[#0B0F17] text-white selection:bg-indigo-500 font-sans">
      {/* Navbar */}
      <header className="fixed top-0 w-full z-50 bg-[#0B0F17]/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600 text-white">
              <CalendarDays className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-white">randevuformu</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-xs font-semibold text-slate-300 hover:text-white">
              Giriş Yap
            </Link>
            <Link
              href="/login"
              className="text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-full transition-all"
            >
              Ücretsiz Başla
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="pt-32 pb-20 px-6 max-w-6xl mx-auto space-y-20">
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            {data.badge}
          </span>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight text-white">
            {data.heroHeadline}
          </h1>
          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto">
            {data.heroSub}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/login"
              className="px-8 py-4 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 flex items-center gap-2"
            >
              Hemen Kliniğinizi / Salonunuzu Ekleyin <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href={`/${data.exampleSlug}`}
              className="px-8 py-4 rounded-full bg-white/10 hover:bg-white/15 text-slate-200 font-semibold text-sm border border-white/10"
            >
              Örnek Rezervasyon Sayfası ({data.exampleName})
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6">
          {data.features.map((f, i) => (
            <div key={i} className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold">
                0{i + 1}
              </div>
              <h3 className="font-bold text-lg text-white">{f.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
