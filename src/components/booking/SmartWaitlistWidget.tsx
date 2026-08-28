"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Bell, CheckCircle2, Phone, User, Mail, X } from "lucide-react";
import { waitlistEngine } from "@/lib/engine/waitlistEngine";

interface SmartWaitlistWidgetProps {
  tenantId: string;
  serviceId?: string;
  businessName: string;
  selectedDate: string;
}

export default function SmartWaitlistWidget({
  tenantId,
  serviceId = "default-service",
  businessName,
  selectedDate,
}: SmartWaitlistWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    waitlistEngine.joinWaitlist({
      tenantId,
      serviceId,
      customerName,
      customerPhone,
      customerEmail,
      preferredDate: selectedDate,
      priorityScore: 80,
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setIsOpen(false);
    }, 2500);
  };

  return (
    <div className="w-full">
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-purple-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-white flex items-center gap-1.5">
              İstediğiniz Saat Dolu mu?
              <span className="px-1.5 py-0.5 text-[9px] font-extrabold bg-amber-500/30 text-amber-300 rounded">
                AI No-Show Shield
              </span>
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              İptal olan slot olursa WhatsApp ile anında ilk size haber verelim.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="px-4 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
        >
          Yedek Listeye Katıl
        </button>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl text-white space-y-4 relative"
            >
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="absolute right-4 top-4 p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Akıllı Yedek Listesi</h3>
                  <p className="text-xs text-slate-400">{businessName} • {selectedDate}</p>
                </div>
              </div>

              {isSuccess ? (
                <div className="text-center py-6 space-y-3">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="font-bold text-sm text-white">Yedek Listeye Eklendiniz!</h4>
                  <p className="text-xs text-slate-400">
                    Seçtiğiniz tarihte iptal veya yeni slot açıldığı an WhatsApp bildirimi alacaksınız.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleJoin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Ad Soyad *</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Adınız Soyadınız"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      WhatsApp Telefon Numarası *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        required
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="05XX XXX XX XX"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">E-Posta Adresi</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="eposta@adresiniz.com"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all hover:scale-105"
                  >
                    Öncelikli Sıraya Gir
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
