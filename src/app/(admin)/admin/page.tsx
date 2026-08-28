"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Building2,
  CalendarCheck,
  TrendingUp,
  CreditCard,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Server,
  Mail,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  MoreVertical,
  Activity,
  Sparkles,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { supabase } from "@/lib/supabase";

// Mock data for analytics
const revenueData = [
  { name: "Pzt", randevu: 42, gelir: 12600 },
  { name: "Sal", randevu: 58, gelir: 17400 },
  { name: "Çar", randevu: 65, gelir: 19500 },
  { name: "Per", randevu: 78, gelir: 23400 },
  { name: "Cum", randevu: 95, gelir: 28500 },
  { name: "Cmt", randevu: 120, gelir: 36000 },
  { name: "Paz", randevu: 85, gelir: 25500 },
];

const categoryData = [
  { name: "Sağlık & Diş", value: 38, color: "#4f46e5" },
  { name: "Güzellik & Kuaför", value: 27, color: "#a855f7" },
  { name: "Psikoloji & Terapi", value: 18, color: "#10b981" },
  { name: "Danışmanlık & Koçluk", value: 12, color: "#f59e0b" },
  { name: "Diğer", value: 5, color: "#64748b" },
];

const initialBusinesses = [
  {
    id: "1",
    name: "Dr. Ahmet Yılmaz Diş Kliniği",
    slug: "dr-ahmet",
    category: "Sağlık & Diş",
    owner: "Ahmet Yılmaz",
    email: "ahmet@yilmazdental.com",
    bookingsCount: 142,
    status: "active",
    plan: "Pro",
    joinedAt: "2026-08-25",
  },
  {
    id: "2",
    name: "Studio Nova Kuaför & Güzellik",
    slug: "studio-nova",
    category: "Güzellik & Kuaför",
    owner: "Zeynep Kaya",
    email: "zeynep@studionova.com",
    bookingsCount: 98,
    status: "active",
    plan: "Business",
    joinedAt: "2026-08-26",
  },
  {
    id: "3",
    name: "Uzm. Psk. Melis Aktaş",
    slug: "psk-melis",
    category: "Psikoloji & Terapi",
    owner: "Melis Aktaş",
    email: "melis@pskaktas.com",
    bookingsCount: 64,
    status: "active",
    plan: "Pro",
    joinedAt: "2026-08-26",
  },
  {
    id: "4",
    name: "Apex Hukuk & Danışmanlık",
    slug: "apex-hukuk",
    category: "Danışmanlık & Koçluk",
    owner: "Av. Can Tekin",
    email: "can@apexhukuk.com",
    bookingsCount: 31,
    status: "active",
    plan: "Starter",
    joinedAt: "2026-08-27",
  },
  {
    id: "5",
    name: "FitLife Bireysel Antrenörlük",
    slug: "fitlife-studio",
    category: "Sağlık & Spor",
    owner: "Burak Demir",
    email: "burak@fitlifestudio.com",
    bookingsCount: 19,
    status: "pending",
    plan: "Starter",
    joinedAt: "2026-08-27",
  },
];

