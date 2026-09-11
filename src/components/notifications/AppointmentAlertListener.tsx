"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Calendar, User, Clock, CheckCircle2, X, Volume2 } from "lucide-react";
import { soundEngine } from "@/lib/soundEngine";
import Link from "next/link";

interface AlertAppointment {
  id: string;
  customer_name: string;
  service_name: string;
  appointment_date: string;
  appointment_time: string;
  staff_name?: string;
  price?: number;
}

export default function AppointmentAlertListener() {
  const [activeAlert, setActiveAlert] = useState<AlertAppointment | null>(null);
  const knownIdsRef = useRef<Set<string>>(new Set());
  const isInitialLoadRef = useRef(true);

  // Register Service Worker on mount for PWA & Background Push
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("[PWA] Service worker registered successfully:", reg.scope);
        })
        .catch((err) => {
          console.warn("[PWA] Service worker registration failed:", err);
        });
    }
  }, []);

  // Unlock audio context on first click anywhere in the dashboard
  useEffect(() => {
    const handleFirstInteraction = () => {
      soundEngine.getSettings();
      window.removeEventListener("click", handleFirstInteraction);
      window.removeEventListener("touchstart", handleFirstInteraction);
    };

    window.addEventListener("click", handleFirstInteraction, { once: true });
    window.addEventListener("touchstart", handleFirstInteraction, { once: true });

    return () => {
      window.removeEventListener("click", handleFirstInteraction);
      window.removeEventListener("touchstart", handleFirstInteraction);
    };
  }, []);

  // Polling loop to detect new appointments in real-time
  useEffect(() => {
    let isMounted = true;

    const checkAppointments = async () => {
      try {
        const tenant =
          localStorage.getItem("rf_tenant_slug") ||
          localStorage.getItem("rf_tenant") ||
          "byerman";

        const res = await fetch(`/api/appointments?tenant=${encodeURIComponent(tenant)}`, {
          cache: "no-store",
        });
        const data = await res.json();

        if (!data.success || !Array.isArray(data.appointments)) return;

        const currentIds = new Set<string>();
        const newAppointments: AlertAppointment[] = [];

        data.appointments.forEach((item: any) => {
          const id = String(item.id);
          currentIds.add(id);

          if (!isInitialLoadRef.current && !knownIdsRef.current.has(id)) {
            newAppointments.push({
              id,
              customer_name: item.customer_name || "Yeni Müşteri",
              service_name: item.service_name || "Randevu Hizmeti",
              appointment_date: item.appointment_date || "",
              appointment_time: item.appointment_time || "",
              staff_name: item.staff_name || "",
              price: item.price,
            });
          }
        });

        // If this is the initial load, just populate the known IDs
        if (isInitialLoadRef.current) {
          knownIdsRef.current = currentIds;
          isInitialLoadRef.current = false;
          return;
        }

        // Update known IDs
        knownIdsRef.current = currentIds;

        // If we found any new appointments, alert the user!
        if (newAppointments.length > 0 && isMounted) {
          const latest = newAppointments[newAppointments.length - 1];
          setActiveAlert(latest);

          // 1. Play Synthesized Luxury Sound
          soundEngine.play();

          // 2. Dispatch event so Dashboard header notifications update immediately
          window.dispatchEvent(
            new CustomEvent("rf_new_appointment", {
              detail: latest,
            })
          );

          // 3. Native Browser / Desktop Push Notification
          if (typeof window !== "undefined" && "Notification" in window) {
            if (Notification.permission === "granted") {
              try {
                new Notification(`Yeni Randevu: ${latest.customer_name}`, {
                  body: `${latest.service_name} • ${latest.appointment_date} ${latest.appointment_time}`,
                  icon: "/icon.png",
                  badge: "/icon.png",
                });
              } catch (e) {
                console.warn("Desktop notification error:", e);
              }
            }
          }
        }
      } catch (err) {
        console.warn("Error polling appointments:", err);
      }
    };

    // Initial check
    checkAppointments();

    // Hybrid interval: Poll every 15 seconds
    const interval = setInterval(checkAppointments, 15000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Auto-dismiss alert popup after 10 seconds
  useEffect(() => {
    if (!activeAlert) return;
    const timer = setTimeout(() => {
      setActiveAlert(null);
    }, 10000);
    return () => clearTimeout(timer);
  }, [activeAlert]);

  return (
    <AnimatePresence>
      {activeAlert && (
        <motion.div
          initial={{ opacity: 0, y: -40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className="fixed top-5 right-4 md:right-8 z-[9999] max-w-sm w-[92vw] md:w-96 rounded-2xl bg-gradient-to-b from-[#0F2A4A] to-[#0A1A2E] text-white p-4 shadow-2xl border border-amber-400/40 backdrop-blur-xl"
        >
          {/* Glowing pulse indicator */}
          <div className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500"></span>
          </div>

          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center shrink-0">
                <Bell className="w-5 h-5 text-amber-300 animate-bounce" />
              </div>
              <div>
                <span className="text-[10px] font-bold tracking-wider uppercase text-amber-400 flex items-center gap-1">
                  <Volume2 className="w-3 h-3" /> Yeni Randevu Geldi!
                </span>
                <h4 className="text-sm font-bold text-white leading-tight">
                  {activeAlert.customer_name}
                </h4>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveAlert(null)}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3 bg-black/30 rounded-xl p-2.5 border border-white/5 space-y-1.5 text-xs text-slate-300">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Hizmet:</span>
              <span className="font-semibold text-white">{activeAlert.service_name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Zaman:</span>
              <span className="font-semibold text-emerald-400">
                {activeAlert.appointment_date} • {activeAlert.appointment_time}
              </span>
            </div>
            {activeAlert.staff_name && (
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Uzman / Koltuk:</span>
                <span className="font-medium text-amber-200">{activeAlert.staff_name}</span>
              </div>
            )}
          </div>

          <div className="mt-3 flex items-center gap-2">
            <Link
              href="/calendar"
              onClick={() => setActiveAlert(null)}
              className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs text-center transition-all shadow-md flex items-center justify-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Takvimde İncele</span>
            </Link>
            <button
              type="button"
              onClick={() => setActiveAlert(null)}
              className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors"
            >
              Kapat
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
