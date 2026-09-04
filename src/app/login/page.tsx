"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Mail, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Sayfa açıldığında eski sahte veya çerez kalıntılarını temizle
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isProd = window.location.protocol === "https:";
      const domainStr = window.location.hostname.includes("randevuformu.com") ? "; domain=.randevuformu.com" : "";
      const secureStr = isProd ? "; Secure" : "";

      document.cookie = `rf_session=; path=/; max-age=0; SameSite=Lax${domainStr}${secureStr}`;
      document.cookie = `demo_session=; path=/; max-age=0; SameSite=Lax${domainStr}${secureStr}`;
      document.cookie = `rf_session=; path=/; max-age=0;`;
      document.cookie = `demo_session=; path=/; max-age=0;`;

      const mode = searchParams.get("mode");
      const tab = searchParams.get("tab");
      if (mode === "signup" || mode === "register" || tab === "register") {
        setIsLogin(false);
      }
    }
  }, [searchParams]);

  const setAuthCookie = (username = "user", tenant = "default", tName = "İşletme Yönetim Paneli") => {
    const oneYear = 60 * 60 * 24 * 365;
    const isProd = typeof window !== "undefined" && window.location.protocol === "https:";
    const domainStr =
      typeof window !== "undefined" && window.location.hostname.includes("randevuformu.com")
        ? "; domain=.randevuformu.com"
        : "";
    const secureStr = isProd ? "; Secure" : "";

    document.cookie = `rf_session=true; path=/; max-age=${oneYear}; SameSite=Lax${domainStr}${secureStr}`;
    document.cookie = `rf_user=${username}; path=/; max-age=${oneYear}; SameSite=Lax${domainStr}${secureStr}`;
    document.cookie = `rf_tenant=${tenant}; path=/; max-age=${oneYear}; SameSite=Lax${domainStr}${secureStr}`;

    document.cookie = `rf_session=true; path=/; max-age=${oneYear}; SameSite=Lax${secureStr}`;
    document.cookie = `rf_user=${username}; path=/; max-age=${oneYear}; SameSite=Lax${secureStr}`;
    document.cookie = `rf_tenant=${tenant}; path=/; max-age=${oneYear}; SameSite=Lax${secureStr}`;

    try {
      localStorage.setItem("rf_tenant", tenant);
      localStorage.setItem("rf_tenant_name", tName);
      localStorage.setItem("rf_tenant_slug", tenant);
      localStorage.setItem("rf_user", username);
    } catch {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const cleanIdentifier = email.trim().toLowerCase();
      const isByErman =
        cleanIdentifier === "byerman" ||
        cleanIdentifier === "byerman@randevuformu.com" ||
        cleanIdentifier === "byerman@gmail.com" ||
        cleanIdentifier === "ermankuafor" ||
        cleanIdentifier === "ermankuafor@randevuformu.com";

      const targetTenant = isByErman
        ? "byerman"
        : (businessName.trim() || cleanIdentifier).replace(/[^a-z0-9]/gi, "").toLowerCase() || "default";

      try {
        await fetch("/api/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            identifier: cleanIdentifier,
            password,
            businessName: businessName.trim() || fullName.trim(),
            tenant: targetTenant,
          }),
        });
      } catch (err) {
        console.warn("Session API call warning:", err);
      }

      // 1. By Erman Girişi
      if (isByErman) {
        if (password === "byerman123" || password === "ermankuafor123") {
          setAuthCookie("byerman", "byerman", "By Erman Hair Studio");
          setSuccessMsg("Giriş başarılı! Yönetim paneline yönlendiriliyorsunuz...");
          setTimeout(() => {
            window.location.href = "/dashboard";
          }, 500);
          return;
        } else {
          setErrorMsg("Kullanıcı adı veya şifre hatalı! Lütfen tekrar deneyin.");
          setLoading(false);
          return;
        }
      }

      // 2. Normal Genel SaaS İşletme Girişi
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: cleanIdentifier.includes("@") ? cleanIdentifier : `${cleanIdentifier}@randevuformu.com`,
          password,
        });

        if (error) {
          setErrorMsg("Kullanıcı adı veya şifre hatalı. Lütfen kontrol edip tekrar deneyin.");
          setLoading(false);
          return;
        } else {
          const userSlug = cleanIdentifier.replace(/[^a-z0-9]/gi, "").toLowerCase() || "default";
          setAuthCookie(cleanIdentifier, userSlug, "İşletme Yönetim Paneli");
          setSuccessMsg("Giriş başarılı! Yönetim panelinize yönlendiriliyorsunuz...");
          setTimeout(() => {
            window.location.href = "/dashboard";
          }, 600);
        }
      } else {
        // Kayıt Ol (Yeni İşletme Açılışı)
        const { error } = await supabase.auth.signUp({
          email: cleanIdentifier.includes("@") ? cleanIdentifier : `${cleanIdentifier}@randevuformu.com`,
          password,
          options: {
            data: {
              full_name: fullName,
              business_name: businessName,
            },
          },
        });

        if (error) {
          setErrorMsg(error.message);
          setLoading(false);
          return;
        } else {
          const bName = businessName.trim() || fullName.trim() || "Yeni İşletmem";
          const userSlug = bName.replace(/[^a-z0-9]/gi, "").toLowerCase() || "isletmem";
          setAuthCookie(cleanIdentifier, userSlug, bName);
          setSuccessMsg("Hesabınız oluşturuldu! İşletme panelinize yönlendiriliyorsunuz...");
          setTimeout(() => {
            window.location.href = "/dashboard";
          }, 800);
        }
      }
    } catch {
      setErrorMsg("Giriş yapılamadı. Lütfen bilgilerinizi kontrol edip tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFBFC] flex flex-col justify-center items-center px-4 py-12 relative text-[#0F172A] font-sans antialiased">
      {/* Subtle brand geometry background accent */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-[#00BCD4]/[0.03] to-transparent rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-[#0062FF]/[0.03] to-transparent rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md p-8 rounded-xl bg-white border border-slate-200/90 shadow-sm relative z-10"
      >
        {/* Logo / Header */}
        <div className="flex flex-col items-center mb-6 text-center">
          <Link href="/" className="flex flex-col items-center gap-2 mb-2 group">
            <img
              src="/logo.png"
              alt="randevuformu.com"
              className="h-10 w-auto transition-transform group-hover:scale-105"
              width={40}
              height={40}
            />
            <span className="text-xl font-bold tracking-tight text-[#0F2A4A]">
              randevuformu<span className="text-slate-400 font-normal">.com</span>
            </span>
          </Link>
          <p className="text-slate-500 text-xs">
            {isLogin ? "İşletme Yönetim Paneline Giriş Yapın" : "Yeni İşletme Kayıtları (Kilitli)"}
          </p>
        </div>

        {/* Tab Switcher — Clean Segmented Control */}
        <div className="grid grid-cols-2 p-1 mb-6 rounded-lg bg-slate-100 border border-slate-200/80">
          <button
            type="button"
            onClick={() => { setIsLogin(true); setErrorMsg(""); }}
            className={`py-2 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              isLogin
                ? "bg-white text-[#0F2A4A] shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Giriş Yap
          </button>
          <button
            type="button"
            onClick={() => { setIsLogin(false); setErrorMsg(""); }}
            className={`py-2 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              !isLogin
                ? "bg-white text-amber-700 shadow-xs"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <Lock className="w-3 h-3 text-amber-500" />
            <span>Kayıt Ol</span>
            <span className="text-[10px] bg-amber-100 text-amber-700 px-1 py-0.2 rounded font-medium">Kilitli</span>
          </button>
        </div>

        {/* Feedback Messages */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 leading-relaxed">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form or Locked Notice */}
        {!isLogin ? (
          <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-4">
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto">
              <Lock className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-[#0F2A4A]">Yeni Kayıtlar Geçici Olarak Kilitlidir</h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                Platformumuz şu anda kontrollü kapasite ile hizmet vermektedir. Yeni işletme alımları davetiye ile yapılmaktadır.
              </p>
            </div>

            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={() => { setIsLogin(true); setErrorMsg(""); }}
                className="w-full py-2.5 rounded-lg bg-[#0F2A4A] hover:bg-[#0062FF] text-white font-medium text-xs transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <span>Mevcut Hesabınızla Giriş Yapın</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <Link
                href="/contact"
                className="block w-full py-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-medium transition-colors text-center"
              >
                Kurumsal Davetiye Talebi İletin
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#0F2A4A] mb-1.5">
                Kullanıcı Adı veya E-posta
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Kullanıcı adınızı girin"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0062FF] focus:ring-2 focus:ring-[#0062FF]/15 text-sm transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F2A4A] mb-1.5">
                Şifre
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0062FF] focus:ring-2 focus:ring-[#0062FF]/15 text-sm transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 rounded-lg bg-[#00BCD4] hover:bg-[#00acc1] text-white font-medium text-sm shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.99] cursor-pointer"
            >
              {loading ? (
                "İşleniyor..."
              ) : (
                <>
                  Giriş Yap <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          <Link
            href="/"
            className="text-xs text-slate-500 hover:text-[#0062FF] inline-flex items-center gap-1 transition-colors"
          >
            ← Ana Sayfaya Dön
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAFBFC] flex items-center justify-center text-slate-400 text-sm">Yükleniyor...</div>}>
      <LoginFormContent />
    </Suspense>
  );
}
