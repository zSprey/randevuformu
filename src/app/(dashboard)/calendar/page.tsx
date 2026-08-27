"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays, parseISO } from "date-fns";
import { tr } from "date-fns/locale";

// Mock veriler
const mockAppointments = [
  { id: 1, title: "Ahmet Yılmaz - Diş Çekimi", date: new Date().toISOString(), time: "10:00", type: "treatment" },
  { id: 2, title: "Ayşe Demir - Kontrol", date: new Date().toISOString(), time: "14:30", type: "checkup" },
  { id: 3, title: "Mehmet Kaya - Kanal Tedavisi", date: addDays(new Date(), 2).toISOString(), time: "11:00", type: "treatment" },
];

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const today = () => setCurrentDate(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const dateFormat = "d";
  const rows = [];
  let days = [];
  let day = startDate;
  let formattedDate = "";

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      formattedDate = format(day, dateFormat);
      const cloneDay = day;
      
      const dayAppointments = mockAppointments.filter(app => isSameDay(parseISO(app.date), cloneDay));

      days.push(
        <div 
          key={day.toString()} 
          className={`min-h-[120px] p-2 border-r border-b border-slate-200 flex flex-col gap-1 transition-colors hover:bg-slate-50 ${
            !isSameMonth(day, monthStart) ? "bg-slate-50/50 text-slate-400" : "bg-white text-slate-700"
          } ${isSameDay(day, new Date()) ? "bg-indigo-50/30" : ""}`}
        >
          <div className="flex justify-between items-center mb-1">
            <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${
              isSameDay(day, new Date()) ? "bg-indigo-600 text-white shadow-sm" : ""
            }`}>
              {formattedDate}
            </span>
          </div>
          <div className="flex flex-col gap-1 overflow-y-auto max-h-[80px] no-scrollbar">
            {dayAppointments.map(app => (
              <div key={app.id} className="text-xs p-1.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100 truncate cursor-pointer hover:bg-indigo-100 transition-colors">
                <span className="font-semibold mr-1">{app.time}</span>
                {app.title}
              </div>
            ))}
          </div>
        </div>
      );
      day = addDays(day, 1);
    }
    rows.push(
      <div className="grid grid-cols-7" key={day.toString()}>
        {days}
      </div>
    );
    days = [];
  }

  const weekDays = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cts", "Paz"];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Takvim</h2>
          <p className="text-slate-500 text-sm mt-1">Randevularınızı ve programınızı yönetin.</p>
        </div>
        <button className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition-colors font-medium shadow-sm">
          <Plus className="w-5 h-5" />
          Yeni Randevu
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        {/* Calendar Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-50/50">
          <div className="flex items-center gap-4">
            <h3 className="text-xl font-bold text-slate-800 capitalize w-48">
              {format(currentDate, 'MMMM yyyy', { locale: tr })}
            </h3>
            <div className="flex items-center rounded-lg border border-slate-200 bg-white overflow-hidden shadow-sm">
              <button onClick={prevMonth} className="p-2 hover:bg-slate-50 text-slate-600 transition-colors border-r border-slate-200">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={today} className="px-4 py-2 text-sm font-medium hover:bg-slate-50 text-slate-700 transition-colors border-r border-slate-200">
                Bugün
              </button>
              <button onClick={nextMonth} className="p-2 hover:bg-slate-50 text-slate-600 transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg self-start lg:self-auto">
            <button className="px-3 py-1.5 text-sm font-medium bg-white text-slate-800 rounded-md shadow-sm">Ay</button>
            <button className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-800 rounded-md transition-colors">Hafta</button>
            <button className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-800 rounded-md transition-colors">Gün</button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 flex flex-col overflow-x-auto">
          <div className="min-w-[700px]">
            <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
              {weekDays.map(day => (
                <div key={day} className="py-3 text-center text-sm font-semibold text-slate-500 border-r border-slate-200 last:border-r-0">
                  {day}
                </div>
              ))}
            </div>
            <div className="flex flex-col bg-slate-200 gap-px border-l border-slate-200">
              {rows}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
