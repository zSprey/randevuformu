"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Calendar, Lock, Mail, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
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

  // Sayfa açıldığında eski sahte veya çerez kalıntılarını temizle (Doğrudan otomatik girişi engeller)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isProd = window.location.protocol === "https:";
      const domainStr = window.location.hostname.includes("randevuformu.com") ? "; domain=.randevuformu.com" : "";
      const secureStr = isProd ? "; Secure" : "";

      // Oturum çerezlerini sıfırla ki kullanıcı şifre girmeden panele girmesin
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

    // Host-only cookie fallback
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

      // Call server-side session creator for HTTP-level cookies
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

      // 1. KESİN KURAL: By Erman Girişi Sadece Doğru Şifre ile Mümkündür
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
        const { data, error } = await supabase.auth.signInWithPassword({
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
        const { data, error } = await supabase.auth.signUp({
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
    } catch (err: any) {
      setErrorMsg("Giriş yapılamadı. Lütfen bilgilerinizi kontrol edip tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden text-white">
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-8 rounded-3xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-2xl shadow-2xl relative z-10"
      >
        {/* Logo / Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <Link href="/" className="flex items-center gap-2 mb-3">
            <div className="p-2.5 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/40">
              <Calendar className="w-6 h-6" />
            </div>
            <span className="text-2xl font-black tracking-tight text-white">
              randevuformu
            </span>
          </Link>
          <p className="text-slate-400 text-sm">
            {isLogin ? "Yönetim Paneline Giriş Yapın" : "30 Saniyede Ücretsiz Hesabınızı Açın"}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 mb-6 rounded-2xl bg-slate-950/60 border border-slate-800/60">
          <button
            type="button"
            onClick={() => { setIsLogin(true); setErrorMsg(""); }}
            className={`py-2 text-sm font-semibold rounded-xl transition-all ${
              isLogin
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Giriş Yap
          </button>
          <button
            type="button"
            onClick={() => { setIsLogin(false); setErrorMsg(""); }}
            className={`py-2 text-sm font-semibold rounded-xl transition-all ${
              !isLogin
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Kayıt Ol
          </button>
        </div>

        {/* Feedback Messages */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-200 text-xs flex items-start gap-2 leading-relaxed">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Adınız ve Soyadınız
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Adınız Soyadınız"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  İşletme veya Salon Adınız
                </label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Örn: Aksoy Danışmanlık veya Özlem Kuaför"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {isLogin ? "Kullanıcı Adı veya E-posta" : "E-posta Adresiniz"}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Kullanıcı adınızı girin"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
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
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              "İşleniyor..."
            ) : isLogin ? (
              <>
                Giriş Yap <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                Ücretsiz Başla <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">Yükleniyor...</div>}>
      <LoginFormContent />
    </Suspense>
  );
}
