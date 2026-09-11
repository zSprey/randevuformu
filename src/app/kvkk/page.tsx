import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, ArrowLeft, Lock, FileText, Mail } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "KVKK Aydınlatma Metni | RandevuFormu",
  description: "6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) uyarınca kişisel verilerinizin işlenmesi, korunması ve haklarınıza ilişkin aydınlatma metni.",
  alternates: {
    canonical: "https://randevuformu.com/kvkk",
  },
};

export default function KvkkPage() {
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
        {/* Title Header */}
        <div className="mb-10 text-center sm:text-left border-b border-slate-200/80 pb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#0062FF] text-xs font-bold mb-3 border border-blue-100">
            <ShieldCheck className="w-4 h-4" />
            <span>6698 Sayılı Kanun Uyarınca</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#0F2A4A] tracking-tight">
            KVKK Aydınlatma Metni
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Son Güncelleme: 11 Eylül 2026 | Sürüm: 2.4
          </p>
        </div>

        {/* Legal Text Sections */}
        <div className="space-y-8 text-slate-700 text-sm sm:text-base leading-relaxed">
          {/* Giriş */}
          <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-3 text-[#0F2A4A] font-bold text-lg">
              <FileText className="w-5 h-5 text-[#0062FF]" />
              <h2>1. Veri Sorumlusunun Kimliği</h2>
            </div>
            <p>
              <strong>RandevuFormu Bilişim Hizmetleri</strong> (&ldquo;<strong>RandevuFormu</strong>&rdquo; veya &ldquo;<strong>Şirket</strong>&rdquo;) olarak, 6698 sayılı Kişisel Verilerin Korunması Kanunu (&ldquo;<strong>KVKK</strong>&rdquo;) uyarınca veri sorumlusu sıfatıyla hareket etmekteyiz. İşbu Aydınlatma Metni, platformumuz üzerinden randevu oluşturan müşterilerimizin, ziyaretçilerimizin ve üye işletmelerimizin kişisel verilerinin işlenmesi süreçlerine ilişkin aydınlatılması amacıyla hazırlanmıştır.
            </p>
          </section>

          {/* İşlenen Kişisel Veriler */}
          <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-3 text-[#0F2A4A] font-bold text-lg">
              <Lock className="w-5 h-5 text-[#0062FF]" />
              <h2>2. İşlenen Kişisel Veriler ve Kategorileri</h2>
            </div>
            <p>
              Platformumuz ve bağlantılı randevu widget&apos;larımız üzerinden aşağıdaki kişisel verileriniz işlenmektedir:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li>
                <strong>Kimlik Bilgileri:</strong> Ad, soyad.
              </li>
              <li>
                <strong>İletişim Bilgileri:</strong> Cep telefonu numarası, e-posta adresi.
              </li>
              <li>
                <strong>Randevu &amp; Hizmet Bilgileri:</strong> Talep edilen randevu tarihi, saati, seçilen hizmet türü, tercih edilen uzman/personel ve müşterinin ilettiği özel randevu notları.
              </li>
              <li>
                <strong>İşlem Güvenliği &amp; Dijital İzler:</strong> IP adresi, internet sitesi giriş-çıkış logları, erişim tarihi ve saati, cihaz/tarayıcı bilgisi, oturum çerezleri.
              </li>
              <li>
                <strong>Müşteri İşlem Verileri:</strong> Randevu onay/iptal kayıtları, SMS/WhatsApp hatırlatma iletim durumları.
              </li>
            </ul>
          </section>

          {/* Kişisel Verilerin İşlenme Amaçları */}
          <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-3 text-[#0F2A4A] font-bold text-lg">
              <ShieldCheck className="w-5 h-5 text-[#0062FF]" />
              <h2>3. Kişisel Verilerin İşlenme Amaçları</h2>
            </div>
            <p>Kişisel verileriniz aşağıdaki amaçlarla sınırlı ve ölçülü olarak işlenir:</p>
            <ol className="list-decimal pl-6 space-y-2 text-sm">
              <li>Randevu talebinizin oluşturulması, takvime işlenmesi ve ilgili işletmeye iletilmesi,</li>
              <li>Randevunuzun teyit edilmesi, güncellenmesi veya olası saat değişikliklerinin SMS/WhatsApp yoluyla iletilmesi,</li>
              <li>Randevu saatinden önce tarafınıza hatırlatma bildirimleri gönderilmesi (No-Show önleme),</li>
              <li>Bilgi güvenliği süreçlerinin yürütülmesi, siber saldırıların engellenmesi ve 5651 sayılı Kanun kapsamındaki yasal log tutma yükümlülüklerinin karşılanması,</li>
              <li>Olası uyuşmazlıklarda yetkili adli veya idari mercilerin taleplerinin karşılanması.</li>
            </ol>
          </section>

          {/* Verilerin Aktarımı */}
          <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-3 text-[#0F2A4A] font-bold text-lg">
              <FileText className="w-5 h-5 text-[#0062FF]" />
              <h2>4. Kişisel Verilerin Aktarıldığı Taraflar ve Aktarım Amaçları</h2>
            </div>
            <p>
              Toplanan kişisel verileriniz, Kanun&apos;un 8. ve 9. maddelerinde belirtilen şartlara uygun olarak:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li>
                <strong>Hizmet Sağlayan İşletmeye:</strong> Randevunuzun ifası amacıyla yalnızca randevu aldığınız işletmeye (kuaför, berber, klinik, diyetisyen vb.),
              </li>
              <li>
                <strong>Telekomünikasyon Altyapı Sağlayıcılarına:</strong> Yalnızca randevu doğrulama ve hatırlatma SMS/WhatsApp mesajlarının iletilmesi amacıyla yetkili mesajlaşma servis sağlayıcılarına,
              </li>
              <li>
                <strong>Yetkili Kamu Kurum ve Kuruluşlarına:</strong> Yasal zorunluluk veya adli mercilerin resmi talebi halinde kanunen yetkili kurumlara aktarılabilmektedir.
              </li>
            </ul>
            <p className="text-xs text-slate-500 italic">
              * Kişisel verileriniz hiçbir koşulda ticari amaçlarla üçüncü şahıslara veya reklam ağlarına satılmaz veya kiralanmaz.
            </p>
          </section>

          {/* Hukuki Sebep ve Yöntem */}
          <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-3 text-[#0F2A4A] font-bold text-lg">
              <Lock className="w-5 h-5 text-[#0062FF]" />
              <h2>5. Kişisel Veri Toplamanın Yöntemi ve Hukuki Sebebi</h2>
            </div>
            <p>
              Kişisel verileriniz; web sitemiz, işletme alt alan adları (subdomain), mobil uyumlu randevu formları ve entegre API kanalları üzerinden tamamen elektronik ortamda otomatik yöntemlerle toplanmaktadır.
            </p>
            <p>
              Bu veriler KVKK&apos;nın 5. maddesinin 2. fıkrasında yer alan;
            </p>
            <ul className="list-disc pl-6 space-y-1 text-sm text-slate-600">
              <li>&ldquo;Bir sözleşmenin kurulması veya ifasıyla doğrudan doğruya ilgili olması&rdquo;,</li>
              <li>&ldquo;Veri sorumlusunun hukuki yükümlülüğünü yerine getirebilmesi için zorunlu olması&rdquo;,</li>
              <li>&ldquo;İlgili kişinin temel hak ve özgürlüklerine zarar vermemek kaydıyla, veri sorumlusunun meşru menfaatleri için veri işlenmesinin zorunlu olması&rdquo;</li>
            </ul>
            <p>hukuki sebeplerine dayalı olarak işlenmektedir.</p>
          </section>

          {/* İlgili Kişinin Hakları (Madde 11) */}
          <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-3 text-[#0F2A4A] font-bold text-lg">
              <ShieldCheck className="w-5 h-5 text-[#0062FF]" />
              <h2>6. İlgili Kişinin Hakları (KVKK Madde 11)</h2>
            </div>
            <p>
              Kişisel veri sahibi olarak KVKK&apos;nın 11. maddesi kapsamında aşağıdaki haklara sahipsiniz:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-sm text-slate-600">
              <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme,</li>
              <li>İşlenmişse buna ilişkin bilgi talep etme,</li>
              <li>İşlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme,</li>
              <li>Yurt içinde veya yurt dışında kişisel verilerin aktarıldığı üçüncü kişileri bilme,</li>
              <li>Kişisel verilerin eksik veya yanlış işlenmiş olması hâlinde bunların düzeltilmesini isteme,</li>
              <li>KVKK&apos;nın 7. maddesindeki şartlar çerçevesinde kişisel verilerin silinmesini veya yok edilmesini isteme,</li>
              <li>İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme,</li>
              <li>Kişisel verilerin kanuna aykırı olarak işlenmesi sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme.</li>
            </ul>
          </section>

          {/* Başvuru İletişim */}
          <section className="bg-blue-50/70 p-6 sm:p-8 rounded-3xl border border-blue-200/80 shadow-xs space-y-3">
            <h3 className="font-bold text-[#0F2A4A] text-base">Haklarınızı Kullanmak İçin Başvuru</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Yukarıda belirtilen haklarınızı kullanmak için kimliğinizi teyit edici belgelerle birlikte talebinizi aşağıdaki iletişim kanallarından RandevuFormu Veri Sorumlusu İrtibat Birimine iletebilirsiniz. Başvurularınız en geç 30 (otuz) gün içinde ücretsiz olarak sonuçlandırılacaktır:
            </p>
            <div className="pt-2 flex flex-col sm:flex-row gap-4 text-xs font-semibold text-slate-700">
              <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-blue-100">
                <Mail className="w-4 h-4 text-[#0062FF]" />
                <span>kvkk@randevuformu.com</span>
              </div>
              <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-blue-100">
                <Mail className="w-4 h-4 text-[#0062FF]" />
                <span>destek@randevuformu.com</span>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 px-4 sm:px-6 text-xs text-slate-500 text-center mt-12">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>&copy; {new Date().getFullYear()} randevuformu.com — Tüm hakları saklıdır.</p>
          <div className="flex items-center gap-4">
            <Link href="/gizlilik" className="hover:text-[#0062FF] transition-colors">
              Gizlilik Politikası
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
