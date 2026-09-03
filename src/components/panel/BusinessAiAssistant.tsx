'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, Users, AlertTriangle, RefreshCw, CheckCircle2 } from 'lucide-react';
import { BusinessSummaryResponse } from '@/lib/ai/chatbotEngine';

interface BusinessAiAssistantProps {
  businessId?: string;
}

export function BusinessAiAssistant({ businessId = 'cl_demo_business_123' }: BusinessAiAssistantProps) {
  const [data, setData] = useState<BusinessSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/chat/business?businessId=${encodeURIComponent(businessId)}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.warn('Failed to fetch business AI summary:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [businessId]);

  return (
    <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600 border border-amber-200/60">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-zinc-900 tracking-tight">AI İşletme Asistanı</h3>
            <p className="text-[11px] text-zinc-500">Günlük operasyonel brifing ve doluluk analizi</p>
          </div>
        </div>

        <button
          onClick={fetchSummary}
          disabled={loading}
          className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors disabled:opacity-50"
          title="Yenile"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Metrics Row */}
      {data && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl border border-zinc-100 bg-zinc-50/70 p-3">
            <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">Bugün Seans</span>
            <span className="font-mono text-lg font-bold tabular-nums text-zinc-900">
              {data.metrics.totalAppointmentsToday}
            </span>
          </div>

          <div className="rounded-xl border border-zinc-100 bg-zinc-50/70 p-3">
            <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">Bekleyen Onay</span>
            <span className="font-mono text-lg font-bold tabular-nums text-amber-600">
              {data.metrics.pendingCount}
            </span>
          </div>

          <div className="rounded-xl border border-zinc-100 bg-zinc-50/70 p-3">
            <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">Tahmini Ciro</span>
            <span className="font-mono text-lg font-bold tabular-nums text-emerald-600">
              ₺{data.metrics.expectedRevenue}
            </span>
          </div>

          <div className="rounded-xl border border-zinc-100 bg-zinc-50/70 p-3">
            <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">Bekleme Listesi</span>
            <span className="font-mono text-lg font-bold tabular-nums text-indigo-600">
              {data.metrics.waitlistCount}
            </span>
          </div>
        </div>
      )}

      {/* Insights */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold text-zinc-700 block">Operasyonel Öngörüler:</span>
        {loading ? (
          <div className="text-xs text-zinc-400 py-2">Veriler analiz ediliyor...</div>
        ) : (
          <div className="space-y-1.5">
            {data?.insights.map((insight, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-zinc-600 bg-zinc-50 p-2.5 rounded-lg border border-zinc-100">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{insight}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default BusinessAiAssistant;
