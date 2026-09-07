'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, Calendar, Clock, Loader2, MessageCircle } from 'lucide-react';

interface CustomerChatbotProps {
  businessSlug?: string;
  businessName?: string;
}

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  suggestedSlots?: Array<{
    id: string;
    time: string;
    date: string;
    serviceName: string;
    isDiscounted?: boolean;
  }>;
}

export function CustomerChatbot({ businessSlug = 'byerman', businessName = 'Randevu Asistanı' }: CustomerChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: `Merhaba! Ben ${businessName} Akıllı Randevu Asistanıyım. En uygun saati bulabilir veya aklınızdaki soruları yanıtlayabilirim.`,
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat/customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          businessSlug,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const botMsg: Message = {
          id: `bot_${Date.now()}`,
          sender: 'bot',
          text: data.reply || 'Size yardımcı olmaktan mutluluk duyarım.',
          suggestedSlots: data.suggestedSlots,
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        throw new Error('API yanıt vermedi');
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot_err_${Date.now()}`,
          sender: 'bot',
          text: 'Bağlantıda küçük bir gecikme oldu. Dilerseniz WhatsApp butonundan bize doğrudan ulaşabilirsiniz.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button — Signature Brand Gradient & Pulse Status */}
      <div className="fixed right-6 bottom-6 z-50">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="group relative w-14 h-14 bg-gradient-to-tr from-[#0F2A4A] to-[#0062FF] hover:scale-105 active:scale-95 text-white rounded-2xl shadow-xl shadow-[#0062FF]/20 border border-white/30 flex items-center justify-center transition-all cursor-pointer"
            aria-label="Randevu Asistanı"
          >
            <MessageCircle className="w-6 h-6 text-white group-hover:scale-110 transition-transform" strokeWidth={2.2} />
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white"></span>
            </span>
          </button>
        )}
      </div>

      {/* Chatbox Window — Apple & Linear Light Luxury Aesthetic */}
      {isOpen && (
        <div className="fixed right-4 sm:right-6 bottom-4 sm:bottom-6 z-50 w-[94vw] max-w-sm rounded-2xl border border-slate-200/90 bg-white shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200 max-h-[540px]">
          {/* Header — Crisp White with Subtle Divider */}
          <div className="flex items-center justify-between bg-white px-4 py-3.5 border-b border-slate-100 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#0F2A4A] to-[#0062FF] text-white shadow-xs">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold leading-tight text-[#0F2A4A]">{businessName}</h4>
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Yapay Zeka Asistanı
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1.5 text-slate-400 hover:text-[#0F2A4A] hover:bg-slate-100 transition-colors"
              aria-label="Kapat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages Area — Soft #FAFBFC Canvas */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FAFBFC] text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl px-4 py-3 leading-relaxed shadow-2xs ${
                    m.sender === 'user'
                      ? 'bg-[#0062FF] text-white rounded-br-xs shadow-blue-500/10'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs'
                  }`}
                >
                  <p className={`whitespace-pre-line text-xs ${m.sender === 'user' ? 'text-white font-medium' : 'text-slate-800'}`}>
                    {m.text}
                  </p>
                </div>

                {/* Önerilen Slotlar */}
                {m.suggestedSlots && m.suggestedSlots.length > 0 && (
                  <div className="mt-2.5 w-full space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Önerilen Randevu Saatleri:
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {m.suggestedSlots.map((slot) => (
                        <button
                          key={slot.id}
                          onClick={() => handleSend(`${slot.date} ${slot.time} randevusunu seçiyorum`)}
                          className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-white hover:border-[#0062FF] hover:bg-blue-50/40 transition-all text-left group shadow-2xs"
                        >
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-[#0062FF]" />
                            <span className="font-mono font-bold tabular-nums text-slate-800 text-xs group-hover:text-[#0062FF]">
                              {slot.time}
                            </span>
                          </div>
                          {slot.isDiscounted && (
                            <span className="text-[9px] font-bold bg-amber-500 text-white px-1.5 py-0.5 rounded-full">
                              -%20
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-slate-400 text-xs p-2 bg-white rounded-xl border border-slate-100 w-fit">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-[#0062FF]" />
                <span className="text-slate-500 font-medium">Asistan yanıt hazırlıyor...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Chips */}
          <div className="px-3 py-2 bg-white border-t border-slate-100 flex gap-1.5 overflow-x-auto no-scrollbar text-[11px]">
            {[
              'Yarın boş yer var mı?',
              'Fiyat listesi nedir?',
              'Neredesiniz? (Konum)',
              'Hangi ustalar var?',
            ].map((chip) => (
              <button
                key={chip}
                onClick={() => handleSend(chip)}
                className="shrink-0 rounded-full border border-slate-200/90 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 hover:text-[#0062FF] px-3 py-1 text-slate-600 font-medium transition-all shadow-2xs"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2 border-t border-slate-200/80 bg-white p-2.5"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Bir soru yazın veya gün belirtin..."
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#0062FF] focus:bg-white transition-all"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0062FF] hover:bg-[#0052d9] text-white disabled:opacity-40 transition-all shadow-xs cursor-pointer"
              aria-label="Gönder"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}

export default CustomerChatbot;
