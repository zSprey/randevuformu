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
      const isErman =
        window.location.hostname.includes("byerman") ||
        localStorage.getItem("rf_tenant") === "byerman" ||
        localStorage.getItem("rf_user") === "byerman";

      setIsErmanTenant(isErman);
    }
  }, []);

  const fetchDashboardData = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/appointments", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.appointments) {
          setAppointments(data.appointments);
          return;
        }
      }

      // Fallback to Supabase
      const { data } = await supabase
        .from("appointments")
        .select("*, services(name, price_text)")
        .order("appointment_date", { ascending: false });

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
    if (newStatus === "cancelled") {
      setAppointments((prev) => prev.filter((a) => a.id !== id));
      try {
        await fetch(`/api/appointments?id=${id}`, { method: "DELETE" });
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
        body: JSON.stringify({ id, status: newStatus }),
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

    const newAppPayload = {
      id: `app_${Date.now()}`,
      customer_name: newCustomerName.trim(),
      customer_phone: newCustomerPhone.trim(),
      customer_note: newServiceName || "Saç Kesimi & Yıkama",
      service_name: newServiceName || "Saç Kesimi & Yıkama",
      appointment_date: newDate,
      appointment_time: `${newTime}:00`,
      status: "confirmed",
      services: { name: newServiceName || "Saç Kesimi & Yıkama" },
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md bg-slate-900 border-2 border-slate-700 rounded-3xl p-6 sm:p-7 shadow-2xl text-white space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-black text-lg text-white flex items-center gap-2">
                <Scissors className="w-5 h-5 text-amber-400" />
                <span>Manuel Randevu Ekle</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-xl"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAddNewAppointment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Müşteri Adı Soyadı *
                </label>
                <input
                  type="text"
                  required
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  placeholder="Müşteri adı ve soyadı"
                  className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-700 text-white text-sm font-semibold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Telefon Numarası *
                </label>
                <input
                  type="tel"
                  required
                  value={newCustomerPhone}
                  onChange={(e) => setNewCustomerPhone(e.target.value)}
                  placeholder="05XX XXX XX XX"
                  className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-700 text-white text-sm font-semibold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Tıraş Hizmeti
                </label>
                <select
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-700 text-white text-sm font-semibold focus:outline-none focus:border-emerald-500"
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
                  <label className="block text-xs font-bold text-slate-300 mb-1">Tarih</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3.5 py-3 rounded-2xl bg-slate-950 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Saat</label>
                  <input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full px-3.5 py-3 rounded-2xl bg-slate-950 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-black rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30"
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
        <div className="bg-slate-900 border-2 border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                <Scissors className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white">
                  Erman Usta Randevu Paneli
                </h1>
                <p className="text-sm font-semibold text-emerald-400 flex items-center gap-2 mt-1">
                  <Phone className="w-4 h-4" /> İletişim Hattı: 0538 480 90 01
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={fetchDashboardData}
                disabled={isRefreshing}
                className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-bold flex items-center gap-2 border border-slate-700 transition-all active:scale-95 cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-amber-400" : ""}`} />
                <span>Yenile</span>
              </button>
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-black flex items-center gap-2 shadow-lg shadow-emerald-600/30 border border-emerald-400 transition-all active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Randevu Ekle</span>
              </button>
            </div>
          </div>

          {/* Tarih Filtre Sekmeleri (Büyük & Dokunmatik) */}
          <div className="mt-6 pt-5 border-t border-slate-800 flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={() => setFilterDate("today")}
              className={`px-5 py-3 rounded-2xl font-black text-sm transition-all cursor-pointer ${
                filterDate === "today"
                  ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                  : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              📅 Bugün ({todayAppointments.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterDate("tomorrow")}
              className={`px-5 py-3 rounded-2xl font-black text-sm transition-all cursor-pointer ${
                filterDate === "tomorrow"
                  ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                  : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              📅 Yarın ({tomorrowAppointments.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterDate("all")}
              className={`px-5 py-3 rounded-2xl font-black text-sm transition-all cursor-pointer ${
                filterDate === "all"
                  ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                  : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              📋 Tüm Randevular ({appointments.length})
            </button>
          </div>
        </div>

        {/* Randevu Listesi (Ultra-Sade & Büyük Kartlar) */}
        <div className="space-y-4">
          {displayedErmanAppointments.length === 0 ? (
            <div className="bg-slate-900 border-2 border-slate-800 rounded-3xl p-10 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center mx-auto text-2xl">
                💈
              </div>
              <h3 className="text-xl font-black text-white">Henüz Kayıtlı Randevu Yok</h3>
              <p className="text-sm text-slate-400 max-w-md mx-auto">
                Müşteriler randevu aldığında veya siz telefonla gelen müşteriyi &quot;Randevu Ekle&quot; butonuyla eklediğinizde burada anında görünecektir.
              </p>
            </div>
          ) : (
            displayedErmanAppointments.map((app) => (
              <div
                key={app.id}
                className="bg-slate-900/90 border-2 border-slate-800 hover:border-slate-700 rounded-3xl p-5 sm:p-6 shadow-xl transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="px-4 py-2 rounded-2xl bg-emerald-950/80 border-2 border-emerald-500 text-emerald-300 font-black text-lg">
                      ⏰ {app.appointment_time?.slice(0, 5) || "Saat Yok"}
                    </div>
                    <div>
                      <h3 className="text-xl sm:text-2xl font-black text-white">
                        {app.customer_name}
                      </h3>
                      <div className="text-xs text-slate-400 font-semibold">
                        Tarih: {app.appointment_date}
                      </div>
                    </div>
                  </div>

                  {/* Durum Rozeti */}
                  <div>
                    {app.status === "seated" ? (
                      <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black bg-blue-950 border border-blue-600 text-blue-300 animate-pulse">
                        🪑 Koltukta / Tıraşta
                      </span>
                    ) : app.status === "completed" ? (
                      <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black bg-emerald-950 border border-emerald-600 text-emerald-300">
                        <CheckCircle2 className="w-4 h-4" /> Tamamlandı
                      </span>
                    ) : app.status === "cancelled" ? (
                      <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black bg-red-950 border border-red-600 text-red-300">
                        <XCircle className="w-4 h-4" /> İptal Edildi
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black bg-amber-950 border border-amber-600 text-amber-300">
                        <Clock className="w-4 h-4" /> Bekleniyor
                      </span>
                    )}
                  </div>
                </div>

                {/* Detay Bilgileri */}
                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-slate-300">
                    <span className="text-slate-400">✂️ Hizmet:</span>
                    <strong className="text-white">{app.services?.name || "Saç Kesimi"}</strong>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <span className="text-slate-400">📱 Telefon:</span>
                    <a
                      href={`tel:${app.customer_phone}`}
                      className="text-emerald-400 font-mono font-bold hover:underline text-base"
                    >
                      {app.customer_phone}
                    </a>
                  </div>
                  {app.customer_note && (
                    <div className="sm:col-span-2 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200">
                      📝 <strong>Müşteri Notu:</strong> {app.customer_note}
                    </div>
                  )}
                </div>

                {/* Büyük Dokunmatik Aksiyon Butonları */}
                <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${app.customer_phone}`}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 border border-slate-700 transition-all cursor-pointer"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Ara</span>
                    </a>
                    <a
                      href={`https://wa.me/90${app.customer_phone?.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                        `Merhaba Sayın ${app.customer_name}, ${app.appointment_date} saat ${app.appointment_time?.slice(0, 5)} için Erman Usta randevunuz onaylanmıştır. Sizi salonda bekliyoruz, sıhhatler olsun.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 rounded-xl bg-green-950/60 hover:bg-green-800 text-green-300 hover:text-white font-bold text-xs flex items-center gap-1.5 border border-green-700/50 transition-all cursor-pointer"
                    >
                      <span>💬 WhatsApp</span>
                    </a>
                  </div>

                  <div className="flex items-center gap-2">
                    {app.status !== "seated" && app.status !== "completed" && app.status !== "cancelled" && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(app.id, "seated")}
                        className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs transition-all shadow-md active:scale-95 cursor-pointer"
                      >
                        🪑 Koltukta
                      </button>
                    )}
                    {app.status !== "completed" && app.status !== "cancelled" && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(app.id, "completed")}
                        className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition-all shadow-md active:scale-95 cursor-pointer"
                      >
                        ✓ Tamamlandı
                      </button>
                    )}
                    {app.status !== "cancelled" && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(app.id, "cancelled")}
                        className="px-3 py-2.5 rounded-xl bg-red-950/60 hover:bg-red-700 text-red-300 hover:text-white font-bold text-xs border border-red-800 transition-all active:scale-95 cursor-pointer"
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
          <h2 className="text-2xl sm:text-3xl font-black text-white">Genel Bakış & İstatistikler</h2>
          <p className="text-xs text-slate-400 mt-1">
            İşletmenizin anlık randevu akışı, bekleyen talepler ve seans hacmi.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchDashboardData}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold hover:bg-slate-800 transition-all shadow-sm active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-indigo-400" : ""}`} />
            Yenile
          </button>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95 border border-indigo-400/30"
          >
            <Plus className="w-4 h-4" />
            Manuel Randevu Ekle
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl flex items-start justify-between hover:border-indigo-500/40 transition-all group">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Bugünkü Randevular</p>
            <h3 className="text-3xl font-black text-white mt-2">{todayCount}</h3>
            <p className="text-[11px] text-emerald-400 mt-1 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Canlı Takvim
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
            <CalendarCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl flex items-start justify-between hover:border-emerald-500/40 transition-all group">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Toplam Randevu</p>
            <h3 className="text-3xl font-black text-white mt-2">{appointments.length}</h3>
            <p className="text-[11px] text-indigo-400 mt-1 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Gerçek Veritabanı
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl flex items-start justify-between hover:border-purple-500/40 transition-all group">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Haftalık Seans</p>
            <h3 className="text-3xl font-black text-white mt-2">{appointments.length}</h3>
            <p className="text-[11px] text-purple-400 mt-1 font-semibold">Aktif rezervasyonlar</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/30 text-purple-400 flex items-center justify-center group-hover:scale-105 transition-transform">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl flex items-start justify-between hover:border-amber-500/40 transition-all group">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Bekleyen Talepler</p>
            <h3 className="text-3xl font-black text-white mt-2">{pendingCount}</h3>
            <p className="text-[11px] text-amber-400 mt-1 font-semibold flex items-center gap-1">
              <Clock className="w-3 h-3" /> Onay Bekliyor
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-600/20 border border-amber-500/30 text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Randevu Tablosu */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-xl overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-bold">
              📋
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Randevu Listesi</h3>
              <p className="text-xs text-slate-400">Veritabanındaki gerçek randevular</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Müşteri ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[10px] font-bold">
              <tr>
                <th className="px-5 py-3">Müşteri</th>
                <th className="px-5 py-3">Hizmet</th>
                <th className="px-5 py-3">Tarih & Saat</th>
                <th className="px-5 py-3">Telefon</th>
                <th className="px-5 py-3">Durum</th>
                <th className="px-5 py-3 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-500">
                    Henüz kayıtlı randevu bulunmuyor.
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-4 font-bold text-white">{app.customer_name}</td>
                    <td className="px-5 py-4 text-slate-300">{app.services?.name || "Hizmet"}</td>
                    <td className="px-5 py-4 text-indigo-400 font-bold">
                      {app.appointment_date} {app.appointment_time?.slice(0, 5)}
                    </td>
                    <td className="px-5 py-4 font-mono">{app.customer_phone}</td>
                    <td className="px-5 py-4">
                      {app.status === "seated" ? (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-950 text-blue-300 border border-blue-700">
                          🪑 Koltukta
                        </span>
                      ) : app.status === "completed" ? (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700">
                          ✓ Tamamlandı
                        </span>
                      ) : app.status === "cancelled" ? (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-950 text-red-300 border border-red-700">
                          ✕ İptal
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-950 text-amber-300 border border-amber-700">
                          ⏳ Bekleniyor
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right space-x-1.5 whitespace-nowrap">
                      <a
                        href={`tel:${app.customer_phone}`}
                        className="px-2.5 py-1.5 bg-slate-800 text-slate-300 hover:text-white rounded-lg border border-slate-700 text-xs font-bold"
                      >
                        Ara
                      </a>
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(app.id, "completed")}
                        className="px-2.5 py-1.5 bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600 hover:text-white rounded-lg border border-emerald-500/30 text-xs font-bold"
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
