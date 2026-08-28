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
} from "lucide-react";
import { motion } from "framer-motion";

export default function QrStandPage() {
  const [businessName, setBusinessName] = useState("Dr. Ahmet Yılmaz Diş Kliniği");
  const [businessSlug, setBusinessSlug] = useState("dr-ahmet");
  const [tagline, setTagline] = useState("Sıra Beklemeden Randevunuzu Alın");
  const [subtext, setSubtext] = useState("Telefonunuzun kamerasını QR koda doğrultun.");
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const bookingUrl = `https://randevuformu.com/${businessSlug}`;
  const qrCodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(bookingUrl)}&color=4f46e5&bgcolor=ffffff`;

  const iframeEmbedCode = `<iframe 
  src="https://randevuformu.com/widget/${businessSlug}" 
  width="100%" 
  height="720" 
  frameborder="0" 
  style="border-radius: 16px; max-width: 600px; margin: 0 auto; display: block;"
></iframe>`;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(bookingUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyEmbed = () => {
    navigator.clipboard.writeText(iframeEmbedCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Masaüstü Stand & Web Widget
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            QR Masa Standı & Web Sitesi İframe Kodu
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Kliniğinizin bekleme salonuna koyabileceğiniz şık QR stand çıktısı alın veya mevcut web sitenize randevu formunu gömün.
          </p>
        </div>

        <button
          type="button"
          onClick={handlePrint}
          className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all hover:scale-105"
        >
          <Printer className="w-4 h-4" />
          Standı Yazdır (A4 / A5)
        </button>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Controls */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white">Stand Bilgilerini Özelleştirin</h3>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                İşletme / Klinik Başlığı
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
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
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
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
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
              />
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
                {copiedCode ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedCode ? "Kopyalandı" : "Kodu Kopyala"}
              </button>
            </div>
            <p className="text-xs text-slate-400">
              WordPress, Wix veya HTML sitenize aşağıdaki kodu yapıştırarak formu doğrudan yayınlayabilirsiniz:
            </p>
            <pre className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-indigo-300 text-[11px] font-mono overflow-x-auto whitespace-pre-wrap">
              {iframeEmbedCode}
            </pre>
          </div>
        </div>

        {/* Right Column: Printable Live Stand Preview */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div
            id="printable-stand"
            className="w-full max-w-sm p-8 rounded-[2rem] bg-white text-slate-900 shadow-2xl border-4 border-indigo-600 flex flex-col items-center text-center space-y-6 relative overflow-hidden"
          >
            {/* Top Brand Tag */}
            <div className="w-full flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-600 text-white">
                  <CalendarDays className="w-4 h-4" />
                </div>
                <span className="font-extrabold text-xs tracking-tight text-slate-900">
                  randevuformu.com
                </span>
              </div>
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded-full">
                Online Rezervasyon
              </span>
            </div>

            {/* Clinic Name */}
            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                {businessName}
              </h3>
              <p className="text-xs font-bold text-indigo-600">
                {tagline}
              </p>
            </div>

            {/* QR Code Container */}
            <div className="p-4 bg-slate-50 border-2 border-indigo-100 rounded-3xl shadow-inner">
              <img
                src={qrCodeApiUrl}
                alt="Randevu QR Kodu"
                className="w-44 h-44 rounded-xl object-contain mx-auto"
              />
            </div>

            {/* Bottom Instructions */}
            <div className="space-y-1.5">
              <p className="text-xs font-bold text-slate-800">
                {subtext}
              </p>
              <p className="text-[11px] text-slate-400 font-mono">
                {bookingUrl}
              </p>
            </div>

            {/* Footer trust badge */}
            <div className="w-full pt-4 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[10px] font-semibold text-slate-400">
              <span>🔒 256-Bit SSL & KVKK Güvencesi</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
