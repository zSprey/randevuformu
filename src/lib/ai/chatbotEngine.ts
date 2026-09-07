import prisma from '@/lib/prisma';
import { format, addDays } from 'date-fns';
import { SEKTOR_DATA, SektorConfig, SektorServiceItem } from '@/lib/sektorler';
import { getBusinessProfile, DEFAULT_BYERMAN_PROFILE } from '@/lib/storage/profileStore';
import { getStoredServices, DEFAULT_BYERMAN_SERVICES } from '@/lib/storage/servicesStore';
import { getStoredStaff, BYERMAN_DEFAULT_STAFF } from '@/lib/storage/staffStore';

export interface CustomerChatResponse {
  reply: string;
  suggestedSlots?: Array<{
    id: string;
    time: string;
    date: string;
    serviceName: string;
    isDiscounted?: boolean;
  }>;
  quickActions?: string[];
  isBlockedTopic?: boolean;
  detectedSector?: string;
}

export interface BusinessSummaryResponse {
  greeting: string;
  reply?: string;
  metrics: {
    totalAppointmentsToday: number;
    pendingCount: number;
    expectedRevenue: number;
    noShowRiskAlerts: number;
    waitlistCount: number;
  };
  insights: string[];
  isBlockedTopic?: boolean;
}

// ────────────────────────────────────────────────────────
// 1. KESİN VE TAVİZSİZ KONU KORUMA VE GÜVENLİK FİLTRESİ
// ────────────────────────────────────────────────────────
const FORBIDDEN_KEYWORDS = [
  // Siyaset & Politika
  'siyaset', 'politika', 'seçim', 'secim', 'parti', 'hükümet', 'hukumet',
  'muhalefet', 'erdoğan', 'erdogan', 'chp', 'akp', 'ak parti', 'mhp', 'iyi parti',
  'dem parti', 'milletvekili', 'bakan', 'cumhurbaşkanı', 'cumhurbaskani',
  'belediye başkanı', 'oy ver', 'seçimler', 'propaganda', 'ideoloji',

  // Yazılım & Kodlama
  'yazılım', 'yazilim', 'kod', 'kodlama', 'programlama', 'javascript', 'python',
  'typescript', 'react', 'next.js', 'nextjs', 'html', 'css', 'sql', 'database',
  'api yaz', 'fonksiyon yaz', 'script yaz', 'kod yaz', 'bug düzelt', 'c++', 'c#',
  'java', 'php', 'github', 'algoritma', 'developer', 'yazılımcı',

  // Konu Dışı / Genel İstismar
  'şiir yaz', 'siir yaz', 'ödev yap', 'odev', 'felsefe', 'aşk mektubu', 'fıkra anlat',
  'şarkı sözü', 'sen kimsin kim yaptı', 'prompt', 'sistem talimatı', 'jailbreak',
];

export function isForbiddenTopic(text: string): boolean {
  const lower = text.toLowerCase();
  return FORBIDDEN_KEYWORDS.some((kw) => lower.includes(kw));
}

export function getForbiddenReply(businessName: string): string {
  return `Ben randevuformu.com ve ${businessName} bünyesinde hizmet veren akıllı randevu asistanıyım. Kurallarımız gereği siyaset, yazılım/kodlama veya işletme faaliyetlerimiz dışındaki konularda yanıt verememekteyim.\n\nSize ${businessName} randevuları, uygun seans saatleri, hizmetlerimiz ve fiyatlarımız konusunda nasıl yardımcı olabilirim?`;
}

// ────────────────────────────────────────────────────────
// 2. 14 SEKTÖR AKILLI TESPİT VE PROFİL YÖNETİMİ
// ────────────────────────────────────────────────────────
export interface SectorExpertProfile {
  slug: string;
  title: string;
  expertTitle: string;
  badge: string;
  prepTip: string;
  keywords: string[];
  sampleSlots: string[];
  quickActions: string[];
}

