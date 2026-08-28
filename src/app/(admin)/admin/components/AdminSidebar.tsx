"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  CalendarDays
} from "lucide-react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

const menuItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "İşletmeler", href: "/admin/businesses", icon: Building2 },
  { name: "Kullanıcılar", href: "/admin/users", icon: Users },
  { name: "Randevular", href: "/admin/appointments", icon: CalendarDays },
  { name: "Finans", href: "/admin/finance", icon: CreditCard },
  { name: "Ayarlar", href: "/admin/settings", icon: Settings },
];

export default function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Mobile Menu Button */}
      <button 
        className="md:hidden fixed top-4 right-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md"
        onClick={toggleSidebar}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
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
          "fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:flex-shrink-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-800">
          <Link href="/admin" className="flex items-center gap-2 font-bold text-xl tracking-tight text-blue-600 dark:text-blue-500">
            <span className="bg-blue-600 text-white p-1 rounded-md">
              <Building2 className="w-5 h-5" />
            </span>
            SuperAdmin
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link key={item.name} href={item.href}>
                <span 
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive 
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400" 
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800/50"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                  {isActive && (
                    <motion.div 
                      layoutId="active-nav"
                      className="absolute left-0 w-1 h-8 bg-blue-600 dark:bg-blue-500 rounded-r-full"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </span>
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <button className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30 transition-colors">
            <LogOut className="w-5 h-5" />
            Çıkış Yap
          </button>
        </div>
      </motion.aside>
    </>
  );
}
