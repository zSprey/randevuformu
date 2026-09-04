import { supabase } from "@/lib/supabase";

const EDGE_CONFIG_ID = process.env.EDGE_CONFIG_ID || "";
const VERCEL_TOKEN = process.env.VERCEL_BEARER_TOKEN || "";
const EDGE_CONFIG_READ_URL = process.env.EDGE_CONFIG || "";

export interface StoredBusinessService {
  id: string;
  name: string;
  duration_minutes: number;
  price?: number;
  price_text?: string;
  description?: string;
  is_extra?: boolean; // true = Ekstra / Yan Hizmet (Add-on), false = Ana Hizmet
  category?: string;
  created_at?: string;
}

// Memory cache per tenant
const servicesMemoryCache = new Map<string, StoredBusinessService[]>();

export const DEFAULT_BYERMAN_SERVICES: StoredBusinessService[] = [
  // Ana Hizmetler
  {
    id: "srv-sac",
    name: "Saç Kesimi & Yıkama & Fön",
    duration_minutes: 35,
    price: 350,
    price_text: "₺350",
    description: "Kişinin yüz tipine uygun saç kesimi, saç yıkama ve fön işlemi.",
    is_extra: false,
    category: "Ana Hizmet",
  },
  {
    id: "srv-sakal",
    name: "Sakal Tıraşı & Sıcak Havlu",
    duration_minutes: 25,
    price: 200,
    price_text: "₺200",
    description: "Geleneksel ustura tıraşı, sakal şekillendirme ve buharlı sıcak havlu.",
    is_extra: false,
    category: "Ana Hizmet",
  },
  {
    id: "srv-komple",
    name: "Saç + Sakal (Komple Tıraş & Bakım)",
    duration_minutes: 55,
    price: 500,
    price_text: "₺500",
    description: "Komple saç kesimi, sakal tıraşı, saç yıkama, fön ve şekillendirme.",
    is_extra: false,
    category: "Ana Hizmet",
  },
  {
    id: "srv-cocuk",
    name: "Çocuk Saç Kesimi",
    duration_minutes: 30,
    price: 250,
    price_text: "₺250",
    description: "12 yaş altı çocuklar için özenli ve sabırlı saç tıraşı.",
    is_extra: false,
    category: "Ana Hizmet",
  },
  {
    id: "srv-bakim",
    name: "VIP Saç Bakımı & Cilt Maskesi",
    duration_minutes: 35,
    description: "Özel tonik bakımı, baş masajı ve canlandırıcı maske.",
    is_extra: false,
    category: "Ana Hizmet",
  },
  // Ekstra / Yan Hizmetler (Erman'ın isteğine göre seçilebilen ekstralar)
  {
    id: "srv-extra-maske",
    name: "Canlandırıcı Cilt Bakım Maskesi",
    duration_minutes: 15,
    price: 100,
    price_text: "₺100",
    description: "Doğal mineralli kil ve gözenek arındırıcı yüz maskesi.",
    is_extra: true,
    category: "Ekstra Hizmet",
  },
  {
    id: "srv-extra-agda",
    name: "Kulak & Burun Ağda / İp Temizliği",
    duration_minutes: 10,
    price: 70,
    price_text: "₺70",
    description: "Detaylı kulak, burun ve elmacık kemiği tüy temizliği.",
    is_extra: true,
    category: "Ekstra Hizmet",
  },
  {
    id: "srv-extra-serum",
    name: "Saç Bakım Serumu & Masaj",
    duration_minutes: 15,
    price: 120,
    price_text: "₺120",
    description: "Özel keratin serumu ve rahatlatıcı saç derisi masajı.",
    is_extra: true,
    category: "Ekstra Hizmet",
  },
  {
    id: "srv-extra-havlu",
    name: "Buharlı Sıcak Havlu Ekstra Bakımı",
    duration_minutes: 10,
    price: 60,
    price_text: "₺60",
    description: "Okaliptüs esanslı buhar ve rahatlatıcı sıcak havlu kompresi.",
    is_extra: true,
    category: "Ekstra Hizmet",
  },
  {
    id: "srv-extra-boya",
    name: "Sakal Boyama & Beyaz Kamuflaj",
    duration_minutes: 20,
    price: 150,
    price_text: "₺150",
    description: "Doğal tonlarda sakal beyazlarını kapatma ve renk eşitleme.",
    is_extra: true,
    category: "Ekstra Hizmet",
  },
];

