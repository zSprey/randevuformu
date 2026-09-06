"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Smartphone,
  Check,
  Copy,
  ExternalLink,
  QrCode,
  X,
  Bell,
  Sparkles,
  Apple,
} from "lucide-react";

interface BusinessCalendarSyncModalProps {
  tenant: string;
  businessName?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function BusinessCalendarSyncModal({
  tenant,
  businessName = "İşletme Randevuları",
  isOpen,
  onClose,
}: BusinessCalendarSyncModalProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"apple" | "google" | "qr">("apple");
  const [hostUrl, setHostUrl] = useState("https://randevuformu.com");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setHostUrl(window.location.origin);
    }
  }, []);

  const cleanTenant = tenant || "byerman";
  const httpFeedUrl = `${hostUrl}/api/calendar/feed?tenant=${cleanTenant}`;
  const webcalUrl = httpFeedUrl.replace(/^https?:\/\//, "webcal://");
  const googleCalUrl = `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(
    httpFeedUrl
  )}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(httpFeedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {}
  };

  // QR Kod URL (Google Chart API ile anında mobil okutulabilir QR)
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
    webcalUrl
  )}&bgcolor=ffffff&color=0F2A4A&margin=2`;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-[#0F172A]"
          >
            {/* Modal Header */}
            <div className="px-6 py-4.5 bg-gradient-to-r from-[#0F2A4A] to-[#1E3A8A] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                  <Smartphone className="w-5 h-5 text-[#38BDF8]" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base flex items-center gap-2">
                    <span>Telefon Takvimine Otomatik Bağla</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                      Canlı Eşitleme
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    Gelen her randevu telefonunuza otomatik düşer ve alarmı çalar.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {/* Feature Highlights */}
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-100 flex items-start gap-2">
                  <Bell className="w-4 h-4 text-[#0062FF] shrink-0 mt-0.5" />
                  <span className="text-blue-950 font-medium leading-snug">
                    Randevudan 1 saat ve 15 dk önce telefonda sesli bildirim çalar.
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-emerald-950 font-medium leading-snug">
                    Sıfır şifre/hesap gerektirir; 1 kez bağlamanız yeterlidir.
                  </span>
                </div>
              </div>

              {/* Platform Selector Tabs */}
              <div className="grid grid-cols-3 p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setActiveTab("apple")}
                  className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === "apple"
                      ? "bg-white text-[#0F2A4A] shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <Apple className="w-3.5 h-3.5" />
                  <span>iPhone / Mac</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("google")}
                  className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === "google"
                      ? "bg-white text-[#0062FF] shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5 text-[#0062FF]" />
                  <span>Google / Android</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("qr")}
                  className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === "qr"
                      ? "bg-white text-indigo-600 shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Kamerayla Okut</span>
                </button>
              </div>

              {/* Tab 1: Apple / iPhone */}
              {activeTab === "apple" && (
                <div className="space-y-3.5 text-center">
                  <p className="text-xs text-slate-600">
                    iPhone veya Mac cihazınızdaysanız, aşağıdaki butona bastığınızda iOS Takvim uygulaması doğrudan açılır ve aboneliği onaylamanızı ister:
                  </p>
                  <a
                    href={webcalUrl}
                    className="w-full py-3 px-4 rounded-xl bg-[#0062FF] hover:bg-[#0051d4] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-[0.99]"
                  >
                    <Apple className="w-4 h-4" />
                    <span>iPhone / Apple Takvimine Ekle (Tek Tık)</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <p className="text-[11px] text-slate-400">
                    Açılan pencerede <strong>&ldquo;Abone Ol&rdquo;</strong> &gt; <strong>&ldquo;Ekle&rdquo;</strong> demeniz yeterlidir.
                  </p>
                </div>
              )}

              {/* Tab 2: Google Takvim */}
              {activeTab === "google" && (
                <div className="space-y-3.5 text-center">
                  <p className="text-xs text-slate-600">
                    Google Takvim (Android / PC) kullanıyorsanız, Google Takvim hesabınıza tek tıkla canlı randevu takvimini ekleyebilirsiniz:
                  </p>
                  <a
                    href={googleCalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-[0.99]"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Google Takvime Abone Ol</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <p className="text-[11px] text-slate-400">
                    Açılan Google Takvim ekranında <strong>&ldquo;Takvim Ekle&rdquo;</strong> butonuna basın.
                  </p>
                </div>
              )}

              {/* Tab 3: QR Kod ile Telefona Okut */}
              {activeTab === "qr" && (
                <div className="space-y-3 text-center">
                  <p className="text-xs text-slate-600">
                    Şu anda bilgisayardaysanız, <strong>iPhone veya Android kameranızı</strong> aşağıdaki QR koda tutarak takvimi anında telefonunuza bağlayabilirsiniz:
                  </p>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl inline-block shadow-2xs">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={qrCodeUrl}
                      alt="Takvim QR Kodu"
                      className="w-44 h-44 mx-auto rounded-lg"
                      width={176}
                      height={176}
                    />
                  </div>
                  <p className="text-[11px] font-medium text-emerald-600">
                    Kamerayı açın &gt; Çıkan Takvim Bildirimine dokunun &gt; &ldquo;Abone Ol&rdquo; deyin.
                  </p>
                </div>
              )}

              {/* Direct Feed Link Copy */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">
                  Özel Takvim Akış Bağlantınız (iCal URL)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={httpFeedUrl}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-700 font-mono select-all focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Kopyalandı!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Kopyala</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>{businessName} Canlı Akışı</span>
              <button
                type="button"
                onClick={onClose}
                className="font-semibold text-slate-700 hover:text-[#0F2A4A] cursor-pointer"
              >
                Kapat
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
