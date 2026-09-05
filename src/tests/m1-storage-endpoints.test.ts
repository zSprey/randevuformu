import {
  saveNewAppointment,
  getStoredAppointments,
  updateAppointmentStatus,
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
  getAllStaff,
  getStaffWorkingHours,
  saveStaffWorkingHours,
  getByErmanStaffAsEngineStaff,
} from "../lib/storage/staffStore";
import { StaffRouter } from "../lib/engine/staffRouter";
import { Appointment } from "../types/schema";

async function runM1VerificationTests() {
  console.log("=================================================");
  console.log("🧪 Worker M1 - Backend Data Models & API Test Suite");
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
  // SUITE 1: Staff Data Models & Working Schedule Helpers
  // -------------------------------------------------------------
  console.log("--- Suite 1: Staff Data Models & Schedules ---");
  assert(BYERMAN_STAFF_LIST.length === 3, "BYERMAN_STAFF_LIST contains exactly 3 entries");
  
  const erman = getStaffById("erman-usta");
  assert(erman !== undefined && erman.name === "Erman Usta", "erman-usta resolves to Erman Usta");
  assert(erman?.chair === "Koltuk 1 (Master)", "erman-usta chair is Koltuk 1 (Master)");

  const ahmet = getStaffById("ahmet-kalfa");
  assert(ahmet !== undefined && ahmet.name === "Ahmet Kalfa", "ahmet-kalfa resolves to Ahmet Kalfa");
  assert(ahmet?.chair === "Koltuk 2", "ahmet-kalfa chair is Koltuk 2");

  const anyStaff = getStaffById("ANY_STAFF");
  assert(anyStaff !== undefined && anyStaff.name.includes("İlk Müsait Usta"), "ANY_STAFF resolves to İlk Müsait Usta");

  const ermanHours = getDefaultStaffWorkingHours("erman-usta");
  assert(ermanHours.length === 7, "Default working hours contain all 7 days of the week");
  const mondayErman = ermanHours.find((h) => h.dayOfWeek === 1);
  assert(mondayErman?.startTime === "09:00" && mondayErman?.endTime === "20:00", "Erman monday shift is 09:00 - 20:00");
  assert(mondayErman?.breakStartTime === "13:00" && mondayErman?.breakEndTime === "14:00", "Erman break is 13:00 - 14:00");

  const ahmetHours = getDefaultStaffWorkingHours("ahmet-kalfa");
  const mondayAhmet = ahmetHours.find((h) => h.dayOfWeek === 1);
  assert(mondayAhmet?.breakStartTime === "14:00" && mondayAhmet?.breakEndTime === "15:00", "Ahmet break is 14:00 - 15:00 (staggered with Erman)");

  const engineStaff = await getByErmanStaffAsEngineStaff();
  assert(engineStaff.length === 2, "Engine staff converts erman-usta and ahmet-kalfa (excluding ANY_STAFF)");
  assert(engineStaff.every((s) => s.isActive && s.workingHours.length === 7), "All engine staff are active with valid working hours");

  // -------------------------------------------------------------
  // SUITE 2: Appointments Store with Staff Assignment
  // -------------------------------------------------------------
  console.log("\n--- Suite 2: Appointments Store with Staff Fields ---");
  const testAppId = `test_m1_${Date.now()}`;
  const futureDate = new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0];

  const testApp: StoredAppointment = {
    id: testAppId,
    tenant: "byerman",
    tenant_id: "byerman",
    customer_name: "Ali Test",
    customer_phone: "05551112233",
    customer_note: "Saç Kesimi & Yıkama",
    appointment_date: futureDate,
    appointment_time: "14:00:00",
    status: "confirmed",
    services: { name: "Saç Kesimi & Yıkama" },
    staff_id: "erman-usta",
    staff_name: "Erman Usta",
    created_at: new Date().toISOString(),
  };

  const saveAppResult = await saveNewAppointment(testApp);
  assert(saveAppResult === true, "saveNewAppointment succeeds");

  const storedApps = await getStoredAppointments("byerman");
  const foundApp = storedApps.find((a) => a.id === testAppId);
  assert(foundApp !== undefined, "Saved appointment is retrieved from store");
  assert(foundApp?.staff_id === "erman-usta", "Stored appointment retains staff_id ('erman-usta')");
  assert(foundApp?.staff_name === "Erman Usta", "Stored appointment retains staff_name ('Erman Usta')");

  // Non-destructive cancellation
  const cancelResult = await updateAppointmentStatus(testAppId, "cancelled", "byerman");
  assert(cancelResult === true, "updateAppointmentStatus to 'cancelled' succeeds");

  const appsAfterCancel = await getStoredAppointments("byerman");
  const cancelledApp = appsAfterCancel.find((a) => a.id === testAppId);
  assert(cancelledApp !== undefined, "Cancelled appointment record is PRESERVED (not deleted)");
  assert(cancelledApp?.status === "cancelled", "Cancelled appointment status is updated to 'cancelled'");

  // Clean up test appointment
  await deleteAppointment(testAppId, "byerman");

  // -------------------------------------------------------------
  // SUITE 3: Flash Waitlist Store Full CRUD & Lifecycle
  // -------------------------------------------------------------
  console.log("\n--- Suite 3: Flash Waitlist Store Full CRUD ---");
  const testWlId = `wl_test_${Date.now()}`;
  const testWlEntry: StoredWaitlistEntry = {
    id: testWlId,
    tenant_id: "byerman",
    service_id: "srv-sac",
    service_name: "Saç Kesimi & Yıkama",
    customer_name: "Mehmet Yedek",
    customer_phone: "05329998877",
    customer_email: "mehmet@test.com",
    preferred_date: futureDate,
    time_range: "14:00 - 18:00 arası",
    notes: "Acil tıraş rica ederim",
    staff_id: "ahmet-kalfa",
    status: "WAITING",
    priority_score: 90,
    created_at: new Date().toISOString(),
  };

  const saveWlResult = await saveNewWaitlistEntry(testWlEntry);
  assert(saveWlResult === true, "saveNewWaitlistEntry succeeds");

  const waitlist = await getStoredWaitlist("byerman");
  const foundWl = waitlist.find((w) => w.id === testWlId);
  assert(foundWl !== undefined, "Saved waitlist candidate is retrieved from store");
  assert(foundWl?.customer_name === "Mehmet Yedek", "Waitlist customer_name is preserved");
  assert(foundWl?.customer_phone === "05329998877", "Waitlist customer_phone is preserved");
  assert(foundWl?.time_range === "14:00 - 18:00 arası", "Waitlist time_range is preserved");
  assert(foundWl?.notes === "Acil tıraş rica ederim", "Waitlist notes are preserved");
  assert(foundWl?.staff_id === "ahmet-kalfa", "Waitlist staff_id is preserved");
  assert(foundWl?.status === "WAITING", "Initial waitlist status is 'WAITING'");

  // Status transition to OFFERED (WhatsApp seat offer sent)
  const offerResult = await updateWaitlistStatus(testWlId, "OFFERED", "byerman");
  assert(offerResult === true, "updateWaitlistStatus to 'OFFERED' succeeds");

  const waitlistAfterOffer = await getStoredWaitlist("byerman");
  const offeredWl = waitlistAfterOffer.find((w) => w.id === testWlId);
  assert(offeredWl?.status === "OFFERED", "Waitlist status successfully updated to 'OFFERED'");
  assert(offeredWl?.offered_at !== undefined, "Waitlist offered_at timestamp is populated");

  // Status transition to ACCEPTED (Seat claimed)
  const acceptResult = await updateWaitlistStatus(testWlId, "ACCEPTED", "byerman");
  assert(acceptResult === true, "updateWaitlistStatus to 'ACCEPTED' succeeds");

  const waitlistAfterAccept = await getStoredWaitlist("byerman");
  const acceptedWl = waitlistAfterAccept.find((w) => w.id === testWlId);
  assert(acceptedWl?.status === "ACCEPTED", "Waitlist status successfully updated to 'ACCEPTED'");

  // Delete waitlist entry
  const deleteWlResult = await deleteWaitlistEntry(testWlId, "byerman");
  assert(deleteWlResult === true, "deleteWaitlistEntry succeeds");
  const waitlistAfterDelete = await getStoredWaitlist("byerman");
  assert(!waitlistAfterDelete.some((w) => w.id === testWlId), "Deleted waitlist candidate is no longer in store");

  // -------------------------------------------------------------
  // SUITE 4: Multi-Staff Slot Resolver & Workload Balancing
  // -------------------------------------------------------------
  console.log("\n--- Suite 4: Multi-Staff Aggregated Slot Resolver ---");
  const testDate = futureDate;

  // Simulate existing booking: Erman is booked at 15:00, Ahmet is free
  const simulatedBookings: Appointment[] = [
    {
      id: "app-erman-15",
      tenantId: "byerman",
      serviceId: "srv-sac",
      staffId: "erman-usta",
      customerId: "c1",
      customerName: "Can",
      customerEmail: "",
      customerPhone: "",
      startUtc: new Date(`${testDate}T15:00:00+03:00`).toISOString(),
      endUtc: new Date(`${testDate}T15:30:00+03:00`).toISOString(),
      status: "CONFIRMED",
      paymentStatus: "PAID",
      paymentAmount: 0,
      cancellationToken: "",
      rescheduleToken: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const aggregatedSlots = StaffRouter.calculateAggregatedSlots({
    date: testDate,
    service: {
      id: "srv-sac",
      tenantId: "byerman",
      name: "Saç Kesimi",
      slug: "sac",
      durationMinutes: 30,
      bufferTimeBeforeMinutes: 0,
      bufferTimeAfterMinutes: 0,
      price: 350,
      currency: "TRY",
      requirePrepayment: false,
      maxCapacityPerSlot: 1,
      assignedStaffIds: [],
      isActive: true,
      createdAt: "",
      updatedAt: "",
    },
    staffList: engineStaff,
    existingBookings: simulatedBookings,
    slotIntervalMinutes: 30,
  });

  const slotAt15 = aggregatedSlots.slots.find((s) => s.displayTime === "15:00");
  assert(slotAt15 !== undefined, "Slot at 15:00 is generated");
  assert(slotAt15?.isAvailable === true, "15:00 slot is AVAILABLE under ANY_STAFF even though Erman is booked (because Ahmet is free)");
  assert(
    slotAt15?.availableStaffIds.includes("ahmet-kalfa") === true &&
    !slotAt15?.availableStaffIds.includes("erman-usta"),
    "15:00 slot accurately lists ONLY 'ahmet-kalfa' in availableStaffIds"
  );
  assert(slotAt15?.availableStaffCount === 1, "availableStaffCount is 1 at 15:00");

  // An unbooked slot (e.g. 11:00) should have both Erman and Ahmet available
  const slotAt11 = aggregatedSlots.slots.find((s) => s.displayTime === "11:00");
  assert(slotAt11 !== undefined && slotAt11.isAvailable === true, "11:00 slot is available");
  assert(
    slotAt11?.availableStaffIds.includes("erman-usta") &&
    slotAt11?.availableStaffIds.includes("ahmet-kalfa"),
    "11:00 slot lists BOTH 'erman-usta' and 'ahmet-kalfa' in availableStaffIds"
  );
  assert(slotAt11?.availableStaffCount === 2, "availableStaffCount is 2 at 11:00");

  // Workload balancing check
  const routedStaff = StaffRouter.routeLeastBusy(engineStaff, simulatedBookings, testDate);
  assert(
    routedStaff.assignedStaff.id === "ahmet-kalfa",
    "routeLeastBusy assigns 'ahmet-kalfa' because Erman has 1 booking and Ahmet has 0 bookings on that day"
  );

  console.log("\n=================================================");
  console.log(`📊 Test Results: ${passed} Passed, ${failed} Failed`);
  console.log("=================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runM1VerificationTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
