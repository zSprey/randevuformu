import { supabase } from "@/lib/supabase";

const EDGE_CONFIG_ID = process.env.EDGE_CONFIG_ID || "";
const VERCEL_TOKEN = process.env.VERCEL_BEARER_TOKEN || "";
const EDGE_CONFIG_READ_URL = process.env.EDGE_CONFIG || "";

import crypto from "crypto";

export interface StoredAppointment {
  id: string;
  tenant?: string;
  tenant_id?: string;
  business_id?: string;
  customer_name: string;
  customer_phone: string;
  customer_note?: string;
  appointment_date: string;
  appointment_time: string;
  status: "confirmed" | "seated" | "completed" | "cancelled" | "pending" | "no-show";
  services?: { name: string; price_text?: string };
  staff_id?: string;
  staff_name?: string;
  created_at?: string;
}

// Memory cache per tenant for resilient fallback
const appointmentsMemoryCache = new Map<string, StoredAppointment[]>();

// 1. GET STORED APPOINTMENTS (STRICT MULTI-TENANT ISOLATION)
export async function getStoredAppointments(tenant?: string): Promise<StoredAppointment[]> {
  const cleanTenant = (tenant || "").trim().toLowerCase();
  
  // Güvenlik Kuralı: Eğer bir tenant belirtilmemişse, başka işletmelerin verisi sızmasın diye boş döner
  if (!cleanTenant) {
    return [];
  }

  const isErman = cleanTenant === "byerman";
  const storageKey = isErman ? "byerman_appointments" : `${cleanTenant}_appointments`;

  let edgeApps: StoredAppointment[] = [];

  // A. Try Edge Config (Instant Global Read)
  if (EDGE_CONFIG_READ_URL) {
    try {
      const res = await fetch(EDGE_CONFIG_READ_URL, {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        const list = data?.items?.[storageKey] || data?.[storageKey];
        if (Array.isArray(list)) {
          edgeApps = list.map((item) => ({
            ...item,
            tenant: item.tenant || cleanTenant,
            tenant_id: item.tenant_id || cleanTenant,
            staff_id: item.staff_id || undefined,
            staff_name: item.staff_name || undefined,
          }));
        }
      }
    } catch (e) {
      console.warn("[EdgeConfig] Read error:", e);
    }
  }

  // B. Try Supabase (Filtreli Veritabanı Sorgusu)
  let dbApps: StoredAppointment[] = [];
  try {
    let query = supabase
      .from("appointments")
      .select("*, services(name, price_text)")
      .order("appointment_date", { ascending: false });

    if (isErman) {
      query = query.or("tenant.eq.byerman,tenant_id.eq.byerman,business_id.eq.byerman");
    } else {
      query = query.or(`tenant.eq.${cleanTenant},tenant_id.eq.${cleanTenant},business_id.eq.${cleanTenant}`);
    }

    const { data } = await query;

    if (data && data.length > 0) {
      dbApps = data.map((d: any) => ({
        id: d.id,
        tenant: d.tenant || d.tenant_id || d.business_id || cleanTenant,
        tenant_id: d.tenant_id || d.tenant || d.business_id || cleanTenant,
        business_id: d.business_id,
        customer_name: d.customer_name,
        customer_phone: d.customer_phone,
        customer_note: d.customer_note || "",
        appointment_date: d.appointment_date,
        appointment_time: d.appointment_time,
        status: d.status || "confirmed",
        services: d.services || { name: d.customer_note || "Genel Randevu" },
        staff_id: d.staff_id || undefined,
        staff_name: d.staff_name || undefined,
        created_at: d.created_at,
      }));
    }
  } catch {
    // Graceful fallback
  }

  // Merge by id (Edge Config + DB + Memory Cache)
  const map = new Map<string, StoredAppointment>();
  const memList = appointmentsMemoryCache.get(cleanTenant) || [];
  for (const m of memList) {
    if (m && m.id) map.set(m.id, m);
  }
  for (const a of edgeApps) {
    if (a && a.id) map.set(a.id, a);
  }
  for (const a of dbApps) {
    if (a && a.id) map.set(a.id, a);
  }

  const merged = Array.from(map.values()).sort((a, b) => {
    const dateComp = (b.appointment_date || "").localeCompare(a.appointment_date || "");
    if (dateComp !== 0) return dateComp;
    return (a.appointment_time || "").localeCompare(b.appointment_time || "");
  });

  appointmentsMemoryCache.set(cleanTenant, merged);
  return merged;
}

// 2. SAVE NEW APPOINTMENT (ISOLATED BY TENANT)
export async function saveNewAppointment(app: StoredAppointment): Promise<boolean> {
  const tenantKey = (app.tenant || app.tenant_id || app.business_id || "byerman").toLowerCase();
  const storageKey = tenantKey === "byerman" ? "byerman_appointments" : `${tenantKey}_appointments`;

  // A. Read current for this tenant only
  const current = await getStoredAppointments(tenantKey);
  const updated = [
    {
      ...app,
      tenant: tenantKey,
      tenant_id: tenantKey,
      staff_id: app.staff_id,
      staff_name: app.staff_name,
    },
    ...current.filter((x) => x.id !== app.id),
  ];

  appointmentsMemoryCache.set(tenantKey, updated);

  // B. Write to Edge Config
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
        console.warn("[EdgeConfig] Write returned non-200:", patchRes.status);
      }
    } catch (err) {
      console.warn("[EdgeConfig] Write exception:", err);
    }
  }

  // C. Write to Supabase with tenant column
  try {
    await supabase.from("appointments").insert([
      {
        tenant: tenantKey,
        tenant_id: tenantKey,
        business_id: app.business_id || tenantKey,
        customer_name: app.customer_name,
        customer_phone: app.customer_phone,
        customer_note: app.customer_note || "",
        appointment_date: app.appointment_date,
        appointment_time: app.appointment_time,
        status: app.status,
        staff_id: app.staff_id || null,
        staff_name: app.staff_name || null,
      },
    ]);
  } catch {
    // Ignore RLS
  }

  return true;
}

