import { supabase } from "@/lib/supabase";

const EDGE_CONFIG_ID = process.env.EDGE_CONFIG_ID || "";
const VERCEL_TOKEN = process.env.VERCEL_BEARER_TOKEN || "";
const EDGE_CONFIG_READ_URL = process.env.EDGE_CONFIG || "";

export interface StoredWaitlistEntry {
  id: string;
  tenant_id: string;
  service_id?: string;
  service_name?: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  preferred_date: string; // "YYYY-MM-DD"
  time_range?: string;    // e.g. "14:00 - 18:00 arası"
  notes?: string;
  staff_id?: string;
  status: "WAITING" | "OFFERED" | "ACCEPTED" | "EXPIRED" | "CANCELLED";
  priority_score?: number;
  created_at: string;
  offered_at?: string;
}

// In-memory cache for fast local access
const waitlistMemoryCache = new Map<string, StoredWaitlistEntry[]>();

/**
 * 1. GET STORED WAITLIST (EDGE CONFIG + SUPABASE HYBRID)
 */
export async function getStoredWaitlist(tenant: string = "byerman"): Promise<StoredWaitlistEntry[]> {
  const cleanTenant = (tenant || "byerman").trim().toLowerCase();
  const isErman = cleanTenant === "byerman";
  const storageKey = isErman ? "byerman_waitlist" : `${cleanTenant}_waitlist`;

  let edgeEntries: StoredWaitlistEntry[] = [];

  // A. Try Edge Config (Global Read)
  if (EDGE_CONFIG_READ_URL) {
    try {
      const res = await fetch(`${EDGE_CONFIG_READ_URL}`, {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        const list = data?.items?.[storageKey] || data?.[storageKey];
        if (Array.isArray(list)) {
          edgeEntries = list.map((item) => ({
            ...item,
            tenant_id: item.tenant_id || cleanTenant,
          }));
        }
      }
    } catch (e) {
      console.warn("[WaitlistStore] EdgeConfig Read error:", e);
    }
  }

  // B. Try Supabase
  let dbEntries: StoredWaitlistEntry[] = [];
  try {
    let query = supabase
      .from("waitlist")
      .select("*")
      .order("created_at", { ascending: false });

    if (isErman) {
      query = query.or("tenant_id.eq.byerman,tenant_id.eq.byerman-id");
    } else {
      query = query.eq("tenant_id", cleanTenant);
    }

    const { data } = await query;
    if (data && Array.isArray(data)) {
      dbEntries = data.map((d: any) => ({
        id: d.id,
        tenant_id: d.tenant_id || cleanTenant,
        service_id: d.service_id || undefined,
        service_name: d.service_name || undefined,
        customer_name: d.customer_name,
        customer_phone: d.customer_phone,
        customer_email: d.customer_email || undefined,
        preferred_date: d.preferred_date,
        time_range: d.time_range || undefined,
        notes: d.notes || undefined,
        staff_id: d.staff_id || undefined,
        status: (d.status as StoredWaitlistEntry["status"]) || "WAITING",
        priority_score: d.priority_score !== undefined ? Number(d.priority_score) : 85,
        created_at: d.created_at || new Date().toISOString(),
        offered_at: d.offered_at || undefined,
      }));
    }
  } catch (err) {
    console.warn("[WaitlistStore] Supabase query error:", err);
  }

  // Merge by id (Edge Config + DB + Memory Cache)
  const map = new Map<string, StoredWaitlistEntry>();
  
  // In-memory fallback
  const memList = waitlistMemoryCache.get(cleanTenant) || [];
  for (const m of memList) {
    if (m && m.id) map.set(m.id, m);
  }

  for (const a of edgeEntries) {
    if (a && a.id) map.set(a.id, a);
  }
  for (const a of dbEntries) {
    if (a && a.id) map.set(a.id, a);
  }

  const merged = Array.from(map.values()).sort((a, b) => {
    // Sort by priority desc, then date/created_at
    const prioDiff = (b.priority_score || 0) - (a.priority_score || 0);
    if (prioDiff !== 0) return prioDiff;
    return (a.created_at || "").localeCompare(b.created_at || "");
  });

  waitlistMemoryCache.set(cleanTenant, merged);
  return merged;
}

/**
 * 2. SAVE NEW WAITLIST ENTRY
 */
export async function saveNewWaitlistEntry(entry: StoredWaitlistEntry): Promise<boolean> {
  const tenantKey = (entry.tenant_id || "byerman").trim().toLowerCase();
  const isErman = tenantKey === "byerman";
  const storageKey = isErman ? "byerman_waitlist" : `${tenantKey}_waitlist`;

  const current = await getStoredWaitlist(tenantKey);
  const updated = [
    {
      ...entry,
      tenant_id: tenantKey,
      status: entry.status || "WAITING",
      priority_score: entry.priority_score ?? 85,
      created_at: entry.created_at || new Date().toISOString(),
    },
    ...current.filter((x) => x.id !== entry.id),
  ];

  waitlistMemoryCache.set(tenantKey, updated);

  // A. Write to Edge Config
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
                value: updated,
              },
            ],
          }),
        }
      );

      if (!patchRes.ok) {
        console.warn("[WaitlistStore] EdgeConfig Write non-200:", patchRes.status);
      }
    } catch (err) {
      console.warn("[WaitlistStore] EdgeConfig Write error:", err);
    }
  }

  // B. Write to Supabase
  try {
    await supabase.from("waitlist").insert([
      {
        id: entry.id,
        tenant_id: tenantKey,
        service_id: entry.service_id || null,
        customer_name: entry.customer_name,
        customer_phone: entry.customer_phone,
        customer_email: entry.customer_email || null,
        preferred_date: entry.preferred_date,
        priority_score: entry.priority_score ?? 85,
        status: entry.status || "WAITING",
        created_at: entry.created_at || new Date().toISOString(),
        offered_at: entry.offered_at || null,
      },
    ]);
  } catch {
    // Ignore RLS
  }

  return true;
}

