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
  X,
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

  // Personel Listesini Yükle (İşletmeye Özel ve Kalıcı)
  const fetchStaff = async () => {
    setLoading(true);
    const tenantId = getTenantId();
    const storageKey = `rf_staff_${tenantId}`;

    let localStaff: StaffMember[] = [];
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          localStaff = JSON.parse(saved).filter(
            (s: StaffMember) =>
              !s.display_name?.includes("Ahmet Yılmaz") &&
              !s.display_name?.includes("Zeynep Kaya") &&
              !s.display_name?.includes("Emre Can")
          );
        } catch {
          localStaff = [];
        }
      }
    }

    // İlk olarak yerel veriyi hemen göster (instant UI)
    if (localStaff.length > 0) {
      setStaffList(localStaff);
    }

    try {
      const res = await fetch(`/api/staff?tenantId=${encodeURIComponent(tenantId)}`);
      if (res.ok) {
        const json = await res.json();
        const apiStaff = json?.data?.staff || json?.staff || [];
        
        const cleaned = apiStaff.filter(
          (s: StaffMember) =>
            !s.display_name?.includes("Ahmet Yılmaz") &&
            !s.display_name?.includes("Zeynep Kaya") &&
            !s.display_name?.includes("Emre Can")
        );

        // Sunucuda gerçek veri varsa localStorage'ı güncelle; boş ise yerel veriyi koru
        if (cleaned.length > 0) {
          setStaffList(cleaned);
          if (typeof window !== "undefined") {
            localStorage.setItem(storageKey, JSON.stringify(cleaned));
          }
        }
      } else {
        console.warn("Staff API returned non-OK status:", res.status);
      }
    } catch (err) {
      console.warn("Staff API fetch error (offline mode - using local cache):", err);
      // API fallback: yerel veriyi koru
    } finally {
      setLoading(false);
    }
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
      const apiRes = await fetch("/api/staff", {
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
      if (!apiRes.ok) {
        console.warn("Staff save API warning: non-OK status", apiRes.status);
        showToast(`${newMember.display_name} yerel olarak eklendi, sunucuya kaydedilemedi.`);
      } else {
        showToast(`${newMember.display_name} ekibinize başarıyla eklendi ve buluta kaydedildi!`);
      }
    } catch (err) {
      console.warn("Staff save API error:", err);
      showToast(`${newMember.display_name} yerel olarak eklendi, sunucuya kaydedilemedi.`);
    }

    setIsSaving(false);
    setIsModalOpen(false);
    setNewStaffName("");
    setNewStaffEmail("");
    setNewStaffPhone("");
    setNewStaffTitle("");
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

  // Personeli Sil
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
      try {
        const existingDeleted: string[] = JSON.parse(localStorage.getItem("rf_deleted_staff") || "[]");
        if (!existingDeleted.includes(id)) {
          existingDeleted.push(id);
          localStorage.setItem("rf_deleted_staff", JSON.stringify(existingDeleted));
        }
      } catch {}
      window.dispatchEvent(new Event("storage"));
    }

    try {
      await fetch(`/api/staff?id=${encodeURIComponent(id)}&tenantId=${encodeURIComponent(tenantId)}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.warn("Staff delete error:", err);
    }

    setStaffToDelete(null);
    showToast(`${name} ekipten silindi.`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0F2A4A] flex items-center gap-2.5">
            <Users className="w-6 h-6 text-[#0062FF]" />
            Ekip & Personel Yönetimi
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            İşletmenizdeki randevu kabul eden uzmanları yönetin; dilediğiniz zaman yeni personel ekleyin veya düzenleyin.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex min-h-[40px] items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0062FF] hover:bg-[#0051d4] text-white font-semibold text-xs shadow-xs transition-all"
        >
          <UserPlus className="w-4 h-4" />
          Yeni Personel Ekle
        </button>
      </div>

      {/* Routing Strategy Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50/70 to-slate-50 border border-blue-200/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xs">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100 text-[#0062FF] text-[11px] font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Akıllı Randevu Dağıtım Motoru (Routing Engine)
          </div>
          <h3 className="text-sm font-bold text-[#0F2A4A]">
            Müşteriler &quot;İlk Müsait Uzman&quot; seçtiğinde randevu nasıl atansın?
          </h3>
          <p className="text-xs text-slate-500">
            Sistem gelen rezervasyonları Round-Robin (Sıralı) veya Least-Busy (Yük Dengeleme) ile personellerinize otomatik yönlendirir.
          </p>
        </div>
        <select
          className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#0062FF] shadow-2xs"
          defaultValue="ROUND_ROBIN"
        >
          <option value="ROUND_ROBIN">🔄 Sırayla Dağıt (Round-Robin)</option>
          <option value="LEAST_BUSY">⚖️ En Az Randevusu Olana Ata (Least-Busy)</option>
          <option value="AVAILABILITY_FIRST">⚡ İlk Boş Olana Öncelik Ver</option>
        </select>
      </div>

      {/* Staff Cards or Empty State */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#0062FF]" />
          <p className="text-xs mt-2">Personel listesi yükleniyor...</p>
        </div>
      ) : staffList.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center space-y-4 shadow-2xs">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#0062FF] border border-blue-200/50 flex items-center justify-center mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#0F2A4A]">Kayıtlı Personel Bulunmuyor</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
              İşletmenizde randevu kabul eden uzmanları, hekimleri veya çalışanları ekleyerek çoklu takvim yönetimini başlatabilirsiniz.
            </p>
          </div>
          <div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0062FF] hover:bg-[#0051d4] text-white text-xs font-semibold transition-all shadow-xs"
            >
              <UserPlus className="w-4 h-4" />
              İlk Personeli Ekle
            </button>
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {staffList.map((staff) => (
            <div
              key={staff.id}
              className={`p-5 rounded-2xl border transition-all ${
                staff.is_active
                  ? "bg-white border-slate-200/90 hover:border-[#0062FF]/40 shadow-xs"
                  : "bg-slate-50/80 border-slate-200 opacity-60"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#0F2A4A] to-[#0062FF] flex items-center justify-center font-bold text-white text-sm shadow-xs">
                    {staff.display_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#0F2A4A]">{staff.display_name}</h4>
                    <p className="text-xs text-slate-500">{staff.title || "Uzman"}</p>
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    staff.role === "OWNER"
                      ? "bg-purple-50 text-purple-700 border border-purple-200/60"
                      : "bg-blue-50 text-[#0062FF] border border-blue-200/60"
                  }`}
                >
                  {staff.role === "OWNER" ? "Sahip" : "Uzman"}
                </span>
              </div>

              <div className="mt-4 pt-3.5 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                {staff.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{staff.email}</span>
                  </div>
                )}
                {staff.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono tabular-nums">{staff.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-emerald-600 font-medium">
                  <CalendarCheck className="w-3.5 h-3.5" />
                  <span>Randevuya Açık</span>
                </div>
              </div>

              <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => toggleStatus(staff.id)}
                  className={`min-h-[32px] px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    staff.is_active
                      ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/60"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {staff.is_active ? "● Aktif" : "○ Pasif"}
                </button>

                <button
                  type="button"
                  onClick={() => setStaffToDelete(staff)}
                  className="min-h-[32px] p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
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
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-2xl bg-white border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-[#0F2A4A] flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#0062FF]" />
                Yeni Personel Ekle
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStaff} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ad Soyad *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Mehmet Can"
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0062FF] focus:border-[#0062FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Unvan / Uzmanlık Alanı
                </label>
                <input
                  type="text"
                  placeholder="Örn: Uzman Kuaför / Diyetisyen"
                  value={newStaffTitle}
                  onChange={(e) => setNewStaffTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0062FF] focus:border-[#0062FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  E-Posta Adresi (İsteğe Bağlı)
                </label>
                <input
                  type="email"
                  placeholder="personel@isletme.com"
                  value={newStaffEmail}
                  onChange={(e) => setNewStaffEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0062FF] focus:border-[#0062FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Telefon Numarası
                </label>
                <input
                  type="tel"
                  placeholder="05XX XXX XX XX"
                  value={newStaffPhone}
                  onChange={(e) => setNewStaffPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono tabular-nums text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0062FF] focus:border-[#0062FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Rol</label>
                <select
                  value={newStaffRole}
                  onChange={(e) => setNewStaffRole(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0062FF]"
                >
                  <option value="STAFF">Uzman / Hizmet Veren</option>
                  <option value="ADMIN">Yönetici / Sekreter</option>
                  <option value="OWNER">İşletme Sahibi</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isSaving || !newStaffName.trim()}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0062FF] hover:bg-[#0051d4] text-white text-xs font-semibold shadow-xs disabled:opacity-50"
                >
                  {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Kaydet & Ekle</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Staff Confirmation Modal */}
      {staffToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm p-6 rounded-2xl bg-white border border-slate-200 shadow-2xl space-y-4">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-200/60 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>

            <div>
              <h3 className="text-sm font-bold text-[#0F2A4A]">Personeli Silmek İstiyor musunuz?</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                <strong className="text-slate-800">{staffToDelete.display_name}</strong> adlı personeli ekipten silmek üzeresiniz. Bu işlem geri alınamaz.
              </p>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setStaffToDelete(null)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-xs"
              >
                Evet, Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
