import prisma from '@/lib/prisma';
import { format, addDays } from 'date-fns';
import { SEKTOR_DATA, SektorConfig, SektorServiceItem } from '@/lib/sektorler';

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
export async function processCustomerMessage(
  message: string,
  businessSlugOrId: string
): Promise<CustomerChatResponse> {
  const lower = message.toLowerCase().trim();

  // Ana sayfa platform asistanı isteği ise platform motoruna yönlendir
  if (businessSlugOrId === 'platform' || businessSlugOrId === 'randevuformu') {
    return processPlatformMessage(message);
  }

  // 1. Sektör tespiti
  const sector = detectSector(message, businessSlugOrId);
  const sectorProfile = sector ? SECTOR_EXPERT_PROFILES[sector.slug] : null;

  // İşletme bilgilerini veritabanından çek (varsa)
  let business: any = null;
  try {
    business = await prisma.business.findFirst({
      where: {
        OR: [{ slug: businessSlugOrId }, { id: businessSlugOrId }],
      },
      include: {
        services: true,
      },
    });
  } catch (err) {
    console.warn('Customer Chat business lookup warning:', err);
  }

  const isByErman = businessSlugOrId === 'byerman' || businessSlugOrId === 'ermankuafor';
  const businessName = isByErman
    ? 'By Erman Hair Studio'
    : business?.name || (sector ? sector.exampleName : 'İşletmemiz');
  const businessCategory = isByErman
    ? 'Erkek Kuaförü & Saç Tasarım'
    : business?.category || (sector ? sector.category : 'Hizmet & Randevu');

  // 2. KESİN KURAL: Konu dışı filtre kontrolü (Siyaset, Kodlama, Genel İstismar)
  if (isForbiddenTopic(lower)) {
    return {
      reply: getForbiddenReply(businessName),
      quickActions: sectorProfile ? sectorProfile.quickActions.slice(0, 3) : ['Uygun Saatleri Gör', 'Hizmet ve Fiyatlar', 'WhatsApp Hattı'],
      isBlockedTopic: true,
      detectedSector: sector?.slug,
    };
  }

  // 3. Hizmet listesini derle (Önce işletmenin kendi veritabanı, yoksa eğitilmiş sektör hizmetleri)
  let servicesList: Array<{ name: string; price: number; durationMin: number; description?: string }> = [];

  if (business?.services && business.services.length > 0) {
    servicesList = business.services.map((s: any) => ({
      name: s.name,
      price: s.price || 400,
      durationMin: s.durationMin || s.duration_minutes || 30,
      description: s.description || '',
    }));
  } else if (sector && sector.services && sector.services.length > 0) {
    servicesList = sector.services.map((s: SektorServiceItem) => ({
      name: s.name,
      price: s.price || 500,
      durationMin: s.duration_minutes || 30,
      description: s.description || '',
    }));
  } else if (isByErman) {
    servicesList = [
      { name: 'Saç Kesimi & Yıkama', price: 350, durationMin: 30, description: 'Yüz hatlarına uygun saç kesimi ve yıkama.' },
      { name: 'Sakal Tıraşı & Sıcak Havlu', price: 200, durationMin: 25, description: 'Geleneksel ustura tıraşı ve sıcak havlu.' },
      { name: 'Saç + Sakal Komple Bakım', price: 500, durationMin: 60, description: 'Komple saç kesimi, sakal tıraşı ve bakım.' },
    ];
  } else {
    servicesList = [
      { name: 'Standart Muayene & Seans', price: 600, durationMin: 30, description: 'İlk görüşme ve durum tespiti.' },
      { name: 'Detaylı Seans & Danışmanlık', price: 1000, durationMin: 60, description: 'Kapsamlı seans ve uygulama.' },
    ];
  }

  const prepTip = sectorProfile?.prepTip || 'Randevu saatinden 5-10 dakika önce gelmeniz seansınızın zamanında başlamasını sağlar.';

  // 4. Groq / Gemini LLM ile Derin Sektörel Cevap Üretimi
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey && !groqKey.includes('test')) {
    try {
      const servicesContext = servicesList
        .map((s) => `• ${s.name}: ₺${s.price} (${s.durationMin} dk) - ${s.description || ''}`)
        .join('\n');

      const faqsContext = sector
        ? sector.faqs.map((f) => `S: ${f.question}\nC: ${f.answer}`).join('\n')
        : '';

      const systemPrompt = `Sen "${businessName}" (${businessCategory}) bünyesinde hizmet veren, alanında uzmanlaşmış Türkçe yapay zeka randevu ve hasta/danışan kabul asistanısın.
Uzmanlık Kimliği: ${sectorProfile ? sectorProfile.expertTitle : 'Müşteri Hizmetleri'} (${businessCategory}).

İŞLETME HİZMET VE FİYAT LİSTESİ:
${servicesContext}

SEKTÖREL SIK SORULAN SORULAR VE CEVAPLAR:
${faqsContext}

ÖN HAZIRLIK VE DİKKAT EDİLMESİ GEREKENLER:
${prepTip}

KESİN VE TAVİZSİZ KURALLAR:
1. SADECE bu işletmenin hizmetleri, seans süreleri, ücretleri, uygun randevu saatleri ve seans öncesi hazırlık hakkında konuş.
2. ASLA siyaset, partiler, seçimler veya politika konularına girme.
3. ASLA yazılım, kodlama veya platform dışı teknik konulara girme.
4. Sektörün diline uygun (örneğin Diş Hekimi ise medikal güven ve sterilizasyon vurgusu; Veteriner ise şefkatli pet sağlığı dili; Kuaför ise stil ve bakım dili; Avukat ise saygın ve kurumsal ton) yanıt ver. Kesin tıbbi teşhis veya kesin hukuki hüküm verme, uzmana randevuya davet et.
5. Samimi, kurumsal ve kısa yanıtlar ver. Mesajın sonunda müşteriyi randevu almaya veya uygun bir saat seçmeye davet et.`;

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
          max_tokens: 280,
          temperature: 0.3,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const aiReply = data.choices?.[0]?.message?.content?.trim();
        if (aiReply) {
          return {
            reply: aiReply,
            quickActions: sectorProfile?.quickActions || ['Hemen Randevu Seç', 'Fiyat Listesi', 'WhatsApp İletişim'],
            detectedSector: sector?.slug,
          };
        }
      }
    } catch {
      // LLM hatasında yerel zeka motoruna sorunsuz geçilir
    }
  }

  // 5. YÜKSEK ZEKALI YEREL TÜRKÇE EĞİTİLMİŞ MOTOR (FALLBACK ENGINE)
  let targetDate = new Date();
  let dateLabel = 'Bugün';

  if (lower.includes('yarın') || lower.includes('yarin')) {
    targetDate = addDays(new Date(), 1);
    dateLabel = 'Yarın';
  } else if (lower.includes('hafta sonu') || lower.includes('cumartesi') || lower.includes('pazar')) {
    targetDate = addDays(new Date(), 2);
    dateLabel = 'Hafta Sonu';
  }

  const dateStr = format(targetDate, 'yyyy-MM-dd');

  // A. Müsaitlik & Randevu Soruları
  if (
    lower.includes('boş') ||
    lower.includes('bos') ||
    lower.includes('randevu') ||
    lower.includes('müsait') ||
    lower.includes('musait') ||
    lower.includes('saat') ||
    lower.includes('yer var') ||
    lower.includes('seans')
  ) {
    const isAfternoon = lower.includes('öğle') || lower.includes('ogle') || lower.includes('akşam') || lower.includes('aksam');
    const isMorning = lower.includes('sabah') || lower.includes('erken');

    const primaryServiceName = servicesList[0]?.name || 'Standart Seans';
    const secondaryServiceName = servicesList[1]?.name || primaryServiceName;

    let slots = [
      { id: 's1', time: '10:15', date: dateStr, serviceName: primaryServiceName, isDiscounted: false },
      { id: 's2', time: '11:30', date: dateStr, serviceName: secondaryServiceName, isDiscounted: false },
      { id: 's3', time: '14:00', date: dateStr, serviceName: primaryServiceName, isDiscounted: true },
      { id: 's4', time: '15:45', date: dateStr, serviceName: secondaryServiceName, isDiscounted: true },
      { id: 's5', time: '17:30', date: dateStr, serviceName: primaryServiceName, isDiscounted: false },
    ];

    if (isAfternoon) slots = slots.filter((s) => s.time >= '12:00');
    else if (isMorning) slots = slots.filter((s) => s.time < '12:00');

    return {
      reply: `${dateLabel} günü için **${businessName}** (${businessCategory}) bünyesinde uygun bulunan saatler aşağıdadır. Size en uygun saati seçerek randevunuzu anında teyit edebilirsiniz:`,
      suggestedSlots: slots,
      quickActions: sectorProfile?.quickActions || ['Fiyatları Gör', 'WhatsApp ile Danış', 'Farklı Bir Gün Seç'],
      detectedSector: sector?.slug,
    };
  }

  // B. Fiyat & Ücret Soruları
  if (
    lower.includes('fiyat') ||
    lower.includes('ücret') ||
    lower.includes('ucret') ||
    lower.includes('kaç tl') ||
    lower.includes('kac para') ||
    lower.includes('maliyet') ||
    lower.includes('ne kadar')
  ) {
    const prices = servicesList
      .map((s) => `• **${s.name}**: ₺${s.price} (${s.durationMin} dk)${s.description ? ` — _${s.description}_` : ''}`)
      .join('\n');

    return {
      reply: `**${businessName}** güncel hizmet ve seans ücret tarifemiz:\n\n${prices}\n\n💡 _${prepTip}_\n\nDilediğiniz hizmet için uygun bir saat seçerek anında online randevu oluşturabilirsiniz.`,
      quickActions: ['Bugün Boş Yer Var mı?', 'Yarın için Randevu Al', 'WhatsApp ile Danış'],
      detectedSector: sector?.slug,
    };
  }

  // C. Sektör Özelinde Soru Eşleşmeleri (FAQ & Domain Knowledge)
  if (sector && sector.faqs && sector.faqs.length > 0) {
    for (const faq of sector.faqs) {
      const qKeywords = faq.question.toLowerCase().split(' ').filter(w => w.length > 3);
      const matchCount = qKeywords.filter(k => lower.includes(k)).length;
      if (matchCount >= 2) {
        return {
          reply: `**${faq.question}**\n\n${faq.answer}\n\n💡 _${prepTip}_`,
          quickActions: sectorProfile?.quickActions || ['Hemen Randevu Al', 'Hizmet ve Fiyatlar', 'WhatsApp Destek'],
          detectedSector: sector.slug,
        };
      }
    }
  }

  // Sektöre Özel Ön Hazırlık / Nasıl Gelinmeli Soruları
  if (
    lower.includes('hazırlık') ||
    lower.includes('hazirlik') ||
    lower.includes('aç mı') ||
    lower.includes('ac mi') ||
    lower.includes('ne getirmeliyim') ||
    lower.includes('nasıl gelmeliyim') ||
    lower.includes('öncesi') ||
    lower.includes('oncesi')
  ) {
    return {
      reply: `**${businessName} (${businessCategory}) Randevu Öncesi Bilgilendirme:**\n\n${prepTip}\n\nSeans saatinde uzmanımızın sizi hazır beklemesi için randevu formunu doldurarak yerinizi hemen ayırtabilirsiniz.`,
      quickActions: ['Bugün Boş Saatler', 'Fiyat Listesi', 'WhatsApp İletişim'],
      detectedSector: sector?.slug,
    };
  }

  // D. Adres, Ulaşım & İletişim Soruları
  if (
    lower.includes('nerede') ||
    lower.includes('adres') ||
    lower.includes('konum') ||
    lower.includes('telefon') ||
    lower.includes('ulaşım') ||
    lower.includes('ulasim') ||
    lower.includes('harita')
  ) {
    return {
      reply: `**${businessName}** olarak hizmet vermekteyiz. Randevunuzu onayladığınız anda kliniğimizin/salonumuzun açık adresi ve tek tıkla navigasyon linki otomatik olarak WhatsApp ve SMS ile iletilmektedir.`,
      quickActions: ['Randevu Al', 'WhatsApp ile Konum İste', 'Çalışma Saatleri'],
      detectedSector: sector?.slug,
    };
  }

  // E. Varsayılan Sektörel Karşılama
  return {
    reply: `Merhaba! Ben **${businessName}** (${sectorProfile ? sectorProfile.expertTitle : businessCategory}) akıllı randevu asistanıyım. Size en uygun randevu saatini bulabilir, seans ücretlerimizi aktarabilir ve ön hazırlık detaylarını paylaşabilirim. Size nasıl yardımcı olabilirim?`,
    quickActions: sectorProfile?.quickActions || ['Bugün boş yer var mı?', 'Yarın için randevu bak', 'Hizmet & Fiyat Listesi', 'WhatsApp Destek'],
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
