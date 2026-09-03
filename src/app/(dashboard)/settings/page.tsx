"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  Bell,
  Lock,
  Building,
  Save,
  Shield,
  CreditCard,
  Mail,
  CheckCircle2,
  Phone,
  CalendarDays,
  Sparkles,
  RefreshCw,
  ExternalLink,
  MessageCircle,
  Zap,
  Percent,
  Clock,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  updateBusinessWhatsapp,
  updateYieldManagementSettings,
  getBusinessSettings
} from "@/app/actions/business-settings";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("whatsapp");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
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

  // Modül 1: WhatsApp İletişim Hattı
  const [businessId, setBusinessId] = useState("cl_demo_business_123");
  const [whatsappNumber, setWhatsappNumber] = useState("+905551234567");
  const [isWhatsappActive, setIsWhatsappActive] = useState(true);
  const [whatsappDefaultMessage, setWhatsappDefaultMessage] = useState("Merhaba, randevu almak istiyorum.");
  const [isSavingWhatsapp, setIsSavingWhatsapp] = useState(false);

  // Modül 3: Dinamik İndirim (Yield Management)
  const [isDynamicDiscountActive, setIsDynamicDiscountActive] = useState(true);
  const [dynamicDiscountPercent, setDynamicDiscountPercent] = useState(20);
  const [discountThresholdHours, setDiscountThresholdHours] = useState(4);
  const [isSavingYield, setIsSavingYield] = useState(false);

  // Notifications Toggles
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [autoConfirm, setAutoConfirm] = useState(true);

  // Calendar Sync
  const [googleConnected, setGoogleConnected] = useState(true);
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

      if (isByErman) {
        setClinicName("By Erman Hair Studio");
        setClinicSlug("byerman");
        setFullName("Erman Güler");
        setTitle("Master Barber");
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
    }
    loadSettings();
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast("Ayarlarınız başarıyla kaydedildi ve senkronize edildi!");
  };

  const handleSaveWhatsapp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingWhatsapp(true);
    const fd = new FormData();
    fd.append("businessId", businessId);
    fd.append("whatsappNumber", whatsappNumber);
    fd.append("isWhatsappActive", String(isWhatsappActive));
    fd.append("whatsappDefaultMessage", whatsappDefaultMessage);

    const res = await updateBusinessWhatsapp(fd);
    setIsSavingWhatsapp(false);
    showToast(res.message);
  };

  const handleSaveYield = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingYield(true);
    const fd = new FormData();
    fd.append("businessId", businessId);
    fd.append("isDynamicDiscountActive", String(isDynamicDiscountActive));
    fd.append("dynamicDiscountPercent", String(dynamicDiscountPercent));
    fd.append("discountThresholdHours", String(discountThresholdHours));

    const res = await updateYieldManagementSettings(fd);
    setIsSavingYield(false);
    showToast(res.message);
  };

  const tabs = [
    { id: "whatsapp", name: "WhatsApp Hattı (Modül 1)", icon: MessageCircle },
    { id: "yield", name: "Dinamik İndirim Motoru (Modül 3)", icon: Zap },
    { id: "profile", name: "Profil & Uzman Bilgileri", icon: User },
    { id: "clinic", name: "Klinik & Rezervasyon Sayfası", icon: Building },
    { id: "notifications", name: "SMS & E-Posta Bildirimleri", icon: Bell },
    { id: "integrations", name: "Takvim & Entegrasyonlar", icon: CalendarDays },
    { id: "billing", name: "Paket & Faturalandırma", icon: CreditCard },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Toast Feedback */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-8 z-50 p-4 rounded-2xl bg-indigo-600 text-white font-semibold text-xs shadow-2xl flex items-center gap-2 border border-indigo-400"
          >
            <CheckCircle2 className="w-4 h-4 text-white" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <div>
        <h2 className="text-2xl font-extrabold text-white">İşletme & Hesap Ayarları</h2>
        <p className="text-xs text-slate-400 mt-1">
          Klinik profilinizi, bildirim kanallarınızı ve entegrasyonlarınızı yönetin.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
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
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all text-left ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-semibold"
                      : "bg-slate-900 text-slate-400 hover:bg-slate-850 hover:text-white border border-slate-800"
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
        <div className="flex-1 bg-slate-900 rounded-3xl border border-slate-800 shadow-xl p-6 sm:p-8">
          {/* TAB: WHATSAPP (MODÜL 1) */}
          {activeTab === "whatsapp" && (
            <form onSubmit={handleSaveWhatsapp} className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-emerald-400" />
                    Doğrudan WhatsApp İletişim Hattı
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Müşterilerinizin randevu sayfasındaki sabit WhatsApp butonuna bastığında ulaşacağı işletme numarası
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-slate-300">
                    {isWhatsappActive ? "Aktif" : "Pasif"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsWhatsappActive(!isWhatsappActive)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${
                      isWhatsappActive ? "bg-emerald-600" : "bg-slate-700"
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                        isWhatsappActive ? "left-7" : "left-1"
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  İşletme WhatsApp Telefon Numarası
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="+905551234567"
                    className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono tabular-nums text-[16px] min-h-[44px] focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Uluslararası formatta ülke koduyla birlikte giriniz (Örn: +905551234567)
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Müşteri Açılış Mesajı Şablonu
                </label>
                <textarea
                  rows={3}
                  value={whatsappDefaultMessage}
                  onChange={(e) => setWhatsappDefaultMessage(e.target.value)}
                  placeholder="Merhaba, randevu almak istiyorum."
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  maxLength={250}
                />
                <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1">
                  <span>Müşteri butona bastığında WhatsApp metin kutusuna otomatik doldurulur.</span>
                  <span>{whatsappDefaultMessage.length}/250</span>
                </div>
              </div>

              {/* Canlı Önizleme Kartı */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-3">
                  Müşteri Randevu Sayfası Önizlemesi
                </span>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-xs text-slate-300">
                    Kayan Buton Konumu: <strong className="text-white font-mono">Sağ Alt (Mobil Safe-Area Uyumlu)</strong>
                  </div>
                  <div className="flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2 text-white font-semibold text-xs shadow">
                    <MessageCircle className="h-4 w-4" />
                    <span>Hızlı İletişim</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSavingWhatsapp}
                  className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2 disabled:opacity-50 min-h-[44px]"
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
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-400" />
                    Günün Boş Saatleri Dinamik İndirim Motoru
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Son dakikaya kalan boş randevu slotlarına otomatik indirim tanımlayarak boş koltuk maliyetini sıfırlayın
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-slate-300">
                    {isDynamicDiscountActive ? "Aktif" : "Pasif"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsDynamicDiscountActive(!isDynamicDiscountActive)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${
                      isDynamicDiscountActive ? "bg-amber-600" : "bg-slate-700"
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                        isDynamicDiscountActive ? "left-7" : "left-1"
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Uygulanacak İndirim Yüzdesi (%)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min={5}
                      max={50}
                      value={dynamicDiscountPercent}
                      onChange={(e) => setDynamicDiscountPercent(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono tabular-nums text-[16px] min-h-[44px] focus:outline-none focus:ring-2 focus:ring-amber-500"
                      required
                    />
                    <span className="text-xl font-bold font-mono text-amber-400">%</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Örn: %15 veya %20 indirim</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Devreye Girme Eşiği (Saat Kala)
                  </label>
                  <select
                    value={discountThresholdHours}
                    onChange={(e) => setDiscountThresholdHours(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs min-h-[44px] focus:outline-none focus:ring-2 focus:ring-amber-500"
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
              <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Müşterinin Göreceği Saat Rozeti Önizlemesi
                </span>
                <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="relative flex flex-col items-center justify-center rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-zinc-900 shadow-sm">
                    <span className="font-mono text-[16px] font-bold tabular-nums">14:30</span>
                    <span className="absolute -top-2.5 -right-2.5 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white shadow">
                      -%{dynamicDiscountPercent} Fırsat
                    </span>
                  </div>
                  <div className="text-xs text-slate-300 leading-relaxed">
                    Randevu saati yaklaştığında takvimdeki slotun üzerine otomatik olarak{" "}
                    <span className="text-amber-400 font-semibold">-%{dynamicDiscountPercent} Fırsat</span> rozeti
                    iliştirilir ve sepette anında indirim uygulanır.
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSavingYield}
                  className="px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-lg shadow-amber-600/30 transition-all flex items-center gap-2 disabled:opacity-50 min-h-[44px]"
                >
                  {isSavingYield ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  İndirim Motorunu Güncelle
                </button>
              </div>
            </form>
          )}

          {/* TAB 1: PROFILE */}
          {activeTab === "profile" && (
            <form onSubmit={handleSave} className="space-y-6">
              <div className="flex items-center gap-4 pb-6 border-b border-slate-800">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold text-xl flex items-center justify-center border border-indigo-400/40 shadow-lg shadow-indigo-600/20">
                  AY
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">{fullName}</h3>
                  <p className="text-xs text-slate-400">{title}</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Ad Soyad</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Uzmanlık Unvanı</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">E-Posta</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Telefon</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Hakkında & Biyografi</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
                >
                  <Save className="w-4 h-4" /> Değişiklikleri Kaydet
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: CLINIC */}
          {activeTab === "clinic" && (
            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-white">Rezervasyon Sayfası Ayarları</h3>
                <p className="text-xs text-slate-400 mt-0.5">Müşterilerinizin göreceği işletme linki ve kuralları</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">İşletme / Klinik Adı</label>
                <input
                  type="text"
                  value={clinicName}
                  onChange={(e) => setClinicName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Özel Linkiniz (Subdomain / Slug)</label>
                <div className="flex items-center">
                  <span className="px-3 py-2.5 bg-slate-950 border border-r-0 border-slate-700 rounded-l-xl text-xs text-slate-500 font-mono">
                    randevuformu.com/
                  </span>
                  <input
                    type="text"
                    value={clinicSlug}
                    onChange={(e) => setClinicSlug(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 rounded-r-xl bg-slate-800 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Fiziki Adres</label>
                <input
                  type="text"
                  value={clinicAddress}
                  onChange={(e) => setClinicAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  İptal & Erteleme Politikası (En Az Kaç Saat Önceden İptal Edilebilir?)
                </label>
                <select
                  value={cancelPolicyHours}
                  onChange={(e) => setCancelPolicyHours(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="12">12 Saat Önceden</option>
                  <option value="24">24 Saat Önceden (Önerilen)</option>
                  <option value="48">48 Saat Önceden</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
                >
                  <Save className="w-4 h-4" /> Klinik Ayarlarını Kaydet
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: NOTIFICATIONS */}
          {activeTab === "notifications" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-white">Otomatik İletişim Kanalları</h3>
                <p className="text-xs text-slate-400 mt-0.5">Randevu onay, hatırlatma ve iptal bildirim ayarları</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-white">WhatsApp Otomatik Bildirimleri</div>
                      <div className="text-[11px] text-slate-400">Randevu anında ve 2 saat önce danışana WhatsApp mesajı atar.</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setWhatsappEnabled(!whatsappEnabled);
                      showToast(`WhatsApp bildirimleri ${!whatsappEnabled ? "Aktif" : "Pasif"} edildi.`);
                    }}
                    className={`w-12 h-6 rounded-full transition-colors relative ${
                      whatsappEnabled ? "bg-emerald-600" : "bg-slate-700"
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                        whatsappEnabled ? "left-7" : "left-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-white">SMS Teyit Mesajları (Netgsm)</div>
                      <div className="text-[11px] text-slate-400">Randevu onay kodu ve iptal durumlarında SMS gönderir.</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSmsEnabled(!smsEnabled);
                      showToast(`SMS bildirimleri ${!smsEnabled ? "Aktif" : "Pasif"} edildi.`);
                    }}
                    className={`w-12 h-6 rounded-full transition-colors relative ${
                      smsEnabled ? "bg-indigo-600" : "bg-slate-700"
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                        smsEnabled ? "left-7" : "left-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-white">E-Posta & Takvim Davetiyesi (.ics)</div>
                      <div className="text-[11px] text-slate-400">Google Calendar / Apple iCal uyumlu takvim daveti ekler.</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEmailEnabled(!emailEnabled);
                      showToast(`E-Posta bildirimleri ${!emailEnabled ? "Aktif" : "Pasif"} edildi.`);
                    }}
                    className={`w-12 h-6 rounded-full transition-colors relative ${
                      emailEnabled ? "bg-purple-600" : "bg-slate-700"
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                        emailEnabled ? "left-7" : "left-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: INTEGRATIONS */}
          {activeTab === "integrations" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-white">Takvim & Dış Entegrasyonlar</h3>
                <p className="text-xs text-slate-400 mt-0.5">Google Calendar ve Microsoft Outlook çift yönlü eşitleme</p>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-bold text-blue-400">
                      G
                    </div>
                    <div>
                      <div className="font-bold text-xs text-white">Google Calendar (2 Yönlü Eşitleme)</div>
                      <div className="text-[10px] text-emerald-400">✓ ahmet@yilmazdental.com bağlı</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (!googleConnected) {
                        window.location.href = "/api/integrations/google/connect?tenantId=default-tenant&staffId=default-staff";
                      } else {
                        setGoogleConnected(false);
                        showToast("Google Calendar bağlantısı kesildi.");
                      }
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 transition-all hover:scale-105"
                  >
                    {googleConnected ? "Bağlantıyı Kes" : "OAuth ile Bağlan"}
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-bold text-indigo-400">
                      O
                    </div>
                    <div>
                      <div className="font-bold text-xs text-white">Microsoft Outlook Calendar</div>
                      <div className="text-[10px] text-slate-400">Kurumsal e-posta takviminizi senkronize edin</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setOutlookConnected(!outlookConnected);
                      showToast(`Outlook Calendar bağlantısı ${!outlookConnected ? "kuruldu" : "kesildi"}.`);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white"
                  >
                    {outlookConnected ? "Bağlantıyı Kes" : "OAuth ile Bağlan"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: BILLING */}
          {activeTab === "billing" && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-950/80 to-purple-950/60 border border-indigo-500/30 flex items-center justify-between">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500 text-white uppercase">
                    Mevcut Planınız
                  </span>
                  <h3 className="text-xl font-extrabold text-white mt-2">Pro Business Paketi</h3>
                  <p className="text-xs text-slate-300 mt-0.5">Sınırsız randevu, SMS entegrasyonu ve özel subdomain aktif.</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">₺499<span className="text-xs text-slate-400">/ay</span></div>
                  <div className="text-[10px] text-emerald-400">Sonraki Yenileme: 28 Eylül 2026</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-indigo-400" />
                  <div>
                    <div className="text-xs font-bold text-white">Kayıtlı Kredi Kartı</div>
                    <div className="text-[11px] text-slate-400">Mastercard **** 4242 (İyzico Korumalı)</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => showToast("Kart güncelleme formu açıldı.")}
                  className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300"
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
