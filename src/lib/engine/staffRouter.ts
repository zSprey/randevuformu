/**
 * 👥 Enterprise Multi-Staff Routing Engine
 * Implements Round-Robin, Availability-First, Least-Busy (Load Balancing), and Priority-Based
 * routing strategies for automated specialist assignment & unified availability calculation.
 */

import { Staff, Service, Appointment, StaffWorkingHours } from "@/types/schema";
import { calculateAvailableSlots, TimeSlot } from "./slotCalculator";
import { slotLockManager } from "./lockManager";

export type RoutingStrategy = "ROUND_ROBIN" | "AVAILABILITY_FIRST" | "LEAST_BUSY" | "PRIORITY" | "MANUAL";

export class StaffRoutingError extends Error {
  public code: "NO_STAFF_AVAILABLE" | "NO_ELIGIBLE_STAFF" | "INVALID_REQUEST" | "SCHEDULE_CONFLICT";
  public statusCode: number;

  constructor(
    message: string,
    code: "NO_STAFF_AVAILABLE" | "NO_ELIGIBLE_STAFF" | "INVALID_REQUEST" | "SCHEDULE_CONFLICT" = "NO_STAFF_AVAILABLE",
    statusCode: number = 409
  ) {
    super(message);
    this.name = "StaffRoutingError";
    this.code = code;
    this.statusCode = statusCode;
  }
}

export interface StaffLoadSummary {
  staffId: string;
  staffName: string;
  totalAppointments: number;
  totalDurationMinutes: number;
}

export interface MultiStaffSlotOptions {
  date: string; // "YYYY-MM-DD"
  service: Service;
  staffList: Staff[];
  existingBookings: Appointment[];
  strategy?: RoutingStrategy;
  slotIntervalMinutes?: number;
  timezone?: string;
  checkLockManager?: boolean;
}

export interface StaffRouteResult {
  assignedStaff: Staff;
  strategyUsed: RoutingStrategy;
  reason: string;
  availableStaffCount?: number;
  totalStaffEvaluated?: number;
}

// In-memory pointer store for Round-Robin rotation state per tenant & service
const roundRobinPointerMap = new Map<string, number>();

export class StaffRouter {
  /**
   * Helper to filter active staff assigned to a specific service
   */
  public static getEligibleStaffForService(staffList: Staff[], service?: Partial<Service>): Staff[] {
    if (!staffList || staffList.length === 0) {
      return [];
    }

    return staffList.filter((s) => {
      if (!s.isActive) return false;
      if (!service || !service.assignedStaffIds || service.assignedStaffIds.length === 0) {
        return true;
      }
      return service.assignedStaffIds.includes(s.id);
    });
  }

  /**
   * 1. Round-Robin Routing Strategy
   * Sequentially rotates assignments across eligible staff members.
   */
  public static routeRoundRobin(
    eligibleStaff: Staff[],
    serviceId: string,
    tenantId: string
  ): StaffRouteResult {
    const activeStaff = (eligibleStaff || []).filter((s) => s.isActive);
    if (activeStaff.length === 0) {
      throw new StaffRoutingError("Bu hizmet için aktif personel bulunamadı.", "NO_ELIGIBLE_STAFF", 404);
    }

    const key = `${tenantId}:${serviceId}`;
    const currentIndex = roundRobinPointerMap.get(key) || 0;
    const assignedStaff = activeStaff[currentIndex % activeStaff.length];

    // Increment pointer for next rotation
    roundRobinPointerMap.set(key, (currentIndex + 1) % activeStaff.length);

    return {
      assignedStaff,
      strategyUsed: "ROUND_ROBIN",
      reason: `Sıralı dağıtım (Round-Robin) kuralı uygulandı: #${(currentIndex % activeStaff.length) + 1} (${assignedStaff.name})`,
      availableStaffCount: activeStaff.length,
      totalStaffEvaluated: eligibleStaff.length,
    };
  }

