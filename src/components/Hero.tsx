"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Play,
  Shield,
  Clock,
  CheckCircle2,
  MessageSquare,
  CalendarCheck,
  Users,
  Star,
} from "lucide-react";
import { motion } from "framer-motion";

/* ── Animated Slot Row (Dashboard Mockup) ── */
function SlotRow({
  time,
  name,
  service,
  status,
  delay,
}: {
  time: string;
  name: string;
  service: string;
  status: "confirmed" | "pending" | "sms_sent";
  delay: number;
}) {
  const statusConfig = {
    confirmed: { label: "Onaylandı", color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
    pending: { label: "Bekliyor", color: "text-amber-600 bg-amber-50 border-amber-200" },
    sms_sent: { label: "SMS İletildi", color: "text-sky-600 bg-sky-50 border-sky-200" },
  };

  const s = statusConfig[status];

  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors group"
    >
      <span className="text-xs font-mono font-medium text-slate-400 w-11 shrink-0 tabular-nums">
        {time}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-[#0F2A4A] truncate">{name}</p>
        <p className="text-[11px] text-slate-400 truncate">{service}</p>
      </div>
      <span
        className={`text-[10px] font-medium px-2 py-0.5 rounded-md border ${s.color} shrink-0`}
      >
        {s.label}
      </span>
    </motion.div>
  );
}

/* ── Capacity Bar ── */
function CapacityBar({ label, percent, color }: { label: string; percent: number; color: string }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-slate-500">{label}</span>
        <span className="text-[11px] font-semibold text-[#0F2A4A] tabular-nums">{percent}%</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ delay: 0.6, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </div>
  );
}

/* ── Mini Metric Card ── */
function MetricCard({
  icon: Icon,
  label,
  value,
  change,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  change: string;
}) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-lg p-3 space-y-1">
      <div className="flex items-center gap-1.5">
        <Icon className="w-3.5 h-3.5 text-[#0062FF]" strokeWidth={1.75} />
        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">{label}</span>
      </div>
      <p className="text-lg font-semibold text-[#0F2A4A] tracking-tight tabular-nums">{value}</p>
      <p className="text-[10px] text-emerald-600 font-medium">{change}</p>
    </div>
  );
}

/* ═══════════════════════════════════════
   HERO SECTION
   ═══════════════════════════════════════ */