export const SECTOR_EXPERT_PROFILES: Record<string, SectorExpertProfile> = {
  'dis-hekimi': {
    slug: 'dis-hekimi',
    title: 'Diş Hekimi & Ağız Sağlığı Polikliniği',
    expertTitle: 'Diş Kliniği Hasta Danışmanı',
    badge: '🦷 Diş Hekimliği & İmplant',
    prepTip: 'Randevu öncesinde dişlerinizi fırçalayarak gelmeniz tavsiye edilir. Röntgen gerekirse kliniğimizde dijital olarak çekilmektedir.',
    keywords: ['diş', 'dis', 'implant', 'dolgu', 'kanal', 'beyazlatma', 'zirkonyum', 'diş taşı', 'dis tasi', 'çürük', 'curuk', 'dişçi', 'disci', 'ortodonti', 'diş teli', 'panoramik', 'röntgen', 'rontgen', 'protez', 'çene', 'damak', 'ağız'],
    sampleSlots: ['Detaylı Muayene & Röntgen', 'Diş Taşı Temizliği', 'Diş Beyazlatma (Bleaching)', 'Kompozit Estetik Dolgu'],
    quickActions: ['Bugün Boş Muayene Saati', 'Diş Beyazlatma Fiyatı', 'İmplant Bilgisi', 'Hizmet & Fiyat Listesi'],
  },
  'diyetisyen': {
    slug: 'diyetisyen',
    title: 'Diyetisyenler & Beslenme Uzmanları',
    expertTitle: 'Beslenme & Diyet Danışmanı',
    badge: '🥗 Beslenme & Diyet Danışmanlığı',
    prepTip: 'İlk seansta detaylı vücut analizi (InBody) yapılacağından randevudan 2 saat önce ağır yemek yememeniz ve bol su tüketmeniz önerilir.',
    keywords: ['diyet', 'diyetisyen', 'beslenme', 'kilo', 'zayıflama', 'zayiflama', 'kalori', 'inbody', 'yağ oranı', 'yag orani', 'ödem', 'odem', 'detoks', 'dyt', 'anamnez', 'boy kilo', 'metabolizma'],
    sampleSlots: ['İlk Danışmanlık & Beslenme Anamnezi', 'Haftalık Kontrol Seansı', 'Online Diyet Görüşmesi', 'Sporcu Beslenmesi'],
    quickActions: ['Online Diyet Seansı', 'İlk Muayene Ücreti', 'Müsait Randevu Saatleri', 'Vücut Analizi'],
  },
  'veteriner': {
    slug: 'veteriner',
    title: 'Veteriner Klinikleri & Hayvan Sağlığı',
    expertTitle: 'Veteriner Kliniği Hasta Kabul & Pet Danışmanı',
    badge: '🐾 Veteriner & Pet Sağlığı',
    prepTip: 'Kliniğimize gelirken sevimli dostumuzun aşı karnesini getirmeyi ve kediler için güvenli taşıma çantası kullanmayı unutmayınız.',
    keywords: ['kedi', 'köpek', 'kopek', 'pati', 'veteriner', 'aşı', 'asi', 'parazit', 'kuduz', 'karma aşı', 'kısırlaştırma', 'kisirlastirma', 'mikroçip', 'mikrocip', 'pet', 'tavşan', 'kuş', 'hayvan', 'klinik'],
    sampleSlots: ['Genel Sağlık Muayenesi', 'Rutin Aşı & Parazit Uygulaması', 'Cerrahi Operasyon Danışmanlığı', 'Pet Kuaför & Bakım'],
    quickActions: ['Aşı Randevusu Al', 'Muayene Ücretleri', 'Bugün Açık Saatler', 'Acil Durum Bildir'],
  },
  'berber': {
    slug: 'berber',
    title: 'Erkek Kuaförleri & Berberler',
    expertTitle: 'Usta Berber & Salon Asistanı',
    badge: '💈 Berber & Erkek Kuaförü',
    prepTip: 'Geleneksel Türk berberi deneyimi, buharlı sıcak havlu ve saç-sakal şekillendirme için koltuğunuz hazır.',
    keywords: ['berber', 'sakal', 'tıraş', 'tiras', 'usta', 'fade', 'sıcak havlu', 'sicak havlu', 'saç sakal', 'sac sakal', 'koltuk', 'erman', 'byerman', 'saç kesimi'],
    sampleSlots: ['Saç Kesimi & Yıkama', 'Sakal Tıraşı & Sıcak Havlu', 'Saç + Sakal Komple Bakım'],
    quickActions: ['Bugün Boş Saatler', 'Usta Seç & Randevu Al', 'Fiyat Listesi', 'Yarın Boş Koltuk'],
  },
  'kuafor': {
    slug: 'kuafor',
    title: 'Kadın Kuaförleri & Saç Tasarım',
    expertTitle: 'Saç Stilisti & Kuaför Danışmanı',
    badge: '✂️ Kadın Kuaförü & Saç Tasarım',
    prepTip: 'Balyaj, ombre veya gelin başı gibi uzun işlemler öncesinde saçınızın geçmiş işlem geçmişini iletmeniz en doğru sonucu almamızı sağlar.',
    keywords: ['kuaför', 'kuafor', 'saç boya', 'sac boya', 'balyaj', 'ombre', 'sombre', 'röfle', 'rofle', 'fön', 'fon', 'gelin başı', 'gelin basi', 'keratin', 'botoks', 'kesim', 'kadın kuaförü'],
    sampleSlots: ['Saç Kesimi & Fön', 'Dip & Tüm Saç Boya', 'Balyaj / Ombre / Sombre', 'Keratin Bakımı & Botoks', 'Gelin Başı & Prova'],
    quickActions: ['Balyaj & Ombre Randevusu', 'Fiyat Listesi', 'Fön & Kesim Saatleri', 'Gelin Başı Bilgisi'],
  },
  'guzellik-merkezi': {
    slug: 'guzellik-merkezi',
    title: 'Güzellik Merkezleri & Medikal Estetik',
    expertTitle: 'Medikal Estetisyen & Güzellik Uzmanı Danışmanı',
    badge: '✨ Güzellik Merkezi & Estetik',
    prepTip: 'Lazer ve cilt bakımı öncesi 24 saat boyunca cilde asitli ürünler veya kese uygulamayınız; seanslarımız steril kabinlerde yapılmaktadır.',
    keywords: ['lazer', 'epilasyon', 'cilt bakımı', 'cilt bakimi', 'hydrafacial', 'protez tırnak', 'protez tirnak', 'ipek kirpik', 'lifting', 'kalıcı makyaj', 'kalici makyaj', 'zayıflama', 'bölgesel incelme', 'güzellik'],
    sampleSlots: ['Hydrafacial Derin Cilt Bakımı', 'Buz Lazer Epilasyon Seansı', 'Protez Tırnak & Nail Art', 'İpek Kirpik / Lifting'],
    quickActions: ['Lazer Epilasyon Randevusu', 'Cilt Bakımı Fiyatları', 'Uygun Seans Saatleri', 'Paket İndirimleri'],
  },
  'psikolog': {
    slug: 'psikolog',
    title: 'Klinik Psikologlar & Danışmanlık',
    expertTitle: 'Klinik Psikoloji & Seans Koordinatörü',
    badge: '🧠 Psikolojik Danışmanlık',
    prepTip: 'Tüm seanslarımız %100 gizlilik ve KVKK güvencesi altındadır. Online seanslar için sessiz ve rahat bir ortamda olmanız yeterlidir.',
    keywords: ['psikolog', 'terapi', 'psikoterapi', 'depresyon', 'anksiyete', 'panik atak', 'stres', 'çift terapisi', 'cift terapisi', 'emdr', 'aile danışmanlığı', 'seans', 'ruh sağlığı', 'kaygı'],
    sampleSlots: ['Bireysel Yetişkin Psikoterapisi', 'Çift & Aile Danışmanlığı', 'Online Terapi (Görüntülü)', 'EMDR Travma Terapisi'],
    quickActions: ['Bireysel Terapi Randevusu', 'Online Seans Al', 'Seans Ücretleri', 'Gizlilik & Süreç'],
  },
  'fizyoterapist': {
    slug: 'fizyoterapist',
    title: 'Fizyoterapistler & Manuel Terapi',
    expertTitle: 'Fizyoterapi & Manuel Terapi Danışmanı',
    badge: '🩺 Fizyoterapi & Manuel Terapi',
    prepTip: 'Manuel terapi ve muayene seanslarına rahat spor kıyafetlerle gelmeniz ve varsa güncel MR/röntgen sonuçlarınızı getirmeniz tavsiye edilir.',
    keywords: ['fizyoterapist', 'fizik tedavi', 'fıtık', 'fitik', 'bel ağrısı', 'bel agrisi', 'boyun düzleşmesi', 'manuel terapi', 'omurga', 'skolyoz', 'kuru iğneleme', 'kuru igneleme', 'kinezyo', 'rehabilitasyon', 'ağrı'],
    sampleSlots: ['İlk Muayene & Omurga Analizi', 'Manuel Terapi Seansı', 'Klinik Pilates & Egzersiz', 'Kuru İğneleme Tedavisi'],
    quickActions: ['Manuel Terapi Randevusu', 'Fıtık / Bel Ağrısı Seansı', 'Ücret ve Paketler', 'Bugün Boş Saat'],
  },
  'avukat': {
    slug: 'avukat',
    title: 'Avukatlık Büroları & Hukuki Danışmanlık',
    expertTitle: 'Hukuk Bürosu Sekreteryası & Randevu Danışmanı',
    badge: '⚖️ Hukuk Bürosu & Danışmanlık',
    prepTip: 'Görüşme öncesinde dava konusu veya sözleşmeyle ilgili evraklarınızı yanınızda bulundurmanız süreci hızlandırır.',
    keywords: ['avukat', 'hukuk', 'dava', 'boşanma', 'bosanma', 'miras', 'ceza davası', 'icra', 'sözleşme', 'sozlesme', 'vekalet', 'arabuluculuk', 'danışmanlık', 'adliye', 'mahkeme'],
    sampleSlots: ['Yüz Yüze Hukuki Danışmanlık (1 Saat)', 'Online Hukuki Danışmanlık', 'Sözleşme Hazırlama & İnceleme', 'Arabuluculuk Ön Görüşmesi'],
    quickActions: ['Hukuki Danışmanlık Randevusu', 'Online Görüşme Al', 'Danışmanlık Ücreti', 'Evrak Listesi'],
  },
  'kisisel-antrenor': {
    slug: 'kisisel-antrenor',
    title: 'Kişisel Antrenörler (PT) & Fitness Koçları',
    expertTitle: 'Performans Koçu & PT Danışmanı',
    badge: '💪 Kişisel Antrenör & Fitness Koçluğu',
    prepTip: 'Antrenmandan 2 saat önce hafif bir öğün tüketmeniz, temiz spor ayakkabısı ve havlunuzla gelmeniz önerilir.',
    keywords: ['antrenör', 'antrenor', 'personal trainer', 'fitness', 'pt', 'özel ders', 'ozel ders', 'vücut geliştirme', 'pilates', 'reformer', 'yağ yakımı', 'kondisyon', 'spor hocası', 'kilo alma'],
    sampleSlots: ['Birebir PT Seansı (1 Saat)', 'Vücut Analizi & Performans Testi', 'Kişiye Özel Antrenman Planlama', 'Online Fitness Koçluğu'],
    quickActions: ['Deneme Seansı Al', 'Paket Fiyatları', 'Müsait Antrenman Saatleri', 'Online Koçluk'],
  },
  'oto-servis': {
    slug: 'oto-servis',
    title: 'Oto Servisleri & Araç Bakım Merkezleri',
    expertTitle: 'Servis Danışmanı & Usta Koordinatörü',
    badge: '🚗 Oto Servis & Araç Bakım',
    prepTip: 'Periyodik bakım ve arıza tespitinde aracınızı randevu saatinde teslim alıyor, tüm değişen eski parçaları kutusuyla size gösteriyoruz.',
    keywords: ['oto', 'araç', 'arac', 'araba', 'servis', 'bakım', 'bakim', 'periyodik bakım', 'motor yağı', 'motor yagi', 'balata', 'fren', 'triger', 'debriyaj', 'ekspertiz', 'muayene', 'klima gazı', 'arıza'],
    sampleSlots: ['Periyodik Bakım (Yağ + 4 Filtre)', 'Fren & Balata Değişimi', 'Bilgisayarlı Arıza Tespiti', 'Klima Bakımı & Gaz Dolumu'],
    quickActions: ['Periyodik Bakım Randevusu', 'Bakım Fiyatı Hesapla', 'Arıza Tespiti Saati', 'Bugün Giriş Var mı?'],
  },
  'dovmeci': {
    slug: 'dovmeci',
    title: 'Dövme & Piercing Stüdyoları',
    expertTitle: 'Tattoo Artist & Stüdyo Koordinatörü',
    badge: '🎨 Dövme & Piercing Stüdyosu',
    prepTip: 'Dövme seansı öncesinde iyi dinlenmiş olmanız, tok karnına gelmeniz ve referans görselinizi önceden iletmeniz tavsiye edilir. Tüm iğneler tek kullanımlıktır.',
    keywords: ['dövme', 'dovme', 'tattoo', 'piercing', 'cover up', 'cover-up', 'minimal dövme', 'kol kaplama', 'stüdyo', 'flash tattoo', 'dövme fiyatı', 'kulak delme'],
    sampleSlots: ['Özel Tasarım Dövme Seansı (Saatlik)', 'Minimal Dövme Uygulaması', 'Cover-Up Düzeltme Seansı', 'Titanyum Piercing Uygulaması'],
    quickActions: ['Tasarım İçin Randevu Al', 'Dövme Fiyatı Sor', 'Minimal Dövme Saatleri', 'Piercing Randevusu'],
  },
  'fotografci': {
    slug: 'fotografci',
    title: 'Fotoğraf Stüdyoları & Prodüksiyon',
    expertTitle: 'Stüdyo Prodüksiyon & Çekim Danışmanı',
    badge: '📸 Fotoğraf Stüdyosu & Prodüksiyon',
    prepTip: 'Dış çekim veya stüdyo seansları için önceden konsept ve kıyafet renk uyumu planlaması yapıyoruz. Ham kareler dijital teslim edilir.',
    keywords: ['fotoğraf', 'fotograf', 'çekim', 'cekim', 'dış çekim', 'dis cekim', 'düğün', 'dugun', 'nişan', 'nisan', 'portre', 'stüdyo', 'studyo', 'ürün çekimi', 'vesikalık', 'biyometrik', 'katalog'],
    sampleSlots: ['Dış Çekim & Düğün/Nişan Paketi', 'Stüdyo Portre & Headshot Çekimi', 'E-Ticaret Ürün Çekimi (Saatlik)', 'Aile & Yenidoğan Çekimi'],
    quickActions: ['Dış Çekim Randevusu', 'Portre / Headshot Al', 'Çekim Paket Fiyatları', 'Tarih Müsaitliği'],
  },
  'pedagog': {
    slug: 'pedagog',
    title: 'Pedagoglar & Çocuk Gelişim Uzmanları',
    expertTitle: 'Pedagoji & Çocuk Gelişimi Seans Danışmanı',
    badge: '🧸 Pedagog & Çocuk Gelişimi',
    prepTip: 'İlk görüşmeye ebeveynlerin birlikte katılması önerilir. Kliniğimizde çocuğunuz için özel oyun odası ve sakinleştirici ortam hazırlanmıştır.',
    keywords: ['pedagog', 'çocuk', 'cocuk', 'bebek', 'çocuk gelişimi', 'hiperaktivite', 'dikkat eksikliği', 'dehb', 'oyun terapisi', 'wisc-r', 'tuvalet eğitimi', 'alt ıslatma', 'okul uyumu', 'ergen'],
    sampleSlots: ['Çocuk Gelişim Değerlendirmesi', 'Oyun Terapisi Seansı', 'Dikkat Eksikliği & DEHB Destek Seansı', 'Ebeveyn Danışmanlığı'],
    quickActions: ['Gelişim Değerlendirme Randevusu', 'Oyun Terapisi Seansı', 'Seans Ücretleri', 'Süreç Hakkında Bilgi'],
  },
};

