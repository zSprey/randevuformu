// app/kesfet/[sehir]/[ilce]/[sektor]/page.tsx
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MapPin, Star, Calendar } from 'lucide-react';
import Link from 'next/link';

// SEO için URL parametre tipleri
interface PageParams {
  sehir: string;
  ilce: string;
  sektor: string;
}

interface PageProps {
  params: Promise<PageParams>;
}

// 1. Dinamik SEO (OpenGraph & Canonical)
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  // Parametreleri temizle (örn: "dis-hekimi" -> "Diş Hekimi", "kadikoy" -> "Kadıköy")
  const sehir = capitalize(resolvedParams.sehir);
  const ilce = capitalize(resolvedParams.ilce);
  const sektor = formatSektor(resolvedParams.sektor);

  const title = `En İyi ${ilce}, ${sehir} ${sektor} Randevusu Al | RandevuFormu`;
  const description = `${ilce} ilçesindeki en yüksek puanlı ${sektor.toLowerCase()} işletmelerini keşfedin, müşteri yorumlarını okuyun ve anında online randevu alın.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://randevuformu.com/kesfet/${resolvedParams.sehir}/${resolvedParams.ilce}/${resolvedParams.sektor}`,
    },
    openGraph: {
      title,
      description,
      type: 'website',
      url: `https://randevuformu.com/kesfet/${resolvedParams.sehir}/${resolvedParams.ilce}/${resolvedParams.sektor}`,
    },
  };
}

// 2. Programmatic SEO: En popüler rotaları build anında statik oluştur (SSG)
export async function generateStaticParams(): Promise<PageParams[]> {
  return [
    { sehir: 'istanbul', ilce: 'kadikoy', sektor: 'kuafor' },
    { sehir: 'istanbul', ilce: 'sisli', sektor: 'dis-hekimi' },
    { sehir: 'ankara', ilce: 'cankaya', sektor: 'diyetisyen' },
  ];
}

// 3. Server Component Arayüzü
export default async function DizinPage({ params }: PageProps) {
  const resolvedParams = await params;
  const sehir = capitalize(resolvedParams.sehir);
  const ilce = capitalize(resolvedParams.ilce);
  const sektor = formatSektor(resolvedParams.sektor);

  // Faz 4'te Prisma'dan veritabanı sorgusu gelecek
  const mockBusinesses = [
    { id: '1', name: 'Premium Hair Studio', rating: 4.8, reviewCount: 124, address: 'Caferağa Mah. Moda Cad.', nextAvailable: 'Bugün 14:30' },
    { id: '2', name: 'Estetik Gülüş Kliniği', rating: 4.9, reviewCount: 89, address: 'Fenerbahçe Mah.', nextAvailable: 'Yarın 09:00' },
  ];

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      {/* Sayfa Başlığı (H1 SEO İçin Kritik) */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
          {ilce}, {sehir} {sektor}
        </h1>
        <p className="mt-2 text-zinc-600">
          {ilce} bölgesindeki {mockBusinesses.length} işletme listeleniyor.
        </p>
      </header>

      {/* İşletme Listesi */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {mockBusinesses.map((business) => (
          <article key={business.id} className="flex flex-col rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-zinc-900">{business.name}</h2>
              <div className="mt-1 flex items-center gap-1 text-sm text-zinc-600">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="font-medium">{business.rating}</span>
                <span>({business.reviewCount} Değerlendirme)</span>
              </div>
            </div>

            <div className="mb-4 space-y-2 text-sm text-zinc-600">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0" />
                <span className="truncate">{business.address}</span>
              </div>
              <div className="flex items-center gap-2 font-medium text-emerald-600">
                <Calendar className="h-4 w-4 shrink-0" />
                <span>En yakın: {business.nextAvailable}</span>
              </div>
            </div>

            <Link 
              href={`/isletme/${business.id}`}
              className="mt-auto flex min-h-[44px] w-full items-center justify-center rounded-lg bg-zinc-900 px-4 font-medium text-white transition-opacity hover:opacity-90"
            >
              Randevu Al
            </Link>
          </article>
        ))}
      </div>
    </main>
  );
}

// Basit metin formatlama yardımcıları (Gerçek projede lib/utils altına alınabilir)
function capitalize(str: string) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/-/g, ' ');
}

function formatSektor(str: string) {
  const map: Record<string, string> = {
    'kuafor': 'Kuaför',
    'dis-hekimi': 'Diş Hekimi',
    'diyetisyen': 'Diyetisyen',
    'avukat': 'Avukat'
  };
  return map[str] || capitalize(str);
}
