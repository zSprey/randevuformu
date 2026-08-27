"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Calendar, Users, Settings, LogOut, Bell, Menu } from 'lucide-react';
import { useState } from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
    { name: 'Özet', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Takvim', href: '/calendar', icon: Calendar },
    { name: 'Müşteriler', href: '/customers', icon: Users },
    { name: 'Ayarlar', href: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-slate-300 border-r border-slate-800">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <span className="text-white font-extrabold text-xl tracking-tight">randevuformu</span>
        </div>
        
        <div className="p-4 flex-1">
          <p className="px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Menü</p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.name} href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${isActive ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
        
        <div className="p-4 border-t border-slate-800">
          <button className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-left hover:bg-slate-800 hover:text-white transition-all text-slate-400">
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Çıkış Yap</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 z-10">
          <div className="flex items-center gap-4">
            <button className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-slate-900 hidden sm:block">Hoşgeldin, Dr. Ahmet 👋</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="w-9 h-9 bg-indigo-100 text-indigo-700 font-bold rounded-full flex items-center justify-center border border-indigo-200">
              A
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 sm:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
