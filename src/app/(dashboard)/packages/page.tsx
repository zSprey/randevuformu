"use client";

import React, { useState } from "react";
import {
  Package,
  CreditCard,
  CheckCircle2,
  FileText,
  Sparkles,
  Receipt,
  X,
} from "lucide-react";
import {
  INITIAL_PACKAGES,
  INITIAL_CLIENT_PACKAGES,
  PackageDefinition,
  ClientPackageBalance,
  PackageEngine,
} from "@/lib/packageData";

export default function PackagesPage() {
  const [packages] = useState<PackageDefinition[]>(INITIAL_PACKAGES);
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
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 px-4 py-3 rounded-xl bg-[#0F2A4A] text-white text-xs font-semibold shadow-2xl flex items-center gap-2 border border-[#0062FF]/30">
          <CheckCircle2 className="w-4 h-4 text-[#00BCD4]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200/60 text-[#0062FF] text-xs font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            Çoklu Seans & E-Fatura Motoru
          </div>
          <h2 className="text-2xl font-bold text-[#0F2A4A]">
            Paket Satışları & Otomatik E-Arşiv
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Reformer pilates, güzellik seansları ve terapi paketlerini tanımlayın; her randevuda otomatik seans düşümü yapın.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsSellModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-[#0062FF] hover:bg-[#0051d4] text-white text-xs font-semibold shadow-xs flex items-center gap-2 transition-all"
        >
          <CreditCard className="w-4 h-4" />
          Danışana Paket Sat
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1">
          <span className="text-xs text-slate-500 font-medium">Aktif Paket Sayısı</span>
          <div className="text-2xl font-bold text-[#0F2A4A]">
            {clientPackages.filter((p) => p.status === "ACTIVE").length}
          </div>
          <div className="text-[11px] text-[#0062FF] font-medium">Yürürlükteki Paketler</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1">
          <span className="text-xs text-slate-500 font-medium">Kullanılan Seans</span>
          <div className="text-2xl font-bold text-indigo-600">
            {clientPackages.reduce((acc, p) => acc + p.usedSessions, 0)} Seans
          </div>
          <div className="text-[11px] text-indigo-500 font-medium">Tamamlanan Randevular</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1">
          <span className="text-xs text-slate-500 font-medium">Kalan Seans Stoğu</span>
          <div className="text-2xl font-bold text-emerald-600">
            {clientPackages.reduce((acc, p) => acc + p.remainingSessions, 0)} Seans
          </div>
          <div className="text-[11px] text-emerald-600 font-medium">Gelecek Randevu Hakkı</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1">
          <span className="text-xs text-slate-500 font-medium">E-Fatura Entegrasyonu</span>
          <div className="text-2xl font-bold text-[#0F2A4A] flex items-center gap-1.5">
            <Receipt className="w-5 h-5 text-[#0062FF]" /> %100
          </div>
          <div className="text-[11px] text-slate-400">Paraşüt & BizimHesap</div>
        </div>
      </div>

      {/* Package Catalog Cards */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-[#0F2A4A] flex items-center gap-2">
          <Package className="w-5 h-5 text-[#0062FF]" />
          Hizmet Paketleri Kataloğu
        </h3>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-4 hover:border-[#0062FF]/40 transition-all"
            >
              <div className="space-y-2">
                <span className="px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200/60 text-[#0062FF] text-[10px] font-bold">
                  {pkg.serviceCategory}
                </span>
                <h4 className="font-bold text-sm text-[#0F2A4A]">{pkg.name}</h4>
                <p className="text-xs text-slate-500 line-clamp-2">{pkg.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">{pkg.totalSessions} Seans • {pkg.validityDays} Gün</span>
                  <span className="font-bold text-sm text-emerald-600">
                    ₺{pkg.price.toLocaleString("tr-TR")}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedPkgId(pkg.id);
                    setIsSellModalOpen(true);
                  }}
                  className="w-full py-1.5 rounded-xl bg-slate-50 hover:bg-[#0062FF] text-slate-700 hover:text-white border border-slate-200 text-xs font-semibold transition-all shadow-2xs"
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
        <h3 className="text-base font-bold text-[#0F2A4A] flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#0062FF]" />
          Aktif Danışan Paket Bakiyeleri & Seans Düşümü
        </h3>

        <div className="rounded-2xl bg-white border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[11px] text-slate-500 uppercase tracking-wider border-b border-slate-200/80 font-semibold">
                <tr>
                  <th className="py-3.5 px-5">Danışan</th>
                  <th className="py-3.5 px-5">Paket Adı</th>
                  <th className="py-3.5 px-5">Kullanılan / Kalan</th>
                  <th className="py-3.5 px-5">Son Geçerlilik</th>
                  <th className="py-3.5 px-5">E-Fatura No</th>
                  <th className="py-3.5 px-5 text-right">Aksiyon</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {clientPackages.map((cp) => (
                  <tr key={cp.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-5 font-semibold text-[#0F2A4A]">
                      <div>{cp.clientName}</div>
                      <div className="text-[11px] text-slate-400 font-normal">{cp.clientPhone}</div>
                    </td>
                    <td className="py-3.5 px-5 font-medium text-slate-700">{cp.packageName}</td>
                    <td className="py-3.5 px-5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 font-semibold text-xs">
                          <span className="text-indigo-600">{cp.usedSessions} Kullanıldı</span>
                          <span className="text-slate-300">•</span>
                          <span className="text-emerald-600">{cp.remainingSessions} Kaldı</span>
                        </div>
                        <div className="w-28 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-[#0062FF] h-full rounded-full"
                            style={{
                              width: `${(cp.usedSessions / cp.totalSessions) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-slate-500 font-mono text-[11px]">{cp.expiresAt}</td>
                    <td className="py-3.5 px-5">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-600 font-mono text-[10px]">
                        {cp.invoiceNumber || "E-Arşiv Düzenlendi"}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        type="button"
                        onClick={() => handleDeductSession(cp)}
                        disabled={cp.remainingSessions <= 0}
                        className="px-3 py-1.5 rounded-lg bg-blue-50 text-[#0062FF] hover:bg-[#0062FF] hover:text-white border border-blue-200/60 text-xs font-semibold transition-all disabled:opacity-40"
                      >
                        -1 Seans Düş
                      </button>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md p-6 rounded-2xl bg-white border border-slate-200 shadow-2xl text-slate-900 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-[#0F2A4A]">Danışana Paket Tanımla</h3>
              <button
                type="button"
                onClick={() => setIsSellModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSellPackage} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Satılacak Paket</label>
                <select
                  value={selectedPkgId}
                  onChange={(e) => setSelectedPkgId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0062FF]"
                >
                  {packages.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.totalSessions} Seans - ₺{p.price.toLocaleString("tr-TR")})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Danışan Adı Soyadı *</label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Örn: Ayşe Demir"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0062FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Telefon Numarası</label>
                <input
                  type="tel"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="05XX XXX XX XX"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono tabular-nums text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0062FF]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSellModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#0062FF] hover:bg-[#0051d4] text-white shadow-xs"
                >
                  Paketi Sat & Fatura Kes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