  /**
   * 2. Least-Busy (Workload Balancing) Strategy
   * Assigns booking to the specialist with the lowest daily appointment count and total minutes.
   */
  public static routeLeastBusy(
    eligibleStaff: Staff[],
    existingBookings: Appointment[],
    date: string
  ): StaffRouteResult {
    const activeStaff = (eligibleStaff || []).filter((s) => s.isActive);
    if (activeStaff.length === 0) {
      throw new StaffRoutingError("Bu hizmet için aktif personel bulunamadı.", "NO_ELIGIBLE_STAFF", 404);
    }

    // Filter active bookings for the specified date
    const dayBookings = (existingBookings || []).filter(
      (b) =>
        b.status !== "CANCELLED" &&
        b.status !== "NO_SHOW" &&
        b.startUtc &&
        b.startUtc.startsWith(date)
    );

    // Calculate appointment count and estimated duration for each staff
    const loadMap = new Map<string, { count: number; minutes: number }>();
    for (const staff of activeStaff) {
      loadMap.set(staff.id, { count: 0, minutes: 0 });
    }

    for (const booking of dayBookings) {
      if (booking.staffId && loadMap.has(booking.staffId)) {
        const current = loadMap.get(booking.staffId)!;
        const duration =
          booking.startUtc && booking.endUtc
            ? Math.max(15, (new Date(booking.endUtc).getTime() - new Date(booking.startUtc).getTime()) / 60000)
            : 30;

        loadMap.set(booking.staffId, {
          count: current.count + 1,
          minutes: current.minutes + duration,
        });
      }
    }

    // Sort ascending by total appointment count, then total duration
    const sortedStaff = [...activeStaff].sort((a, b) => {
      const loadA = loadMap.get(a.id) || { count: 0, minutes: 0 };
      const loadB = loadMap.get(b.id) || { count: 0, minutes: 0 };
      if (loadA.count !== loadB.count) {
        return loadA.count - loadB.count;
      }
      return loadA.minutes - loadB.minutes;
    });

    const leastBusyStaff = sortedStaff[0];
    const staffLoad = loadMap.get(leastBusyStaff.id) || { count: 0, minutes: 0 };

    return {
      assignedStaff: leastBusyStaff,
      strategyUsed: "LEAST_BUSY",
      reason: `İş yükü dengeleme kuralı uygulandı: ${leastBusyStaff.name} (Bugünkü randevu: ${staffLoad.count}, toplam süre: ${staffLoad.minutes} dk)`,
      availableStaffCount: activeStaff.length,
      totalStaffEvaluated: eligibleStaff.length,
    };
  }

