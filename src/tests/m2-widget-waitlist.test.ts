import {
  BYERMAN_STAFF_LIST,
  getStaffById,
  getDefaultStaffWorkingHours,
  getByErmanStaffAsEngineStaff,
} from "../lib/storage/staffStore";
import { StaffRouter } from "../lib/engine/staffRouter";
import {
  saveNewWaitlistEntry,
  getStoredWaitlist,
  deleteWaitlistEntry,
  StoredWaitlistEntry,
} from "../lib/storage/waitlistStore";
import {
  saveNewAppointment,
  getStoredAppointments,
  deleteAppointment,
  StoredAppointment,
} from "../lib/storage/appointmentsStore";
import { PRESET_TIME_RANGES } from "../components/booking/FlashWaitlistCard";
import { calculateAvailableSlots } from "../lib/engine/slotCalculator";
import { Appointment, Staff } from "../types/schema";

async function runM2VerificationTests() {
  console.log("=================================================");
  console.log("🧪 Worker M2 - Client Booking Flow & Waitlist Test Suite");
  console.log("=================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  }

  // -------------------------------------------------------------
  // SUITE 1: Staff & Seat Selection Cards & Models
  // -------------------------------------------------------------
  console.log("--- Suite 1: Staff & Seat Selection Models & Cards ---");
  assert(BYERMAN_STAFF_LIST.length === 3, "BYERMAN_STAFF_LIST defines 3 options for Step 1 cards");

  const erman = BYERMAN_STAFF_LIST.find((s) => s.id === "erman-usta");
  assert(erman !== undefined, "Erman Usta card is present");
  assert(erman?.name === "Erman Usta", "Erman Usta name is correct");
  assert(erman?.role === "Master Barber", "Erman Usta role is 'Master Barber'");
  assert(erman?.chair === "Koltuk 1 (Master)", "Erman Usta seat is 'Koltuk 1 (Master)'");
  assert(erman?.avatar === "✂️", "Erman Usta avatar is ✂️");
  assert(erman?.badge === "Kurucu & Baş Berber", "Erman Usta badge is 'Kurucu & Baş Berber'");

  const ahmet = BYERMAN_STAFF_LIST.find((s) => s.id === "ahmet-kalfa");
  assert(ahmet !== undefined, "Ahmet Kalfa card is present");
  assert(ahmet?.name === "Ahmet Kalfa", "Ahmet Kalfa name is correct");
  assert(ahmet?.role === "Saç & Sakal Uzmanı", "Ahmet Kalfa role is 'Saç & Sakal Uzmanı'");
  assert(ahmet?.chair === "Koltuk 2", "Ahmet Kalfa seat is 'Koltuk 2'");
  assert(ahmet?.avatar === "💈", "Ahmet Kalfa avatar is 💈");
  assert(ahmet?.badge === "Fade & Sakal Uzmanı", "Ahmet Kalfa badge is 'Fade & Sakal Uzmanı'");

  const anyStaff = BYERMAN_STAFF_LIST.find((s) => s.id === "ANY_STAFF");
  assert(anyStaff !== undefined, "ANY_STAFF card is present");
  assert(anyStaff?.name.includes("İlk Müsait Usta"), "ANY_STAFF name includes 'İlk Müsait Usta'");
  assert(anyStaff?.chair.includes("Koltuk Dengesi"), "ANY_STAFF chair indicates 'Koltuk Dengesi'");
  assert(anyStaff?.badge === "Önerilen Hızlı Seçim", "ANY_STAFF badge is 'Önerilen Hızlı Seçim'");

  // -------------------------------------------------------------
  // SUITE 2: Dynamic Slot Recalculation per Staff
  // -------------------------------------------------------------
  console.log("\n--- Suite 2: Dynamic Slot Recalculation per Staff ---");
  const testDate = "2026-10-12"; // Monday
  const engineStaff = await getByErmanStaffAsEngineStaff();

  // 2.1 Calculate slots for Erman Usta: Break at 13:00 - 14:00
  const ermanWorkingHours = getDefaultStaffWorkingHours("erman-usta").find((h) => h.dayOfWeek === 1)!;
  const ermanSlots = calculateAvailableSlots({
    date: testDate,
    durationMinutes: 30,
    workingHours: ermanWorkingHours,
    existingBookings: [],
    slotIntervalMinutes: 30,
  });

  const erman1300 = ermanSlots.find((s) => s.displayTime === "13:00");
  const erman1330 = ermanSlots.find((s) => s.displayTime === "13:30");
  const erman1100 = ermanSlots.find((s) => s.displayTime === "11:00");
  assert(erman1300?.isAvailable === false, "Erman Usta: 13:00 slot is UNAVAILABLE (mola)");
  assert(erman1330?.isAvailable === false, "Erman Usta: 13:30 slot is UNAVAILABLE (mola)");
  assert(erman1100?.isAvailable === true, "Erman Usta: 11:00 slot is AVAILABLE");

  // 2.2 Calculate slots for Ahmet Kalfa: Break at 14:00 - 15:00
  const ahmetWorkingHours = getDefaultStaffWorkingHours("ahmet-kalfa").find((h) => h.dayOfWeek === 1)!;
  const ahmetSlots = calculateAvailableSlots({
    date: testDate,
    durationMinutes: 30,
    workingHours: ahmetWorkingHours,
    existingBookings: [],
    slotIntervalMinutes: 30,
  });

  const ahmet1300 = ahmetSlots.find((s) => s.displayTime === "13:00");
  const ahmet1400 = ahmetSlots.find((s) => s.displayTime === "14:00");
  const ahmet1430 = ahmetSlots.find((s) => s.displayTime === "14:30");
  assert(ahmet1300?.isAvailable === true, "Ahmet Kalfa: 13:00 slot is AVAILABLE (working during Erman's break)");
  assert(ahmet1400?.isAvailable === false, "Ahmet Kalfa: 14:00 slot is UNAVAILABLE (mola)");
  assert(ahmet1430?.isAvailable === false, "Ahmet Kalfa: 14:30 slot is UNAVAILABLE (mola)");

  // 2.3 Calculate Aggregated Slots for ANY_STAFF
  const aggregated = StaffRouter.calculateAggregatedSlots({
    date: testDate,
    service: {
      id: "srv_tiras",
      tenantId: "byerman",
      name: "Saç Kesimi",
      slug: "sac-kesimi",
      durationMinutes: 30,
      price: 350,
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

  const agg1300 = aggregated.slots.find((s) => s.displayTime === "13:00");
  const agg1400 = aggregated.slots.find((s) => s.displayTime === "14:00");
  const agg1100 = aggregated.slots.find((s) => s.displayTime === "11:00");

  assert(agg1300?.isAvailable === true, "ANY_STAFF: 13:00 is AVAILABLE because Ahmet is working");
  assert(
    agg1300?.availableStaffIds.length === 1 && agg1300.availableStaffIds[0] === "ahmet-kalfa",
    "ANY_STAFF: 13:00 correctly identifies ONLY ahmet-kalfa as available"
  );
  assert(agg1400?.isAvailable === true, "ANY_STAFF: 14:00 is AVAILABLE because Erman is working");
  assert(
    agg1400?.availableStaffIds.length === 1 && agg1400.availableStaffIds[0] === "erman-usta",
    "ANY_STAFF: 14:00 correctly identifies ONLY erman-usta as available"
  );
  assert(
    agg1100?.availableStaffIds.length === 2 &&
      agg1100.availableStaffIds.includes("erman-usta") &&
      agg1100.availableStaffIds.includes("ahmet-kalfa"),
    "ANY_STAFF: 11:00 correctly identifies BOTH specialists as available"
  );

  // -------------------------------------------------------------
  // SUITE 3: "İlk Müsait Usta" Workload Balancing (routeLeastBusy)
  // -------------------------------------------------------------
  console.log("\n--- Suite 3: Workload Balancing (routeLeastBusy) ---");

  // Scenario 3.1: Erman has 2 bookings today, Ahmet has 0 bookings today.
  // Both are available at 11:00 -> routeLeastBusy must pick Ahmet Kalfa!
  const bookingsDay1: Appointment[] = [
    {
      id: "app_1",
      tenantId: "byerman",
      serviceId: "srv_1",
      staffId: "erman-usta",
      customerId: "c1",
      customerName: "Müşteri 1",
      customerEmail: "",
      customerPhone: "05550000001",
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
    {
      id: "app_2",
      tenantId: "byerman",
      serviceId: "srv_1",
      staffId: "erman-usta",
      customerId: "c2",
      customerName: "Müşteri 2",
      customerEmail: "",
      customerPhone: "05550000002",
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

  const routeResult1 = StaffRouter.routeLeastBusy(engineStaff, bookingsDay1, testDate);
  assert(
    routeResult1.assignedStaff.id === "ahmet-kalfa",
    "routeLeastBusy assigns 'ahmet-kalfa' when Erman has 2 bookings and Ahmet has 0"
  );
  assert(
    routeResult1.reason.includes("İş yükü dengeleme"),
    "routeLeastBusy returns clear workload balancing reasoning"
  );

  // Scenario 3.2: Ahmet has 3 bookings today, Erman has 1 booking today.
  // Both are available at 16:00 -> routeLeastBusy must pick Erman Usta!
  const bookingsDay2: Appointment[] = [
    {
      id: "app_3",
      tenantId: "byerman",
      serviceId: "srv_1",
      staffId: "ahmet-kalfa",
      customerId: "c3",
      customerName: "Müşteri 3",
      customerEmail: "",
      customerPhone: "05550000003",
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
    {
      id: "app_4",
      tenantId: "byerman",
      serviceId: "srv_1",
      staffId: "ahmet-kalfa",
      customerId: "c4",
      customerName: "Müşteri 4",
      customerEmail: "",
      customerPhone: "05550000004",
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
    {
      id: "app_5",
      tenantId: "byerman",
      serviceId: "srv_1",
      staffId: "ahmet-kalfa",
      customerId: "c5",
      customerName: "Müşteri 5",
      customerEmail: "",
      customerPhone: "05550000005",
      startUtc: `${testDate}T11:00:00+03:00`,
      endUtc: `${testDate}T11:30:00+03:00`,
      status: "CONFIRMED",
      paymentStatus: "PAID",
      paymentAmount: 0,
      cancellationToken: "",
      rescheduleToken: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "app_6",
      tenantId: "byerman",
      serviceId: "srv_1",
      staffId: "erman-usta",
      customerId: "c6",
      customerName: "Müşteri 6",
      customerEmail: "",
      customerPhone: "05550000006",
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

  const routeResult2 = StaffRouter.routeLeastBusy(engineStaff, bookingsDay2, testDate);
  assert(
    routeResult2.assignedStaff.id === "erman-usta",
    "routeLeastBusy assigns 'erman-usta' when Ahmet has 3 bookings and Erman has 1"
  );

  // -------------------------------------------------------------
  // SUITE 4: Booking Payload Staff Submission Persistence
  // -------------------------------------------------------------
  console.log("\n--- Suite 4: Booking Payload Staff Fields Persistence ---");
  const bookingTestId = `m2_book_${Date.now()}`;
  const testBooking: StoredAppointment = {
    id: bookingTestId,
    tenant_id: "byerman",
    customer_name: "Kemal Danışan",
    customer_phone: "05329998877",
    customer_note: "Özel saç stili",
    appointment_date: "2026-11-20",
    appointment_time: "15:30:00",
    status: "confirmed",
    staff_id: "ahmet-kalfa",
    staff_name: "Ahmet Kalfa",
    services: { name: "Saç & Sakal Tıraşı", price_text: "₺450" },
    created_at: new Date().toISOString(),
  };

  await saveNewAppointment(testBooking);
  const fetchedApps = await getStoredAppointments("byerman");
  const matchedApp = fetchedApps.find((a) => a.id === bookingTestId);

  assert(matchedApp !== undefined, "Booking was persisted into store");
  assert(matchedApp?.staff_id === "ahmet-kalfa", "Booking accurately retains staff_id ('ahmet-kalfa')");
  assert(matchedApp?.staff_name === "Ahmet Kalfa", "Booking accurately retains staff_name ('Ahmet Kalfa')");

  // Clean up
  await deleteAppointment(bookingTestId, "byerman");

  // -------------------------------------------------------------
  // SUITE 5: Flash Waitlist Card & Storage Integration
  // -------------------------------------------------------------
  console.log("\n--- Suite 5: Flash Waitlist Integration in Step 2 ---");
  assert(PRESET_TIME_RANGES.length >= 4, "PRESET_TIME_RANGES provides predefined time slot choices");
  assert(
    PRESET_TIME_RANGES.includes("14:00 - 18:00 arası"),
    "PRESET_TIME_RANGES includes specified '14:00 - 18:00 arası' interval"
  );

  const waitlistTestId = `m2_wl_${Date.now()}`;
  const waitlistCandidate: StoredWaitlistEntry = {
    id: waitlistTestId,
    tenant_id: "byerman",
    customer_name: "Burak Bekleyen",
    customer_phone: "05334445566",
    preferred_date: "2026-10-15",
    time_range: "14:00 - 18:00 arası",
    notes: "İptal olursa hemen gelebilirim",
    staff_id: "erman-usta",
    status: "WAITING",
    priority_score: 85,
    created_at: new Date().toISOString(),
  };

  await saveNewWaitlistEntry(waitlistCandidate);
  const waitlist = await getStoredWaitlist("byerman");
  const foundWl = waitlist.find((w) => w.id === waitlistTestId);

  assert(foundWl !== undefined, "Flash waitlist entry saved into waitlistStore");
  assert(foundWl?.customer_name === "Burak Bekleyen", "Waitlist retains customer_name");
  assert(foundWl?.time_range === "14:00 - 18:00 arası", "Waitlist retains desired time_range");
  assert(foundWl?.staff_id === "erman-usta", "Waitlist retains preferred staff_id");
  assert(foundWl?.status === "WAITING", "Waitlist initial status is 'WAITING'");
  assert(foundWl?.priority_score === 85, "Waitlist priority_score defaults to 85");

  // Verify nullish coalescing: if priority_score is explicitly 0 (VIP 0), it retains 0 and does not coerce to 85
  const zeroPrioId = `m2_wl_zero_${Date.now()}`;
  const zeroPrioCandidate: StoredWaitlistEntry = {
    id: zeroPrioId,
    tenant_id: "byerman",
    customer_name: "VIP Sıfır",
    customer_phone: "05330000000",
    preferred_date: "2026-10-15",
    status: "WAITING",
    priority_score: 0,
    created_at: new Date().toISOString(),
  };
  await saveNewWaitlistEntry(zeroPrioCandidate);
  const updatedWaitlist = await getStoredWaitlist("byerman");
  const zeroEntry = updatedWaitlist.find((w) => w.id === zeroPrioId);
  assert(
    zeroEntry?.priority_score === 0,
    "Nullish coalescing preserves priority_score: 0 (does not overwrite with 85)"
  );

  // Clean up
  await deleteWaitlistEntry(waitlistTestId, "byerman");
  await deleteWaitlistEntry(zeroPrioId, "byerman");

  // -------------------------------------------------------------
  // Final Results
  // -------------------------------------------------------------
  console.log("\n=================================================");
  console.log(`📊 Test Results: ${passed} Passed, ${failed} Failed`);
  console.log("=================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runM2VerificationTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
