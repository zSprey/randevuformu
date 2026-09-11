import React from "react";
import Link from "next/link";
import Image from "next/image";
import { FileText, ArrowLeft, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kullanım Koşulları | RandevuFormu",
  description: "RandevuFormu platformu kullanım koşulları, işletme ve kullanıcı hak ve yükümlülükleri.",
  alternates: {
    canonical: "https://randevuformu.com/kullanim-kosullari",
  },
};

export default function KullanimKosullariPage() {
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
            <FileText className="w-4 h-4" />
            <span>Hizmet ve Kullanım Standartları</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#0F2A4A] tracking-tight">
            Kullanım Koşulları
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Son Güncelleme: 11 Eylül 2026
          </p>
        </div>

        <div className="space-y-8 text-slate-700 text-sm sm:text-base leading-relaxed">
          <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-3 text-[#0F2A4A] font-bold text-lg">
              <CheckCircle2 className="w-5 h-5 text-[#0062FF]" />
              <h2>1. Platformun Kapsamı ve Rolü</h2>
            </div>
            <p>
              RandevuFormu, randevu ile hizmet sunan işletmeler (hizmet veren) ile bu işletmelerden randevu talep eden müşterileri (kullanıcı) dijital ortamda buluşturan teknik bir altyapı ve rezervasyon yönetim platformudur.
            </p>
            <p>
              RandevuFormu, hizmeti bizzat ifa eden taraf değildir; hizmetin kalitesi, süresi ve işletme içi uygulamalar ilgili bağımsız işletmenin sorumluluğundadır.
            </p>
          </section>

          <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-3 text-[#0F2A4A] font-bold text-lg">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h2>2. Randevu İptali ve Değişiklik Kuralları</h2>
            </div>
            <p>
              Müşteriler, aldıkları randevuyu sistem tarafından kendilerine iletilen SMS/WhatsApp bağlantısı üzerinden veya işletmeyle doğrudan iletişime geçerek iptal edebilir ya da saatini değiştirebilir.
            </p>
            <p>
              İşletmenin iş gücü ve koltuk kapasitesinin korunması adına, randevuya gidemeyecek kullanıcıların randevu saatinden en az 2 saat önce iptal bildiriminde bulunması beklenir.
            </p>
          </section>

          <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-3 text-[#0F2A4A] font-bold text-lg">
              <ShieldCheck className="w-5 h-5 text-[#0062FF]" />
              <h2>3. Sistem Güvenliği ve Kötüye Kullanım</h2>
            </div>
            <p>
              Platform üzerinden sahte kimlik veya telefon numarasıyla asılsız randevu oluşturmak, otomatik bot yazılımlarıyla sistemi kilitlemeye çalışmak veya işletme kapasitesini haksız yere bloke etmek yasaktır. Bu tür kötü niyetli girişimlerde bulunan IP adresleri ve telefon numaraları otomatik güvenlik kalkanımız tarafından derhal kalıcı olarak engellenir ve gerekli yasal süreçler başlatılır.
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
            <Link href="/gizlilik" className="hover:text-[#0062FF] transition-colors">
              Gizlilik Politikası
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
