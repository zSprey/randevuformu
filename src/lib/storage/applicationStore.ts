import { supabase } from "@/lib/supabase";

export interface BusinessApplication {
  id: string;
  user_id?: string;
  business_name: string;
  owner_name: string;
  email: string;
  phone: string;
  category: string;
  city?: string;
  district?: string;
  website?: string;
  location_url?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  rejection_reason?: string;
  created_at: string;
  approved_at?: string;
  reviewed_by?: string;
}

// In-memory application registry for instant SSR and fallback resilience
const applicationMemoryCache = new Map<string, BusinessApplication>();

// Seed some initial applications if cache is empty
const INITIAL_APPLICATIONS: BusinessApplication[] = [
  {
    id: "app-demo-1",
    business_name: "Aura Güzellik & Lazer Merkezi",
    owner_name: "Aylin Çelik",
    email: "aylin@auraguzellik.com",
    phone: "+905423334455",
    category: "Güzellik Merkezi & Lazer",
    city: "İstanbul",
    district: "Kadıköy",
    website: "https://auraguzellik.com",
    location_url: "https://maps.google.com/?q=Kadıköy",
    status: "PENDING",
    created_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
  },
  {
    id: "app-demo-2",
    business_name: "Dt. Mehmet Demir Diş Polikliniği",
    owner_name: "Dt. Mehmet Demir",
    email: "info@mehmetdemirdis.com",
    phone: "+905329998877",
    category: "Diş Hekimliği & Klinik",
    city: "Ankara",
    district: "Çankaya",
    website: "",
    location_url: "https://maps.google.com/?q=Çankaya",
    status: "PENDING",
    created_at: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
  },
  {
    id: "app-demo-3",
    business_name: "Makas & Sakal Berber Atölyesi",
    owner_name: "Barış Kurt",
    email: "baris@makasvesakal.com",
    phone: "+905351112233",
    category: "Berber & Erkek Kuaförü",
    city: "İzmir",
    district: "Bornova",
    website: "https://instagram.com/makasvesakal",
    location_url: "https://maps.google.com/?q=Bornova",
    status: "APPROVED",
    created_at: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    approved_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    reviewed_by: "musa",
  },
];

// Initialize cache
INITIAL_APPLICATIONS.forEach((app) => applicationMemoryCache.set(app.id, app));

/**
 * 1. CREATE APPLICATION
 */