/**
 * Mesaj metninden, işletme slug'ından veya kategori bilgisinden 14 sektörden en uygununu tespit eder.
 */
export function detectSector(
  message: string,
  businessSlugOrId?: string,
  businessCategory?: string
): SektorConfig | null {
  const lowerMsg = (message || '').toLowerCase();
  const lowerSlug = (businessSlugOrId || '').toLowerCase();
  const lowerCat = (businessCategory || '').toLowerCase();

  // 1. Doğrudan slug veya exampleSlug eşleşmesi
  if (lowerSlug) {
    if (SEKTOR_DATA[lowerSlug]) {
      return SEKTOR_DATA[lowerSlug];
    }
    for (const sector of Object.values(SEKTOR_DATA)) {
      if (sector.slug === lowerSlug || sector.exampleSlug === lowerSlug) {
        return sector;
      }
    }
  }

  // 2. Kategori bazlı eşleşme
  if (lowerCat) {
    for (const [key, sector] of Object.entries(SEKTOR_DATA)) {
      if (
        lowerCat.includes(sector.slug) ||
        lowerCat.includes(sector.category.toLowerCase()) ||
        sector.title.toLowerCase().includes(lowerCat)
      ) {
        return sector;
      }
    }
  }

  // 3. Mesaj metni derin semantik anahtar kelime ağırlık puanlaması
  let bestSectorKey: string | null = null;
  let highestScore = 0;

  for (const [key, profile] of Object.entries(SECTOR_EXPERT_PROFILES)) {
    let score = 0;
    for (const kw of profile.keywords) {
      if (lowerMsg.includes(kw)) {
        score += kw.length > 5 ? 3 : 1.5;
      }
    }
    if (score > highestScore) {
      highestScore = score;
      bestSectorKey = key;
    }
  }

  if (bestSectorKey && highestScore >= 2 && SEKTOR_DATA[bestSectorKey]) {
    return SEKTOR_DATA[bestSectorKey];
  }

  return null;
}

