import { Staff, StaffWorkingHours } from "@/types/schema";
import { supabase } from "@/lib/supabase";

const EDGE_CONFIG_ID = process.env.EDGE_CONFIG_ID || "";
const VERCEL_TOKEN = process.env.VERCEL_BEARER_TOKEN || "";
const EDGE_CONFIG_READ_URL = process.env.EDGE_CONFIG || "";

export interface BarberStaff {
  id: string;
  name: string;
  role: string;
  chair?: string;
  avatar?: string;
  badge?: string;
  isAvailableToday?: boolean;
  is_active?: boolean;
  email?: string;
  phone?: string;
  tenant_id?: string;
  display_name?: string;
  title?: string;
  created_at?: string;
}

export const BYERMAN_DEFAULT_STAFF: BarberStaff[] = [
  {
    id: "erman-usta",
    name: "Erman Usta",
    display_name: "Erman Usta",
    role: "Master Barber",
    title: "Master Barber",
    chair: "Koltuk 1 (Master)",
    avatar: "✂️",
    badge: "Kurucu & Baş Berber",
    isAvailableToday: true,
    is_active: true,
    email: "erman@byerman.com",
    phone: "+90 538 480 90 01",
    tenant_id: "byerman",
  },
  {
    id: "ahmet-kalfa",
    name: "Ahmet Kalfa",
    display_name: "Ahmet Kalfa",
    role: "Saç & Sakal Uzmanı",
    title: "Saç & Sakal Uzmanı",
    chair: "Koltuk 2",
    avatar: "💈",
    badge: "Fade & Sakal Uzmanı",
    isAvailableToday: true,
    is_active: true,
    email: "ahmet@byerman.com",
    phone: "+90 538 480 90 01",
    tenant_id: "byerman",
  },
];

export const BYERMAN_STAFF_LIST: BarberStaff[] = [
  ...BYERMAN_DEFAULT_STAFF,
  {
    id: "ANY_STAFF",
    name: "Fark Etmez / İlk Müsait Usta",
    display_name: "Fark Etmez / İlk Müsait Usta",
    role: "En Hızlı Seans",
    chair: "Koltuk Dengesi (Akıllı Dağıtım)",
    avatar: "⚡",
    badge: "Önerilen Hızlı Seçim",
    isAvailableToday: true,
    is_active: true,
    tenant_id: "byerman",
  },
];

// In-memory caches
const staffMemoryCache = new Map<string, BarberStaff[]>();
const deletedStaffCache = new Map<string, Set<string>>();
const staffScheduleCache = new Map<string, StaffWorkingHours[]>();

export function normalizeTenant(tenantId?: string | null): string {
  if (!tenantId) return "byerman";
  const clean = tenantId.trim().toLowerCase();
  if (clean === "byerman-id" || clean === "ermankuafor" || clean === "default" || clean === "byerman") {
    return "byerman";
  }
  return clean;
}

/**
 * Returns default weekly working hours & breaks for a barber specialist.
 * Day 0 = Sunday, 1 = Monday ... 6 = Saturday
 */
export function getDefaultStaffWorkingHours(staffId: string): StaffWorkingHours[] {
  const isAhmet = staffId === "ahmet-kalfa";
  const breakStart = isAhmet ? "14:00" : "13:00";
  const breakEnd = isAhmet ? "15:00" : "14:00";

  const days: (0 | 1 | 2 | 3 | 4 | 5 | 6)[] = [0, 1, 2, 3, 4, 5, 6];

  return days.map((dayOfWeek) => {
    if (dayOfWeek === 0) {
      return {
        dayOfWeek,
        startTime: "10:00",
        endTime: "19:00",
        breakStartTime: breakStart,
        breakEndTime: breakEnd,
        isOffDay: false,
      };
    }
    return {
      dayOfWeek,
      startTime: "09:00",
      endTime: "20:00",
      breakStartTime: breakStart,
      breakEndTime: breakEnd,
      isOffDay: false,
    };
  });
}

/**
 * Edge Config Helper: Write items
 */
