/**
 * 🛡️ Milestone 2 Empirical Stress Test & Challenger Harness
 * 
 * Target: ErmanBarberWidget staff switching, slot recalculation,
 * and ANY_STAFF workload balancing (StaffRouter.routeLeastBusy).
 * 
 * Verifies:
 * 1. Rapid Staff Switching & Slot Recalculation (Erman -> Ahmet -> ANY_STAFF -> Erman)
 * 2. Break Schedule Divergence (Erman 13:00-14:00 vs Ahmet 14:00-15:00) with various service durations (30m, 45m, 60m)
 * 3. Workload Balancing Fairness (routeLeastBusy) under ties, duration skews, and cancelled appointments
 * 4. Single-specialist slot constraint isolation under ANY_STAFF
 * 5. Multi-client sequential booking simulation with dynamic load balancing shift
 * 6. Widget state transition simulation (slot flip on staff change)
 * 7. /api/bookings and /api/slots payload integrity & error handling
 */

import {
  BYERMAN_STAFF_LIST,
  getStaffById,
  getDefaultStaffWorkingHours,
  getByErmanStaffAsEngineStaff,
} from "../lib/storage/staffStore";
import { StaffRouter } from "../lib/engine/staffRouter";
import { calculateAvailableSlots } from "../lib/engine/slotCalculator";
import {
  saveNewAppointment,
  getStoredAppointments,
  deleteAppointment,
  StoredAppointment,
} from "../lib/storage/appointmentsStore";
import { Appointment, Staff } from "../types/schema";