export default function Hero() {
  const [currentSlot, setCurrentSlot] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlot((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative bg-[#FAFBFC] overflow-hidden">
      {/* Subtle geometric accent — NOT a neon glow */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-[#00BCD4]/[0.04] to-transparent rounded-full -translate-y-1/3 translate-x-1/3 pointer-events-none" />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-20 sm:py-28">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* ── Left Column: Value Proposition ── */}
          <div className="space-y-8">
            {/* Trust Badge */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="inline-flex items-center gap-2 text-[12px] font-medium text-[#0062FF] bg-[#0062FF]/[0.06] border border-[#0062FF]/[0.12] px-3 py-1.5 rounded-lg">
                <Shield className="w-3.5 h-3.5" strokeWidth={1.75} />
                Online Randevu &amp; Müşteri Yönetimi
              </span>
            </motion.div>

            {/* Headline */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-4"
            >
              <h1 className="text-3xl sm:text-5xl lg:text-[3.25rem] font-bold tracking-[-0.03em] leading-[1.15] text-[#0F2A4A]">
                Randevularınızı <span className="text-[#0062FF]">kolayca</span> yönetin, işinize odaklanın.
              </h1>
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-lg">
                WhatsApp hatırlatmaları, otomatik takvim eşitleme ve online randevu formu. Kurulum sadece 1 dakika sürer.
              </p>
            </motion.div>

            {/* CTA Group */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 bg-[#00BCD4] hover:bg-[#00acc1] text-white text-sm font-medium px-6 py-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-150 active:scale-[0.98]"
              >
                Ücretsiz Başlayın
                <ArrowRight className="w-4 h-4" strokeWidth={2} />
              </Link>
              <Link
                href="/ornek"
                className="inline-flex items-center justify-center gap-2 bg-white text-slate-700 text-sm font-medium px-6 py-3 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-sm transition-all duration-150"
              >
                <Play className="w-3.5 h-3.5 text-slate-400" strokeWidth={2} />
                Canlı Demoyu İncele
              </Link>
            </motion.div>

            {/* Social Proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="flex items-center gap-4 pt-2"
            >
              <div className="flex -space-x-2">
                {[
                  "bg-[#0062FF]",
                  "bg-[#00BCD4]",
                  "bg-[#0F2A4A]",
                  "bg-slate-400",
                ].map((bg, i) => (
                  <div
                    key={i}
                    className={`w-8 h-8 rounded-full ${bg} border-2 border-white flex items-center justify-center text-[10px] font-bold text-white`}
                  >
                    {["A", "B", "E", "+"][i]}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-3.5 h-3.5 fill-amber-400 text-amber-400"
                      strokeWidth={0}
                    />
                  ))}
                </div>
                <p className="text-[12px] text-slate-400 mt-0.5">
                  500+ işletme tarafından tercih ediliyor
                </p>
              </div>
            </motion.div>
          </div>

          {/* ── Right Column: Interactive Dashboard Mockup ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <div className="bg-white border border-slate-200/80 rounded-xl shadow-md overflow-hidden">
              {/* Mockup Title Bar */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium ml-2">
                    Randevu Paneli
                  </span>
                </div>
                <span className="text-[10px] text-slate-300 font-mono">randevuformu.com</span>
              </div>

              {/* Metrics Row */}
              <div className="grid grid-cols-3 gap-3 p-4 border-b border-slate-100">
                <MetricCard
                  icon={CalendarCheck}
                  label="Bugün"
                  value="12"
                  change="+3 yeni randevu"
                />
                <MetricCard
                  icon={Users}
                  label="Doluluk"
                  value="%87"
                  change="+12% bu hafta"
                />
                <MetricCard
                  icon={MessageSquare}
                  label="Teyit"
                  value="10/12"
                  change="2 bekliyor"
                />
              </div>

              {/* Appointment List */}
              <div className="px-4 py-3 border-b border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-[12px] font-semibold text-[#0F2A4A] uppercase tracking-wider">
                    Bugünkü Seanslar
                  </h3>
                  <span className="text-[10px] text-[#00BCD4] font-medium">
                    Canlı
                    <span className="inline-block w-1.5 h-1.5 bg-[#00BCD4] rounded-full ml-1 animate-pulse" />
                  </span>
                </div>

                <div className="space-y-0.5">
                  <SlotRow
                    time="09:30"
                    name="Zeynep K."
                    service="Diş Muayenesi"
                    status="confirmed"
                    delay={0.4}
                  />
                  <SlotRow
                    time="10:15"
                    name="Burak T."
                    service="Saç Kesim & Sakal"
                    status="sms_sent"
                    delay={0.5}
                  />
                  <SlotRow
                    time="11:00"
                    name="Elif M."
                    service="Beslenme Danışmanlığı"
                    status="confirmed"
                    delay={0.6}
                  />
                  <SlotRow
                    time="13:30"
                    name="Ahmet D."
                    service="Psikolojik Danışmanlık"
                    status="pending"
                    delay={0.7}
                  />
                </div>
              </div>

              {/* Capacity Footer */}
              <div className="px-4 py-3 space-y-2.5">
                <CapacityBar label="Koltuk Doluluk" percent={87} color="bg-[#0062FF]" />
                <CapacityBar label="Haftalık Hedef" percent={72} color="bg-[#00BCD4]" />
              </div>
            </div>

            {/* Floating Mini Notification */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="absolute -bottom-4 -left-4 bg-white border border-slate-200 rounded-lg shadow-md px-3 py-2 flex items-center gap-2"
            >
              <div className="w-7 h-7 rounded-md bg-emerald-50 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-[11px] font-medium text-[#0F2A4A]">Randevu Onaylandı</p>
                <p className="text-[10px] text-slate-400">WhatsApp teyidi iletildi</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
