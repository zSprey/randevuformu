"use client";

import React, { useState } from "react";
import {
  Package,
  CreditCard,
  Plus,
  Sparkles,
  CheckCircle2,
  FileText,
  Clock,
  User,
  ArrowRight,
  TrendingUp,
  Receipt,
  Download,
  AlertCircle,
} from "lucide-react";
import {
  INITIAL_PACKAGES,
  INITIAL_CLIENT_PACKAGES,
  PackageDefinition,
  ClientPackageBalance,
  PackageEngine,
} from "@/lib/packageData";

export default function PackagesPage() {
  const [packages, setPackages] = useState<PackageDefinition[]>(INITIAL_PACKAGES);
  const [clientPackages, setClientPackages] = useState<ClientPackageBalance[]>(INITIAL_CLIENT_PACKAGES);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sell Package Modal State
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [selectedPkgId, setSelectedPkgId] = useState(packages[0].id);
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDeductSession = (clientPkg: ClientPackageBalance) => {
    const result = PackageEngine.deductSession(clientPkg);
    if (result.success) {
      setClientPackages([...clientPackages]);
      showToast(`${clientPkg.clientName} için 1 seans düşüldü. Kalan: ${result.remaining}`);
    } else {
      showToast(result.message);
    }
  };

  const handleSellPackage = (e: React.FormEvent) => {
    e.preventDefault();
    const pkgDef = packages.find((p) => p.id === selectedPkgId);
    if (!pkgDef || !clientName) return;

    const expiresDate = new Date();
    expiresDate.setDate(expiresDate.getDate() + pkgDef.validityDays);

    const newClientPkg: ClientPackageBalance = {
      id: `cp-${Date.now()}`,
      clientId: `cl-${Date.now()}`,
      clientName,
      clientPhone: clientPhone || "0555 123 45 67",
      packageId: pkgDef.id,
      packageName: pkgDef.name,
      totalSessions: pkgDef.totalSessions,
      usedSessions: 0,
      remainingSessions: pkgDef.totalSessions,
      purchaseDate: new Date().toISOString().split("T")[0],
      expiresAt: expiresDate.toISOString().split("T")[0],
      invoiceNumber: `EAR202600000${Math.floor(100 + Math.random() * 900)}`,
      status: "ACTIVE",
    };

    setClientPackages([newClientPkg, ...clientPackages]);
    setIsSellModalOpen(false);
    setClientName("");
    setClientPhone("");
    showToast(`✅ ${pkgDef.name} paketi satıldı ve ${newClientPkg.invoiceNumber} e-faturası düzenlendi!`);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl bg-indigo-600 text-white text-xs font-bold shadow-2xl shadow-indigo-600/50 flex items-center gap-2 border border-indigo-400">
          <Sparkles className="w-4 h-4 text-indigo-200" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Çoklu Seans & E-Fatura Motoru
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Paket Satışları & Otomatik E-Arşiv
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Reformer pilates, güzellik seansları ve terapi paketlerini tanımlayın; her randevuda otomatik seans düşümü yapın.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsSellModalOpen(true)}
          className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all hover:scale-105"
        >
          <CreditCard className="w-4 h-4" />
          Danışana Paket Sat
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Aktif Paket Sayısı</span>
          <div className="text-2xl sm:text-3xl font-black text-white">
            {clientPackages.filter((p) => p.status === "ACTIVE").length}
          </div>
          <div className="text-[11px] text-indigo-300">Yürürlükteki Paketler</div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Kullanılan Seans</span>
          <div className="text-2xl sm:text-3xl font-black text-purple-400">
            {clientPackages.reduce((acc, p) => acc + p.usedSessions, 0)} Seans
          </div>
          <div className="text-[11px] text-purple-300">Tamamlanan Randevular</div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Kalan Seans Stoğu</span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400">
            {clientPackages.reduce((acc, p) => acc + p.remainingSessions, 0)} Seans
          </div>
          <div className="text-[11px] text-emerald-300">Gelecek Randevu Hakkı</div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-medium">E-Fatura Entegrasyonu</span>
          <div className="text-2xl sm:text-3xl font-black text-indigo-400 flex items-center gap-1.5">
            <Receipt className="w-6 h-6 text-indigo-400" /> %100
          </div>
          <div className="text-[11px] text-slate-400">Paraşüt & BizimHesap</div>
        </div>
      </div>

      {/* Package Catalog Cards */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Package className="w-5 h-5 text-indigo-400" />
          Hizmet Paketleri Kataloğu
        </h3>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className="p-5 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-4 hover:border-indigo-500/40 transition-all shadow-xl"
            >
              <div className="space-y-2">
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[10px] font-bold">
                  {pkg.serviceCategory}
                </span>
                <h4 className="font-bold text-sm text-white">{pkg.name}</h4>
                <p className="text-xs text-slate-400 line-clamp-2">{pkg.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">{pkg.totalSessions} Seans • {pkg.validityDays} Gün</span>
                  <span className="font-black text-sm text-emerald-400">
                    ₺{pkg.price.toLocaleString("tr-TR")}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedPkgId(pkg.id);
                    setIsSellModalOpen(true);
                  }}
                  className="w-full py-2 rounded-xl bg-white/5 hover:bg-indigo-600 text-slate-300 hover:text-white text-xs font-bold transition-all"
                >
                  Bu Paketi Sat
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Client Package Balances Table */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-400" />
          Aktif Danışan Paket Bakiyeleri & Seans Düşümü
        </h3>

        <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 text-[11px] text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-4 px-6">Danışan</th>
                  <th className="py-4 px-6">Paket Adı</th>
                  <th className="py-4 px-6">Kullanılan / Kalan</th>
                  <th className="py-4 px-6">Son Geçerlilik</th>
                  <th className="py-4 px-6">E-Fatura No</th>
                  <th className="py-4 px-6 text-right">Aksiyon</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {clientPackages.map((cp) => (
                  <tr key={cp.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-6 font-bold text-white">
                      <div>{cp.clientName}</div>
                      <div className="text-[11px] text-slate-500 font-normal">{cp.clientPhone}</div>
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-200">{cp.packageName}</td>
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 font-bold text-xs">
                          <span className="text-purple-400">{cp.usedSessions} Kullanıldı</span>
                          <span className="text-slate-600">•</span>
                          <span className="text-emerald-400">{cp.remainingSessions} Kaldı</span>
                        </div>
                        <div className="w-32 bg-slate-950 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-indigo-500 h-full rounded-full"
                            style={{
                              width: `${(cp.usedSessions / cp.totalSessions) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-400 font-mono text-[11px]">{cp.expiresAt}</td>
                    <td className="py-4 px-6">
                      <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-indigo-300 font-mono text-[10px]">
                        {cp.invoiceNumber || "E-Arşiv Düzenlendi"}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {cp.remainingSessions > 0 ? (
                        <button
                          type="button"
                          onClick={() => handleDeductSession(cp)}
                          className="px-3.5 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white font-bold text-xs border border-indigo-500/30 transition-all hover:scale-105"
                        >
                          -1 Seans Düş
                        </button>
                      ) : (
                        <span className="text-slate-500 text-[11px] font-semibold">Tamamlandı</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Sell Package Modal */}
      {isSellModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-400" /> Danışana Paket Sat & Fatura Kes
            </h3>

            <form onSubmit={handleSellPackage} className="space-y-3.5">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Satılacak Paket</label>
                <select
                  value={selectedPkgId}
                  onChange={(e) => setSelectedPkgId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
                >
                  {packages.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (₺{p.price.toLocaleString("tr-TR")})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Danışan Adı Soyadı</label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Örn: Burak Özdemir"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Telefon Numarası</label>
                <input
                  type="tel"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="05XX XXX XX XX"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs flex items-center gap-2">
                <Receipt className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Satış anında otomatik GİB uyumlu e-Arşiv faturası üretilir.</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsSellModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-400"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30"
                >
                  Satışı Onayla & Fatura Kes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
