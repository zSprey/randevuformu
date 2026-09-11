// app/kesfet/[sehir]/[ilce]/[sektor]/page.tsx
import { Metadata } from 'next';
import { MapPin, Star, Calendar, ShieldCheck, CheckCircle2, ChevronRight, HelpCircle, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { generateGeoLocalBusinessLd, getAeoDirectAnswer } from '@/lib/seo/geoEngine';

interface PageParams {
  sehir: string;
  ilce: string;
  sektor: string;
}

interface PageProps {
  params: Promise<PageParams>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const sehir = capitalize(resolvedParams.sehir);
  const ilce = capitalize(resolvedParams.ilce);
  const sektor = formatSektor(resolvedParams.sektor);

  const title = `${ilce} ${sektor} Randevu Al | En İyi ${sehir} ${ilce} ${sektor}leri — RandevuFormu`;
  const description = `${sehir} ${ilce} bölgesindeki en iyi ${sektor.toLowerCase()} işletmelerini inceleyin, gerçek müşteri yorumlarını okuyun ve WhatsApp onaylı online randevunuzu 30 saniyede kolayca alın.`;

  return {
    title: {
      absolute: title,
    },
    description,
    alternates: {
      canonical: `https://randevuformu.com/kesfet/${resolvedParams.sehir}/${resolvedParams.ilce}/${resolvedParams.sektor}`,
    },
    openGraph: {
      title,
      description,
      type: 'website',
      url: `https://randevuformu.com/kesfet/${resolvedParams.sehir}/${resolvedParams.ilce}/${resolvedParams.sektor}`,
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: `${ilce} ${sektor} Randevu`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og-image.png'],
    },
  };
}

export async function generateStaticParams(): Promise<PageParams[]> {
  return [
    { sehir: 'istanbul', ilce: 'kadikoy', sektor: 'kuafor' },
    { sehir: 'istanbul', ilce: 'sisli', sektor: 'dis-hekimi' },
    { sehir: 'istanbul', ilce: 'besiktas', sektor: 'berber' },
    { sehir: 'ankara', ilce: 'cankaya', sektor: 'diyetisyen' },
    { sehir: 'izmir', ilce: 'karsiyaka', sektor: 'klinik' },
  ];
}

export default async function DizinPage({ params }: PageProps) {
  const resolvedParams = await params;
  const sehir = capitalize(resolvedParams.sehir);
  const ilce = capitalize(resolvedParams.ilce);
  const sektor = formatSektor(resolvedParams.sektor);

  const businesses = [
    {
      id: 'byerman',
      name: `By Erman — ${ilce} Erkek Berberi`,
      slug: 'byerman',
      rating: 4.9,
      reviewCount: 142,
      address: `${ilce} Merkez & Çevresi, ${sehir}`,
      nextAvailable: 'Bugün Müsait',
      priceText: '₺200 - ₺500',
      badge: 'Onaylı İşletme',
    },
    {
      id: 'klinik-nova',
      name: `Studio Nova ${sektor}`,
      slug: 'ornek/kuafor',
      rating: 4.8,
      reviewCount: 96,
      address: `${ilce} Çarşı Cad. No: 18, ${sehir}`,
      nextAvailable: 'Yarın 10:30',
      priceText: '₺350+',
      badge: 'Popüler',
    },
    {
      id: 'elit-merkez',
      name: `Elit ${sektor} & Randevu Merkezi`,
      slug: 'ornek/dis-hekimi',
      rating: 4.9,
      reviewCount: 88,
      address: `${ilce} Bulvarı, ${sehir}`,
      nextAvailable: 'Bugün 16:00',
      priceText: '₺400+',
      badge: 'Yeni',
    },
  ];

  const faqs = [
    {
      q: `${ilce} bölgesinde ${sektor} randevusu nasıl alınır?`,
      a: `RandevuFormu üzerinden ${ilce} ilçesindeki dilediğiniz ${sektor.toLowerCase()} profilini seçerek almak istediğiniz seansı, tercih ettiğiniz uzmanı ve uygun tarih-saati belirleyerek 30 saniyede rezervasyonunuzu tamamlayabilirsiniz.`,
    },
    {
      q: `Randevu oluştururken ön ödeme yapmam gerekir mi?`,
      a: `Çoğu işletmemizde randevu alırken kredi kartı gerekmez. Ödemenizi işlem sonrasında salonda nakit veya kredi kartıyla gerçekleştirebilirsiniz. Bazı özel seanslarda ise cüzi bir kapora alınabilmektedir.`,
    },
    {
      q: `Randevu onay ve hatırlatma bildirimi geliyor mu?`,
      a: `Evet! Randevunuz oluşturulduğu anda sistemimiz otomatik SMS ve WhatsApp teyit mesajı gönderir. Seans saatiniz yaklaşırken de hatırlatma bildirimi iletilir.`,
    },
    {
      q: `Randevumu nasıl iptal edebilir veya erteleyebilirim?`,
      a: `Size gelen onay mesajındaki bağlantıya tıklayarak randevunuzu tek tıkla kolayca erteleyebilir veya iptal edebilirsiniz.`,
    },
  ];

  const aeoData = getAeoDirectAnswer(sektor, `${sehir} ${ilce}`);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Ana Sayfa',
            item: 'https://randevuformu.com',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Keşfet',
            item: 'https://randevuformu.com/kesfet',
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: sehir,
            item: `https://randevuformu.com/kesfet?sehir=${resolvedParams.sehir}`,
          },
          {
            '@type': 'ListItem',
            position: 4,
            name: `${ilce} ${sektor}`,
            item: `https://randevuformu.com/kesfet/${resolvedParams.sehir}/${resolvedParams.ilce}/${resolvedParams.sektor}`,
          },
        ],
      },
      ...businesses.map((b) =>
        generateGeoLocalBusinessLd({
          businessName: b.name,
          citySlug: resolvedParams.sehir,
          districtSlug: resolvedParams.ilce,
          sectorSlug: resolvedParams.sektor,
          url: `https://randevuformu.com/${b.slug}`,
          ratingScore: b.rating,
          reviewCount: b.reviewCount,
          priceRange: b.priceText,
        })
      ),
      {
        '@type': 'ItemList',
        name: `${ilce} ${sektor} Randevu Listesi`,
        itemListElement: businesses.map((b, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          name: b.name,
          url: `https://randevuformu.com/${b.slug}`,
        })),
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: aeoData.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: aeoData.directAnswer,
            },
          },
          ...faqs.map((f) => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: {
              '@type': 'Answer',
              text: f.a,
            },
          })),
        ],
      },
    ],
  };

  return (
    <main className="min-h-screen bg-[#FAFBFC] text-slate-800">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumbs Navigation */}
      <div className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6">
          <nav className="flex items-center gap-1.5 text-xs text-slate-500 overflow-x-auto">
            <Link href="/" className="hover:text-[#0062FF] transition-colors">
              Ana Sayfa
            </Link>
            <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
            <Link href="/kesfet" className="hover:text-[#0062FF] transition-colors">
              Keşfet
            </Link>
            <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="text-slate-600 font-medium">{sehir}</span>
            <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="text-[#0062FF] font-semibold">{ilce} {sektor}</span>
          </nav>
        </div>
      </div>

      {/* Hero Header */}
      <section className="bg-gradient-to-b from-white to-slate-50/60 border-b border-slate-200/80 py-10 sm:py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-[#0062FF] text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{sehir} / {ilce} Yerel Randevu Rehberi</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#0F2A4A] tracking-tight">
            {ilce} {sektor} Randevu Al — En İyi {sektor} İşletmeleri
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed">
            {sehir} {ilce} genelinde hizmet veren doğrulanmış {sektor.toLowerCase()} işletmelerini karşılaştırın, gerçek danışan yorumlarını inceleyin ve telefon kuyruğu beklemeden WhatsApp onaylı online randevunuzu hemen oluşturun.
          </p>
        </div>
      </section>

      {/* Gingiris GEO Local Direct Answer & Citation Box */}
      <section className="mx-auto max-w-6xl px-4 pt-8 sm:px-6">
        <div className="p-6 rounded-2xl bg-gradient-to-br from-[#0F2A4A] to-[#1E3A8A] text-white shadow-md border border-blue-900/50">
          <div className="flex items-center gap-2 text-blue-300 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Yapay Zeka & Bölge Özeti (AEO / Direct Answer)</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold mb-2">
            {aeoData.question}
          </h2>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-4xl">
            {aeoData.directAnswer}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 pt-4 border-t border-white/10">
            {aeoData.keyStatistics.map((stat, idx) => (
              <div key={idx} className="bg-white/10 rounded-lg p-2.5 text-center text-[11px] font-medium text-blue-100">
                {stat}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Business Cards Grid */}
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-[#0F2A4A]">
            {ilce} İlçesindeki Aktif {sektor} İşletmeleri ({businesses.length})
          </h2>
          <span className="text-xs text-slate-400">7/24 Canlı Rezervasyon</span>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {businesses.map((business) => (
            <article
              key={business.id}
              className="flex flex-col rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs transition-all hover:border-[#0062FF]/40 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-[#0062FF] border border-blue-200/60">
                  {business.badge}
                </span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/80">
                  {business.priceText}
                </span>
              </div>

              <h3 className="text-base font-bold text-[#0F2A4A] leading-snug">
                {business.name}
              </h3>

              <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-600">
                <div className="flex items-center text-amber-500">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span className="font-bold ml-1 text-slate-900">{business.rating}</span>
                </div>
                <span className="text-slate-400">({business.reviewCount} Değerlendirme)</span>
              </div>

              <div className="my-4 space-y-2 text-xs text-slate-500 border-t border-slate-100 pt-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{business.address}</span>
                </div>
                <div className="flex items-center gap-2 font-medium text-emerald-600">
                  <Calendar className="h-3.5 w-3.5 shrink-0" />
                  <span>{business.nextAvailable}</span>
                </div>
              </div>

              <Link
                href={`/${business.slug}`}
                className="mt-auto inline-flex items-center justify-center gap-1.5 w-full rounded-xl bg-[#0062FF] hover:bg-[#0052d9] text-white text-xs font-bold py-2.5 shadow-xs transition-all active:scale-98"
              >
                Hemen Randevu Al <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* Long-Tail SEO Editorial Content Section */}
      <section className="bg-white border-y border-slate-200/80 py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 space-y-8 text-sm leading-relaxed text-slate-600">
          <div>
            <h2 className="text-2xl font-bold text-[#0F2A4A] mb-3">
              {ilce} Bölgesinde Güvenilir {sektor} Seçimi ve Randevu İpuçları
            </h2>
            <p>
              {sehir}&apos;in en hareketli noktalarından biri olan {ilce}, çok sayıda {sektor.toLowerCase()} seçeneği sunmaktadır. Kaliteli bir deneyim yaşamak için işletmenin hijyen standartlarını, kullanılan ekipmanların profesyonelliğini ve daha önce hizmet almış müşterilerin gerçek değerlendirmelerini incelemek büyük önem taşır.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 pt-2">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center gap-2 font-bold text-[#0F2A4A] text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Çakışmasız Takvim Sistemi</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                RandevuFormu altyapısı sayesinde çift rezervasyon veya salonda bekleme sorunu yaşamazsınız. Seçtiğiniz saat doğrudan uzmanın takvimine kilitlenir.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center gap-2 font-bold text-[#0F2A4A] text-sm">
                <ShieldCheck className="w-4 h-4 text-[#0062FF]" />
                <span>Şeffaf Fiyat ve Hizmet Listesi</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                İşlem öncesinde hizmet sürelerini, seans adımlarını ve güncel fiyatları şeffaf bir şekilde görerek randevunuzu güvenle oluşturursunuz.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="mx-auto max-w-4xl px-4 py-12 sm:py-16 sm:px-6">
        <div className="flex items-center gap-2 mb-2 text-[#0062FF]">
          <HelpCircle className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">Sıkça Sorulan Sorular</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-[#0F2A4A] mb-6">
          {ilce} {sektor} Randevuları Hakkında Merak Edilenler
        </h2>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
              <h3 className="text-sm font-bold text-[#0F2A4A]">{faq.q}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA: İşletmeler İçin */}
      <section className="bg-slate-900 text-white py-12 px-4 sm:px-6 text-center">
        <div className="max-w-2xl mx-auto space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold">
            {ilce} Bölgesinde {sektor} İşletmeniz mi Var?
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            30 saniyede ücretsiz randevu formunuzu kurun, Instagram biyografinize ekleyin ve telefon trafiğinden kurtulun.
          </p>
          <div className="pt-2">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0062FF] hover:bg-[#0052d9] text-white text-xs font-bold transition-all shadow-md"
            >
              Ücretsiz Randevu Formu Aç <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function capitalize(str: string) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/-/g, ' ');
}

function formatSektor(str: string) {
  const map: Record<string, string> = {
    kuafor: 'Kuaför',
    berber: 'Berber',
    'dis-hekimi': 'Diş Hekimi',
    diyetisyen: 'Diyetisyen',
    avukat: 'Avukat',
    klinik: 'Klinik',
    psikolog: 'Psikolog',
    veteriner: 'Veteriner',
  };
  return map[str] || capitalize(str);
}
