"use client";

import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  User,
  CheckCircle2,
  X,
  Sparkles
} from "lucide-react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  addDays,
  parseISO
} from "date-fns";
import { tr } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";

interface AppointmentItem {
  id: string;
  title: string;
  customerName: string;
  customerPhone: string;
  date: string;
  time: string;
  type: string;
  price: string;
  notes?: string;
}

const initialAppointments: AppointmentItem[] = [
  {
    id: "1",
    title: "İmplant Konsültasyonu",
    customerName: "Caner Öztürk",
    customerPhone: "0532 456 78 90",
    date: new Date().toISOString(),
    time: "10:00",
    type: "treatment",
    price: "Ücretsiz",
    notes: "3D tomografi ve gülüş planlaması",
  },
  {
    id: "2",
    title: "Lazerli Beyazlatma",
    customerName: "Ayşe Demir",
    customerPhone: "0544 123 45 67",
    date: new Date().toISOString(),
    time: "14:30",
    type: "checkup",
    price: "₺3.000",
    notes: "Tek seans beyazlatma",
  },
  {
    id: "3",
    title: "Kanal Tedavisi & Dolgu",
    customerName: "Mehmet Kaya",
    customerPhone: "0505 987 65 43",
    date: addDays(new Date(), 2).toISOString(),
    time: "11:00",
    type: "treatment",
    price: "₺1.200",
    notes: "Sol üst azı dişi dolgusu",
  },
  {
    id: "4",
    title: "Gülüş Tasarımı Ön Muayene",
    customerName: "Zeynep Arslan",
    customerPhone: "0533 111 22 33",
    date: addDays(new Date(), 4).toISOString(),
    time: "16:00",
    type: "checkup",
    price: "₺1.500",
    notes: "Zirkonyum kaplama konsültasyonu",
  },
];

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month");
  const [appointments, setAppointments] = useState<AppointmentItem[]>(initialAppointments);

  // Modals
  const [selectedApp, setSelectedApp] = useState<AppointmentItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState("İmplant Konsültasyonu");
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newDate, setNewDate] = useState(new Date().toISOString().split("T")[0]);
  const [newTime, setNewTime] = useState("11:30");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const today = () => setCurrentDate(new Date());

  const handleAddAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    const newApp: AppointmentItem = {
      id: `app_${Date.now()}`,
      title: newTitle,
      customerName: newName,
      customerPhone: newPhone,
      date: new Date(`${newDate}T${newTime}:00`).toISOString(),
      time: newTime,
      type: "treatment",
      price: "₺1.000",
      notes: "Takvim üzerinden doğrudan eklendi.",
    };
    setAppointments([...appointments, newApp]);
    setShowAddModal(false);
    setNewName("");
    setNewPhone("");
    showToast("Yeni randevu takvime başarıyla işlendi!");
  };

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

      const dayAppointments = appointments.filter((app) =>
        isSameDay(parseISO(app.date), cloneDay)
      );

      const isCurrentMonth = isSameMonth(day, monthStart);
      const isToday = isSameDay(day, new Date());

      days.push(
        <div
          key={day.toString()}
          className={`min-h-[130px] p-2.5 border-r border-b border-slate-800 flex flex-col gap-1.5 transition-colors ${
            !isCurrentMonth
              ? "bg-slate-950/40 text-slate-600"
              : isToday
              ? "bg-indigo-950/20 text-white"
              : "bg-slate-900 text-slate-300 hover:bg-slate-850"
          }`}
        >
          <div className="flex justify-between items-center mb-1">
            <span
              className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-lg ${
                isToday
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/40"
                  : "text-slate-400"
              }`}
            >
              {formattedDate}
            </span>
            {dayAppointments.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold">
                {dayAppointments.length}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1 overflow-y-auto max-h-[85px] pr-0.5">
            {dayAppointments.map((app) => (
              <div
                key={app.id}
                onClick={() => setSelectedApp(app)}
                className="text-[11px] p-1.5 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-200 truncate cursor-pointer hover:bg-indigo-600/40 transition-all flex items-center justify-between"
              >
                <span className="font-bold text-indigo-400 mr-1">{app.time}</span>
                <span className="truncate">{app.customerName}</span>
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
    <div className="space-y-6 pb-12">
      {/* Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-8 z-50 p-4 rounded-2xl bg-indigo-600 text-white font-semibold text-xs shadow-2xl flex items-center gap-2 border border-indigo-400"
          >
            <CheckCircle2 className="w-4 h-4 text-white" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white">Randevu Takvimi</h2>
          <p className="text-xs text-slate-400 mt-1">
            Tüm seansları, uzman müsaitliklerini ve randevu detaylarını yönetin.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Yeni Randevu Planla
        </button>
      </div>

      {/* Calendar Card */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-xl overflow-hidden flex flex-col">
        {/* Navigation Bar */}
        <div className="p-4 sm:p-6 border-b border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-950/40">
          <div className="flex items-center gap-4">
            <h3 className="text-xl font-extrabold text-white capitalize w-52">
              {format(currentDate, "MMMM yyyy", { locale: tr })}
            </h3>
            <div className="flex items-center rounded-xl border border-slate-800 bg-slate-900 overflow-hidden shadow-sm">
              <button
                type="button"
                onClick={prevMonth}
                className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors border-r border-slate-800"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={today}
                className="px-4 py-2 text-xs font-bold hover:bg-slate-800 text-slate-300 hover:text-white transition-colors border-r border-slate-800"
              >
                Bugün
              </button>
              <button
                type="button"
                onClick={nextMonth}
                className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 self-start lg:self-auto">
            {(["month", "week", "day"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setViewMode(m)}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  viewMode === m
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {m === "month" ? "Ay" : m === "week" ? "Hafta" : "Gün"}
              </button>
            ))}
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 flex flex-col overflow-x-auto">
          <div className="min-w-[700px]">
            <div className="grid grid-cols-7 border-b border-slate-800 bg-slate-950/60">
              {weekDays.map((d) => (
                <div
                  key={d}
                  className="py-3 text-center text-xs font-bold text-slate-400 border-r border-slate-800 last:border-r-0"
                >
                  {d}
                </div>
              ))}
            </div>
            <div className="flex flex-col bg-slate-800 gap-px">{rows}</div>
          </div>
        </div>
      </div>

      {/* Appointment Detail Modal */}
      <AnimatePresence>
        {selectedApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl text-white space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400">
                    <CalendarIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white">{selectedApp.title}</h3>
                    <p className="text-xs text-indigo-400">{selectedApp.price}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedApp(null)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5">
                  <User className="w-4 h-4 text-slate-400" />
                  <div>
                    <div className="text-slate-400 text-[10px]">Danışan</div>
                    <div className="font-bold text-white text-sm">{selectedApp.customerName}</div>
                    <div className="text-slate-400">{selectedApp.customerPhone}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  <div>
                    <div className="text-slate-400 text-[10px]">Randevu Saati</div>
                    <div className="font-semibold text-white">
                      {format(parseISO(selectedApp.date), "dd MMMM yyyy", { locale: tr })} - {selectedApp.time}
                    </div>
                  </div>
                </div>

                {selectedApp.notes && (
                  <div className="p-3 rounded-2xl bg-white/5">
                    <div className="text-slate-400 text-[10px] mb-1 font-semibold">Özel Not</div>
                    <div className="text-slate-300">{selectedApp.notes}</div>
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedApp(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-white/10 hover:bg-white/20 text-white"
                >
                  Kapat
                </button>
                <button
                  type="button"
                  onClick={() => {
                    showToast("Randevu teyit SMS'i danışana yeniden gönderildi.");
                    setSelectedApp(null);
                  }}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white"
                >
                  Teyit Mesajı Gönder
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Appointment Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl text-white space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="font-bold text-base text-white">Yeni Randevu Oluştur</h3>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddAppointment} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Danışan Adı *</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Ad Soyad"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Telefon Numarası *</label>
                  <input
                    type="tel"
                    required
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="05XX XXX XX XX"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Tarih</label>
                    <input
                      type="date"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Saat</label>
                    <input
                      type="time"
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Hizmet Türü</label>
                  <select
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="İmplant Konsültasyonu">İmplant Konsültasyonu (30 dk)</option>
                    <option value="Lazerli Beyazlatma">Lazerli Beyazlatma (60 dk)</option>
                    <option value="Kanal Tedavisi & Dolgu">Kanal Tedavisi & Dolgu (60 dk)</option>
                    <option value="Gülüş Tasarımı Ön Muayene">Gülüş Tasarımı Ön Muayene (45 dk)</option>
                  </select>
                </div>

                <div className="pt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30"
                  >
                    Takvime Ekle
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
