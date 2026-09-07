"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  Settings, 
  LogOut, 
  Menu,
  X,
  CreditCard,
  CalendarDays,
  ExternalLink,
  ShieldCheck,
  Mail,
  ArrowRight,
  Globe
} from "lucide-react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

const menuItems = [
  { name: "Genel Bakış & Başvurular", href: "/admin", icon: LayoutDashboard },
  { name: "Kayıtlı İşletmeler", href: "/admin#businesses", icon: Building2 },
  { name: "Randevu Takvimi", href: "/calendar", icon: CalendarDays },
  { name: "Personel Yönetimi", href: "/staff", icon: Users },
  { name: "Form & Özelleştirme", href: "/forms", icon: Settings },
];

export default function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const toggleSidebar = () => setIsOpen(!isOpen);

  const handleAdminLogout = async () => {
    try {
      await fetch("/api/admin/auth/check", { method: "POST" });
    } catch {}
    document.cookie = "rf_superadmin_session=; path=/; max-age=0;";
    document.cookie = "rf_superadmin=; path=/; max-age=0;";
    try {
      localStorage.removeItem("rf_superadmin_session");
      localStorage.removeItem("rf_superadmin");
    } catch {}
    window.location.href = "/admin/login";
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button 
        className="md:hidden fixed top-4 right-4 z-50 p-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl shadow-md"
        onClick={toggleSidebar}
        aria-label="Menüyü Aç"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      {/* Sidebar */}
      <motion.aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:flex-shrink-0 text-slate-800 shadow-sm",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-200/80">
          <Link href="/admin" className="flex items-center gap-2.5 font-extrabold text-base tracking-tight text-[#0F2A4A]">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#0F2A4A] to-[#0062FF] text-white flex items-center justify-center shadow-sm">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="block leading-none">Randevu<span className="text-[#0062FF]">Formu</span></span>
              <span className="text-[10px] font-bold text-slate-400 tracking-normal uppercase">Super Admin</span>
            </div>
          </Link>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            Canlı
          </span>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-5 px-3 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Yönetim Modülleri
          </div>
          {menuItems.map((item) => {
            const isActive = pathname === item.href && !item.href.includes("#");
            const Icon = item.icon;
            return (
              <Link key={item.name} href={item.href}>
                <span 
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group",
                    isActive 
                      ? "bg-[#0062FF]/10 text-[#0062FF] shadow-xs" 
                      : "text-slate-600 hover:text-[#0F2A4A] hover:bg-slate-100/70"
                  )}
                >
                  <Icon className={cn(
                    "w-4 h-4 transition-colors", 
                    isActive ? "text-[#0062FF]" : "text-slate-400 group-hover:text-slate-600"
                  )} />
                  {item.name}
                </span>
              </Link>
            );
          })}

          <div className="pt-4 px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Hızlı Bağlantılar
          </div>
          <Link href="/" target="_blank">
            <span className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-[#0F2A4A] hover:bg-slate-100/70 transition-all group">
              <span className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
                Ana Sayfayı Gör
              </span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />
            </span>
          </Link>
          <Link href="/dashboard" target="_blank">
            <span className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-[#0F2A4A] hover:bg-slate-100/70 transition-all group">
              <span className="flex items-center gap-3">
                <Building2 className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
                İşletme Paneli
              </span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />
            </span>
          </Link>
        </div>

        {/* User Card & Logout Footer */}
        <div className="p-3 border-t border-slate-200/80 bg-slate-50/50">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs mb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#0F2A4A] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                M
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-[#0F2A4A] truncate">musa</p>
                <p className="text-[10px] text-slate-500 font-medium truncate">Ana Yönetici</p>
              </div>
            </div>
            <button 
              onClick={handleAdminLogout}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="Güvenli Çıkış"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[10px] text-center text-slate-400 font-medium">
            v2.4.0 • randevuformu.com
          </p>
        </div>
      </motion.aside>
    </>
  );
}
