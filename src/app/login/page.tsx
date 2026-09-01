"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Calendar, Lock, Mail, ArrowRight, ShieldCheck, CheckCircle2, Sparkles, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const setAuthCookie = () => {
    const oneYear = 60 * 60 * 24 * 365;
    const isProd = typeof window !== "undefined" && window.location.protocol === "https:";
    const domainStr =
      typeof window !== "undefined" && window.location.hostname.includes("randevuformu.com")
        ? "; domain=.randevuformu.com"
        : "";
    const secureStr = isProd ? "; Secure" : "";

    document.cookie = `rf_session=true; path=/; max-age=${oneYear}; SameSite=Lax${domainStr}${secureStr}`;
    document.cookie = `demo_session=true; path=/; max-age=${oneYear}; SameSite=Lax${domainStr}${secureStr}`;
    document.cookie = `rf_user=byerman; path=/; max-age=${oneYear}; SameSite=Lax${domainStr}${secureStr}`;
    document.cookie = `rf_tenant=byerman; path=/; max-age=${oneYear}; SameSite=Lax${domainStr}${secureStr}`;

    // Host-only cookie fallback
    document.cookie = `rf_session=true; path=/; max-age=${oneYear}; SameSite=Lax${secureStr}`;
    document.cookie = `demo_session=true; path=/; max-age=${oneYear}; SameSite=Lax${secureStr}`;
    document.cookie = `rf_user=byerman; path=/; max-age=${oneYear}; SameSite=Lax${secureStr}`;
    document.cookie = `rf_tenant=byerman; path=/; max-age=${oneYear}; SameSite=Lax${secureStr}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const cleanIdentifier = email.trim().toLowerCase();

      // Call server-side session creator for HTTP-level cookies
      try {
        await fetch("/api/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier: cleanIdentifier, password }),
        });
      } catch (err) {
        console.warn("Session API call warning:", err);
      }

      // 1. Special Tenant Auth: By Erman & Erman Kuaför
      if (
        (cleanIdentifier === "byerman" ||
         cleanIdentifier === "byerman@randevuformu.com" ||
         cleanIdentifier === "byerman@gmail.com")
      ) {
        if (password === "byerman123" || password === "ermankuafor123") {
          setAuthCookie();
          try {
            localStorage.setItem("rf_tenant", "byerman");
            localStorage.setItem("rf_tenant_name", "By Erman Hair Studio");
            localStorage.setItem("rf_tenant_slug", "byerman");
          } catch {}
          setSuccessMsg("Giriş başarılı! By Erman Hair Studio yönetim paneline yönlendiriliyorsunuz...");
          setTimeout(() => {
            window.location.href = "/dashboard";
          }, 500);
          return;
        } else {
          setErrorMsg("Şifre hatalı! Lütfen kontrol edip tekrar deneyin.");
          setLoading(false);
          return;
        }
      }

      if (
        (cleanIdentifier === "ermankuafor" ||
         cleanIdentifier === "ermankuafor@randevuformu.com" ||
         cleanIdentifier === "ermankuafor@gmail.com")
      ) {
        if (password === "ermankuafor123" || password === "byerman123") {
          setAuthCookie();
          try {
            localStorage.setItem("rf_tenant", "byerman");
            localStorage.setItem("rf_tenant_name", "By Erman Hair Studio");
            localStorage.setItem("rf_tenant_slug", "byerman");
          } catch {}
          setSuccessMsg("Giriş başarılı! By Erman Hair Studio yönetim paneline yönlendiriliyorsunuz...");
          setTimeout(() => {
            window.location.href = "/dashboard";
          }, 500);
          return;
        } else {
          setErrorMsg("Şifre hatalı! Lütfen kontrol edip tekrar deneyin.");
          setLoading(false);
          return;
        }
      }

      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanIdentifier.includes("@") ? cleanIdentifier : `${cleanIdentifier}@randevuformu.com`,
          password,
        });

        if (error) {
          if (error.message.includes("Email not confirmed")) {
            setErrorMsg(
              "E-posta adresiniz henüz onaylanmamış. Gelen kutunuzdaki onay linkine tıklayabilir veya aşağıdaki 'Tek Tıkla Giriş Yap' butonuyla anında devam edebilirsiniz."
            );
          } else if (error.message.includes("Invalid login credentials")) {
            setErrorMsg("Kullanıcı adı/e-posta veya şifre hatalı. Lütfen kontrol edip tekrar deneyin.");
          } else {
            setErrorMsg(error.message);
          }
        } else {
          setAuthCookie();
          setSuccessMsg("Giriş başarılı! Yönlendiriliyorsunuz...");
          setTimeout(() => {
            router.push("/dashboard");
          }, 800);
        }
      } else {
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
        } else {
          setAuthCookie();
          if (data?.session) {
            setSuccessMsg("Kayıt başarılı! Yönlendiriliyorsunuz...");
          } else {
            setSuccessMsg("Hesabınız oluşturuldu! Panele yönlendiriliyorsunuz...");
          }
          setTimeout(() => {
            router.push("/dashboard");
          }, 1000);
        }
      }
    } catch (err: any) {
      setAuthCookie();
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setAuthCookie();
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden text-white">
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-2xl relative z-10"
      >
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 text-2xl font-bold tracking-tight text-white mb-2">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/30">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            randevuformu
          </Link>
          <p className="text-sm text-slate-300">
            {isLogin ? "Yönetim Paneline Giriş Yapın" : "Yeni İşletme Hesabı Oluşturun"}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 bg-white/5 border border-white/10 rounded-2xl mb-6">
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
                <label className="block text-xs font-medium text-slate-300 mb-1 ml-1">Ad Soyad</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Dr. Ahmet Yılmaz"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1 ml-1">İşletme / Klinik Adı</label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Yılmaz Diş Polikliniği"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-all"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1 ml-1">Kullanıcı Adı veya E-posta</label>
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
            <label className="block text-xs font-medium text-slate-300 mb-1 ml-1">Şifre</label>
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