/**
 * 3. UPDATE WAITLIST STATUS
 */
export async function updateWaitlistStatus(
  id: string,
  newStatus: StoredWaitlistEntry["status"],
  tenant: string = "byerman"
): Promise<boolean> {
  const tenantKey = (tenant || "byerman").trim().toLowerCase();
  const storageKey = tenantKey === "byerman" ? "byerman_waitlist" : `${tenantKey}_waitlist`;

  const current = await getStoredWaitlist(tenantKey);
  const nowUtc = new Date().toISOString();

  const updated = current.map((item) => {
    if (item.id === id) {
      return {
        ...item,
        status: newStatus,
        offered_at: newStatus === "OFFERED" ? nowUtc : item.offered_at,
      };
    }
    return item;
  });

  waitlistMemoryCache.set(tenantKey, updated);

  // A. Edge Config
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
              value: updated,
            },
          ],
        }),
      });
    } catch (e) {
      console.warn("[WaitlistStore] EdgeConfig Update status error:", e);
    }
  }

  // B. Supabase
  try {
    const updatePayload: Record<string, any> = { status: newStatus };
    if (newStatus === "OFFERED") {
      updatePayload.offered_at = nowUtc;
    }
    await supabase.from("waitlist").update(updatePayload).eq("id", id);
  } catch {
    // Ignore
  }

  return true;
}

/**
 * 4. DELETE WAITLIST ENTRY
 */
export async function deleteWaitlistEntry(id: string, tenant: string = "byerman"): Promise<boolean> {
  const tenantKey = (tenant || "byerman").trim().toLowerCase();
  const storageKey = tenantKey === "byerman" ? "byerman_waitlist" : `${tenantKey}_waitlist`;

  const current = await getStoredWaitlist(tenantKey);
  const updated = current.filter((item) => item.id !== id);

  waitlistMemoryCache.set(tenantKey, updated);

  // A. Edge Config
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
              value: updated,
            },
          ],
        }),
      });
    } catch (e) {
      console.warn("[WaitlistStore] EdgeConfig Delete error:", e);
    }
  }

  // B. Supabase
  try {
    await supabase.from("waitlist").delete().eq("id", id);
  } catch {
    // Ignore
  }

  return true;
}
