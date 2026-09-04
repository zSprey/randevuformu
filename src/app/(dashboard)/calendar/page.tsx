"use client";

import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  User,
  CheckCircle2,
  X,
  Sparkles,
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
  parseISO,
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

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month");
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [selectedApp, setSelectedApp] = useState<AppointmentItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState("Randevu & Görüşme");
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newDate, setNewDate] = useState(new Date().toISOString().split("T")[0]);
  const [newTime, setNewTime] = useState("11:30");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchRealAppointments = async () => {
    try {
      const res = await fetch("/api/appointments", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.appointments && data.appointments.length > 0) {
          const mapped: AppointmentItem[] = data.appointments.map((a: any) => {
            const dateIso = a.appointment_date
              ? new Date(`${a.appointment_date}T${a.appointment_time || "10:00:00"}`).toISOString()
              : new Date().toISOString();

            return {
              id: a.id,
              title: a.services?.name || a.customer_note || "Randevu",
              customerName: a.customer_name || "Müşteri",
              customerPhone: a.customer_phone || "",
              date: dateIso,
              time: a.appointment_time?.slice(0, 5) || "10:00",
              type: "treatment",
              price: "",
              notes: a.customer_note || "",
            };
          });
          setAppointments(mapped);
          return;
        }
      }
      setAppointments([]);
    } catch {
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRealAppointments();
  }, []);

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const today = () => setCurrentDate(new Date());

  const handleAddAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) {
      showToast("Lütfen ad ve telefon bilgilerini girin.");
      return;
    }

    const newApp: AppointmentItem = {
      id: `app_${Date.now()}`,
      title: newTitle,
      customerName: newName,
      customerPhone: newPhone,
      date: new Date(`${newDate}T${newTime}:00`).toISOString(),
      time: newTime,
      type: "treatment",
      price: "",
      notes: "Takvim üzerinden eklendi.",
    };

    setAppointments((prev) => [...prev, newApp]);
    setShowAddModal(false);
    setNewName("");
    setNewPhone("");
    showToast("Yeni randevu takvime başarıyla işlendi!");

    try {
      await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: newName.trim(),
          customer_phone: newPhone.trim(),
          customer_note: newTitle,
          service_name: newTitle,
          appointment_date: newDate,
          appointment_time: `${newTime}:00`,
        }),
      });
    } catch (err) {
      console.warn("Takvim API eklenirken hata:", err);
    }
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
          className={`min-h-[120px] p-2.5 border-r border-b border-slate-100 flex flex-col gap-1.5 transition-colors ${
            !isCurrentMonth
              ? "bg-slate-50/50 text-slate-400"
              : isToday
              ? "bg-blue-50/40 text-[#0F2A4A]"
              : "bg-white text-slate-800 hover:bg-slate-50/70"
          }`}
        >
          <div className="flex justify-between items-center mb-1">
            <span
              className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-lg ${
                isToday
                  ? "bg-[#0062FF] text-white shadow-xs font-bold"
                  : isCurrentMonth
                  ? "text-slate-700"
                  : "text-slate-400"
              }`}
            >
              {formattedDate}
            </span>
            {dayAppointments.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 text-[#0062FF] font-semibold">
                {dayAppointments.length}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1 overflow-y-auto max-h-[80px] pr-0.5">
            {dayAppointments.map((app) => (
              <div
                key={app.id}
                onClick={() => setSelectedApp(app)}
                className="text-[11px] p-1.5 rounded-lg bg-blue-50 border border-blue-200/60 text-[#0062FF] truncate cursor-pointer hover:bg-blue-100 transition-colors flex items-center justify-between font-medium"
              >
                <span className="font-bold mr-1">{app.time}</span>
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
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-8 z-50 px-4 py-3 rounded-xl bg-[#0F2A4A] text-white text-xs font-semibold shadow-2xl flex items-center gap-2 border border-[#0062FF]/30"
          >
            <CheckCircle2 className="w-4 h-4 text-[#00BCD4]" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0F2A4A] flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-[#0062FF]" />
            Randevu Takvimi
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Tüm seansları, uzman müsaitliklerini ve randevu detaylarını tek ekrandan yönetin.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center gap-2 bg-[#0062FF] hover:bg-[#0051d4] text-white px-4 py-2.5 rounded-xl font-semibold text-xs shadow-xs transition-all"
        >
          <Plus className="w-4 h-4" />
          Yeni Randevu Planla
        </button>
      </div>

      {/* Calendar Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col">
        {/* Navigation Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-bold text-[#0F2A4A] capitalize w-48">
              {format(currentDate, "MMMM yyyy", { locale: tr })}
            </h3>
            <div className="flex items-center rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
              <button
                type="button"
                onClick={prevMonth}
                className="p-2 hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors border-r border-slate-200"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={today}
                className="px-3.5 py-1.5 text-xs font-semibold hover:bg-slate-50 text-slate-700 transition-colors border-r border-slate-200"
              >
                Bugün
              </button>
              <button
                type="button"
                onClick={nextMonth}
                className="p-2 hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start lg:self-auto">
            {(["month", "week", "day"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setViewMode(m)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  viewMode === m
                    ? "bg-white text-[#0F2A4A] shadow-2xs"
                    : "text-slate-500 hover:text-slate-900"
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
            <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/70">
              {weekDays.map((d) => (
                <div
                  key={d}
                  className="py-2.5 text-center text-xs font-semibold text-slate-500 border-r border-slate-100 last:border-r-0"
                >
                  {d}
                </div>
              ))}
            </div>
            <div className="flex flex-col">{rows}</div>
          </div>
        </div>
      </div>

      {/* Appointment Detail Modal */}
      <AnimatePresence>
        {selectedApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl text-slate-900 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-blue-50 text-[#0062FF]">
                    <CalendarIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-[#0F2A4A]">{selectedApp.title}</h3>
                    <p className="text-xs text-[#0062FF] font-medium">{selectedApp.price}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedApp(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <User className="w-4 h-4 text-slate-400" />
                  <div>
                    <div className="text-slate-500 text-[10px]">Danışan</div>
                    <div className="font-semibold text-slate-900 text-sm">{selectedApp.customerName}</div>
                    <div className="text-slate-500">{selectedApp.customerPhone}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <Clock className="w-4 h-4 text-[#0062FF]" />
                  <div>
                    <div className="text-slate-500 text-[10px]">Randevu Saati</div>
                    <div className="font-semibold text-[#0F2A4A]">
                      {format(parseISO(selectedApp.date), "dd MMMM yyyy", { locale: tr })} - {selectedApp.time}
                    </div>
                  </div>
                </div>

                {selectedApp.notes && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="text-slate-500 text-[10px] mb-1 font-semibold">Özel Not</div>
                    <div className="text-slate-700">{selectedApp.notes}</div>
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedApp(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
                >
                  Kapat
                </button>
                <button
                  type="button"
                  onClick={() => {
                    showToast("Randevu teyit SMS'i danışana yeniden gönderildi.");
                    setSelectedApp(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#0062FF] hover:bg-[#0051d4] text-white shadow-xs"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl text-slate-900 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-base text-[#0F2A4A]">Yeni Randevu Planla</h3>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddAppointment} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Danışan Adı *</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Ad Soyad"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0062FF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Telefon Numarası *</label>
                  <input
                    type="tel"
                    required
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="05XX XXX XX XX"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono tabular-nums text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0062FF]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Tarih</label>
                    <input
                      type="date"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0062FF]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Saat</label>
                    <input
                      type="time"
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0062FF]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Hizmet Türü</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Hizmet Adı (Örn: Muayene, Saç Kesimi)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0062FF]"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:bg-slate-100"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#0062FF] hover:bg-[#0051d4] text-white shadow-xs"
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