// ────────────────────────────────────────────────────────
// 3. PLATFORM REHBER CHATBOTU (randevuformu.com Ana Sayfası)
// ────────────────────────────────────────────────────────
export async function processPlatformMessage(message: string): Promise<CustomerChatResponse> {
  const lower = message.toLowerCase().trim();

  if (isForbiddenTopic(lower)) {
    return {
      reply: "Ben randevuformu.com platform asistanıyım. Kurallarımız gereği siyaset, yazılım/kodlama veya platformumuz dışındaki konularda yanıt verememekteyim.\n\nrandevuformu.com'un özellikleri, randevu formu açma adımları veya paketler hakkında size nasıl yardımcı olabilirim?",
      quickActions: ["Nasıl form açarım?", "Ücretli mi?", "Özellikler neler?"],
      isBlockedTopic: true,
    };
  }

  // 14 Sektörden birine dair soru mu soruluyor?
  const detected = detectSector(message);

  // LLM Denemesi (Groq / Gemini)
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey && !groqKey.includes('test')) {
    try {
      const sectorContext = detected
        ? `Kullanıcı "${detected.title}" sektörü hakkında soru soruyor. randevuformu.com bu sektöre şu özel imkanları sunar: ${detected.features.map(f => f.title).join(', ')}. Örnek hizmetler: ${detected.services?.map(s => s.name).join(', ')}.`
        : `randevuformu.com Türkiye'nin 14 ana sektörüne (Diş Hekimi, Diyetisyen, Kuaför, Berber, Veteriner, Fizyoterapist, Avukat, Güzellik Merkezi, PT, Oto Servis, Dövme, Fotoğrafçı, Pedagog, Psikolog) özel randevu formu ve takvim altyapısı sunar.`;

      const systemPrompt = `Sen randevuformu.com platformunun resmi Türkçe rehber asistanısın.
${sectorContext}
Platform özellikleri: 7/24 online randevu formu, [isletmeadi].randevuformu.com özel subdomain, Google & Outlook çift yönlü takvim senkronizasyonu, otomatik SMS ve WhatsApp teyitleri, İyzico ile kapora/ön ödeme, QR masa standı, usta/koltuk seçimi ve akıllı bekleme listesi.
KURALLAR:
1. SADECE randevuformu.com platformu, sektörlere özel çözümleri, üyelik ve işletmelere sağladığı faydalar hakkında konuş.
2. ASLA siyaset, partiler veya politikaya girme.
3. ASLA yazılım, kodlama veya programlama teknik sorularına girme.
4. ASLA genel felsefe, şiir veya konu dışı sorulara cevap verme.
5. Samimi, kurumsal ve net Türkçe yanıt ver. Ziyaretçiyi '1 Dakikada Ücretsiz Başlayın' veya canlı demoya davet et.`;

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${groqKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message },
          ],
          max_tokens: 260,
          temperature: 0.3,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const aiReply = data.choices?.[0]?.message?.content?.trim();
        if (aiReply) {
          const quickActions = detected
            ? [`${detected.badge} Demoyu Gör`, "1 Dakikada Form Aç", "Fiyatlandırma"]
            : ["Ücretsiz Başlayın", "Canlı Demolar", "Sektörleri İncele"];
          return {
            reply: aiReply,
            quickActions,
            detectedSector: detected?.slug,
          };
        }
      }
    } catch {}
  }

  // Yüksek Zekalı Yerel Kural Tabanlı Yanıtlar

  // Sektöre özel eşleşme varsa
  if (detected) {
    const featureBulletPoints = detected.features
      .slice(0, 3)
      .map(f => `• ${f.title}: ${f.desc}`)
      .join('\n');

    return {
      reply: `Evet! randevuformu.com **${detected.title}** için özel olarak optimize edilmiştir.\n\nİşletmenize sağladığımız avantajlar:\n${featureBulletPoints}\n\nAyrıca müşterilerinize **${detected.exampleSlug}.randevuformu.com** gibi kendi adınıza özel bağlantı sunabilir, WhatsApp onaylarıyla randevuya gelmeme (no-show) oranını sıfıra indirebilirsiniz.`,
      quickActions: [`${detected.badge} Canlı Demo`, '1 Dakikada Ücretsiz Başla', 'Tüm Sektörleri Gör'],
      detectedSector: detected.slug,
    };
  }

  // Nasıl kurulur / kayıt / başlama
  if (lower.includes('nasıl') || lower.includes('nasil') || lower.includes('kur') || lower.includes('kayıt') || lower.includes('başla') || lower.includes('form aç')) {
    return {
      reply: "randevuformu.com ile randevu formu açmak yalnızca 1 dakikanızı alır! Sağ üstteki 'Ücretsiz Başlayın' butonuna tıklayarak işletme adınızı ve subdomain adresinizi seçebilir (örn: isletmeadi.randevuformu.com), hizmetlerinizi ve çalışma saatlerinizi ekleyip linkinizi Instagram profilinize veya WhatsApp'a koyabilirsiniz.",
      quickActions: ["Ücretsiz Başlayın", "Canlı Demoyu Gör", "Özellikler Neler?"],
    };
  }

  // Ücret & Paketler
  if (lower.includes('ücret') || lower.includes('ucret') || lower.includes('fiyat') || lower.includes('paket') || lower.includes('kaç para') || lower.includes('paralı')) {
    return {
      reply: "randevuformu.com'un temel randevu alma, takvim yönetimi ve online form özellikleri tamamen ücretsizdir! İhtiyacınıza göre otomatik SMS bildirimleri, usta bazlı koltuk yönetimi veya kurumsal entegrasyonlar için şeffaf paketlerimiz mevcuttur. Kredi kartı gerekmeden hemen başlayabilirsiniz.",
      quickActions: ["Ücretsiz Başlayın", "Özellikleri Gör", "B2B İletişim"],
    };
  }

  // WhatsApp & SMS bildirimleri
  if (lower.includes('whatsapp') || lower.includes('sms') || lower.includes('onay') || lower.includes('hatırlat') || lower.includes('bildirim')) {
    return {
      reply: "Müşteriniz randevu oluşturduğu anda sistem anında otomatik WhatsApp ve SMS onay mesajı gönderir. Ayrıca randevu saatine 2 saat kala giden akıllı hatırlatma bildirimi sayesinde randevuyu unutma ve gelinmeme oranı %88 azalır.",
      quickActions: ["Canlı Demo", "Nasıl Başlarım?", "Takvim Eşitleme"],
    };
  }

  // Takvim senkronizasyonu
  if (lower.includes('takvim') || lower.includes('google') || lower.includes('outlook') || lower.includes('senkron') || lower.includes('çakışma')) {
    return {
      reply: "Google Calendar ve Outlook ile çift yönlü anlık senkronizasyon sağlıyoruz. Kişisel takviminizde bir etkinlik olduğunda o saatler randevu formunuzda otomatik olarak kapatılır; gelen randevular da anında cebinizdeki takvime işlenir.",
      quickActions: ["Ücretsiz Başlayın", "Canlı Demolar", "Özellikleri İncele"],
    };
  }

  // Sektör listesi
  if (lower.includes('sektör') || lower.includes('kimler') || lower.includes('kullanabilir') || lower.includes('doktor') || lower.includes('kuaför') || lower.includes('diyetisyen') || lower.includes('avukat')) {
    return {
      reply: "randevuformu.com; Diş Hekimleri, Diyetisyenler, Psikologlar, Fizyoterapistler, Veterinerler, Kuaförler, Berberler, Güzellik Merkezleri, Avukatlar, Kişisel Antrenörler, Oto Servisleri, Dövme Stüdyoları, Fotoğrafçılar ve Pedagoglar dahil 14 farklı sektörün özel iş akışlarına göre eğitilmiş ve yapılandırılmıştır.",
      quickActions: ["Sektörleri Gör", "Canlı Demolar", "Ücretsiz Başlayın"],
    };
  }

  return {
    reply: "Merhaba! Ben randevuformu.com platform rehberiyim. Randevu sistemimizin özellikleri, sektörünüze özel hazır şablonlar, takvim senkronizasyonu veya 1 dakikada ücretsiz form açma adımları hakkında size nasıl yardımcı olabilirim?",
    quickActions: ["Nasıl form açarım?", "Ücretli mi?", "WhatsApp onayları nasıl çalışır?", "Canlı Demolar"],
  };
}

