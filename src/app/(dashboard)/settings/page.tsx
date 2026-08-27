"use client";

import { useState } from "react";
import { User, Bell, Lock, Building, Save, Shield, CreditCard, Mail } from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");

  const tabs = [
    { id: "profile", name: "Profil Bilgileri", icon: User },
    { id: "clinic", name: "Klinik Ayarları", icon: Building },
    { id: "notifications", name: "Bildirimler", icon: Bell },
    { id: "security", name: "Güvenlik", icon: Shield },
    { id: "billing", name: "Faturalandırma", icon: CreditCard },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Ayarlar</h2>
        <p className="text-slate-500 text-sm mt-1">Hesap ve sistem tercihlerinizi yapılandırın.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 shrink-0">
          <nav className="flex md:flex-col gap-1 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all whitespace-nowrap md:whitespace-normal font-medium text-sm ${
                    isActive 
                      ? "bg-indigo-50 text-indigo-700 shadow-sm" 
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <tab.icon className={`w-5 h-5 ${isActive ? "text-indigo-600" : "text-slate-400"}`} />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          {activeTab === "profile" && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
                <div className="w-20 h-20 bg-indigo-100 text-indigo-700 font-bold text-2xl rounded-full flex items-center justify-center border-4 border-white shadow-sm shrink-0">
                  A
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Profil Fotoğrafı</h3>
                  <p className="text-sm text-slate-500 mb-3">JPG, GIF veya PNG. Maksimum 1MB boyutunda.</p>
                  <div className="flex gap-3">
                    <button className="px-4 py-2 text-sm font-medium bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
                      Değiştir
                    </button>
                    <button className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      Kaldır
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Ad</label>
                  <input type="text" defaultValue="Ahmet" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Soyad</label>
                  <input type="text" defaultValue="Yılmaz" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-400" />
                    E-posta Adresi
                  </label>
                  <input type="email" defaultValue="ahmet@klinik.com" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-medium text-slate-700">Unvan / Uzmanlık</label>
                  <input type="text" defaultValue="Ortodonti Uzmanı" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" />
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
                <button className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                  İptal
                </button>
                <button className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors font-medium shadow-sm">
                  <Save className="w-4 h-4" />
                  Değişiklikleri Kaydet
                </button>
              </div>
            </div>
          )}

          {activeTab !== "profile" && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <Lock className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Yakında Eklenecek</h3>
              <p className="text-slate-500 max-w-sm">
                Bu bölüm henüz aktif değil. Çok yakında yeni özelliklerle karşınızda olacağız.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
