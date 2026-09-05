// Business Profile & Full Settings Cloud Store (Supabase + In-Memory Cache)
import { supabase } from "@/lib/supabase";

export interface BusinessProfile {
  business_slug: string;
  name: string;
  address: string;
  city: string;
  google_maps_url: string;
  phone: string;
  working_hours: string;
  rating_score: number;
  review_count: number;

  // Profil / Uzman Bilgileri
  owner_full_name?: string;
  owner_email?: string;
  owner_phone?: string;
  owner_title?: string;
  owner_bio?: string;

  // Müsaitlik & Çalışma Saatleri (Calendly Style)
  working_days?: Record<string, boolean>;
  work_start_time?: string;
  work_end_time?: string;
  break_start_time?: string;
  break_end_time?: string;
  slot_interval?: string;

  // Bildirim Tercihleri
  sms_enabled?: boolean;
  whatsapp_enabled?: boolean;
  email_enabled?: boolean;
  auto_confirm?: boolean;

  // Entegrasyon Durumları
  google_calendar_connected?: boolean;
  outlook_connected?: boolean;

  // İptal Politikası
  cancel_policy_hours?: string;

  // Salon Olanakları & İkramlar
  amenities?: string[];
}

export const DEFAULT_BYERMAN_PROFILE: BusinessProfile = {
  business_slug: "byerman",
  name: "By Erman - Erkek Berberi",
  address: "İstiklal Mah. Reşit Paşa Cad. No: 88, Ümraniye, İstanbul",
  city: "Ümraniye, İstanbul",
  google_maps_url: "https://share.google/VpkvdhoLKLSzWpHA6",
  phone: "0538 480 90 01",
  working_hours: "Pzt - Cuma: 09:30 - 21:30 | Cmt: 09:30 - 23:00 | Paz: Kapalı",
  rating_score: 4.9,
  review_count: 148,
  amenities: ["Çay & Kahve", "POS & Nakit", "Steril Havlu"],

  owner_full_name: "Erman Güler",
  owner_email: "",
  owner_phone: "0538 480 90 01",
  owner_title: "Master Barber",
  owner_bio: "",

  working_days: {
    mon: true,
    tue: true,
    wed: true,
    thu: true,
    fri: true,
    sat: true,
    sun: false,
  },
  work_start_time: "09:30",
  work_end_time: "21:30",
  break_start_time: "13:00",
  break_end_time: "14:00",
  slot_interval: "30",

  sms_enabled: true,
  whatsapp_enabled: true,
  email_enabled: true,
  auto_confirm: true,

  google_calendar_connected: false,
  outlook_connected: false,

  cancel_policy_hours: "24",
};

const memoryProfileMap = new Map<string, BusinessProfile>([
  ["byerman", DEFAULT_BYERMAN_PROFILE],
]);

/**
 * GET: Read profile from memory cache → Supabase → default fallback
 */
export async function getBusinessProfile(slug: string): Promise<BusinessProfile> {
  const cleanSlug = (slug || "byerman").trim().toLowerCase();

  // 1. Memory cache (fastest)
  const cached = memoryProfileMap.get(cleanSlug);
  if (cached && cached.name) return cached;

  // 2. Supabase persistent storage
  try {
    const { data, error } = await supabase
      .from("business_profiles")
      .select("*")
      .eq("business_slug", cleanSlug)
      .single();

    if (!error && data) {
      const profile = mapSupabaseRowToProfile(data);
      memoryProfileMap.set(cleanSlug, profile);
      return profile;
    }
  } catch (err) {
    console.warn("[ProfileStore] Supabase read error:", err);
  }

  // 3. Default fallback
  if (cleanSlug === "byerman") return DEFAULT_BYERMAN_PROFILE;
  return {
    ...DEFAULT_BYERMAN_PROFILE,
    business_slug: cleanSlug,
    name: "",
    address: "",
    owner_full_name: "",
  };
}

/**
 * SAVE: Write to memory cache + Supabase upsert
 */
