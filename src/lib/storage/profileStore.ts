// Business Profile & Location Cloud Store

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
};

const memoryProfileMap = new Map<string, BusinessProfile>([
  ["byerman", DEFAULT_BYERMAN_PROFILE],
]);

export async function getBusinessProfile(slug: string): Promise<BusinessProfile> {
  const current = memoryProfileMap.get(slug);
  if (current) return current;
  return {
    ...DEFAULT_BYERMAN_PROFILE,
    business_slug: slug,
  };
}

export async function saveBusinessProfile(
  slug: string,
  profile: Partial<BusinessProfile>
): Promise<BusinessProfile> {
  const existing = await getBusinessProfile(slug);
  const updated: BusinessProfile = {
    ...existing,
    ...profile,
    business_slug: slug,
  };
  memoryProfileMap.set(slug, updated);
  return updated;
}
