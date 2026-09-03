'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, Calendar, Clock, Loader2 } from 'lucide-react';

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
      {/* Floating Action Pill / Button */}
      <div className="fixed right-4 bottom-safe z-40 mb-16 sm:mb-16">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 rounded-full bg-zinc-900 px-4 py-3 text-white shadow-xl transition-transform hover:scale-105 active:scale-95 border border-zinc-700 min-h-[44px]"
            aria-label="AI Randevu Asistanı"
          >
            <Sparkles className="h-5 w-5 text-amber-400" />
            <span className="text-xs font-semibold tracking-tight">AI Asistan</span>
          </button>
        )}
      </div>

      {/* Chatbox Window */}
      {isOpen && (
        <div className="fixed right-4 bottom-safe z-50 mb-16 w-[92vw] max-w-sm rounded-2xl border border-zinc-200/90 bg-white shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200 max-h-[520px]">
          {/* Header */}
          <div className="flex items-center justify-between bg-zinc-900 px-4 py-3 text-white">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-amber-400 border border-zinc-700">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold leading-tight">{businessName}</h4>
                <span className="text-[10px] text-emerald-400 font-medium">● Çevrimiçi Asistan</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-zinc-50/50 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-zinc-900 text-white rounded-br-none'
                      : 'bg-white text-zinc-800 border border-zinc-200/80 rounded-bl-none shadow-sm'
                  }`}
                >
                  <p className="whitespace-pre-line">{m.text}</p>
                </div>

                {/* Önerilen Slotlar */}
                {m.suggestedSlots && m.suggestedSlots.length > 0 && (
                  <div className="mt-2.5 w-full space-y-1.5">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                      Önerilen Randevu Saatleri:
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {m.suggestedSlots.map((slot) => (
                        <button
                          key={slot.id}
                          onClick={() => handleSend(`${slot.date} ${slot.time} randevusunu seçiyorum`)}
                          className="flex items-center justify-between p-2 rounded-lg border border-zinc-200 bg-white hover:border-zinc-900 transition-colors text-left"
                        >
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-zinc-500" />
                            <span className="font-mono font-bold tabular-nums text-zinc-900 text-xs">{slot.time}</span>
                          </div>
                          {slot.isDiscounted && (
                            <span className="text-[9px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full">
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
              <div className="flex items-center gap-2 text-zinc-400 text-xs">
                <Loader2 className="h-4 w-4 animate-spin text-zinc-600" />
                <span>Asistan yanıt hazırlıyor...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Chips */}
          <div className="px-3 py-1.5 bg-white border-t border-zinc-100 flex gap-1.5 overflow-x-auto text-[11px]">
            <button
              onClick={() => handleSend('Yarın boş yer var mı?')}
              className="shrink-0 rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-zinc-600 hover:bg-zinc-100"
            >
              Yarın Boş Yerler
            </button>
            <button
              onClick={() => handleSend('Fiyatlar nedir?')}
              className="shrink-0 rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-zinc-600 hover:bg-zinc-100"
            >
              Fiyat Listesi
            </button>
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2 border-t border-zinc-200 bg-white p-2.5"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Bir soru yazın veya gün belirtin..."
              className="flex-1 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 text-white disabled:opacity-40 transition-opacity"
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
