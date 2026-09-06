"use client";

import React, { useState } from "react";
import { Calendar, Bell, Check, Apple, ExternalLink } from "lucide-react";
import {
  CalendarEventParams,
  generateSingleEventIcs,
  generateGoogleCalendarUrl,
} from "@/lib/calendar/icalGenerator";

interface CustomerCalendarButtonProps {
  event: CalendarEventParams;
  className?: string;
}

export function CustomerCalendarButton({ event, className = "" }: CustomerCalendarButtonProps) {
  const [added, setAdded] = useState(false);

  // 1. Apple & Telefon Yerel Takvimine Ekle (.ics Dosyası ile Çift Alarmlı)
  const handleDownloadIcs = () => {
    try {
      const icsData = generateSingleEventIcs(event);
      const blob = new Blob([icsData], { type: "text/calendar;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      const cleanFileName = `randevu-${event.date || "tarih"}.ics`;
      link.setAttribute("download", cleanFileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setAdded(true);
      setTimeout(() => setAdded(false), 4000);
    } catch (e) {
      console.error("Takvim dosyası indirme hatası:", e);
    }
  };

  // 2. Google Takvim URL
  const googleCalUrl = generateGoogleCalendarUrl(event);

  return (
    <div className={`space-y-2.5 ${className}`}>
      {/* Ana Vurgulu Buton: Telefon Takvimine Kaydet */}
      <button
        type="button"
        onClick={handleDownloadIcs}
        className="w-full py-3 px-4 rounded-xl bg-[#0062FF] hover:bg-[#0051d4] text-white font-bold text-xs sm:text-sm flex flex-col items-center justify-center gap-1 shadow-md hover:shadow-lg transition-all active:scale-[0.99] cursor-pointer"
      >
        <div className="flex items-center gap-2">
          {added ? (
            <Check className="w-4 h-4 text-emerald-300 stroke-[2.5]" />
          ) : (
            <Calendar className="w-4 h-4" />
          )}
          <span>
            {added ? "Takvim Dosyası Açıldı!" : "Telefon Takvimine Kaydet & Hatırlatıcı Kur"}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-blue-100 font-normal">
          <Bell className="w-3 h-3 text-[#38BDF8]" />
          <span>Randevudan 1 gün ve 1 saat önce otomatik sesli bildirim çalar</span>
        </div>
      </button>

      {/* İkili Hızlı Seçim: iPhone / Apple ve Google Takvim */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={handleDownloadIcs}
          className="py-2.5 px-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
        >
          <Apple className="w-3.5 h-3.5 text-slate-800" />
          <span>iPhone / Apple Takvim</span>
        </button>

        <a
          href={googleCalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="py-2.5 px-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-[#0062FF] flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Google Takvim</span>
          <ExternalLink className="w-3 h-3 text-slate-400" />
        </a>
      </div>
    </div>
  );
}