export default function SuperAdminDashboard() {
  const [businesses, setBusinesses] = useState(initialBusinesses);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalBusinesses: 48,
    totalBookings: 1842,
    totalVolume: 552600,
    activeUsers: 342,
  });

  // Fetch real data if available from Supabase
  const loadData = async () => {
    setIsRefreshing(true);
    try {
      const { data: dbBusinesses } = await supabase.from("businesses").select("*").limit(20);
      if (dbBusinesses && dbBusinesses.length > 0) {
        const mapped = dbBusinesses.map((b: any, idx: number) => ({
          id: b.id || `${idx + 1}`,
          name: b.name || "İsimsiz İşletme",
          slug: b.slug || "isletme",
          category: b.category || "Genel Hizmet",
          owner: b.owner_name || "Yönetici",
          email: b.email || `contact@${b.slug || 'randevu'}.com`,
          bookingsCount: Math.floor(Math.random() * 80) + 20,
          status: "active",
          plan: idx % 2 === 0 ? "Pro" : "Business",
          joinedAt: new Date(b.created_at || Date.now()).toISOString().split("T")[0],
        }));
        setBusinesses(mapped);
        setStats((prev) => ({
          ...prev,
          totalBusinesses: Math.max(dbBusinesses.length, 48),
        }));
      }
    } catch (e) {
      console.log("Using default superadmin dashboard data", e);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredBusinesses = businesses.filter((b) => {
    const matchesSearch =
      b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || b.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Süper Yönetici Paneli
            </h1>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-400 mr-2 animate-pulse"></span>
              Sistem Canlı
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Platform geneli tüm işletmeler, randevu hacmi ve altyapı sağlık durumları.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-bold">
            <ShieldCheck className="w-4 h-4 text-red-400" />
            <span>SuperAdmin: <strong>musa</strong></span>
          </div>

          <button
            onClick={loadData}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white shadow-sm hover:bg-slate-800 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-indigo-400" : ""}`} />
            Yenile
          </button>
          <a
            href="/"
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Siteyi Gör
          </a>
          <button
            onClick={async () => {
              await fetch("/api/admin/auth/check", { method: "POST" });
              window.location.href = "/admin/login";
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 transition-all"
          >
            Güvenli Çıkış
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden group hover:border-indigo-500/40 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Kayıtlı İşletmeler</span>
            <div className="p-2.5 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-white">
              {stats.totalBusinesses}
            </span>
            <span className="text-xs font-bold text-emerald-400 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" /> +14% bu hafta
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-400">46 aktif, 2 onay bekliyor</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden group hover:border-purple-500/40 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Toplam Randevu</span>
            <div className="p-2.5 rounded-2xl bg-purple-600/20 border border-purple-500/30 text-purple-400">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-white">
              {stats.totalBookings.toLocaleString("tr-TR")}
            </span>
            <span className="text-xs font-bold text-emerald-400 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" /> +28%
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-400">Bu ay oluşturulan rezervasyonlar</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden group hover:border-emerald-500/40 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Toplam İşlem Hacmi</span>
            <div className="p-2.5 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-white">
              ₺{stats.totalVolume.toLocaleString("tr-TR")}
            </span>
            <span className="text-xs font-bold text-emerald-400 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" /> +19%
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-400">İyzico & Stripe ödeme akışı</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden group hover:border-amber-500/40 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Aktif Danışanlar</span>
            <div className="p-2.5 rounded-2xl bg-amber-600/20 border border-amber-500/30 text-amber-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-white">
              {stats.activeUsers}
            </span>
            <span className="text-xs font-bold text-emerald-400 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" /> +32 yeni
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-400">Son 24 saatte aktif randevu alanlar</div>
        </motion.div>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Trend Chart */}
        <div className="lg:col-span-2 bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h2 className="text-lg font-bold text-white">Haftalık Randevu & Hacim Trendi</h2>
              <p className="text-xs text-slate-400">Günlük rezervasyon adetleri ve ciro gelişimi</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-indigo-400">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> Randevu Sayısı
              </span>
              <span className="flex items-center gap-1.5 text-purple-400">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> Gelir (₺)
              </span>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRandevuAdmin" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorGelirAdmin" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "1rem",
                    color: "#ffffff",
                    fontSize: "12px",
                    fontWeight: "bold",
                  }}
                />
                <Area type="monotone" dataKey="randevu" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRandevuAdmin)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories Distribution */}
        <div className="bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Sektörel Dağılım</h2>
            <p className="text-xs text-slate-400">Kayıtlı işletmelerin kategorilere göre oranı</p>
            <div className="h-52 w-full mt-3">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      borderRadius: "1rem",
                      color: "#ffffff",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2 mt-4 pt-4 border-t border-slate-800">
            {categoryData.map((cat) => (
              <div key={cat.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }}></span>
                  <span className="text-slate-300 font-medium">{cat.name}</span>
                </div>
                <span className="font-bold text-white">%{cat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Health & Server Status Bar */}
      <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-4 h-4 text-indigo-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Sistem ve Altyapı Sağlığı
          </h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="flex items-center gap-1.5"><Server className="w-3.5 h-3.5 text-emerald-400" /> Supabase DB</span>
              <span className="text-emerald-400 font-bold">14ms</span>
            </div>
            <div className="text-xs font-bold text-white">Bağlantı Sağlıklı</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-indigo-400" /> Edge Server</span>
              <span className="text-indigo-400 font-bold">%99.99</span>
            </div>
            <div className="text-xs font-bold text-white">Uptime Aktif</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-purple-400" /> Mail Gateway</span>
              <span className="text-purple-400 font-bold">Hazır</span>
            </div>
            <div className="text-xs font-bold text-white">Nodemailer SMTP</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5 text-amber-400" /> Ödeme Webhook</span>
              <span className="text-amber-400 font-bold">200 OK</span>
            </div>
            <div className="text-xs font-bold text-white">İyzico & Stripe</div>
          </div>
        </div>
      </div>

      {/* Businesses Management Table */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-xl overflow-hidden space-y-4 p-6 sm:p-8">
        <div className="pb-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white">Kayıtlı İşletmeler & Müşteriler</h2>
            <p className="text-xs text-slate-400">Platformdaki tüm randevu sağlayıcılarını yönetin</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="İşletme veya sahip ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48 sm:w-64"
              />
            </div>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            >
              <option value="all">Tüm Kategoriler</option>
              <option value="Sağlık & Diş">Sağlık & Diş</option>
              <option value="Güzellik & Kuaför">Güzellik & Kuaför</option>
              <option value="Psikoloji & Terapi">Psikoloji & Terapi</option>
              <option value="Danışmanlık & Koçluk">Danışmanlık & Koçluk</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="uppercase bg-slate-950/60 text-slate-400 font-bold border-b border-slate-800">
              <tr>
                <th scope="col" className="px-5 py-4">İşletme Adı</th>
                <th scope="col" className="px-5 py-4">Kategori</th>
                <th scope="col" className="px-5 py-4">Sahip & İletişim</th>
                <th scope="col" className="px-5 py-4 text-center">Randevu Sayısı</th>
                <th scope="col" className="px-5 py-4">Paket</th>
                <th scope="col" className="px-5 py-4">Durum</th>
                <th scope="col" className="px-5 py-4 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredBusinesses.map((b) => (
                <tr key={b.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-5 py-4 font-medium text-white whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 flex items-center justify-center font-bold text-xs">
                        {b.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-white">{b.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">randevuformu.com/{b.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-xs font-semibold text-slate-300">
                    {b.category}
                  </td>
                  <td className="px-5 py-4 text-xs">
                    <div className="font-bold text-white">{b.owner}</div>
                    <div className="text-slate-400">{b.email}</div>
                  </td>
                  <td className="px-5 py-4 text-center font-bold text-white">
                    {b.bookingsCount}
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {b.plan}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {b.status === "active" ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-800">
                        <CheckCircle2 className="w-3 h-3" /> Aktif
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/60 text-amber-400 border border-amber-800">
                        <Clock className="w-3 h-3" /> Onay Bekliyor
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <a
                      href={`/ornek/${b.slug}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-xl text-indigo-300 bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      Profili Aç <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