/**
 * 1. GET SERVICES FOR A TENANT
 */
export async function getStoredServices(tenant: string = "byerman"): Promise<StoredBusinessService[]> {
  const cleanTenant = (tenant || "byerman").trim().toLowerCase();
  const storageKey = `${cleanTenant}_services`;

  // A. Try Memory Cache
  if (servicesMemoryCache.has(cleanTenant)) {
    const cached = servicesMemoryCache.get(cleanTenant);
    if (cached && cached.length > 0) return cached;
  }

  // B. Try Edge Config
  if (EDGE_CONFIG_READ_URL) {
    try {
      const res = await fetch(`${EDGE_CONFIG_READ_URL}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        const list = data?.items?.[storageKey] || data?.[storageKey];
        if (Array.isArray(list) && list.length > 0) {
          servicesMemoryCache.set(cleanTenant, list);
          return list;
        }
      }
    } catch (e) {
      console.warn("[ServicesStore] EdgeConfig Read error:", e);
    }
  }

  // C. Try Supabase
  try {
    const { data, error } = await supabase
      .from("business_services")
      .select("*")
      .eq("tenant", cleanTenant)
      .order("created_at", { ascending: true });

    if (!error && Array.isArray(data) && data.length > 0) {
      const services = data.map((d: any) => ({
        id: d.id,
        name: d.name,
        duration_minutes: d.duration_minutes || d.durationMinutes || 30,
        price: d.price ? Number(d.price) : undefined,
        price_text: d.price ? `₺${Number(d.price).toLocaleString("tr-TR")}` : undefined,
        description: d.description || "",
        is_extra: Boolean(d.is_extra),
        category: d.category || (d.is_extra ? "Ekstra Hizmet" : "Ana Hizmet"),
        created_at: d.created_at,
      }));
      servicesMemoryCache.set(cleanTenant, services);
      return services;
    }
  } catch (err) {
    console.warn("[ServicesStore] Supabase query error:", err);
  }

  // D. Fallback default
  const defaults = DEFAULT_BYERMAN_SERVICES;
  servicesMemoryCache.set(cleanTenant, defaults);
  return defaults;
}

/**
 * 2. SAVE SERVICES LIST
 */
export async function saveStoredServices(
  tenant: string = "byerman",
  services: StoredBusinessService[]
): Promise<boolean> {
  const cleanTenant = (tenant || "byerman").trim().toLowerCase();
  const storageKey = `${cleanTenant}_services`;

  // Update memory cache
  servicesMemoryCache.set(cleanTenant, services);

  // A. Save to Edge Config
  if (EDGE_CONFIG_ID && VERCEL_TOKEN) {
    try {
      await fetch(`https://api.vercel.com/v1/edge-config/${EDGE_CONFIG_ID}/items`, {
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
              value: services,
            },
          ],
        }),
      });
    } catch (e) {
      console.warn("[ServicesStore] EdgeConfig write error:", e);
    }
  }

  // B. Save to Supabase
  try {
    await supabase.from("business_services").delete().eq("tenant", cleanTenant);
    
    const rows = services.map((s) => ({
      id: s.id,
      tenant: cleanTenant,
      name: s.name,
      duration_minutes: s.duration_minutes,
      price: s.price || null,
      description: s.description || null,
      is_extra: Boolean(s.is_extra),
      category: s.category || (s.is_extra ? "Ekstra Hizmet" : "Ana Hizmet"),
    }));

    await supabase.from("business_services").insert(rows);
  } catch (err) {
    console.warn("[ServicesStore] Supabase write error:", err);
  }

  return true;
}