export async function saveBusinessProfile(
  slug: string,
  profile: Partial<BusinessProfile>
): Promise<BusinessProfile> {
  const cleanSlug = (slug || "byerman").trim().toLowerCase();
  const existing = await getBusinessProfile(cleanSlug);

  // Merge with existing, keeping all fields
  const updated: BusinessProfile = {
    ...existing,
    ...stripUndefined(profile),
    business_slug: cleanSlug,
  };

  // 1. Update memory cache immediately
  memoryProfileMap.set(cleanSlug, updated);

  // 2. Persist to Supabase (non-blocking for UX)
  try {
    const row = mapProfileToSupabaseRow(updated);
    await supabase
      .from("business_profiles")
      .upsert(row, { onConflict: "business_slug" });
  } catch (err) {
    console.warn("[ProfileStore] Supabase write error:", err);
  }

  return updated;
}

// --- Helper: Map Supabase row → BusinessProfile ---
function mapSupabaseRowToProfile(data: any): BusinessProfile {
  return {
    business_slug: data.business_slug || "byerman",
    name: data.name || "",
    address: data.address || "",
    city: data.city || "",
    google_maps_url: data.google_maps_url || "",
    phone: data.phone || "",
    working_hours: data.working_hours || "",
    rating_score: data.rating_score != null ? Number(data.rating_score) : 4.9,
    review_count: data.review_count != null ? Number(data.review_count) : 0,

    owner_full_name: data.owner_full_name || "",
    owner_email: data.owner_email || "",
    owner_phone: data.owner_phone || "",
    owner_title: data.owner_title || "",
    owner_bio: data.owner_bio || "",

    working_days: typeof data.working_days === "object" ? data.working_days : DEFAULT_BYERMAN_PROFILE.working_days,
    work_start_time: data.work_start_time || "09:00",
    work_end_time: data.work_end_time || "19:00",
    break_start_time: data.break_start_time || "12:30",
    break_end_time: data.break_end_time || "13:30",
    slot_interval: data.slot_interval || "30",

    sms_enabled: data.sms_enabled != null ? Boolean(data.sms_enabled) : true,
    whatsapp_enabled: data.whatsapp_enabled != null ? Boolean(data.whatsapp_enabled) : true,
    email_enabled: data.email_enabled != null ? Boolean(data.email_enabled) : true,
    auto_confirm: data.auto_confirm != null ? Boolean(data.auto_confirm) : true,

    google_calendar_connected: Boolean(data.google_calendar_connected),
    outlook_connected: Boolean(data.outlook_connected),

    cancel_policy_hours: data.cancel_policy_hours || "24",
    amenities: Array.isArray(data.amenities)
      ? data.amenities.filter((a: string) => !a.toLowerCase().includes("wifi") && !a.toLowerCase().includes("wi-fi"))
      : DEFAULT_BYERMAN_PROFILE.amenities,
  };
}

// --- Helper: Map BusinessProfile → Supabase row ---
function mapProfileToSupabaseRow(p: BusinessProfile): Record<string, any> {
  return {
    business_slug: p.business_slug,
    name: p.name,
    address: p.address,
    city: p.city,
    google_maps_url: p.google_maps_url,
    phone: p.phone,
    working_hours: p.working_hours,
    rating_score: p.rating_score,
    review_count: p.review_count,
    amenities: p.amenities || DEFAULT_BYERMAN_PROFILE.amenities,

    owner_full_name: p.owner_full_name || null,
    owner_email: p.owner_email || null,
    owner_phone: p.owner_phone || null,
    owner_title: p.owner_title || null,
    owner_bio: p.owner_bio || null,

    working_days: p.working_days || null,
    work_start_time: p.work_start_time || null,
    work_end_time: p.work_end_time || null,
    break_start_time: p.break_start_time || null,
    break_end_time: p.break_end_time || null,
    slot_interval: p.slot_interval || null,

    sms_enabled: p.sms_enabled ?? true,
    whatsapp_enabled: p.whatsapp_enabled ?? true,
    email_enabled: p.email_enabled ?? true,
    auto_confirm: p.auto_confirm ?? true,

    google_calendar_connected: p.google_calendar_connected ?? false,
    outlook_connected: p.outlook_connected ?? false,

    cancel_policy_hours: p.cancel_policy_hours || "24",
  };
}

// --- Helper: Remove undefined keys from partial ---
function stripUndefined(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      result[key] = value;
    }
  }
  return result;
}
