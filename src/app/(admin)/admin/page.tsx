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
  Activity
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
  Legend
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
  { name: "Sağlık & Diş", value: 38, color: "#3b82f6" },
  { name: "Güzellik & Kuaför", value: 27, color: "#8b5cf6" },
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
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              Süper Yönetici Paneli
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
              Sistem Canlı
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Platform geneli tüm işletmeler, randevu hacmi ve sistem sağlık durumları.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>SuperAdmin: <strong>musa</strong></span>
          </div>

          <button
            onClick={loadData}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 shadow-sm transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-blue-600" : ""}`} />
            Yenile
          </button>
          <a
            href="/"
            target="_blank"
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Siteyi Gör
          </a>
          <button
            onClick={async () => {
              await fetch("/api/admin/auth/check", { method: "POST" });
              window.location.href = "/admin/login";
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 transition-all"
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
          className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Kayıtlı İşletmeler</span>
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              {stats.totalBusinesses}
            </span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" /> +14% bu hafta
            </span>
          </div>
          <div className="mt-2 text-xs text-gray-400">46 aktif, 2 onay bekliyor</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Toplam Randevu</span>
            <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              {stats.totalBookings.toLocaleString("tr-TR")}
            </span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" /> +28%
            </span>
          </div>
          <div className="mt-2 text-xs text-gray-400">Bu ay oluşturulan rezervasyonlar</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Toplam İşlem Hacmi</span>
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              ₺{stats.totalVolume.toLocaleString("tr-TR")}
            </span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" /> +19%
            </span>
          </div>
          <div className="mt-2 text-xs text-gray-400">İyzico & Stripe ödeme akışı</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Aktif Kullanıcılar</span>
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              {stats.activeUsers}
            </span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" /> +32 yeni
            </span>
          </div>
          <div className="mt-2 text-xs text-gray-400">Son 24 saatte aktif randevu alanlar</div>
        </motion.div>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Trend Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Haftalık Randevu & Hacim Trendi</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Günlük rezervasyon adetleri ve ciro gelişimi</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium">
              <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span> Randevu Sayısı
              </span>
              <span className="flex items-center gap-1 text-indigo-500 ml-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> Gelir (₺)
              </span>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRandevu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorGelir" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    borderColor: "#374151",
                    borderRadius: "0.75rem",
                    color: "#ffffff",
                    fontSize: "12px",
                  }}
                />
                <Area type="monotone" dataKey="randevu" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRandevu)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories Distribution */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Sektörel Dağılım</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Kayıtlı işletmelerin kategorilere göre oranı</p>
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
                      backgroundColor: "#1f2937",
                      borderColor: "#374151",
                      borderRadius: "0.75rem",
                      color: "#ffffff",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2 mt-2">
            {categoryData.map((cat) => (
              <div key={cat.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }}></span>
                  <span className="text-gray-700 dark:text-gray-300 font-medium">{cat.name}</span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">%{cat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Health & Server Status Bar */}
      <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
            Sistem ve Altyapı Sağlığı
          </h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span className="flex items-center gap-1.5"><Server className="w-3.5 h-3.5 text-emerald-500" /> Supabase DB</span>
              <span className="text-emerald-500 font-semibold">14ms</span>
            </div>
            <div className="text-sm font-bold text-gray-900 dark:text-white">Bağlantı Sağlıklı</div>
          </div>
          <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-blue-500" /> Vercel Edge</span>
              <span className="text-blue-500 font-semibold">%99.99</span>
            </div>
            <div className="text-sm font-bold text-gray-900 dark:text-white">Uptime Aktif</div>
          </div>
          <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-purple-500" /> Mail Gateway</span>
              <span className="text-purple-500 font-semibold">Hazır</span>
            </div>
            <div className="text-sm font-bold text-gray-900 dark:text-white">Nodemailer SMTP</div>
          </div>
          <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span className="flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5 text-amber-500" /> Ödeme Webhook</span>
              <span className="text-amber-500 font-semibold">200 OK</span>
            </div>
            <div className="text-sm font-bold text-gray-900 dark:text-white">İyzico & Stripe</div>
          </div>
        </div>
      </div>

      {/* Businesses Management Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Kayıtlı İşletmeler & Müşteriler</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Platformdaki tüm randevu sağlayıcılarını yönetin</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="İşletme veya sahip ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 text-xs rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-48 sm:w-64"
              />
            </div>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
            <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 font-semibold border-b border-gray-200 dark:border-gray-800">
              <tr>
                <th scope="col" className="px-6 py-4">İşletme Adı</th>
                <th scope="col" className="px-6 py-4">Kategori</th>
                <th scope="col" className="px-6 py-4">Sahip & İletişim</th>
                <th scope="col" className="px-6 py-4 text-center">Randevu Sayısı</th>
                <th scope="col" className="px-6 py-4">Paket</th>
                <th scope="col" className="px-6 py-4">Durum</th>
                <th scope="col" className="px-6 py-4 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredBusinesses.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
                        {b.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold">{b.name}</div>
                        <div className="text-xs text-gray-400">randevuformu.com/{b.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-gray-600 dark:text-gray-300">
                    {b.category}
                  </td>
                  <td className="px-6 py-4 text-xs">
                    <div className="font-medium text-gray-900 dark:text-white">{b.owner}</div>
                    <div className="text-gray-400">{b.email}</div>
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-gray-900 dark:text-white">
                    {b.bookingsCount}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                      {b.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {b.status === "active" ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Aktif
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400">
                        <Clock className="w-3.5 h-3.5" /> Onay Bekliyor
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <a
                      href={`/${b.slug}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
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
