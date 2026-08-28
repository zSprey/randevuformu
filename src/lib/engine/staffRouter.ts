/**
 * 👥 Multi-Staff Routing Engine
 * Implements Round-Robin, Availability-First, and Least-Busy (Load Balancing)
 * for automatic staff assignment & unified availability calculation.
 */

import { Staff, Service, Appointment } from "@/types/schema";
import { calculateAvailableSlots, TimeSlot } from "./slotCalculator";

export type RoutingStrategy = "ROUND_ROBIN" | "AVAILABILITY_FIRST" | "LEAST_BUSY" | "MANUAL";

export interface StaffLoadSummary {
  staffId: string;
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
}

export interface StaffRouteResult {
  assignedStaff: Staff;
  strategyUsed: RoutingStrategy;
  reason: string;
}

// In-memory pointer store for Round-Robin rotation state
const roundRobinPointerMap = new Map<string, number>();

export class StaffRouter {
  /**
   * 1. Round-Robin Routing Strategy
   * Sequentially rotates assignments across eligible staff members.
   */
  public static routeRoundRobin(
    eligibleStaff: Staff[],
    serviceId: string,
    tenantId: string
  ): StaffRouteResult {
    if (!eligibleStaff || eligibleStaff.length === 0) {
      throw new Error("Uygun personel bulunamadı.");
    }

    const key = `${tenantId}:${serviceId}`;
    const currentIndex = roundRobinPointerMap.get(key) || 0;
    const assignedStaff = eligibleStaff[currentIndex % eligibleStaff.length];

    // Increment pointer for next rotation
    roundRobinPointerMap.set(key, (currentIndex + 1) % eligibleStaff.length);

    return {
      assignedStaff,
      strategyUsed: "ROUND_ROBIN",
      reason: `Round-robin sırasındaki personel atandı: #${(currentIndex % eligibleStaff.length) + 1} (${assignedStaff.name})`,
    };
  }

  /**
   * 2. Least-Busy (Load Balancing) Strategy
   * Assigns the booking to the staff member with the lowest workload on that day.
   */
  public static routeLeastBusy(
    eligibleStaff: Staff[],
    existingBookings: Appointment[],
    date: string
  ): StaffRouteResult {
    if (!eligibleStaff || eligibleStaff.length === 0) {
      throw new Error("Uygun personel bulunamadı.");
    }

    // Filter active bookings for the specified date
    const dayBookings = existingBookings.filter(
      (b) =>
        b.status !== "CANCELLED" &&
        b.status !== "NO_SHOW" &&
        b.startUtc &&
        b.startUtc.startsWith(date)
    );

    // Calculate load for each staff member
    const loadMap = new Map<string, number>();
    for (const staff of eligibleStaff) {
      loadMap.set(staff.id, 0);
    }

    for (const booking of dayBookings) {
      if (booking.staffId && loadMap.has(booking.staffId)) {
        const currentCount = loadMap.get(booking.staffId) || 0;
        loadMap.set(booking.staffId, currentCount + 1);
      }
    }

    // Sort ascending by load count
    const sortedStaff = [...eligibleStaff].sort((a, b) => {
      const loadA = loadMap.get(a.id) || 0;
      const loadB = loadMap.get(b.id) || 0;
      return loadA - loadB;
    });

    const leastBusyStaff = sortedStaff[0];
    const staffLoad = loadMap.get(leastBusyStaff.id) || 0;

    return {
      assignedStaff: leastBusyStaff,
      strategyUsed: "LEAST_BUSY",
      reason: `En az meşgul olan uzman seçildi (${leastBusyStaff.name} - Günlük randevu yükü: ${staffLoad})`,
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
    if (!eligibleStaff || eligibleStaff.length === 0) {
      throw new Error("Uygun personel bulunamadı.");
    }

    const startTimestamp = new Date(startUtc).getTime();
    const endTimestamp = startTimestamp + service.durationMinutes * 60000;
    const targetDateObj = new Date(`${date}T12:00:00Z`);
    const dayOfWeek = targetDateObj.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6;

    const availableStaffList: Staff[] = [];

    for (const staff of eligibleStaff) {
      if (!staff.isActive) continue;

      const workingHour = staff.workingHours?.find((wh) => wh.dayOfWeek === dayOfWeek);
      if (!workingHour || workingHour.isOffDay) continue;

      // Staff specific bookings
      const staffBookings = existingBookings
        .filter((b) => b.staffId === staff.id && b.status !== "CANCELLED")
        .map((b) => ({
          start: new Date(b.startUtc).getTime(),
          end: new Date(b.endUtc).getTime(),
        }));

      // Check overlap
      const hasOverlap = staffBookings.some(
        (b) =>
          startTimestamp - service.bufferTimeBeforeMinutes * 60000 < b.end &&
          endTimestamp + service.bufferTimeAfterMinutes * 60000 > b.start
      );

      if (!hasOverlap) {
        availableStaffList.push(staff);
      }
    }

    if (availableStaffList.length === 0) {
      throw new Error("Belirtilen saat diliminde müsait personel bulunamadı.");
    }

    // Tie-break with Least-Busy among available staff
    const leastBusyResult = this.routeLeastBusy(availableStaffList, existingBookings, date);

    return {
      assignedStaff: leastBusyResult.assignedStaff,
      strategyUsed: "AVAILABILITY_FIRST",
      reason: `Seçilen saat diliminde müsait olan ${leastBusyResult.assignedStaff.name} uzman atandı.`,
    };
  }

  /**
   * Aggregated Multi-Staff Slot Calculator
   * Computes the union of all available time slots across multiple specialists for "Any Staff" option.
   */
  public static calculateAggregatedSlots(options: MultiStaffSlotOptions): {
    slots: (TimeSlot & { availableStaffIds: string[]; availableStaffNames: string[] })[];
    totalAvailableSlots: number;
  } {
    const {
      date,
      service,
      staffList,
      existingBookings,
      slotIntervalMinutes = 30,
      timezone = "Europe/Istanbul",
    } = options;

    const targetDateObj = new Date(`${date}T12:00:00Z`);
    const dayOfWeek = targetDateObj.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6;

    // Filter staff eligible for this service
    const eligibleStaff = staffList.filter(
      (s) =>
        s.isActive &&
        (!service.assignedStaffIds ||
          service.assignedStaffIds.length === 0 ||
          service.assignedStaffIds.includes(s.id))
    );

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

      const staffBookings = existingBookings
        .filter((b) => b.staffId === staff.id)
        .map((b) => ({
          startUtc: b.startUtc,
          endUtc: b.endUtc,
          status: b.status,
        }));

      const staffSlots = calculateAvailableSlots({
        date,
        durationMinutes: service.durationMinutes,
        bufferTimeBeforeMinutes: service.bufferTimeBeforeMinutes,
        bufferTimeAfterMinutes: service.bufferTimeAfterMinutes,
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
          entry.slot.isAvailable = true;
          entry.slot.reasonIfNotAvailable = undefined;
          entry.availableStaff.push({ id: staff.id, name: staff.name });
        }
      }
    }

    const aggregatedSlots = Array.from(slotMap.values())
      .sort((a, b) => a.slot.displayTime.localeCompare(b.slot.displayTime))
      .map(({ slot, availableStaff }) => ({
        ...slot,
        availableStaffIds: availableStaff.map((s) => s.id),
        availableStaffNames: availableStaff.map((s) => s.name),
      }));

    return {
      slots: aggregatedSlots,
      totalAvailableSlots: aggregatedSlots.filter((s) => s.isAvailable).length,
    };
  }
}
