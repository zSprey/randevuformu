import { Staff, StaffWorkingHours } from "@/types/schema";
import { supabase } from "@/lib/supabase";

const EDGE_CONFIG_ID = process.env.EDGE_CONFIG_ID || "";
const VERCEL_TOKEN = process.env.VERCEL_BEARER_TOKEN || "";
const EDGE_CONFIG_READ_URL = process.env.EDGE_CONFIG || "";

export interface BarberStaff {
  id: string;
  name: string;
  role: string;
  chair: string;
  avatar: string;
  badge?: string;
  isAvailableToday?: boolean;
}

export const BYERMAN_STAFF_LIST: BarberStaff[] = [
  {
    id: "erman-usta",
    name: "Erman Usta",
    role: "Master Barber",
    chair: "Koltuk 1 (Master)",
    avatar: "✂️",
    badge: "Kurucu & Baş Berber",
    isAvailableToday: true,
  },
  {
    id: "ahmet-kalfa",
    name: "Ahmet Kalfa",
    role: "Saç & Sakal Uzmanı",
    chair: "Koltuk 2",
    avatar: "💈",
    badge: "Fade & Sakal Uzmanı",
    isAvailableToday: true,
  },
  {
    id: "ANY_STAFF",
    name: "Fark Etmez / İlk Müsait Usta",
    role: "En Hızlı Seans",
    chair: "Koltuk Dengesi (Akıllı Dağıtım)",
    avatar: "⚡",
    badge: "Önerilen Hızlı Seçim",
    isAvailableToday: true,
  },
];

// In-memory cache for customized staff schedules
const staffScheduleCache = new Map<string, StaffWorkingHours[]>();

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
    // Sunday (0) has slightly shorter hours
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
    // Monday-Saturday (1-6)
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

// Track deleted staff IDs across memory and sessions
const deletedStaffSet = new Set<string>();

export function markStaffDeleted(id: string): void {
  deletedStaffSet.add(id);
}

export function isStaffDeleted(id: string): boolean {
  return deletedStaffSet.has(id);
}

export function getAvailableStaff(tenantId: string = "byerman"): BarberStaff[] {
  const active = BYERMAN_STAFF_LIST.filter((s) => !deletedStaffSet.has(s.id));
  const actualBarbers = active.filter((s) => s.id !== "ANY_STAFF");
  if (actualBarbers.length <= 1) {
    return actualBarbers;
  }
  return active;
}

/**
 * Find staff member by ID from By Erman list
 */
export function getStaffById(id: string): BarberStaff | undefined {
  if (deletedStaffSet.has(id)) return undefined;
  return BYERMAN_STAFF_LIST.find((s) => s.id === id);
}

/**
 * Get all available staff members
 */
export function getAllStaff(tenantId?: string): BarberStaff[] {
  return getAvailableStaff(tenantId);
}

/**
 * Get staff working hours from memory, Edge Config, or Supabase with fallback to defaults
 */
export async function getStaffWorkingHours(
  staffId: string,
  tenantId: string = "byerman"
): Promise<StaffWorkingHours[]> {
  const cacheKey = `${tenantId}:${staffId}`;
  if (staffScheduleCache.has(cacheKey)) {
    return staffScheduleCache.get(cacheKey)!;
  }

  // 1. Try Supabase staff_working_hours
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
    console.warn("[StaffStore] Supabase schedule read error:", e);
  }

  // 2. Fallback to default
  const defaultHours = getDefaultStaffWorkingHours(staffId);
  staffScheduleCache.set(cacheKey, defaultHours);
  return defaultHours;
}

/**
 * Save customized staff schedule (working hours and breaks)
 */
export async function saveStaffWorkingHours(
  staffId: string,
  workingHours: StaffWorkingHours[],
  tenantId: string = "byerman"
): Promise<boolean> {
  const cacheKey = `${tenantId}:${staffId}`;
  staffScheduleCache.set(cacheKey, workingHours);

  // A. Save to Supabase staff_working_hours
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
  } catch (err) {
    console.warn("[StaffStore] Supabase schedule upsert error:", err);
  }

  return true;
}

/**
 * Builds full Staff[] objects compatible with StaffRouter multi-staff algorithms
 */
export async function getByErmanStaffAsEngineStaff(): Promise<Staff[]> {
  const realStaff = BYERMAN_STAFF_LIST.filter((s) => s.id !== "ANY_STAFF");
  const result: Staff[] = [];

  for (const s of realStaff) {
    const hours = await getStaffWorkingHours(s.id, "byerman");
    result.push({
      id: s.id,
      tenantId: "byerman",
      name: s.name,
      title: s.role,
      email: `${s.id}@byerman.com`,
      phone: "+905384809001",
      avatarUrl: s.avatar,
      isActive: true,
      googleCalendarConnected: false,
      outlookConnected: false,
      workingHours: hours,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  return result;
}
