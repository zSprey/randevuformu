'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Clock, Sparkles, ChevronDown } from 'lucide-react';
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
  /** 'customer' = müşteri tarafı, 'business' = işletme panel */
  mode?: 'customer' | 'business';
  /** İşletme slug'ı (müşteri modu için) */
  businessSlug?: string;
  /** İşletme ID (business modu için) */
  businessId?: string;
}

export default function ChatbotWidget({
  mode = 'customer',
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
      const storedName = localStorage.getItem('rf_tenant_name');
      const storedUser = localStorage.getItem('rf_user');
      const storedTenant = localStorage.getItem('rf_tenant');

      if (storedUser === 'byerman' && storedTenant === 'byerman') {
        setBusinessName('By Erman Hair Studio');
      } else if (storedName && !storedName.includes('Ahmet') && storedName !== 'İşletme Yönetim Paneli') {
        setBusinessName(storedName);
      }
    } catch {}
  }, []);

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
      const greeting: ChatMessage = {
        id: 'welcome',
        role: 'assistant',
        content:
          mode === 'business'
            ? `Merhaba! Ben ${businessName} AI operasyon asistanıyım. Günlük randevu özetinizi, ciro analizinizi veya bekleme listesi durumunuzu sorabileceğiniz bir yardımcınızım.`
            : `Merhaba! Ben ${businessName} akıllı randevu asistanıyım. Size en uygun randevu saatini bulabilir, hizmetlerimiz ve fiyatlarımız hakkında bilgi verebilirim. Nasıl yardımcı olabilirim?`,
        timestamp: new Date(),
        quickActions:
          mode === 'business'
            ? ['Bugünkü randevularım', 'Günlük ciro özeti', 'Bekleme listesi']
            : ['Bugün boş yer var mı?', 'Hizmet & Fiyat Listesi', 'Yarın için randevu'],
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
      const body =
        mode === 'business'
          ? { message: text.trim(), businessId: businessId || 'cl_demo_business_123' }
          : { message: text.trim(), businessSlug: businessSlug || localStorage.getItem('rf_tenant') || 'byerman' };

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
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full shadow-2xl shadow-indigo-500/30 flex items-center justify-center text-white hover:shadow-indigo-500/50 transition-shadow"
            aria-label="Sohbet Asistanı"
          >
            <MessageCircle className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-4rem)] bg-[#0A0F1C] border border-[#1E293B] rounded-2xl shadow-2xl shadow-black/40 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border-b border-[#1E293B] px-4 py-3 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white leading-tight truncate max-w-[200px]">
                    {businessName}
                  </p>
                  <p className="text-[10px] text-indigo-300">
                    {mode === 'business' ? 'Operasyon Asistanı' : 'Randevu Asistanı'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-800/60 hover:bg-slate-700 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scrollbar-thin scrollbar-thumb-slate-800">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-indigo-600 text-white rounded-br-sm'
                        : msg.isBlockedTopic
                        ? 'bg-amber-900/30 border border-amber-700/40 text-amber-100 rounded-bl-sm'
                        : 'bg-[#141B2D] border border-[#1E293B] text-slate-200 rounded-bl-sm'
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.content}</p>

                    {/* Suggested Slots */}
                    {msg.suggestedSlots && msg.suggestedSlots.length > 0 && (
                      <div className="mt-2.5 space-y-1.5">
                        {msg.suggestedSlots.map((slot) => (
                          <div
                            key={slot.id}
                            className="flex items-center gap-2 bg-slate-900/60 rounded-xl px-3 py-2 border border-slate-700/50"
                          >
                            <div className="relative">
                              <div className="w-10 h-10 bg-indigo-600/20 rounded-lg flex items-center justify-center">
                                <Clock className="w-4 h-4 text-indigo-400" />
                              </div>
                              {slot.isDiscounted && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-[8px] text-white px-1 rounded-full font-bold">
                                  -%20
                                </span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-white">{slot.time}</p>
                              <p className="text-[10px] text-slate-400 truncate">{slot.serviceName}</p>
                            </div>
                            <button className="text-[10px] bg-indigo-600 hover:bg-indigo-500 text-white px-2.5 py-1 rounded-lg font-medium transition-colors">
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
                            className="text-[11px] bg-slate-800/80 hover:bg-indigo-600/30 border border-slate-600/40 hover:border-indigo-500/40 text-slate-300 hover:text-indigo-200 px-2.5 py-1.5 rounded-lg transition-all"
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
                  <div className="bg-[#141B2D] border border-[#1E293B] rounded-2xl rounded-bl-sm px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0ms]" />
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:150ms]" />
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form
              onSubmit={handleSubmit}
              className="border-t border-[#1E293B] px-3 py-2.5 flex items-center gap-2 shrink-0 bg-[#0D1220]"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  mode === 'business' ? 'Ciro, randevu, bekleme listesi...' : 'Randevu, hizmetler, fiyatlar...'
                }
                className="flex-1 bg-[#141B2D] border border-[#1E293B] rounded-xl px-3.5 py-2.5 text-[13px] text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 transition-colors"
                disabled={isTyping}
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="w-10 h-10 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 rounded-xl flex items-center justify-center text-white transition-colors shrink-0"
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
