"use client";

import React from "react";
import {
  Lock,
  CalendarSync,
  MessageSquareText,
  CreditCard,
  QrCode,
  BarChart3,
  Users,
  Smartphone,
} from "lucide-react";
import { motion } from "framer-motion";

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  span?: "1" | "2";
  accentColor?: "blue" | "cyan" | "navy";
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  span = "1",
  accentColor = "blue",
}: FeatureCardProps) {
  const accentMap = {
    blue: {
      iconBg: "bg-[#0062FF]/[0.08]",
      iconColor: "text-[#0062FF]",
      hoverBorder: "hover:border-[#0062FF]/30",
    },
    cyan: {
      iconBg: "bg-[#00BCD4]/[0.08]",
      iconColor: "text-[#00BCD4]",
      hoverBorder: "hover:border-[#00BCD4]/30",
    },
    navy: {
      iconBg: "bg-[#0F2A4A]/[0.06]",
      iconColor: "text-[#0F2A4A]",
      hoverBorder: "hover:border-[#0F2A4A]/20",
    },
  };

  const a = accentMap[accentColor];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`bg-white border border-slate-200/80 rounded-xl p-6 ${a.hoverBorder} hover:shadow-md transition-all duration-200 group ${
        span === "2" ? "md:col-span-2" : ""
      }`}
    >
      <div
        className={`w-10 h-10 rounded-lg ${a.iconBg} flex items-center justify-center mb-4`}
      >
        <Icon className={`w-5 h-5 ${a.iconColor}`} strokeWidth={1.75} />
      </div>
      <h3 className="text-[15px] font-semibold text-[#0F2A4A] mb-2 tracking-tight">
        {title}
      </h3>
      <p className="text-[13px] text-slate-500 leading-relaxed">{description}</p>
    </motion.div>
  );
}

const features: FeatureCardProps[] = [
  {
    icon: Lock,
    title: "Atomik Çakışma Kilidi",
    description:
      "Aynı saniyede gelen iki randevu talebi milisaniyelik lock mekanizmasıyla korunur. Çifte rezervasyon riski sıfıra indirilir.",
    accentColor: "navy",
    span: "1",
  },
  {
    icon: CalendarSync,
    title: "Çift Yönlü Takvim Eşitleme",
    description:
      "Google Takvim ve Microsoft Outlook ile anlık senkronizasyon. Kişisel programınızdaki meşgul saatler otomatik olarak bloke edilir.",
    accentColor: "blue",
    span: "2",
  },
  {
    icon: MessageSquareText,
    title: "Otomatik WhatsApp & SMS Teyit",
    description:
      "Randevu oluşturulduğu anda ve 2 saat öncesinde otomatik bildirimler gönderilir. No-show oranı ortalama %85 düşer.",
    accentColor: "cyan",
    span: "2",
  },
  {
    icon: CreditCard,
    title: "İyzico Sanal POS & E-Arşiv",
    description:
      "Ön kapora veya tam ücret tahsilatı yaparak boş koltuk kaybını önleyin. GİB uyumlu otomatik e-arşiv fatura entegrasyonu.",
    accentColor: "blue",
    span: "1",
  },
  {
    icon: QrCode,
    title: "QR Masa Standı & Widget",
    description:
      "Bekleme salonunuzda akrilik stand üzerindeki QR kodu ile danışanlar saniyeler içinde sonraki randevularını oluşturur.",
    accentColor: "cyan",
    span: "1",
  },
  {
    icon: Users,
    title: "Çoklu Uzman & Personel Yönetimi",
    description:
      "Her uzmanın çalışma saatleri, tatil günleri ve hizmet süreleri bağımsız olarak yönetilir. Round-Robin randevu dağıtımı.",
    accentColor: "navy",
    span: "1",
  },
  {
    icon: Smartphone,
    title: "Instagram & Web Entegrasyonu",
    description:
      "Bio linkinizden veya web sitenizden tek tıkla randevu formu. Müşterileriniz 7/24 kesintisiz rezervasyon yapabilir.",
    accentColor: "blue",
    span: "1",
  },
  {
    icon: BarChart3,
    title: "Gerçek Zamanlı Analitik Panel",
    description:
      "Doluluk oranları, ciro tahminleri, no-show riskleri ve bekleme listesi metrikleri tek ekranda. Veriye dayalı karar alın.",
    accentColor: "cyan",
    span: "2",
  },
];

export default function Features() {
  return (
    <section id="ihtiyaclar" className="bg-[#FAFBFC] py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="text-[12px] font-semibold text-[#00BCD4] uppercase tracking-widest">
              Platform Altyapısı
            </span>
            <h2 className="text-3xl sm:text-[2.5rem] font-bold text-[#0F2A4A] tracking-[-0.03em] mt-3 mb-4 leading-tight">
              İşletmenizi büyüten
              <br />
              <span className="text-[#0062FF]">her özellik</span> tek panelde.
            </h2>
            <p className="text-base text-slate-500 leading-relaxed">
              Randevu yönetiminden ödeme tahsilatına, takvim eşitlemeden müşteri
              iletişimine kadar tüm operasyonunuzu tek bir altyapıdan yönetin.
            </p>
          </motion.div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {features.map((feature, i) => (
            <FeatureCard key={i} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
