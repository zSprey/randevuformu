"use client";

import React, { useState } from "react";
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
  ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [fullName, setFullName] = useState("Dr. Ahmet Yılmaz");
  const [email, setEmail] = useState("ahmet@yilmazdental.com");
  const [phone, setPhone] = useState("0532 456 78 90");
  const [title, setTitle] = useState("Diş Hekimi & Estetik Gülüş Uzmanı");
  const [bio, setBio] = useState("10+ yıllık tecrübe ile zirkonyum, lamine ve implant tedavilerinde uzman.");

  // Clinic Settings
  const [clinicName, setClinicName] = useState("Yılmaz Diş Polikliniği");
  const [clinicSlug, setClinicSlug] = useState("dr-ahmet");
  const [clinicAddress, setClinicAddress] = useState("Bağdat Caddesi No:142 Kadıköy / İstanbul");
  const [cancelPolicyHours, setCancelPolicyHours] = useState("24");

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
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast("Ayarlarınız başarıyla kaydedildi ve senkronize edildi!");
  };

  const tabs = [
    { id: "profile", name: "Profil & Uzman Bilgileri", icon: User },
    { id: "clinic", name: "Klinik & Rezervasyon Sayfası", icon: Building },
    { id: "notifications", name: "SMS & WhatsApp Bildirimleri", icon: Bell },
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
