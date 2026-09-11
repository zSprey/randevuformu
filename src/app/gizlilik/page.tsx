import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, ArrowLeft, Cookie, Eye, Lock, Mail } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gizlilik ve Çerez Politikası | RandevuFormu",
  description: "RandevuFormu platformu gizlilik ilkeleri, veri güvenliği standartları ve çerez (cookie) kullanım politikası.",
  alternates: {
    canonical: "https://randevuformu.com/gizlilik",
  },
};

export default function GizlilikPage() {
  return (
    <div className="min-h-screen bg-[#FAFBFC] text-slate-900 selection:bg-[#0062FF]/10 selection:text-[#0062FF] flex flex-col justify-between font-sans">
      {/* Navbar Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/icon.png"
              alt="RandevuFormu Logo"
              width={32}
              height={32}
              className="w-8 h-8 rounded-xl object-contain shadow-xs"
            />
            <span className="font-bold text-lg text-slate-900 tracking-tight">
              randevu<span className="text-[#0062FF]">formu</span>
            </span>
          </Link>
          <Link
            href="/"
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 py-1.5 px-3 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Ana Sayfaya Dön</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 flex-1 w-full">
        <div className="mb-10 text-center sm:text-left border-b border-slate-200/80 pb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#0062FF] text-xs font-bold mb-3 border border-blue-100">
            <Eye className="w-4 h-4" />
            <span>Güvenlik ve Şeffaflık Standartları</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#0F2A4A] tracking-tight">
            Gizlilik ve Çerez Politikası
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Son Güncelleme: 11 Eylül 2026
          </p>
        </div>

        <div className="space-y-8 text-slate-700 text-sm sm:text-base leading-relaxed">
          <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-3 text-[#0F2A4A] font-bold text-lg">
              <Lock className="w-5 h-5 text-[#0062FF]" />
              <h2>1. Veri Güvenliği ve Şifreleme Standartlarımız</h2>
            </div>
            <p>
              RandevuFormu, kullanıcıların ve randevu oluşturan müşterilerin verilerini en yüksek endüstri standartlarında korur:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm text-slate-600">
              <li>
                <strong>Uçtan Uca HTTPS/TLS 1.3:</strong> Tüm veri trafiği modern TLS şifreleme sertifikalarıyla korunur; dinleme ve araya girme (Man-in-the-Middle) saldırıları önlenir.
              </li>
              <li>
                <strong>Veritabanı Güvenliği (RLS):</strong> Sistem verileri Row Level Security (Satır Düzeyi Güvenlik) ve parametreli sorgularla saklanır. Bir işletmenin verisine başka bir işletmenin erişmesi mimari olarak imkansızdır.
              </li>
              <li>
                <strong>Parola ve Oturum Koruması:</strong> Şifreler ve oturum token&apos;ları tuzlanmış (salted) güvenli algoritmalar ile saklanır; açık metin olarak asla tutulmaz.
              </li>
            </ul>
          </section>

          <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-3 text-[#0F2A4A] font-bold text-lg">
              <Cookie className="w-5 h-5 text-[#0062FF]" />
              <h2>2. Çerez (Cookie) Kullanımı</h2>
            </div>
            <p>
              Sitemizin düzgün çalışabilmesi ve güvenli oturum yönetimi için zorunlu teknik çerezler kullanılmaktadır:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm text-slate-600">
              <li>
                <strong>Zorunlu Güvenlik Çerezleri:</strong> Oturum sürekliliği (`rf_session`, `rf_user`), CSRF koruması ve yetkilendirme doğrulaması için gereklidir.
              </li>
              <li>
                <strong>İşlevsel Çerezler:</strong> Kullanıcının tema tercihlerini ve randevu adımlarındaki geçici seçimlerini hatırlar.
              </li>
              <li>
                <strong>İzleme/Reklam Çerezleri Bulunmaz:</strong> Platformumuz üçüncü taraf izleme çerezleri veya reklam ağları pikselleriyle kullanıcıları takip etmez.
              </li>
            </ul>
          </section>

          <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-3 text-[#0F2A4A] font-bold text-lg">
              <ShieldCheck className="w-5 h-5 text-[#0062FF]" />
              <h2>3. İletişim İzinleri (SMS &amp; WhatsApp)</h2>
            </div>
            <p>
              Randevu oluştururken girdiğiniz telefon numarası yalnızca:
            </p>
            <ol className="list-decimal pl-6 space-y-2 text-sm text-slate-600">
              <li>Randevu onay bildiriminin iletilmesi,</li>
              <li>Randevu saatinden önce hatırlatma mesajı gönderilmesi,</li>
              <li>İşletme tarafından yapılan zorunlu saat/tarih değişikliklerinin bildirilmesi amacıyla kullanılır.</li>
            </ol>
            <p className="text-xs text-slate-500 italic">
              İzniniz olmadan ticari kampanya veya spam içerikli toplu mesaj kesinlikle gönderilmez.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 px-4 sm:px-6 text-xs text-slate-500 text-center mt-12">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>&copy; {new Date().getFullYear()} randevuformu.com — Tüm hakları saklıdır.</p>
          <div className="flex items-center gap-4">
            <Link href="/kvkk" className="hover:text-[#0062FF] transition-colors">
              KVKK Aydınlatma Metni
            </Link>
            <Link href="/kullanim-kosullari" className="hover:text-[#0062FF] transition-colors">
              Kullanım Koşulları
            </Link>
            <Link href="/contact" className="hover:text-[#0062FF] transition-colors">
              İletişim
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
