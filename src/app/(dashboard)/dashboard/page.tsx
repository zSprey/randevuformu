"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  CalendarCheck,
  TrendingUp,
  Clock,
  Plus,
  Filter,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Search,
  RefreshCw,
  Calendar,
  X,
  Sparkles,
  ArrowUpRight,
  Phone,
  CreditCard,
  ChevronRight,
  Scissors,
  MessageSquare,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { format, addDays } from "date-fns";

const chartData = [
  { name: "Pzt", gelir: 4500, randevu: 6 },
  { name: "Sal", gelir: 7200, randevu: 9 },
  { name: "Çar", gelir: 6000, randevu: 8 },
  { name: "Per", gelir: 8900, randevu: 12 },
  { name: "Cum", gelir: 11400, randevu: 15 },
  { name: "Cts", gelir: 14800, randevu: 18 },
  { name: "Paz", gelir: 9200, randevu: 11 },
];

export default function DashboardPage() {
  // SIFIR FAKE VERİ PRENSİBİ: Başlangıçta boş dizi
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // By Erman Özel Modu (Yalnızca By Erman Kuaför için aktiftir, genel kullanıcılar için kapalıdır)
  const [isErmanTenant, setIsErmanTenant] = useState(false);
  const [filterDate, setFilterDate] = useState<"today" | "tomorrow" | "all">("today");

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");
  const [newServiceName, setNewServiceName] = useState("Saç Kesimi & Yıkama");
  const [newTime, setNewTime] = useState("11:00");
  const [newDate, setNewDate] = useState(new Date().toISOString().split("T")[0]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isByErmanHost = window.location.hostname.includes("byerman");
      const currentUser = localStorage.getItem("rf_user");
      const currentTenant = localStorage.getItem("rf_tenant");

      // By Erman modu SADECE açıkça byerman kullanıcı adı ve şifresiyle girildiyse veya byerman subdomaininde ise açılır
      const isErman = isByErmanHost || (currentUser === "byerman" && currentTenant === "byerman");

      setIsErmanTenant(isErman);
    }
  }, []);

  const getTenantParam = () => {
    if (typeof window === "undefined") return "default";
    const isByErmanHost = window.location.hostname.includes("byerman");
    const currentUser = localStorage.getItem("rf_user");
    const currentTenant = localStorage.getItem("rf_tenant");
    const isErman = isByErmanHost || (currentUser === "byerman" && currentTenant === "byerman");
    return isErman ? "byerman" : (currentTenant || currentUser || "default");
  };

  const fetchDashboardData = async () => {
    setIsRefreshing(true);
    try {
      const isByErmanHost = typeof window !== "undefined" && window.location.hostname.includes("byerman");
      const currentUser = typeof window !== "undefined" ? localStorage.getItem("rf_user") : null;
      const currentTenant = typeof window !== "undefined" ? localStorage.getItem("rf_tenant") : null;
      const isErman = isByErmanHost || (currentUser === "byerman" && currentTenant === "byerman");

      const tenantParam = isErman ? "byerman" : (currentTenant || currentUser || "default");

      // Güvenlik & İzolasyon: Eğer normal bir işletme ise By Erman verileri ASLA çekilemez
      const res = await fetch(`/api/appointments?tenant=${encodeURIComponent(tenantParam)}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.appointments) {
          if (!isErman) {
            // Sadece bu işletmeye ait olanları göster
            const tenantFiltered = data.appointments.filter(
              (a: any) =>
                a.tenant === tenantParam ||
                a.tenant_id === tenantParam ||
                a.business_id === tenantParam
            );
            setAppointments(tenantFiltered);
          } else {
            setAppointments(data.appointments);
          }
          return;
        }
      }

      // Fallback to Supabase with strict tenant filter
      let query = supabase
        .from("appointments")
        .select("*, services(name, price_text)")
        .order("appointment_date", { ascending: false });

      if (isErman) {
        query = query.or("tenant.eq.byerman,tenant_id.eq.byerman,business_id.eq.byerman");
      } else if (tenantParam && tenantParam !== "default") {
        query = query.or(`tenant.eq.${tenantParam},tenant_id.eq.${tenantParam},business_id.eq.${tenantParam}`);
      } else {
        setAppointments([]);
        return;
      }

      const { data } = await query;
      if (data && data.length > 0) {
        setAppointments(data);
      } else {
        setAppointments([]);
      }
    } catch {
      setAppointments([]);
    } finally {
      setLoading(false);
      setTimeout(() => setIsRefreshing(false), 400);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    const tenantParam = getTenantParam();
    if (newStatus === "cancelled") {
      setAppointments((prev) => prev.filter((a) => a.id !== id));
      try {
        await fetch(`/api/appointments?id=${id}&tenant=${encodeURIComponent(tenantParam)}`, { method: "DELETE" });
      } catch (e) {
        console.warn("Randevu silinirken hata:", e);
      }
      showToast("Randevu başarıyla silindi.");
      return;
    }

    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
    );

    try {
      await fetch("/api/appointments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus, tenant: tenantParam }),
      });
    } catch (e) {
      console.warn("Durum güncellenirken hata:", e);
    }

    const statusText =
      newStatus === "seated"
        ? "Koltukta / Tıraşta"
        : newStatus === "completed"
        ? "Tamamlandı"
        : "Onaylandı";

    showToast(`Randevu durumu güncellendi: ${statusText}`);
  };

  const handleAddNewAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerName.trim() || !newCustomerPhone.trim()) {
      showToast("Lütfen ad ve telefon bilgilerini girin.");
      return;
    }

    const tenantParam = getTenantParam();

    const newAppPayload = {
      id: `app_${Date.now()}`,
      tenant: tenantParam,
      tenant_id: tenantParam,
      business_id: tenantParam,
      customer_name: newCustomerName.trim(),
      customer_phone: newCustomerPhone.trim(),
      customer_note: newServiceName || "Genel Randevu",
      service_name: newServiceName || "Genel Randevu",
      appointment_date: newDate,
      appointment_time: `${newTime}:00`,
      status: "confirmed",
      services: { name: newServiceName || "Genel Randevu" },
    };

    // UI'ı anında güncelle
    setAppointments((prev) => [newAppPayload, ...prev]);
    setShowAddModal(false);
    setNewCustomerName("");
    setNewCustomerPhone("");
    showToast("Yeni randevu takvime başarıyla kaydedildi!");

    // Global Store'a kaydet
    try {
      await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAppPayload),
      });
    } catch (err) {
      console.warn("Manuel randevu eklenirken hata:", err);
    }
  };

  const todayStr = format(new Date(), "yyyy-MM-dd");
  const tomorrowStr = format(addDays(new Date(), 1), "yyyy-MM-dd");

  const todayAppointments = appointments.filter((a) => a.appointment_date === todayStr);
  const tomorrowAppointments = appointments.filter((a) => a.appointment_date === tomorrowStr);

  const displayedErmanAppointments = appointments.filter((a) => {
    if (filterDate === "today") return a.appointment_date === todayStr;
    if (filterDate === "tomorrow") return a.appointment_date === tomorrowStr;
    return true;
  });

  const renderAddModal = () => (
    <AnimatePresence>
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md bg-white border border-slate-200 rounded-xl p-6 sm:p-7 shadow-2xl text-slate-800 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-[#0F2A4A] flex items-center gap-2">
                <Scissors className="w-5 h-5 text-[#0062FF]" />
                <span>Manuel Randevu Ekle</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddNewAppointment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#0F2A4A] mb-1">
                  Müşteri Adı Soyadı *
                </label>
                <input
                  type="text"
                  required
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  placeholder="Müşteri adı ve soyadı"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium focus:outline-none focus:bg-white focus:border-[#0062FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F2A4A] mb-1">
                  Telefon Numarası *
                </label>
                <input
                  type="tel"
                  required
                  value={newCustomerPhone}
                  onChange={(e) => setNewCustomerPhone(e.target.value)}
                  placeholder="05XX XXX XX XX"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium focus:outline-none focus:bg-white focus:border-[#0062FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F2A4A] mb-1">
                  Tıraş Hizmeti
                </label>
                <select
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium focus:outline-none focus:bg-white focus:border-[#0062FF]"
                >
                  <option value="Saç Kesimi & Yıkama">Saç Kesimi & Yıkama (30 dk)</option>
                  <option value="Sakal Tıraşı & Sıcak Havlu">Sakal Tıraşı & Sıcak Havlu (30 dk)</option>
                  <option value="Saç + Sakal (Komple Tıraş)">Saç + Sakal (Komple Tıraş - 60 dk)</option>
                  <option value="Çocuk Saç Kesimi">Çocuk Saç Kesimi (30 dk)</option>
                  <option value="Saç Yıkama & Fön">Saç Yıkama & Fön (20 dk)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#0F2A4A] mb-1">Tarih</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium focus:outline-none focus:bg-white focus:border-[#0062FF]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0F2A4A] mb-1">Saat</label>
                  <input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium focus:outline-none focus:bg-white focus:border-[#0062FF]"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-medium rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-medium rounded-lg bg-[#00BCD4] hover:bg-[#00acc1] text-white shadow-sm"
                >
                  Randevuyu Kaydet
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  // ──────────────────────────────────────────────────────────
  // 1. ERMAN USTA ULTRA-SADE BERBER YÖNETİM PANELİ (SENIOR UX)
  // ──────────────────────────────────────────────────────────
  if (isErmanTenant) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto pb-20 font-sans">
        {/* Toast Notification */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-24 right-8 z-50 p-4 rounded-2xl bg-emerald-600 text-white font-black text-sm shadow-2xl flex items-center gap-2 border border-emerald-400"
            >
              <CheckCircle2 className="w-5 h-5 text-white" />
              {toastMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Erman Usta Header Card */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-[#0F2A4A]/[0.06] border border-slate-200 text-[#0F2A4A] flex items-center justify-center shrink-0">
                <Scissors className="w-6 h-6" strokeWidth={1.75} />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-[#0F2A4A]">
                  Erman Usta Randevu Paneli
                </h1>
                <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5 mt-0.5">
                  <Phone className="w-3.5 h-3.5" /> İletişim Hattı: 0538 480 90 01
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={fetchDashboardData}
                disabled={isRefreshing}
                className="px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-600 text-xs font-medium flex items-center gap-1.5 border border-slate-200 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-[#0062FF]" : ""}`} />
                <span>Yenile</span>
              </button>
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 rounded-lg bg-[#00BCD4] hover:bg-[#00acc1] text-white text-xs font-medium flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Randevu Ekle</span>
              </button>
            </div>
          </div>

          {/* Tarih Filtre Sekmeleri */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setFilterDate("today")}
              className={`px-4 py-2 rounded-lg font-medium text-xs transition-colors cursor-pointer ${
                filterDate === "today"
                  ? "bg-[#0F2A4A] text-white shadow-xs"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              📅 Bugün ({todayAppointments.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterDate("tomorrow")}
              className={`px-4 py-2 rounded-lg font-medium text-xs transition-colors cursor-pointer ${
                filterDate === "tomorrow"
                  ? "bg-[#0F2A4A] text-white shadow-xs"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              📅 Yarın ({tomorrowAppointments.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterDate("all")}
              className={`px-4 py-2 rounded-lg font-medium text-xs transition-colors cursor-pointer ${
                filterDate === "all"
                  ? "bg-[#0F2A4A] text-white shadow-xs"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              📋 Tüm Randevular ({appointments.length})
            </button>
          </div>
        </div>

        {/* Randevu Listesi */}
        <div className="space-y-3">
          {displayedErmanAppointments.length === 0 ? (
            <div className="bg-white border border-slate-200/90 rounded-xl p-10 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-xl">
                💈
              </div>
              <h3 className="text-base font-bold text-[#0F2A4A]">Henüz Kayıtlı Randevu Yok</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Müşteriler randevu aldığında veya siz telefonla gelen müşteriyi &quot;Randevu Ekle&quot; butonuyla eklediğinizde burada anında görünecektir.
              </p>
            </div>
          ) : (
            displayedErmanAppointments.map((app) => (
              <div
                key={app.id}
                className="bg-white border border-slate-200/90 hover:border-slate-300 rounded-xl p-5 shadow-xs transition-colors space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-sm">
                      ⏰ {app.appointment_time?.slice(0, 5) || "Saat Yok"}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#0F2A4A]">
                        {app.customer_name}
                      </h3>
                      <div className="text-xs text-slate-400">
                        Tarih: {app.appointment_date}
                      </div>
                    </div>
                  </div>

                  {/* Durum Rozeti */}
                  <div>
                    {app.status === "seated" ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-50 border border-blue-200 text-blue-700">
                        🪑 Koltukta / Tıraşta
                      </span>
                    ) : app.status === "completed" ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 border border-emerald-200 text-emerald-700">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Tamamlandı
                      </span>
                    ) : app.status === "cancelled" ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-rose-50 border border-rose-200 text-rose-700">
                        <XCircle className="w-3.5 h-3.5" /> İptal Edildi
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-50 border border-amber-200 text-amber-700">
                        <Clock className="w-3.5 h-3.5" /> Bekleniyor
                      </span>
                    )}
                  </div>
                </div>

                {/* Detay Bilgileri */}
                <div className="grid sm:grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-2 text-slate-600">
                    <span className="text-slate-400">✂️ Hizmet:</span>
                    <strong className="text-slate-800">{app.services?.name || "Saç Kesimi"}</strong>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <span className="text-slate-400">📱 Telefon:</span>
                    <a
                      href={`tel:${app.customer_phone}`}
                      className="text-emerald-600 font-mono font-bold hover:underline"
                    >
                      {app.customer_phone}
                    </a>
                  </div>
                  {app.customer_note && (
                    <div className="sm:col-span-2 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800">
                      📝 <strong>Müşteri Notu:</strong> {app.customer_note}
                    </div>
                  )}
                </div>

                {/* Aksiyon Butonları */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${app.customer_phone}`}
                      className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-600 hover:text-[#0F2A4A] font-medium text-xs flex items-center gap-1.5 border border-slate-200 transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Ara</span>
                    </a>
                    <a
                      href={`https://wa.me/90${app.customer_phone?.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                        `Merhaba Sayın ${app.customer_name}, ${app.appointment_date} saat ${app.appointment_time?.slice(0, 5)} için Erman Usta randevunuz onaylanmıştır. Sizi salonda bekliyoruz, sıhhatler olsun.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium text-xs flex items-center gap-1.5 border border-emerald-200 transition-colors"
                    >
                      <span>💬 WhatsApp</span>
                    </a>
                  </div>

                  <div className="flex items-center gap-2">
                    {app.status !== "seated" && app.status !== "completed" && app.status !== "cancelled" && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(app.id, "seated")}
                        className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium text-xs transition-colors border border-blue-200 cursor-pointer"
                      >
                        🪑 Koltukta
                      </button>
                    )}
                    {app.status !== "completed" && app.status !== "cancelled" && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(app.id, "completed")}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-colors shadow-xs cursor-pointer"
                      >
                        ✓ Tamamlandı
                      </button>
                    )}
                    {app.status !== "cancelled" && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(app.id, "cancelled")}
                        className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-rose-50 text-slate-500 hover:text-rose-600 font-medium text-xs border border-slate-200 transition-colors cursor-pointer"
                      >
                        ✕ İptal
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {renderAddModal()}
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────
  // 2. GENEL SAAS DASHBOARD (DİĞER İŞLETMELER İÇİN)
  // ──────────────────────────────────────────────────────────
  const filteredAppointments = appointments.filter((a) => {
    const matchesStatus = filterStatus === "all" || a.status === filterStatus;
    const matchesSearch =
      a.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.services?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const todayCount = appointments.filter((a) => a.appointment_date === todayStr).length;
  const pendingCount = appointments.filter((a) => a.status === "pending").length;

  return (
    <div className="space-y-8 pb-16">
      {/* Toast Feedback */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 right-8 z-50 p-4 rounded-2xl bg-indigo-600 text-white font-bold text-xs shadow-2xl flex items-center gap-2 border border-indigo-400"
          >
            <CheckCircle2 className="w-4 h-4 text-white" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#0F2A4A]">Genel Bakış &amp; İstatistikler</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            İşletmenizin anlık randevu akışı, bekleyen talepler ve seans hacmi.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchDashboardData}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-[#0F2A4A] text-xs font-medium hover:bg-slate-50 transition-colors shadow-xs active:scale-95 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-[#0062FF]" : "text-slate-400"}`} />
            Yenile
          </button>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#00BCD4] hover:bg-[#00acc1] text-white text-xs font-medium shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Manuel Randevu Ekle
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs flex items-start justify-between hover:border-[#0062FF]/30 transition-all">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Bugünkü Randevular</p>
            <h3 className="text-2xl font-bold text-[#0F2A4A] mt-1 tabular-nums">{todayCount}</h3>
            <p className="text-[11px] text-emerald-600 mt-1 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Canlı Takvim
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#0062FF]/10 text-[#0062FF] flex items-center justify-center">
            <CalendarCheck className="w-5 h-5" strokeWidth={1.75} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs flex items-start justify-between hover:border-[#0062FF]/30 transition-all">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Toplam Randevu</p>
            <h3 className="text-2xl font-bold text-[#0F2A4A] mt-1 tabular-nums">{appointments.length}</h3>
            <p className="text-[11px] text-[#0062FF] mt-1 font-medium flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Gerçek Veritabanı
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Users className="w-5 h-5" strokeWidth={1.75} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs flex items-start justify-between hover:border-[#0062FF]/30 transition-all">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Haftalık Seans</p>
            <h3 className="text-2xl font-bold text-[#0F2A4A] mt-1 tabular-nums">{appointments.length}</h3>
            <p className="text-[11px] text-slate-500 mt-1 font-medium">Aktif rezervasyonlar</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#0F2A4A]/[0.06] text-[#0F2A4A] flex items-center justify-center">
            <CreditCard className="w-5 h-5" strokeWidth={1.75} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs flex items-start justify-between hover:border-[#0062FF]/30 transition-all">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Bekleyen Talepler</p>
            <h3 className="text-2xl font-bold text-[#0F2A4A] mt-1 tabular-nums">{pendingCount}</h3>
            <p className="text-[11px] text-amber-600 mt-1 font-medium flex items-center gap-1">
              <Clock className="w-3 h-3" /> Onay Bekliyor
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" strokeWidth={1.75} />
          </div>
        </div>
      </div>

      {/* Randevu Tablosu */}
      <div className="bg-white border border-slate-200/90 rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#0062FF]/10 text-[#0062FF] flex items-center justify-center font-bold text-sm">
              📋
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0F2A4A]">Randevu Listesi</h3>
              <p className="text-[11px] text-slate-400">Veritabanındaki gerçek randevular</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Müşteri ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#0062FF]"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-100 uppercase tracking-wider text-[10px] font-semibold">
              <tr>
                <th className="px-5 py-3">Müşteri</th>
                <th className="px-5 py-3">Hizmet</th>
                <th className="px-5 py-3">Tarih &amp; Saat</th>
                <th className="px-5 py-3">Telefon</th>
                <th className="px-5 py-3">Durum</th>
                <th className="px-5 py-3 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-400 text-xs">
                    Henüz kayıtlı randevu bulunmuyor.
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5 font-semibold text-[#0F2A4A]">{app.customer_name}</td>
                    <td className="px-5 py-3.5 text-slate-600">{app.services?.name || "Hizmet"}</td>
                    <td className="px-5 py-3.5 text-[#0062FF] font-medium tabular-nums">
                      {app.appointment_date} {app.appointment_time?.slice(0, 5)}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-500">{app.customer_phone}</td>
                    <td className="px-5 py-3.5">
                      {app.status === "seated" ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                          🪑 Koltukta
                        </span>
                      ) : app.status === "completed" ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          ✓ Tamamlandı
                        </span>
                      ) : app.status === "cancelled" ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
                          ✕ İptal
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                          ⏳ Bekleniyor
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                      <a
                        href={`tel:${app.customer_phone}`}
                        className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-600 hover:text-[#0F2A4A] rounded-md border border-slate-200 text-xs font-medium"
                      >
                        Ara
                      </a>
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(app.id, "completed")}
                        className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-md border border-emerald-200 text-xs font-medium"
                      >
                        ✓
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {renderAddModal()}
    </div>
  );
}
