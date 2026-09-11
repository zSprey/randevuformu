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
  Apple,
  Radio,
  Download,
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
      setTimeout(() => setCopied(false), 2500);
    } catch {}
  };

  // QR Kod URL
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(
    webcalUrl
  )}&bgcolor=ffffff&color=0F172A&margin=2`;

  const isApple = deviceType === "apple";
  const isAndroid = deviceType === "android";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden text-slate-900"
          >
            {/* Modal Header - Apple Minimalist */}
            <div className="px-5 pt-5 pb-4 flex items-center justify-between border-b border-slate-100 bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100/80 flex items-center justify-center text-[#0062FF]">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm sm:text-base text-slate-900 tracking-tight">
                      Takvime Canlı Bağla
                    </h3>
                    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200/60">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Canlı
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Gelen her randevu telefonunuza otomatik düşer
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

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              {/* Segmented Control: 2 Tabs only (fits all mobile screens cleanly) */}
              <div className="p-1 rounded-2xl bg-slate-100/80 border border-slate-200/60 grid grid-cols-2 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setMode("phone")}
                  className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    mode === "phone"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Telefonumdan Bağla</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMode("qr")}
                  className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    mode === "qr"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Kamerayla Okut (QR)</span>
                </button>
              </div>

              {/* MODE 1: TELEFONUMDAN BAĞLA */}
              {mode === "phone" && (
                <div className="space-y-3.5">
                  {/* Bilgi Şeridi */}
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-[11px] text-slate-600">
                    <div className="flex items-center gap-2 font-medium text-slate-800">
                      <Radio className="w-3.5 h-3.5 text-[#0062FF]" />
                      <span>Tam Otomatik &amp; Canlı Eşitleme</span>
                    </div>
                    <ul className="space-y-1 text-[11px] text-slate-500 pl-5 list-disc marker:text-slate-400">
                      <li>Randevular her 15 dakikada bir otomatik güncellenir.</li>
                      <li>Randevudan 1 saat ve 15 dk önce telefonunuzda sesli alarm çalar.</li>
                      <li>Şifre gerekmez; bir kez bağlamanız yeterlidir.</li>
                    </ul>
                  </div>

                  {/* ANDROID PLATFORM FLOW */}
                  {isAndroid && (
                    <>
                      {/* 1. Android Telefona Doğrudan Ekle (Sıfır Hata, Anında Açılır) */}
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
                              Android Takvimine Ekle (Tek Tık)
                            </div>
                            <div className="text-[10.5px] text-blue-100 font-normal">
                              Cihaz takviminizde açılır ve tüm randevuları kaydeder
                            </div>
                          </div>
                        </div>
                        <Download className="w-4 h-4 text-blue-200 shrink-0" />
                      </a>

                      {/* Android Açıklama Notu */}
                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600 space-y-1 text-left">
                        <p className="font-semibold text-slate-800">
                          📱 Nasıl Çalışır?
                        </p>
                        <p className="text-[10.5px] leading-relaxed text-slate-600">
                          Butona bastığınızda inen dosyaya dokunup <strong>&ldquo;Takvim ile Aç&rdquo;</strong> &gt; <strong>&ldquo;Tümünü Kaydet&rdquo;</strong> demeniz yeterlidir. Randevular doğrudan telefonunuzun takvimine eklenir.
                        </p>
                      </div>

                      {/* 2. Google Takvim Canlı Bulut Aboneliği (Masaüstü / Web) */}
                      <div className="pt-2 border-t border-slate-100 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-slate-700">Google Takvim Canlı Bulut Eşitlemesi</span>
                        </div>
                        <p className="text-[10.5px] text-slate-500 leading-relaxed text-left">
                          Google, mobil tarayıcılarda linkle otomatik abone olmayı engellediği için; canlı bulut aboneliği için aşağıdaki linki kopyalayıp bilgisayarınızdaki Google Takvim&apos;e ekleyebilirsiniz:
                        </p>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            readOnly
                            value={httpFeedUrl}
                            className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-[10.5px] text-slate-600 font-mono select-all focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={handleCopy}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                          >
                            {copied ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5 text-slate-600" />
                            )}
                            <span>{copied ? "Kopyalandı" : "Kopyala"}</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                  {/* APPLE (IPHONE / MAC) PLATFORM FLOW */}
                  {isApple && (
                    <>
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
                              Apple Takvimine Canlı Bağla
                            </div>
                            <div className="text-[10.5px] text-blue-100 font-normal">
                              iPhone Takvim uygulamasını açar ve canlı abone eder
                            </div>
                          </div>
                        </div>
                        <ExternalLink className="w-4 h-4 text-blue-200 shrink-0" />
                      </a>

                      {/* Apple İpucu */}
                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600 space-y-1 text-left">
                        <p className="text-[10.5px] leading-relaxed">
                          Açılan pencerede <strong>&ldquo;Abone Ol&rdquo;</strong> &gt; <strong>&ldquo;Ekle&rdquo;</strong> demeniz yeterlidir.
                        </p>
                        <p className="text-[10px] text-slate-400">
                          (Bağlantının doğrudan takvim uygulamasını açması için Safari önerilir).
                        </p>
                      </div>

                      {/* Yedek Doğrudan Takvim Dosyası */}
                      <a
                        href={downloadIcsUrl}
                        download={`${cleanTenant}-randevulari.ics`}
                        className="w-full py-2.5 px-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5 text-slate-600" />
                        <span>veya Takvimi Cihaza İndir</span>
                      </a>
                    </>
                  )}

                  {/* OTHER / GENERIC PLATFORM FLOW */}
                  {!isApple && !isAndroid && (
                    <>
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
                              Cihaz Takvimine Canlı Bağla
                            </div>
                            <div className="text-[10.5px] text-blue-100 font-normal">
                              Varsayılan takvim uygulamanızda canlı akışı başlatır
                            </div>
                          </div>
                        </div>
                        <ExternalLink className="w-4 h-4 text-blue-200 shrink-0" />
                      </a>

                      <a
                        href={googleCalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2.5 px-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-between transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-[#0062FF]" />
                          <span>Google Takvim (Masaüstü Web)</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-normal flex items-center gap-1">
                          Web&apos;de aç <ExternalLink className="w-3 h-3" />
                        </span>
                      </a>
                    </>
                  )}
                </div>
              )}

              {/* MODE 2: QR KOD (BİLGİSAYAR VEYA KAMERA) */}
              {mode === "qr" && (
                <div className="space-y-3 text-center">
                  <p className="text-xs text-slate-500">
                    Telefonunuzun kamerasını aşağıdaki koda tutun; takviminiz anında açılsın:
                  </p>

                  <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl inline-block shadow-xs">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={qrCodeUrl}
                      alt="Takvim QR Kodu"
                      className="w-48 h-48 mx-auto rounded-xl"
                      width={192}
                      height={192}
                    />
                  </div>

                  <p className="text-[11px] font-medium text-slate-600">
                    iPhone veya Android kamerasıyla okutup <strong>&ldquo;Abone Ol&rdquo;</strong> demeniz yeterlidir.
                  </p>

                  {/* Google Calendar Web for Desktop */}
                  <a
                    href={googleCalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Calendar className="w-3.5 h-3.5 text-[#0062FF]" />
                    <span>Bilgisayarda Google Takvime Ekle</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                </div>
              )}

              {/* Feed URL Copy - Ultra sleek & compact */}
              <div className="pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium mb-1.5">
                  <span>Özel Takvim Akış Bağlantısı (iCal URL)</span>
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
                    className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
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

            {/* Modal Footer */}
            <div className="px-5 py-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span className="font-medium truncate max-w-[240px]">{businessName}</span>
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
