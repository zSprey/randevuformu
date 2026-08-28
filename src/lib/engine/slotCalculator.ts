import { StaffWorkingHours } from "@/types/schema";

/**
 * 🏗️ Backend Engine - High-Performance Slot Calculator
 * Computes available time slots in UTC with buffer times, breaks, working hours, and existing bookings.
 */

export interface TimeSlot {
  startUtc: string; // ISO 8601 UTC
  endUtc: string;   // ISO 8601 UTC
  displayTime: string; // "14:30" in local timezone
  isAvailable: boolean;
  reasonIfNotAvailable?: string;
}

export interface ExistingBooking {
  startUtc: string;
  endUtc: string;
  status: string;
}

export interface SlotCalculationOptions {
  date: string; // "YYYY-MM-DD"
  durationMinutes: number; // e.g. 30
  bufferTimeBeforeMinutes?: number; // e.g. 10
  bufferTimeAfterMinutes?: number;  // e.g. 10
  workingHours: StaffWorkingHours;
  existingBookings: ExistingBooking[];
  slotIntervalMinutes?: number; // e.g. 15 or 30 (step between start times)
  timezone?: string; // default "Europe/Istanbul"
}

/**
 * Generates available appointment slots for a given day
 */
export function calculateAvailableSlots(options: SlotCalculationOptions): TimeSlot[] {
  const {
    date,
    durationMinutes,
    bufferTimeBeforeMinutes = 0,
    bufferTimeAfterMinutes = 0,
    workingHours,
    existingBookings,
    slotIntervalMinutes = 30,
    timezone = "Europe/Istanbul",
  } = options;

  // 1. If staff/business is off on this day, return empty
  if (workingHours.isOffDay) {
    return [];
  }

  const slots: TimeSlot[] = [];

  // Parse working hours (e.g. "09:00" to "18:00")
  const [startHour, startMinute] = workingHours.startTime.split(":").map(Number);
  const [endHour, endMinute] = workingHours.endTime.split(":").map(Number);

  // Parse break hours if applicable (e.g. "12:30" to "13:30")
  let breakStartMinutes = -1;
  let breakEndMinutes = -1;
  if (workingHours.breakStartTime && workingHours.breakEndTime) {
    const [bsh, bsm] = workingHours.breakStartTime.split(":").map(Number);
    const [beh, bem] = workingHours.breakEndTime.split(":").map(Number);
    breakStartMinutes = bsh * 60 + bsm;
    breakEndMinutes = beh * 60 + bem;
  }

  const workStartTotalMinutes = startHour * 60 + startMinute;
  const workEndTotalMinutes = endHour * 60 + endMinute;

  // Active bookings in timestamps (filter out cancelled)
  const activeBookings = existingBookings
    .filter((b) => b.status !== "CANCELLED" && b.status !== "cancelled")
    .map((b) => ({
      start: new Date(b.startUtc).getTime(),
      end: new Date(b.endUtc).getTime(),
    }));

  const now = Date.now();

  // Iterate in step intervals
  for (
    let currentMinutes = workStartTotalMinutes;
    currentMinutes + durationMinutes <= workEndTotalMinutes;
    currentMinutes += slotIntervalMinutes
  ) {
    const slotEndMinutes = currentMinutes + durationMinutes;

    // Check if slot overlaps with staff break
    const isInBreak =
      breakStartMinutes !== -1 &&
      breakEndMinutes !== -1 &&
      currentMinutes < breakEndMinutes &&
      slotEndMinutes > breakStartMinutes;

    const hourStr = String(Math.floor(currentMinutes / 60)).padStart(2, "0");
    const minStr = String(currentMinutes % 60).padStart(2, "0");
    const displayTime = `${hourStr}:${minStr}`;

    // Construct local date time string in Europe/Istanbul (+03:00)
    // Note: Turkey operates on UTC+3 fixed timezone without daylight saving
    const localIsoString = `${date}T${displayTime}:00+03:00`;
    const slotStartDate = new Date(localIsoString);
    const slotEndDate = new Date(slotStartDate.getTime() + durationMinutes * 60000);

    const slotStartWithBuffer = slotStartDate.getTime() - bufferTimeBeforeMinutes * 60000;
    const slotEndWithBuffer = slotEndDate.getTime() + bufferTimeAfterMinutes * 60000;

    // Check if in the past
    const isPast = slotStartDate.getTime() <= now;

    // Check overlap with existing appointments
    const hasOverlap = activeBookings.some(
      (b) => slotStartWithBuffer < b.end && slotEndWithBuffer > b.start
    );

    let isAvailable = true;
    let reasonIfNotAvailable: string | undefined;

    if (isPast) {
      isAvailable = false;
      reasonIfNotAvailable = "Geçmiş zaman";
    } else if (isInBreak) {
      isAvailable = false;
      reasonIfNotAvailable = "Öğle / Mola arası";
    } else if (hasOverlap) {
      isAvailable = false;
      reasonIfNotAvailable = "Dolu / Rezerve";
    }

    slots.push({
      startUtc: slotStartDate.toISOString(),
      endUtc: slotEndDate.toISOString(),
      displayTime,
      isAvailable,
      reasonIfNotAvailable,
    });
  }

  return slots;
}
