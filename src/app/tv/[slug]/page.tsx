"use client";

import React, { useState, useEffect, use } from "react";
import {
  Clock,
  Volume2,
  VolumeX,
  Sparkles,
  Maximize2,
  User,
  ShieldCheck,
  Calendar,
  Building2,
  Activity,
} from "lucide-react";

interface TVProps {
  params: Promise<{ slug: string }> | { slug: string };
}

interface TVQueueItem {
  id: string;
  maskedName: string;
  service: string;
  doctor: string;
  room: string;
  time: string;
  status: "IN_TREATMENT" | "NEXT" | "WAITING";
}

export default function ReceptionTVPage({ params }: TVProps) {
  const resolvedParams = "then" in params ? use(params as Promise<{ slug: string }>) : params;
  const slug = resolvedParams?.slug || "dr-ahmet";

  const businessTitle = slug.replace(/-/g, " ").toUpperCase();
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);

  // Sample real-time queue
  const queue: TVQueueItem[] = [
    {
      id: "q-1",
      maskedName: "Z*** D***",
      service: "Zirkonyum Kaplama & Estetik",
      doctor: "Dr. Ahmet Yılmaz",
      room: "Muayene Odası 1",
      time: "14:00",
      status: "IN_TREATMENT",
    },
    {
      id: "q-2",
      maskedName: "M*** C*** Y***",
      service: "Diş Taşı Temizliği & Florür",
      doctor: "Dr. Ahmet Yılmaz",
      room: "Muayene Odası 1",
      time: "14:30",
      status: "NEXT",
    },
    {
      id: "q-3",
      maskedName: "A*** N*** Ş***",
      service: "Kompozit Dolgu",
      doctor: "Dr. Ayşe Kaya",
      room: "Muayene Odası 2",
      time: "15:00",
      status: "WAITING",
    },
    {
      id: "q-4",
      maskedName: "B*** Ö***",
      service: "Konsültasyon & Röntgen",
      doctor: "Dr. Ahmet Yılmaz",
      room: "Muayene Odası 1",
      time: "15:30",
      status: "WAITING",
    },
  ];

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      );
      setCurrentDate(
        now.toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const activePatient = queue.find((q) => q.status === "IN_TREATMENT") || queue[0];
  const nextPatient = queue.find((q) => q.status === "NEXT") || queue[1];
  const waitingPatients = queue.filter((q) => q.status === "WAITING");

  return (
    <div className="min-h-screen bg-[#05080E] text-slate-100 flex flex-col justify-between p-6 sm:p-10 select-none overflow-hidden font-sans">
      {/* Top Header Bar */}
      <header className="flex items-center justify-between border-b border-white/10 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-indigo-600/30">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <span className="text-[11px] font-black tracking-widest text-indigo-400 uppercase">
              Resepsiyon & Bekleme Odası Ekranı
            </span>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              {businessTitle}
            </h1>
          </div>
        </div>

        {/* Live Clock & Fullscreen Control */}
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-3xl sm:text-5xl font-black tracking-wider text-white font-mono">
              {currentTime}
            </div>
            <div className="text-xs sm:text-sm text-slate-400 font-medium capitalize mt-1">
              {currentDate}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsAudioEnabled(!isAudioEnabled)}
              className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 transition-colors border border-white/10"
              title={isAudioEnabled ? "Ses Açık" : "Ses Kapalı"}
            >
              {isAudioEnabled ? <Volume2 className="w-5 h-5 text-indigo-400" /> : <VolumeX className="w-5 h-5" />}
            </button>
            <button
              type="button"
              onClick={handleFullscreen}
              className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 transition-colors border border-white/10"
              title="Tam Ekran"
            >
              <Maximize2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Screen Body: Two-Column Display */}
      <main className="grid lg:grid-cols-12 gap-8 my-8 flex-1 items-center">
        {/* Left Column: Current Patient Spotlight */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-8 sm:p-12 rounded-[2.5rem] bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-950 border-2 border-indigo-500/40 shadow-2xl relative overflow-hidden space-y-6">
            <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 blur-[100px] pointer-events-none rounded-full" />

            <div className="flex items-center justify-between">
              <span className="px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm font-black flex items-center gap-2 animate-pulse">
                <Activity className="w-4 h-4" /> SEANSTA / İÇERİDE
              </span>
              <span className="text-lg font-mono font-bold text-indigo-300">{activePatient.time}</span>
            </div>

            <div className="space-y-2">
              <span className="text-xs uppercase tracking-widest text-slate-400 font-bold">
                Danışan (KVKK Korumalı)
              </span>
              <div className="text-4xl sm:text-6xl font-black text-white tracking-tight">
                {activePatient.maskedName}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 pt-6 border-t border-white/10">
              <div className="space-y-1">
                <span className="text-xs text-slate-400">Hekim / Uzman:</span>
                <div className="text-lg font-bold text-indigo-300">{activePatient.doctor}</div>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-slate-400">Tedavi Odası:</span>
                <div className="text-lg font-bold text-white flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
                  {activePatient.room}
                </div>
              </div>
            </div>
          </div>

          {/* Next Patient Bar */}
          {nextPatient && (
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-amber-500/30 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 text-xs font-black">
                  SIRADAKİ
                </div>
                <div>
                  <div className="text-xl font-black text-white">{nextPatient.maskedName}</div>
                  <div className="text-xs text-slate-400">{nextPatient.service} • {nextPatient.doctor}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold font-mono text-amber-300">{nextPatient.time}</div>
                <span className="text-[11px] text-slate-500 font-medium">Lütfen hazır olunuz</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Upcoming Queue */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-400" /> Bekleme Odası Akışı
          </h3>

          <div className="space-y-3">
            {waitingPatients.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-colors"
              >
                <div className="space-y-1">
                  <div className="text-base font-bold text-white">{item.maskedName}</div>
                  <div className="text-xs text-slate-400">{item.service}</div>
                  <div className="text-[11px] text-indigo-400">{item.room}</div>
                </div>
                <div className="text-right space-y-1">
                  <div className="text-base font-bold font-mono text-slate-300">{item.time}</div>
                  <span className="px-2.5 py-0.5 rounded-md bg-white/5 text-[10px] text-slate-400 font-medium">
                    Sırada
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center gap-3 text-xs text-indigo-300">
            <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0" />
            <span>Hasta mahremiyeti ve KVKK Kanunu uyarınca tüm isimler ekranda şifreli gösterilmektedir.</span>
          </div>
        </div>
      </main>

      {/* Bottom Live Ticker Bar */}
      <footer className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-3">
          <span className="px-2 py-0.5 rounded bg-indigo-600 text-white font-black text-[10px]">
            CANLI SİSTEM
          </span>
          <span className="text-slate-400">
            randevuformu.com ile güçlendirilmiştir • Lütfen sıranız geldiğinde muayene odasına geçiniz.
          </span>
        </div>
        <div className="text-slate-400 font-mono text-[11px]">
          Ekran ID: TV-{slug.toUpperCase()}-4K
        </div>
      </footer>
    </div>
  );
}
