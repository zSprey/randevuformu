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
  google_review_url: "https://share.google/VpkvdhoLKLSzWpHA6",
  rating_score: 4.9,
  review_count: 148,
  reviews_enabled: true,
};

// Sadece gerçek müşteriler yorum bıraktığında listelenir; sahte yorumlar tamamen kaldırılmıştır.
export const DEFAULT_BYERMAN_REVIEWS: CustomerReview[] = [];

const memorySettingsMap = new Map<string, BusinessReputationSettings>([
  ["byerman", DEFAULT_BYERMAN_REPUTATION],
]);

const memoryReviewsMap = new Map<string, CustomerReview[]>([
  ["byerman", DEFAULT_BYERMAN_REVIEWS],
]);

const memoryFeedbacksMap = new Map<string, PrivateFeedback[]>();

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
  if (reviews) return reviews;
  return [];
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
