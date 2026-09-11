"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Smartphone, Download, X, Share2, PlusSquare, Sparkles } from "lucide-react";
import Image from "next/image";

export default function PwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIos, setIsIos] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);

  useEffect(() => {
    // Check if already installed / running standalone
    const isStandaloneMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    if (isStandaloneMode) {
      setIsStandalone(true);
      return;
    }

    // Check if dismissed recently (within 7 days)
    const dismissedAt = localStorage.getItem("rf_pwa_banner_dismissed");
    if (dismissedAt) {
      const diffDays = (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60 * 24);
      if (diffDays < 7) {
        return;
      }
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    // Listen for beforeinstallprompt event (Android / Chromium)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // On iOS, if not standalone, show banner after 2 seconds
    if (isIosDevice) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIos) {
      setShowIosGuide(true);
      return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setIsVisible(false);
      }
      setDeferredPrompt(null);
    } else {
      setShowIosGuide(true);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem("rf_pwa_banner_dismissed", Date.now().toString());
  };

  if (isStandalone || !isVisible) return null;

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-40 bg-gradient-to-r from-[#0F2A4A]/95 to-[#08182B]/95 text-white p-4 rounded-2xl border border-[#0062FF]/40 shadow-2xl backdrop-blur-xl"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#0062FF] to-indigo-700 flex items-center justify-center shrink-0 shadow-md border border-white/20">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>Uygulamayı Telefona Yükle</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
                    PWA
                  </span>
                </h4>
                <p className="text-[11px] text-slate-300 line-clamp-1 mt-0.5">
                  Randevuları ana ekrandan tek dokunuşla yönetin, bildirimleri kaçırmayın.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDismiss}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
              title="Kapat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={handleInstallClick}
              className="flex-1 py-2 px-3 rounded-xl bg-[#0062FF] hover:bg-[#0050d4] text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Ana Ekrana Ekle</span>
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-medium transition-colors"
            >
              Daha Sonra
            </button>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* iOS Safari Guide Modal */}
      <AnimatePresence>
        {showIosGuide && (
          <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/80 backdrop-blur-xs"
            onClick={() => setShowIosGuide(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0F2A4A] border border-[#0062FF]/40 rounded-3xl p-6 max-w-sm w-full text-white shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#0062FF] flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-bold text-sm">iPhone'a Yükleme Rehberi</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowIosGuide(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <span className="w-6 h-6 rounded-full bg-[#0062FF] flex items-center justify-center text-xs font-bold shrink-0">
                    1
                  </span>
                  <p>
                    Safari tarayıcısının alt kısmındaki <strong>Paylaş</strong> (
                    <Share2 className="w-3.5 h-3.5 inline mx-0.5 text-blue-400" />) simgesine dokunun.
                  </p>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <span className="w-6 h-6 rounded-full bg-[#0062FF] flex items-center justify-center text-xs font-bold shrink-0">
                    2
                  </span>
                  <p>
                    Açılan menüde aşağı kaydırıp <strong>"Ana Ekrana Ekle"</strong> (
                    <PlusSquare className="w-3.5 h-3.5 inline mx-0.5 text-emerald-400" />) seçeneğine
                    basın.
                  </p>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <span className="w-6 h-6 rounded-full bg-[#0062FF] flex items-center justify-center text-xs font-bold shrink-0">
                    3
                  </span>
                  <p>
                    Sağ üst köşedeki <strong>"Ekle"</strong> butonuna dokunun. Uygulama ana ekranınıza
                    ikon olarak eklenecektir! 🎉
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowIosGuide(false)}
                className="w-full py-2.5 rounded-xl bg-[#0062FF] text-white font-bold text-xs hover:bg-[#0050d4] transition-colors"
              >
                Anladım
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
