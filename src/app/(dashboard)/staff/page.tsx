"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  UserPlus,
  Mail,
  Phone,
  Calendar,
  Trash2,
  Edit2,
  CheckCircle2,
  Clock,
  Sparkles,
  RefreshCw,
  CalendarCheck,
  Shield,
  Layers,
  ArrowRight,
} from "lucide-react";

interface StaffMember {
  id: string;
  display_name: string;
  email?: string;
  phone?: string;
  role: string;
  is_active: boolean;
  title?: string;
}

export default function StaffManagementPage() {
  const [staffList, setStaffList] = useState<StaffMember[]>([
    {
      id: "staff-1",
      display_name: "Dr. Ahmet Yılmaz",
      email: "ahmet@yilmazdental.com",
      phone: "0532 456 78 90",
      role: "OWNER",
      is_active: true,
      title: "Başhekim & Diş Cerrahı",
    },
    {
      id: "staff-2",
      display_name: "Dt. Zeynep Kaya",
      email: "zeynep@yilmazdental.com",
      phone: "0533 111 22 33",
      role: "STAFF",
      is_active: true,
      title: "Ortodonti Uzmanı",
    },
    {
      id: "staff-3",
      display_name: "Dt. Emre Can",
      email: "emre@yilmazdental.com",
      phone: "0535 999 88 77",
      role: "STAFF",
      is_active: true,
      title: "Endodonti Uzmanı",
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStaffName, setNewStaffName] = useState("");
  const [newStaffEmail, setNewStaffEmail] = useState("");
  const [newStaffPhone, setNewStaffPhone] = useState("");
  const [newStaffRole, setNewStaffRole] = useState("STAFF");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName) return;

    const newMember: StaffMember = {
      id: `staff-${Date.now()}`,
      display_name: newStaffName,
      email: newStaffEmail,
      phone: newStaffPhone,
      role: newStaffRole,
      is_active: true,
      title: newStaffRole === "OWNER" ? "Klinik Sahibi" : "Uzman Hekim",
    };

    setStaffList([...staffList, newMember]);
    setIsModalOpen(false);
    setNewStaffName("");
    setNewStaffEmail("");
    setNewStaffPhone("");
    showToast(`${newStaffName} ekibe başarıyla eklendi!`);
  };

  const toggleStatus = (id: string) => {
    setStaffList((prev) =>
      prev.map((s) => (s.id === id ? { ...s, is_active: !s.is_active } : s))
    );
    showToast("Personel durumu güncellendi.");
  };

  const handleDeleteStaff = (id: string) => {
    setStaffList((prev) => prev.filter((s) => s.id !== id));
    showToast("Personel ekipten çıkarıldı.");
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Toast */}
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <Users className="w-6 h-6 text-indigo-400" />
            Ekip & Çoklu Personel Yönetimi
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            İşletmenizdeki hekimleri, uzmanları ve asistanları yönetin; otomatik Round-Robin veya En Az Meşgul kurgusuyla randevuları paylaştırın.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
        >
          <UserPlus className="w-4 h-4" />
          Yeni Personel Ekle
        </button>
      </div>

      {/* Routing Strategy Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-950/60 via-slate-900 to-purple-950/50 border border-indigo-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-[11px] font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            Akıllı Randevu Dağıtım Motoru (Routing Engine)
          </div>
          <h3 className="text-base font-bold text-white">
            Müşteriler &quot;İlk Müsait Uzman&quot; seçtiğinde ne olsun?
          </h3>
          <p className="text-xs text-slate-400">
            Sistem gelen rezervasyonları Round-Robin (Sıralı) veya Least-Busy (Yük Dengeleme) ile personele otomatik atar.
          </p>
        </div>
        <select
          className="px-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-700 text-white text-xs font-bold focus:outline-none focus:border-indigo-500"
          defaultValue="ROUND_ROBIN"
        >
          <option value="ROUND_ROBIN">🔄 Sırayla Dağıt (Round-Robin)</option>
          <option value="LEAST_BUSY">⚖️ En Az Randevusu Olana Ata (Least-Busy)</option>
          <option value="AVAILABILITY_FIRST">⚡ İlk Boş Olana Öncelik Ver</option>
        </select>
      </div>

      {/* Staff Cards Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {staffList.map((staff) => (
          <div
            key={staff.id}
            className={`p-6 rounded-3xl border transition-all ${
              staff.is_active
                ? "bg-slate-900/80 border-slate-800 hover:border-slate-700"
                : "bg-slate-950 border-slate-900 opacity-60"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-white text-base shadow-lg shadow-indigo-600/30">
                  {staff.display_name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">{staff.display_name}</h4>
                  <p className="text-xs text-slate-400">{staff.title || "Uzman"}</p>
                </div>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                  staff.role === "OWNER"
                    ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                    : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                }`}
              >
                {staff.role}
              </span>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-800 space-y-2 text-xs text-slate-300">
              {staff.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span>{staff.email}</span>
                </div>
              )}
              {staff.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <span>{staff.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-emerald-400 font-medium">
                <CalendarCheck className="w-3.5 h-3.5" />
                <span>Google Takvim Bağlı</span>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => toggleStatus(staff.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                  staff.is_active
                    ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                    : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                }`}
              >
                {staff.is_active ? "● Aktif Randevu Alıyor" : "○ Pasif"}
              </button>

              <button
                onClick={() => handleDeleteStaff(staff.id)}
                className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                title="Personeli Sil"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Staff Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-400" />
                Yeni Ekip Üyesi Ekle
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddStaff} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Ad Soyad & Unvan *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Dr. Selin Erdem"
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  E-Posta Adresi
                </label>
                <input
                  type="email"
                  placeholder="selin@klinik.com"
                  value={newStaffEmail}
                  onChange={(e) => setNewStaffEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Telefon Numarası
                </label>
                <input
                  type="tel"
                  placeholder="05XX XXX XX XX"
                  value={newStaffPhone}
                  onChange={(e) => setNewStaffPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Rol</label>
                <select
                  value={newStaffRole}
                  onChange={(e) => setNewStaffRole(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
                >
                  <option value="STAFF">Uzman Hekim / Hizmet Veren</option>
                  <option value="ADMIN">Yönetici / Sekreter</option>
                  <option value="OWNER">Klinik Sahibi</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30"
                >
                  Kaydet & Ekle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
