'use client';

import React from 'react';
import { Sparkles, X, Check, Copy } from 'lucide-react';

interface ClinicalSummaryModalProps {
  customerName: string;
  serviceName: string;
  summary: string;
  onClose: () => void;
}

export function ClinicalSummaryModal({
  customerName,
  serviceName,
  summary,
  onClose,
}: ClinicalSummaryModalProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200/60">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900">Yapılandırılmış Klinik Kartı</h3>
              <p className="text-[11px] text-zinc-500">{customerName} — {serviceName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/70 p-4">
          <div className="whitespace-pre-line font-sans text-xs leading-relaxed text-zinc-800 space-y-2">
            {summary}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
            <span>{copied ? 'Kopyalandı' : 'Metni Kopyala'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] rounded-xl bg-zinc-900 px-5 py-2 text-xs font-semibold text-white hover:bg-zinc-800"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}

export default ClinicalSummaryModal;