  /**
   * 3. Availability-First Strategy
   * Checks real-time availability at requested slot and picks the best available specialist.
   */
  public static routeAvailabilityFirst(
    eligibleStaff: Staff[],
    service: Service,
    startUtc: string,
    existingBookings: Appointment[],
    date: string
  ): StaffRouteResult {
    const activeStaff = (eligibleStaff || []).filter((s) => s.isActive);
    if (activeStaff.length === 0) {
      throw new StaffRoutingError("Bu hizmet için aktif personel bulunamadı.", "NO_ELIGIBLE_STAFF", 404);
    }

    const startTimestamp = new Date(startUtc).getTime();
    if (isNaN(startTimestamp)) {
      throw new StaffRoutingError("Geçersiz randevu başlangıç zamanı.", "INVALID_REQUEST", 400);
    }

    const duration = service.durationMinutes || 30;
    const bufferBefore = service.bufferTimeBeforeMinutes || 0;
    const bufferAfter = service.bufferTimeAfterMinutes || 0;
    const endTimestamp = startTimestamp + duration * 60000;

    // Day of week calculation for Europe/Istanbul
    const dateParts = date.split("-").map(Number);
    const targetDateObj = new Date(Date.UTC(dateParts[0], dateParts[1] - 1, dateParts[2], 12, 0, 0));
    const dayOfWeek = targetDateObj.getUTCDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6;

    const availableStaffList: Staff[] = [];

    for (const staff of activeStaff) {
      // 1. Check working hours & off day
      const workingHour: StaffWorkingHours = staff.workingHours?.find((wh) => wh.dayOfWeek === dayOfWeek) || {
        dayOfWeek,
        startTime: "09:00",
        endTime: "18:00",
        breakStartTime: "12:30",
        breakEndTime: "13:30",
        isOffDay: dayOfWeek === 0,
      };

      if (workingHour.isOffDay) {
        continue;
      }

      // 2. Check within working shift hours
      const [startH, startM] = workingHour.startTime.split(":").map(Number);
      const [endH, endM] = workingHour.endTime.split(":").map(Number);

      const shiftStartUtc = new Date(`${date}T${workingHour.startTime}:00+03:00`).getTime();
      const shiftEndUtc = new Date(`${date}T${workingHour.endTime}:00+03:00`).getTime();

      if (startTimestamp < shiftStartUtc || endTimestamp > shiftEndUtc) {
        continue;
      }

      // 3. Check break overlap
      if (workingHour.breakStartTime && workingHour.breakEndTime) {
        const breakStartUtc = new Date(`${date}T${workingHour.breakStartTime}:00+03:00`).getTime();
        const breakEndUtc = new Date(`${date}T${workingHour.breakEndTime}:00+03:00`).getTime();

        if (startTimestamp < breakEndUtc && endTimestamp > breakStartUtc) {
          continue;
        }
      }

      // 4. Staff-specific existing bookings
      const staffBookings = (existingBookings || [])
        .filter((b) => b.staffId === staff.id && b.status !== "CANCELLED" && b.status !== "NO_SHOW")
        .map((b) => ({
          start: new Date(b.startUtc).getTime(),
          end: new Date(b.endUtc).getTime(),
        }));

      // 5. Overlap check with buffers
      const hasOverlap = staffBookings.some(
        (b) =>
          startTimestamp - bufferBefore * 60000 < b.end &&
          endTimestamp + bufferAfter * 60000 > b.start
      );

      // 6. Check slot lock manager for staff specific lock
      const isStaffSlotLocked = slotLockManager.isLocked(
        service.tenantId,
        service.id,
        startUtc,
        staff.id,
        service.maxCapacityPerSlot || 1
      );

      if (!hasOverlap && !isStaffSlotLocked) {
        availableStaffList.push(staff);
      }
    }

    if (availableStaffList.length === 0) {
      throw new StaffRoutingError(
        "Seçilen saat diliminde uygun ve müsait uzman bulunamadı. Lütfen farklı bir saat seçiniz.",
        "SCHEDULE_CONFLICT",
        409
      );
    }

    // Tie-break with Least-Busy among available specialists
    const leastBusyResult = this.routeLeastBusy(availableStaffList, existingBookings, date);

    return {
      assignedStaff: leastBusyResult.assignedStaff,
      strategyUsed: "AVAILABILITY_FIRST",
      reason: `Seçilen saat diliminde müsait olan ${leastBusyResult.assignedStaff.name} uzman atandı. (${availableStaffList.length} müsait uzman arasından)`,
      availableStaffCount: availableStaffList.length,
      totalStaffEvaluated: eligibleStaff.length,
    };
  }

  /**
   * 4. Priority / Seniority-First Routing Strategy
   */
  public static routePriority(
    eligibleStaff: Staff[],
    existingBookings: Appointment[],
    date: string
  ): StaffRouteResult {
    const activeStaff = (eligibleStaff || []).filter((s) => s.isActive);
    if (activeStaff.length === 0) {
      throw new StaffRoutingError("Bu hizmet için aktif personel bulunamadı.", "NO_ELIGIBLE_STAFF", 404);
    }

    // Prioritize OWNER / Lead role
    const prioritySorted = [...activeStaff].sort((a, b) => {
      const aRank = (a as any).role === "OWNER" || (a as any).role === "TENANT_OWNER" ? 2 : 1;
      const bRank = (b as any).role === "OWNER" || (b as any).role === "TENANT_OWNER" ? 2 : 1;
      return bRank - aRank;
    });

    const chosen = prioritySorted[0];
    return {
      assignedStaff: chosen,
      strategyUsed: "PRIORITY",
      reason: `Öncelikli uzman seçildi: ${chosen.name}`,
      availableStaffCount: activeStaff.length,
      totalStaffEvaluated: eligibleStaff.length,
    };
  }

