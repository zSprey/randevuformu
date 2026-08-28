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
import { format } from "date-fns";

const chartData = [
  { name: "Pzt", gelir: 4500, randevu: 6 },
  { name: "Sal", gelir: 7200, randevu: 9 },
  { name: "Çar", gelir: 6000, randevu: 8 },
  { name: "Per", gelir: 8900, randevu: 12 },
  { name: "Cum", gelir: 11400, randevu: 15 },
  { name: "Cts", gelir: 14800, randevu: 18 },
  { name: "Paz", gelir: 9200, randevu: 11 },
];

const fallbackAppointments = [
  {
    id: "app-1",
    customer_name: "Caner Öztürk",
    customer_phone: "0532 456 78 90",
    customer_note: "Ön diş estetiği ve zirkonyum danışmanlığı",
    appointment_date: new Date().toISOString().split("T")[0],
    appointment_time: "14:30:00",
    status: "confirmed",
    services: { name: "İmplant Konsültasyonu", price_text: "Ücretsiz" },
  },
  {
    id: "app-2",
    customer_name: "Burcu Çelik",
    customer_phone: "0544 123 45 67",
    customer_note: "Lazerli beyazlatma seansı",
    appointment_date: new Date().toISOString().split("T")[0],
    appointment_time: "16:00:00",
    status: "confirmed",
    services: { name: "Lazerli Beyazlatma", price_text: "₺3.000" },
  },
  {
    id: "app-3",
    customer_name: "Emre Demir",
    customer_phone: "0505 987 65 43",
    customer_note: "Diş eti hassasiyeti kontrolü",
    appointment_date: new Date().toISOString().split("T")[0],
    appointment_time: "17:15:00",
    status: "pending",
    services: { name: "Kanal Tedavisi & Dolgu", price_text: "₺1.200" },
  },
  {
    id: "app-4",
    customer_name: "Elif Yılmaz",
    customer_phone: "0533 555 44 33",
    customer_note: "Rutin 6 aylık diş muayenesi",
    appointment_date: new Date().toISOString().split("T")[0],
    appointment_time: "11:00:00",
    status: "confirmed",
    services: { name: "Gülüş Tasarımı Ön Analizi", price_text: "₺1.500" },
  },
];