// 3. UPDATE APPOINTMENT STATUS
export async function updateAppointmentStatus(
  id: string,
  newStatus: StoredAppointment["status"],
  tenant?: string
): Promise<boolean> {
  const tenantKey = (tenant || "byerman").toLowerCase();
  const storageKey = tenantKey === "byerman" ? "byerman_appointments" : `${tenantKey}_appointments`;

  const current = await getStoredAppointments(tenantKey);
  const updated = current.map((a) => (a.id === id ? { ...a, status: newStatus } : a));

  appointmentsMemoryCache.set(tenantKey, updated);

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
      console.warn("[EdgeConfig] Update status error:", e);
    }
  }

  try {
    await supabase.from("appointments").update({ status: newStatus }).eq("id", id);
  } catch {
    // Ignore
  }

  return true;
}

// 3B. UPDATE APPOINTMENT (GENERAL FIELDS)
export async function updateAppointment(
  id: string,
  updates: Partial<StoredAppointment>,
  tenant?: string
): Promise<boolean> {
  const tenantKey = (tenant || "byerman").toLowerCase();
  const storageKey = tenantKey === "byerman" ? "byerman_appointments" : `${tenantKey}_appointments`;

  const current = await getStoredAppointments(tenantKey);
  const updated = current.map((a) => (a.id === id ? { ...a, ...updates } : a));

  appointmentsMemoryCache.set(tenantKey, updated);

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
      console.warn("[EdgeConfig] Update appointment error:", e);
    }
  }

  try {
    const dbUpdatePayload: Record<string, any> = {};
    if (updates.status) dbUpdatePayload.status = updates.status;
    if (updates.staff_id !== undefined) dbUpdatePayload.staff_id = updates.staff_id;
    if (updates.staff_name !== undefined) dbUpdatePayload.staff_name = updates.staff_name;
    if (updates.appointment_date) dbUpdatePayload.appointment_date = updates.appointment_date;
    if (updates.appointment_time) dbUpdatePayload.appointment_time = updates.appointment_time;
    if (updates.customer_name) dbUpdatePayload.customer_name = updates.customer_name;
    if (updates.customer_phone) dbUpdatePayload.customer_phone = updates.customer_phone;
    if (updates.customer_note !== undefined) dbUpdatePayload.customer_note = updates.customer_note;

    if (Object.keys(dbUpdatePayload).length > 0) {
      await supabase.from("appointments").update(dbUpdatePayload).eq("id", id);
    }
  } catch {
    // Ignore
  }

  return true;
}

// 4. DELETE APPOINTMENT
export async function deleteAppointment(id: string, tenant?: string): Promise<boolean> {
  const tenantKey = (tenant || "byerman").toLowerCase();
  const storageKey = tenantKey === "byerman" ? "byerman_appointments" : `${tenantKey}_appointments`;

  const current = await getStoredAppointments(tenantKey);
  const updated = current.filter((a) => a.id !== id);

  appointmentsMemoryCache.set(tenantKey, updated);

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
      console.warn("[EdgeConfig] Delete error:", e);
    }
  }

  try {
    await supabase.from("appointments").delete().eq("id", id);
  } catch {
    // Ignore
  }

  return true;
}

