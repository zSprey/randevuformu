"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  QrCode,
  Printer,
  Copy,
  CheckCircle2,
  Sparkles,
  Download,
  Share2,
  CalendarDays,
  Code,
  ExternalLink,
  Wifi,
  Palette,
  ShieldCheck,
  Smartphone,
  Eye,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function QrStandPage() {
  const [businessName, setBusinessName] = useState("Dr. Ahmet Yılmaz Diş Kliniği");
  const [businessSlug, setBusinessSlug] = useState("dr-ahmet");
  const [tagline, setTagline] = useState("Sıra Beklemeden Randevunuzu Alın");
  const [subtext, setSubtext] = useState("Telefonunuzun kamerasını QR koda doğrultun.");
  const [showWifi, setShowWifi] = useState(true);
  const [wifiSsid, setWifiSsid] = useState("YilmazKlinik_Misafir");
  const [wifiPass, setWifiPass] = useState("Klinik2026");
  const [standTheme, setStandTheme] = useState<"dark" | "light" | "gold" | "indigo">("light");
  const [qrColor, setQrColor] = useState("4f46e5");

  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const bookingUrl = `https://randevuformu.com/${businessSlug}`;
  const qrCodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encodeURIComponent(
    bookingUrl
  )}&color=${qrColor}&bgcolor=${standTheme === "dark" ? "0f172a" : "ffffff"}`;

  const iframeEmbedCode = `<iframe 
  src="https://randevuformu.com/widget/${businessSlug}" 
  width="100%" 
  height="720" 
  frameborder="0" 
  style="border-radius: 16px; max-width: 600px; margin: 0 auto; display: block;"
