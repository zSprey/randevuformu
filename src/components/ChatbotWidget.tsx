'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Clock, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestedSlots?: Array<{
    id: string;
    time: string;
    date: string;
    serviceName: string;
    isDiscounted?: boolean;
  }>;
  quickActions?: string[];
  isBlockedTopic?: boolean;
}

interface ChatbotWidgetProps {
  /** 'platform' = ana sayfa / genel platform, 'customer' = müşteri randevu sayfası, 'business' = işletme paneli */
  mode?: 'platform' | 'customer' | 'business';
  /** İşletme slug'ı (müşteri modu için) */
  businessSlug?: string;
  /** İşletme ID (business modu için) */
  businessId?: string;
}

export default function ChatbotWidget({
  mode = 'platform',
  businessSlug,
  businessId,
}: ChatbotWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [businessName, setBusinessName] = useState('randevuformu.com');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;

      if (mode === 'platform') {
        // Ana sayfada her zaman platform rehberidir; işletme adıyla karışmaz!
        setBusinessName('randevuformu.com');
        return;
      }

      // İşletme paneli veya randevu sayfasında işletmenin adını çek
      const storedName = localStorage.getItem('rf_tenant_name');
      const storedUser = localStorage.getItem('rf_user');
      const storedTenant = localStorage.getItem('rf_tenant');

      if (storedUser === 'byerman' && storedTenant === 'byerman') {
        setBusinessName('By Erman Hair Studio');
      } else if (storedName && !storedName.includes('Ahmet') && storedName !== 'İşletme Yönetim Paneli') {
        setBusinessName(storedName);
      } else if (businessSlug && businessSlug !== 'platform') {
        setBusinessName(businessSlug.charAt(0).toUpperCase() + businessSlug.slice(1));
      }
    } catch {}
  }, [mode, businessSlug]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // İlk açılışta karşılama mesajı
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      let initialGreeting = '';
      let initialActions: string[] = [];

      if (mode === 'platform') {
        initialGreeting = 'Merhaba! Ben randevuformu.com platform rehberiyim. 1 dakikada ücretsiz randevu formu açma, WhatsApp onayları veya sistem özellikleri hakkında size nasıl yardımcı olabilirim?';
        initialActions = ['Nasıl form açarım?', 'Ücretli mi?', 'Özellikler neler?'];
      } else if (mode === 'business') {
        initialGreeting = `Merhaba! Ben ${businessName} operasyon asistanıyım. Günlük randevu özetinizi, ciro durumunuzu veya bekleme listenizi inceleyebilirim.`;
        initialActions = ['Bugünkü randevularım', 'Günlük ciro özeti', 'Bekleme listesi'];
      } else {
        initialGreeting = `Merhaba! Ben ${businessName} randevu asistanıyım. Size en uygun randevu saatini bulabilir, hizmetler ve fiyatlar hakkında bilgi verebilirim.`;
        initialActions = ['Bugün boş yer var mı?', 'Hizmet & Fiyat Listesi', 'Yarın için randevu'];
      }

      const greeting: ChatMessage = {
        id: 'welcome',
        role: 'assistant',
        content: initialGreeting,
        timestamp: new Date(),
        quickActions: initialActions,
      };
      setMessages([greeting]);
    }
  }, [isOpen, messages.length, mode, businessName]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const endpoint = mode === 'business' ? '/api/chat/business' : '/api/chat/customer';
      const effectiveSlug = mode === 'platform' ? 'platform' : (businessSlug || localStorage.getItem('rf_tenant') || 'byerman');

      const body =
        mode === 'business'
          ? { message: text.trim(), businessId: businessId || 'cl_demo_business_123' }
          : { message: text.trim(), businessSlug: effectiveSlug };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: data.reply || data.greeting || 'Şu anda yanıt veremedim.',
        timestamp: new Date(),
        suggestedSlots: data.suggestedSlots,
        quickActions: data.quickActions,
        isBlockedTopic: data.isBlockedTopic,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: 'Bağlantı sorunu yaşanıyor. Lütfen tekrar deneyin.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleQuickAction = (action: string) => {
    sendMessage(action);
  };

  return (
    <>
      {/* Floating Button — Marka renkleriyle uyumlu (Navy + Cyan aksan, Mor/Neon YOK) */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#0F2A4A] hover:bg-[#0062FF] text-white rounded-full shadow-lg shadow-[#0F2A4A]/25 border border-white/20 flex items-center justify-center transition-all"
            aria-label="Sohbet Asistanı"
          >
            <MessageCircle className="w-6 h-6 text-[#00BCD4]" strokeWidth={2} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel — Temiz Kurumsal Tasarım (Beyaz & Açık Gri zemin, Yüksek Kontrast) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-4rem)] bg-[#FAFBFC] border border-slate-200/90 rounded-2xl shadow-2xl shadow-slate-900/15 flex flex-col overflow-hidden"
          >
            {/* Header — Kurumsal Deep Navy */}
            <div className="bg-[#0F2A4A] px-4 py-3.5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-[#0062FF] rounded-lg flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-white leading-tight truncate max-w-[200px]">
                    {businessName}
                  </p>
                  <p className="text-[11px] text-[#00BCD4]">
                    {mode === 'platform' ? 'Platform Danışmanı' : mode === 'business' ? 'İşletme Asistanı' : 'Randevu Asistanı'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                aria-label="Kapat"
              >
                <X className="w-4 h-4 text-white/80" />
              </button>
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto px-4 py-3.5 space-y-3">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed shadow-xs ${
                      msg.role === 'user'
                        ? 'bg-[#0062FF] text-white rounded-br-xs'
                        : msg.isBlockedTopic
                        ? 'bg-amber-50 border border-amber-200 text-amber-900 rounded-bl-xs'
                        : 'bg-white border border-slate-200/90 text-slate-800 rounded-bl-xs'
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.content}</p>

                    {/* Suggested Slots */}
                    {msg.suggestedSlots && msg.suggestedSlots.length > 0 && (
                      <div className="mt-2.5 space-y-1.5">
                        {msg.suggestedSlots.map((slot) => (
                          <div
                            key={slot.id}
                            className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2 border border-slate-200"
                          >
                            <div className="relative">
                              <div className="w-9 h-9 bg-[#0062FF]/10 rounded-lg flex items-center justify-center">
                                <Clock className="w-4 h-4 text-[#0062FF]" />
                              </div>
                              {slot.isDiscounted && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-[8px] text-white px-1 rounded-full font-bold">
                                  -%20
                                </span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-[#0F2A4A]">{slot.time}</p>
                              <p className="text-[10px] text-slate-500 truncate">{slot.serviceName}</p>
                            </div>
                            <button className="text-[10px] bg-[#0062FF] hover:bg-[#0051d4] text-white px-2.5 py-1 rounded-lg font-medium transition-colors">
                              Seç
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Quick Actions */}
                    {msg.quickActions && msg.quickActions.length > 0 && (
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {msg.quickActions.map((action, i) => (
                          <button
                            key={i}
                            onClick={() => handleQuickAction(action)}
                            className="text-[11px] bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-[#0062FF] px-2.5 py-1.5 rounded-lg transition-colors shadow-xs"
                          >
                            {action}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-xs px-4 py-2.5 shadow-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-[#0062FF] rounded-full animate-bounce [animation-delay:0ms]" />
                      <div className="w-1.5 h-1.5 bg-[#0062FF] rounded-full animate-bounce [animation-delay:150ms]" />
                      <div className="w-1.5 h-1.5 bg-[#0062FF] rounded-full animate-bounce [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form
              onSubmit={handleSubmit}
              className="border-t border-slate-200/90 px-3 py-2.5 flex items-center gap-2 shrink-0 bg-white"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  mode === 'platform'
                    ? 'Sistem veya form hakkında bir soru yazın...'
                    : mode === 'business'
                    ? 'Ciro, randevu sayısı, bekleme listesi...'
                    : 'Randevu, hizmetler, fiyatlar...'
                }
                className="flex-1 bg-[#F1F5F9] border border-slate-200 rounded-xl px-3.5 py-2 text-[13px] text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#0062FF] transition-colors"
                disabled={isTyping}
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="w-9 h-9 bg-[#00BCD4] hover:bg-[#00acc1] disabled:opacity-40 rounded-xl flex items-center justify-center text-white transition-colors shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
