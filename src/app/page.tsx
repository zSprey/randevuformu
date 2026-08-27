import Link from 'next/link';
import { CalendarDays, CheckCircle2, MessageCircle, Phone, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-indigo-600" />
            <span className="font-bold text-xl tracking-tight text-slate-900">randevuformu.com</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Giriş Yap
            </Link>
            <Link href="/register" className="text-sm font-medium bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
              Ücretsiz Başla
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="py-20 md:py-32 px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-sm font-medium mb-4 border border-indigo-100">
              <span className="flex w-2 h-2 rounded-full bg-indigo-600"></span>
              WhatsApp Entegrasyonu Aktif
            </div>
            
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
              İşletmeniz İçin <span className="text-indigo-600">30 Saniyede</span> <br className="hidden md:block"/> 
              Randevu Sistemi Kurun
            </h1>
            
            <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto">
              Diş hekimi, psikolog veya güzellik salonu olun; müşterilerinizden 7/24 randevu alın. WhatsApp bildirimleriyle iptalleri önleyin.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/register" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600">
                Hemen Ücretsiz Başla
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/ornek-klinik" className="w-full sm:w-auto flex items-center justify-center px-8 py-4 rounded-xl font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm">
                Örnek Sayfayı İncele
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white border-t border-slate-100">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Neden randevuformu.com?</h2>
              <p className="text-slate-500 max-w-2xl mx-auto">Eski usül telefonla randevu defteri tutma devri bitti. Modern işletmelerin tercihi.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-6">
                  <Phone className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Telefon Trafiğini Bitirin</h3>
                <p className="text-slate-500">Müşterileriniz siz çalışırken, gece uyurken veya tatildeyken bile uygun saatlerinizi görüp randevu alabilir.</p>
              </div>

              {/* Feature 2 */}
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-6">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Anında WhatsApp Bildirimi</h3>
                <p className="text-slate-500">Yeni randevu alındığında hem size hem müşteriye otomatik WhatsApp onay mesajı gider.</p>
              </div>

              {/* Feature 3 */}
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Sıfır Kurulum Maliyeti</h3>
                <p className="text-slate-500">Uygulama indirmeye gerek yok. Size özel randevuformu.com/isminiz linkini Instagram bio'nuza eklemeniz yeterli.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4 text-white">
            <CalendarDays className="w-6 h-6" />
            <span className="font-bold text-xl tracking-tight">randevuformu.com</span>
          </div>
          <p className="text-sm">Türkiye'nin modern randevu yönetim platformu. &copy; {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
}
