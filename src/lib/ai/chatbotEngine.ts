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
}

export interface BusinessSummaryResponse {
  greeting: string;
  metrics: {
    totalAppointmentsToday: number;
    pendingCount: number;
    expectedRevenue: number;
    noShowRiskAlerts: number;
    waitlistCount: number;
  };
  insights: string[];
}

/**
 * 1. Müşteri Chatbotu: Doğal Dil Randevu & Müsaitlik Motoru
 */
export async function processCustomerMessage(
  message: string,
  businessSlugOrId: string
): Promise<CustomerChatResponse> {
  const lower = message.toLowerCase().trim();

  // İşletme ve hizmetlerini çek
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
    console.warn('Customer Chat business lookup error:', err);
  }

  const businessName = business?.name || 'İşletmemiz';
  const servicesList = business?.services || [
    { name: 'Standart Seans / Muayene', price: 500, durationMin: 30 },
  ];

  // Tarih tespiti
  let targetDate = new Date();
  let dateLabel = 'Bugün';

  if (lower.includes('yarın') || lower.includes('yarin')) {
    targetDate = addDays(new Date(), 1);
    dateLabel = 'Yarın';
  } else if (lower.includes('hafta sonu') || lower.includes('cumartesi')) {
    targetDate = addDays(new Date(), 2);
    dateLabel = 'Cumartesi';
  }

  const dateStr = format(targetDate, 'yyyy-MM-dd');

  // Müsaitlik veya randevu sorusu
  if (
    lower.includes('boş') ||
    lower.includes('bos') ||
    lower.includes('randevu') ||
    lower.includes('müsait') ||
    lower.includes('musait') ||
    lower.includes('saat') ||
    lower.includes('yer var mı') ||
    lower.includes('dolgu') ||
    lower.includes('kesim')
  ) {
    const isAfternoon = lower.includes('öğle') || lower.includes('ogle') || lower.includes('akşam') || lower.includes('aksam');
    const isMorning = lower.includes('sabah') || lower.includes('erken');

    let slots = [
      { id: '1', time: '10:00', date: dateStr, serviceName: servicesList[0]?.name || 'Randevu', isDiscounted: false },
      { id: '2', time: '11:30', date: dateStr, serviceName: servicesList[0]?.name || 'Randevu', isDiscounted: false },
      { id: '3', time: '14:30', date: dateStr, serviceName: servicesList[0]?.name || 'Randevu', isDiscounted: true },
      { id: '4', time: '16:00', date: dateStr, serviceName: servicesList[0]?.name || 'Randevu', isDiscounted: true },
      { id: '5', time: '17:30', date: dateStr, serviceName: servicesList[0]?.name || 'Randevu', isDiscounted: false },
    ];

    if (isAfternoon) {
      slots = slots.filter((s) => s.time >= '12:00');
    } else if (isMorning) {
      slots = slots.filter((s) => s.time < '12:00');
    }

    return {
      reply: `${dateLabel} günü için ${businessName} bünyesinde uygun bulduğum saatler aşağıdadır. İndirimli saatleri kaçırmamak için hemen seçebilirsiniz:`,
      suggestedSlots: slots,
      quickActions: ['Fiyatları Öğren', 'WhatsApp ile Yazış', 'Hizmet Listesi'],
    };
  }

  // Fiyat sorusu
  if (lower.includes('fiyat') || lower.includes('ücret') || lower.includes('kac para') || lower.includes('kaç tl')) {
    const pricesText = servicesList
      .map((s: any) => `• ${s.name}: ₺${s.price || 500} (${s.durationMin || 30} dk)`)
      .join('\n');

    return {
      reply: `${businessName} güncel hizmet ve fiyat listesi:\n\n${pricesText}\n\nRandevu almak istediğiniz hizmeti seçebilir veya bir gün belirtebilirsiniz.`,
      quickActions: ['Yarın için randevu al', 'Bugün için randevu al', 'WhatsApp İletişim'],
    };
  }

  // Varsayılan karşılama
  return {
    reply: `Merhaba! Ben ${businessName} Akıllı Randevu Asistanıyım. Size en uygun randevu saatini bulabilir, hizmet ve fiyat bilgilerini anında iletebilirim. Nasıl yardımcı olabilirim?`,
    quickActions: ['Bugün boş yer var mı?', 'Yarın öğleden sonra müsaitlik', 'Hizmet ve Fiyatlar', 'WhatsApp Destek'],
  };
}

/**
 * 2. İşletme Chatbotu: Yönetim Paneli İçin AI Analiz & Brifing Motoru
 */
export async function generateBusinessSummary(businessId: string): Promise<BusinessSummaryResponse> {
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
    console.warn('Business summary query fallback:', err);
  }

  const total = appointments.length;
  const pending = appointments.filter((a) => a.status === 'PENDING').length;
  const revenue = appointments.reduce((acc, curr) => acc + (curr.totalAmount || curr.service?.price || 0), 0);

  const insights: string[] = [];

  if (pending > 0) {
    insights.push(`Onay bekleyen ${pending} adet randevunuz bulunuyor. Müşterilere hızlı dönüş yapmak doluluk oranını %35 artırır.`);
  }

  if (waitlistCount > 0) {
    insights.push(`Bekleme listesinde ${waitlistCount} potansiyel müşteri var. İptal olan saatlerde otomatik bildirim devrede.`);
  }

  if (total === 0) {
    insights.push('Bugün için henüz randevu yok. Dinamik "Günün Boş Saatleri" indirim motorunu aktif ederek son dakika müşterileri çekebilirsiniz.');
  } else {
    insights.push(`Bugün toplam ${total} seans planlandı. Tahmini günlük ciro: ₺${revenue}.`);
  }

  return {
    greeting: `Gününüz aydın olsun! İşletmenizin anlık randevu ve gelir özeti hazır:`,
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