export async function createBusinessApplication(
  data: Omit<BusinessApplication, "id" | "created_at" | "status">
): Promise<BusinessApplication> {
  const cleanEmail = data.email.trim().toLowerCase();
  const id = `app_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const newApp: BusinessApplication = {
    ...data,
    id,
    email: cleanEmail,
    business_name: data.business_name.trim(),
    owner_name: data.owner_name.trim(),
    phone: data.phone.trim(),
    category: data.category || "Genel Randevu Hizmeti",
    status: "PENDING",
    created_at: new Date().toISOString(),
  };

  // 1. Save to memory cache
  applicationMemoryCache.set(id, newApp);

  // 2. Try Supabase
  try {
    const { error } = await supabase.from("business_applications").insert({
      id: newApp.id,
      user_id: newApp.user_id || null,
      business_name: newApp.business_name,
      owner_name: newApp.owner_name,
      email: newApp.email,
      phone: newApp.phone,
      category: newApp.category,
      city: newApp.city || null,
      district: newApp.district || null,
      website: newApp.website || null,
      location_url: newApp.location_url || null,
      status: "PENDING",
      created_at: newApp.created_at,
    });
    if (error) {
      console.warn("[ApplicationStore] Supabase insert note:", error.message);
    }
  } catch (err) {
    console.warn("[ApplicationStore] Supabase save fallback to memory:", err);
  }

  return newApp;
}

/**
 * 2. GET ALL APPLICATIONS
 */
export async function getAllBusinessApplications(
  statusFilter?: "PENDING" | "APPROVED" | "REJECTED"
): Promise<BusinessApplication[]> {
  let list: BusinessApplication[] = [];

  // Try Supabase first
  try {
    let query = supabase.from("business_applications").select("*").order("created_at", { ascending: false });
    if (statusFilter) {
      query = query.eq("status", statusFilter);
    }
    const { data, error } = await query;
    if (!error && Array.isArray(data) && data.length > 0) {
      list = data.map((d: any) => ({
        id: d.id,
        user_id: d.user_id,
        business_name: d.business_name,
        owner_name: d.owner_name,
        email: d.email,
        phone: d.phone,
        category: d.category,
        city: d.city,
        district: d.district,
        website: d.website,
        location_url: d.location_url,
        status: d.status,
        rejection_reason: d.rejection_reason,
        created_at: d.created_at,
        approved_at: d.approved_at,
        reviewed_by: d.reviewed_by,
      }));

      // Update cache with fresh DB data
      list.forEach((app) => applicationMemoryCache.set(app.id, app));
      return list;
    }
  } catch (err) {
    console.warn("[ApplicationStore] Supabase fetch fallback to memory:", err);
  }

  // Fallback to memory cache
  const memoryList = Array.from(applicationMemoryCache.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  if (statusFilter) {
    return memoryList.filter((app) => app.status === statusFilter);
  }

  return memoryList;
}

/**
 * 3. GET APPLICATION BY EMAIL
 */
export async function getApplicationByEmail(
  email: string
): Promise<BusinessApplication | null> {
  const cleanEmail = email.trim().toLowerCase();

  // Try memory first
  for (const app of applicationMemoryCache.values()) {
    if (app.email.toLowerCase() === cleanEmail) {
      return app;
    }
  }

  // Try Supabase
  try {
    const { data, error } = await supabase
      .from("business_applications")
      .select("*")
      .ilike("email", cleanEmail)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!error && data) {
      const app: BusinessApplication = {
        id: data.id,
        user_id: data.user_id,
        business_name: data.business_name,
        owner_name: data.owner_name,
        email: data.email,
        phone: data.phone,
        category: data.category,
        city: data.city,
        district: data.district,
        website: data.website,
        location_url: data.location_url,
        status: data.status,
        rejection_reason: data.rejection_reason,
        created_at: data.created_at,
        approved_at: data.approved_at,
        reviewed_by: data.reviewed_by,
      };
      applicationMemoryCache.set(app.id, app);
      return app;
    }
  } catch (err) {
    console.warn("[ApplicationStore] getByEmail error:", err);
  }

  return null;
}

/**
 * 4. UPDATE APPLICATION STATUS (APPROVE / REJECT)
 */
export async function updateApplicationStatus(
  id: string,
  status: "APPROVED" | "REJECTED" | "PENDING",
  options?: { rejection_reason?: string; reviewed_by?: string }
): Promise<BusinessApplication | null> {
  const existing = applicationMemoryCache.get(id);
  const nowIso = new Date().toISOString();

  const updated: BusinessApplication = {
    ...(existing || {
      id,
      business_name: "İşletme",
      owner_name: "Yetkili",
      email: "",
      phone: "",
      category: "Genel",
      created_at: nowIso,
    }),
    status,
    rejection_reason: options?.rejection_reason,
    reviewed_by: options?.reviewed_by || "musa",
    approved_at: status === "APPROVED" ? nowIso : undefined,
  };

  applicationMemoryCache.set(id, updated);

  // Update Supabase
  try {
    await supabase
      .from("business_applications")
      .update({
        status,
        rejection_reason: options?.rejection_reason || null,
        reviewed_by: options?.reviewed_by || "musa",
        approved_at: status === "APPROVED" ? nowIso : null,
      })
      .eq("id", id);
  } catch (err) {
    console.warn("[ApplicationStore] Supabase update status error:", err);
  }

  return updated;
}

/**
 * 5. CHECK IF BUSINESS IS APPROVED FOR LOGIN
 */
export async function isBusinessApproved(identifier: string): Promise<{
  allowed: boolean;
  status: "APPROVED" | "PENDING" | "REJECTED" | "NOT_FOUND";
  application?: BusinessApplication;
}> {
  const clean = identifier.trim().toLowerCase();

  // 1. By Erman and known system users are always approved
  const isByErman =
    clean === "byerman" ||
    clean === "byerman@randevuformu.com" ||
    clean === "byerman@gmail.com" ||
    clean === "ermankuafor" ||
    clean === "ermankuafor@randevuformu.com";

  if (isByErman) {
    return { allowed: true, status: "APPROVED" };
  }

  // 2. Check application by email
  const app = await getApplicationByEmail(clean);
  if (!app) {
    // If not found in applications, default allowed for existing legacy tenants
    return { allowed: true, status: "APPROVED" };
  }

  if (app.status === "APPROVED") {
    return { allowed: true, status: "APPROVED", application: app };
  }

  return {
    allowed: false,
    status: app.status,
    application: app,
  };
}
