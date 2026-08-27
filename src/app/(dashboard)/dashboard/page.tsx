"use client";

import { Users, CalendarCheck, TrendingUp, Clock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Pzt', gelir: 4000 },
  { name: 'Sal', gelir: 3000 },
  { name: 'Çar', gelir: 2000 },
  { name: 'Per', gelir: 2780 },
  { name: 'Cum', gelir: 1890 },
  { name: 'Cts', gelir: 2390 },
  { name: 'Paz', gelir: 3490 },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Bugünkü Randevular</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">12</h3>
            <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +3 düne göre
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Yeni Müşteriler</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">48</h3>
            <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Bu hafta
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Haftalık Gelir</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">₺19.550</h3>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Bekleyen Onaylar</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">2</h3>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="font-bold text-slate-900">Gelir Analizi</h3>
            <select className="text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-indigo-600">
              <option>Son 7 Gün</option>
              <option>Bu Ay</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorGelir" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="gelir" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorGelir)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="font-bold text-slate-900">Yaklaşan Randevular</h3>
            <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">Tümünü Gör</button>
          </div>
          
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-100">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex flex-col items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-slate-500">14:30</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 truncate">Merve Kaya</p>
                  <p className="text-sm text-slate-500 truncate">Diş Taşı Temizliği</p>
                </div>
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
