"use client";

import { useEffect, useState } from 'react';
import { Users, CalendarCheck, TrendingUp, Clock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';

const chartData = [
  { name: 'Pzt', gelir: 4000 },
  { name: 'Sal', gelir: 3000 },
  { name: 'Çar', gelir: 2000 },
  { name: 'Per', gelir: 2780 },
  { name: 'Cum', gelir: 1890 },
  { name: 'Cts', gelir: 2390 },
  { name: 'Paz', gelir: 3490 },
];

export default function DashboardPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      // Bütün randevuları servis detayıyla birlikte çek (Gerçekte RLS ve Auth ile filtrelecek)
      const { data, error } = await supabase
        .from('appointments')
        .select('*, services(name, price_text)')
        .order('created_at', { ascending: false });

      if (data) {
        setAppointments(data);
      }
      setLoading(false);
    }
    fetchDashboardData();
  }, []);

  if (loading) return <div className="p-8 font-bold text-slate-500">Veriler Yükleniyor...</div>;

  const todayCount = appointments.filter(a => a.appointment_date === format(new Date(), 'yyyy-MM-dd')).length;
  const pendingCount = appointments.filter(a => a.status === 'pending').length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Bugünkü Randevular</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{todayCount}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Yeni Randevular (Toplam)</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{appointments.length}</h3>
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
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{pendingCount}</h3>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="font-bold text-slate-900">Gelir Analizi</h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[400px]">
          <div className="mb-6 flex items-center justify-between shrink-0">
            <h3 className="font-bold text-slate-900">Son Randevular</h3>
          </div>
          
          <div className="space-y-4 overflow-y-auto flex-1 pr-2">
            {appointments.length === 0 ? (
              <p className="text-slate-500 text-sm">Henüz randevu yok.</p>
            ) : (
              appointments.slice(0, 5).map((app: any) => (
                <div key={app.id} className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer border border-slate-100">
                  <div className="w-12 h-12 bg-white border border-slate-200 rounded-full flex flex-col items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-indigo-600">{app.appointment_time.substring(0,5)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 truncate">{app.customer_name}</p>
                    <p className="text-xs text-slate-500 truncate">{app.services?.name}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
