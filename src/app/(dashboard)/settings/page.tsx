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
  Calendar,
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
  Scissors,
  Plus,
  Trash2,
  Edit3,
  Tag,
  HelpCircle,
  X,
  MapPin,
  ExternalLink,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  updateBusinessWhatsapp,
  updateYieldManagementSettings,
  getBusinessSettings,
} from "@/app/actions/business-settings";

export interface BusinessService {
  id: string;
  name: string;
  duration_minutes: number;
  price?: number;
  price_text?: string;
  description?: string;
}

const DEFAULT_SERVICES: BusinessService[] = [
  {
    id: "srv-sac",
    name: "Saç Kesimi & Yıkama & Fön",
    duration_minutes: 35,
    price: 350,
    price_text: "₺350",
    description: "Kişinin yüz tipine uygun saç kesimi, saç yıkama ve fön işlemi.",
  },
  {
    id: "srv-sakal",
    name: "Sakal Tıraşı & Sıcak Havlu",
    duration_minutes: 25,
    price: 200,
    price_text: "₺200",
    description: "Geleneksel ustura tıraşı, sakal şekillendirme ve buharlı sıcak havlu.",
  },
  {
    id: "srv-komple",
    name: "Saç + Sakal (Komple Tıraş & Bakım)",
    duration_minutes: 55,
    price: 500,
    price_text: "₺500",
    description: "Komple saç kesimi, sakal tıraşı, saç yıkama, fön ve şekillendirme.",
  },
  {
    id: "srv-bakim",
    name: "VIP Saç Bakımı & Cilt Maskesi",
    duration_minutes: 35,
    description: "Özel tonik bakımı, baş masajı ve canlandırıcı maske. (Fiyat boş bırakıldı - formda gizlenir)",
  },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("services");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State: Services & Appointment Customization
  const [services, setServices] = useState<BusinessService[]>(DEFAULT_SERVICES);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [isAddingService, setIsAddingService] = useState(false);
  const [serviceNameInput, setServiceNameInput] = useState("");
  const [serviceDurationInput, setServiceDurationInput] = useState("30");
  const [servicePriceInput, setServicePriceInput] = useState("");
  const [serviceDescInput, setServiceDescInput] = useState("");

  // Form State: Profile
  const [fullName, setFullName] = useState("İşletme Yetkilisi");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [title, setTitle] = useState("Yetkili");
  const [bio, setBio] = useState("");

  // Clinic & Location Settings
  const [clinicName, setClinicName] = useState("İşletmem");
  const [clinicSlug, setClinicSlug] = useState("isletme");
  const [clinicAddress, setClinicAddress] = useState("");
  const [googleMapsUrl, setGoogleMapsUrl] = useState("https://share.google/gOW1xHwztRfGIc3F1");
  const [workingHoursSummary, setWorkingHoursSummary] = useState("Pzt - Cmt: 09:00 - 21:00 | Paz: 10:00 - 19:00");
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

  // Working Hours & Availability State (Calendly Style)
  const [workingDays, setWorkingDays] = useState({
    mon: true,
    tue: true,
    wed: true,
    thu: true,
    fri: true,
    sat: true,
    sun: false,
  });
  const [workStartTime, setWorkStartTime] = useState("09:00");
  const [workEndTime, setWorkEndTime] = useState("19:00");
  const [breakStartTime, setBreakStartTime] = useState("12:30");
  const [breakEndTime, setBreakEndTime] = useState("13:30");
  const [slotInterval, setSlotInterval] = useState("30");

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

      // 0. Check tab parameter in URL
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get("tab");
      if (tabParam) setActiveTab(tabParam);

      // 0.1 Services Persistence
      const savedServices = localStorage.getItem("rf_business_services");
      if (savedServices) {
        try {
          const parsed = JSON.parse(savedServices);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setServices(parsed);
          }
        } catch {}
      }

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

      // 2. Clinic & Location Persistence
      const savedClinic = localStorage.getItem("rf_settings_clinic");
      if (savedClinic) {
        try {
          const c = JSON.parse(savedClinic);
          if (c.clinicName) setClinicName(c.clinicName);
          if (c.clinicSlug) setClinicSlug(c.clinicSlug);
          if (c.clinicAddress) setClinicAddress(c.clinicAddress);
          if (c.googleMapsUrl) setGoogleMapsUrl(c.googleMapsUrl);
          if (c.workingHoursSummary) setWorkingHoursSummary(c.workingHoursSummary);
          if (c.cancelPolicyHours) setCancelPolicyHours(c.cancelPolicyHours);
        } catch {}
      } else if (isByErman) {
        setClinicName("By Erman Hair Studio");
        setClinicSlug("byerman");
        setClinicAddress("Caferağa Mah. Moda Cad. No:12/A Kadıköy, İstanbul");
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

      // Check specific location storage
      const savedLoc = localStorage.getItem("rf_business_location");
      if (savedLoc) {
        try {
          const l = JSON.parse(savedLoc);
          if (l.googleMapsUrl) setGoogleMapsUrl(l.googleMapsUrl);
          if (l.address) setClinicAddress(l.address);
          if (l.workingHours) setWorkingHoursSummary(l.workingHours);
        } catch {}
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

      // 6.1 Working Hours & Availability Persistence (Calendly Style)
      const savedHours = localStorage.getItem("rf_business_hours");
      if (savedHours) {
        try {
          const h = JSON.parse(savedHours);
          if (h.workingDays) setWorkingDays(h.workingDays);
          if (h.workStartTime) setWorkStartTime(h.workStartTime);
          if (h.workEndTime) setWorkEndTime(h.workEndTime);
          if (h.breakStartTime) setBreakStartTime(h.breakStartTime);
          if (h.breakEndTime) setBreakEndTime(h.breakEndTime);
          if (h.slotInterval) setSlotInterval(h.slotInterval);
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

  // Save Availability Handler
  const handleSaveAvailability = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      workingDays,
      workStartTime,
      workEndTime,
      breakStartTime,
      breakEndTime,
      slotInterval,
    };
    localStorage.setItem("rf_business_hours", JSON.stringify(data));
    showToast("Çalışma saatleri ve haftalık müsaitlik başarıyla kaydedildi.");
  };

  // Save Profile Handler
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { fullName, email, phone, title, bio };
    localStorage.setItem("rf_settings_profile", JSON.stringify(data));
    localStorage.setItem("rf_user_name", fullName);
    showToast("Profil ve uzman bilgileriniz başarıyla kaydedildi.");
  };

  // Save Clinic & Location Settings Handler
  const handleSaveClinic = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSlug = clinicSlug.toLowerCase().replace(/[^a-z0-9-_]/g, "");
    const data = {
      clinicName: clinicName.trim(),
      clinicSlug: cleanSlug,
      clinicAddress: clinicAddress.trim(),
      googleMapsUrl: googleMapsUrl.trim(),
      workingHoursSummary: workingHoursSummary.trim(),
      cancelPolicyHours,
    };
    localStorage.setItem("rf_settings_clinic", JSON.stringify(data));
    localStorage.setItem(
      "rf_business_location",
      JSON.stringify({
        googleMapsUrl: googleMapsUrl.trim(),
        address: clinicAddress.trim(),
        workingHours: workingHoursSummary.trim(),
      })
    );
    localStorage.setItem("rf_tenant_name", clinicName.trim());
    localStorage.setItem("rf_tenant_slug", cleanSlug);
    window.dispatchEvent(new Event("storage"));
    showToast("İşletme adresi, Google Haritalar linki ve çalışma saatleri kaydedildi.");
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

  // Service CRUD Handlers
  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceNameInput.trim()) {
      showToast("Lütfen bir hizmet adı giriniz.");
      return;
    }

    const cleanPrice = servicePriceInput.trim() !== "" ? Number(servicePriceInput.replace(/[^0-9]/g, "")) : undefined;
    const durationNum = Number(serviceDurationInput) || 30;

    let updatedList: BusinessService[];
    if (editingServiceId) {
      updatedList = services.map((s) =>
        s.id === editingServiceId
          ? {
              ...s,
              name: serviceNameInput.trim(),
              duration_minutes: durationNum,
              price: cleanPrice && cleanPrice > 0 ? cleanPrice : undefined,
              price_text: cleanPrice && cleanPrice > 0 ? `₺${cleanPrice.toLocaleString("tr-TR")}` : undefined,
              description: serviceDescInput.trim() || undefined,
            }
          : s
      );
      showToast("Hizmet başarıyla güncellendi.");
      setEditingServiceId(null);
    } else {
      const newService: BusinessService = {
        id: `srv-${Date.now()}`,
        name: serviceNameInput.trim(),
        duration_minutes: durationNum,
        price: cleanPrice && cleanPrice > 0 ? cleanPrice : undefined,
        price_text: cleanPrice && cleanPrice > 0 ? `₺${cleanPrice.toLocaleString("tr-TR")}` : undefined,
        description: serviceDescInput.trim() || undefined,
      };
      updatedList = [...services, newService];
      showToast("Yeni hizmet başarıyla eklendi.");
      setIsAddingService(false);
    }

    setServices(updatedList);
    localStorage.setItem("rf_business_services", JSON.stringify(updatedList));

    // Reset inputs
    setServiceNameInput("");
    setServiceDurationInput("30");
    setServicePriceInput("");
    setServiceDescInput("");
  };

  const handleStartEdit = (service: BusinessService) => {
    setEditingServiceId(service.id);
    setIsAddingService(false);
    setServiceNameInput(service.name);
    setServiceDurationInput(String(service.duration_minutes));
    setServicePriceInput(service.price ? String(service.price) : "");
    setServiceDescInput(service.description || "");
  };

  const handleDeleteService = (id: string) => {
    if (services.length <= 1) {
      showToast("En az 1 aktif randevu hizmeti bulunmalıdır.");
      return;
    }
    const updatedList = services.filter((s) => s.id !== id);
    setServices(updatedList);
    localStorage.setItem("rf_business_services", JSON.stringify(updatedList));
    showToast("Hizmet silindi.");
    if (editingServiceId === id) setEditingServiceId(null);
  };

  const tabs = [
    { id: "services", name: "Hizmetler & Randevu Tipleri", icon: Calendar },
    { id: "availability", name: "Çalışma Saatleri & Müsaitlik", icon: Clock },
    { id: "whatsapp", name: "WhatsApp Otomasyonu", icon: MessageCircle },
    { id: "yield", name: "Akıllı Doluluk & İndirim Motoru", icon: Zap },
    { id: "profile", name: "Profil & Uzman Bilgileri", icon: User },
    { id: "clinic", name: "İşletme & Rezervasyon Kuralları", icon: Building },
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
          {/* TAB: SERVICES & APPOINTMENT TYPES (CUSTOMIZATION & OPTIONAL PRICING) */}
          {activeTab === "services" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-[#0F2A4A] flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-[#0062FF]" />
                    Hizmetler & Randevu Tipleri
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    İşletmenizin sunduğu seans, muayene, bakım ve randevu kalemlerini özelleştirin.
                  </p>
                </div>
                {!isAddingService && !editingServiceId && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingService(true);
                      setEditingServiceId(null);
                      setServiceNameInput("");
                      setServiceDurationInput("30");
                      setServicePriceInput("");
                      setServiceDescInput("");
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0062FF] hover:bg-[#0052d9] text-white text-xs font-semibold shadow-xs transition-all active:scale-95 shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Yeni Hizmet Ekle</span>
                  </button>
                )}
              </div>

              {/* Info Notice: Optional Pricing */}
              <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200/80 flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-[#0062FF] mt-0.5 shrink-0" />
                <div className="text-xs text-slate-700 leading-relaxed">
                  <strong className="text-[#0F2A4A]">Opsiyonel Fiyatlandırma Garantisi:</strong> Hizmetlerinize fiyat tanımlamak tamamen işletmenizin tercihine bağlıdır. Fiyat alanını boş bırakırsanız, randevu formunda fiyat rozeti ve alanı tamamen gizlenir; müşterilere asla yanıltıcı &quot;0 TL&quot; veya &quot;Ücretsiz&quot; ibaresi gösterilmez.
                </div>
              </div>

              {/* Add / Edit Form Modal/Card */}
              {(isAddingService || editingServiceId) && (
                <form
                  onSubmit={handleSaveService}
                  className="p-5 rounded-2xl bg-slate-50/80 border-2 border-[#0062FF]/30 space-y-4"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                    <h4 className="text-xs font-bold text-[#0F2A4A] uppercase tracking-wider flex items-center gap-2">
                      <Tag className="w-4 h-4 text-[#0062FF]" />
                      {editingServiceId ? "Hizmeti Düzenle" : "Yeni Hizmet Oluştur"}
                    </h4>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingService(false);
                        setEditingServiceId(null);
                      }}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Hizmet Adı *
                      </label>
                      <input
                        type="text"
                        required
                        value={serviceNameInput}
                        onChange={(e) => setServiceNameInput(e.target.value)}
                        placeholder="Örn: Saç Kesimi & Yıkama"
                        className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-[#0062FF] focus:border-[#0062FF]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        İşlem Süresi (Dakika) *
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          required
                          min={5}
                          max={360}
                          step={5}
                          value={serviceDurationInput}
                          onChange={(e) => setServiceDurationInput(e.target.value)}
                          placeholder="30"
                          className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-[#0062FF] focus:border-[#0062FF]"
                        />
                        <Clock className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-700">
                        Fiyat (₺) — <span className="text-emerald-600 font-bold">Opsiyonel</span>
                      </label>
                      <span className="text-[11px] text-slate-400">Boş bırakılırsa fiyat gizlenir</span>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        value={servicePriceInput}
                        onChange={(e) => setServicePriceInput(e.target.value)}
                        placeholder="Örn: 350 (Boş bırakabilirsiniz)"
                        className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-[#0062FF] focus:border-[#0062FF]"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                        ₺
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Hizmet Açıklaması (Opsiyonel)
                    </label>
                    <textarea
                      rows={2}
                      value={serviceDescInput}
                      onChange={(e) => setServiceDescInput(e.target.value)}
                      placeholder="Müşteriye randevu seçiminde gösterilecek kısa açıklama..."
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-[#0062FF] focus:border-[#0062FF]"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingService(false);
                        setEditingServiceId(null);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold transition-colors"
                    >
                      İptal
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-[#0062FF] hover:bg-[#0052d9] text-white text-xs font-semibold shadow-xs transition-colors"
                    >
                      {editingServiceId ? "Değişiklikleri Kaydet" : "Hizmeti Ekle"}
                    </button>
                  </div>
                </form>
              )}

              {/* Existing Services List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">
                  <span>Mevcut Hizmetler ({services.length})</span>
                  <span>İşlemler</span>
                </div>

                {services.map((s) => (
                  <div
                    key={s.id}
                    className="p-4 rounded-xl border border-slate-200/90 bg-white hover:border-slate-300 shadow-2xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h4 className="text-sm font-bold text-[#0F2A4A]">{s.name}</h4>
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {s.duration_minutes} Dakika
                        </span>
                        {s.price && s.price > 0 ? (
                          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                            ₺{s.price.toLocaleString("tr-TR")}
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-50 text-slate-400 border border-slate-200/60 italic">
                            Fiyat Gizli (Formda Görünmez)
                          </span>
                        )}
                      </div>
                      {s.description && (
                        <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
                          {s.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(s)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                        <span>Düzenle</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteService(s.id)}
                        className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                        title="Hizmeti Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: WORKING HOURS & AVAILABILITY (CALENDLY STYLE) */}
          {activeTab === "availability" && (
            <form onSubmit={handleSaveAvailability} className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-[#0F2A4A] flex items-center gap-2">
                    <Clock className="w-5 h-5 text-[#0062FF]" />
                    Çalışma Saatleri &amp; Müsaitlik (Weekly Hours)
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Danışanların randevu formunda göreceği açık günler, mesai saatleri ve randevu periyotları.
                  </p>
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0062FF] hover:bg-[#0051d4] active:scale-95 text-white font-semibold text-xs shadow-xs transition-all shrink-0"
                >
                  <Save className="w-4 h-4" />
                  <span>Müsaitliği Kaydet</span>
                </button>
              </div>

              {/* Working Days Selector */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-[#0F2A4A]">
                  Haftalık Hizmet Günleri (Tıklayarak Açın / Kapatın)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-7 gap-2">
                  {[
                    { key: "mon", label: "Pazartesi" },
                    { key: "tue", label: "Salı" },
                    { key: "wed", label: "Çarşamba" },
                    { key: "thu", label: "Perşembe" },
                    { key: "fri", label: "Cuma" },
                    { key: "sat", label: "Cumartesi" },
                    { key: "sun", label: "Pazar" },
                  ].map((day) => {
                    const isActive = workingDays[day.key as keyof typeof workingDays];
                    return (
                      <button
                        key={day.key}
                        type="button"
                        onClick={() =>
                          setWorkingDays((prev) => ({
                            ...prev,
                            [day.key]: !prev[day.key as keyof typeof workingDays],
                          }))
                        }
                        className={`p-3 rounded-xl border text-center transition-all ${
                          isActive
                            ? "bg-[#0062FF] text-white border-[#0062FF] font-bold shadow-xs"
                            : "bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        <span className="text-xs block">{day.label}</span>
                        <span className="text-[10px] opacity-90 mt-0.5 block">
                          {isActive ? "✓ Açık" : "Kapalı"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Hours Grid */}
              <div className="grid sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <h4 className="font-semibold text-xs text-[#0F2A4A] flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#0062FF]" />
                    Günlük Mesai Saatleri
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-500 mb-1">Başlangıç</label>
                      <input
                        type="time"
                        value={workStartTime}
                        onChange={(e) => setWorkStartTime(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-800 outline-none focus:border-[#0062FF]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-500 mb-1">Bitiş</label>
                      <input
                        type="time"
                        value={workEndTime}
                        onChange={(e) => setWorkEndTime(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-800 outline-none focus:border-[#0062FF]"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <h4 className="font-semibold text-xs text-[#0F2A4A] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#00BCD4]" />
                    Öğle Molası (Slot Bloke)
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-500 mb-1">Mola Başlangıç</label>
                      <input
                        type="time"
                        value={breakStartTime}
                        onChange={(e) => setBreakStartTime(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-800 outline-none focus:border-[#0062FF]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-500 mb-1">Mola Bitiş</label>
                      <input
                        type="time"
                        value={breakEndTime}
                        onChange={(e) => setBreakEndTime(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-800 outline-none focus:border-[#0062FF]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Slot Interval */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <label className="block text-xs font-semibold text-[#0F2A4A]">
                  Randevu Slot Aralığı (Dakika)
                </label>
                <div className="flex gap-2">
                  {["15", "30", "45", "60"].map((interval) => (
                    <button
                      key={interval}
                      type="button"
                      onClick={() => setSlotInterval(interval)}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold border transition ${
                        slotInterval === interval
                          ? "bg-[#0F2A4A] text-white border-[#0F2A4A]"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {interval} Dakika
                    </button>
                  ))}
                </div>
              </div>
            </form>
          )}

          {/* TAB: WHATSAPP */}
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
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#0062FF]" />
                    <span>Google Haritalar / Konum Linki (Maps URL)</span>
                  </label>
                  {googleMapsUrl && (
                    <a
                      href={googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-[#0062FF] hover:underline flex items-center gap-1"
                    >
                      <span>Haritada Test Et</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <input
                  type="url"
                  value={googleMapsUrl}
                  onChange={(e) => setGoogleMapsUrl(e.target.value)}
                  placeholder="https://share.google/gOW1xHwztRfGIc3F1 veya https://maps.google.com/..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/60 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0062FF] focus:border-[#0062FF]"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Google Haritalar uygulamasından &quot;Paylaş&quot; butonuna basarak kopyaladığınız bağlantıyı buraya yapıştırın. Randevu sayfanızdaki &quot;Yol Tarifi Al&quot; butonuna bağlanır ve bulutta saklanır.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Çalışma Saatleri &amp; Randevu Mesai Özeti</span>
                </label>
                <input
                  type="text"
                  value={workingHoursSummary}
                  onChange={(e) => setWorkingHoursSummary(e.target.value)}
                  placeholder="Pzt - Cmt: 09:00 - 21:00 | Paz: 10:00 - 19:00"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/60 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0062FF] focus:border-[#0062FF]"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Müşteri randevu sayfasında çalışma saatleri rozetinde görüntülenecek metin.
                </p>
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