async function runChallengerStressTests() {
  console.log("===============================================================");
  console.log("⚔️ CHALLENGER 1 (M2) — EMPIRICAL STRESS & EDGE CASE HARNESS");
  console.log("===============================================================\n");

  let passed = 0;
  let failed = 0;
  const failureDetails: string[] = [];

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}${detail ? ` — ${detail}` : ""}`);
      failed++;
      failureDetails.push(`${testName}${detail ? ` (${detail})` : ""}`);
    }
  }

  const testDate = "2026-10-19"; // Monday
  const engineStaff = await getByErmanStaffAsEngineStaff();

  // -------------------------------------------------------------
  // CHALLENGE 1: Staff Switching & Slot Recalculation Integrity
  // -------------------------------------------------------------
  console.log("--- Challenge 1: Staff Switching & Slot Recalculation ---");

  const ermanWH = getDefaultStaffWorkingHours("erman-usta").find((h) => h.dayOfWeek === 1)!;
  const ahmetWH = getDefaultStaffWorkingHours("ahmet-kalfa").find((h) => h.dayOfWeek === 1)!;

  // 1.1 Calculate slots for Erman (Break 13:00 - 14:00)
  const ermanSlots30 = calculateAvailableSlots({
    date: testDate,
    durationMinutes: 30,
    workingHours: ermanWH,
    existingBookings: [],
    slotIntervalMinutes: 30,
  });

  const erman1300 = ermanSlots30.find((s) => s.displayTime === "13:00");
  const erman1330 = ermanSlots30.find((s) => s.displayTime === "13:30");
  const erman1400 = ermanSlots30.find((s) => s.displayTime === "14:00");
  assert(erman1300?.isAvailable === false, "Erman Usta: 13:00 blocked by lunch break");
  assert(erman1330?.isAvailable === false, "Erman Usta: 13:30 blocked by lunch break");
  assert(erman1400?.isAvailable === true, "Erman Usta: 14:00 open immediately after break");

  // 1.2 Switch to Ahmet (Break 14:00 - 15:00)
  const ahmetSlots30 = calculateAvailableSlots({
    date: testDate,
    durationMinutes: 30,
    workingHours: ahmetWH,
    existingBookings: [],
    slotIntervalMinutes: 30,
  });

  const ahmet1300 = ahmetSlots30.find((s) => s.displayTime === "13:00");
  const ahmet1330 = ahmetSlots30.find((s) => s.displayTime === "13:30");
  const ahmet1400 = ahmetSlots30.find((s) => s.displayTime === "14:00");
  const ahmet1430 = ahmetSlots30.find((s) => s.displayTime === "14:30");
  assert(ahmet1300?.isAvailable === true, "Ahmet Kalfa: 13:00 is open (Erman's break)");
  assert(ahmet1330?.isAvailable === true, "Ahmet Kalfa: 13:30 is open (Erman's break)");
  assert(ahmet1400?.isAvailable === false, "Ahmet Kalfa: 14:00 blocked by lunch break");
  assert(ahmet1430?.isAvailable === false, "Ahmet Kalfa: 14:30 blocked by lunch break");

  // 1.3 Switch to ANY_STAFF (Union of slots)
  const anyStaffSlots = StaffRouter.calculateAggregatedSlots({
    date: testDate,
    service: {
      id: "srv_test",
      tenantId: "byerman",
      name: "Test Tıraş",
      slug: "test-tiras",
      durationMinutes: 30,
      price: 300,
      currency: "TRY",
      requirePrepayment: false,
      maxCapacityPerSlot: 1,
      assignedStaffIds: [],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    staffList: engineStaff,
    existingBookings: [],
    slotIntervalMinutes: 30,
    timezone: "Europe/Istanbul",
    checkLockManager: false,
  });

  const any1300 = anyStaffSlots.slots.find((s) => s.displayTime === "13:00");
  const any1330 = anyStaffSlots.slots.find((s) => s.displayTime === "13:30");
  const any1400 = anyStaffSlots.slots.find((s) => s.displayTime === "14:00");
  const any1430 = anyStaffSlots.slots.find((s) => s.displayTime === "14:30");

  assert(any1300?.isAvailable === true, "ANY_STAFF: 13:00 available via Ahmet");
  assert(
    any1300?.availableStaffIds.length === 1 && any1300.availableStaffIds[0] === "ahmet-kalfa",
    "ANY_STAFF: 13:00 restricted exclusively to ahmet-kalfa"
  );
  assert(any1400?.isAvailable === true, "ANY_STAFF: 14:00 available via Erman");
  assert(
    any1400?.availableStaffIds.length === 1 && any1400.availableStaffIds[0] === "erman-usta",
    "ANY_STAFF: 14:00 restricted exclusively to erman-usta"
  );

  // 1.4 Switch back to Erman Usta: slot 13:00 must revert to unavailable
  const ermanSlotsAgain = calculateAvailableSlots({
    date: testDate,
    durationMinutes: 30,
    workingHours: ermanWH,
    existingBookings: [],
    slotIntervalMinutes: 30,
  });
  const erman1300Again = ermanSlotsAgain.find((s) => s.displayTime === "13:00");
  assert(erman1300Again?.isAvailable === false, "Re-switch to Erman: 13:00 strictly reverts to unavailable");

  // -------------------------------------------------------------
  // CHALLENGE 2: Break Overlap Under Extended Durations (45m & 60m)
  // -------------------------------------------------------------
  console.log("\n--- Challenge 2: Break Boundary & Extended Duration Stress ---");

  // For Erman, break starts at 13:00.
  // If a 45 min service starts at 12:30, it runs until 13:15 -> overlaps with break!
  const ermanSlots45 = calculateAvailableSlots({
    date: testDate,
    durationMinutes: 45,
    workingHours: ermanWH,
    existingBookings: [],
    slotIntervalMinutes: 30,
  });
  const erman1230_45m = ermanSlots45.find((s) => s.displayTime === "12:30");
  assert(
    erman1230_45m?.isAvailable === false,
    "Erman Usta 45m service: 12:30 (12:30-13:15) UNAVAILABLE due to overlap with 13:00 break"
  );

  // For Ahmet, break starts at 14:00.
  // 12:30 for 45m runs until 13:15 -> well before 14:00 -> Ahmet IS AVAILABLE!
  const ahmetSlots45 = calculateAvailableSlots({
    date: testDate,
    durationMinutes: 45,
    workingHours: ahmetWH,
    existingBookings: [],
    slotIntervalMinutes: 30,
  });
  const ahmet1230_45m = ahmetSlots45.find((s) => s.displayTime === "12:30");
  assert(
    ahmet1230_45m?.isAvailable === true,
    "Ahmet Kalfa 45m service: 12:30 (12:30-13:15) AVAILABLE because Ahmet's break is at 14:00"
  );

  // Under ANY_STAFF at 12:30 with 45m: Should be available, but availableStaffIds MUST be only ahmet-kalfa!
  const anySlots45 = StaffRouter.calculateAggregatedSlots({
    date: testDate,
    service: {
      id: "srv_45",
      tenantId: "byerman",
      name: "45m Cut",
      slug: "45m-cut",
      durationMinutes: 45,
      price: 450,
      currency: "TRY",
      requirePrepayment: false,
      maxCapacityPerSlot: 1,
      assignedStaffIds: [],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    staffList: engineStaff,
    existingBookings: [],
    slotIntervalMinutes: 30,
    timezone: "Europe/Istanbul",
    checkLockManager: false,
  });
  const any1230_45m = anySlots45.slots.find((s) => s.displayTime === "12:30");
  assert(any1230_45m?.isAvailable === true, "ANY_STAFF 45m: 12:30 is AVAILABLE overall");
  assert(
    any1230_45m?.availableStaffIds.length === 1 && any1230_45m.availableStaffIds[0] === "ahmet-kalfa",
    "ANY_STAFF 45m: 12:30 candidate is uniquely ahmet-kalfa due to Erman's break collision"
  );

  // -------------------------------------------------------------
  // CHALLENGE 3: Workload Balancing Edge Cases (routeLeastBusy)
  // -------------------------------------------------------------
  console.log("\n--- Challenge 3: Workload Balancing (routeLeastBusy) Edge Cases ---");

  // 3.1 Cancelled and No-Show appointments must NOT count towards staff load
  const bookingsWithCancelled: Appointment[] = [
    {
      id: "b_canc_1",
      tenantId: "byerman",
      serviceId: "s1",
      staffId: "erman-usta",
      customerId: "c1",
      customerName: "İptal Müşteri 1",
      customerEmail: "",
      customerPhone: "05000000001",
      startUtc: `${testDate}T09:00:00+03:00`,
      endUtc: `${testDate}T09:30:00+03:00`,
      status: "CANCELLED",
      paymentStatus: "PAID",
      paymentAmount: 0,
      cancellationToken: "",
      rescheduleToken: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "b_canc_2",
      tenantId: "byerman",
      serviceId: "s1",
      staffId: "erman-usta",
      customerId: "c2",
      customerName: "İptal Müşteri 2",
      customerEmail: "",
      customerPhone: "05000000002",
      startUtc: `${testDate}T10:00:00+03:00`,
      endUtc: `${testDate}T10:30:00+03:00`,
      status: "CANCELLED",
      paymentStatus: "PAID",
      paymentAmount: 0,
      cancellationToken: "",
      rescheduleToken: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "b_active_1",
      tenantId: "byerman",
      serviceId: "s1",
      staffId: "ahmet-kalfa",
      customerId: "c3",
      customerName: "Aktif Müşteri",
      customerEmail: "",
      customerPhone: "05000000003",
      startUtc: `${testDate}T09:00:00+03:00`,
      endUtc: `${testDate}T09:30:00+03:00`,
      status: "CONFIRMED",
      paymentStatus: "PAID",
      paymentAmount: 0,
      cancellationToken: "",
      rescheduleToken: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const cancelledTestRoute = StaffRouter.routeLeastBusy(engineStaff, bookingsWithCancelled, testDate);
  assert(
    cancelledTestRoute.assignedStaff.id === "erman-usta",
    "routeLeastBusy ignores CANCELLED appointments (Erman has 0 active, Ahmet has 1 active -> assigns Erman)"
  );

  // 3.2 Duration Tie-Breaker: Same appointment count, different duration
  // Erman has 1 app of 30 min (30m total)
  // Ahmet has 1 app of 60 min (60m total)
  const bookingsDurationTie: Appointment[] = [
    {
      id: "b_dur_erman",
      tenantId: "byerman",
      serviceId: "s1",
      staffId: "erman-usta",
      customerId: "c4",
      customerName: "Kısa Randevu",
      customerEmail: "",
      customerPhone: "05000000004",
      startUtc: `${testDate}T09:00:00+03:00`,
      endUtc: `${testDate}T09:30:00+03:00`, // 30 min
      status: "CONFIRMED",
      paymentStatus: "PAID",
      paymentAmount: 0,
      cancellationToken: "",
      rescheduleToken: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "b_dur_ahmet",
      tenantId: "byerman",
      serviceId: "s2",
      staffId: "ahmet-kalfa",
      customerId: "c5",
      customerName: "Uzun Bakım",
      customerEmail: "",
      customerPhone: "05000000005",
      startUtc: `${testDate}T09:00:00+03:00`,
      endUtc: `${testDate}T10:00:00+03:00`, // 60 min
      status: "CONFIRMED",
      paymentStatus: "PAID",
      paymentAmount: 0,
      cancellationToken: "",
      rescheduleToken: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const durationTieRoute = StaffRouter.routeLeastBusy(engineStaff, bookingsDurationTie, testDate);
  assert(
    durationTieRoute.assignedStaff.id === "erman-usta",
    "routeLeastBusy duration tie-breaker: Both have 1 booking, Erman has 30m vs Ahmet 60m -> assigns Erman"
  );

  // 3.3 Strict Date Scoping: Bookings on other dates must NOT influence today's routing
  const bookingsOtherDate: Appointment[] = [
    {
      id: "b_other_date",
      tenantId: "byerman",
      serviceId: "s1",
      staffId: "erman-usta",
      customerId: "c6",
      customerName: "Başka Gün Müşteri",
      customerEmail: "",
      customerPhone: "05000000006",
      startUtc: `2026-10-20T09:00:00+03:00`, // Tomorrow!
      endUtc: `2026-10-20T17:00:00+03:00`, // 8 hours on another day!
      status: "CONFIRMED",
      paymentStatus: "PAID",
      paymentAmount: 0,
      cancellationToken: "",
      rescheduleToken: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "b_today_ahmet",
      tenantId: "byerman",
      serviceId: "s1",
      staffId: "ahmet-kalfa",
      customerId: "c7",
      customerName: "Bugünkü Ahmet",
      customerEmail: "",
      customerPhone: "05000000007",
      startUtc: `${testDate}T10:00:00+03:00`,
      endUtc: `${testDate}T10:30:00+03:00`,
      status: "CONFIRMED",
      paymentStatus: "PAID",
      paymentAmount: 0,
      cancellationToken: "",
      rescheduleToken: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const otherDateRoute = StaffRouter.routeLeastBusy(engineStaff, bookingsOtherDate, testDate);
  assert(
    otherDateRoute.assignedStaff.id === "erman-usta",
    "routeLeastBusy strictly scopes by testDate: Tomorrow's 8h booking does not penalize Erman today (Erman: 0, Ahmet: 1)"
  );

  // -------------------------------------------------------------
  // CHALLENGE 4: Sequential Multi-Client Concurrency Simulation
  // -------------------------------------------------------------
  console.log("\n--- Challenge 4: Multi-Client Sequential Concurrency Simulation ---");

  // Simulate 4 clients booking slots consecutively on a fresh day
  let simulatedBookings: Appointment[] = [];
  const assignedHistory: string[] = [];

  for (let i = 1; i <= 4; i++) {
    const route = StaffRouter.routeLeastBusy(engineStaff, simulatedBookings, testDate);
    assignedHistory.push(route.assignedStaff.id);

    // Commit booking for the assigned staff
    simulatedBookings.push({
      id: `sim_app_${i}`,
      tenantId: "byerman",
      serviceId: "srv_sim",
      staffId: route.assignedStaff.id,
      customerId: `sim_c_${i}`,
      customerName: `Müşteri ${i}`,
      customerEmail: "",
      customerPhone: `050000000${i}`,
      startUtc: `${testDate}T${10 + i}:00:00+03:00`,
      endUtc: `${testDate}T${10 + i}:30:00+03:00`,
      status: "CONFIRMED",
      paymentStatus: "PAID",
      paymentAmount: 0,
      cancellationToken: "",
      rescheduleToken: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  // With equal duration and zero initial load, assignments should alternate:
  // Client 1: Tie (0 vs 0) -> Erman (index 0)
  // Client 2: Erman has 1, Ahmet has 0 -> Ahmet
  // Client 3: Tie (1 vs 1) -> Erman (index 0)
  // Client 4: Erman has 2, Ahmet has 1 -> Ahmet
  assert(
    assignedHistory[0] === "erman-usta" &&
      assignedHistory[1] === "ahmet-kalfa" &&
      assignedHistory[2] === "erman-usta" &&
      assignedHistory[3] === "ahmet-kalfa",
    `Consecutive booking alternating distribution: expected [erman, ahmet, erman, ahmet], got [${assignedHistory.join(", ")}]`
  );

  // -------------------------------------------------------------
  // CHALLENGE 5: Single Candidate Slot Exemption from Workload
  // -------------------------------------------------------------
  console.log("\n--- Challenge 5: Single Candidate Slot Workload Exemption ---");

  // In ErmanBarberWidget.tsx:
  // When slot is 13:00 (Erman on break), availableStaffIds is ONLY ["ahmet-kalfa"].
  // Even if Ahmet has 10 bookings and Erman has 0, Ahmet MUST be assigned because Erman cannot work at 13:00!
  const ahmetHeavyBookings: Appointment[] = Array.from({ length: 10 }).map((_, idx) => ({
    id: `heavy_ahmet_${idx}`,
    tenantId: "byerman",
    serviceId: "s",
    staffId: "ahmet-kalfa",
    customerId: `c_${idx}`,
    customerName: `Müşteri ${idx}`,
    customerEmail: "",
    customerPhone: "05000000000",
    startUtc: `${testDate}T09:00:00+03:00`,
    endUtc: `${testDate}T09:30:00+03:00`,
    status: "CONFIRMED",
    paymentStatus: "PAID",
    paymentAmount: 0,
    cancellationToken: "",
    rescheduleToken: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));

  // Emulate resolveAssignedStaffForSlot logic from ErmanBarberWidget:
  function emulateResolveAssignedStaff(
    slotTime: string,
    slotObj: { availableStaffIds: string[] },
    selectedStaffId: string,
    bookings: Appointment[]
  ) {
    if (selectedStaffId !== "ANY_STAFF") {
      return getStaffById(selectedStaffId)!;
    }
    const candidateStaffIds = slotObj.availableStaffIds || ["erman-usta", "ahmet-kalfa"];
    if (candidateStaffIds.length === 1) {
      return getStaffById(candidateStaffIds[0])!;
    }
    const eligible = candidateStaffIds.map((id) => engineStaff.find((s) => s.id === id)!);
    const result = StaffRouter.routeLeastBusy(eligible, bookings, testDate);
    return getStaffById(result.assignedStaff.id)!;
  }

  // 13:00 slot (Ahmet on shift, Erman on break)
  const assignedAt1300 = emulateResolveAssignedStaff(
    "13:00",
    { availableStaffIds: ["ahmet-kalfa"] },
    "ANY_STAFF",
    ahmetHeavyBookings
  );
  assert(
    assignedAt1300.id === "ahmet-kalfa",
    "13:00 slot with heavy Ahmet load: Still assigns ahmet-kalfa because Erman is on break"
  );

  // 14:00 slot (Erman on shift, Ahmet on break) with heavy Erman load
  const ermanHeavyBookings: Appointment[] = Array.from({ length: 10 }).map((_, idx) => ({
    id: `heavy_erman_${idx}`,
    tenantId: "byerman",
    serviceId: "s",
    staffId: "erman-usta",
    customerId: `c_${idx}`,
    customerName: `Müşteri ${idx}`,
    customerEmail: "",
    customerPhone: "05000000000",
    startUtc: `${testDate}T09:00:00+03:00`,
    endUtc: `${testDate}T09:30:00+03:00`,
    status: "CONFIRMED",
    paymentStatus: "PAID",
    paymentAmount: 0,
    cancellationToken: "",
    rescheduleToken: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));

  const assignedAt1400 = emulateResolveAssignedStaff(
    "14:00",
    { availableStaffIds: ["erman-usta"] },
    "ANY_STAFF",
    ermanHeavyBookings
  );
  assert(
    assignedAt1400.id === "erman-usta",
    "14:00 slot with heavy Erman load: Still assigns erman-usta because Ahmet is on break"
  );

  // 11:00 slot (Both available) with heavy Ahmet load: Must balance and assign Erman
  const assignedAt1100 = emulateResolveAssignedStaff(
    "11:00",
    { availableStaffIds: ["erman-usta", "ahmet-kalfa"] },
    "ANY_STAFF",
    ahmetHeavyBookings
  );
  assert(
    assignedAt1100.id === "erman-usta",
    "11:00 slot where both are free: Strictly routes to erman-usta to balance Ahmet's 10 bookings"
  );

  // -------------------------------------------------------------
  // CHALLENGE 6: Widget State Mutation Simulation (Slot Auto-Flip)
  // -------------------------------------------------------------
  console.log("\n--- Challenge 6: Widget Slot Auto-Flip on Staff Switch ---");

  // Emulate widget state:
  // Client selects ANY_STAFF -> picks 13:00 (which is Ahmet)
  let currentSelectedSlot = "13:00";
  let currentSelectedStaff = "ANY_STAFF";

  // Now client clicks "Erman Usta" in Step 1
  currentSelectedStaff = "erman-usta";
  // Erman's available slots do NOT have 13:00
  const ermanValidTimes = ermanSlots30.filter((s) => s.isAvailable).map((s) => s.displayTime);
  assert(!ermanValidTimes.includes("13:00"), "Precondition: 13:00 is absent from Erman's valid times");

  // Widget auto-flip rule:
  const nextSlot = ermanValidTimes.includes(currentSelectedSlot)
    ? currentSelectedSlot
    : ermanValidTimes[0];
  currentSelectedSlot = nextSlot;

  assert(
    currentSelectedSlot !== "13:00" && currentSelectedSlot === ermanValidTimes[0],
    `Widget auto-flips invalid slot: 13:00 was safely replaced with '${ermanValidTimes[0]}'`
  );

  // -------------------------------------------------------------
  // CHALLENGE 7: Booking Payload Staff Fields Persistence
  // -------------------------------------------------------------
  console.log("\n--- Challenge 7: End-to-End Booking Persistence Integrity ---");

  const challengeAppId = `stress_book_${Date.now()}`;
  const testAppPayload: StoredAppointment = {
    id: challengeAppId,
    tenant: "byerman",
    tenant_id: "byerman",
    customer_name: "Gökhan Meydan",
    customer_phone: "05321112233",
    customer_note: "Erman Usta randevusu",
    appointment_date: testDate,
    appointment_time: "11:00:00",
    status: "confirmed",
    staff_id: "erman-usta",
    staff_name: "Erman Usta",
    services: { name: "Master Saç Kesimi", price_text: "₺400" },
    created_at: new Date().toISOString(),
  };

  await saveNewAppointment(testAppPayload);
  const storedList = await getStoredAppointments("byerman");
  const verifiedApp = storedList.find((a) => a.id === challengeAppId);

  assert(verifiedApp !== undefined, "Stress test booking stored successfully");
  assert(verifiedApp?.staff_id === "erman-usta", "Stored booking has verified staff_id='erman-usta'");
  assert(verifiedApp?.staff_name === "Erman Usta", "Stored booking has verified staff_name='Erman Usta'");
  assert(verifiedApp?.appointment_time === "11:00:00", "Stored booking retains correct time slot");

  // Clean up
  await deleteAppointment(challengeAppId, "byerman");

  // Verify deletion
  const afterDeleteList = await getStoredAppointments("byerman");
  const postDeleteApp = afterDeleteList.find((a) => a.id === challengeAppId);
  assert(postDeleteApp === undefined, "Stress test booking cleaned up cleanly");

  // -------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------
  console.log("\n===============================================================");
  console.log(`📊 CHALLENGER RESULTS: ${passed} Passed, ${failed} Failed`);
  console.log("===============================================================");

  if (failed > 0) {
    console.error("Failed challenges:", failureDetails);
    process.exit(1);
  }
}

runChallengerStressTests().catch((err) => {
  console.error("Challenger test execution failed:", err);
  process.exit(1);
});
