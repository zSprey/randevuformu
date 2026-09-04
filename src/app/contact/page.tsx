"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Mail,
  Send,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  Clock,
} from "lucide-react";

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
    } catch {
      setSubmitStatus("error");
      setErrorMessage("Bağlantı hatası oluştu. Lütfen doğrudan e-posta gönderiniz.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFBFC] text-slate-900 selection:bg-[#0062FF]/10 selection:text-[#0062FF] flex flex-col justify-between font-sans">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/90 border-b border-slate-200/80 shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-base text-[#0F2A4A]">
            <div className="relative w-6 h-6 rounded-md overflow-hidden flex items-center justify-center">
              <Image
                src="/logo.png"
                alt="Logo"
                width={24}
                height={24}
                className="object-contain"
                priority
              />
            </div>
            <span>randevuformu<span className="text-[#0062FF]">.com</span></span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/ornek"
              className="text-xs font-semibold text-slate-600 hover:text-[#0F2A4A] transition-colors"
            >
              Örnek Şablonlar
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#0062FF] hover:bg-[#0051d4] text-white shadow-xs transition-all"
            >
              Giriş Yap
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto px-4 py-10 sm:py-14 w-full">
        <div className="grid md:grid-cols-12 gap-8 items-start">
          {/* Left Info Column */}
          <div className="md:col-span-5 space-y-5">
            <div className="space-y-2.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-50 border border-blue-200/60 text-[#0062FF] text-[11px] font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                7/24 Kurumsal İletişim
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-[#0F2A4A] tracking-tight">
                Bizimle İletişime Geçin
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                İş ortaklığı, özel entegrasyonlar, kurumsal paketler veya destek talepleriniz için ekibimizle anında görüşün.
              </p>
            </div>

            {/* Direct Contact Card */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 space-y-3 shadow-xs">
              <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Doğrudan E-Posta
              </h3>
              <a
                href="mailto:destek@randevuformu.com"
                className="flex items-center gap-3 p-3 rounded-xl bg-blue-50/50 border border-blue-200/60 text-[#0F2A4A] hover:bg-blue-50 transition-all"
              >
                <div className="w-9 h-9 rounded-lg bg-[#0062FF] flex items-center justify-center text-white shrink-0 shadow-xs">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold">destek@randevuformu.com</div>
                  <div className="text-[10px] text-slate-500">Ortalama yanıt süresi: &lt; 2 saat</div>
                </div>
              </a>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 space-y-3 text-xs text-slate-600 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-xs text-[#0F2A4A]">Çalışma Saatleri</div>
                  <div className="text-[11px] text-slate-500">Hafta içi & Hafta sonu: 08:30 - 22:00</div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-xs text-[#0F2A4A]">KVKK & Veri Güvenliği</div>
                  <div className="text-[11px] text-slate-500">256-Bit SSL şifreleme ve güvenli iletişim</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Form Column */}
          <div className="md:col-span-7">
            <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
              {submitStatus === "success" ? (
                <div className="p-6 text-center space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200/60 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-bold text-[#0F2A4A]">Mesajınız Alındı!</h3>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                    Talebiniz kurumsal destek ekibimize ulaştı. <strong>destek@randevuformu.com</strong> üzerinden en kısa sürede size geri dönüş yapacağız.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSubmitStatus("idle")}
                    className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-all"
                  >
                    Yeni Bir Mesaj Gönder
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-[#0F2A4A]">Mesaj Bırakın</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Formu doldurarak bize hemen ulaşabilirsiniz.</p>
                  </div>

                  {submitStatus === "error" && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Ad Soyad *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="Ad Soyad"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0062FF] focus:border-[#0062FF]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Şirket / Klinik Adı
                    </label>
                    <input
                      type="text"
                      name="company"
                      placeholder="İşletme / Klinik Adı"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0062FF] focus:border-[#0062FF]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      E-Posta Adresi *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="email@adresiniz.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0062FF] focus:border-[#0062FF]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Mesajınız *
                    </label>
                    <textarea
                      name="message"
                      rows={4}
                      required
                      placeholder="İşletmeniz ve entegrasyon talebiniz hakkında detaylar..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0062FF] focus:border-[#0062FF] resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 rounded-xl bg-[#0062FF] hover:bg-[#0051d4] text-white font-semibold text-xs shadow-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
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
      <footer className="py-6 border-t border-slate-200 text-center text-xs text-slate-500 bg-white">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>&copy; {new Date().getFullYear()} randevuformu.com — Tüm hakları saklıdır.</span>
          <a href="mailto:destek@randevuformu.com" className="text-[#0062FF] hover:underline">
            destek@randevuformu.com
          </a>
        </div>
      </footer>
    </div>
  );
}
