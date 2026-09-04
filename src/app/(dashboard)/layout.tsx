"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import ChatbotWidget from "@/components/ChatbotWidget";
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
  QrCode,
  BookOpen,
  HeartPulse,
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

const initialNotifications: NotificationItem[] = [];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [tenantName, setTenantName] = useState("İşletme Yönetim Paneli");
  const [tenantSlug, setTenantSlug] = useState("dashboard");

  useEffect(() => {
    const updateTenantInfo = () => {
      try {
        const isByErmanHost = typeof window !== "undefined" && window.location.hostname.includes("byerman");
        const currentUser = typeof window !== "undefined" ? localStorage.getItem("rf_user") : null;
        const currentTenant = typeof window !== "undefined" ? localStorage.getItem("rf_tenant") : null;

        const isByErman = isByErmanHost || (currentUser === "byerman" && currentTenant === "byerman");

        if (isByErman) {
          setTenantSlug("byerman");
          setTenantName("By Erman Hair Studio");
        } else {
          const storedName = localStorage.getItem("rf_tenant_name");
          const storedSlug = localStorage.getItem("rf_tenant_slug") || currentTenant;
          setTenantName(storedName && storedName !== "By Erman Hair Studio" ? storedName : "İşletme Yönetim Paneli");
          setTenantSlug(storedSlug && storedSlug !== "byerman" ? storedSlug : "dashboard");
        }
      } catch {}
    };

    updateTenantInfo();
    window.addEventListener("storage", updateTenantInfo);
    return () => window.removeEventListener("storage", updateTenantInfo);
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
    } catch {}
    const isProd = typeof window !== "undefined" && window.location.protocol === "https:";
    const domainStr = typeof window !== "undefined" && window.location.hostname.includes("randevuformu.com") ? "; domain=.randevuformu.com" : "";
    const secureStr = isProd ? "; Secure" : "";

    document.cookie = `rf_session=; path=/; max-age=0; SameSite=Lax${domainStr}${secureStr}`;
    document.cookie = `demo_session=; path=/; max-age=0; SameSite=Lax${domainStr}${secureStr}`;
    document.cookie = `rf_user=; path=/; max-age=0; SameSite=Lax${domainStr}${secureStr}`;
    document.cookie = `rf_tenant=; path=/; max-age=0; SameSite=Lax${domainStr}${secureStr}`;
    document.cookie = `rf_session=; path=/; max-age=0;`;
    document.cookie = `demo_session=; path=/; max-age=0;`;
    document.cookie = `rf_user=; path=/; max-age=0;`;
    document.cookie = `rf_tenant=; path=/; max-age=0;`;

    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {}

    window.location.href = "/login";
  };

  const navItems = [
    { name: "Özet Gösterge", href: "/dashboard", icon: LayoutDashboard },
    { name: "Randevu Takvimi", href: "/calendar", icon: Calendar },
    { name: "Ekip & Uzmanlar", href: "/staff", icon: Users },
    { name: "QR Stand & Widget", href: "/qr-stand", icon: QrCode },
    { name: "Blog & SEO Rehberi", href: "/blog", icon: BookOpen },
    { name: "İşletme Ayarları", href: "/settings", icon: Settings },
    { name: "B2B İletişim", href: "/contact", icon: Mail },
  ];

  return (
    <div className="min-h-screen bg-[#FAFBFC] text-[#0F172A] flex overflow-hidden font-sans antialiased">
      {/* Mobile Drawer Backdrop */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar (Desktop & Mobile Responsive Drawer) — Clean Enterprise White */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200/80 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isMobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
          <Link href="/" className="flex items-center gap-2.5 group">
            <img
              src="/logo.png"
              alt="randevuformu.com"
              className="h-7 w-auto transition-transform group-hover:scale-105"
              width={28}
              height={28}
            />
            <span className="text-[#0F2A4A] font-bold text-[15px] tracking-tight">
              randevuformu<span className="text-slate-400 font-normal">.com</span>
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 flex-1 overflow-y-auto space-y-6">
          <div>
            <p className="px-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Yönetim Merkezi
            </p>
            <nav className="space-y-0.5">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                      isActive
                        ? "bg-[#0062FF]/[0.08] text-[#0062FF] font-semibold border-l-2 border-[#0062FF]"
                        : "text-slate-600 hover:bg-slate-50 hover:text-[#0F2A4A]"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? "text-[#0062FF]" : "text-slate-400"}`} strokeWidth={1.75} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-2">
            <p className="px-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Hızlı Canlı Önizleme
            </p>
            <Link
              href={`/${tenantSlug}`}
              target="_blank"
              className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-[#0062FF] bg-[#0062FF]/[0.05] border border-[#0062FF]/15 hover:bg-[#0062FF]/10 transition-colors"
            >
              <span className="truncate">{tenantSlug === "byerman" ? "byerman.randevuformu.com" : `/${tenantSlug}`}</span>
              <ExternalLink className="w-3.5 h-3.5 shrink-0 ml-1" />
            </Link>
          </div>
        </div>

        {/* Support & Logout footer */}
        <div className="p-4 border-t border-slate-100 space-y-1">
          <a
            href="mailto:destek@randevuformu.com"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] text-slate-500 hover:text-[#0F2A4A] hover:bg-slate-50 transition-colors"
          >
            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">destek@randevuformu.com</span>
          </a>

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 w-full rounded-lg text-left text-slate-500 hover:text-rose-600 hover:bg-rose-50 text-xs font-medium transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-rose-500" />
            <span>Çıkış Yap</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header — Clean Enterprise White */}
        <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between px-4 sm:px-8 z-30 relative">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileOpen(true)}
              className="md:hidden p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-[#0F2A4A] flex items-center gap-2">
                Hoş Geldiniz 👋
              </h1>
              <p className="text-[11px] text-slate-400 hidden sm:block">randevuformu.com Yönetim Merkezi</p>
            </div>
          </div>

          <div className="flex items-center gap-3 relative">
            {/* Quick Live Preview Link */}
            <Link
              href={`/${tenantSlug}`}
              target="_blank"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#0062FF]" />
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
                className="relative p-2 text-slate-600 hover:text-[#0F2A4A] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                aria-label="Bildirimler"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-[#00BCD4] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Interactive Notifications Popover */}
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-50"
                  >
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-xs text-[#0F2A4A]">Bildirimler</h3>
                        <span className="px-2 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-600 rounded-full">
                          {unreadCount} yeni
                        </span>
                      </div>
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={markAllAsRead}
                          className="text-[11px] font-medium text-[#0062FF] hover:underline"
                        >
                          Tümünü Okundu Say
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-xs text-slate-400">
                          Hiç bildiriminiz bulunmuyor.
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            className={`p-3 hover:bg-slate-50 transition-colors flex items-start justify-between gap-3 ${
                              n.unread ? "bg-blue-50/40" : ""
                            }`}
                          >
                            <div className="flex items-start gap-2.5">
                              <div className="mt-0.5">
                                {n.type === "booking" ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                ) : n.type === "payment" ? (
                                  <CreditCard className="w-4 h-4 text-[#0062FF]" />
                                ) : (
                                  <Bell className="w-4 h-4 text-amber-500" />
                                )}
                              </div>
                              <div>
                                <div className="font-medium text-xs text-[#0F2A4A]">{n.title}</div>
                                <div className="text-[11px] text-slate-500 mt-0.5">{n.message}</div>
                                <div className="text-[10px] text-slate-400 mt-1">{n.time}</div>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => deleteNotification(n.id)}
                              className="text-slate-400 hover:text-rose-500 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="p-2.5 bg-slate-50 text-center border-t border-slate-100">
                      <Link
                        href="/calendar"
                        onClick={() => setShowNotifications(false)}
                        className="text-xs font-medium text-[#0062FF] hover:underline"
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
                className="w-9 h-9 rounded-lg bg-[#0F2A4A] text-[#00BCD4] font-bold text-xs flex items-center justify-center border border-slate-200 hover:bg-[#0062FF] hover:text-white transition-colors uppercase cursor-pointer"
              >
                {tenantName ? tenantName.slice(0, 2) : "BE"}
              </button>

              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-60 bg-white border border-slate-200 rounded-xl shadow-xl p-2 z-50 text-slate-800"
                  >
                    <div className="p-3 border-b border-slate-100">
                      <p className="font-semibold text-xs text-[#0F2A4A]">{tenantName}</p>
                      <p className="text-[11px] text-slate-400">
                        {tenantSlug === "byerman" ? "byerman.randevuformu.com" : `/${tenantSlug}`}
                      </p>
                      <span className="inline-block mt-1.5 px-2 py-0.5 text-[10px] font-medium bg-emerald-50 text-emerald-700 rounded-md border border-emerald-200">
                        Canlı İşletme Hesabı
                      </span>
                    </div>

                    <div className="py-1 space-y-0.5">
                      <Link
                        href="/settings"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-600 hover:text-[#0F2A4A] hover:bg-slate-50 rounded-lg transition-colors"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        İşletme Ayarları
                      </Link>
                      <Link
                        href="/staff"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-600 hover:text-[#0F2A4A] hover:bg-slate-50 rounded-lg transition-colors"
                      >
                        <Users className="w-4 h-4 text-slate-400" />
                        Ekip Yönetimi
                      </Link>
                      <Link
                        href="/admin/login"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-600 hover:text-[#0F2A4A] hover:bg-slate-50 rounded-lg transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4 text-slate-400" />
                        Super Admin Girişi
                      </Link>
                      <Link
                        href={`/${tenantSlug}`}
                        target="_blank"
                        className="flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-600 hover:text-[#0F2A4A] hover:bg-slate-50 rounded-lg transition-colors"
                      >
                        <span className="flex items-center gap-2.5">
                          <CalendarDays className="w-4 h-4 text-slate-400" />
                          Canlı Randevu Sayfam
                        </span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </Link>
                    </div>

                    <div className="pt-1 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
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

        {/* Dynamic Page Content — Light Surface-0 Canvas */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#FAFBFC] text-[#0F172A]">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>

      {/* AI Chatbot Asistanı - İşletme Modu */}
      <ChatbotWidget mode="business" />
    </div>
  );
}
