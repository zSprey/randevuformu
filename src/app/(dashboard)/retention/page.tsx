"use client";

import React, { useState } from "react";
import {
  RotateCcw,
  Sparkles,
  BellRing,
  CheckCircle2,
  Send,
  Plus,
  TrendingUp,
  Clock,
  ExternalLink,
  X,
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
  const [ruleCategory, setRuleCategory] = useState("Genel Randevu");
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
            Akıllı Müşteri Sadakati & Geri Çağırma
          </div>
          <h2 className="text-2xl font-bold text-[#0F2A4A]">
            Otomatik Randevu Hatırlatma & Müşteri Koruma (Recall)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Belirli süre randevu almayan danışanlara otomatik kişiselleştirilmiş bildirimler göndererek cironuzu artırın.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsRuleModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-[#0062FF] hover:bg-[#0051d4] text-white text-xs font-semibold shadow-xs flex items-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          Yeni Kural Ekle
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1">
          <span className="text-xs text-slate-500 font-medium">Bekleyen Hatırlatma</span>
          <div className="text-2xl font-bold text-amber-600">
            {recalls.filter((r) => r.status === "PENDING").length} Danışan
          </div>
          <div className="text-[11px] text-amber-600 font-medium">Vakti Gelen Randevular</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1">
          <span className="text-xs text-slate-500 font-medium">Geri Dönüş Oranı</span>
          <div className="text-2xl font-bold text-emerald-600">%41.8</div>
          <div className="text-[11px] text-emerald-600 flex items-center gap-1 font-semibold">
            <TrendingUp className="w-3 h-3" /> Sektör Ortalamasının 2.4x Katı
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1">
          <span className="text-xs text-slate-500 font-medium">Kurtarılan Aylık Ciro</span>
          <div className="text-2xl font-bold text-[#0F2A4A]">₺34.500</div>
          <div className="text-[11px] text-[#0062FF] font-medium">Tekrar Eden Danışan Geliri</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1">
          <span className="text-xs text-slate-500 font-medium">Otomasyon Durumu</span>
          <div className="text-2xl font-bold text-[#0F2A4A] flex items-center gap-1.5">
            <Clock className="w-5 h-5 text-emerald-600" /> Aktif
          </div>
          <div className="text-[11px] text-slate-400">Her Sabah Otomatik Tarama</div>
        </div>
      </div>

      {/* Active Rules Grid */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-[#0F2A4A] flex items-center gap-2">
          <RotateCcw className="w-5 h-5 text-[#0062FF]" />
          Aktif Geri Çağırma & Sadakat Kuralları
        </h3>

        <div className="grid md:grid-cols-3 gap-4">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-4 hover:border-[#0062FF]/40 transition-all"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200/60 text-[#0062FF] text-[10px] font-bold">
                    {rule.category}
                  </span>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                    {rule.intervalDays} Günde Bir
                  </span>
                </div>
                <h4 className="font-bold text-sm text-[#0F2A4A]">{rule.name}</h4>
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  {rule.messageTemplate}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Otomatik Çalışıyor
                </span>
                {rule.discountPercentage && (
                  <span className="text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.5 rounded text-[11px]">
                    %{rule.discountPercentage} İndirimli
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pending Recalls Queue */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-[#0F2A4A] flex items-center gap-2">
          <BellRing className="w-5 h-5 text-amber-500" />
          Vakti Gelen Danışan Kuyruğu ({recalls.length} Kişi)
        </h3>

        <div className="rounded-2xl bg-white border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[11px] text-slate-500 uppercase tracking-wider border-b border-slate-200/80 font-semibold">
                <tr>
                  <th className="py-3.5 px-5">Danışan</th>
                  <th className="py-3.5 px-5">Son Ziyaret</th>
                  <th className="py-3.5 px-5">Geçen Süre</th>
                  <th className="py-3.5 px-5">Tetiklenen Kural</th>
                  <th className="py-3.5 px-5 text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recalls.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-5 font-semibold text-[#0F2A4A]">
                      <div>{rec.clientName}</div>
                      <div className="text-[11px] text-slate-400 font-normal">{rec.clientPhone}</div>
                    </td>
                    <td className="py-3.5 px-5 text-slate-500 font-mono text-[11px]">{rec.lastVisitDate}</td>
                    <td className="py-3.5 px-5">
                      <span className="px-2 py-0.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 font-semibold text-[11px]">
                        {rec.daysPassed} Gün Geçti
                      </span>
                    </td>
                    <td className="py-3.5 px-5 font-medium text-slate-700">
                      <div>{rec.ruleName}</div>
                      <div className="text-[11px] text-[#0062FF]">{rec.suggestedService}</div>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      {rec.status === "PENDING" ? (
                        <button
                          type="button"
                          onClick={() => handleSendRecall(rec)}
                          className="px-3.5 py-1.5 rounded-xl bg-[#0062FF] hover:bg-[#0051d4] text-white font-semibold text-xs shadow-xs flex items-center gap-1.5 ml-auto transition-all"
                        >
                          <Send className="w-3 h-3" /> Hatırlatmayı Gönder
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-xs">
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
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-2xl bg-white border border-slate-200 shadow-2xl text-slate-900 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-[#0F2A4A] flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-[#0062FF]" /> Yeni Geri Çağırma Kuralı
              </h3>
              <button
                type="button"
                onClick={() => setIsRuleModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRule} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Kural Başlığı</label>
                <input
                  type="text"
                  required
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                  placeholder="Örn: 90 Günlük Kontrol Hatırlatması"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0062FF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Hatırlatma Süresi (Gün)</label>
                  <input
                    type="number"
                    value={ruleDays}
                    onChange={(e) => setRuleDays(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0062FF]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Sadakat İndirimi (%)</label>
                  <input
                    type="number"
                    value={ruleDiscount}
                    onChange={(e) => setRuleDiscount(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0062FF]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRuleModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0062FF] hover:bg-[#0051d4] text-white text-xs font-semibold shadow-xs"
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
