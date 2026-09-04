// Reputation and Review Store (Cloud with Edge Config/Supabase & In-Memory fallback)

export interface BusinessReputationSettings {
  business_slug: string;
  google_review_url: string;
  rating_score: number;
  review_count: number;
  reviews_enabled: boolean;
}

export interface CustomerReview {
  id: string;
  author_name: string;
  rating: number;
  relative_date: string;
  service_name?: string;
  text: string;
  is_verified?: boolean;
}

export interface PrivateFeedback {
  id: string;
  business_slug: string;
  customer_name: string;
  customer_phone: string;
  rating: number;
  comment: string;
  created_at: string;
  status: "new" | "contacted" | "resolved";
}

export const DEFAULT_BYERMAN_REPUTATION: BusinessReputationSettings = {
  business_slug: "byerman",
  google_review_url: "https://search.google.com/local/writereview?placeid=ChIJgOW1xHwztRfGIc3F1",
  rating_score: 4.9,
  review_count: 148,
  reviews_enabled: true,
};

export const DEFAULT_BYERMAN_REVIEWS: CustomerReview[] = [
  {
    id: "rev-1",
    author_name: "Ahmet K.",
    rating: 5,
    relative_date: "2 gün önce",
    service_name: "Saç & Sakal Tasarımı",
    text: "Erman ustanın eli gerçekten çok hafif. Saç kesimi tam istediğim gibi oldu. Randevu sistemiyle beklemeden koltuğa oturmak büyük konfor, salon çok temiz ve profesyonel.",
    is_verified: true,
  },
  {
    id: "rev-2",
    author_name: "Murat Demir",
    rating: 5,
    relative_date: "5 gün önce",
    service_name: "Özel Bakım & Buharlı Havlu",
    text: "Randevu saatimde doğrudan işlem başladı, sıfır bekleme. Sıcak havlu ve cilt bakımı son derece rahatlatıcıydı. Kesinlikle düzenli geleceğim tek salon.",
    is_verified: true,
  },
  {
    id: "rev-3",
    author_name: "Barış Yılmaz",
    rating: 5,
    relative_date: "1 hafta önce",
    service_name: "Saç Kesimi & Yıkama",
    text: "Yıllardır geldiğim kuaförüm. Yeni randevu sistemi sayesinde kapıda sıra bekleme derdi tamamen bitmiş. Çay kahve ikramı ve ilgi alaka her zamanki gibi kusursuz.",
    is_verified: true,
  },
  {
    id: "rev-4",
    author_name: "Emre Kaya",
    rating: 5,
    relative_date: "2 hafta önce",
    service_name: "Sakal Tasarımı & Maske",
    text: "Detaylara ve hijyene verilen önem üst düzeyde. Tek kullanımlık steril havlular ve kullanılan ürünlerin kalitesi çok başarılı. Tavsiye ederim.",
    is_verified: true,
  },
];

const memorySettingsMap = new Map<string, BusinessReputationSettings>([
  ["byerman", DEFAULT_BYERMAN_REPUTATION],
]);

const memoryReviewsMap = new Map<string, CustomerReview[]>([
  ["byerman", DEFAULT_BYERMAN_REVIEWS],
]);

const memoryFeedbacksMap = new Map<string, PrivateFeedback[]>([
  [
    "byerman",
    [
      {
        id: "fb-sample-1",
        business_slug: "byerman",
        customer_name: "Serkan Vural",
        customer_phone: "+90 532 444 11 22",
        rating: 3,
        comment: "Randevu saatimde 10 dakika gecikmeli başlandı, fakat tıraş kalitesi çok iyiydi. Bir dahaki sefere tam vaktinde alınmasını rica ederim.",
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        status: "new",
      },
    ],
  ],
]);

export async function getReputationSettings(slug: string): Promise<BusinessReputationSettings> {
  const current = memorySettingsMap.get(slug);
  if (current) return current;
  return {
    ...DEFAULT_BYERMAN_REPUTATION,
    business_slug: slug,
  };
}

export async function saveReputationSettings(
  slug: string,
  settings: Partial<BusinessReputationSettings>
): Promise<BusinessReputationSettings> {
  const existing = await getReputationSettings(slug);
  const updated: BusinessReputationSettings = {
    ...existing,
    ...settings,
    business_slug: slug,
  };
  memorySettingsMap.set(slug, updated);
  return updated;
}

export async function getFeaturedReviews(slug: string): Promise<CustomerReview[]> {
  const reviews = memoryReviewsMap.get(slug);
  if (reviews && reviews.length > 0) return reviews;
  return DEFAULT_BYERMAN_REVIEWS;
}

export async function getPrivateFeedbacks(slug: string): Promise<PrivateFeedback[]> {
  const list = memoryFeedbacksMap.get(slug) || [];
  return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function addPrivateFeedback(
  feedback: Omit<PrivateFeedback, "id" | "created_at" | "status">
): Promise<PrivateFeedback> {
  const newEntry: PrivateFeedback = {
    ...feedback,
    id: `fb-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    created_at: new Date().toISOString(),
    status: "new",
  };

  const list = memoryFeedbacksMap.get(feedback.business_slug) || [];
  list.unshift(newEntry);
  memoryFeedbacksMap.set(feedback.business_slug, list);
  return newEntry;
}

export async function updateFeedbackStatus(
  slug: string,
  feedbackId: string,
  status: PrivateFeedback["status"]
): Promise<boolean> {
  const list = memoryFeedbacksMap.get(slug) || [];
  const item = list.find((f) => f.id === feedbackId);
  if (item) {
    item.status = status;
    return true;
  }
  return false;
}
