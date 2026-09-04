"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Mail,
  Send,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Building2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Clock,
  Phone,
} from "lucide-react";
import { motion } from "framer-motion";

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");
    setErrorMessage("");

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      company: formData.get("company"),
      email: formData.get("email"),
      message: formData.get("message"),
    };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitStatus("success");
      } else {
        setSubmitStatus("error");
        setErrorMessage(result.error || "Bir hata oluştu. Lütfen tekrar deneyin.");
      }
    } catch (error) {
      setSubmitStatus("error");
      setErrorMessage("Bağlantı hatası oluştu. Lütfen doğrudan e-posta gönderiniz.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white flex flex-col justify-between">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-600/15 blur-[140px] rounded-full" />
        <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-purple-600/10 blur-[120px] rounded-full" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/70 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 font-black text-lg text-white">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
              <Calendar className="w-4 h-4" />
            </div>
            <span>randevuformu<span className="text-indigo-400">.com</span></span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/ornek"
              className="text-xs font-semibold text-slate-300 hover:text-white transition-colors"
            >
              Örnek Şablonlar
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all hover:scale-105"
            >
              Giriş Yap
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto px-4 py-12 sm:py-16 w-full">
        <div className="grid md:grid-cols-12 gap-8 items-start">
          {/* Left Info Column */}
          <div className="md:col-span-5 space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-[11px] font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                7/24 Kurumsal İletişim
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Bizimle İletişime Geçin
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                İş ortaklığı, özel entegrasyonlar, kurumsal toplu paketler veya destek talepleriniz için ekibimizle anında görüşün.
              </p>
            </div>

            {/* Direct Contact Card */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Doğrudan E-Posta
              </h3>
              <a
                href="mailto:destek@randevuformu.com"
                className="flex items-center gap-3 p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 hover:text-white hover:bg-indigo-500/20 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold">destek@randevuformu.com</div>
                  <div className="text-[10px] text-slate-400">Ortalama yanıt süresi: &lt; 2 saat</div>
                </div>
              </a>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3 text-xs text-slate-300">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white">Çalışma Saatleri</div>
                  <div className="text-[11px] text-slate-400">Hafta içi & Hafta sonu: 08:30 - 22:00</div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-slate-800">
                <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white">KVKK & Veri Güvenliği</div>
                  <div className="text-[11px] text-slate-400">256-Bit SSL şifreleme ve güvenli iletişim</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Form Column */}
          <div className="md:col-span-7">
            <div className="p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl">
              {submitStatus === "success" ? (
                <div className="p-8 text-center space-y-4">
                  <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Mesajınız Alındı!</h3>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
                    Talebiniz kurumsal destek ekibimize ulaştı. <strong>destek@randevuformu.com</strong> üzerinden en kısa sürede size geri dönüş yapacağız.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSubmitStatus("idle")}
                    className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all"
                  >
                    Yeni Bir Mesaj Gönder
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">Mesaj Bırakın</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Formu doldurarak bize hemen ulaşabilirsiniz.</p>
                  </div>

                  {submitStatus === "error" && (
                    <div className="p-3 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-200 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Ad Soyad *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="Ad Soyad"
                      className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-white text-xs placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Şirket / Klinik Adı
                    </label>
                    <input
                      type="text"
                      name="company"
                      placeholder="İşletme / Klinik Adı"
                      className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-white text-xs placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      E-Posta Adresi *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="email@adresiniz.com"
                      className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-white text-xs placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Mesajınız *
                    </label>
                    <textarea
                      name="message"
                      rows={4}
                      required
                      placeholder="İşletmeniz ve entegrasyon talebiniz hakkında detaylar..."
                      className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-white text-xs placeholder-slate-600 focus:outline-none focus:border-indigo-500 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      "İletiliyor..."
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Mesajı Gönder
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-white/5 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>&copy; {new Date().getFullYear()} randevuformu.com — Tüm hakları saklıdır.</span>
          <a href="mailto:destek@randevuformu.com" className="text-indigo-400 hover:underline">
            destek@randevuformu.com
          </a>
        </div>
      </footer>
    </div>
  );
}
