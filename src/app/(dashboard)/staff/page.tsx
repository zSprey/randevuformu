"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  UserPlus,
  Mail,
  Phone,
  Trash2,
  CheckCircle2,
  Sparkles,
  CalendarCheck,
  AlertTriangle,
  Loader2,
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
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<StaffMember | null>(null);

  // Form State
  const [newStaffName, setNewStaffName] = useState("");
  const [newStaffEmail, setNewStaffEmail] = useState("");
  const [newStaffPhone, setNewStaffPhone] = useState("");
  const [newStaffRole, setNewStaffRole] = useState("STAFF");
  const [newStaffTitle, setNewStaffTitle] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const getTenantId = () => {
    if (typeof window === "undefined") return "default";
    return localStorage.getItem("rf_tenant") || "default";
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Personel Listesini Yükle (İşletmeye Özel)
  const fetchStaff = async () => {
    setLoading(true);
    const tenantId = getTenantId();
    const storageKey = `rf_staff_${tenantId}`;

    try {
      const res = await fetch(`/api/staff?tenantId=${encodeURIComponent(tenantId)}`);
      if (res.ok) {
        const json = await res.json();
        const apiStaff = json?.data?.staff || json?.staff || [];
        
        // Sahte çalışanları filtrele (Dr. Ahmet Yılmaz, Dt. Zeynep Kaya gibi mock veriler varsa temizle)
        const cleaned = apiStaff.filter(
          (s: StaffMember) =>
            !s.display_name?.includes("Ahmet Yılmaz") &&
            !s.display_name?.includes("Zeynep Kaya") &&
            !s.display_name?.includes("Emre Can")
        );

        setStaffList(cleaned);
        if (typeof window !== "undefined") {
          localStorage.setItem(storageKey, JSON.stringify(cleaned));
        }
        return;
      }
    } catch {
      // API fallback: localStorage'dan oku
    }

    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const cleaned = parsed.filter(
            (s: StaffMember) =>
              !s.display_name?.includes("Ahmet Yılmaz") &&
              !s.display_name?.includes("Zeynep Kaya") &&
              !s.display_name?.includes("Emre Can")
          );
          setStaffList(cleaned);
        } catch {
          setStaffList([]);
        }
      } else {
        setStaffList([]);
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  // Yeni Personel Ekle
  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName.trim()) return;

    setIsSaving(true);
    const tenantId = getTenantId();
    const storageKey = `rf_staff_${tenantId}`;

    const newMember: StaffMember = {
      id: `staff_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      display_name: newStaffName.trim(),
      email: newStaffEmail.trim() || undefined,
      phone: newStaffPhone.trim() || undefined,
      role: newStaffRole,
      is_active: true,
      title: newStaffTitle.trim() || (newStaffRole === "OWNER" ? "İşletme Sahibi" : "Uzman / Personel"),
    };

    const updated = [newMember, ...staffList];
    setStaffList(updated);

    if (typeof window !== "undefined") {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    }

    try {
      await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId,
          displayName: newMember.display_name,
          email: newMember.email,
          phone: newMember.phone,
          role: newMember.role,
        }),
      });
    } catch (err) {
      console.warn("Staff save API warning:", err);
    }

    setIsSaving(false);
    setIsModalOpen(false);
    setNewStaffName("");
    setNewStaffEmail("");
    setNewStaffPhone("");
    setNewStaffTitle("");
    showToast(`${newMember.display_name} ekibinize başarıyla eklendi.`);
  };

  // Personel Durumunu Aktif/Pasif Yap
  const toggleStatus = async (id: string) => {
    const tenantId = getTenantId();
    const storageKey = `rf_staff_${tenantId}`;

    const updated = staffList.map((s) =>
      s.id === id ? { ...s, is_active: !s.is_active } : s
    );
    setStaffList(updated);

    if (typeof window !== "undefined") {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    }

    const current = staffList.find((s) => s.id === id);
    if (current) {
      try {
        await fetch("/api/staff", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id,
            isActive: !current.is_active,
          }),
        });
      } catch (err) {
        console.warn("Toggle status error:", err);
      }
      showToast(`Personel durumu ${!current.is_active ? "Aktif" : "Pasif"} olarak güncellendi.`);
    }
  };

  // Personeli Sil (İşletmeler Silebilsin)
  const handleConfirmDelete = async () => {
    if (!staffToDelete) return;

    const id = staffToDelete.id;
    const name = staffToDelete.display_name;
    const tenantId = getTenantId();
    const storageKey = `rf_staff_${tenantId}`;

    const updated = staffList.filter((s) => s.id !== id);
    setStaffList(updated);

    if (typeof window !== "undefined") {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    }

    try {
      await fetch(`/api/staff?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.warn("Delete staff API warning:", err);
    }

    setStaffToDelete(null);
    showToast(`${name} ekipten başarıyla silindi.`);
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
            className="fixed top-20 right-8 z-50 p-4 rounded-2xl bg-zinc-900 text-white font-semibold text-xs shadow-2xl flex items-center gap-2 border border-zinc-700"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <Users className="w-6 h-6 text-indigo-400" />
            Ekip & Personel Yönetimi
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            İşletmenizdeki randevu alan uzmanları ve personeli yönetin; dilediğiniz zaman yeni personel ekleyin veya silin.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex min-h-[44px] items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95"
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
          className="px-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-700 text-white text-xs font-bold focus:outline-none focus:border-indigo-500 min-h-[44px]"
          defaultValue="ROUND_ROBIN"
        >
          <option value="ROUND_ROBIN">🔄 Sırayla Dağıt (Round-Robin)</option>
          <option value="LEAST_BUSY">⚖️ En Az Randevusu Olana Ata (Least-Busy)</option>
          <option value="AVAILABILITY_FIRST">⚡ İlk Boş Olana Öncelik Ver</option>
        </select>
      </div>

      {/* Staff Cards or Empty State */}
      {staffList.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-800 bg-slate-900/50 p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Kayıtlı Personel Bulunmuyor</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 leading-relaxed">
              İşletmenizde randevu kabul eden uzmanları, hekimleri veya çalışanları ekleyerek çoklu takvim yönetimini başlatabilirsiniz.
            </p>
          </div>
          <div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex min-h-[44px] items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-transform active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              İlk Personeli Ekle
            </button>
          </div>
        </div>
      ) : (
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
                    {staff.display_name.charAt(0).toUpperCase()}
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
                    <span className="font-mono tabular-nums">{staff.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-emerald-400 font-medium">
                  <CalendarCheck className="w-3.5 h-3.5" />
                  <span>Randevuya Açık</span>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => toggleStatus(staff.id)}
                  className={`min-h-[36px] px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                    staff.is_active
                      ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                      : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                  }`}
                >
                  {staff.is_active ? "● Aktif Randevu Alıyor" : "○ Pasif"}
                </button>

                {/* İşletmeler Silebilsin Butonu */}
                <button
                  type="button"
                  onClick={() => setStaffToDelete(staff)}
                  className="min-h-[36px] p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Personeli Sil"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Staff Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-400" />
                Yeni Personel Ekle
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddStaff} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Ad Soyad *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Erman Güler"
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-white text-[16px] min-h-[44px] focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Unvan / Uzmanlık Alanı
                </label>
                <input
                  type="text"
                  placeholder="Örn: Kıdemli Usta / Hekim"
                  value={newStaffTitle}
                  onChange={(e) => setNewStaffTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-white text-[16px] min-h-[44px] focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  E-Posta Adresi (İsteğe Bağlı)
                </label>
                <input
                  type="email"
                  placeholder="personel@isletme.com"
                  value={newStaffEmail}
                  onChange={(e) => setNewStaffEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-white text-[16px] min-h-[44px] focus:outline-none focus:border-indigo-500"
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
                  className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-white font-mono tabular-nums text-[16px] min-h-[44px] focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Rol</label>
                <select
                  value={newStaffRole}
                  onChange={(e) => setNewStaffRole(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-white text-xs min-h-[44px] focus:outline-none focus:border-indigo-500"
                >
                  <option value="STAFF">Uzman / Hizmet Veren</option>
                  <option value="ADMIN">Yönetici / Sekreter</option>
                  <option value="OWNER">İşletme Sahibi</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isSaving || !newStaffName.trim()}
                  className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 disabled:opacity-50"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Kaydet & Ekle</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 20 Kural (Kural 13): Silme Onay Modalı */}
      {staffToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>

            <div>
              <h3 className="text-sm font-bold text-white">Personeli Silmek İstiyor musunuz?</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                <strong className="text-white">{staffToDelete.display_name}</strong> adlı personeli ekipten silmek üzeresiniz. Bu işlem geri alınamaz.
              </p>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setStaffToDelete(null)}
                className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="min-h-[44px] px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30"
              >
                Evet, Personeli Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
