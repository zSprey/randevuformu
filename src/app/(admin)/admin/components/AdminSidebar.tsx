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
  Mail
} from "lucide-react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

const menuItems = [
  { name: "Genel Bakış & Metrikler", href: "/admin", icon: LayoutDashboard },
  { name: "Kayıtlı İşletmeler", href: "/admin", icon: Building2 },
  { name: "Randevu Hacmi", href: "/admin", icon: CalendarDays },
  { name: "Ekip Yönetimi", href: "/staff", icon: Users },
  { name: "Form Alanları", href: "/forms", icon: Settings },
];

export default function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const toggleSidebar = () => setIsOpen(!isOpen);

  const handleAdminLogout = async () => {
    try {
      await fetch("/api/admin/auth/check", { method: "POST" });
    } catch (e) {
      // ignore
    }
    document.cookie = "rf_superadmin_session=; path=/; max-age=0;";
    window.location.href = "/admin/login";
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button 
        className="md:hidden fixed top-4 right-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md"
        onClick={toggleSidebar}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6 text-white" />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
        />
      )}

      {/* Sidebar */}
      <motion.aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:flex-shrink-0 text-slate-100",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
          <Link href="/admin" className="flex items-center gap-2 font-bold text-lg tracking-tight text-white">
            <span className="bg-red-600 text-white p-1.5 rounded-lg shadow-md shadow-red-600/30">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <span>SuperAdmin</span>
          </Link>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
            musa
          </span>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link key={item.name} href={item.href}>
                <span 
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer",
                    isActive 
                      ? "bg-red-600/20 text-red-300 border border-red-500/30" 
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </span>
              </Link>
            );
          })}

          <div className="pt-6 border-t border-slate-800 space-y-1">
            <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Hızlı Bağlantılar
            </p>
            <Link
              href="/"
              target="_blank"
              className="flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-xl transition-colors"
            >
              <span>Ana Sayfa</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-xl transition-colors"
            >
              <span>Tenant Paneli</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/contact"
              className="flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-xl transition-colors"
            >
              <span>B2B İletişim</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="p-4 border-t border-slate-800 space-y-2">
          <a
            href="mailto:destek@randevuformu.com"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] text-slate-400 hover:text-indigo-300 transition-colors"
          >
            <Mail className="w-3.5 h-3.5 text-indigo-400" />
            <span className="truncate">destek@randevuformu.com</span>
          </a>

          <button 
            type="button"
            onClick={handleAdminLogout}
            className="flex w-full items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Admin Oturumunu Kapat
          </button>
        </div>
      </motion.aside>
    </>
  );
}
