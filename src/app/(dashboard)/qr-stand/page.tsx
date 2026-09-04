"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  QrCode,
  Printer,
  Copy,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Wifi,
  Palette,
  ShieldCheck,
  Code,
  Eye,
  CalendarDays,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function QrStandPage() {
  const [businessName, setBusinessName] = useState("İşletme Adı");
  const [businessSlug, setBusinessSlug] = useState("isletme");
  const [tagline, setTagline] = useState("Sıra Beklemeden Randevunuzu Alın");
  const [subtext, setSubtext] = useState("Telefonunuzun kamerasını QR koda doğrultun.");
  const [showWifi, setShowWifi] = useState(true);
  const [wifiSsid, setWifiSsid] = useState("Misafir_Wifi");
  const [wifiPass, setWifiPass] = useState("2026");
  const [standTheme, setStandTheme] = useState<"light" | "navy" | "gold" | "minimal">("light");
  const [qrColor, setQrColor] = useState("0062ff");

  // Otomatik İşletme Adı ve Slug Yükleme
  useEffect(() => {
    try {
      if (typeof window === "undefined") return;

      const isByErmanHost = window.location.hostname.includes("byerman");
      const currentUser = localStorage.getItem("rf_user");
      const currentTenant = localStorage.getItem("rf_tenant");
      const isByErman = isByErmanHost || (currentUser === "byerman" && currentTenant === "byerman");

      if (isByErman) {
        setBusinessName("By Erman Hair Studio");
        setBusinessSlug("byerman");
        setWifiSsid("ByErman_Misafir");
        return;
      }

      const storedName = localStorage.getItem("rf_tenant_name");
      const storedSlug = localStorage.getItem("rf_tenant_slug") || currentTenant;

      if (storedName && storedName !== "İşletme Yönetim Paneli" && !storedName.includes("Ahmet Yılmaz")) {
        setBusinessName(storedName);
        if (storedSlug) setBusinessSlug(storedSlug);
        setWifiSsid(`${storedName.replace(/[^a-zA-Z0-9]/g, "")}_Misafir`);
      } else if (storedSlug && storedSlug !== "default" && storedSlug !== "dashboard") {
        const formatted = storedSlug.charAt(0).toUpperCase() + storedSlug.slice(1);
        setBusinessName(formatted);
        setBusinessSlug(storedSlug);
        setWifiSsid(`${formatted}_Misafir`);
      }
    } catch {}
  }, []);

  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const bookingUrl = `https://randevuformu.com/${businessSlug}`;
  const qrCodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encodeURIComponent(
    bookingUrl
  )}&color=${qrColor}&bgcolor=${standTheme === "navy" ? "0f2a4a" : "ffffff"}`;

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
    showToast("İframe kodu panoya kopyalandı!");
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-8 z-50 px-4 py-3 rounded-xl bg-[#0F2A4A] text-white text-xs font-semibold shadow-2xl flex items-center gap-2 border border-[#0062FF]/30"
          >
            <CheckCircle2 className="w-4 h-4 text-[#00BCD4]" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100 text-[#0062FF] text-[11px] font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            Fiziki & Dijital Entegrasyon
          </div>
          <h2 className="text-2xl font-bold text-[#0F2A4A]">QR Stand, Masa Kartı & Web Widget</h2>
          <p className="text-xs text-slate-500 mt-1">
            Resepsiyon, masa veya kapınız için yüksek çözünürlüklü QR standınızı yazdırın veya sitenize gömün.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleCopyLink}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-2xs flex items-center gap-1.5 transition-colors"
          >
            {copiedLink ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedLink ? "Kopyalandı" : "Linki Kopyala"}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-[#0062FF] hover:bg-[#0051d4] text-white text-xs font-semibold shadow-xs flex items-center gap-2 transition-all"
          >
            <Printer className="w-4 h-4" />
            Standı Yazdır (A4 / A5)
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form Controls */}
        <div className="lg:col-span-5 space-y-5">
          {/* Customizer Card */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#0F2A4A] flex items-center gap-2">
              <Palette className="w-4 h-4 text-[#0062FF]" /> Stand Bilgilerini Özelleştirin
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                İşletme / Klinik Başlığı
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0062FF]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Vurgu Metni (CTA)
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0062FF]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Açıklama Talimatı
              </label>
              <input
                type="text"
                value={subtext}
                onChange={(e) => setSubtext(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0062FF]"
              />
            </div>

            {/* Stand Theme Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Stand Tasarım Teması
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "light", name: "Klinik Beyazı", color: "0062ff" },
                  { id: "navy", name: "Deep Navy", color: "ffffff" },
                  { id: "gold", name: "Gold VIP", color: "b45309" },
                  { id: "minimal", name: "Slate Minimal", color: "0f2a4a" },
                ].map((th) => (
                  <button
                    key={th.id}
                    type="button"
                    onClick={() => {
                      setStandTheme(th.id as any);
                      setQrColor(th.color);
                    }}
                    className={`p-2.5 rounded-xl text-xs font-semibold border transition-all text-left ${
                      standTheme === th.id
                        ? "bg-blue-50 border-[#0062FF] text-[#0062FF] shadow-2xs"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {th.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Wi-Fi Details Box Toggle */}
            <div className="pt-3 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Wifi className="w-3.5 h-3.5 text-[#0062FF]" />
                  Bekleme Salonu Wi-Fi Bilgisi Ekle
                </label>
                <input
                  type="checkbox"
                  checked={showWifi}
                  onChange={(e) => setShowWifi(e.target.checked)}
                  className="rounded text-[#0062FF] focus:ring-[#0062FF]"
                />
              </div>

              {showWifi && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-0.5">Wi-Fi Adı</label>
                    <input
                      type="text"
                      value={wifiSsid}
                      onChange={(e) => setWifiSsid(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-0.5">Wi-Fi Şifresi</label>
                    <input
                      type="text"
                      value={wifiPass}
                      onChange={(e) => setWifiPass(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Web Embed Code Card */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#0F2A4A] flex items-center gap-2">
                <Code className="w-4 h-4 text-[#0062FF]" />
                Web Sitesine Göm (İframe)
              </h3>
              <button
                type="button"
                onClick={handleCopyEmbed}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] font-semibold text-slate-700 flex items-center gap-1 transition-colors"
              >
                {copiedCode ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? "Kopyalandı" : "Kopyala"}</span>
              </button>
            </div>
            <p className="text-xs text-slate-500">
              WordPress, Wix veya HTML sitenize aşağıdaki kodu yapıştırarak formu doğrudan sayfanıza entegre edin:
            </p>
            <pre className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[#0F2A4A] text-[11px] font-mono overflow-x-auto whitespace-pre-wrap">
              {iframeEmbedCode}
            </pre>
          </div>
        </div>

        {/* Right Column: Printable Live Stand Preview */}
        <div className="lg:col-span-7 flex flex-col items-center space-y-4">
          <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-[#0062FF]" />
            Canlı Baskı Önizlemesi (A4 / A5 Dikey Format)
          </div>

          {/* Printable Stand Container */}
          <div
            id="printable-stand"
            className={`w-full max-w-sm p-8 rounded-3xl shadow-xl flex flex-col items-center text-center space-y-6 relative overflow-hidden transition-all ${
              standTheme === "navy"
                ? "bg-[#0F2A4A] text-white border-4 border-[#0062FF]"
                : standTheme === "gold"
                ? "bg-[#FFFDF7] text-slate-900 border-4 border-amber-500"
                : standTheme === "minimal"
                ? "bg-slate-50 text-slate-900 border-4 border-slate-400"
                : "bg-white text-slate-900 border-4 border-[#0062FF]"
            }`}
          >
            {/* Top Brand Tag */}
            <div
              className={`w-full flex items-center justify-between pb-4 border-b ${
                standTheme === "navy" ? "border-white/10" : "border-slate-100"
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#0062FF] text-white flex items-center justify-center font-bold text-xs">
                  RF
                </div>
                <span className={`font-bold text-xs ${standTheme === "navy" ? "text-white" : "text-[#0F2A4A]"}`}>
                  randevuformu.com
                </span>
              </div>
              <span className="text-[10px] font-bold text-[#0062FF] uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200/60">
                Online Rezervasyon
              </span>
            </div>

            {/* Clinic Name */}
            <div className="space-y-1">
              <h3 className={`text-xl font-black tracking-tight ${standTheme === "navy" ? "text-white" : "text-[#0F2A4A]"}`}>
                {businessName}
              </h3>
              <p className="text-xs font-semibold text-[#0062FF]">{tagline}</p>
            </div>

            {/* QR Code Container */}
            <div
              className={`p-4 rounded-2xl border-2 shadow-inner ${
                standTheme === "navy" ? "bg-white/5 border-white/20" : "bg-slate-50 border-blue-100"
              }`}
            >
              <img
                src={qrCodeApiUrl}
                alt="Randevu QR Kodu"
                className="w-48 h-48 rounded-xl object-contain mx-auto"
              />
            </div>

            {/* Instructions */}
            <div className="space-y-1">
              <p className={`text-xs font-bold ${standTheme === "navy" ? "text-white" : "text-slate-800"}`}>
                {subtext}
              </p>
              <p className="text-[11px] text-slate-400 font-mono">{bookingUrl}</p>
            </div>

            {/* Optional Wi-Fi Credentials Badge */}
            {showWifi && (
              <div
                className={`w-full p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                  standTheme === "navy"
                    ? "bg-white/10 border-white/10 text-white"
                    : "bg-slate-50 border-slate-200 text-slate-700"
                }`}
              >
                <div className="flex items-center gap-1.5 font-semibold text-[11px]">
                  <Wifi className="w-3.5 h-3.5 text-[#0062FF]" />
                  <span>Wi-Fi: {wifiSsid}</span>
                </div>
                <div className="font-mono text-[11px] text-slate-400">Şifre: {wifiPass}</div>
              </div>
            )}

            {/* Footer Trust Badge */}
            <div
              className={`w-full pt-3 border-t flex items-center justify-center gap-1.5 text-[10px] font-semibold ${
                standTheme === "navy" ? "border-white/10 text-white/60" : "border-slate-100 text-slate-400"
              }`}
            >
              <ShieldCheck className="w-3 h-3 text-emerald-500" />
              <span>256-Bit SSL & KVKK Güvencesi</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handlePrint}
            className="w-full max-w-sm py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-2 transition-colors shadow-2xs"
          >
            <Printer className="w-4 h-4 text-[#0062FF]" />
            Standı Doğrudan Yazdır
          </button>
        </div>
      </div>
    </div>
  );
}
