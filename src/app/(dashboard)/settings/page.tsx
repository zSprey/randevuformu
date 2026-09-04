"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  Bell,
  Building,
  Save,
  CreditCard,
  Mail,
  CheckCircle2,
  Phone,
  CalendarDays,
  Sparkles,
  MessageCircle,
  Zap,
  Clock,
  Loader2,
  Lock,
  Globe,
  Check,
  Smartphone,
  ShieldCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  updateBusinessWhatsapp,
  updateYieldManagementSettings,
  getBusinessSettings,
} from "@/app/actions/business-settings";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("whatsapp");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State: Profile
  const [fullName, setFullName] = useState("İşletme Yetkilisi");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [title, setTitle] = useState("Yetkili");
  const [bio, setBio] = useState("");

  // Clinic Settings
  const [clinicName, setClinicName] = useState("İşletmem");
  const [clinicSlug, setClinicSlug] = useState("isletme");
  const [clinicAddress, setClinicAddress] = useState("");
  const [cancelPolicyHours, setCancelPolicyHours] = useState("24");

  // WhatsApp Hotline (Module 1)
  const [businessId, setBusinessId] = useState("cl_demo_business_123");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [isWhatsappActive, setIsWhatsappActive] = useState(true);
  const [whatsappDefaultMessage, setWhatsappDefaultMessage] = useState("Merhaba, randevu almak istiyorum.");
  const [isSavingWhatsapp, setIsSavingWhatsapp] = useState(false);

  // Yield Management (Module 3)
  const [isDynamicDiscountActive, setIsDynamicDiscountActive] = useState(false);
  const [dynamicDiscountPercent, setDynamicDiscountPercent] = useState(20);
  const [discountThresholdHours, setDiscountThresholdHours] = useState(4);
  const [isSavingYield, setIsSavingYield] = useState(false);

  // Notifications Toggles
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [autoConfirm, setAutoConfirm] = useState(true);

  // Calendar Sync
  const [googleConnected, setGoogleConnected] = useState(false);
  const [outlookConnected, setOutlookConnected] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    async function loadSettings() {
      if (typeof window === "undefined") return;

      const isByErmanHost = window.location.hostname.includes("byerman");
      const currentUser = localStorage.getItem("rf_user");
      const currentTenant = localStorage.getItem("rf_tenant") || "default";
      const isByErman = isByErmanHost || (currentUser === "byerman" && currentTenant === "byerman");

      // 1. Profile Persistence
      const savedProfile = localStorage.getItem("rf_settings_profile");
      if (savedProfile) {
        try {
          const p = JSON.parse(savedProfile);
          if (p.fullName) setFullName(p.fullName);
          if (p.email) setEmail(p.email);
          if (p.phone) setPhone(p.phone);
          if (p.title) setTitle(p.title);
          if (p.bio) setBio(p.bio);
        } catch {}
      } else if (isByErman) {
        setFullName("Erman Güler");
        setTitle("Master Barber");
      }

      // 2. Clinic Persistence
      const savedClinic = localStorage.getItem("rf_settings_clinic");
      if (savedClinic) {
        try {
          const c = JSON.parse(savedClinic);
          if (c.clinicName) setClinicName(c.clinicName);
          if (c.clinicSlug) setClinicSlug(c.clinicSlug);
          if (c.clinicAddress) setClinicAddress(c.clinicAddress);
          if (c.cancelPolicyHours) setCancelPolicyHours(c.cancelPolicyHours);
        } catch {}
      } else if (isByErman) {
        setClinicName("By Erman Hair Studio");
        setClinicSlug("byerman");
      } else {
        const storedName = localStorage.getItem("rf_tenant_name");
        const storedSlug = localStorage.getItem("rf_tenant_slug") || currentTenant;
        if (storedName && storedName !== "İşletme Yönetim Paneli" && !storedName.includes("Ahmet Yılmaz")) {
          setClinicName(storedName);
        } else if (storedSlug && storedSlug !== "default" && storedSlug !== "dashboard") {
          setClinicName(storedSlug.charAt(0).toUpperCase() + storedSlug.slice(1));
        }
        if (storedSlug && storedSlug !== "dashboard") {
          setClinicSlug(storedSlug);
        }
      }

      // 3. Notifications Persistence
      const savedNotifs = localStorage.getItem("rf_settings_notifications");
      if (savedNotifs) {
        try {
          const n = JSON.parse(savedNotifs);
          if (typeof n.smsEnabled === "boolean") setSmsEnabled(n.smsEnabled);
          if (typeof n.whatsappEnabled === "boolean") setWhatsappEnabled(n.whatsappEnabled);
          if (typeof n.emailEnabled === "boolean") setEmailEnabled(n.emailEnabled);
          if (typeof n.autoConfirm === "boolean") setAutoConfirm(n.autoConfirm);
        } catch {}
      }

      // 4. WhatsApp Persistence
      const savedWhatsapp = localStorage.getItem("rf_settings_whatsapp");
      if (savedWhatsapp) {
        try {
          const w = JSON.parse(savedWhatsapp);
          if (w.whatsappNumber) setWhatsappNumber(w.whatsappNumber);
          if (typeof w.isWhatsappActive === "boolean") setIsWhatsappActive(w.isWhatsappActive);
          if (w.whatsappDefaultMessage) setWhatsappDefaultMessage(w.whatsappDefaultMessage);
        } catch {}
      }

      // 5. Yield Persistence
      const savedYield = localStorage.getItem("rf_settings_yield");
      if (savedYield) {
        try {
          const y = JSON.parse(savedYield);
          if (typeof y.isDynamicDiscountActive === "boolean") setIsDynamicDiscountActive(y.isDynamicDiscountActive);
          if (y.dynamicDiscountPercent) setDynamicDiscountPercent(y.dynamicDiscountPercent);
          if (y.discountThresholdHours) setDiscountThresholdHours(y.discountThresholdHours);
        } catch {}
      }

      // 6. Integrations Persistence
      const savedIntegrations = localStorage.getItem("rf_settings_integrations");
      if (savedIntegrations) {
        try {
          const i = JSON.parse(savedIntegrations);
          if (typeof i.googleConnected === "boolean") setGoogleConnected(i.googleConnected);
          if (typeof i.outlookConnected === "boolean") setOutlookConnected(i.outlookConnected);
        } catch {}
      }

      // 7. Supabase Business Settings
      try {
        const res = await getBusinessSettings(currentTenant);
        if (res.success && res.business) {
          setBusinessId(res.business.id);
          if (res.business.name) setClinicName(res.business.name);
          if (res.business.whatsappNumber) setWhatsappNumber(res.business.whatsappNumber);
          setIsWhatsappActive(res.business.isWhatsappActive);
          if (res.business.whatsappDefaultMessage) setWhatsappDefaultMessage(res.business.whatsappDefaultMessage);
          setIsDynamicDiscountActive(res.business.isDynamicDiscountActive);
          setDynamicDiscountPercent(res.business.dynamicDiscountPercent);
          setDiscountThresholdHours(res.business.discountThresholdHours);
        }
      } catch {}
    }

    loadSettings();
  }, []);

  // Save Profile Handler
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { fullName, email, phone, title, bio };
    localStorage.setItem("rf_settings_profile", JSON.stringify(data));
    localStorage.setItem("rf_user_name", fullName);
    showToast("Profil ve uzman bilgileriniz başarıyla kaydedildi.");
  };

  // Save Clinic Settings Handler
  const handleSaveClinic = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSlug = clinicSlug.toLowerCase().replace(/[^a-z0-9-_]/g, "");
    const data = {
      clinicName: clinicName.trim(),
      clinicSlug: cleanSlug,
      clinicAddress: clinicAddress.trim(),
      cancelPolicyHours,
    };
    localStorage.setItem("rf_settings_clinic", JSON.stringify(data));
    localStorage.setItem("rf_tenant_name", clinicName.trim());
    localStorage.setItem("rf_tenant_slug", cleanSlug);
    window.dispatchEvent(new Event("storage"));
    showToast("Klinik ve rezervasyon ayarlarınız kaydedildi.");
  };

  // Save Notifications Handler
  const handleSaveNotifications = (
    newSms: boolean,
    newWhatsapp: boolean,
    newEmail: boolean,
    newAutoConfirm: boolean
  ) => {
    const data = {
      smsEnabled: newSms,
      whatsappEnabled: newWhatsapp,
      emailEnabled: newEmail,
      autoConfirm: newAutoConfirm,
    };
    localStorage.setItem("rf_settings_notifications", JSON.stringify(data));
    showToast("Bildirim kanalı tercihleriniz kaydedildi.");
  };

  // Save WhatsApp Hotline
  const handleSaveWhatsapp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingWhatsapp(true);

    const localData = {
      whatsappNumber: whatsappNumber.trim(),
      isWhatsappActive,
      whatsappDefaultMessage: whatsappDefaultMessage.trim(),
    };
    localStorage.setItem("rf_settings_whatsapp", JSON.stringify(localData));

    try {
      const fd = new FormData();
      fd.append("businessId", businessId);
      fd.append("whatsappNumber", whatsappNumber.trim());
      fd.append("isWhatsappActive", String(isWhatsappActive));
      fd.append("whatsappDefaultMessage", whatsappDefaultMessage.trim());

      const res = await updateBusinessWhatsapp(fd);
      showToast(res.message || "WhatsApp hattı ayarlarınız güncellendi.");
    } catch {
      showToast("WhatsApp hattı yerel olarak kaydedildi.");
    } finally {
      setIsSavingWhatsapp(false);
    }
  };

  // Save Dynamic Discount (Yield)
  const handleSaveYield = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingYield(true);

    const localData = {
      isDynamicDiscountActive,
      dynamicDiscountPercent,
      discountThresholdHours,
    };
    localStorage.setItem("rf_settings_yield", JSON.stringify(localData));

    try {
      const fd = new FormData();
      fd.append("businessId", businessId);
      fd.append("isDynamicDiscountActive", String(isDynamicDiscountActive));
      fd.append("dynamicDiscountPercent", String(dynamicDiscountPercent));
      fd.append("discountThresholdHours", String(discountThresholdHours));

      const res = await updateYieldManagementSettings(fd);
      showToast(res.message || "Dinamik indirim motoru güncellendi.");
    } catch {
      showToast("İndirim motoru ayarları yerel olarak kaydedildi.");
    } finally {
      setIsSavingYield(false);
    }
  };

  // Toggle Integration
  const toggleIntegration = (type: "google" | "outlook", nextState: boolean) => {
    const updated = {
      googleConnected: type === "google" ? nextState : googleConnected,
      outlookConnected: type === "outlook" ? nextState : outlookConnected,
    };
    if (type === "google") setGoogleConnected(nextState);
    if (type === "outlook") setOutlookConnected(nextState);
    localStorage.setItem("rf_settings_integrations", JSON.stringify(updated));
    showToast(`${type === "google" ? "Google Calendar" : "Outlook"} bağlantısı ${nextState ? "aktif edildi" : "kapatıldı"}.`);
  };

  const tabs = [
    { id: "whatsapp", name: "WhatsApp Hattı (Modül 1)", icon: MessageCircle },
    { id: "yield", name: "Dinamik İndirim (Modül 3)", icon: Zap },
    { id: "profile", name: "Profil & Uzman Bilgileri", icon: User },
    { id: "clinic", name: "Klinik & Rezervasyon", icon: Building },
    { id: "notifications", name: "SMS & E-Posta Bildirimleri", icon: Bell },
    { id: "integrations", name: "Takvim Entegrasyonları", icon: CalendarDays },
    { id: "billing", name: "Paket & Faturalandırma", icon: CreditCard },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Toast Feedback */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-8 z-50 px-4 py-3 rounded-xl bg-[#0F2A4A] text-white text-xs font-semibold shadow-2xl flex items-center gap-2.5 border border-[#0062FF]/30"
          >
            <CheckCircle2 className="w-4 h-4 text-[#00BCD4]" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-[#0F2A4A]">İşletme & Hesap Ayarları</h2>
        <p className="text-xs text-slate-500 mt-1">
          Klinik profilinizi, bildirim kanallarınızı ve entegrasyonlarınızı yönetin. Yapılan değişiklikler anında kaydedilir.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 shrink-0">
          <nav className="flex md:flex-col gap-1.5 overflow-x-auto pb-2 md:pb-0">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all text-left ${
                    isActive
                      ? "bg-[#0062FF] text-white shadow-xs font-semibold"
                      : "bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-slate-200/90 shadow-2xs"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Form Content Area */}
        <div className="flex-1 bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 sm:p-8">
          {/* TAB: WHATSAPP (MODÜL 1) */}
          {activeTab === "whatsapp" && (
            <form onSubmit={handleSaveWhatsapp} className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-[#0F2A4A] flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-emerald-600" />
                    Doğrudan WhatsApp İletişim Hattı
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Müşterilerinizin randevu sayfasındaki sabit WhatsApp butonuna bastığında ulaşacağı işletme hattı.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-slate-600">
                    {isWhatsappActive ? "Aktif" : "Pasif"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsWhatsappActive(!isWhatsappActive)}
                    className={`w-11 h-6 rounded-full transition-colors relative ${
                      isWhatsappActive ? "bg-emerald-600" : "bg-slate-200"
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                        isWhatsappActive ? "left-6" : "left-1"
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  İşletme WhatsApp Telefon Numarası
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="+905551234567"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/60 border border-slate-200 text-slate-900 font-mono tabular-nums text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0062FF] focus:border-[#0062FF]"
                    required
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Uluslararası formatta ülke koduyla birlikte giriniz (Örn: +905551234567)
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Müşteri Açılış Mesajı Şablonu
                </label>
                <textarea
                  rows={3}
                  value={whatsappDefaultMessage}
                  onChange={(e) => setWhatsappDefaultMessage(e.target.value)}
                  placeholder="Merhaba, randevu almak istiyorum."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/60 border border-slate-200 text-slate-900 text-xs leading-relaxed focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0062FF] focus:border-[#0062FF]"
                  maxLength={250}
                />
                <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1">
                  <span>Müşteri butona bastığında WhatsApp metin kutusuna otomatik doldurulur.</span>
                  <span>{whatsappDefaultMessage.length}/250</span>
                </div>
              </div>

              {/* Önizleme Kartı */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-3">
                  Müşteri Randevu Sayfası Önizlemesi
                </span>
                <div className="flex items-center justify-between p-3 rounded-lg bg-white border border-slate-200 shadow-2xs">
                  <div className="text-xs text-slate-600">
                    Kayan Buton Konumu: <strong className="text-[#0F2A4A]">Sağ Alt Köşe</strong>
                  </div>
                  <div className="flex items-center gap-2 rounded-full bg-[#25D366] px-3 py-1.5 text-white font-semibold text-xs shadow-xs">
                    <MessageCircle className="h-3.5 w-3.5" />
                    <span>Hızlı İletişim</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSavingWhatsapp}
                  className="px-5 py-2.5 rounded-xl bg-[#0062FF] hover:bg-[#0051d4] text-white text-xs font-semibold shadow-xs transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isSavingWhatsapp ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  WhatsApp Bilgilerini Kaydet
                </button>
              </div>
            </form>
          )}

          {/* TAB: YIELD MANAGEMENT (MODÜL 3) */}
          {activeTab === "yield" && (
            <form onSubmit={handleSaveYield} className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-[#0F2A4A] flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-500" />
                    Günün Boş Saatleri Dinamik İndirim Motoru
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Son dakikaya kalan boş randevu slotlarına otomatik indirim tanımlayarak boş koltuk maliyetini sıfırlayın.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-slate-600">
                    {isDynamicDiscountActive ? "Aktif" : "Pasif"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsDynamicDiscountActive(!isDynamicDiscountActive)}
                    className={`w-11 h-6 rounded-full transition-colors relative ${
                      isDynamicDiscountActive ? "bg-[#0062FF]" : "bg-slate-200"
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                        isDynamicDiscountActive ? "left-6" : "left-1"
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Uygulanacak İndirim Yüzdesi (%)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min={5}
                      max={50}
                      value={dynamicDiscountPercent}
                      onChange={(e) => setDynamicDiscountPercent(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/60 border border-slate-200 text-slate-900 font-mono tabular-nums text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0062FF] focus:border-[#0062FF]"
                      required
                    />
                    <span className="text-sm font-bold font-mono text-[#0062FF]">%</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Örn: %15 veya %20 indirim</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Devreye Girme Eşiği (Saat Kala)
                  </label>
                  <select
                    value={discountThresholdHours}
                    onChange={(e) => setDiscountThresholdHours(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/60 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0062FF] focus:border-[#0062FF]"
                  >
                    <option value={2}>Randevuya Son 2 Saat Kala</option>
                    <option value={4}>Randevuya Son 4 Saat Kala (Önerilen)</option>
                    <option value={6}>Randevuya Son 6 Saat Kala</option>
                    <option value={12}>Randevuya Son 12 Saat Kala</option>
                    <option value={24}>Randevuya Son 24 Saat Kala (Aynı Gün)</option>
                  </select>
                  <p className="text-[11px] text-slate-400 mt-1">Boş kalan slot kaç saat kala indirimli etiketlensin?</p>
                </div>
              </div>

              {/* Önizleme Rozet Alanı */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Müşterinin Göreceği Saat Rozeti Önizlemesi
                </span>
                <div className="flex items-center gap-4 p-3 rounded-lg bg-white border border-slate-200 shadow-2xs">
                  <div className="relative flex flex-col items-center justify-center rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-slate-900 shadow-xs">
                    <span className="font-mono text-sm font-bold tabular-nums">14:30</span>
                    <span className="absolute -top-2 -right-2 rounded-full bg-red-500 px-1.5 py-0.5 text-[9px] font-bold text-white shadow-xs">
                      -%{dynamicDiscountPercent} Fırsat
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 leading-relaxed">
                    Randevu saati yaklaştığında takvimdeki slotun üzerine otomatik olarak{" "}
                    <span className="text-[#0062FF] font-semibold">-%{dynamicDiscountPercent} Fırsat</span> rozeti
                    iliştirilir ve sepette anında indirim uygulanır.
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSavingYield}
                  className="px-5 py-2.5 rounded-xl bg-[#0062FF] hover:bg-[#0051d4] text-white text-xs font-semibold shadow-xs transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isSavingYield ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  İndirim Motorunu Güncelle
                </button>
              </div>
            </form>
          )}

          {/* TAB: PROFILE */}
          {activeTab === "profile" && (
            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
                <div className="w-14 h-14 rounded-xl bg-[#0F2A4A] text-white font-bold text-lg flex items-center justify-center border border-[#0062FF]/20 shadow-xs">
                  {fullName ? fullName.slice(0, 2).toUpperCase() : "İU"}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#0F2A4A]">{fullName}</h3>
                  <p className="text-xs text-slate-500">{title}</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Ad Soyad</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/60 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0062FF] focus:border-[#0062FF]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Uzmanlık Unvanı</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/60 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0062FF] focus:border-[#0062FF]"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">E-Posta</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ornek@isletme.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/60 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0062FF] focus:border-[#0062FF]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Telefon</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="05XX XXX XX XX"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/60 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0062FF] focus:border-[#0062FF]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Hakkında & Biyografi</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="İşletmeniz veya deneyiminiz hakkında kısa bir tanıtım..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/60 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0062FF] focus:border-[#0062FF]"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#0062FF] hover:bg-[#0051d4] text-white text-xs font-semibold shadow-xs transition-all flex items-center gap-2"
                >
                  <Save className="w-4 h-4" /> Profil Değişikliklerini Kaydet
                </button>
              </div>
            </form>
          )}

          {/* TAB: CLINIC */}
          {activeTab === "clinic" && (
            <form onSubmit={handleSaveClinic} className="space-y-6">
              <div className="pb-4 border-b border-slate-100">
                <h3 className="text-base font-bold text-[#0F2A4A]">Rezervasyon Sayfası & İşletme Ayarları</h3>
                <p className="text-xs text-slate-500 mt-0.5">Müşterilerinizin göreceği işletme linki, adı ve kuralları.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">İşletme / Klinik Adı</label>
                <input
                  type="text"
                  value={clinicName}
                  onChange={(e) => setClinicName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/60 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0062FF] focus:border-[#0062FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Özel Linkiniz (Subdomain / Slug)</label>
                <div className="flex items-center">
                  <span className="px-3.5 py-2.5 bg-slate-100 border border-r-0 border-slate-200 rounded-l-xl text-xs text-slate-500 font-mono">
                    randevuformu.com/
                  </span>
                  <input
                    type="text"
                    value={clinicSlug}
                    onChange={(e) => setClinicSlug(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 rounded-r-xl bg-slate-50/60 border border-slate-200 text-slate-900 text-xs font-semibold focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0062FF] focus:border-[#0062FF]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Fiziki Adres</label>
                <input
                  type="text"
                  value={clinicAddress}
                  onChange={(e) => setClinicAddress(e.target.value)}
                  placeholder="Cadde, Mahalle, İlçe, İl"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/60 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0062FF] focus:border-[#0062FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  İptal & Erteleme Politikası (En Az Kaç Saat Önceden İptal Edilebilir?)
                </label>
                <select
                  value={cancelPolicyHours}
                  onChange={(e) => setCancelPolicyHours(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/60 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0062FF] focus:border-[#0062FF]"
                >
                  <option value="12">12 Saat Önceden</option>
                  <option value="24">24 Saat Önceden (Önerilen)</option>
                  <option value="48">48 Saat Önceden</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#0062FF] hover:bg-[#0051d4] text-white text-xs font-semibold shadow-xs transition-all flex items-center gap-2"
                >
                  <Save className="w-4 h-4" /> Klinik Ayarlarını Kaydet
                </button>
              </div>
            </form>
          )}

          {/* TAB: NOTIFICATIONS */}
          {activeTab === "notifications" && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-slate-100">
                <h3 className="text-base font-bold text-[#0F2A4A]">Otomatik İletişim Kanalları</h3>
                <p className="text-xs text-slate-500 mt-0.5">Randevu onay, hatırlatma ve iptal bildirim ayarları.</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-xs text-[#0F2A4A]">WhatsApp Otomatik Bildirimleri</div>
                      <div className="text-[11px] text-slate-500">Randevu oluşturulduğunda ve 2 saat önce danışana WhatsApp mesajı atar.</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const next = !whatsappEnabled;
                      setWhatsappEnabled(next);
                      handleSaveNotifications(smsEnabled, next, emailEnabled, autoConfirm);
                    }}
                    className={`w-11 h-6 rounded-full transition-colors relative ${
                      whatsappEnabled ? "bg-emerald-600" : "bg-slate-200"
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                        whatsappEnabled ? "left-6" : "left-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-100 text-[#0062FF]">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-xs text-[#0F2A4A]">SMS Teyit Mesajları (Netgsm)</div>
                      <div className="text-[11px] text-slate-500">Randevu onay kodu ve son dakika güncellemelerinde SMS gönderir.</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const next = !smsEnabled;
                      setSmsEnabled(next);
                      handleSaveNotifications(next, whatsappEnabled, emailEnabled, autoConfirm);
                    }}
                    className={`w-11 h-6 rounded-full transition-colors relative ${
                      smsEnabled ? "bg-[#0062FF]" : "bg-slate-200"
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                        smsEnabled ? "left-6" : "left-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-xs text-[#0F2A4A]">E-Posta & Takvim Davetiyesi (.ics)</div>
                      <div className="text-[11px] text-slate-500">Google Calendar ve Apple iCal uyumlu takvim daveti ekler.</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const next = !emailEnabled;
                      setEmailEnabled(next);
                      handleSaveNotifications(smsEnabled, whatsappEnabled, next, autoConfirm);
                    }}
                    className={`w-11 h-6 rounded-full transition-colors relative ${
                      emailEnabled ? "bg-[#0062FF]" : "bg-slate-200"
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                        emailEnabled ? "left-6" : "left-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: INTEGRATIONS */}
          {activeTab === "integrations" && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-slate-100">
                <h3 className="text-base font-bold text-[#0F2A4A]">Takvim & Dış Entegrasyonlar</h3>
                <p className="text-xs text-slate-500 mt-0.5">Google Calendar ve Microsoft Outlook çift yönlü eşitleme.</p>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-[#0062FF] text-sm shadow-2xs">
                      G
                    </div>
                    <div>
                      <div className="font-semibold text-xs text-[#0F2A4A]">Google Calendar (2 Yönlü Eşitleme)</div>
                      <div className="text-[11px] text-slate-500">
                        {googleConnected ? "✓ Takvim bağlı ve senkronize" : "Google hesabınızdaki randevuları çift yönlü eşitler"}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleIntegration("google", !googleConnected)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      googleConnected
                        ? "bg-slate-200 text-slate-700 hover:bg-slate-300"
                        : "bg-[#0062FF] text-white hover:bg-[#0051d4] shadow-xs"
                    }`}
                  >
                    {googleConnected ? "Bağlantıyı Kes" : "Bağlan"}
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-sky-600 text-sm shadow-2xs">
                      O
                    </div>
                    <div>
                      <div className="font-semibold text-xs text-[#0F2A4A]">Microsoft Outlook Calendar</div>
                      <div className="text-[11px] text-slate-500">
                        {outlookConnected ? "✓ Outlook bağlı" : "Kurumsal e-posta takviminizi senkronize edin"}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleIntegration("outlook", !outlookConnected)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      outlookConnected
                        ? "bg-slate-200 text-slate-700 hover:bg-slate-300"
                        : "bg-[#0062FF] text-white hover:bg-[#0051d4] shadow-xs"
                    }`}
                  >
                    {outlookConnected ? "Bağlantıyı Kes" : "Bağlan"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: BILLING */}
          {activeTab === "billing" && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50/80 to-slate-50 border border-blue-200/60 flex items-center justify-between">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#0062FF] text-white uppercase tracking-wider">
                    Mevcut Planınız
                  </span>
                  <h3 className="text-lg font-bold text-[#0F2A4A] mt-2">Pro Business Paketi</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Sınırsız randevu, SMS/WhatsApp entegrasyonu ve özel subdomain aktif.</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-[#0F2A4A]">₺499<span className="text-xs text-slate-400 font-normal">/ay</span></div>
                  <div className="text-[11px] text-emerald-600 font-medium">Aktif Üyelik</div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white border border-slate-200 text-[#0062FF]">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[#0F2A4A]">Kayıtlı Ödeme Yöntemi</div>
                    <div className="text-[11px] text-slate-500">Mastercard **** 4242 (3D Secure Korumalı)</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => showToast("Ödeme yöntemi güncelleme formu açıldı.")}
                  className="px-3.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs"
                >
                  Kartı Değiştir
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
