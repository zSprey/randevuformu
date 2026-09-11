"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Check,
  Copy,
  QrCode,
  X,
  Apple,
  ExternalLink,
  Sparkles,
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
  const [activePlatform, setActivePlatform] = useState<"google" | "apple" | "qr">("google");
  const [hostUrl, setHostUrl] = useState("https://randevuformu.com");
  const [googleStepActive, setGoogleStepActive] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setHostUrl(window.location.origin);
      const ua = navigator.userAgent.toLowerCase();
      if (/iphone|ipad|ipod|macintosh/i.test(ua)) {
        setActivePlatform("apple");
      } else {
        setActivePlatform("google");
      }
    }
  }, []);

  const cleanTenant = tenant || "byerman";
  const httpFeedUrl = `${hostUrl}/api/calendar/feed?tenant=${cleanTenant}`;
  const webcalUrl = httpFeedUrl.replace(/^https?:\/\//, "webcal://");
  
  // Google Calendar official direct URL-add screen
  const googleAddByUrl = "https://calendar.google.com/calendar/u/0/r/settings/addbyurl";
  const googleRenderUrl = `https://calendar.google.com/calendar/render?cid=${encodeURIComponent(
    httpFeedUrl
  )}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(httpFeedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {}
  };

  const handleGoogleConnect = async () => {
    try {
      await navigator.clipboard.writeText(httpFeedUrl);
      setCopied(true);
      setGoogleStepActive(true);
    } catch {}

    // Open Google Calendar direct add URL in new window
    window.open(googleAddByUrl, "_blank", "noopener,noreferrer");
  };

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
    webcalUrl
  )}&bgcolor=ffffff&color=0F172A&margin=2`;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden text-slate-900"
          >
            {/* Header */}
            <div className="px-5 pt-5 pb-3.5 flex items-center justify-between border-b border-slate-100 bg-white">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#0062FF]">
                  <Calendar className="w-4.5 h-4.5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-sm text-slate-900 leading-tight">
                      Takvime Canlı Bağla
                    </h3>
                    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200/60">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Canlı Akış
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Yeni gelen her randevu telefonunuza otomatik düşer
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Kapat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Platform Selector Tabs */}
            <div className="p-4 space-y-4">
              <div className="p-1 rounded-2xl bg-slate-100 border border-slate-200/60 grid grid-cols-3 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setActivePlatform("google")}
                  className={`py-2 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center ${
                    activePlatform === "google"
                      ? "bg-white text-[#0F2A4A] shadow-xs"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5 text-[#0062FF]" />
                  <span>Google / Android</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActivePlatform("apple")}
                  className={`py-2 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center ${
                    activePlatform === "apple"
                      ? "bg-white text-[#0F2A4A] shadow-xs"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <Apple className="w-3.5 h-3.5 text-slate-900" />
                  <span>Apple / iOS</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActivePlatform("qr")}
                  className={`py-2 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center ${
                    activePlatform === "qr"
                      ? "bg-white text-[#0F2A4A] shadow-xs"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5 text-slate-600" />
                  <span>QR Kod</span>
                </button>
              </div>

              {/* 1. GOOGLE TAKVİM CANLI BAĞLANTISI */}
              {activePlatform === "google" && (
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={handleGoogleConnect}
                    className="w-full py-3.5 px-4 rounded-2xl bg-[#0062FF] hover:bg-[#0051d4] active:scale-[0.99] text-white font-bold text-sm flex items-center justify-between shadow-lg shadow-blue-600/20 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                        <Calendar className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-bold text-white leading-snug">
                          Google Takvim&apos;e Canlı Bağla
                        </div>
                        <div className="text-[11px] text-blue-100 font-normal">
                          Android telefon ve tüm cihazlarınızda canlı eşitler
                        </div>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-blue-200 shrink-0" />
                  </button>

                  {/* Canlı Bağlantı Rehberi */}
                  <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-100 text-slate-700 text-xs space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-[#0F2A4A]">
                      <Sparkles className="w-3.5 h-3.5 text-[#0062FF]" />
                      <span>Nasıl Canlı Bağlanır?</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Butona bastığınızda canlı akış linkiniz <strong>otomatik kopyalanır</strong> ve Google Takvim ekranı açılır. Açılan kutucuğa yapıştırıp <strong>&ldquo;Takvim Ekle&rdquo;</strong> butonuna basmanız yeterlidir.
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium pt-0.5">
                      ✓ Dosya indirmenize gerek yoktur; randevular telefonunuza canlı düşer.
                    </p>
                  </div>

                  {googleStepActive && (
                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Bağlantı linki panoya kopyalandı! Açılan Google penceresine yapıştırınız.</span>
                    </div>
                  )}

                  {/* Alternatif Doğrudan Link */}
                  <a
                    href={googleRenderUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Alternatif doğrudan Google Takvim linki</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                </div>
              )}

              {/* 2. APPLE TAKVİM CANLI BAĞLANTISI (IPHONE & MAC) */}
              {activePlatform === "apple" && (
                <div className="space-y-3">
                  <a
                    href={webcalUrl}
                    className="w-full py-3.5 px-4 rounded-2xl bg-[#0F2A4A] hover:bg-[#1a385c] active:scale-[0.99] text-white font-bold text-sm flex items-center justify-between shadow-lg shadow-slate-900/20 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                        <Apple className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-bold text-white leading-snug">
                          Apple Takvimine Canlı Abone Ol
                        </div>
                        <div className="text-[11px] text-slate-300 font-normal">
                          iPhone Takvim uygulamasını açar ve canlı bağlar
                        </div>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-300 shrink-0" />
                  </a>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-slate-700 text-xs space-y-1">
                    <div className="font-bold text-[#0F2A4A] flex items-center gap-1.5">
                      <Apple className="w-3.5 h-3.5 text-slate-900" />
                      <span>iPhone &amp; iPad İçin:</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Butona dokunduğunuzda iPhone ekranında çıkan <strong>&ldquo;Abone Ol&rdquo;</strong> &gt; <strong>&ldquo;Ekle&rdquo;</strong> onayına basmanız yeterlidir. Randevular telefonunuzda anında canlı eşitlenir.
                    </p>
                  </div>
                </div>
              )}

              {/* 3. QR KOD İLE BAĞLAN */}
              {activePlatform === "qr" && (
                <div className="space-y-3 text-center">
                  <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl inline-block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={qrCodeUrl}
                      alt="Takvim Canlı Akış QR Kodu"
                      className="w-44 h-44 mx-auto rounded-xl"
                      width={176}
                      height={176}
                    />
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    Telefon kameranızı koda tutun, takvim aboneliğiniz tek dokunuşla başlasın.
                  </p>
                </div>
              )}

              {/* Single Minimalist Copy Link Box (Zero File Download) */}
              <div className="pt-2 border-t border-slate-100 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                  <span>Canlı Takvim Akış Bağlantısı (iCal URL)</span>
                  {copied && <span className="text-emerald-600 font-semibold">Kopyalandı!</span>}
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    readOnly
                    value={httpFeedUrl}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 font-mono select-all focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 text-xs font-semibold flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-slate-600" />
                    )}
                    <span>{copied ? "Tamam" : "Kopyala"}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Clean Modal Footer */}
            <div className="px-5 py-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="font-medium truncate max-w-[200px]">{businessName}</span>
              <button
                type="button"
                onClick={onClose}
                className="font-semibold text-slate-700 hover:text-slate-900 cursor-pointer"
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
