"use client";

import Link from 'next/link';
import { CalendarDays, CheckCircle2, MessageCircle, Phone, ArrowRight, Sparkles, Zap, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "randevuformu.com",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "TRY",
      "description": "Temel randevu alma özellikleri tamamen ücretsiz."
    },
    "description": "Diş hekimi, güzellik salonu, psikolog veya avukatlar için WhatsApp bildirimli, SMS hatırlatmalı ücretsiz online randevu yönetim sistemi.",
    "url": "https://randevuformu.com"
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] text-slate-900 selection:bg-indigo-100 selection:text-indigo-900 font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Modern Navbar */}
      <header className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-md border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-1.5 rounded-lg group-hover:scale-105 transition-transform">
              <CalendarDays className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
              randevuformu
            </span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/login" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
              Giriş Yap
            </Link>
            <Link href="/register" className="text-sm font-semibold bg-slate-900 text-white px-5 py-2.5 rounded-full hover:bg-slate-800 transition-all hover:scale-105 shadow-md hover:shadow-xl hover:shadow-slate-900/20 active:scale-95">
              Ücretsiz Başla
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 pt-24 pb-16">
        <section className="relative pt-20 md:pt-32 px-6 overflow-hidden">
          {/* Background Elements */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 blur-[120px] rounded-full -z-10 pointer-events-none" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none -z-10" />

          <div className="max-w-5xl mx-auto text-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50/80 border border-indigo-100/50 backdrop-blur-sm text-indigo-700 text-sm font-bold mb-8 shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span>WhatsApp Entegrasyonu Aktif</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl md:text-7xl font-extrabold tracking-tighter text-slate-900 leading-[1.1] mb-6"
            >
              Randevuları yönetmenin <br className="hidden md:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                en zarif yolu.
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-10 font-medium"
            >
              Geleneksel telefon trafiğini unutun. Müşterileriniz saniyeler içinde randevu alsın, sistem size ve müşteriye otomatik WhatsApp mesajı göndersin.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link href="/register" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 hover:scale-105 active:scale-95">
                Hemen Ücretsiz Başla
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/dr-ahmet" className="w-full sm:w-auto flex items-center justify-center px-8 py-4 rounded-full font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all hover:scale-105 active:scale-95 shadow-sm">
                Örnek Sayfayı İncele
              </Link>
            </motion.div>
          </div>

          {/* Hero Image Mockup (Abstract representation) */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-20 max-w-5xl mx-auto relative"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-[2rem] blur opacity-20"></div>
            <div className="relative bg-white/80 backdrop-blur-xl border border-white/40 rounded-[2rem] shadow-2xl overflow-hidden aspect-video flex items-center justify-center p-8">
               <div className="w-full h-full border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 flex flex-col items-center justify-center text-slate-400">
                  <CalendarDays className="w-16 h-16 mb-4 opacity-50" />
                  <p className="font-medium">Modern Randevu Takvimi Arayüzü</p>
               </div>
            </div>
          </motion.div>
        </section>

        {/* Features Grid */}
        <section className="py-32 px-6 max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-6">Neden randevuformu?</h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">İşletmenizi dijitalleştirirken prestijinizi artıracak, müşterilerinize güven verecek detaylar.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div whileHover={{ y: -5 }} className="p-8 rounded-[2rem] bg-white border border-slate-200 shadow-sm hover:shadow-xl transition-all">
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                <Zap className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">Sürtünmesiz Deneyim</h3>
              <p className="text-slate-500 font-medium leading-relaxed">Kullanıcılar uygulamaya ihtiyaç duymadan, saniyeler içinde mükemmel bir arayüzden randevularını oluşturur.</p>
            </motion.div>

            <motion.div whileHover={{ y: -5 }} className="p-8 rounded-[2rem] bg-white border border-slate-200 shadow-sm hover:shadow-xl transition-all">
              <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6">
                <MessageCircle className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">Otomatik WhatsApp</h3>
              <p className="text-slate-500 font-medium leading-relaxed">Randevu anında, bir gün önce ve iptal durumlarında otomatik WhatsApp mesajlarıyla iletişimde kalın.</p>
            </motion.div>

            <motion.div whileHover={{ y: -5 }} className="p-8 rounded-[2rem] bg-white border border-slate-200 shadow-sm hover:shadow-xl transition-all">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                <Shield className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">Prestijli Görünüm</h3>
              <p className="text-slate-500 font-medium leading-relaxed">Sıradan formlar yerine, markanızın kalitesini yansıtan "world-class" bir rezervasyon sayfası sunun.</p>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Modern Footer */}
      <footer className="bg-white border-t border-slate-200 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-slate-900 text-white p-1 rounded-md">
              <CalendarDays className="w-4 h-4" />
            </div>
            <span className="font-bold tracking-tight text-slate-900">randevuformu</span>
          </div>
          <p className="text-sm font-medium text-slate-400">&copy; {new Date().getFullYear()} Tüm hakları saklıdır.</p>
        </div>
      </footer>
    </div>
  );
}
