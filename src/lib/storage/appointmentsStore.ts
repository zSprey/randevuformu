import { supabase } from "@/lib/supabase";

const EDGE_CONFIG_ID = process.env.EDGE_CONFIG_ID || "ecfg_kiwkhtkcczbjkryud908trzdlgc6";
const VERCEL_TOKEN = process.env.VERCEL_BEARER_TOKEN || "";
const EDGE_CONFIG_READ_URL = process.env.EDGE_CONFIG || "";

export interface StoredAppointment {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_note?: string;
  appointment_date: string;
  appointment_time: string;
  status: "confirmed" | "seated" | "completed" | "cancelled" | "pending";
  services?: { name: string; price_text?: string };
  created_at?: string;
}

// 1. GET ALL APPOINTMENTS
export async function getStoredAppointments(): Promise<StoredAppointment[]> {
  let edgeApps: StoredAppointment[] = [];

  // A. Try Edge Config (Instant Global Read)
  try {
    const res = await fetch(`${EDGE_CONFIG_READ_URL}`, {
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      const list = data?.items?.byerman_appointments || data?.byerman_appointments;
      if (Array.isArray(list)) {
        edgeApps = list;
      }
    }
  } catch (e) {
    console.warn("[EdgeConfig] Read error:", e);
  }

  // B. Try Supabase
  let dbApps: StoredAppointment[] = [];
  try {
    const { data } = await supabase
      .from("appointments")
      .select("*, services(name, price_text)")
      .order("appointment_date", { ascending: false });

    if (data && data.length > 0) {
      dbApps = data.map((d: any) => ({
        id: d.id,
        customer_name: d.customer_name,
        customer_phone: d.customer_phone,
        customer_note: d.customer_note || "",
        appointment_date: d.appointment_date,
        appointment_time: d.appointment_time,
        status: d.status || "confirmed",
        services: d.services || { name: d.customer_note || "Saç Kesimi & Yıkama" },
        created_at: d.created_at,
      }));
    }
  } catch {
    // Graceful
  }

  // Merge by id (Edge Config + DB)
  const map = new Map<string, StoredAppointment>();
  for (const a of edgeApps) {
    if (a && a.id) map.set(a.id, a);
  }
  for (const a of dbApps) {
    if (a && a.id) map.set(a.id, a);
  }

  return Array.from(map.values()).sort((a, b) => {
    const dateComp = (b.appointment_date || "").localeCompare(a.appointment_date || "");
    if (dateComp !== 0) return dateComp;
    return (a.appointment_time || "").localeCompare(b.appointment_time || "");
  });
}

// 2. SAVE NEW APPOINTMENT
export async function saveNewAppointment(app: StoredAppointment): Promise<boolean> {
  // A. Read current
  const current = await getStoredAppointments();
  const updated = [app, ...current.filter((x) => x.id !== app.id)];

  // B. Write to Edge Config
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
              key: "byerman_appointments",
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

  // C. Try Supabase as secondary
  try {
    await supabase.from("appointments").insert([
      {
        customer_name: app.customer_name,
        customer_phone: app.customer_phone,
        customer_note: app.customer_note || "",
        appointment_date: app.appointment_date,
        appointment_time: app.appointment_time,
        status: app.status,
      },
    ]);
  } catch {
    // Ignore RLS
  }

  return true;
}

// 3. UPDATE APPOINTMENT STATUS
export async function updateAppointmentStatus(id: string, newStatus: StoredAppointment["status"]): Promise<boolean> {
  const current = await getStoredAppointments();
  const updated = current.map((a) => (a.id === id ? { ...a, status: newStatus } : a));

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
            key: "byerman_appointments",
            value: updated,
          },
        ],
      }),
    });
  } catch (e) {
    console.warn("[EdgeConfig] Update status error:", e);
  }

  try {
    await supabase.from("appointments").update({ status: newStatus }).eq("id", id);
  } catch {
    // Ignore
  }

  return true;
}

// 4. DELETE APPOINTMENT
export async function deleteAppointment(id: string): Promise<boolean> {
  const current = await getStoredAppointments();
  const updated = current.filter((a) => a.id !== id);

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
            key: "byerman_appointments",
            value: updated,
          },
        ],
      }),
    });
  } catch (e) {
    console.warn("[EdgeConfig] Delete error:", e);
  }

  try {
    await supabase.from("appointments").delete().eq("id", id);
  } catch {
    // Ignore
  }

  return true;
}
