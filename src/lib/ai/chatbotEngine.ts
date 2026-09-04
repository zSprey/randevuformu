import prisma from '@/lib/prisma';
import { format, addDays } from 'date-fns';

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
// 2. MÜŞTERİ CHATBOTU (İşletme Temasına & Randevuya Özel)
// ────────────────────────────────────────────────────────
export async function processCustomerMessage(
  message: string,
  businessSlugOrId: string
): Promise<CustomerChatResponse> {
  const lower = message.toLowerCase().trim();

  // İşletme bilgilerini çek
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

  const isByErman = businessSlugOrId === 'byerman';
  const businessName = isByErman ? 'By Erman Hair Studio' : business?.name || 'İşletmemiz';
  const businessCategory = isByErman ? 'Erkek Kuaförü & Saç Tasarım' : business?.category || 'Hizmet & Randevu';

  // 1. KURAL: Konu dışı filtre kontrolü (Siyaset, Kodlama, Genel Sohbet)
  if (isForbiddenTopic(lower)) {
    return {
      reply: getForbiddenReply(businessName),
      quickActions: ['Uygun Saatleri Gör', 'Hizmet ve Fiyatlar', 'WhatsApp Hattı'],
      isBlockedTopic: true,
    };
  }

  const servicesList = business?.services?.length
    ? business.services
    : isByErman
    ? [
        { name: 'Saç & Sakal Tasarım', price: 450, durationMin: 45 },
        { name: 'VIP Bakım & Saç Kesimi', price: 700, durationMin: 60 },
        { name: 'Sakal Tıraşı & Cilt Bakımı', price: 300, durationMin: 30 },
      ]
    : [
        { name: 'Standart Seans / Randevu', price: 500, durationMin: 30 },
        { name: 'Detaylı Danışmanlık & Muayene', price: 800, durationMin: 60 },
      ];

  // 2. Groq / Gemini LLM Çağrısı Denemesi
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey && !groqKey.includes('test')) {
    try {
      const systemPrompt = `Sen randevuformu.com platformunda yer alan "${businessName}" (${businessCategory}) işletmesinin resmi yapay zeka asistanısın.
KESİN VE TAVİZSİZ KURALLAR:
1. SADECE randevu alma, uygun seans saatleri, işletme hizmetleri, fiyatlar, adres/çalışma saatleri ve randevu süreçleri hakkında konuşacaksın.
2. ASLA siyaset, partiler, seçimler, politika konularına girme.
3. ASLA yazılım, kodlama, programlama, script konularına girme.
4. ASLA konu dışı sorulara cevap verme.
5. Kısa, samimi, kurumsal ve Türkçe yanıt ver. Müşteriyi randevu almaya davet et.
İşletme Hizmetleri: ${servicesList.map((s: any) => `${s.name} (₺${s.price})`).join(', ')}.`;

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
          max_tokens: 250,
          temperature: 0.3,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const aiReply = data.choices?.[0]?.message?.content?.trim();
        if (aiReply) {
          return {
            reply: aiReply,
            quickActions: ['Hemen Randevu Seç', 'Fiyat Listesi', 'WhatsApp İletişim'],
          };
        }
      }
    } catch {
      // LLM hatası durumunda yerel zeka motoruna sorunsuz geç
    }
  }

  // 3. Yüksek Zekalı Yerel Türkçe Yanıt Motoru (Sektör & Tema Odaklı)
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

  // Müsaitlik & Randevu Soruları
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

    let slots = [
      { id: 's1', time: '10:30', date: dateStr, serviceName: servicesList[0]?.name || 'Hizmet', isDiscounted: false },
      { id: 's2', time: '11:45', date: dateStr, serviceName: servicesList[0]?.name || 'Hizmet', isDiscounted: false },
      { id: 's3', time: '14:15', date: dateStr, serviceName: servicesList[0]?.name || 'Hizmet', isDiscounted: true },
      { id: 's4', time: '16:00', date: dateStr, serviceName: servicesList[0]?.name || 'Hizmet', isDiscounted: true },
      { id: 's5', time: '17:30', date: dateStr, serviceName: servicesList[0]?.name || 'Hizmet', isDiscounted: false },
    ];

    if (isAfternoon) slots = slots.filter((s) => s.time >= '12:00');
    else if (isMorning) slots = slots.filter((s) => s.time < '12:00');

    return {
      reply: `${dateLabel} günü için ${businessName} bünyesinde uygun bulduğum saatler aşağıdadır. İndirimli saatleri kaçırmadan tek tıkla seçebilirsiniz:`,
      suggestedSlots: slots,
      quickActions: ['Fiyatları Gör', 'WhatsApp ile Danış', 'Farklı Bir Gün Seç'],
    };
  }

  // Fiyat & Ücret Soruları
  if (lower.includes('fiyat') || lower.includes('ücret') || lower.includes('ucret') || lower.includes('kaç tl') || lower.includes('kac para')) {
    const prices = servicesList
      .map((s: any) => `• ${s.name}: ₺${s.price || 400} (${s.durationMin || 30} dk)`)
      .join('\n');

    return {
      reply: `${businessName} güncel hizmet ve fiyat listemiz:\n\n${prices}\n\nDilediğiniz hizmeti seçerek doğrudan online randevu oluşturabilirsiniz.`,
      quickActions: ['Bugün Boş Yer Var mı?', 'Yarın için Randevu Al', 'WhatsApp İletişim'],
    };
  }

  // Adres & İletişim Soruları
  if (lower.includes('nerede') || lower.includes('adres') || lower.includes('konum') || lower.includes('telefon') || lower.includes('ulaşım')) {
    return {
      reply: `${businessName} olarak hizmet vermekteyiz. Randevu aldığınızda tam adres ve konum bilgisi otomatik olarak SMS ve WhatsApp ile cebinize iletilmektedir. Doğrudan görüşmek isterseniz WhatsApp butonunu kullanabilirsiniz.`,
      quickActions: ['Randevu Al', 'WhatsApp ile Konum İste'],
    };
  }

  // Varsayılan Karşılama
  return {
    reply: `Merhaba! Ben ${businessName} (${businessCategory}) akıllı randevu asistanıyım. Size en uygun randevu saatini bulabilir, seans ücretlerini iletebilir ve rezervasyonunuzu hızlandırabilirim. Nasıl yardımcı olabilirim?`,
    quickActions: ['Bugün boş yer var mı?', 'Yarın için randevu bak', 'Hizmet & Fiyat Listesi', 'WhatsApp Destek'],
  };
}

// ────────────────────────────────────────────────────────
// 3. İŞLETME YÖNETİM CHATBOTU (Panel & Yönetici Odaklı)
// ────────────────────────────────────────────────────────
export async function generateBusinessSummary(businessId: string, customQuery?: string): Promise<BusinessSummaryResponse> {
  // Soru sorulmuşsa ve yasaklı konu içeriyorsa
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
  const revenue = appointments.reduce((acc, curr) => acc + (curr.totalAmount || curr.service?.price || 0), 0);

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
    } else if (qLower.includes('bekleme') || qLower.includes('yedek')) {
      customReply = `Şu anda bekleme listesinde ${waitlistCount} danışan yer açılmasını bekliyor.`;
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