></iframe>`;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(bookingUrl);
    setCopiedLink(true);
    showToast("Randevu linki panoya kopyalandı!");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyEmbed = () => {
    navigator.clipboard.writeText(iframeEmbedCode);
    setCopiedCode(true);
    showToast("İframe gömme kodu kopyalandı!");
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Toast Feedback */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-8 z-50 p-4 rounded-2xl bg-indigo-600 text-white font-semibold text-xs shadow-2xl flex items-center gap-2 border border-indigo-400"
          >
            <CheckCircle2 className="w-4 h-4 text-white" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Masaüstü Akrilik Stand & Web Widget
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            QR Masa Standı & Web Sitesi İframe Kodu
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Kliniğinizin veya salonunuzun bekleme alanına koyabileceğiniz yüksek çözünürlüklü QR stand çıktısı alın veya mevcut sitenize widget gömün.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleCopyLink}
            className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold hover:bg-slate-800 transition-all flex items-center gap-1.5"
          >
            <Copy className="w-3.5 h-3.5 text-indigo-400" />
            Linki Kopyala
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
          >
            <Printer className="w-4 h-4" />
            Standı Yazdır (A4 / A5)
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Controls */}
        <div className="lg:col-span-5 space-y-6">
          {/* Customizer Card */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Palette className="w-4 h-4 text-indigo-400" /> Stand Bilgilerini Özelleştirin
            </h3>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                İşletme / Klinik Başlığı
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Vurgu Metni (CTA)
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Açıklama Talimatı
              </label>
              <input
                type="text"
                value={subtext}
                onChange={(e) => setSubtext(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Stand Theme Selector */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Stand Tasarım Teması
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "light", name: "Klinik Beyazı", color: "4f46e5" },
                  { id: "dark", name: "Dark Luxury", color: "6366f1" },
                  { id: "gold", name: "Gold VIP", color: "b45309" },
                  { id: "indigo", name: "Neon Indigo", color: "4338ca" },
                ].map((th) => (
                  <button
                    key={th.id}
                    type="button"
                    onClick={() => {
                      setStandTheme(th.id as any);
                      setQrColor(th.color);
                    }}
                    className={`p-2.5 rounded-xl text-xs font-semibold border transition-all ${
                      standTheme === th.id
                        ? "bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-600/20"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    {th.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Wi-Fi Details Box Toggle */}
            <div className="pt-2 border-t border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Wifi className="w-3.5 h-3.5 text-indigo-400" />
                  Bekleme Salonu Wi-Fi Bilgisi Ekle
                </label>
                <input
                  type="checkbox"
                  checked={showWifi}
                  onChange={(e) => setShowWifi(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
              </div>

              {showWifi && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-0.5">Wi-Fi Adı</label>
                    <input
                      type="text"
                      value={wifiSsid}
                      onChange={(e) => setWifiSsid(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-0.5">Wi-Fi Şifresi</label>
                    <input
                      type="text"
                      value={wifiPass}
                      onChange={(e) => setWifiPass(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Web Embed Code Card */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Code className="w-4 h-4 text-indigo-400" />
                Web Sitesine Göm (İframe)
              </h3>
              <button
                type="button"
                onClick={handleCopyEmbed}
                className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-bold text-indigo-300 flex items-center gap-1 transition-colors"
              >
                {copiedCode ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                {copiedCode ? "Kopyalandı" : "Kodu Kopyala"}
              </button>
            </div>
            <p className="text-xs text-slate-400">
              WordPress, Wix, Webflow veya HTML sitenize aşağıdaki kodu ekleyerek randevu formunu doğrudan gömebilirsiniz:
            </p>
            <pre className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-indigo-300 text-[11px] font-mono overflow-x-auto whitespace-pre-wrap">
              {iframeEmbedCode}
            </pre>
          </div>
        </div>

        {/* Right Column: Printable Live Stand Preview */}
        <div className="lg:col-span-7 flex flex-col items-center space-y-4">
          <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-indigo-400" />
            Canlı Baskı Önizlemesi (A4 / A5 Dikey Format)
          </div>

          {/* Printable Stand Container */}
          <div
            id="printable-stand"
            className={`w-full max-w-sm p-8 rounded-[2.2rem] shadow-2xl flex flex-col items-center text-center space-y-6 relative overflow-hidden transition-all ${
              standTheme === "dark"
                ? "bg-slate-950 text-white border-4 border-indigo-500 shadow-indigo-950/80"
                : standTheme === "gold"
                ? "bg-[#FFFDF7] text-slate-900 border-4 border-amber-500 shadow-amber-900/30"
                : standTheme === "indigo"
                ? "bg-slate-900 text-white border-4 border-indigo-600 shadow-indigo-900/50"
                : "bg-white text-slate-900 border-4 border-indigo-600"
            }`}
          >
            {/* Top Brand Tag */}
            <div
              className={`w-full flex items-center justify-between pb-4 border-b ${
                standTheme === "dark" || standTheme === "indigo"
                  ? "border-slate-800"
                  : "border-slate-100"
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-600 text-white shadow-md">
                  <CalendarDays className="w-4 h-4" />
                </div>
                <span
                  className={`font-black text-xs tracking-tight ${
                    standTheme === "dark" || standTheme === "indigo"
                      ? "text-white"
                      : "text-slate-900"
                  }`}
                >
                  randevuformu.com
                </span>
              </div>
              <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                Online Rezervasyon
              </span>
            </div>

            {/* Clinic Name */}
            <div className="space-y-1.5">
              <h3
                className={`text-xl font-black tracking-tight ${
                  standTheme === "dark" || standTheme === "indigo"
                    ? "text-white"
                    : "text-slate-900"
                }`}
              >
                {businessName}
              </h3>
              <p className="text-xs font-bold text-indigo-600">{tagline}</p>
            </div>

            {/* QR Code Container */}
            <div
              className={`p-4 rounded-3xl border-2 shadow-inner ${
                standTheme === "dark"
                  ? "bg-slate-900 border-slate-800"
                  : standTheme === "indigo"
                  ? "bg-slate-950 border-indigo-800"
                  : "bg-slate-50 border-indigo-100"
              }`}
            >
              <img
                src={qrCodeApiUrl}
                alt="Randevu QR Kodu"
                className="w-48 h-48 rounded-2xl object-contain mx-auto"
              />
            </div>

            {/* Instructions */}
            <div className="space-y-1">
              <p
                className={`text-xs font-bold ${
                  standTheme === "dark" || standTheme === "indigo"
                    ? "text-slate-200"
                    : "text-slate-800"
                }`}
              >
                {subtext}
              </p>
              <p className="text-[11px] text-slate-400 font-mono">{bookingUrl}</p>
            </div>

            {/* Optional Wi-Fi Credentials Badge */}
            {showWifi && (
              <div
                className={`w-full p-2.5 rounded-2xl border text-xs flex items-center justify-between ${
                  standTheme === "dark" || standTheme === "indigo"
                    ? "bg-slate-900/80 border-slate-800 text-slate-300"
                    : "bg-slate-50 border-slate-200 text-slate-700"
                }`}
              >
                <div className="flex items-center gap-1.5 font-semibold text-[11px]">
                  <Wifi className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Wi-Fi: {wifiSsid}</span>
                </div>
                <div className="font-mono text-[11px] text-slate-400">Şifre: {wifiPass}</div>
              </div>
            )}

            {/* Footer Trust Badge */}
            <div
              className={`w-full pt-3 border-t flex items-center justify-center gap-1.5 text-[10px] font-semibold ${
                standTheme === "dark" || standTheme === "indigo"
                  ? "border-slate-800 text-slate-500"
                  : "border-slate-100 text-slate-400"
              }`}
            >
              <ShieldCheck className="w-3 h-3 text-emerald-500" />
              <span>256-Bit SSL & KVKK Güvencesi</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handlePrint}
            className="w-full max-w-sm py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-300 hover:text-white border border-white/10 flex items-center justify-center gap-2 transition-colors"
          >
            <Printer className="w-4 h-4 text-indigo-400" />
            Standı Doğrudan Yazıcıya Gönder
          </button>
        </div>
      </div>
    </div>
  );
}