export default function DashboardPage() {
  const [appointments, setAppointments] = useState<any[]>(fallbackAppointments);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");
  const [newServiceName, setNewServiceName] = useState("İmplant Konsültasyonu");
  const [newTime, setNewTime] = useState("15:00");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchDashboardData = async () => {
    setIsRefreshing(true);
    try {
      const { data } = await supabase
        .from("appointments")
        .select("*, services(name, price_text)")
        .order("created_at", { ascending: false });

      if (data && data.length > 0) {
        setAppointments(data);
      }
    } catch (e) {
      console.log("Using fallback appointments");
    } finally {
      setLoading(false);
      setTimeout(() => setIsRefreshing(false), 400);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleUpdateStatus = (id: string, newStatus: string) => {
    setAppointments(
      appointments.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
    );
    showToast(`Randevu durumu güncellendi: ${newStatus === "confirmed" ? "Onaylandı" : "İptal Edildi"}`);
  };

  const handleAddNewAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    const newApp = {
      id: `app_${Date.now()}`,
      customer_name: newCustomerName,
      customer_phone: newCustomerPhone,
      customer_note: "Manuel yönetim panelinden eklendi.",
      appointment_date: new Date().toISOString().split("T")[0],
      appointment_time: `${newTime}:00`,
      status: "confirmed",
      services: { name: newServiceName, price_text: "₺1.000" },
    };

    setAppointments([newApp, ...appointments]);
    setShowAddModal(false);
    setNewCustomerName("");
    setNewCustomerPhone("");
    showToast("Yeni randevu başarıyla takvime eklendi!");
  };

  const filteredAppointments = appointments.filter((a) => {
    const matchesStatus = filterStatus === "all" || a.status === filterStatus;
    const matchesSearch =
      a.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.services?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const todayStr = format(new Date(), "yyyy-MM-dd");
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
            Kliniğinizin anlık randevu akışı, bekleyen talepler ve finansal hacmi.
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
              <CheckCircle2 className="w-3 h-3" /> Tüm slotlar planlandı
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
              <TrendingUp className="w-3 h-3" /> +%18 geçen aya göre
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl flex items-start justify-between hover:border-purple-500/40 transition-all group">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Haftalık Ciro</p>
            <h3 className="text-3xl font-black text-white mt-2">₺62.000</h3>
            <p className="text-[11px] text-purple-400 mt-1 font-semibold">İyzico & Yerinde tahsilat</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/30 text-purple-400 flex items-center justify-center group-hover:scale-105 transition-transform">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl flex items-start justify-between hover:border-amber-500/40 transition-all group">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Onay Bekleyenler</p>
            <h3 className="text-3xl font-black text-white mt-2">{pendingCount}</h3>
            <p className="text-[11px] text-amber-400 mt-1 font-semibold flex items-center gap-1">
              <Clock className="w-3 h-3" /> Hızlı onay gerektirir
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-600/20 border border-amber-500/30 text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Analytics Chart & Quick Actions Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue Graph */}
        <div className="lg:col-span-2 bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-white">Haftalık Gelir ve Seans Hacmi</h3>
              <p className="text-xs text-slate-400">Son 7 günün randevu adet ve tahsilat performansı</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-bold">
              Canlı Grafiği
            </span>
          </div>
          <div className="h-[280px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorGelirDash" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  formatter={(val: any) => [`₺${val.toLocaleString()}`, "Hasılat"]}
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "1rem",
                    color: "#ffffff",
                    fontSize: "12px",
                    fontWeight: "bold",
                  }}
                />
                <Area type="monotone" dataKey="gelir" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorGelirDash)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions / Link Card */}
        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <h3 className="font-bold text-base text-white">Hızlı Araçlar</h3>
            <p className="text-xs text-slate-400 mt-0.5">Sık kullanılan klinik modülleri</p>

            <div className="space-y-2.5 mt-4">
              <Link
                href="/calendar"
                className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-xs font-semibold text-slate-200"
              >
                <span className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-indigo-400" />
                  Randevu Takvimini Aç
                </span>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </Link>

              <Link
                href="/forms"
                className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-xs font-semibold text-slate-200"
              >
                <span className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-purple-400" />
                  Özel Form Alanlarını Düzenle
                </span>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </Link>

              <Link
                href="/qr-stand"
                className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-xs font-semibold text-slate-200"
              >
                <span className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  QR Masa Standı Yazdır
                </span>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </Link>

              <button
                type="button"
                onClick={() => showToast("Google & Outlook takvimleri başarıyla eşitlendi!")}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-xs font-semibold text-slate-200"
              >
                <span className="flex items-center gap-2.5">
                  <RefreshCw className="w-4 h-4 text-emerald-400" />
                  Takvimleri Şimdi Senkronize Et
                </span>
                <span className="text-emerald-400 text-[11px] font-bold">Eşitle</span>
              </button>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/70 to-purple-950/50 border border-indigo-500/30">
            <p className="text-xs font-bold text-white mb-1.5">Danışan Rezervasyon Linkiniz:</p>
            <div className="flex items-center justify-between bg-black/40 p-2.5 rounded-xl border border-white/10">
              <span className="text-[11px] text-indigo-300 font-mono truncate mr-2">randevuformu.com/dr-ahmet</span>
              <a
                href="/ornek/dr-ahmet"
                target="_blank"
                className="p-1 text-slate-400 hover:text-white transition-colors"
                title="Yeni sekmede aç"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Appointments Management Section with Responsive Table & Mobile Cards */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-xl overflow-hidden space-y-4 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h3 className="font-extrabold text-lg text-white">Randevu Listesi</h3>
            <p className="text-xs text-slate-400">Danışan rezervasyonlarını yönetin, onaylayın veya güncelleyin.</p>
          </div>

          {/* Search and Filter Pills */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Danışan veya hizmet ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48 sm:w-60"
              />
            </div>

            <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700">
              {["all", "confirmed", "pending"].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setFilterStatus(status)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    filterStatus === status
                      ? "bg-indigo-600 text-white shadow-md"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {status === "all" ? "Tümü" : status === "confirmed" ? "Onaylı" : "Bekleyen"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile View: Cards Layout */}
        <div className="block lg:hidden space-y-3">
          {filteredAppointments.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              Arama kriterine uygun randevu bulunamadı.
            </div>
          ) : (
            filteredAppointments.map((app) => (
              <div
                key={app.id}
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-indigo-600/30 text-indigo-300 font-bold flex items-center justify-center text-xs">
                      {app.customer_name?.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-white">{app.customer_name}</div>
                      <div className="text-[11px] text-slate-400">{app.customer_phone}</div>
                    </div>
                  </div>
                  {app.status === "confirmed" ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-800">
                      <CheckCircle2 className="w-3 h-3" /> Onaylandı
                    </span>
                  ) : app.status === "pending" ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/60 text-amber-400 border border-amber-800 animate-pulse">
                      <Clock className="w-3 h-3" /> Beklemede
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-950/60 text-red-400 border border-red-800">
                      <XCircle className="w-3 h-3" /> İptal
                    </span>
                  )}
                </div>

                <div className="flex justify-between text-xs pt-1 border-t border-slate-900">
                  <span className="text-slate-400">Hizmet:</span>
                  <span className="font-semibold text-slate-200">{app.services?.name || "Ön Muayene"}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Tarih & Saat:</span>
                  <span className="font-bold text-indigo-400">{app.appointment_date} {app.appointment_time?.slice(0, 5)}</span>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-900">
                  {app.status !== "confirmed" && (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(app.id, "confirmed")}
                      className="px-3 py-1.5 bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600 hover:text-white rounded-lg border border-emerald-500/30 text-xs font-semibold"
                    >
                      Onayla
                    </button>
                  )}
                  {app.status !== "cancelled" && (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(app.id, "cancelled")}
                      className="px-3 py-1.5 bg-red-600/20 text-red-300 hover:bg-red-600 hover:text-white rounded-lg border border-red-500/30 text-xs font-semibold"
                    >
                      İptal Et
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop View: Full Data Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="uppercase bg-slate-950/60 text-slate-400 font-bold border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Danışan Adı</th>
                <th className="px-5 py-3.5">Hizmet</th>
                <th className="px-5 py-3.5">Tarih & Saat</th>
                <th className="px-5 py-3.5">Telefon</th>
                <th className="px-5 py-3.5">Durum</th>
                <th className="px-5 py-3.5 text-right">Aksiyonlar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-500">
                    Arama kriterine uygun randevu bulunamadı.
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-4 font-bold text-white">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-indigo-600/30 text-indigo-300 font-bold flex items-center justify-center text-xs">
                          {app.customer_name?.charAt(0)}
                        </div>
                        <div>
                          <div>{app.customer_name}</div>
                          {app.customer_note && (
                            <div className="text-[10px] text-slate-400 truncate max-w-xs">{app.customer_note}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-medium text-slate-200">
                      <div>{app.services?.name || "Ön Muayene"}</div>
                      <div className="text-[10px] text-emerald-400">{app.services?.price_text || "Ücretsiz"}</div>
                    </td>
                    <td className="px-5 py-4 font-semibold text-indigo-300">
                      <div>{app.appointment_date}</div>
                      <div className="text-slate-400 text-[11px]">{app.appointment_time?.slice(0, 5)}</div>
                    </td>
                    <td className="px-5 py-4 text-slate-400 font-mono">{app.customer_phone}</td>
                    <td className="px-5 py-4">
                      {app.status === "confirmed" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-800">
                          <CheckCircle2 className="w-3 h-3" /> Onaylandı
                        </span>
                      ) : app.status === "pending" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-950/60 text-amber-400 border border-amber-800">
                          <Clock className="w-3 h-3" /> Beklemede
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-950/60 text-red-400 border border-red-800">
                          <XCircle className="w-3 h-3" /> İptal
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right space-x-2">
                      {app.status !== "confirmed" && (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(app.id, "confirmed")}
                          className="px-2.5 py-1 bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600 hover:text-white rounded-lg border border-emerald-500/30 text-[11px] font-semibold transition-colors"
                        >
                          Onayla
                        </button>
                      )}
                      {app.status !== "cancelled" && (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(app.id, "cancelled")}
                          className="px-2.5 py-1 bg-red-600/20 text-red-300 hover:bg-red-600 hover:text-white rounded-lg border border-red-500/30 text-[11px] font-semibold transition-colors"
                        >
                          İptal Et
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Appointment Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl text-white space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="font-bold text-base text-white">Manuel Randevu Ekle</h3>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddNewAppointment} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Danışan Ad Soyad *</label>
                  <input
                    type="text"
                    required
                    value={newCustomerName}
                    onChange={(e) => setNewCustomerName(e.target.value)}
                    placeholder="Ad Soyad"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Telefon Numarası *</label>
                  <input
                    type="tel"
                    required
                    value={newCustomerPhone}
                    onChange={(e) => setNewCustomerPhone(e.target.value)}
                    placeholder="05XX XXX XX XX"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Hizmet Seçimi</label>
                  <select
                    value={newServiceName}
                    onChange={(e) => setNewServiceName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="İmplant Konsültasyonu">İmplant Konsültasyonu (30 dk)</option>
                    <option value="Lazerli Diş Beyazlatma">Lazerli Diş Beyazlatma (60 dk)</option>
                    <option value="Estetik Gülüş Tasarımı">Estetik Gülüş Tasarımı (45 dk)</option>
                    <option value="Kanal Tedavisi & Dolgu">Kanal Tedavisi & Dolgu (60 dk)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Saat</label>
                  <input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="pt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30"
                  >
                    Randevuyu Kaydet
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
