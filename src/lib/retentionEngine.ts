export interface RecallRule {
  id: string;
  name: string;
  category: string;
  intervalDays: number;
  messageTemplate: string;
  discountPercentage?: number;
  isActive: boolean;
}

export interface PendingRecall {
  id: string;
  clientName: string;
  clientPhone: string;
  lastVisitDate: string;
  daysPassed: number;
  ruleName: string;
  suggestedService: string;
  bookingUrl: string;
  status: "PENDING" | "SENT" | "CONVERTED";
}

export const INITIAL_RECALL_RULES: RecallRule[] = [
  {
    id: "rec-1",
    name: "6 Aylık Rutin Diş Kontrolü & Temizlik",
    category: "Diş Hekimliği",
    intervalDays: 180,
    messageTemplate: "Merhaba Sayın {CLIENT_NAME}, Dr. Ahmet Yılmaz kliniğindeki son muayenenizin üzerinden 6 ay geçti. Sağlıklı bir gülüş için rutin kontrol randevunuzu buradan tek tıkla oluşturabilirsiniz: {BOOKING_URL}",
    isActive: true,
  },
  {
    id: "rec-2",
    name: "3 Haftalık Saç Boyama & Dip Bakımı",
    category: "Güzellik & Kuaför",
    intervalDays: 21,
    messageTemplate: "Merhaba {CLIENT_NAME}! Saç renginizi tazelemek ve parlaklığını korumak için dip boya zamanınız geldi. %10 sadakat indiriminizle randevu alın: {BOOKING_URL}",
    discountPercentage: 10,
    isActive: true,
  },
  {
    id: "rec-3",
    name: "30 Günlük Diyetisyen Kontrol Seansı",
    category: "Beslenme & Diyet",
    intervalDays: 30,
    messageTemplate: "Merhaba {CLIENT_NAME}, 1 aylık beslenme programınızın ardından kilo ve vücut analizi kontrol seansınızı planlayalım: {BOOKING_URL}",
    isActive: true,
  },
];

export const INITIAL_PENDING_RECALLS: PendingRecall[] = [
  {
    id: "pr-1",
    clientName: "Ayşe Nur Şahin",
    clientPhone: "0555 333 44 55",
    lastVisitDate: "2026-02-28",
    daysPassed: 182,
    ruleName: "6 Aylık Rutin Diş Kontrolü & Temizlik",
    suggestedService: "Diş Taşı Temizliği & Florür",
    bookingUrl: "https://randevuformu.com/dr-ahmet?ref=recall_180d",
    status: "PENDING",
  },
  {
    id: "pr-2",
    clientName: "Canan Yılmaz",
    clientPhone: "0533 999 88 77",
    lastVisitDate: "2026-08-07",
    daysPassed: 21,
    ruleName: "3 Haftalık Saç Boyama & Dip Bakımı",
    suggestedService: "Dip Boya & Bakım",
    bookingUrl: "https://randevuformu.com/studio-nova?ref=recall_21d",
    status: "PENDING",
  },
  {
    id: "pr-3",
    clientName: "Murat Güven",
    clientPhone: "0542 555 66 77",
    lastVisitDate: "2026-07-28",
    daysPassed: 31,
    ruleName: "30 Günlük Diyetisyen Kontrol Seansı",
    suggestedService: "Vücut Analizi & Seans",
    bookingUrl: "https://randevuformu.com/dyt-ayse?ref=recall_30d",
    status: "PENDING",
  },
];
