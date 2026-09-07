"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ShieldCheck, Lock, User, ArrowRight, AlertTriangle, KeyRound, Sparkles, CheckCircle2, Eye, EyeOff } from "lucide-react";

export default function SuperAdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [lockoutTime, setLockoutTime] = useState<number | null>(null);

  const handleUnlock = async () => {
    try {
      const res = await fetch("/api/admin/auth/unlock", { method: "POST" });
      if (res.ok) {
        setErrorMsg("");
        setLockoutTime(null);
        setSuccessMsg("Kilit başarıyla kaldırıldı! Bilgilerinizi girip giriş yapabilirsiniz.");
      }
    } catch {
      setErrorMsg("Kilit kaldırılamadı, lütfen sayfayı yenileyip tekrar deneyin.");
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const cleanUser = username.trim().toLowerCase();
      const cleanPass = password.trim();

      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: cleanUser,
          password: cleanPass,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Giriş başarısız.");
        if (data.isLocked && data.remainingSeconds) {
          setLockoutTime(data.remainingSeconds);
        }
      } else {
        setSuccessMsg("Super Admin doğrulaması başarılı! Kontrol merkezine aktarılıyorsunuz...");
        const token = data?.data?.token || data?.token || "superadmin_session";
        const isHttps = typeof window !== "undefined" && window.location.protocol === "https:";
        const isRf = typeof window !== "undefined" && window.location.hostname.includes("randevuformu.com");
        const domainStr = isRf ? "; domain=.randevuformu.com" : "";
        const secureStr = isHttps ? "; Secure" : "";

        document.cookie = `rf_superadmin_session=${token}; path=/; max-age=86400; SameSite=Lax${domainStr}${secureStr}`;
        document.cookie = `rf_superadmin_session=${token}; path=/; max-age=86400; SameSite=Lax${secureStr}`;
        document.cookie = `rf_superadmin=true; path=/; max-age=86400; SameSite=Lax${domainStr}${secureStr}`;
        document.cookie = `rf_superadmin=true; path=/; max-age=86400; SameSite=Lax${secureStr}`;

        try {
          localStorage.setItem("rf_superadmin_session", token);
          localStorage.setItem("rf_superadmin", "true");
        } catch {}

        setTimeout(() => {
          window.location.href = "/admin";
        }, 400);
      }
    } catch (err: any) {
      setErrorMsg("Bağlantı hatası oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-red-600/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-600/10 blur-[130px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-slate-900/90 border border-red-500/30 p-8 rounded-3xl backdrop-blur-2xl shadow-2xl relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-400 shadow-lg shadow-red-500/20">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center justify-center gap-2">
            Super Admin Gate
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            randevuformu.com Ana Yönetici & Kurucu Güvenlik Kapısı
          </p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-300 text-[10px] font-bold">
            <Lock className="w-3 h-3" />
            256-Bit Brute-Force & HMAC Korumalı
          </div>
        </div>

        {/* Feedback */}
        {errorMsg && (
          <div className="mb-5 p-3.5 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs flex flex-col gap-2 leading-relaxed">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
            {(lockoutTime || errorMsg.includes("kilitlendi")) && (
              <button
                type="button"
                onClick={handleUnlock}
                className="mt-1 self-start px-3 py-1.5 bg-red-600/30 hover:bg-red-600/50 border border-red-500/50 rounded-xl text-white font-bold text-[11px] transition-all flex items-center gap-1.5 shadow-sm"
              >
                🔓 Kilidi Hemen Kaldır
              </button>
            )}
          </div>
        )}

        {successMsg && (
          <div className="mb-5 p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2.5 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 ml-1">
              Admin Kullanıcı Adı
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Kullanıcı adı"
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-red-500 text-xs font-medium transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 ml-1">
              Admin Özel Şifresi
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? "text" : "password"}
                required
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-12 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-red-500 text-xs font-medium transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-1"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-3 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs shadow-xl shadow-red-600/30 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 disabled:opacity-50"
          >
            {loading ? "Doğrulanıyor..." : "Yönetim Merkezine Giriş Yap"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-800 text-center">
          <Link
            href="/"
            className="text-[11px] text-slate-500 hover:text-slate-300 font-medium transition-colors"
          >
            ← Ana Sayfaya Dön
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
