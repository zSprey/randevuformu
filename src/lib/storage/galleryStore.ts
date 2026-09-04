import { supabase } from "@/lib/supabase";

const EDGE_CONFIG_ID = process.env.EDGE_CONFIG_ID || "";
const VERCEL_TOKEN = process.env.VERCEL_BEARER_TOKEN || "";
const EDGE_CONFIG_READ_URL = process.env.EDGE_CONFIG || "";

export interface GalleryPhoto {
  id: string;
  url: string; // Cloud URL or optimized Base64 data URI
  title: string;
  subtitle?: string;
  isFeatured?: boolean;
  source?: "business_upload" | "google_maps";
  createdAt?: string;
}

// In-memory persistent cache per tenant
const galleryMemoryCache = new Map<string, GalleryPhoto[]>();

/**
 * 1. GET GALLERY PHOTOS FOR A TENANT (CLOUD PERSISTENCE)
 * Checks Edge Config (Global Read), Supabase, and in-memory cache.
 * NO FAKE STOCK PHOTOS — returns real uploaded photos only.
 */
export async function getStoredGallery(tenant: string = "byerman"): Promise<GalleryPhoto[]> {
  const cleanTenant = (tenant || "byerman").trim().toLowerCase();
  const storageKey = `${cleanTenant}_gallery`;

  let photos: GalleryPhoto[] = [];

  // A. Try Edge Config (Instant Global Read across all servers)
  if (EDGE_CONFIG_READ_URL) {
    try {
      const res = await fetch(`${EDGE_CONFIG_READ_URL}`, {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        const list = data?.items?.[storageKey] || data?.[storageKey];
        if (Array.isArray(list) && list.length > 0) {
          photos = list;
          galleryMemoryCache.set(cleanTenant, photos);
          return photos;
        }
      }
    } catch (e) {
      console.warn("[GalleryStore] EdgeConfig Read error:", e);
    }
  }

  // B. Try Supabase
  try {
    const { data, error } = await supabase
      .from("business_galleries")
      .select("*")
      .eq("tenant", cleanTenant)
      .order("created_at", { ascending: false });

    if (!error && Array.isArray(data) && data.length > 0) {
      photos = data.map((d: any) => ({
        id: d.id,
        url: d.url,
        title: d.title || "Salon Fotoğrafı",
        subtitle: d.subtitle || "",
        isFeatured: Boolean(d.is_featured),
        source: d.source || "business_upload",
        createdAt: d.created_at,
      }));
      galleryMemoryCache.set(cleanTenant, photos);
      return photos;
    }
  } catch {
    // Supabase fallback gracefully
  }

  // C. Fallback to in-memory cache if available
  const cached = galleryMemoryCache.get(cleanTenant);
  if (cached && cached.length > 0) {
    return cached;
  }

  return [];
}

/**
 * 2. SAVE ALL GALLERY PHOTOS (GLOBAL CLOUD WRITE)
 * Upserts to Edge Config & Supabase so all visitors across the internet see them.
 */
export async function saveGalleryPhotos(
  tenant: string = "byerman",
  photos: GalleryPhoto[]
): Promise<boolean> {
  const cleanTenant = (tenant || "byerman").trim().toLowerCase();
  const storageKey = `${cleanTenant}_gallery`;

  // Always update in-memory cache immediately
  galleryMemoryCache.set(cleanTenant, photos);

  let success = true;

  // A. Write to Edge Config for instant global distribution
  if (EDGE_CONFIG_ID && VERCEL_TOKEN) {
    try {
      const patchRes = await fetch(
        `https://api.vercel.com/v1/edge-config/${EDGE_CONFIG_ID}/items`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${VERCEL_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            items: [
              {
                operation: "upsert",
                key: storageKey,
                value: photos,
              },
            ],
          }),
        }
      );

      if (!patchRes.ok) {
        console.warn("[GalleryStore] EdgeConfig Write returned:", patchRes.status);
      }
    } catch (err) {
      console.warn("[GalleryStore] EdgeConfig Write exception:", err);
      success = false;
    }
  }

  // B. Write to Supabase table
  try {
    // Delete existing tenant photos and re-insert
    await supabase.from("business_galleries").delete().eq("tenant", cleanTenant);
    if (photos.length > 0) {
      const dbRows = photos.map((p) => ({
        id: p.id,
        tenant: cleanTenant,
        url: p.url,
        title: p.title,
        subtitle: p.subtitle || "",
        is_featured: Boolean(p.isFeatured),
        source: p.source || "business_upload",
        created_at: p.createdAt || new Date().toISOString(),
      }));
      await supabase.from("business_galleries").insert(dbRows);
    }
  } catch (dbErr) {
    console.warn("[GalleryStore] Supabase Write exception:", dbErr);
  }

  return success;
}

/**
 * 3. ADD A SINGLE PHOTO TO GALLERY
 */
export async function addGalleryPhoto(
  tenant: string = "byerman",
  photoData: Omit<GalleryPhoto, "id" | "createdAt">
): Promise<GalleryPhoto> {
  const current = await getStoredGallery(tenant);
  const newPhoto: GalleryPhoto = {
    ...photoData,
    id: `photo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    createdAt: new Date().toISOString(),
  };

  const updated = [newPhoto, ...current];
  await saveGalleryPhotos(tenant, updated);
  return newPhoto;
}

/**
 * 4. DELETE A PHOTO FROM GALLERY
 */
export async function deleteGalleryPhoto(
  tenant: string = "byerman",
  photoId: string
): Promise<boolean> {
  const current = await getStoredGallery(tenant);
  const updated = current.filter((p) => p.id !== photoId);
  return await saveGalleryPhotos(tenant, updated);
}
