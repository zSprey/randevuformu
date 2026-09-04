// Reputation and Review Store (Supabase Persistent + In-Memory Cache)
import { supabase } from "@/lib/supabase";

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

// --- REPUTATION SETTINGS ---

export async function getReputationSettings(slug: string): Promise<BusinessReputationSettings> {
  const cleanSlug = (slug || "byerman").trim().toLowerCase();

  // 1. Memory cache
  const cached = memorySettingsMap.get(cleanSlug);
  if (cached) return cached;

  // 2. Supabase
  try {
    const { data, error } = await supabase
      .from("business_reputation")
      .select("*")
      .eq("business_slug", cleanSlug)
      .single();

    if (!error && data) {
      const settings: BusinessReputationSettings = {
        business_slug: data.business_slug,
        google_review_url: data.google_review_url || "",
        rating_score: Number(data.rating_score) || 4.9,
        review_count: Number(data.review_count) || 0,
        reviews_enabled: data.reviews_enabled != null ? Boolean(data.reviews_enabled) : true,
      };
      memorySettingsMap.set(cleanSlug, settings);
      return settings;
    }
  } catch (err) {
    console.warn("[ReputationStore] Supabase read error:", err);
  }

  // 3. Default
  return {
    ...DEFAULT_BYERMAN_REPUTATION,
    business_slug: cleanSlug,
  };
}

export async function saveReputationSettings(
  slug: string,
  settings: Partial<BusinessReputationSettings>
): Promise<BusinessReputationSettings> {
  const cleanSlug = (slug || "byerman").trim().toLowerCase();
  const existing = await getReputationSettings(cleanSlug);
  const updated: BusinessReputationSettings = {
    ...existing,
    ...settings,
    business_slug: cleanSlug,
  };

  // 1. Memory cache
  memorySettingsMap.set(cleanSlug, updated);

  // 2. Supabase upsert
  try {
    await supabase
      .from("business_reputation")
      .upsert({
        business_slug: cleanSlug,
        google_review_url: updated.google_review_url,
        rating_score: updated.rating_score,
        review_count: updated.review_count,
        reviews_enabled: updated.reviews_enabled,
      }, { onConflict: "business_slug" });
  } catch (err) {
    console.warn("[ReputationStore] Supabase write error:", err);
  }

  return updated;
}

// --- FEATURED REVIEWS ---

export async function getFeaturedReviews(slug: string): Promise<CustomerReview[]> {
  const cleanSlug = (slug || "byerman").trim().toLowerCase();

  // 1. Memory cache
  const cached = memoryReviewsMap.get(cleanSlug);
  if (cached && cached.length > 0) return cached;

  // 2. Supabase
  try {
    const { data, error } = await supabase
      .from("customer_reviews")
      .select("*")
      .eq("business_slug", cleanSlug)
      .order("created_at", { ascending: false });

    if (!error && Array.isArray(data) && data.length > 0) {
      const reviews: CustomerReview[] = data.map((d: any) => ({
        id: d.id,
        author_name: d.author_name || "",
        rating: Number(d.rating) || 5,
        relative_date: d.relative_date || "",
        service_name: d.service_name || undefined,
        text: d.text || "",
        is_verified: Boolean(d.is_verified),
      }));
      memoryReviewsMap.set(cleanSlug, reviews);
      return reviews;
    }
  } catch (err) {
    console.warn("[ReputationStore] Supabase reviews read error:", err);
  }

  return [];
}

// --- PRIVATE FEEDBACKS ---

export async function getPrivateFeedbacks(slug: string): Promise<PrivateFeedback[]> {
  const cleanSlug = (slug || "byerman").trim().toLowerCase();

  // 1. Memory cache
  const cached = memoryFeedbacksMap.get(cleanSlug);
  if (cached && cached.length > 0) {
    return cached.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  // 2. Supabase
  try {
    const { data, error } = await supabase
      .from("private_feedbacks")
      .select("*")
      .eq("business_slug", cleanSlug)
      .order("created_at", { ascending: false });

    if (!error && Array.isArray(data) && data.length > 0) {
      const feedbacks: PrivateFeedback[] = data.map((d: any) => ({
        id: d.id,
        business_slug: d.business_slug,
        customer_name: d.customer_name || "",
        customer_phone: d.customer_phone || "",
        rating: Number(d.rating) || 1,
        comment: d.comment || "",
        created_at: d.created_at || new Date().toISOString(),
        status: d.status || "new",
      }));
      memoryFeedbacksMap.set(cleanSlug, feedbacks);
      return feedbacks;
    }
  } catch (err) {
    console.warn("[ReputationStore] Supabase feedbacks read error:", err);
  }

  return [];
}

export async function addPrivateFeedback(
  feedback: Omit<PrivateFeedback, "id" | "created_at" | "status">
): Promise<PrivateFeedback> {
  const cleanSlug = (feedback.business_slug || "byerman").trim().toLowerCase();

  const newEntry: PrivateFeedback = {
    ...feedback,
    business_slug: cleanSlug,
    id: `fb-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    created_at: new Date().toISOString(),
    status: "new",
  };

  // 1. Memory cache
  const list = memoryFeedbacksMap.get(cleanSlug) || [];
  list.unshift(newEntry);
  memoryFeedbacksMap.set(cleanSlug, list);

  // 2. Supabase insert
  try {
    await supabase.from("private_feedbacks").insert({
      id: newEntry.id,
      business_slug: cleanSlug,
      customer_name: newEntry.customer_name,
      customer_phone: newEntry.customer_phone,
      rating: newEntry.rating,
      comment: newEntry.comment,
      created_at: newEntry.created_at,
      status: newEntry.status,
    });
  } catch (err) {
    console.warn("[ReputationStore] Supabase feedback insert error:", err);
  }

  return newEntry;
}

export async function updateFeedbackStatus(
  slug: string,
  feedbackId: string,
  status: PrivateFeedback["status"]
): Promise<boolean> {
  const cleanSlug = (slug || "byerman").trim().toLowerCase();

  // 1. Memory cache
  const list = memoryFeedbacksMap.get(cleanSlug) || [];
  const item = list.find((f) => f.id === feedbackId);
  if (item) {
    item.status = status;
  }

  // 2. Supabase update
  try {
    await supabase
      .from("private_feedbacks")
      .update({ status })
      .eq("id", feedbackId);
  } catch (err) {
    console.warn("[ReputationStore] Supabase feedback status update error:", err);
  }

  return true;
}