// ────────────────────────────────────────────────────────
// 4. MÜŞTERİ CHATBOTU (14 Sektöre & Randevuya Özel Eğitilmiş)
// ────────────────────────────────────────────────────────
// ────────────────────────────────────────────────────────
// 4. MÜŞTERİ CHATBOTU (Öğretmen Seviyesinde Eğitilmiş & Gerçek İşletme Verileriyle Bütünleşik)
// ────────────────────────────────────────────────────────

/**
 * Groq ve Gemini LLM modellerini sırayla deneyerek öğretmen düzeyinde pedagojik yanıt üretir.
 */
async function callMasterLLM(systemPrompt: string, userMessage: string): Promise<string | null> {
  // 1. Groq (Ultra-Hızlı Llama 3.1)
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey && !groqKey.includes('test') && !groqKey.includes('placeholder')) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${groqKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage },
          ],
          max_tokens: 380,
          temperature: 0.2, // Yüksek doğruluk ve sıfır halüsinasyon için düşük sıcaklık
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.choices?.[0]?.message?.content?.trim();
        if (text) return text;
      }
    } catch (err) {
      console.warn('Groq LLM call failed, trying secondary engine:', err);
    }
  }

  // 2. Google Gemini API (İkincil Güvenilir LLM Motoru)
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey && !geminiKey.includes('test') && !geminiKey.includes('placeholder')) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: systemPrompt }],
          },
          contents: [{ role: 'user', parts: [{ text: userMessage }] }],
          generationConfig: {
            maxOutputTokens: 380,
            temperature: 0.2,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (text) return text;
      }
    } catch (err) {
      console.warn('Gemini LLM call failed:', err);
    }
  }

  return null;
}

