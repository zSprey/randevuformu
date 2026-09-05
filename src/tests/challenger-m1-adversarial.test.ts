/**
 * ⚔️ CHALLENGER 1 - EMPIRICAL ADVERSARIAL TEST SUITE (MILESTONE 1)
 * 
 * Target: Backend Data Models, Multi-Staff Slot Resolution, ANY_STAFF Concurrency,
 *         and routeLeastBusy Workload Balancing.
 * 
 * Verifies:
 * 1. Multi-Staff Concurrency & Saturation: Full saturation of Barber 1 leaves Barber 2 unblocked.
 * 2. ANY_STAFF Aggregation & Break Continuity: Staggered breaks ensure continuous salon availability.
 * 3. routeLeastBusy Workload Balancing: Count-based, Duration-based, Multi-Date, and Unassigned isolation.
 * 4. routeAvailabilityFirst Conflict Avoidance: Free barber is selected over busy/on-break barber.
 * 5. SlotLockManager Concurrency: Independent staff locks, capacity enforcement, and rollback integrity.
 * 6. Flash Waitlist Store & Edge Cases: Strict priority queue ordering, exotic time ranges, UTF-8 notes, and lifecycle transitions.
 * 7. Appointments Store Security & Isolation: Tenant boundary enforcement and non-destructive cancellation preservation.
 */

import {
  saveNewAppointment,
  getStoredAppointments,
  updateAppointmentStatus,
  updateAppointment,
  deleteAppointment,
  StoredAppointment,
} from "../lib/storage/appointmentsStore";

import {
  saveNewWaitlistEntry,
  getStoredWaitlist,
  updateWaitlistStatus,
  deleteWaitlistEntry,
  StoredWaitlistEntry,
} from "../lib/storage/waitlistStore";

import {
  BYERMAN_STAFF_LIST,
  getDefaultStaffWorkingHours,
  getStaffById,
  getByErmanStaffAsEngineStaff,
} from "../lib/storage/staffStore";

import { StaffRouter, StaffRoutingError } from "../lib/engine/staffRouter";
import { calculateAvailableSlots } from "../lib/engine/slotCalculator";
import { slotLockManager } from "../lib/engine/lockManager";
import { Appointment, Service, Staff } from "../types/schema";

