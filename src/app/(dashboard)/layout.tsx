"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Settings,
  LogOut,
  Bell,
  Menu,
  X,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  CalendarDays,
  ShieldCheck,
  User,
  CreditCard,
  Trash2,
  FileText,
  Mail,
  Sparkles,
  QrCode,
  BookOpen,
  HeartPulse,
  Package,
  RotateCcw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: "booking" | "cancel" | "payment" | "system";
  unread: boolean;
}

const initialNotifications: NotificationItem[] = [
  {
    id: "n1",
    title: "Yeni Randevu Alındı",
    message: "Caner Öztürk - İmplant Konsültasyonu (Bugün 14:30)",
    time: "5 dk önce",
    type: "booking",
    unread: true,
  },
  {
    id: "n2",
    title: "Online Ödeme Başarılı",
    message: "₺3.000 tutarındaki Lazerli Beyazlatma ödemesi onaylandı.",
    time: "1 saat önce",
    type: "payment",
    unread: true,
  },
  {
    id: "n3",
    title: "WhatsApp Hatırlatması İletildi",
    message: "Burcu Çelik randevusu için otomatik SMS/WhatsApp gönderildi.",
    time: "2 saat önce",
    type: "system",
    unread: false,
  },
  {
    id: "n4",
    title: "Google Calendar Senkronizasyonu",
    message: "2 yeni randevu Google Takviminiz ile senkronize edildi.",
    time: "Dün",
    type: "system",
    unread: false,
  },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [tenantName, setTenantName] = useState("By Erman Hair Studio");
  const [tenantSlug, setTenantSlug] = useState("byerman");

  useEffect(() => {
    try {
      const storedSlug = localStorage.getItem("rf_tenant_slug") || localStorage.getItem("rf_tenant");
      const storedName = localStorage.getItem("rf_tenant_name");
      if (storedSlug) setTenantSlug(storedSlug);
      if (storedName) setTenantName(storedName);
    } catch {}
  }, []);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, unread: false })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      // ignore
    }
    document.cookie = "rf_session=; path=/; max-age=0;";
    document.cookie = "demo_session=; path=/; max-age=0;";
    router.push("/login");
  };

  const navItems = [
    { name: "Özet Gösterge", href: "/dashboard", icon: LayoutDashboard },
    { name: "Randevu Takvimi", href: "/calendar", icon: Calendar },
    { name: "Danışan CRM", href: "/clients", icon: HeartPulse },
    { name: "Paketler & Fatura", href: "/packages", icon: Package },
    { name: "Müşteri Hatırlatma", href: "/retention", icon: RotateCcw },
    { name: "Ekip & Uzmanlar", href: "/staff", icon: Users },
    { name: "Form Oluşturucu", href: "/forms", icon: FileText },
    { name: "QR Stand & Widget", href: "/qr-stand", icon: QrCode },
    { name: "Blog & SEO Rehberi", href: "/blog", icon: BookOpen },
    { name: "İşletme Ayarları", href: "/settings", icon: Settings },
    { name: "B2B İletişim", href: "/contact", icon: Mail },
  ];

  return (
    <div className="min-h-screen bg-[#070B12] text-slate-100 flex overflow-hidden font-sans">
      {/* Mobile Drawer Backdrop */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar (Desktop & Mobile Responsive Drawer) */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isMobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-800">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-transform">
              <CalendarDays className="w-5 h-5" />
            </div>
            <span className="text-white font-black text-lg tracking-tight">
              randevuformu<span className="text-indigo-400">.com</span>
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 flex-1 overflow-y-auto space-y-6">
          <div>
            <p className="px-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Yönetim Merkezi
            </p>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/40"
                        : "text-slate-400 hover:bg-slate-800/80 hover:text-white"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="pt-4 border-t border-slate-800 space-y-2">
            <p className="px-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Hızlı Canlı Önizleme
            </p>
            <Link
              href={`/${tenantSlug}`}
              target="_blank"
              className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold text-indigo-300 bg-indigo-950/40 border border-indigo-800/50 hover:bg-indigo-900/40 transition-colors"
            >
              <span>randevuformu.com/{tenantSlug}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <Link
              href="/admin/login"
              className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold text-red-300 bg-red-950/30 border border-red-800/40 hover:bg-red-900/40 transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-red-400" />
                Super Admin Gate
              </span>
              <span className="text-[10px] bg-red-500/20 px-1.5 py-0.5 rounded font-bold">musa</span>
            </Link>
          </div>
        </div>

        {/* Support & Logout footer */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <a
            href="mailto:randevuformuu@gmail.com"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] text-slate-400 hover:text-indigo-300 hover:bg-slate-800/60 transition-colors"
          >
            <Mail className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="truncate">randevuformuu@gmail.com</span>
          </a>

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2.5 px-3 py-2 w-full rounded-xl text-left hover:bg-red-950/30 hover:text-red-400 transition-all text-slate-400 text-xs font-bold"
          >
            <LogOut className="w-4 h-4 text-red-400" />
            <span>Çıkış Yap</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-4 sm:px-8 z-30 relative">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setIsMobileOpen(true)}
              className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                Hoş Geldiniz 👋
              </h1>
              <p className="text-xs text-slate-400 hidden sm:block">randevuformu.com Yönetim Merkezi</p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 relative">
            {/* Quick Live Preview Link */}
            <Link
              href="/ornek/dr-ahmet"
              target="_blank"
              className="hidden lg:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
              <span>Canlı Sayfamı Aç</span>
            </Link>

            {/* Notification Bell with Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowProfileMenu(false);
                }}
                className="relative p-2.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-2xl transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-indigo-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-slate-900 animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Interactive Notifications Popover */}
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden z-50"
                  >
                    <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-white">Bildirimler</h3>
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-500/20 text-indigo-300 rounded-full">
                          {unreadCount} yeni
                        </span>
                      </div>
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={markAllAsRead}
                          className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300"
                        >
                          Tümünü Okundu Say
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-xs text-slate-500">
                          Hiç bildiriminiz bulunmuyor.
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            className={`p-3.5 hover:bg-slate-800/50 transition-colors flex items-start justify-between gap-3 ${
                              n.unread ? "bg-indigo-950/20" : ""
                            }`}
                          >
                            <div className="flex items-start gap-2.5">
                              <div className="mt-0.5">
                                {n.type === "booking" ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                ) : n.type === "payment" ? (
                                  <CreditCard className="w-4 h-4 text-indigo-400" />
                                ) : (
                                  <Bell className="w-4 h-4 text-amber-400" />
                                )}
                              </div>
                              <div>
                                <div className="font-semibold text-xs text-white">{n.title}</div>
                                <div className="text-[11px] text-slate-400 mt-0.5">{n.message}</div>
                                <div className="text-[10px] text-slate-500 mt-1">{n.time}</div>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => deleteNotification(n.id)}
                              className="text-slate-500 hover:text-red-400 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="p-3 bg-slate-950/60 text-center border-t border-slate-800">
                      <Link
                        href="/calendar"
                        onClick={() => setShowNotifications(false)}
                        className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                      >
                        Randevu Takvimine Git →
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Avatar with Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowProfileMenu(!showProfileMenu);
                  setShowNotifications(false);
                }}
                className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-black text-xs flex items-center justify-center border border-indigo-400/40 shadow-lg shadow-indigo-600/25 hover:scale-105 transition-transform uppercase"
              >
                {tenantName ? tenantName.slice(0, 2) : "BE"}
              </button>

              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-60 bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-2 z-50"
                  >
                    <div className="p-3 border-b border-slate-800">
                      <p className="font-bold text-xs text-white">{tenantName}</p>
                      <p className="text-[11px] text-slate-400">/{tenantSlug}</p>
                      <span className="inline-block mt-1.5 px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30">
                        Canlı İşletme Hesabı
                      </span>
                    </div>

                    <div className="py-1 space-y-0.5">
                      <Link
                        href="/settings"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                      >
                        <User className="w-4 h-4 text-indigo-400" />
                        İşletme Ayarları
                      </Link>
                      <Link
                        href="/staff"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                      >
                        <Users className="w-4 h-4 text-emerald-400" />
                        Ekip Yönetimi
                      </Link>
                      <Link
                        href="/admin/login"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4 text-red-400" />
                        Super Admin Girişi
                      </Link>
                      <Link
                        href="/ornek/dr-ahmet"
                        target="_blank"
                        className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                      >
                        <span className="flex items-center gap-2.5">
                          <CalendarDays className="w-4 h-4 text-indigo-400" />
                          Canlı Randevu Sayfam
                        </span>
                        <ExternalLink className="w-3 h-3 text-slate-500" />
                      </Link>
                    </div>

                    <div className="pt-1 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-950/40 rounded-xl transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Çıkış Yap
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#070B12] text-slate-100">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
