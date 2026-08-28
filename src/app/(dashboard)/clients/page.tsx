"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Plus,
  Sparkles,
  Phone,
  Mail,
  ShieldAlert,
  ArrowRight,
  UserCheck,
  Award,
  CreditCard,
  FileText,
} from "lucide-react";
import { INITIAL_CLIENTS, ClientProfile } from "@/lib/crmData";

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientProfile[]>(INITIAL_CLIENTS);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Client Form State
  const [newFullName, setNewFullName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newAllergies, setNewAllergies] = useState("");

  const filteredClients = clients.filter((c) => {
    const matchesSearch =
      c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName || !newPhone) return;

    const newClient: ClientProfile = {
      id: `cl-${Date.now()}`,
      fullName: newFullName,
      phone: newPhone,
      email: newEmail || "kayitli.degil@example.com",
      birthDate: "1995-01-01",
      gender: "FEMALE",
      allergies: newAllergies ? newAllergies.split(",").map((s) => s.trim()) : ["Yok"],
      chronicConditions: ["Yok"],
      bloodType: "A Rh+",
      totalSpent: 0,
      loyaltyPoints: 100,
      packageBalance: null,
      treatments: [],
      mediaGallery: [],
      status: "ACTIVE",
      createdAt: new Date().toISOString().split("T")[0],
    };

    setClients([newClient, ...clients]);
    setNewFullName("");
    setNewPhone("");
    setNewEmail("");
    setNewAllergies("");
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Danışan & Hasta 360 CRM
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Danışan Portföyü & Medikal Geçmiş
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Klinik danışanlarınızın seans notlarını, alerjilerini, paket bakiyelerini ve fotoğraflarını yönetin.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          Yeni Danışan Kartı Aç
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Kayıtlı Danışan</span>
          <div className="text-2xl sm:text-3xl font-black text-white">{clients.length}</div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
            <UserCheck className="w-3 h-3" /> %100 KVKK Uyumlu
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-medium">VIP Müşteri</span>
          <div className="text-2xl sm:text-3xl font-black text-indigo-400">
            {clients.filter((c) => c.status === "VIP").length}
          </div>
          <div className="text-[11px] text-indigo-300 flex items-center gap-1 font-semibold">
            <Award className="w-3 h-3" /> Yüksek Sadakat
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Aktif Paket Sahibi</span>
          <div className="text-2xl sm:text-3xl font-black text-purple-400">
            {clients.filter((c) => c.packageBalance !== null).length}
          </div>
          <div className="text-[11px] text-purple-300 flex items-center gap-1 font-semibold">
            <CreditCard className="w-3 h-3" /> Çoklu Seans
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Toplam Hasta Cirosu</span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400">
            ₺{clients.reduce((acc, c) => acc + c.totalSpent, 0).toLocaleString("tr-TR")}
          </div>
          <div className="text-[11px] text-slate-400">Ort. ₺8.400 / Kişi</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="İsim, telefon veya e-posta ara..."
            className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {["ALL", "VIP", "ACTIVE"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === st
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              {st === "ALL" ? "Tümü" : st}
            </button>
          ))}
        </div>
      </div>

      {/* Client List Table */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 text-[11px] text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-4 px-6">Danışan Adı</th>
                <th className="py-4 px-6">İletişim</th>
                <th className="py-4 px-6">Alerji / Tıbbi Uyarı</th>
                <th className="py-4 px-6">Paket Bakiyesi</th>
                <th className="py-4 px-6">Toplam Harcama</th>
                <th className="py-4 px-6 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-6 font-bold text-white flex items-center gap-2">
                    <span>{client.fullName}</span>
                    {client.status === "VIP" && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-black border border-amber-500/30">
                        VIP
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <div className="space-y-0.5">
                      <div className="text-white font-medium">{client.phone}</div>
                      <div className="text-[11px] text-slate-500">{client.email}</div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    {client.allergies.length > 0 && client.allergies[0] !== "Yok" ? (
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 font-bold text-[11px]">
                        <ShieldAlert className="w-3 h-3" />
                        {client.allergies.join(", ")}
                      </div>
                    ) : (
                      <span className="text-slate-500 text-[11px]">Alerji Kaydı Yok</span>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    {client.packageBalance ? (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[11px] font-bold">
                        <span>{client.packageBalance.remainingSessions}/{client.packageBalance.totalSessions} Seans Kaldı</span>
                      </div>
                    ) : (
                      <span className="text-slate-500 text-[11px]">Tekil Seans</span>
                    )}
                  </td>
                  <td className="py-4 px-6 font-bold text-emerald-400">
                    ₺{client.totalSpent.toLocaleString("tr-TR")}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <Link
                      href={`/clients/${client.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-indigo-600 text-slate-300 hover:text-white font-bold text-xs transition-all"
                    >
                      Dossier Aç <ArrowRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Client Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-400" /> Yeni Danışan Kaydı Oluştur
            </h3>

            <form onSubmit={handleCreateClient} className="space-y-3.5">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Ad Soyad</label>
                <input
                  type="text"
                  required
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  placeholder="Örn: Elif Aksoy"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Telefon Numarası</label>
                <input
                  type="tel"
                  required
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="05XX XXX XX XX"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">E-posta (Opsiyonel)</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="ornek@mail.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Alerjiler & Tıbbi Uyarılar</label>
                <input
                  type="text"
                  value={newAllergies}
                  onChange={(e) => setNewAllergies(e.target.value)}
                  placeholder="Örn: Penisilin, Lateks (virgülle ayırın)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-400"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30"
                >
                  Danışanı Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
