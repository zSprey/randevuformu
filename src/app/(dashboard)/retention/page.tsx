"use client";

import React, { useState } from "react";
import {
  RotateCcw,
  Sparkles,
  BellRing,
  CheckCircle2,
  Calendar,
  Send,
  Plus,
  TrendingUp,
  Percent,
  Clock,
  ExternalLink,
} from "lucide-react";
import {
  INITIAL_RECALL_RULES,
  INITIAL_PENDING_RECALLS,
  RecallRule,
  PendingRecall,
} from "@/lib/retentionEngine";

export default function RetentionPage() {
  const [rules, setRules] = useState<RecallRule[]>(INITIAL_RECALL_RULES);
  const [recalls, setRecalls] = useState<PendingRecall[]>(INITIAL_PENDING_RECALLS);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Rule Modal State
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [ruleName, setRuleName] = useState("");
  const [ruleCategory, setRuleCategory] = useState("Diş Hekimliği");
  const [ruleDays, setRuleDays] = useState(90);
  const [ruleDiscount, setRuleDiscount] = useState(10);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSendRecall = (recall: PendingRecall) => {
    recall.status = "SENT";
    setRecalls([...recalls]);
    showToast(`✅ ${recall.clientName} danışanına hatırlatma SMS'i ve randevu linki iletildi!`);
  };

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleName) return;

    const newRule: RecallRule = {
      id: `rec-${Date.now()}`,
      name: ruleName,
      category: ruleCategory,
      intervalDays: ruleDays,
      messageTemplate: `Merhaba {CLIENT_NAME}, ${ruleName} zamanınız geldi. %${ruleDiscount} indirimle randevu oluşturun: {BOOKING_URL}`,
      discountPercentage: ruleDiscount,
      isActive: true,
    };

    setRules([newRule, ...rules]);
    setIsRuleModalOpen(false);
    setRuleName("");
    showToast(`✅ "${ruleName}" hatırlatma kuralı aktif edildi!`);
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
            Akıllı Müşteri Sadakati & Geri Çağırma
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Otomatik Randevu Hatırlatma & Müşteri Koruma (Recall)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Belirli süre randevu almayan danışanlara otomatik kişiselleştirilmiş SMS/WhatsApp mesajları göndererek tekrar eden gelirinizi artırın.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsRuleModalOpen(true)}
          className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          Yeni Geri Çağırma Kuralı
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Bekleyen Hatırlatma</span>
          <div className="text-2xl sm:text-3xl font-black text-amber-400">
            {recalls.filter((r) => r.status === "PENDING").length} Danışan
          </div>
          <div className="text-[11px] text-amber-300">Vakti Gelen Randevular</div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Geri Dönüş Oranı</span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400">%41.8</div>
          <div className="text-[11px] text-emerald-300 flex items-center gap-1 font-semibold">
            <TrendingUp className="w-3 h-3" /> Sektör Ortalamasının 2.4x Katı
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Kurtarılan Aylık Ciro</span>
          <div className="text-2xl sm:text-3xl font-black text-indigo-400">₺34.500</div>
          <div className="text-[11px] text-indigo-300">Tekrar Eden Hasta Geliri</div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Vercel 09:00 Cron</span>
          <div className="text-2xl sm:text-3xl font-black text-white flex items-center gap-1.5">
            <Clock className="w-6 h-6 text-indigo-400" /> Aktif
          </div>
          <div className="text-[11px] text-slate-400">Her Sabah Otomatik Tarama</div>
        </div>
      </div>

      {/* Active Rules Grid */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <RotateCcw className="w-5 h-5 text-indigo-400" />
          Aktif Geri Çağırma & Sadakat Kuralları
        </h3>

        <div className="grid md:grid-cols-3 gap-4">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className="p-5 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-4 shadow-xl"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[10px] font-bold">
                    {rule.category}
                  </span>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                    {rule.intervalDays} Günde Bir
                  </span>
                </div>
                <h4 className="font-bold text-sm text-white">{rule.name}</h4>
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-3 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                  {rule.messageTemplate}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Otomatik Çalışıyor
                </span>
                {rule.discountPercentage && (
                  <span className="text-amber-300 font-semibold">%{rule.discountPercentage} İndirimli</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pending Recalls Queue */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <BellRing className="w-5 h-5 text-amber-400" />
          Vakti Gelen Danışan Kuyruğu ({recalls.length} Kişi)
        </h3>

        <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 text-[11px] text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-4 px-6">Danışan</th>
                  <th className="py-4 px-6">Son Ziyaret</th>
                  <th className="py-4 px-6">Geçen Süre</th>
                  <th className="py-4 px-6">Tetiklenen Kural & Hizmet</th>
                  <th className="py-4 px-6">Özel Randevu Linki</th>
                  <th className="py-4 px-6 text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recalls.map((rec) => (
                  <tr key={rec.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-6 font-bold text-white">
                      <div>{rec.clientName}</div>
                      <div className="text-[11px] text-slate-500 font-normal">{rec.clientPhone}</div>
                    </td>
                    <td className="py-4 px-6 text-slate-300 font-mono text-[11px]">{rec.lastVisitDate}</td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 font-bold text-[11px]">
                        {rec.daysPassed} Gün Geçti
                      </span>
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-200">
                      <div>{rec.ruleName}</div>
                      <div className="text-[11px] text-indigo-400">{rec.suggestedService}</div>
                    </td>
                    <td className="py-4 px-6">
                      <a
                        href={rec.bookingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-indigo-300 hover:underline font-mono"
                      >
                        randevuformu.com/dr-ahmet... <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {rec.status === "PENDING" ? (
                        <button
                          type="button"
                          onClick={() => handleSendRecall(rec)}
                          className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 flex items-center gap-1.5 ml-auto transition-all hover:scale-105"
                        >
                          <Send className="w-3 h-3" /> Hatırlatmayı Gönder
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-bold text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5" /> İletildi
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* New Rule Modal */}
      {isRuleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-indigo-400" /> Yeni Geri Çağırma Kuralı Tanımla
            </h3>

            <form onSubmit={handleCreateRule} className="space-y-3.5">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Kural Başlığı</label>
                <input
                  type="text"
                  required
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                  placeholder="Örn: 90 Günlük Cilt Bakımı Yenileme"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Hatırlatma Süresi (Gün)</label>
                  <input
                    type="number"
                    value={ruleDays}
                    onChange={(e) => setRuleDays(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Sadakat İndirimi (%)</label>
                  <input
                    type="number"
                    value={ruleDiscount}
                    onChange={(e) => setRuleDiscount(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsRuleModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-400"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30"
                >
                  Kuralı Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
