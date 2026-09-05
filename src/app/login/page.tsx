"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  Mail,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Building2,
  User,
  Phone,
  Globe,
  MapPin,
  Sparkles,
  Eye,
  EyeOff,
  ShieldCheck,
  Check,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

const CATEGORIES = [
  "Berber & Erkek Kuaförü",
  "Kadın Kuaförü & Güzellik Merkezi",
  "Diş Hekimi & Klinik",
  "Diyetisyen & Beslenme Danışmanlığı",
  "Psikolog & Terapi Seansı",
  "Fizyoterapi & Manuel Terapi",
  "Oto Servis & Detailing",
  "Dövme & Piercing Stüdyosu",
  "Fotoğrafçı & Stüdyo",
  "Hukuk & Avukatlık Bürosu",
  "Veteriner Kliniği",
  "Özel Ders & Eğitim Koçluğu",
  "Diğer / Özel Hizmet",
];

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Tab State
  const [isLogin, setIsLogin] = useState(true);

  // Login Form States
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Registration Form States
  const [businessName, setBusinessName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [registerPhone, setRegisterPhone] = useState("");
  const [category, setCategory] = useState("Berber & Erkek Kuaförü");
  const [city, setCity] = useState("İstanbul");
  const [district, setDistrict] = useState("");
  const [website, setWebsite] = useState("");
  const [locationUrl, setLocationUrl] = useState("");

  // Submission & Feedback States
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [registerSuccessData, setRegisterSuccessData] = useState<{
    businessName: string;
    email: string;
    ownerName: string;
  } | null>(null);

  // Sayfa açıldığında eski çerezleri temizle ve URL parametrelerini dinle
  useEffect(() => {
    if (typeof window !== "undefined") {
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

  // 1. GİRİŞ YAPMA İŞLEMİ (LOGIN)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const cleanIdentifier = loginIdentifier.trim().toLowerCase();
      const isByErman =
        cleanIdentifier === "byerman" ||
        cleanIdentifier === "byerman@randevuformu.com" ||
        cleanIdentifier === "byerman@gmail.com" ||
        cleanIdentifier === "ermankuafor" ||
        cleanIdentifier === "ermankuafor@randevuformu.com";

      // A. By Erman Bypass
      if (isByErman) {
        if (loginPassword === "byerman123" || loginPassword === "ermankuafor123") {
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

      // B. Onay Durumu Kontrolü (Approval Status Check)
      try {
        const statusRes = await fetch(`/api/auth/status?email=${encodeURIComponent(cleanIdentifier)}`);
        if (statusRes.ok) {
          const statusData = await statusRes.json();
          if (statusData.success) {
            if (statusData.status === "PENDING") {
              setErrorMsg(
                "Kayıt başvurunuz şu anda yönetici onayında beklemektedir. Başvurunuz onaylandığında e-posta ile bilgilendirilecek ve sisteme erişebileceksiniz."
              );
              setLoading(false);
              return;
            } else if (statusData.status === "REJECTED") {
              setErrorMsg(
                `Kayıt başvurunuz onaylanmadı.${
                  statusData.rejectionReason ? ` Gerekçe: ${statusData.rejectionReason}` : ""
                } Destek için lütfen iletişime geçin.`
              );
              setLoading(false);
              return;
            }
          }
        }
      } catch (checkErr) {
        console.warn("Status check warning:", checkErr);
      }

      // C. Supabase Auth ile Giriş
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: cleanIdentifier.includes("@") ? cleanIdentifier : `${cleanIdentifier}@randevuformu.com`,
        password: loginPassword,
      });

      if (authError) {
        setErrorMsg("Kullanıcı adı veya şifre hatalı. Lütfen kontrol edip tekrar deneyin.");
        setLoading(false);
        return;
      }

      // D. E-Posta Doğrulama Kontrolü
      if (authData?.user && !authData.user.email_confirmed_at && cleanIdentifier.includes("@")) {
        setErrorMsg(
          "Lütfen önce e-posta adresinize gönderilen aktivasyon linkine tıklayarak e-posta adresinizi doğrulayın."
        );
        setLoading(false);
        return;
      }

      // E. Session Çerezi Oluşturma
      const userSlug =
        authData?.user?.user_metadata?.business_name?.replace(/[^a-z0-9]/gi, "").toLowerCase() ||
        cleanIdentifier.replace(/[^a-z0-9]/gi, "").toLowerCase() ||
        "default";
      const bName = authData?.user?.user_metadata?.business_name || "İşletme Yönetim Paneli";

      try {
        await fetch("/api/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            identifier: cleanIdentifier,
            password: loginPassword,
            businessName: bName,
            tenant: userSlug,
          }),
        });
      } catch {}

      setAuthCookie(cleanIdentifier, userSlug, bName);
      setSuccessMsg("Giriş başarılı! Yönetim panelinize yönlendiriliyorsunuz...");
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 600);
    } catch {
      setErrorMsg("Giriş yapılırken bir sorun oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  // 2. KAYIT OLMA İŞLEMİ (REGISTER)
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    if (!businessName.trim()) {
      setErrorMsg("Lütfen işletmenizin adını girin.");
      setLoading(false);
      return;
    }
    if (!ownerName.trim()) {
      setErrorMsg("Lütfen yetkili ad ve soyadınızı girin.");
      setLoading(false);
      return;
    }
    if (!registerEmail.trim() || !registerEmail.includes("@")) {
      setErrorMsg("Lütfen geçerli bir e-posta adresi girin.");
      setLoading(false);
      return;
    }
    if (registerPassword.length < 6) {
      setErrorMsg("Şifreniz en az 6 karakter olmalıdır.");
      setLoading(false);
      return;
    }
    if (!registerPhone.trim() || registerPhone.trim().length < 10) {
      setErrorMsg("Lütfen geçerli bir telefon / WhatsApp numarası girin (Örn: 0532 123 45 67).");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: businessName.trim(),
          ownerName: ownerName.trim(),
          email: registerEmail.trim(),
          password: registerPassword,
          phone: registerPhone.trim(),
          category,
          city: city.trim(),
          district: district.trim(),
          website: website.trim(),
          locationUrl: locationUrl.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || "Kayıt oluşturulurken bir hata oluştu.");
        setLoading(false);
        return;
      }

      // Kayıt Başarılı -> Başarı Ekranını Göster
      setRegisterSuccessData({
        businessName: businessName.trim(),
        email: registerEmail.trim(),
        ownerName: ownerName.trim(),
      });
    } catch {
      setErrorMsg("Sunucuyla bağlantı kurulamadı. Lütfen internet bağlantınızı kontrol edip tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFBFC] flex flex-col justify-center items-center px-4 py-10 relative text-[#0F172A] font-sans antialiased">
      {/* Subtle brand geometry background accent */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-[#00BCD4]/[0.03] to-transparent rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-[#0062FF]/[0.03] to-transparent rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className={`w-full ${
          !isLogin && !registerSuccessData ? "max-w-xl" : "max-w-md"
        } p-6 sm:p-8 rounded-2xl bg-white border border-slate-200/90 shadow-sm relative z-10 transition-all duration-300`}
      >
        {/* Logo / Header */}
        <div className="flex flex-col items-center mb-6 text-center">
          <Link href="/" className="flex flex-col items-center gap-2 mb-2 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
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
            {registerSuccessData
              ? "Başvuru Onayı"
              : isLogin
              ? "İşletme Yönetim Paneline Giriş Yapın"
              : "Yeni İşletme Kayıt & Başvuru Formu"}
          </p>
        </div>

        {/* Tab Switcher — Sadece form açıkken göster */}
        {!registerSuccessData && (
          <div className="grid grid-cols-2 p-1 mb-6 rounded-xl bg-slate-100 border border-slate-200/80">
            <button
              type="button"
              onClick={() => {
                setIsLogin(true);
                setErrorMsg("");
                setSuccessMsg("");
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                isLogin
                  ? "bg-white text-[#0F2A4A] shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Giriş Yap
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLogin(false);
                setErrorMsg("");
                setSuccessMsg("");
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                !isLogin
                  ? "bg-white text-[#0062FF] shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#00BCD4]" />
              <span>İşletme Kaydı Aç</span>
            </button>
          </div>
        )}

        {/* Feedback Messages */}
        {errorMsg && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 leading-relaxed">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ----------------- EKRAN 1: KAYIT BAŞARILI KARTI ----------------- */}
        {registerSuccessData ? (
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/90 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-2xs">
              <CheckCircle2 className="w-8 h-8 stroke-[2.2]" />
            </div>

            <div className="space-y-1.5">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/70 px-2.5 py-0.5 rounded-full">
                Başvurunuz Alındı
              </span>
              <h3 className="text-base font-bold text-[#0F2A4A]">
                Sayın {registerSuccessData.ownerName}, Tebrikler!
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                <strong>{registerSuccessData.businessName}</strong> için kayıt başvurunuz başarıyla oluşturuldu.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-left space-y-2 text-xs">
              <div className="flex items-start gap-2 text-slate-700">
                <span className="font-bold text-[#0062FF] shrink-0">1. E-posta Doğrulaması:</span>
                <span>
                  <strong>{registerSuccessData.email}</strong> adresinize gönderilen aktivasyon linkine tıklayın.
                </span>
              </div>
              <div className="flex items-start gap-2 text-slate-700">
                <span className="font-bold text-[#0062FF] shrink-0">2. Yönetici Onayı:</span>
                <span>
                  Başvurunuz onaylandığında e-posta ile bildirim alacak ve sisteme doğrudan giriş yapabileceksiniz.
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setRegisterSuccessData(null);
                setIsLogin(true);
                setLoginIdentifier(registerSuccessData.email);
              }}
              className="w-full py-2.5 rounded-xl bg-[#0062FF] hover:bg-[#0051d4] text-white font-medium text-xs shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Giriş Ekranına Dön</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : isLogin ? (
          /* ----------------- EKRAN 2: GİRİŞ YAP FORMU ----------------- */
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#0F2A4A] mb-1.5">
                Kullanıcı Adı veya E-posta
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  placeholder="Kullanıcı adınızı veya e-postanızı girin"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0062FF] focus:ring-2 focus:ring-[#0062FF]/15 text-xs sm:text-sm transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-[#0F2A4A]">Şifre</label>
                <Link
                  href="/contact?subject=sifre-sifirlama"
                  className="text-[11px] text-[#0062FF] hover:underline"
                >
                  Şifremi Unuttum
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showLoginPassword ? "text" : "password"}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0062FF] focus:ring-2 focus:ring-[#0062FF]/15 text-xs sm:text-sm transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 rounded-xl bg-[#0062FF] hover:bg-[#0051d4] text-white font-medium text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.99] cursor-pointer"
            >
              {loading ? (
                "Kontrol ediliyor..."
              ) : (
                <>
                  <span>Giriş Yap</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="pt-2 text-center">
              <span className="text-xs text-slate-500">Henüz işletmeniz kayıtlı değil mi? </span>
              <button
                type="button"
                onClick={() => {
                  setIsLogin(false);
                  setErrorMsg("");
                }}
                className="text-xs font-semibold text-[#0062FF] hover:underline cursor-pointer"
              >
                Hemen Başvurun
              </button>
            </div>
          </form>
        ) : (
          /* ----------------- EKRAN 3: YENİ İŞLETME KAYIT FORMU ----------------- */
          <form onSubmit={handleRegister} className="space-y-3.5">
            {/* 1. İşletme Adı & Kategori */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#0F2A4A] mb-1">
                  İşletme Adı <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Örn: By Erman Hair Studio"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0062FF] text-xs transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#0F2A4A] mb-1">
                  Sektör / Kategori <span className="text-rose-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-[#0062FF] transition-all cursor-pointer"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 2. Yetkili Adı & Telefon */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#0F2A4A] mb-1">
                  Yetkili Ad Soyad <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="Örn: Erman Güler"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0062FF] text-xs transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#0F2A4A] mb-1">
                  Telefon / WhatsApp <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={registerPhone}
                    onChange={(e) => setRegisterPhone(e.target.value)}
                    placeholder="0538 480 90 01"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0062FF] text-xs transition-all"
                  />
                </div>
              </div>
            </div>

            {/* 3. E-posta & Şifre */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#0F2A4A] mb-1">
                  Kurumsal E-posta <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    placeholder="ornek@isletme.com"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0062FF] text-xs transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#0F2A4A] mb-1">
                  Giriş Şifresi <span className="text-rose-500">* (Min 6 karakter)</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showRegisterPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-9 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0062FF] text-xs transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showRegisterPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* 4. Şehir & İlçe (Opsiyonel) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#0F2A4A] mb-1">
                  Şehir / İl
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Örn: İstanbul"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0062FF] text-xs transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#0F2A4A] mb-1">
                  İlçe / Bölge
                </label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="Örn: Ümraniye, Kadıköy..."
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0062FF] text-xs transition-all"
                />
              </div>
            </div>

            {/* 5. Web Sitesi & Google Maps Konumu (Opsiyonel) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#0F2A4A] mb-1">
                  Web Sitesi / Instagram (Opsiyonel)
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="instagram.com/isletmeniz"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0062FF] text-xs transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#0F2A4A] mb-1">
                  Google Harita Linki (Opsiyonel)
                </label>
                <input
                  type="text"
                  value={locationUrl}
                  onChange={(e) => setLocationUrl(e.target.value)}
                  placeholder="https://maps.google.com/..."
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0062FF] text-xs transition-all"
                />
              </div>
            </div>

            {/* Bilgilendirme Notu */}
            <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 flex items-start gap-2 text-[11px] text-blue-900 leading-relaxed">
              <ShieldCheck className="w-4 h-4 text-[#0062FF] shrink-0 mt-0.5" />
              <span>
                Kaydınız oluşturulduktan sonra e-posta doğrulamanız istenecek ve başvurunuz yönetici onayından geçtikten sonra işletme yönetim paneliniz kullanıma açılacaktır.
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 rounded-xl bg-[#0062FF] hover:bg-[#0051d4] text-white font-semibold text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.99] cursor-pointer"
            >
              {loading ? (
                "Başvurunuz Alınıyor..."
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Kayıt Başvurusunu Tamamla</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="pt-1 text-center">
              <span className="text-xs text-slate-500">Zaten bir hesabınız var mı? </span>
              <button
                type="button"
                onClick={() => {
                  setIsLogin(true);
                  setErrorMsg("");
                }}
                className="text-xs font-semibold text-[#0062FF] hover:underline cursor-pointer"
              >
                Giriş Yapın
              </button>
            </div>
          </form>
        )}

        <div className="mt-5 pt-3 border-t border-slate-100 text-center">
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
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAFBFC] flex items-center justify-center text-slate-400 text-sm">
          Yükleniyor...
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