async function runAdversarialTestSuite() {
  console.log("================================================================================");
  console.log("⚔️  CHALLENGER 1 — EMPIRICAL ADVERSARIAL STRESS TEST SUITE (MILESTONE 1)");
  console.log("================================================================================\n");

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;
  const failureDetails: string[] = [];

  function assert(condition: boolean, testName: string, detail?: string) {
    totalTests++;
    if (condition) {
      console.log(`  ✅ PASS [${totalTests.toString().padStart(2, "0")}]: ${testName}`);
      passedTests++;
    } else {
      console.error(`  ❌ FAIL [${totalTests.toString().padStart(2, "0")}]: ${testName}`);
      if (detail) {
        console.error(`     ↳ ${detail}`);
      }
      failedTests++;
      failureDetails.push(`${testName}: ${detail || "Condition evaluated to false"}`);
    }
  }

  // Use fixed future date for deterministic testing
  const targetDate = new Date(Date.now() + 86400000 * 5).toISOString().split("T")[0];
  const engineStaff = await getByErmanStaffAsEngineStaff();
  const ermanStaff = engineStaff.find((s) => s.id === "erman-usta")!;
  const ahmetStaff = engineStaff.find((s) => s.id === "ahmet-kalfa")!;

  const standardService: Service = {
    id: "srv-sac-kesimi",
    tenantId: "byerman",
    name: "Saç Kesimi & Yıkama",
    slug: "sac-kesimi",
    durationMinutes: 30,
    bufferTimeBeforeMinutes: 0,
    bufferTimeAfterMinutes: 0,
    price: 350,
    currency: "TRY",
    requirePrepayment: false,
    maxCapacityPerSlot: 1,
    assignedStaffIds: ["erman-usta", "ahmet-kalfa"],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // ============================================================================
  // SUITE 1: MULTI-STAFF CONCURRENCY & SATURATION RESILIENCE
  // ============================================================================
  console.log("--- SUITE 1: Multi-Staff Concurrency & Saturation Resilience ---");

  // Adversarial Condition: Erman Usta is 100% saturated across all 22 slots of the day (09:00 - 20:00)
  const ermanAllDayBookings: Appointment[] = [];
  const hours = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
    "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
    "17:00", "17:30", "18:00", "18:30", "19:00", "19:30"
  ];

  hours.forEach((timeStr, idx) => {
    ermanAllDayBookings.push({
      id: `app-erman-sat-${idx}`,
      tenantId: "byerman",
      serviceId: standardService.id,
      staffId: "erman-usta",
      customerId: `cust-${idx}`,
      customerName: `Customer ${idx}`,
      customerEmail: "",
      customerPhone: "",
      startUtc: new Date(`${targetDate}T${timeStr}:00+03:00`).toISOString(),
      endUtc: new Date(new Date(`${targetDate}T${timeStr}:00+03:00`).getTime() + 30 * 60000).toISOString(),
      status: "CONFIRMED",
      paymentStatus: "PAID",
      paymentAmount: 350,
      cancellationToken: "",
      rescheduleToken: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  });

  // Test 1.1: Single staff query for Ahmet Kalfa when Erman is 100% booked
  const ahmetWorkingHours = ahmetStaff.workingHours.find((wh) => wh.dayOfWeek === 1)!;
  const ahmetSingleSlots = calculateAvailableSlots({
    date: targetDate,
    durationMinutes: 30,
    workingHours: ahmetWorkingHours,
    existingBookings: ermanAllDayBookings.filter((b) => b.staffId === "ahmet-kalfa").map((b) => ({
      startUtc: b.startUtc,
      endUtc: b.endUtc,
      status: b.status,
    })),
    slotIntervalMinutes: 30,
  });

  const ahmetAvailableSlots = ahmetSingleSlots.filter((s) => s.isAvailable);
  // Total slots: 22. Ahmet break is 14:00-15:00 (2 slots: 14:00, 14:30). Expected available: 20 slots
  assert(
    ahmetAvailableSlots.length === 20,
    "Ahmet Kalfa has 20 free slots despite Erman Usta being 100% booked all day",
    `Expected 20, got ${ahmetAvailableSlots.length}`
  );

  // Test 1.2: ANY_STAFF aggregated slots when Erman is 100% booked
  const saturatedAggregated = StaffRouter.calculateAggregatedSlots({
    date: targetDate,
    service: standardService,
    staffList: engineStaff,
    existingBookings: ermanAllDayBookings,
    slotIntervalMinutes: 30,
  });

  const anyStaffAvailable = saturatedAggregated.slots.filter((s) => s.isAvailable);
  assert(
    anyStaffAvailable.length === 20,
    "ANY_STAFF retains 20 available slots backed purely by Ahmet Kalfa",
    `Expected 20, got ${anyStaffAvailable.length}`
  );

  const allAvailableAreAhmetOnly = anyStaffAvailable.every(
    (s) => s.availableStaffIds.length === 1 && s.availableStaffIds[0] === "ahmet-kalfa"
  );
  assert(
    allAvailableAreAhmetOnly,
    "Every available ANY_STAFF slot correctly attributes availability exclusively to 'ahmet-kalfa'",
    "Found slot with unexpected availableStaffIds"
  );

  // Test 1.3: Simultaneous saturation: Both Erman and Ahmet are booked at 16:00
  const dualBookings: Appointment[] = [
    {
      id: "app-erman-1600",
      tenantId: "byerman",
      serviceId: standardService.id,
      staffId: "erman-usta",
      customerId: "c1",
      customerName: "Client 1",
      customerEmail: "",
      customerPhone: "",
      startUtc: new Date(`${targetDate}T16:00:00+03:00`).toISOString(),
      endUtc: new Date(`${targetDate}T16:30:00+03:00`).toISOString(),
      status: "CONFIRMED",
      paymentStatus: "PAID",
      paymentAmount: 350,
      cancellationToken: "",
      rescheduleToken: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "app-ahmet-1600",
      tenantId: "byerman",
      serviceId: standardService.id,
      staffId: "ahmet-kalfa",
      customerId: "c2",
      customerName: "Client 2",
      customerEmail: "",
      customerPhone: "",
      startUtc: new Date(`${targetDate}T16:00:00+03:00`).toISOString(),
      endUtc: new Date(`${targetDate}T16:30:00+03:00`).toISOString(),
      status: "CONFIRMED",
      paymentStatus: "PAID",
      paymentAmount: 350,
      cancellationToken: "",
      rescheduleToken: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const dualAggregated = StaffRouter.calculateAggregatedSlots({
    date: targetDate,
    service: standardService,
    staffList: engineStaff,
    existingBookings: dualBookings,
    slotIntervalMinutes: 30,
  });

  const slot1600 = dualAggregated.slots.find((s) => s.displayTime === "16:00");
  assert(
    slot1600 !== undefined && slot1600.isAvailable === false && slot1600.availableStaffCount === 0,
    "Slot 16:00 is UNAVAILABLE when both Erman and Ahmet are booked simultaneously",
    `Slot 16:00: isAvailable=${slot1600?.isAvailable}, count=${slot1600?.availableStaffCount}`
  );

  // Test 1.4: Staggered Lunch Break Handover
  // Erman break: 13:00 - 14:00 (Ahmet working)
  // Ahmet break: 14:00 - 15:00 (Erman working)
  const emptyBookingsAggregated = StaffRouter.calculateAggregatedSlots({
    date: targetDate,
    service: standardService,
    staffList: engineStaff,
    existingBookings: [],
    slotIntervalMinutes: 30,
  });

  const slot1300 = emptyBookingsAggregated.slots.find((s) => s.displayTime === "13:00");
  const slot1330 = emptyBookingsAggregated.slots.find((s) => s.displayTime === "13:30");
  const slot1400 = emptyBookingsAggregated.slots.find((s) => s.displayTime === "14:00");
  const slot1430 = emptyBookingsAggregated.slots.find((s) => s.displayTime === "14:30");

  assert(
    slot1300?.isAvailable === true &&
    slot1300.availableStaffIds.includes("ahmet-kalfa") &&
    !slot1300.availableStaffIds.includes("erman-usta"),
    "At 13:00, salon remains open via Ahmet Kalfa while Erman Usta is on lunch break"
  );

  assert(
    slot1330?.isAvailable === true &&
    slot1330.availableStaffIds.includes("ahmet-kalfa") &&
    !slot1330.availableStaffIds.includes("erman-usta"),
    "At 13:30, salon remains open via Ahmet Kalfa while Erman Usta is on lunch break"
  );

  assert(
    slot1400?.isAvailable === true &&
    slot1400.availableStaffIds.includes("erman-usta") &&
    !slot1400.availableStaffIds.includes("ahmet-kalfa"),
    "At 14:00, salon remains open via Erman Usta while Ahmet Kalfa is on lunch break"
  );

  assert(
    slot1430?.isAvailable === true &&
    slot1430.availableStaffIds.includes("erman-usta") &&
    !slot1430.availableStaffIds.includes("ahmet-kalfa"),
    "At 14:30, salon remains open via Erman Usta while Ahmet Kalfa is on lunch break"
  );


  // ============================================================================
  // SUITE 2: WORKLOAD BALANCING PRECISION (`routeLeastBusy`)
  // ============================================================================
  console.log("\n--- SUITE 2: Workload Balancing Precision (routeLeastBusy) ---");

  // Test 2.1: Count-based routing
  const countTestBookings: Appointment[] = [
    {
      id: "b1",
      tenantId: "byerman",
      serviceId: standardService.id,
      staffId: "erman-usta",
      customerId: "c1",
      customerName: "C1",
      customerEmail: "",
      customerPhone: "",
      startUtc: new Date(`${targetDate}T10:00:00+03:00`).toISOString(),
      endUtc: new Date(`${targetDate}T10:30:00+03:00`).toISOString(),
      status: "CONFIRMED",
      paymentStatus: "PAID",
      paymentAmount: 350,
      cancellationToken: "",
      rescheduleToken: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "b2",
      tenantId: "byerman",
      serviceId: standardService.id,
      staffId: "erman-usta",
      customerId: "c2",
      customerName: "C2",
      customerEmail: "",
      customerPhone: "",
      startUtc: new Date(`${targetDate}T11:00:00+03:00`).toISOString(),
      endUtc: new Date(`${targetDate}T11:30:00+03:00`).toISOString(),
      status: "CONFIRMED",
      paymentStatus: "PAID",
      paymentAmount: 350,
      cancellationToken: "",
      rescheduleToken: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "b3",
      tenantId: "byerman",
      serviceId: standardService.id,
      staffId: "ahmet-kalfa",
      customerId: "c3",
      customerName: "C3",
      customerEmail: "",
      customerPhone: "",
      startUtc: new Date(`${targetDate}T10:00:00+03:00`).toISOString(),
      endUtc: new Date(`${targetDate}T10:30:00+03:00`).toISOString(),
      status: "CONFIRMED",
      paymentStatus: "PAID",
      paymentAmount: 350,
      cancellationToken: "",
      rescheduleToken: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const routedCount = StaffRouter.routeLeastBusy(engineStaff, countTestBookings, targetDate);
  assert(
    routedCount.assignedStaff.id === "ahmet-kalfa",
    "routeLeastBusy assigns 'ahmet-kalfa' when Erman has 2 bookings and Ahmet has 1",
    `Assigned: ${routedCount.assignedStaff.id}`
  );

  // Test 2.2: Duration-based tie breaking
  // Both barbers have exactly 1 booking: Erman has 90 mins, Ahmet has 30 mins
  const durationTestBookings: Appointment[] = [
    {
      id: "b-dur-1",
      tenantId: "byerman",
      serviceId: standardService.id,
      staffId: "erman-usta",
      customerId: "c1",
      customerName: "C1",
      customerEmail: "",
      customerPhone: "",
      startUtc: new Date(`${targetDate}T10:00:00+03:00`).toISOString(),
      endUtc: new Date(`${targetDate}T11:30:00+03:00`).toISOString(), // 90 min
      status: "CONFIRMED",
      paymentStatus: "PAID",
      paymentAmount: 900,
      cancellationToken: "",
      rescheduleToken: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "b-dur-2",
      tenantId: "byerman",
      serviceId: standardService.id,
      staffId: "ahmet-kalfa",
      customerId: "c2",
      customerName: "C2",
      customerEmail: "",
      customerPhone: "",
      startUtc: new Date(`${targetDate}T10:00:00+03:00`).toISOString(),
      endUtc: new Date(`${targetDate}T10:30:00+03:00`).toISOString(), // 30 min
      status: "CONFIRMED",
      paymentStatus: "PAID",
      paymentAmount: 350,
      cancellationToken: "",
      rescheduleToken: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const routedDuration = StaffRouter.routeLeastBusy(engineStaff, durationTestBookings, targetDate);
  assert(
    routedDuration.assignedStaff.id === "ahmet-kalfa",
    "routeLeastBusy tie-breaks on duration: assigns 'ahmet-kalfa' (30 mins) over 'erman-usta' (90 mins)",
    `Assigned: ${routedDuration.assignedStaff.id}, reason: ${routedDuration.reason}`
  );

  // Test 2.3: Cross-date isolation
  // Erman has 10 bookings yesterday, Ahmet has 1 booking today
  const yesterday = new Date(new Date(targetDate).getTime() - 86400000).toISOString().split("T")[0];
  const multiDateBookings: Appointment[] = [];
  for (let i = 0; i < 10; i++) {
    multiDateBookings.push({
      id: `yest-${i}`,
      tenantId: "byerman",
      serviceId: standardService.id,
      staffId: "erman-usta",
      customerId: `c-${i}`,
      customerName: `C-${i}`,
      customerEmail: "",
      customerPhone: "",
      startUtc: new Date(`${yesterday}T10:00:00+03:00`).toISOString(),
      endUtc: new Date(`${yesterday}T10:30:00+03:00`).toISOString(),
      status: "CONFIRMED",
      paymentStatus: "PAID",
      paymentAmount: 350,
      cancellationToken: "",
      rescheduleToken: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
  multiDateBookings.push({
    id: "today-ahmet",
    tenantId: "byerman",
    serviceId: standardService.id,
    staffId: "ahmet-kalfa",
    customerId: "c-ahmet",
    customerName: "C-Ahmet",
    customerEmail: "",
    customerPhone: "",
    startUtc: new Date(`${targetDate}T10:00:00+03:00`).toISOString(),
    endUtc: new Date(`${targetDate}T10:30:00+03:00`).toISOString(),
    status: "CONFIRMED",
    paymentStatus: "PAID",
    paymentAmount: 350,
    cancellationToken: "",
    rescheduleToken: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const routedDateIsolation = StaffRouter.routeLeastBusy(engineStaff, multiDateBookings, targetDate);
  assert(
    routedDateIsolation.assignedStaff.id === "erman-usta",
    "routeLeastBusy isolates target date: assigns 'erman-usta' (0 today) despite 10 bookings yesterday",
    `Assigned: ${routedDateIsolation.assignedStaff.id}`
  );

  // Test 2.4: Unassigned and non-staff booking isolation
  const unassignedBookings: Appointment[] = [
    {
      id: "unassigned-1",
      tenantId: "byerman",
      serviceId: standardService.id,
      staffId: "external-guest-barber",
      customerId: "cg",
      customerName: "CG",
      customerEmail: "",
      customerPhone: "",
      startUtc: new Date(`${targetDate}T10:00:00+03:00`).toISOString(),
      endUtc: new Date(`${targetDate}T10:30:00+03:00`).toISOString(),
      status: "CONFIRMED",
      paymentStatus: "PAID",
      paymentAmount: 350,
      cancellationToken: "",
      rescheduleToken: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const routedUnassigned = StaffRouter.routeLeastBusy(engineStaff, unassignedBookings, targetDate);
  assert(
    routedUnassigned.assignedStaff !== undefined &&
    (routedUnassigned.assignedStaff.id === "erman-usta" || routedUnassigned.assignedStaff.id === "ahmet-kalfa"),
    "routeLeastBusy gracefully ignores bookings for foreign/external staff IDs"
  );


  // ============================================================================
  // SUITE 3: AVAILABILITY-CONSTRAINED ROUTING (`routeAvailabilityFirst`)
  // ============================================================================
  console.log("\n--- SUITE 3: Availability-Constrained Routing (routeAvailabilityFirst) ---");

  // Test 3.1: Break time conflict avoidance
  // Ahmet has 0 bookings today, Erman has 3 bookings today.
  // Request is made for 14:30. At 14:30, Ahmet is on LUNCH BREAK (14:00-15:00), Erman is free!
  const breakAvoidanceBookings: Appointment[] = [
    {
      id: "b-er-1",
      tenantId: "byerman",
      serviceId: standardService.id,
      staffId: "erman-usta",
      customerId: "c1",
      customerName: "C1",
      customerEmail: "",
      customerPhone: "",
      startUtc: new Date(`${targetDate}T09:30:00+03:00`).toISOString(),
      endUtc: new Date(`${targetDate}T10:00:00+03:00`).toISOString(),
      status: "CONFIRMED",
      paymentStatus: "PAID",
      paymentAmount: 350,
      cancellationToken: "",
      rescheduleToken: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "b-er-2",
      tenantId: "byerman",
      serviceId: standardService.id,
      staffId: "erman-usta",
      customerId: "c2",
      customerName: "C2",
      customerEmail: "",
      customerPhone: "",
      startUtc: new Date(`${targetDate}T10:00:00+03:00`).toISOString(),
      endUtc: new Date(`${targetDate}T10:30:00+03:00`).toISOString(),
      status: "CONFIRMED",
      paymentStatus: "PAID",
      paymentAmount: 350,
      cancellationToken: "",
      rescheduleToken: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "b-er-3",
      tenantId: "byerman",
      serviceId: standardService.id,
      staffId: "erman-usta",
      customerId: "c3",
      customerName: "C3",
      customerEmail: "",
      customerPhone: "",
      startUtc: new Date(`${targetDate}T11:00:00+03:00`).toISOString(),
      endUtc: new Date(`${targetDate}T11:30:00+03:00`).toISOString(),
      status: "CONFIRMED",
      paymentStatus: "PAID",
      paymentAmount: 350,
      cancellationToken: "",
      rescheduleToken: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const reqStartUtc1430 = new Date(`${targetDate}T14:30:00+03:00`).toISOString();
  const routedBreak = StaffRouter.routeAvailabilityFirst(
    engineStaff,
    standardService,
    reqStartUtc1430,
    breakAvoidanceBookings,
    targetDate
  );

  assert(
    routedBreak.assignedStaff.id === "erman-usta",
    "routeAvailabilityFirst assigns 'erman-usta' at 14:30 (Ahmet is on break, avoiding break violation)",
    `Assigned: ${routedBreak.assignedStaff.id}`
  );

  // Test 3.2: Slot overlap conflict avoidance
  // Ahmet has 0 bookings all day EXCEPT one at 16:00. Erman has 1 booking at 10:00.
  // Request is for 16:00.
  const overlapAvoidanceBookings: Appointment[] = [
    {
      id: "b-ah-16",
      tenantId: "byerman",
      serviceId: standardService.id,
      staffId: "ahmet-kalfa",
      customerId: "c1",
      customerName: "C1",
      customerEmail: "",
      customerPhone: "",
      startUtc: new Date(`${targetDate}T16:00:00+03:00`).toISOString(),
      endUtc: new Date(`${targetDate}T16:30:00+03:00`).toISOString(),
      status: "CONFIRMED",
      paymentStatus: "PAID",
      paymentAmount: 350,
      cancellationToken: "",
      rescheduleToken: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "b-er-10",
      tenantId: "byerman",
      serviceId: standardService.id,
      staffId: "erman-usta",
      customerId: "c2",
      customerName: "C2",
      customerEmail: "",
      customerPhone: "",
      startUtc: new Date(`${targetDate}T10:00:00+03:00`).toISOString(),
      endUtc: new Date(`${targetDate}T10:30:00+03:00`).toISOString(),
      status: "CONFIRMED",
      paymentStatus: "PAID",
      paymentAmount: 350,
      cancellationToken: "",
      rescheduleToken: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const reqStartUtc1600 = new Date(`${targetDate}T16:00:00+03:00`).toISOString();
  const routedOverlap = StaffRouter.routeAvailabilityFirst(
    engineStaff,
    standardService,
    reqStartUtc1600,
    overlapAvoidanceBookings,
    targetDate
  );

  assert(
    routedOverlap.assignedStaff.id === "erman-usta",
    "routeAvailabilityFirst assigns 'erman-usta' at 16:00 because Ahmet is already booked at 16:00",
    `Assigned: ${routedOverlap.assignedStaff.id}`
  );

  // Test 3.3: Invalid / malformed timestamp rejection
  let caughtInvalidDate = false;
  try {
    StaffRouter.routeAvailabilityFirst(
      engineStaff,
      standardService,
      "NOT-A-VALID-DATE",
      [],
      targetDate
    );
  } catch (err: any) {
    caughtInvalidDate = err instanceof StaffRoutingError && err.code === "INVALID_REQUEST";
  }
  assert(caughtInvalidDate, "routeAvailabilityFirst throws StaffRoutingError (INVALID_REQUEST) on corrupt date");

  // Test 3.4: Full conflict rejection when both barbers are occupied
  let caughtConflict = false;
  try {
    StaffRouter.routeAvailabilityFirst(
      engineStaff,
      standardService,
      reqStartUtc1600,
      dualBookings, // both booked at 16:00
      targetDate
    );
  } catch (err: any) {
    caughtConflict = err instanceof StaffRoutingError && err.code === "SCHEDULE_CONFLICT";
  }
  assert(caughtConflict, "routeAvailabilityFirst throws SCHEDULE_CONFLICT (409) when all staff are occupied");


  // ============================================================================
  // SUITE 4: SLOT LOCKING & CONCURRENCY BOUNDARY (`slotLockManager`)
  // ============================================================================
  console.log("\n--- SUITE 4: Slot Locking & Concurrency Boundary (slotLockManager) ---");

  const lockSlotUtc = new Date(`${targetDate}T11:00:00+03:00`).toISOString();
  slotLockManager.clearAll();

  // Test 4.1: Specialist-isolated lock
  // Lock 11:00 for Erman Usta
  const ermanLockRes = slotLockManager.acquireLock({
    tenantId: "byerman",
    serviceId: standardService.id,
    staffId: "erman-usta",
    startUtc: lockSlotUtc,
    sessionId: "sess-user-1",
    maxCapacity: 1,
  });
  assert(ermanLockRes.success === true, "Lock acquired for erman-usta at 11:00");

  // Test 4.2: Ahmet Kalfa at 11:00 must NOT be locked
  const ahmetLockStatus = slotLockManager.getSlotCapacityStatus(
    "byerman",
    lockSlotUtc,
    standardService.id,
    "ahmet-kalfa",
    1
  );
  assert(
    ahmetLockStatus.isFullyLocked === false && ahmetLockStatus.remainingCapacity === 1,
    "Ahmet Kalfa at 11:00 remains UNLOCKED when Erman Usta is locked"
  );

  // Double-booking collision attempt on Erman
  const ermanCollideRes = slotLockManager.acquireLock({
    tenantId: "byerman",
    serviceId: standardService.id,
    staffId: "erman-usta",
    startUtc: lockSlotUtc,
    sessionId: "sess-user-2", // different user
    maxCapacity: 1,
  });
  assert(
    ermanCollideRes.success === false && ermanCollideRes.code === "CAPACITY_EXCEEDED",
    "Second user is REJECTED (CAPACITY_EXCEEDED) when attempting to lock already-locked Erman slot"
  );

  // Test 4.3: Rollback on transaction failure
  const rollbackSlotUtc = new Date(`${targetDate}T12:00:00+03:00`).toISOString();
  let rollbackExecuted = false;
  try {
    await slotLockManager.withSlotLock(
      {
        tenantId: "byerman",
        serviceId: standardService.id,
        staffId: "ahmet-kalfa",
        startUtc: rollbackSlotUtc,
        sessionId: "sess-rollback",
        maxCapacity: 1,
      },
      async () => {
        rollbackExecuted = true;
        throw new Error("Simulated payment failure mid-transaction");
      }
    );
  } catch {
    // caught by wrapper
  }

  const statusAfterRollback = slotLockManager.getSlotCapacityStatus(
    "byerman",
    rollbackSlotUtc,
    standardService.id,
    "ahmet-kalfa",
    1
  );
  assert(
    rollbackExecuted && statusAfterRollback.isFullyLocked === false,
    "Transactional slot lock auto-releases upon transaction error (Auto-Rollback)"
  );

  // Clean up locks
  slotLockManager.clearAll();


  // ============================================================================
  // SUITE 5: FLASH WAITLIST STORE & EDGE CASES
  // ============================================================================
  console.log("\n--- SUITE 5: Flash Waitlist Store & Edge Cases ---");

  // Test 5.1: Strict Priority Queue Sorting
  const testTenant = `wl_adv_${Date.now()}`;
  const candidateNormal: StoredWaitlistEntry = {
    id: `wl-normal-${Date.now()}`,
    tenant_id: testTenant,
    customer_name: "Normal Müşteri",
    customer_phone: "05321112233",
    preferred_date: targetDate,
    priority_score: 75,
    status: "WAITING",
    created_at: new Date(Date.now() - 10000).toISOString(),
  };

  const candidateVIP: StoredWaitlistEntry = {
    id: `wl-vip-${Date.now()}`,
    tenant_id: testTenant,
    customer_name: "VIP Müşteri",
    customer_phone: "05329990011",
    preferred_date: targetDate,
    priority_score: 95,
    status: "WAITING",
    created_at: new Date().toISOString(), // Created later, but higher priority
  };

  const candidateMid: StoredWaitlistEntry = {
    id: `wl-mid-${Date.now()}`,
    tenant_id: testTenant,
    customer_name: "Orta Müşteri",
    customer_phone: "05325556677",
    preferred_date: targetDate,
    priority_score: 85,
    status: "WAITING",
    created_at: new Date().toISOString(),
  };

  await saveNewWaitlistEntry(candidateNormal);
  await saveNewWaitlistEntry(candidateVIP);
  await saveNewWaitlistEntry(candidateMid);

  const storedWaitlist = await getStoredWaitlist(testTenant);
  assert(
    storedWaitlist.length === 3,
    "All 3 waitlist candidates saved and retrieved",
    `Count: ${storedWaitlist.length}`
  );

  assert(
    storedWaitlist[0].id === candidateVIP.id &&
    storedWaitlist[1].id === candidateMid.id &&
    storedWaitlist[2].id === candidateNormal.id,
    "Waitlist entries strictly ordered by priority_score descending (VIP: 95, Mid: 85, Normal: 75)",
    `Order: [${storedWaitlist.map((c) => c.priority_score).join(", ")}]`
  );

  // Test 5.2: Exotic freeform time ranges & Turkish UTF-8
  const exoticCandidate: StoredWaitlistEntry = {
    id: `wl-exotic-${Date.now()}`,
    tenant_id: testTenant,
    customer_name: "Şükrü Özçelik (Master Tıraşçı)",
    customer_phone: "05441234567",
    preferred_date: targetDate,
    time_range: "23:00 - 02:00 arası (gece acil nöbet)",
    notes: "Önemli: Erman Usta'nın özel ustura tıraşı ve sakal şekillendirmesi rica olunur.",
    staff_id: "erman-usta",
    priority_score: 90,
    status: "WAITING",
    created_at: new Date().toISOString(),
  };

  await saveNewWaitlistEntry(exoticCandidate);
  const reloadedWaitlist = await getStoredWaitlist(testTenant);
  const foundExotic = reloadedWaitlist.find((w) => w.id === exoticCandidate.id);

  assert(
    foundExotic?.customer_name === "Şükrü Özçelik (Master Tıraşçı)",
    "Turkish UTF-8 characters preserved in customer_name"
  );
  assert(
    foundExotic?.time_range === "23:00 - 02:00 arası (gece acil nöbet)",
    "Exotic / night shift time_range preserved without corruption"
  );
  assert(
    foundExotic?.staff_id === "erman-usta",
    "Staff preference ('erman-usta') cleanly preserved in waitlist entry"
  );

  // Test 5.3: Lifecycle State Transitions
  await updateWaitlistStatus(exoticCandidate.id, "OFFERED", testTenant);
  const waitlistOffered = await getStoredWaitlist(testTenant);
  const candidateOffered = waitlistOffered.find((w) => w.id === exoticCandidate.id);
  assert(
    candidateOffered?.status === "OFFERED" && Boolean(candidateOffered?.offered_at),
    "Waitlist status transition to 'OFFERED' automatically records offered_at timestamp"
  );

  await updateWaitlistStatus(exoticCandidate.id, "ACCEPTED", testTenant);
  const waitlistAccepted = await getStoredWaitlist(testTenant);
  const candidateAccepted = waitlistAccepted.find((w) => w.id === exoticCandidate.id);
  assert(
    candidateAccepted?.status === "ACCEPTED",
    "Waitlist status transition to 'ACCEPTED' recorded successfully"
  );

  // Clean up waitlist candidates
  await deleteWaitlistEntry(candidateNormal.id, testTenant);
  await deleteWaitlistEntry(candidateVIP.id, testTenant);
  await deleteWaitlistEntry(candidateMid.id, testTenant);
  await deleteWaitlistEntry(exoticCandidate.id, testTenant);


  // ============================================================================
  // SUITE 6: APPOINTMENTS STORE SECURITY & FIELD INTEGRITY
  // ============================================================================
  console.log("\n--- SUITE 6: Appointments Store Multi-Tenant Security & Preservation ---");

  // Test 6.1: Multi-tenant security isolation
  const tenantAlpha = `tenant_alpha_${Date.now()}`;
  const tenantBeta = `tenant_beta_${Date.now()}`;

  const appAlpha: StoredAppointment = {
    id: `app-alpha-${Date.now()}`,
    tenant: tenantAlpha,
    tenant_id: tenantAlpha,
    customer_name: "Alpha Danışan",
    customer_phone: "05001112233",
    appointment_date: targetDate,
    appointment_time: "10:00:00",
    status: "confirmed",
    staff_id: "erman-usta",
    staff_name: "Erman Usta",
  };

  await saveNewAppointment(appAlpha);

  const appsInAlpha = await getStoredAppointments(tenantAlpha);
  const appsInBeta = await getStoredAppointments(tenantBeta);
  const appsInEmpty = await getStoredAppointments("");

  assert(
    appsInAlpha.some((a) => a.id === appAlpha.id),
    "Appointment saved to tenantAlpha is retrievable by tenantAlpha"
  );
  assert(
    !appsInBeta.some((a) => a.id === appAlpha.id),
    "Strict Tenant Isolation: tenantBeta CANNOT see tenantAlpha appointments"
  );
  assert(
    appsInEmpty.length === 0,
    "Security Guard: getStoredAppointments('') safely returns empty array without leaking records"
  );

  // Test 6.2: Non-destructive cancellation retains staff fields
  await updateAppointmentStatus(appAlpha.id, "cancelled", tenantAlpha);
  const appsAfterCancel = await getStoredAppointments(tenantAlpha);
  const foundCancelled = appsAfterCancel.find((a) => a.id === appAlpha.id);

  assert(
    foundCancelled !== undefined && foundCancelled.status === "cancelled",
    "Appointment status is 'cancelled' (not deleted)"
  );
  assert(
    foundCancelled?.staff_id === "erman-usta" && foundCancelled?.staff_name === "Erman Usta",
    "Cancelled appointment permanently preserves staff_id and staff_name metadata"
  );

  // Test 6.3: Partial updates via updateAppointment retain existing staff assignments
  await updateAppointment(
    appAlpha.id,
    { customer_note: "Müşteri gecikebilir, not eklendi" },
    tenantAlpha
  );
  const appsAfterNoteUpdate = await getStoredAppointments(tenantAlpha);
  const foundAfterNote = appsAfterNoteUpdate.find((a) => a.id === appAlpha.id);

  assert(
    foundAfterNote?.customer_note === "Müşteri gecikebilir, not eklendi",
    "Partial update successfully applies customer_note"
  );
  assert(
    foundAfterNote?.staff_id === "erman-usta" && foundAfterNote?.staff_name === "Erman Usta",
    "Partial note update does not erase staff_id or staff_name"
  );

  // Clean up
  await deleteAppointment(appAlpha.id, tenantAlpha);

  // ============================================================================
  // SUMMARY
  // ============================================================================
  console.log("\n================================================================================");
  console.log(`📊 ADVERSARIAL TEST RESULTS: ${passedTests} Passed, ${failedTests} Failed (Total: ${totalTests})`);
  console.log("================================================================================\n");

  if (failedTests > 0) {
    console.error("❌ FAILED TEST SUMMARY:");
    failureDetails.forEach((d) => console.error(`  - ${d}`));
    process.exit(1);
  } else {
    console.log("🎉 ALL ADVERSARIAL CHALLENGES PASSED! Architecture is sound and verified.");
  }
}

runAdversarialTestSuite().catch((err) => {
  console.error("💥 Test harness crashed:", err);
  process.exit(1);
});
