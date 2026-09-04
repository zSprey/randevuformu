"use client";

import React, { use, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  ShieldAlert,
  Calendar,
  CreditCard,
  Sparkles,
  Plus,
  HeartPulse,
  Award,
  CheckCircle2,
  FileText,
  Clock,
} from "lucide-react";
import { INITIAL_CLIENTS, ClientProfile, TreatmentRecord } from "@/lib/crmData";
import BeforeAfterSlider from "@/components/crm/BeforeAfterSlider";

interface PageProps {
  params: Promise<{ id: string }> | { id: string };
}

export default function ClientDetailPage({ params }: PageProps) {
  const resolvedParams = "then" in params ? use(params as Promise<{ id: string }>) : params;
  const clientId = resolvedParams?.id || "cl-101";

  const [client, setClient] = useState<ClientProfile>(() => {
    return INITIAL_CLIENTS.find((c) => c.id === clientId) || INITIAL_CLIENTS[0];
  });

  const [isTreatmentModalOpen, setIsTreatmentModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [newCost, setNewCost] = useState(1500);

  const handleAddTreatment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    const newRecord: TreatmentRecord = {
      id: `tr-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      title: newTitle,
      doctorName: "Tedavi Uzmanı",
      notes: newNotes,
      cost: newCost,
      status: "COMPLETED",
    };

    setClient({
      ...client,
      totalSpent: client.totalSpent + newCost,
      treatments: [newRecord, ...client.treatments],
    });

    setNewTitle("");
    setNewNotes("");
    setIsTreatmentModalOpen(false);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Back Button & Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/clients"
            className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl sm:text-3xl font-black text-white">{client.fullName}</h2>
              {client.status === "VIP" && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-black border border-amber-500/30">
                  VIP DANIŞAN
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Kayıt Tarihi: {client.createdAt} • Dossier ID: {client.id}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsTreatmentModalOpen(true)}
          className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          Yeni Tedavi / Seans Ekle
        </button>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Medical Profile & Details */}
        <div className="lg:col-span-4 space-y-6">
          {/* Medical Identity Card */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-rose-400" /> Tıbbi & İletişim Bilgileri
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Telefon:</span>
                <span className="text-white font-medium">{client.phone}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">E-posta:</span>
                <span className="text-white font-medium">{client.email}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Kan Grubu:</span>
                <span className="text-indigo-300 font-bold">{client.bloodType}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Doğum Tarihi:</span>
                <span className="text-white font-medium">{client.birthDate}</span>
              </div>
            </div>

            {/* Allergies Warning Box */}
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-1">
              <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" /> Bilinen Alerjiler
              </span>
              <p className="text-xs text-rose-200 font-medium">
                {client.allergies.join(", ") || "Alerji kaydı bulunmuyor."}
              </p>
            </div>

            {/* Package Balance Card */}
            {client.packageBalance && (
              <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-purple-300">Aktif Seans Paketi</span>
                  <span className="text-[11px] text-purple-400 font-mono">
                    {client.packageBalance.expiresAt}'e kadar
                  </span>
                </div>
                <div className="text-sm font-black text-white">
                  {client.packageBalance.packageName}
                </div>
                <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-purple-500/20">
                  <div
                    className="bg-gradient-to-r from-purple-600 to-indigo-500 h-full rounded-full"
                    style={{
                      width: `${(client.packageBalance.remainingSessions / client.packageBalance.totalSessions) * 100}%`,
                    }}
                  />
                </div>
                <div className="text-[11px] text-purple-300 font-semibold text-right">
                  Kalan: {client.packageBalance.remainingSessions} / {client.packageBalance.totalSessions} Seans
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Before/After Media & Treatment Timeline */}
        <div className="lg:col-span-8 space-y-6">
          {/* Before / After Photo Comparison Slider */}
          {client.mediaGallery.length > 0 && (
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                Öncesi / Sonrası (Before-After) Klinik Sonucu
              </h3>
              <BeforeAfterSlider
                beforeImage={client.mediaGallery[0].beforeImage}
                afterImage={client.mediaGallery[0].afterImage}
                title={client.mediaGallery[0].treatmentTitle}
              />
              <p className="text-xs text-slate-400">
                Not: {client.mediaGallery[0].notes}
              </p>
            </div>
          )}

          {/* Treatments History Timeline */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              Tedavi & Seans Geçmişi ({client.treatments.length} İşlem)
            </h3>

            <div className="space-y-4">
              {client.treatments.map((tr) => (
                <div
                  key={tr.id}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-white">{tr.title}</h4>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-indigo-400" /> {tr.date}
                        </span>
                        <span>• {tr.doctorName}</span>
                      </div>
                    </div>
                    <span className="font-bold text-xs text-emerald-400">
                      ₺{tr.cost.toLocaleString("tr-TR")}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                    {tr.notes}
                  </p>

                  {tr.prescription && (
                    <div className="text-[11px] text-indigo-300 bg-indigo-500/10 p-2.5 rounded-xl border border-indigo-500/20">
                      💊 <strong>Reçete / Tavsiye:</strong> {tr.prescription}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Treatment Modal */}
      {isTreatmentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-400" /> Yeni Tedavi / Seans Kaydı
            </h3>

            <form onSubmit={handleAddTreatment} className="space-y-3.5">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Uygulanan Tedavi / Seans</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Örn: Kompozit Dolgu & Polisaj"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Hekim / Uzman Notları</label>
                <textarea
                  rows={3}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Seans sırasında yapılan işlemler ve danışan durumu..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Ücret (₺)</label>
                <input
                  type="number"
                  value={newCost}
                  onChange={(e) => setNewCost(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsTreatmentModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-400"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30"
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