  /**
   * 🌟 Aggregated Multi-Staff Slot Calculator
   * Computes the union of all available time slots across multiple specialists for "Any Specialist" booking.
   */
  public static calculateAggregatedSlots(options: MultiStaffSlotOptions): {
    slots: (TimeSlot & {
      availableStaffIds: string[];
      availableStaffNames: string[];
      availableStaffCount: number;
    })[];
    totalAvailableSlots: number;
  } {
    const {
      date,
      service,
      staffList,
      existingBookings,
      slotIntervalMinutes = 30,
      timezone = "Europe/Istanbul",
      checkLockManager = true,
    } = options;

    const dateParts = date.split("-").map(Number);
    const targetDateObj = new Date(Date.UTC(dateParts[0], dateParts[1] - 1, dateParts[2], 12, 0, 0));
    const dayOfWeek = targetDateObj.getUTCDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6;

    // Filter staff eligible for this service
    const eligibleStaff = this.getEligibleStaffForService(staffList, service);

    const slotMap = new Map<
      string,
      { slot: TimeSlot; availableStaff: { id: string; name: string }[] }
    >();

    for (const staff of eligibleStaff) {
      const workingHour = staff.workingHours?.find((wh) => wh.dayOfWeek === dayOfWeek) || {
        dayOfWeek,
        startTime: "09:00",
        endTime: "18:00",
        breakStartTime: "12:30",
        breakEndTime: "13:30",
        isOffDay: dayOfWeek === 0,
      };

      const staffBookings = (existingBookings || [])
        .filter((b) => b.staffId === staff.id)
        .map((b) => ({
          startUtc: b.startUtc,
          endUtc: b.endUtc,
          status: b.status,
        }));

      const staffSlots = calculateAvailableSlots({
        date,
        durationMinutes: service.durationMinutes || 30,
        bufferTimeBeforeMinutes: service.bufferTimeBeforeMinutes || 0,
        bufferTimeAfterMinutes: service.bufferTimeAfterMinutes || 0,
        workingHours: workingHour,
        existingBookings: staffBookings,
        slotIntervalMinutes,
        timezone,
      });

      for (const slot of staffSlots) {
        if (!slotMap.has(slot.displayTime)) {
          slotMap.set(slot.displayTime, {
            slot: { ...slot, isAvailable: false },
            availableStaff: [],
          });
        }

        const entry = slotMap.get(slot.displayTime)!;
        if (slot.isAvailable) {
          // Check staff-specific lock status
          let isLocked = false;
          if (checkLockManager) {
            isLocked = slotLockManager.isLocked(
              service.tenantId,
              service.id,
              slot.startUtc,
              staff.id,
              service.maxCapacityPerSlot || 1
            );
          }

          if (!isLocked) {
            entry.slot.isAvailable = true;
            entry.slot.reasonIfNotAvailable = undefined;
            entry.availableStaff.push({ id: staff.id, name: staff.name });
          }
        }
      }
    }

    const aggregatedSlots = Array.from(slotMap.values())
      .sort((a, b) => a.slot.displayTime.localeCompare(b.slot.displayTime))
      .map(({ slot, availableStaff }) => ({
        ...slot,
        isAvailable: availableStaff.length > 0,
        reasonIfNotAvailable: availableStaff.length === 0 ? "Tüm uzmanlar dolu veya mola saatinde" : undefined,
        availableStaffIds: availableStaff.map((s) => s.id),
        availableStaffNames: availableStaff.map((s) => s.name),
        availableStaffCount: availableStaff.length,
      }));

    return {
      slots: aggregatedSlots,
      totalAvailableSlots: aggregatedSlots.filter((s) => s.isAvailable).length,
    };
  }
}