async function saveToEdgeConfig(items: Array<{ operation: "upsert" | "delete"; key: string; value?: any }>): Promise<boolean> {
  if (!EDGE_CONFIG_ID || !VERCEL_TOKEN) return false;
  try {
    const res = await fetch(`https://api.vercel.com/v1/edge-config/${EDGE_CONFIG_ID}/items`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${VERCEL_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ items }),
    });
    return res.ok;
  } catch (err) {
    console.warn("[StaffStore] Edge Config write error:", err);
    return false;
  }
}

/**
 * Edge Config Helper: Read items
 */
async function readEdgeConfigAll(): Promise<Record<string, any>> {
  if (!EDGE_CONFIG_READ_URL) return {};
  try {
    const res = await fetch(`${EDGE_CONFIG_READ_URL}`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      return data?.items || data || {};
    }
  } catch (err) {
    console.warn("[StaffStore] Edge Config read error:", err);
  }
  return {};
}

/**
 * Get the set of deleted staff IDs for a tenant
 */
export async function getDeletedStaffIds(tenantId: string = "byerman"): Promise<Set<string>> {
  const cleanTenant = normalizeTenant(tenantId);
  const cacheKey = `${cleanTenant}_deleted_staff_ids`;

  if (deletedStaffCache.has(cleanTenant)) {
    return deletedStaffCache.get(cleanTenant)!;
  }

  const items = await readEdgeConfigAll();
  const remoteDeleted = items[cacheKey];
  const set = new Set<string>();

  if (Array.isArray(remoteDeleted)) {
    remoteDeleted.forEach((id) => set.add(id));
  }

  deletedStaffCache.set(cleanTenant, set);
  return set;
}

/**
 * Mark a staff member as permanently deleted for a tenant
 */
export async function markStaffDeleted(id: string, tenantId: string = "byerman"): Promise<void> {
  const cleanTenant = normalizeTenant(tenantId);
  const cacheKey = `${cleanTenant}_deleted_staff_ids`;

  // 1. Update memory cache
  let set = deletedStaffCache.get(cleanTenant);
  if (!set) {
    set = new Set<string>();
    deletedStaffCache.set(cleanTenant, set);
  }
  set.add(id);

  // Also remove from staff memory cache if present
  if (staffMemoryCache.has(cleanTenant)) {
    const currentList = staffMemoryCache.get(cleanTenant)!;
    staffMemoryCache.set(
      cleanTenant,
      currentList.filter((s) => s.id !== id)
    );
  }

  // 2. Persist to Edge Config
  const deletedArray = Array.from(set);
  const currentStaff = await getStoredStaff(cleanTenant, true);
  const updatedStaff = currentStaff.filter((s) => s.id !== id);

  await saveToEdgeConfig([
    { operation: "upsert", key: cacheKey, value: deletedArray },
    { operation: "upsert", key: `${cleanTenant}_staff`, value: updatedStaff },
  ]);
}

/**
 * Check if a staff member is deleted
 */
export function isStaffDeleted(id: string, tenantId: string = "byerman"): boolean {
  const cleanTenant = normalizeTenant(tenantId);
  const set = deletedStaffCache.get(cleanTenant);
  return set ? set.has(id) : false;
}

/**
 * Fetch all active stored staff for a tenant
 */
export async function getStoredStaff(
  tenantId: string = "byerman",
  skipCache: boolean = false
): Promise<BarberStaff[]> {
  const cleanTenant = normalizeTenant(tenantId);
  const isByErman = cleanTenant === "byerman";

  // Check memory cache
  if (!skipCache && staffMemoryCache.has(cleanTenant)) {
    return staffMemoryCache.get(cleanTenant)!;
  }

  const items = await readEdgeConfigAll();
  const deletedIds = new Set<string>(
    Array.isArray(items[`${cleanTenant}_deleted_staff_ids`]) ? items[`${cleanTenant}_deleted_staff_ids`] : []
  );
  deletedStaffCache.set(cleanTenant, deletedIds);

  let rawStaff: BarberStaff[] = [];
  const remoteStaff = items[`${cleanTenant}_staff`];

  if (Array.isArray(remoteStaff) && remoteStaff.length > 0) {
    rawStaff = remoteStaff;
  } else if (isByErman) {
    // Default initial specialists for By Erman
    rawStaff = BYERMAN_DEFAULT_STAFF;
  }

  // Filter out any deleted staff or explicitly inactive staff
  const activeStaff = rawStaff.filter(
    (s) => !deletedIds.has(s.id) && s.is_active !== false
  );

  staffMemoryCache.set(cleanTenant, activeStaff);
  return activeStaff;
}

