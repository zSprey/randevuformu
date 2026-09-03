// app/panel/page.tsx
import prisma from '@/lib/prisma';
import { Calendar, Users, TrendingUp } from 'lucide-react';
import { AppointmentCard } from '@/components/panel/appointment-card';

// Faz 5: Demo için sabit Business ID (Gerçekte Auth session'dan gelecek)
const DEMO_BUSINESS_ID = "cl_demo_business_123"; 

export const dynamic = 'force-dynamic';

export default async function PanelPage() {
  // Bugünün başlangıç ve bitiş saatlerini ayarla
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  // Veritabanından bugünün randevularını çek
  let todayAppointments: any[] = [];
  try {
    todayAppointments = await prisma.appointment.findMany({
      where: {
        businessId: DEMO_BUSINESS_ID,
        startTime: {
          gte: todayStart,
          lte: todayEnd,
        }
      },
      include: {
        service: true,
        notes: true,
      },
      orderBy: { startTime: 'asc' }
    });
  } catch (error) {
    console.error("Panel Appointments Fetch Error:", error);
  }

  const totalAppointments = todayAppointments.length;
  const pendingAppointments = todayAppointments.filter(a => a.status === 'PENDING').length;

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Günlük Özet</h1>
          <p className="mt-1 text-sm text-zinc-600">
            {todayStart.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
      </header>

      {/* Üst Metrik Kartları */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-4 rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm">
          <div className="rounded-full bg-blue-50 p-3 text-blue-600">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-600">Bugünkü Randevular</p>
            <p className="font-mono text-2xl font-bold tabular-nums text-zinc-900">{totalAppointments}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm">
          <div className="rounded-full bg-amber-50 p-3 text-amber-600">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-600">Onay Bekleyen</p>
            <p className="font-mono text-2xl font-bold tabular-nums text-zinc-900">{pendingAppointments}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm">
          <div className="rounded-full bg-emerald-50 p-3 text-emerald-600">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-600">Beklenen Ciro</p>
            <p className="font-mono text-2xl font-bold tabular-nums text-zinc-900">
              ₺{todayAppointments.reduce((acc, curr) => acc + (curr.totalAmount || (curr.service?.price ?? 0)), 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Randevu Listesi */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-zinc-900">Yaklaşan Seanslar</h2>
        {todayAppointments.length === 0 ? (
          <div className="rounded-xl border border-zinc-200 border-dashed bg-zinc-50 p-12 text-center text-zinc-500">
            Bugün için kayıtlı randevu bulunmuyor.
          </div>
        ) : (
          <div className="grid gap-4">
            {todayAppointments.map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
