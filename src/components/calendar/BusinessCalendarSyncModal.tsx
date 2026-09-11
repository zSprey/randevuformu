"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Smartphone,
  Check,
  Copy,
  QrCode,
  X,
  Apple,
  Download,
  ExternalLink,
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
  const [mode, setMode] = useState<"phone" | "qr">("phone");
  const [deviceType, setDeviceType] = useState<"android" | "apple" | "other">("other");
  const [hostUrl, setHostUrl] = useState("https://randevuformu.com");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setHostUrl(window.location.origin);
      const ua = navigator.userAgent.toLowerCase();
      if (/android/i.test(ua)) {
        setDeviceType("android");
        setMode("phone");
      } else if (/iphone|ipad|ipod/i.test(ua)) {
        setDeviceType("apple");
        setMode("phone");
      } else {
        setDeviceType("other");
        setMode("qr");
      }
    }
  }, []);

  const cleanTenant = tenant || "byerman";
  const httpFeedUrl = `${hostUrl}/api/calendar/feed?tenant=${cleanTenant}`;
  const downloadIcsUrl = `${httpFeedUrl}&download=1`;
  const webcalUrl = httpFeedUrl.replace(/^https?:\/\//, "webcal://");
  const googleCalUrl = `https://calendar.google.com/calendar/render?cid=${encodeURIComponent(
    httpFeedUrl
  )}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(httpFeedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
    webcalUrl
  )}&bgcolor=ffffff&color=0F172A&margin=2`;

  const isApple = deviceType === "apple";
  const isAndroid = deviceType === "android";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden text-slate-900"
          >
            {/* Header */}
            <div className="px-5 pt-5 pb-3.5 flex items-center justify-between border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#0062FF]">
                  <Calendar className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 leading-tight">
                    Takvime Bağla
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Randevular cebinize gelsin
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

            {/* Segmented Control */}
            <div className="p-4 space-y-4">
              <div className="p-1 rounded-2xl bg-slate-100 border border-slate-200/60 grid grid-cols-2 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setMode("phone")}
                  className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    mode === "phone"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Telefon</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMode("qr")}
                  className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    mode === "qr"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>QR Kod</span>
                </button>
              </div>

              {/* Mode: Phone */}
              {mode === "phone" && (
                <div className="space-y-3">
                  {/* Hero Button - Android */}
                  {isAndroid && (
                    <a
                      href={downloadIcsUrl}
                      download={`${cleanTenant}-randevulari.ics`}
                      className="w-full py-3.5 px-4 rounded-2xl bg-[#0062FF] hover:bg-[#0051d4] active:scale-[0.99] text-white font-bold text-sm flex items-center justify-between shadow-lg shadow-blue-600/20 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                          <Smartphone className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-left">
                          <div className="text-sm font-bold text-white leading-snug">
                            Telefon Takvimine Ekle
                          </div>
                          <div className="text-[11px] text-blue-100 font-normal">
                            Tek tıkla takviminizde açar ve kaydeder
                          </div>
                        </div>
                      </div>
                      <Download className="w-4 h-4 text-blue-200 shrink-0" />
                    </a>
                  )}

                  {/* Hero Button - Apple */}
                  {isApple && (
                    <a
                      href={webcalUrl}
                      className="w-full py-3.5 px-4 rounded-2xl bg-[#0062FF] hover:bg-[#0051d4] active:scale-[0.99] text-white font-bold text-sm flex items-center justify-between shadow-lg shadow-blue-600/20 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                          <Apple className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-left">
                          <div className="text-sm font-bold text-white leading-snug">
                            Apple Takvimine Bağla
                          </div>
                          <div className="text-[11px] text-blue-100 font-normal">
                            iPhone Takvim uygulamasında anında açar
                          </div>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-blue-200 shrink-0" />
                    </a>
                  )}

                  {/* Hero Button - Other / Desktop */}
                  {!isApple && !isAndroid && (
                    <div className="space-y-2">
                      <a
                        href={webcalUrl}
                        className="w-full py-3.5 px-4 rounded-2xl bg-[#0062FF] hover:bg-[#0051d4] active:scale-[0.99] text-white font-bold text-sm flex items-center justify-between shadow-lg shadow-blue-600/20 transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                            <Calendar className="w-5 h-5 text-white" />
                          </div>
                          <div className="text-left">
                            <div className="text-sm font-bold text-white leading-snug">
                              Takvim Uygulamasında Aç
                            </div>
                            <div className="text-[11px] text-blue-100 font-normal">
                              Varsayılan takvime otomatik bağlar
                            </div>
                          </div>
                        </div>
                        <ExternalLink className="w-4 h-4 text-blue-200 shrink-0" />
                      </a>

                      <a
                        href={googleCalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2.5 px-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                      >
                        <Calendar className="w-3.5 h-3.5 text-[#0062FF]" />
                        <span>Google Takvim&apos;de Aç</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Mode: QR */}
              {mode === "qr" && (
                <div className="space-y-3 text-center">
                  <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl inline-block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={qrCodeUrl}
                      alt="Takvim QR Kodu"
                      className="w-44 h-44 mx-auto rounded-xl"
                      width={176}
                      height={176}
                    />
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    Kameranızı koda tutun, takviminiz otomatik açılsın
                  </p>
                </div>
              )}

              {/* Single Minimalist Copy Link Box */}
              <div className="pt-2 border-t border-slate-100 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                  <span>Doğrudan Bağlantı Linki (iCal)</span>
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
