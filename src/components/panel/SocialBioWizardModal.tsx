"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Smartphone,
  Copy,
  Check,
  ExternalLink,
  Share2,
  Sparkles,
  X,
  Calendar,
  MessageCircle,
  MapPin,
  CheckCircle2,
} from "lucide-react";

interface SocialBioWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenantSlug: string;
  businessName: string;
}

export function SocialBioWizardModal({
  isOpen,
  onClose,
  tenantSlug,
  businessName,
}: SocialBioWizardModalProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedBio, setCopiedBio] = useState(false);

  if (!isOpen) return null;

  const bookingUrl = `https://randevuformu.com/${tenantSlug || "byerman"}`;
  const suggestedBioText = `✂️ Randevunuzu 30 saniyede online oluşturun 👇\n🔗 ${bookingUrl}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(bookingUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyBio = () => {
    navigator.clipboard.writeText(suggestedBioText);
    setCopiedBio(true);
    setTimeout(() => setCopiedBio(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="w-full max-w-2xl bg-white rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden my-8"
      >
        {/* Header */}
        <div className="bg-[#0F2A4A] p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0062FF]/20 border border-[#0062FF]/40 flex items-center justify-center text-[#0062FF]">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-white">Instagram &amp; TikTok Biyo Sihirbazı</h3>
              <p className="text-xs text-slate-300">
                Sosyal medya takipçilerinizi doğrudan randevulu müşteriye dönüştürün.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Quick Copy Link Bar */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Biyo İçin Hazır Randevu Bağlantınız
            </span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={bookingUrl}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-mono font-semibold text-[#0F2A4A] select-all outline-none"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-4 py-2.5 rounded-xl bg-[#0062FF] hover:bg-[#0051d4] text-white text-xs font-semibold shrink-0 flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? "Kopyalandı!" : "Linki Kopyala"}</span>
              </button>
            </div>
          </div>

          {/* Grid: Preview on Left, Instructions on Right */}
          <div className="grid md:grid-cols-12 gap-6 items-start">
            {/* Phone Mockup Preview */}
            <div className="md:col-span-5 bg-gradient-to-b from-slate-900 to-[#0F2A4A] p-4 rounded-3xl text-white shadow-xl max-w-[260px] mx-auto w-full text-center space-y-3.5 border-4 border-slate-800">
              <div className="w-12 h-1 bg-slate-700 rounded-full mx-auto mb-2" />
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#0062FF] to-blue-400 flex items-center justify-center font-bold text-white text-lg mx-auto shadow-md">
                {businessName.charAt(0)}
              </div>
              <div>
                <h4 className="font-bold text-xs text-white">{businessName}</h4>
                <p className="text-[10px] text-slate-300">Online Randevu Masası</p>
              </div>

              {/* Bio Buttons inside mockup */}
              <div className="space-y-2 pt-2 text-[11px]">
                <div className="p-2 rounded-xl bg-[#0062FF] text-white font-semibold flex items-center justify-center gap-1.5 shadow-xs">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Hemen Randevu Al</span>
                </div>
                <div className="p-2 rounded-xl bg-emerald-600 text-white font-semibold flex items-center justify-center gap-1.5 shadow-xs">
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp ile Yazın</span>
                </div>
                <div className="p-2 rounded-xl bg-white/10 text-slate-200 font-medium flex items-center justify-center gap-1.5 border border-white/10">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Yol Tarifi / Konum</span>
                </div>
              </div>

              <div className="pt-2 text-[9px] text-slate-400">
                Powered by randevuformu.com
              </div>
            </div>

            {/* Ready Text & Setup Guide */}
            <div className="md:col-span-7 space-y-4 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-slate-700">
                    Önerilen Instagram Biyo Metni
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyBio}
                    className="text-[11px] font-semibold text-[#0062FF] hover:underline flex items-center gap-1"
                  >
                    {copiedBio ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedBio ? "Metin Kopyalandı!" : "Metni Kopyala"}</span>
                  </button>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-mono text-[11px] whitespace-pre-line leading-relaxed">
                  {suggestedBioText}
                </div>
              </div>

              <div className="space-y-2.5 pt-2 border-t border-slate-100">
                <span className="font-bold text-[#0F2A4A] block">
                  Instagram Profilinize Nasıl Eklenir?
                </span>
                <ol className="space-y-2 text-slate-600 text-[11px]">
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-blue-100 text-[#0062FF] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      1
                    </span>
                    <span>Instagram profilinize gidin ve <strong>Profili Düzenle</strong> butonuna dokunun.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-blue-100 text-[#0062FF] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      2
                    </span>
                    <span><strong>Bağlantılar (Links)</strong> &rarr; <strong>Harici Bağlantı Ekle</strong> seçeneğini seçin.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-blue-100 text-[#0062FF] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      3
                    </span>
                    <span>Kopyaladığınız bağlantıyı URL alanına yapıştırıp başlığa <strong>Randevu Al</strong> yazarak kaydedin!</span>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
          <a
            href={bookingUrl}
            target="_blank"
            rel="noreferrer"
            className="text-slate-600 hover:text-[#0F2A4A] font-semibold flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#0062FF]" />
            <span>Sayfayı Canlı Önizle</span>
          </a>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#0F2A4A] hover:bg-[#1a385c] text-white font-semibold text-xs shadow-xs transition-colors"
          >
            Kapat
          </button>
        </div>
      </motion.div>
    </div>
  );
}