// 5. GET APPOINTMENT BY ID
export async function getAppointmentById(
  id: string,
  tenant?: string
): Promise<StoredAppointment | null> {
  const tenantKey = (tenant || "byerman").toLowerCase();
  const list = await getStoredAppointments(tenantKey);
  const found = list.find((a) => a.id === id);
  if (found) return found;

  // Search without strict tenant if not found
  if (tenantKey !== "byerman") {
    const ermanList = await getStoredAppointments("byerman");
    const ermanFound = ermanList.find((a) => a.id === id);
    if (ermanFound) return ermanFound;
  }

  return null;
}

// 6. GENERATE & VERIFY SECURE APPOINTMENT TOKEN
const TOKEN_SECRET = process.env.NEXTAUTH_SECRET || "randevuformu_secure_token_secret_2026";

export function generateAppointmentToken(app: StoredAppointment): string {
  const raw = `${app.id}:${app.customer_phone || ""}:${app.appointment_date}:${TOKEN_SECRET}`;
  return crypto.createHash("sha256").update(raw).digest("hex").slice(0, 16);
}

export function verifyAppointmentToken(app: StoredAppointment, token: string): boolean {
  if (!token) return false;
  const expected = generateAppointmentToken(app);
  // Also accept last 4 digits of phone as secondary easy verification
  const phoneFallback = (app.customer_phone || "").replace(/\D/g, "").slice(-4);
  return token === expected || (token.length >= 4 && token === phoneFallback);
}

// 7. CLIENT ATTENDANCE & NO-SHOW RELIABILITY SCORE
export interface ClientReliability {
  total: number;
  completed: number;
  noShow: number;
  cancelled: number;
  score: number; // 0 - 100
  isRisky: boolean;
  badgeLabel: string;
  badgeColor: "emerald" | "amber" | "rose" | "slate";
}

export async function calculateClientReliability(
  phone: string,
  tenant?: string
): Promise<ClientReliability> {
  const cleanPhone = (phone || "").replace(/\D/g, "");
  if (!cleanPhone) {
    return {
      total: 0,
      completed: 0,
      noShow: 0,
      cancelled: 0,
      score: 100,
      isRisky: false,
      badgeLabel: "Yeni Müşteri",
      badgeColor: "slate",
    };
  }

  const tenantKey = (tenant || "byerman").toLowerCase();
  const allAppointments = await getStoredAppointments(tenantKey);

  const clientApps = allAppointments.filter((a) => {
    const aPhone = (a.customer_phone || "").replace(/\D/g, "");
    return aPhone.length >= 7 && (aPhone.endsWith(cleanPhone.slice(-7)) || cleanPhone.endsWith(aPhone.slice(-7)));
  });

  const total = clientApps.length;
  const completed = clientApps.filter((a) => a.status === "completed" || a.status === "seated").length;
  const noShow = clientApps.filter((a) => a.status === "no-show").length;
  const cancelled = clientApps.filter((a) => a.status === "cancelled").length;

  if (total === 0) {
    return {
      total: 0,
      completed: 0,
      noShow: 0,
      cancelled: 0,
      score: 100,
      isRisky: false,
      badgeLabel: "Yeni Müşteri",
      badgeColor: "slate",
    };
  }

  // Calculate score based on completed vs noShow
  const attendedCount = completed;
  const decisiveCount = completed + noShow;
  const score = decisiveCount > 0 ? Math.round((attendedCount / decisiveCount) * 100) : 100;
  const isRisky = noShow > 0 || (total >= 2 && score < 75);

  let badgeLabel = "⭐ %100 Güvenilir";
  let badgeColor: "emerald" | "amber" | "rose" | "slate" = "emerald";

  if (noShow > 0) {
    badgeLabel = `⚠️ ${noShow} Kez Gelmedi (%${score})`;
    badgeColor = score < 60 ? "rose" : "amber";
  } else if (completed >= 3) {
    badgeLabel = "💎 Sadık Müşteri";
    badgeColor = "emerald";
  } else if (completed >= 1) {
    badgeLabel = "✓ Doğrulanmış Müşteri";
    badgeColor = "emerald";
  }

  return {
    total,
    completed,
    noShow,
    cancelled,
    score,
    isRisky,
    badgeLabel,
    badgeColor,
  };
}