/**
 * Add a new staff member for a tenant
 */
export async function addStoredStaff(
  tenantId: string = "byerman",
  staffData: Partial<BarberStaff>
): Promise<BarberStaff> {
  const cleanTenant = normalizeTenant(tenantId);
  const currentStaff = await getStoredStaff(cleanTenant, true);

  const newStaff: BarberStaff = {
    id: staffData.id || `staff_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    name: staffData.name || staffData.display_name || "Yeni Uzman",
    display_name: staffData.display_name || staffData.name || "Yeni Uzman",
    role: staffData.role || "STAFF",
    title: staffData.title || staffData.role || "Uzman",
    chair: staffData.chair || `Koltuk ${currentStaff.length + 1}`,
    avatar: staffData.avatar || "✂️",
    badge: staffData.badge,
    email: staffData.email,
    phone: staffData.phone,
    isAvailableToday: true,
    is_active: true,
    tenant_id: cleanTenant,
    created_at: new Date().toISOString(),
  };

  const updatedStaff = [...currentStaff, newStaff];
  staffMemoryCache.set(cleanTenant, updatedStaff);

  await saveToEdgeConfig([
    {
      operation: "upsert",
      key: `${cleanTenant}_staff`,
      value: updatedStaff,
    },
  ]);

  return newStaff;
}

/**
 * Update staff details or status
 */
export async function updateStoredStaff(
  tenantId: string = "byerman",
  staffId: string,
  updates: Partial<BarberStaff>
): Promise<BarberStaff | null> {
  const cleanTenant = normalizeTenant(tenantId);
  const currentStaff = await getStoredStaff(cleanTenant, true);

  const idx = currentStaff.findIndex((s) => s.id === staffId);
  if (idx === -1) {
    if (cleanTenant === "byerman") {
      const defaultItem = BYERMAN_DEFAULT_STAFF.find((s) => s.id === staffId);
      if (defaultItem) {
        const merged = { ...defaultItem, ...updates };
        const updatedStaff = [...currentStaff, merged];
        staffMemoryCache.set(cleanTenant, updatedStaff);
        await saveToEdgeConfig([
          { operation: "upsert", key: `${cleanTenant}_staff`, value: updatedStaff },
        ]);
        return merged;
      }
    }
    return null;
  }

  const updated = {
    ...currentStaff[idx],
    ...updates,
    display_name: updates.display_name || updates.name || currentStaff[idx].display_name,
    name: updates.name || updates.display_name || currentStaff[idx].name,
  };

  currentStaff[idx] = updated;
  staffMemoryCache.set(cleanTenant, currentStaff);

  await saveToEdgeConfig([
    {
      operation: "upsert",
      key: `${cleanTenant}_staff`,
      value: currentStaff,
    },
  ]);

  return updated;
}

/**
 * Delete a staff member permanently
 */
export async function deleteStoredStaff(
  tenantId: string = "byerman",
  staffId: string
): Promise<boolean> {
  await markStaffDeleted(staffId, tenantId);
  return true;
}

/**
 * Backward compatibility: getAvailableStaff
 */
export function getAvailableStaff(tenantId: string = "byerman"): BarberStaff[] {
  const cleanTenant = normalizeTenant(tenantId);
  const isByErman = cleanTenant === "byerman";

  const cached = staffMemoryCache.get(cleanTenant);
  const deleted = deletedStaffCache.get(cleanTenant);

  let list: BarberStaff[] = [];
  if (cached && cached.length > 0) {
    list = cached;
  } else if (isByErman) {
    list = BYERMAN_DEFAULT_STAFF;
  }

  const filtered = list.filter((s) => !deleted?.has(s.id) && s.is_active !== false);
  return filtered;
}

/**
 * Find staff member by ID
 */
export function getStaffById(id: string, tenantId: string = "byerman"): BarberStaff | undefined {
  const staff = getAvailableStaff(tenantId);
  return staff.find((s) => s.id === id);
}

/**
 * Get all available staff members
 */
export function getAllStaff(tenantId?: string): BarberStaff[] {
  return getAvailableStaff(tenantId);
}

/**
 * Get staff working hours from memory, Edge Config, or defaults
 */
export async function getStaffWorkingHours(
  staffId: string,
  tenantId: string = "byerman"
): Promise<StaffWorkingHours[]> {
  const cleanTenant = normalizeTenant(tenantId);
  const cacheKey = `${cleanTenant}:${staffId}`;
  if (staffScheduleCache.has(cacheKey)) {
    return staffScheduleCache.get(cacheKey)!;
  }

  // Try Supabase staff_working_hours if available
  try {
    const { data, error } = await supabase
      .from("staff_working_hours")
      .select("*")
      .eq("staff_id", staffId)
      .order("day_of_week", { ascending: true });

    if (!error && Array.isArray(data) && data.length > 0) {
      const hours: StaffWorkingHours[] = data.map((d: any) => ({
        dayOfWeek: d.day_of_week as 0 | 1 | 2 | 3 | 4 | 5 | 6,
        startTime: d.start_time?.slice(0, 5) || "09:00",
        endTime: d.end_time?.slice(0, 5) || "20:00",
        breakStartTime: d.break_start?.slice(0, 5) || undefined,
        breakEndTime: d.break_end?.slice(0, 5) || undefined,
        isOffDay: Boolean(d.is_off_day),
      }));

      staffScheduleCache.set(cacheKey, hours);
      return hours;
    }
  } catch (e) {
    // Ignore schema errors
  }

  const defaultHours = getDefaultStaffWorkingHours(staffId);
  staffScheduleCache.set(cacheKey, defaultHours);
  return defaultHours;
}

/**
 * Save customized staff schedule
 */
export async function saveStaffWorkingHours(
  staffId: string,
  workingHours: StaffWorkingHours[],
  tenantId: string = "byerman"
): Promise<boolean> {
  const cleanTenant = normalizeTenant(tenantId);
  const cacheKey = `${cleanTenant}:${staffId}`;
  staffScheduleCache.set(cacheKey, workingHours);

  try {
    for (const wh of workingHours) {
      await supabase.from("staff_working_hours").upsert(
        {
          staff_id: staffId,
          day_of_week: wh.dayOfWeek,
          start_time: wh.startTime.length === 5 ? `${wh.startTime}:00` : wh.startTime,
          end_time: wh.endTime.length === 5 ? `${wh.endTime}:00` : wh.endTime,
          break_start: wh.breakStartTime ? (wh.breakStartTime.length === 5 ? `${wh.breakStartTime}:00` : wh.breakStartTime) : null,
          break_end: wh.breakEndTime ? (wh.breakEndTime.length === 5 ? `${wh.breakEndTime}:00` : wh.breakEndTime) : null,
          is_off_day: wh.isOffDay,
        },
        { onConflict: "staff_id,day_of_week" }
      );
    }
  } catch {
    // Non-blocking
  }

  return true;
}

/**
 * Builds full Staff[] objects compatible with StaffRouter multi-staff algorithms
 */
export async function getByErmanStaffAsEngineStaff(tenantId: string = "byerman"): Promise<Staff[]> {
  const cleanTenant = normalizeTenant(tenantId);
  const realStaff = await getStoredStaff(cleanTenant);
  const result: Staff[] = [];

  for (const s of realStaff) {
    if (s.id === "ANY_STAFF") continue;
    const hours = await getStaffWorkingHours(s.id, cleanTenant);
    result.push({
      id: s.id,
      tenantId: cleanTenant,
      name: s.name || s.display_name || "Uzman",
      title: s.role || s.title || "Uzman",
      email: s.email || `${s.id}@${cleanTenant}.com`,
      phone: s.phone || "+905384809001",
      avatarUrl: s.avatar || "✂️",
      isActive: s.is_active !== false,
      googleCalendarConnected: false,
      outlookConnected: false,
      workingHours: hours,
      createdAt: s.created_at || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  return result;
}