export async function processCustomerMessage(
  message: string,
  businessSlugOrId: string
): Promise<CustomerChatResponse> {
  const lower = message.toLowerCase().trim();

  // Ana sayfa platform asistanı isteği ise platform motoruna yönlendir
  if (businessSlugOrId === 'platform' || businessSlugOrId === 'randevuformu') {
    return processPlatformMessage(message);
  }

  const isByErman =
    !businessSlugOrId ||
    businessSlugOrId === 'byerman' ||
    businessSlugOrId === 'ermankuafor' ||
    businessSlugOrId === 'byerman-id' ||
    businessSlugOrId === 'default';

  const cleanSlug = isByErman ? 'byerman' : businessSlugOrId;

  // 1. Sektör Tespiti
  const sector = detectSector(message, cleanSlug);
  const sectorProfile = sector ? SECTOR_EXPERT_PROFILES[sector.slug] : null;

  // 2. Gerçek Bulut & Veritabanı Verilerini Eşzamanlı Yükle (Edge Config + Supabase)
  let cloudProfile: any = null;
  let cloudServices: any[] = [];
  let cloudStaff: any[] = [];

  try {
    const [p, s, st] = await Promise.all([
      getBusinessProfile(cleanSlug).catch(() => null),
      getStoredServices(cleanSlug).catch(() => []),
      getStoredStaff(cleanSlug).catch(() => []),
    ]);
    cloudProfile = p;
    cloudServices = s;
    cloudStaff = st;
  } catch (err) {
    console.warn('Cloud store lookup fallback warning:', err);
  }

  // 3. İşletmenin Gerçek Kimlik Bilgilerini Belirle
  const businessName = isByErman
    ? (cloudProfile?.name || DEFAULT_BYERMAN_PROFILE.name)
    : (cloudProfile?.name || (sector ? sector.exampleName : 'İşletmemiz'));

  const businessCategory = isByErman
    ? 'Erkek Berberi'
    : (cloudProfile?.category || (sector ? sector.category : 'Randevu Hizmeti'));

  const address = isByErman
    ? (cloudProfile?.address || DEFAULT_BYERMAN_PROFILE.address)
    : (cloudProfile?.address || 'İstanbul');

  const phone = isByErman
    ? (cloudProfile?.phone || DEFAULT_BYERMAN_PROFILE.phone)
    : (cloudProfile?.phone || '+90 538 480 90 01');

  const mapsUrl = isByErman
    ? (cloudProfile?.google_maps_url || DEFAULT_BYERMAN_PROFILE.google_maps_url)
    : (cloudProfile?.google_maps_url || '');

  const workingHours = isByErman
    ? (cloudProfile?.working_hours || DEFAULT_BYERMAN_PROFILE.working_hours)
    : (cloudProfile?.working_hours || 'Pazartesi - Cuma: 09:30 - 21:30 | Cumartesi: 09:30 - 23:00 | Pazar: Kapalı');

  // Gerçek Personel Listesi
  const rawStaff = cloudStaff && cloudStaff.length > 0 ? cloudStaff : (isByErman ? BYERMAN_DEFAULT_STAFF : []);
  const activeStaff = rawStaff.filter((s: any) => s.is_active !== false);

  // 4. KESİN KURAL: Konu dışı filtre kontrolü (Siyaset, Kodlama, Genel İstismar)
  if (isForbiddenTopic(lower)) {
    return {
      reply: getForbiddenReply(businessName),
      quickActions: ['Uygun Saatleri Gör', 'Hizmet ve Fiyatlar', 'WhatsApp Hattı'],
      isBlockedTopic: true,
      detectedSector: sector?.slug,
    };
  }

  // 5. Gerçek Hizmet & Fiyat Listesini Derle
  let servicesList: Array<{ name: string; price: number; durationMin: number; description?: string; is_extra?: boolean }> = [];

  if (cloudServices && cloudServices.length > 0) {
    servicesList = cloudServices.map((s: any) => {
      let price = Number(s.price) || 0;
      if (price <= 0 && isByErman) {
        const match = DEFAULT_BYERMAN_SERVICES.find((def) => def.id === s.id || def.name === s.name);
        if (match && match.price) {
          price = match.price;
        }
      }
      return {
        name: s.name,
        price: price || 350,
        durationMin: s.duration_minutes || s.durationMin || 30,
        description: s.description || '',
        is_extra: Boolean(s.is_extra),
      };
    });
  } else if (isByErman) {
    servicesList = DEFAULT_BYERMAN_SERVICES.map((s) => ({
      name: s.name,
      price: s.price || 350,
      durationMin: s.duration_minutes || 30,
      description: s.description || '',
      is_extra: Boolean(s.is_extra),
    }));
  } else if (sector && sector.services && sector.services.length > 0) {
    servicesList = sector.services.map((s: SektorServiceItem) => ({
      name: s.name,
      price: s.price || 500,
      durationMin: s.duration_minutes || 30,
      description: s.description || '',
      is_extra: false,
    }));
  } else {
    servicesList = [
      { name: 'Standart Seans & Hizmet', price: 400, durationMin: 30, description: 'Birebir uzman hizmeti ve uygulama.' },
      { name: 'Kapsamlı Seans & Bakım', price: 700, durationMin: 60, description: 'Detaylı analiz ve tam kapsamlı hizmet.' },
    ];
  }

  const prepTip = isByErman
    ? 'Tüm hizmetlerimizde tek kullanımlık steril havlu ve ustura kullanılmaktadır. Seans saatinde koltuğunuzun hazır olması için randevu saatinden 5 dakika önce gelmeniz yeterlidir.'
    : (sectorProfile?.prepTip || 'Randevu saatinden 5-10 dakika önce gelmeniz seansınızın zamanında başlamasını sağlar.');

  // 6. Tarih ve Zaman Hesaplamaları (Türkiye Saati & Pazar Bilinci)
  const now = new Date();
  const currentDayOfWeek = now.getDay(); // 0 = Pazar, 1 = Pazartesi ... 6 = Cumartesi

  let isAskingTomorrow = lower.includes('yarın') || lower.includes('yarin');
  let isAskingToday = lower.includes('bugün') || lower.includes('bugun');
  let isAskingAvailability =
    lower.includes('boş') ||
    lower.includes('bos') ||
    lower.includes('müsait') ||
    lower.includes('musait') ||
    lower.includes('saat') ||
    lower.includes('yer var') ||
    lower.includes('seans');

  const tomorrowDayOfWeek = (currentDayOfWeek + 1) % 7;
  const tomorrowIsSunday = tomorrowDayOfWeek === 0;

  // 7. LLM ile Derin Öğretmen Düzeyinde Yanıt Üretimi
  const staffContext = activeStaff
    .map((sm: any) => `• ${sm.name || sm.display_name} (${sm.role || sm.title || 'Uzman Usta'})`)
    .join('\n');

  const servicesContext = servicesList
    .map((s) => `• ${s.name}: ₺${s.price} (${s.durationMin} dakika)${s.description ? ` — ${s.description}` : ''}`)
    .join('\n');

  const teacherSystemPrompt = `SEN KİMSİN?
Sen "${businessName}" (${businessCategory}) işletmesinin resmi, pedagojik eğitim almış, son derece bilgili, saygılı ve yardımsever Türkçe Randevu Asistanısın.
Bir öğretmen gibi; müşterilere tane tane, saygılı, net, güven veren ve %100 DOĞRU bilgilerle yol gösterirsin.

İŞLETME RESMİ BİLGİLERİ (ASLA BUNLARIN DIŞINA ÇIKMA, ASLA BAŞKA SEKTÖRDEN BİLGİ KARIŞTIRMA!):
- İşletme Adı: ${businessName}
- Faaliyet Alanı: ${businessCategory}
- Açık Adres: ${address}
${mapsUrl ? `- Google Haritalar Linki: ${mapsUrl}` : ''}
- Telefon / WhatsApp: ${phone}
- Çalışma Saatleri: ${workingHours}
- PAZAR GÜNÜ DURUMU: ${isByErman ? 'Pazar günleri tamamen KAPALIDIR. Pazar gününe ASLA randevu verme!' : 'Pazar günleri kapalıdır.'}
- Hizmet Veren Uzman Ustalarımız:
${staffContext}

GÜNCEL HİZMET VE FİYAT LİSTESİ:
${servicesContext}

ÖNEMLİ POLİTİKALAR & KURALLAR:
1. Randevu İptali / Saati Erteleme: Müşteriler randevularını https://randevuformu.com/randevu/yonet adresinden veya onay SMS/WhatsApp bildirimindeki bağlantıdan tek tıkla cezasız erteleyebilir veya iptal edebilirler.
2. Ödeme Yöntemleri: Nakit, Kredi Kartı & Banka Kartı (temassız dahil tüm bankalar) ve Havale/EFT kabul edilmektedir. Randevu alırken kart bilgisi girilmesi gerekmez, ödeme seans sonrası yapılır.
3. Çocuk Tıraşı: 12 yaş altı çocuklar için Çocuk Saç Kesimi (₺250 / 30 dk) mevcuttur.
4. Hijyen: Her müşteride tek kullanımlık steril havlu ve jilet kullanılır.

ÖĞRETMEN GİBİ CEVAPLAMA TALİMATLARI:
1. GERÇEKÇİLİK: Sadece bu işletmenin yukarıda yazılı gerçek hizmetleri ve fiyatları hakkında konuş. Asla olmayan bir hizmeti uydurma.
2. PAZAR GÜNÜ KURALI: Eğer kullanıcı yarın için sorarsa ve yarın Pazar ise; "Salonumuz Pazar günleri kapalıdır. Ancak sizi Pazartesi günü için memnuniyetle ağırlayabiliriz" diyerek Pazartesi gününe davet et.
3. KISA VE ÖZ: Net, maddeli, Türkçe imla kurallarına uygun ve samimi cevap ver.
4. YÖNLENDİRME: Cevabının sonunda müşteriyi sayfadaki randevu alma formundan saat seçmeye davet et.`;

  const llmReply = await callMasterLLM(teacherSystemPrompt, message);

  // Müsaitlik veya boş saat sorulduğunda önerilecek akıllı slotlar
  let suggestedSlots: any[] | undefined = undefined;
  if (isAskingTomorrow || isAskingToday || isAskingAvailability) {
    if (isAskingTomorrow && tomorrowIsSunday && isByErman) {
      // Yarın Pazar ise Pazartesi gününün slotlarını öner
      const mondayDate = addDays(now, 2);
      const mondayStr = format(mondayDate, 'yyyy-MM-dd');
      const srvName = servicesList[0]?.name || 'Saç Kesimi & Yıkama';
      suggestedSlots = [
        { id: 'm1', time: '10:00', date: mondayStr, serviceName: srvName, isDiscounted: false },
        { id: 'm2', time: '11:30', date: mondayStr, serviceName: srvName, isDiscounted: false },
        { id: 'm3', time: '14:00', date: mondayStr, serviceName: srvName, isDiscounted: true },
        { id: 'm4', time: '16:30', date: mondayStr, serviceName: srvName, isDiscounted: false },
        { id: 'm5', time: '18:00', date: mondayStr, serviceName: srvName, isDiscounted: false },
        { id: 'm6', time: '20:00', date: mondayStr, serviceName: srvName, isDiscounted: false },
      ];
    } else {
      const target = isAskingTomorrow ? addDays(now, 1) : now;
      const targetStr = format(target, 'yyyy-MM-dd');
      const srvName = servicesList[0]?.name || 'Saç Kesimi & Yıkama';
      suggestedSlots = [
        { id: 's1', time: '10:15', date: targetStr, serviceName: srvName, isDiscounted: false },
        { id: 's2', time: '11:45', date: targetStr, serviceName: srvName, isDiscounted: false },
        { id: 's3', time: '14:00', date: targetStr, serviceName: srvName, isDiscounted: true },
        { id: 's4', time: '16:15', date: targetStr, serviceName: srvName, isDiscounted: false },
        { id: 's5', time: '18:30', date: targetStr, serviceName: srvName, isDiscounted: false },
        { id: 's6', time: '20:00', date: targetStr, serviceName: srvName, isDiscounted: false },
      ];
    }
  }

  // Eğer LLM başarılı bir pedagojik yanıt ürettiyse onu kullan
  if (llmReply) {
    return {
      reply: llmReply,
      suggestedSlots,
      quickActions: ['Hemen Randevu Al', 'Fiyat Listesi', 'Ustalarımız', 'WhatsApp İletişim'],
      detectedSector: sector?.slug,
    };
  }

  // ────────────────────────────────────────────────────────
  // 8. YÜKSEK ZEKALI YEREL EĞİTİLMİŞ MOTOR (FALLBACK TEACHER ENGINE)
  // ────────────────────────────────────────────────────────

  // A. Yarın Boş Yer / Müsaitlik Soruları
  if (isAskingTomorrow) {
    if (tomorrowIsSunday && isByErman) {
      return {
        reply: `Salonumuz **Pazar günleri kapalıdır**.\n\nAncak haftanın ilk günü olan **Pazartesi** günü saat 09:30'dan itibaren koltuğumuz sizin için hazır! Sizin için uygun Pazartesi randevu saatlerimiz aşağıdadır. Dilediğiniz saati seçerek anında randevunuzu oluşturabilirsiniz:`,
        suggestedSlots,
        quickActions: ['Pazartesi 10:00 Randevusu', 'Fiyat Listesi', 'WhatsApp Destek'],
        detectedSector: sector?.slug,
      };
    }

    return {
      reply: `Yarın için **${businessName}** salonumuzda uygun randevu saatlerimiz mevcuttur. Size en uygun saati seçerek randevunuzu saniyeler içinde onaylayabilirsiniz:`,
      suggestedSlots,
      quickActions: ['Yarın 10:15 Randevusu', 'Fiyat Listesi', 'WhatsApp ile Danış'],
      detectedSector: sector?.slug,
    };
  }

  // B. Bugün Boş Yer / Genel Müsaitlik
  if (isAskingToday || isAskingAvailability) {
    return {
      reply: `Bugün için **${businessName}** salonumuzda uygun bulunan saatler aşağıda listelenmiştir. Dilediğiniz saati seçerek yerinizi hemen ayırtabilirsiniz:`,
      suggestedSlots,
      quickActions: ['Fiyatları Gör', 'WhatsApp ile Danış', 'Farklı Bir Gün Seç'],
      detectedSector: sector?.slug,
    };
  }

  // C. Hizmet & Fiyat Soruları
  if (
    lower.includes('fiyat') ||
    lower.includes('ücret') ||
    lower.includes('ucret') ||
    lower.includes('kaç tl') ||
    lower.includes('kac para') ||
    lower.includes('maliyet') ||
    lower.includes('ne kadar') ||
    lower.includes('tarife')
  ) {
    // Özel olarak bir hizmet sorulmuş mu?
    if (lower.includes('sakal')) {
      return {
        reply: `**Sakal Tıraşı & Sıcak Havlu:** ₺200 (25 dakika)\n\nGeleneksel ustura tıraşı, sakal hattı şekillendirme ve buharlı sıcak havlu kompresi içermektedir.\n\nDilerseniz saç kesimiyle birlikte **Saç + Sakal Komple Tıraş & Bakım (₺500)** paketimizi de tercih edebilirsiniz.`,
        quickActions: ['Sakal Tıraşı Randevusu Al', 'Tüm Fiyat Listesi', 'Yarın Boş Yerler'],
        detectedSector: sector?.slug,
      };
    }

    if (lower.includes('çocuk') || lower.includes('cocuk')) {
      return {
        reply: `**Çocuk Saç Kesimi (12 yaş altı):** ₺250 (30 dakika)\n\nÇocuklarımız için sabırlı, eğlenceli ve özenli saç kesimi hizmeti sunuyoruz.`,
        quickActions: ['Çocuk Saç Kesimi Seç', 'Tüm Fiyatlar', 'Yarın Boş Saatler'],
        detectedSector: sector?.slug,
      };
    }

    if (lower.includes('saç') && !lower.includes('sakal')) {
      return {
        reply: `**Saç Kesimi & Yıkama & Fön:** ₺350 (35 dakika)\n\nKişinin yüz tipine uygun modern saç kesimi, saç yıkama ve stil fön uygulamasını içerir.`,
        quickActions: ['Saç Kesimi Randevusu Al', 'Tüm Fiyat Listesi', 'Yarın Boş Saatler'],
        detectedSector: sector?.slug,
      };
    }

    const prices = servicesList
      .map((s) => `• **${s.name}**: ₺${s.price} (${s.durationMin} dk)${s.description ? ` — _${s.description}_` : ''}`)
      .join('\n');

    return {
      reply: `**${businessName}** güncel hizmet ve seans ücret tarifemiz:\n\n${prices}\n\n💡 _${prepTip}_\n\nRandevu almak için herhangi bir ön ödeme gerekmez; ödemenizi işlem sonrasında nakit veya kredi kartıyla yapabilirsiniz.`,
      quickActions: ['Yarın Boş Yer Var mı?', 'Hemen Randevu Al', 'WhatsApp ile Danış'],
      detectedSector: sector?.slug,
    };
  }

  // D. Ustalar & Personel Ekibi Soruları
  if (
    lower.includes('usta') ||
    lower.includes('berber') ||
    lower.includes('kimler') ||
    lower.includes('erman') ||
    lower.includes('ahmet') ||
    lower.includes('personel') ||
    lower.includes('çalışan') ||
    lower.includes('calisan') ||
    lower.includes('ekip')
  ) {
    const staffListDisplay = activeStaff && activeStaff.length > 0
      ? activeStaff.map((s: any) => `• **${s.name || s.display_name}** (${s.role || s.title || 'Usta'}): ${s.badge || s.chair || 'Uzman Usta'}`).join('\n')
      : '• **Erman Usta (Master Barber / Kurucu):** Klasik Türk berberi, sıcak havlu ve saç tasarım uzmanı.';

    const staffActions = activeStaff && activeStaff.length > 0
      ? activeStaff.map((s: any) => `${s.name || s.display_name} ile Randevu`).concat(['Yarın Boş Yerler'])
      : ['Erman Usta ile Randevu', 'Yarın Boş Yerler'];

    return {
      reply: `**${businessName} Bünyesinde Hizmet Veren Uzman Ekibimiz:**\n\n${staffListDisplay}\n\nRandevu alırken tercih ettiğiniz ustayı seçebilir veya en erken randevu için **"İlk Müsait Usta"** seçeneğini kullanabilirsiniz.`,
      quickActions: staffActions,
      detectedSector: sector?.slug,
    };
  }

  // E. Adres, Ulaşım & Konum Soruları
  if (
    lower.includes('nerede') ||
    lower.includes('adres') ||
    lower.includes('konum') ||
    lower.includes('telefon') ||
    lower.includes('ulaşım') ||
    lower.includes('ulasim') ||
    lower.includes('harita') ||
    lower.includes('yol tarifi')
  ) {
    return {
      reply: `📍 **${businessName} Salon Adresimiz:**\n${address}\n\n🗺️ **Harita & Yol Tarifi:**\n${mapsUrl ? `[Google Haritalar'da Aç](${mapsUrl})\n\n` : ''}📞 **Telefon / WhatsApp:** ${phone}\n\nRandevunuzu tamamladığınızda açık adresimiz ve navigasyon linkimiz SMS ve WhatsApp ile cebinize otomatik iletilmektedir.`,
      quickActions: ['Yol Tarifi Al', 'Yarın Boş Saatler', 'WhatsApp İletişim'],
      detectedSector: sector?.slug,
    };
  }

  // F. Çalışma Saatleri Soruları
  if (
    lower.includes('saat kaç') ||
    lower.includes('çalışma saat') ||
    lower.includes('calisma saat') ||
    lower.includes('kaça kadar') ||
    lower.includes('kaçta aç') ||
    lower.includes('açık mı') ||
    lower.includes('acik mi') ||
    lower.includes('pazar')
  ) {
    return {
      reply: `**${businessName} Çalışma Saatlerimiz:**\n\n• **Pazartesi - Cuma:** 09:30 - 21:30\n• **Cumartesi:** 09:30 - 23:00\n• **Pazar:** Kapalı\n\nDilediğiniz gün ve saat için web sitemiz üzerinden 7/24 online randevu oluşturabilirsiniz.`,
      quickActions: ['Yarın Boş Yerler', 'Fiyat Listesi', 'WhatsApp Destek'],
      detectedSector: sector?.slug,
    };
  }

  // G. Randevu İptali, Değişikliği & Erteleme
  if (
    lower.includes('iptal') ||
    lower.includes('ertele') ||
    lower.includes('değiştir') ||
    lower.includes('degistir') ||
    lower.includes('gelemeyeceğim') ||
    lower.includes('saatimi')
  ) {
    return {
      reply: `Randevunuzu dilediğiniz an self-servis olarak yönetebilirsiniz:\n\n1. **Online Randevu Masası:** Doğrudan [randevuformu.com/randevu/yonet](https://randevuformu.com/randevu/yonet) adresine giderek telefon numaranızla giriş yapabilir,\n2. **Onay Mesajı:** Size gelen SMS veya WhatsApp onay mesajındaki **"Randevumu Yönet"** bağlantısına tıklayabilirsiniz.\n\nHerhangi bir ceza veya kesinti olmadan saniyeler içinde yeni bir saate erteleyebilir veya iptal edebilirsiniz.`,
      quickActions: ['Randevu Yönetim Masası', 'WhatsApp ile Bildir', 'Yeni Randevu Al'],
      detectedSector: sector?.slug,
    };
  }

  // H. Ödeme Yöntemleri
  if (
    lower.includes('ödeme') ||
    lower.includes('odeme') ||
    lower.includes('kredi kart') ||
    lower.includes('kart geçerli') ||
    lower.includes('kart geçiyor') ||
    lower.includes('nakit') ||
    lower.includes('havale') ||
    lower.includes('eft')
  ) {
    return {
      reply: `Salonumuzda **Nakit**, **Kredi Kartı & Banka Kartı** (tüm bankalar, temassız dahil) ve **Havale / EFT** ile ödeme kabul edilmektedir.\n\nRandevu alırken kart bilgisi girmeniz gerekmez; ödemenizi işlem sonrasında kasada yapabilirsiniz.`,
      quickActions: ['Hemen Randevu Al', 'Fiyat Listesi', 'Yarın Boş Saatler'],
      detectedSector: sector?.slug,
    };
  }

  // I. Çocuk Saç Kesimi Soruları
  if (lower.includes('çocuk') || lower.includes('bebek') || lower.includes('oğlum') || lower.includes('oglum')) {
    return {
      reply: `Evet! 12 yaş altı çocuklarımız için özel, sabırlı ve eğlenceli **Çocuk Saç Kesimi (₺250 / 30 dk)** hizmetimiz mevcuttur. Çocuğunuzun saçını özenle ve sakin bir ortamda tıraş ediyoruz.`,
      quickActions: ['Çocuk Saç Kesimi Randevusu', 'Fiyat Listesi', 'Yarın Boş Saatler'],
      detectedSector: sector?.slug,
    };
  }

  // J. Varsayılan Eğitilmiş Karşılama
  return {
    reply: `Merhaba! Ben **${businessName}** akıllı randevu asistanıyım. Size randevu saatleri, hizmet ve ücretlerimiz, adresimiz ve uzman ustalarımız hakkında memnuniyetle yardımcı olabilirim. Nasıl yardımcı olabilirim?`,
    quickActions: ['Yarın boş yer var mı?', 'Fiyat listesi nedir?', 'Neredesiniz? (Konum)', 'Hangi ustalar var?'],
    detectedSector: sector?.slug,
  };
}

// ────────────────────────────────────────────────────────
// 5. İŞLETME YÖNETİM CHATBOTU (Panel & Yönetici Odaklı)
// ────────────────────────────────────────────────────────
export async function generateBusinessSummary(
  businessId: string,
  customQuery?: string
): Promise<BusinessSummaryResponse> {
  // Soru sorulmuşsa ve yasaklı konu içeriyorsa engelle
  if (customQuery && isForbiddenTopic(customQuery)) {
    return {
      greeting: 'Güvenlik Uyarısı',
      reply: 'İşletme AI asistanı yalnızca randevularınız, ciro analiziniz, bekleme listesi ve işletme operasyonlarınız için tasarlanmıştır. Siyaset, yazılım/kodlama veya harici konularda analiz yapılamaz.',
      metrics: {
        totalAppointmentsToday: 0,
        pendingCount: 0,
        expectedRevenue: 0,
        noShowRiskAlerts: 0,
        waitlistCount: 0,
      },
      insights: ['Lütfen günlük seanslarınız veya müşteri doluluğunuzla ilgili sorular sorunuz.'],
      isBlockedTopic: true,
    };
  }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  let appointments: any[] = [];
  let waitlistCount = 0;

  try {
    appointments = await prisma.appointment.findMany({
      where: {
        businessId,
        startTime: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
      include: {
        service: true,
      },
    });

    waitlistCount = await prisma.waitlistEntry.count({
      where: {
        businessId,
        status: 'WAITING',
      },
    });
  } catch (err) {
    console.warn('Business summary query warning:', err);
  }

  const total = appointments.length;
  const pending = appointments.filter((a) => a.status === 'PENDING').length;
  const revenue = appointments.reduce(
    (acc, curr) => acc + (curr.totalAmount || curr.service?.price || 0),
    0
  );

  const insights: string[] = [];

  if (pending > 0) {
    insights.push(`Onay bekleyen ${pending} adet randevunuz bulunuyor. Müşterilere hızlı dönüş yapılması doluluğu artırır.`);
  }

  if (waitlistCount > 0) {
    insights.push(`Bekleme listesinde ${waitlistCount} potansiyel müşteri var. İptal olan saatlerde otomatik bildirim devrede.`);
  }

  if (total === 0) {
    insights.push('Bugün için henüz randevu yok. Dinamik "Günün Boş Saatleri" indirim motorunu aktif ederek son dakika müşterileri çekebilirsiniz.');
  } else {
    insights.push(`Bugün toplam ${total} seans planlandı. Tahmini günlük ciro: ₺${revenue}.`);
  }

  let customReply: string | undefined = undefined;
  if (customQuery) {
    const qLower = customQuery.toLowerCase();
    if (qLower.includes('ciro') || qLower.includes('gelir')) {
      customReply = `Bugünkü tahmini toplam cironuz: ₺${revenue}. Toplam seans adedi: ${total}.`;
    } else if (qLower.includes('bekleme') || qLower.includes('yedek') || qLower.includes('waitlist')) {
      customReply = `Şu anda bekleme listesinde ${waitlistCount} danışan yer açılmasını bekliyor. İptal durumunda sistem tek tıkla davet mesajı atmanızı sağlar.`;
    } else if (qLower.includes('no-show') || qLower.includes('risk')) {
      customReply = `No-Show Risk Radarı devrede. Gelmeme riski yüksek müşterilerden otomatik kapora talep edilmektedir.`;
    } else {
      customReply = `Bugün ${total} randevunuz mevcut. Tahmini ciro: ₺${revenue}. Başka hangi operasyonel veriyi incelemek istersiniz?`;
    }
  }

  return {
    greeting: `Gününüz aydın olsun! İşletmenizin anlık randevu ve operasyonel özeti hazır:`,
    reply: customReply,
    metrics: {
      totalAppointmentsToday: total,
      pendingCount: pending,
      expectedRevenue: revenue,
      noShowRiskAlerts: 0,
      waitlistCount,
    },
    insights,
  };
}
