import { NextRequest } from "next/server";
import {
  getStoredAppointments,
  saveNewAppointment,
  updateAppointmentStatus,
  deleteAppointment,
  StoredAppointment,
} from "../lib/storage/appointmentsStore";
import {
  getStoredWaitlist,
  saveNewWaitlistEntry,
  updateWaitlistStatus,
  deleteWaitlistEntry,
  StoredWaitlistEntry,
} from "../lib/storage/waitlistStore";
import {
  BYERMAN_STAFF_LIST,
  getDefaultStaffWorkingHours,
  getStaffById,
  getStaffWorkingHours,
} from "../lib/storage/staffStore";

// Route handlers
import { GET as getAppointmentsRoute, POST as postAppointmentsRoute, PATCH as patchAppointmentsRoute } from "../app/api/appointments/route";
import { GET as getWaitlistRoute, POST as postWaitlistRoute, PATCH as patchWaitlistRoute, DELETE as deleteWaitlistRoute } from "../app/api/waitlist/route";
import { GET as getSlotsRoute } from "../app/api/slots/route";
import { GET as getStaffRoute } from "../app/api/staff/route";

async function runForensicAudit() {
  console.log("=================================================");
  console.log("🔍 AUDITOR M1: Independent Forensic Verification Harness");
  console.log("=================================================\n");

  let totalChecks = 0;
  let passedChecks = 0;
  let failedChecks = 0;

  function auditAssert(condition: boolean, testName: string, failureDetails?: string) {
    totalChecks++;
    if (condition) {
      console.log(`  [AUDIT PASS] ${testName}`);
      passedChecks++;
    } else {
      console.error(`  [AUDIT VIOLATION] ${testName}`);
      if (failureDetails) console.error(`    Detail: ${failureDetails}`);
      failedChecks++;
    }
  }

  // -------------------------------------------------------------
  // SECTION 1: Dynamic Data Integrity (Anti-Hardcoding Probe)
  // -------------------------------------------------------------
  console.log("--- 1. Anti-Hardcoding & Random Input Verification ---");
  const randomEntropy = Math.random().toString(36).substring(2, 8);
  const dynamicTenant = `tenant_${randomEntropy}`;
  const dynamicStaffId = `staff_${randomEntropy}`;
  const dynamicStaffName = `Forensic Usta ${randomEntropy}`;
  const dynamicDate = "2026-11-20";

  const dynamicApp: StoredAppointment = {
    id: `app_${randomEntropy}`,
    tenant: dynamicTenant,
    tenant_id: dynamicTenant,
    customer_name: `Customer_${randomEntropy}`,
    customer_phone: "05550001122",
    customer_note: `Audit note ${randomEntropy}`,
    appointment_date: dynamicDate,
    appointment_time: "15:30:00",
    status: "confirmed",
    staff_id: dynamicStaffId,
    staff_name: dynamicStaffName,
  };

  await saveNewAppointment(dynamicApp);
  const fetchedApps = await getStoredAppointments(dynamicTenant);
  const retrievedApp = fetchedApps.find((a) => a.id === dynamicApp.id);

  auditAssert(
    retrievedApp !== undefined &&
    retrievedApp.staff_id === dynamicStaffId &&
    retrievedApp.staff_name === dynamicStaffName &&
    retrievedApp.customer_name === dynamicApp.customer_name,
    "Dynamic appointment with arbitrary staff_id and staff_name faithfully stored and retrieved",
    `Expected staff_id=${dynamicStaffId}, got=${retrievedApp?.staff_id}`
  );

  // Non-destructive cancellation probe
  await updateAppointmentStatus(dynamicApp.id, "cancelled", dynamicTenant);
  const fetchedAfterCancel = await getStoredAppointments(dynamicTenant);
  const cancelledRecord = fetchedAfterCancel.find((a) => a.id === dynamicApp.id);
  auditAssert(
    cancelledRecord !== undefined && cancelledRecord.status === "cancelled",
    "Appointment status update to 'cancelled' is non-destructive (record retained in store)",
    `Record exists=${Boolean(cancelledRecord)}, status=${cancelledRecord?.status}`
  );

  // Clean up
  await deleteAppointment(dynamicApp.id, dynamicTenant);

  // Dynamic waitlist probe
  const dynamicWlId = `wl_${randomEntropy}`;
  const dynamicWl: StoredWaitlistEntry = {
    id: dynamicWlId,
    tenant_id: dynamicTenant,
    customer_name: `Waitlist_${randomEntropy}`,
    customer_phone: "05323334455",
    preferred_date: dynamicDate,
    time_range: "11:00 - 13:00 arası",
    notes: `Priority VIP ${randomEntropy}`,
    staff_id: dynamicStaffId,
    status: "WAITING",
    created_at: new Date().toISOString(),
  };

  await saveNewWaitlistEntry(dynamicWl);
  const fetchedWl = await getStoredWaitlist(dynamicTenant);
  const retrievedWl = fetchedWl.find((w) => w.id === dynamicWlId);
  auditAssert(
    retrievedWl !== undefined &&
    retrievedWl.notes === `Priority VIP ${randomEntropy}` &&
    retrievedWl.time_range === "11:00 - 13:00 arası" &&
    retrievedWl.staff_id === dynamicStaffId,
    "Dynamic waitlist entry with arbitrary time_range, notes, and staff_id preserved",
    `Retrieved: ${JSON.stringify(retrievedWl)}`
  );

  // Status transition to OFFERED sets offered_at timestamp
  const beforeOfferTime = Date.now();
  await updateWaitlistStatus(dynamicWlId, "OFFERED", dynamicTenant);
  const wlAfterOffer = await getStoredWaitlist(dynamicTenant);
  const offeredItem = wlAfterOffer.find((w) => w.id === dynamicWlId);
  const offeredTimeMs = offeredItem?.offered_at ? new Date(offeredItem.offered_at).getTime() : 0;

  auditAssert(
    offeredItem?.status === "OFFERED" &&
    offeredTimeMs >= beforeOfferTime - 2000 &&
    offeredTimeMs <= Date.now() + 2000,
    "Waitlist transition to OFFERED correctly records valid recent ISO offered_at timestamp",
    `Status=${offeredItem?.status}, offered_at=${offeredItem?.offered_at}`
  );

  await deleteWaitlistEntry(dynamicWlId, dynamicTenant);

  // -------------------------------------------------------------
  // SECTION 2: Next.js API Route Handlers Direct Invocations
  // -------------------------------------------------------------
  console.log("\n--- 2. Direct API Route Handler Execution ---");

  // 2.1 POST /api/appointments
  const postAppReq = new NextRequest("http://localhost:3000/api/appointments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      customer_name: "Audit Tester",
      customer_phone: "05001234567",
      customer_note: "Sakal & Saç",
      appointment_date: "2026-11-25",
      appointment_time: "16:00",
      tenant: "byerman",
      staff_id: "ahmet-kalfa",
    }),
  });

  const postAppRes = await postAppointmentsRoute(postAppReq);
  const postAppJson = await postAppRes.json();
  auditAssert(
    postAppRes.status === 201 &&
    postAppJson.success === true &&
    postAppJson.appointment.staff_id === "ahmet-kalfa" &&
    postAppJson.appointment.staff_name === "Ahmet Kalfa",
    "POST /api/appointments creates appointment and auto-resolves staff_name for 'ahmet-kalfa'",
    `Status=${postAppRes.status}, Body=${JSON.stringify(postAppJson)}`
  );

  const createdAppId = postAppJson.appointment.id;

  // 2.2 GET /api/appointments with staff_id filter
  const getAppReq = new NextRequest(`http://localhost:3000/api/appointments?tenant=byerman&staff_id=ahmet-kalfa&date=2026-11-25`);
  const getAppRes = await getAppointmentsRoute(getAppReq);
  const getAppJson = await getAppRes.json();
  auditAssert(
    getAppRes.status === 200 &&
    getAppJson.success === true &&
    Array.isArray(getAppJson.appointments) &&
    getAppJson.appointments.some((a: any) => a.id === createdAppId),
    "GET /api/appointments correctly filters by tenant, staff_id, and date",
    `Count=${getAppJson.appointments?.length}`
  );

  // 2.3 PATCH /api/appointments status to 'cancelled'
  const patchAppReq = new NextRequest("http://localhost:3000/api/appointments", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: createdAppId,
      status: "cancelled",
      tenant: "byerman",
    }),
  });
  const patchAppRes = await patchAppointmentsRoute(patchAppReq);
  const patchAppJson = await patchAppRes.json();
  auditAssert(
    patchAppRes.status === 200 && patchAppJson.success === true,
    "PATCH /api/appointments successfully updates appointment status",
    `Status=${patchAppRes.status}`
  );

  // Verify non-destructive state via GET
  const verifyCancelReq = new NextRequest(`http://localhost:3000/api/appointments?tenant=byerman&date=2026-11-25`);
  const verifyCancelRes = await getAppointmentsRoute(verifyCancelReq);
  const verifyCancelJson = await verifyCancelRes.json();
  const foundCancelled = verifyCancelJson.appointments.find((a: any) => a.id === createdAppId);
  auditAssert(
    foundCancelled !== undefined && foundCancelled.status === "cancelled",
    "GET /api/appointments confirms cancelled appointment is retained with status 'cancelled'",
    `Cancelled app=${JSON.stringify(foundCancelled)}`
  );

  // Clean up
  await deleteAppointment(createdAppId, "byerman");

  // 2.4 POST /api/waitlist
  const postWlReq = new NextRequest("http://localhost:3000/api/waitlist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      tenant_id: "byerman",
      customer_name: "Gökhan Bekleyen",
      customer_phone: "05441112233",
      preferred_date: "2026-11-25",
      time_range: "14:00 - 17:00 arası",
      notes: "Erman usta müsait olursa sevinirim",
      staff_id: "erman-usta",
    }),
  });
  const postWlRes = await postWaitlistRoute(postWlReq);
  const postWlJson = await postWlRes.json();
  auditAssert(
    postWlRes.status === 201 &&
    postWlJson.success === true &&
    postWlJson.data.entry.status === "WAITING" &&
    postWlJson.data.entry.time_range === "14:00 - 17:00 arası" &&
    postWlJson.data.entry.staff_id === "erman-usta",
    "POST /api/waitlist successfully persists candidate with time_range, staff_id, and WAITING status",
    `Status=${postWlRes.status}, Body=${JSON.stringify(postWlJson)}`
  );

  const createdWlId = postWlJson.data.entry.id;

  // 2.5 GET /api/waitlist with date & status filters
  const getWlReq = new NextRequest("http://localhost:3000/api/waitlist?tenant=byerman&date=2026-11-25&status=WAITING");
  const getWlRes = await getWaitlistRoute(getWlReq);
  const getWlJson = await getWlRes.json();
  auditAssert(
    getWlRes.status === 200 &&
    getWlJson.success === true &&
    getWlJson.data.waitlist.some((w: any) => w.id === createdWlId),
    "GET /api/waitlist returns candidate matching date and WAITING status",
    `Count=${getWlJson.data?.waitlist?.length}`
  );

  // 2.6 PATCH /api/waitlist to OFFERED
  const patchWlReq = new NextRequest("http://localhost:3000/api/waitlist", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: createdWlId,
      status: "OFFERED",
      tenant: "byerman",
    }),
  });
  const patchWlRes = await patchWaitlistRoute(patchWlReq);
  const patchWlJson = await patchWlRes.json();
  auditAssert(
    patchWlRes.status === 200 && patchWlJson.success === true,
    "PATCH /api/waitlist updates candidate status to OFFERED",
    `Status=${patchWlRes.status}`
  );

  // 2.7 DELETE /api/waitlist
  const deleteWlReq = new NextRequest(`http://localhost:3000/api/waitlist?id=${createdWlId}&tenant=byerman`, {
    method: "DELETE",
  });
  const deleteWlRes = await deleteWaitlistRoute(deleteWlReq);
  const deleteWlJson = await deleteWlRes.json();
  auditAssert(
    deleteWlRes.status === 200 && deleteWlJson.success === true,
    "DELETE /api/waitlist successfully deletes entry",
    `Status=${deleteWlRes.status}`
  );

  // 2.8 GET /api/slots for ANY_STAFF
  const getSlotsAnyReq = new NextRequest("http://localhost:3000/api/slots?slug=byerman&date=2026-11-25&duration=30&staffId=ANY_STAFF");
  const getSlotsAnyRes = await getSlotsRoute(getSlotsAnyReq);
  const getSlotsAnyJson = await getSlotsAnyRes.json();
  auditAssert(
    getSlotsAnyRes.status === 200 &&
    getSlotsAnyJson.success === true &&
    Array.isArray(getSlotsAnyJson.data.slots) &&
    getSlotsAnyJson.data.slots.length > 0 &&
    getSlotsAnyJson.data.slots.some((s: any) => s.availableStaffIds && s.availableStaffIds.length > 0),
    "GET /api/slots for ANY_STAFF computes multi-staff aggregated availability with availableStaffIds",
    `TotalSlots=${getSlotsAnyJson.data?.slots?.length}`
  );

  // 2.9 GET /api/slots for single staff (ahmet-kalfa)
  const getSlotsAhmetReq = new NextRequest("http://localhost:3000/api/slots?slug=byerman&date=2026-11-25&duration=30&staffId=ahmet-kalfa");
  const getSlotsAhmetRes = await getSlotsRoute(getSlotsAhmetReq);
  const getSlotsAhmetJson = await getSlotsAhmetRes.json();
  const ahmetBreakSlot = getSlotsAhmetJson.data.slots.find((s: any) => s.displayTime === "14:00" || s.displayTime === "14:30");
  auditAssert(
    getSlotsAhmetRes.status === 200 &&
    getSlotsAhmetJson.success === true &&
    ahmetBreakSlot !== undefined &&
    ahmetBreakSlot.isAvailable === false,
    "GET /api/slots for ahmet-kalfa respects 14:00-15:00 break (slot marked isAvailable: false)",
    `Slot 14:00 isAvailable=${ahmetBreakSlot?.isAvailable}`
  );

  // 2.10 GET /api/staff
  const getStaffReq = new NextRequest("http://localhost:3000/api/staff?tenantId=byerman");
  const getStaffRes = await getStaffRoute(getStaffReq);
  const getStaffJson = await getStaffRes.json();
  auditAssert(
    getStaffRes.status === 200 &&
    getStaffJson.success === true &&
    Array.isArray(getStaffJson.data.staff) &&
    getStaffJson.data.staff.length >= 2 &&
    getStaffJson.data.staff.every((s: any) => Array.isArray(s.workingHours) && s.workingHours.length === 7),
    "GET /api/staff returns By Erman specialists with complete 7-day working hours and breaks",
    `StaffCount=${getStaffJson.data?.staff?.length}`
  );

  // -------------------------------------------------------------
  // SECTION 3: Adversarial Validation & Error Handling Probes
  // -------------------------------------------------------------
  console.log("\n--- 3. Adversarial Edge Case & Error Handling Probes ---");

  // 3.1 POST /api/appointments missing required fields (customer_name, customer_phone)
  const invalidAppReq = new NextRequest("http://localhost:3000/api/appointments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ customer_note: "No name or phone" }),
  });
  const invalidAppRes = await postAppointmentsRoute(invalidAppReq);
  auditAssert(
    invalidAppRes.status === 400,
    "POST /api/appointments returns 400 Bad Request when customer_name or phone is missing",
    `Expected 400, got ${invalidAppRes.status}`
  );

  // 3.2 POST /api/waitlist missing customer_name or phone or preferred_date
  const invalidWlReq = new NextRequest("http://localhost:3000/api/waitlist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ customer_name: "Incomplete" }),
  });
  const invalidWlRes = await postWaitlistRoute(invalidWlReq);
  auditAssert(
    invalidWlRes.status === 400,
    "POST /api/waitlist returns 400 Bad Request on missing mandatory fields",
    `Expected 400, got ${invalidWlRes.status}`
  );

  // 3.3 PATCH /api/waitlist invalid status value
  const invalidStatusWlReq = new NextRequest("http://localhost:3000/api/waitlist", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: "wl_fake_123", status: "NON_EXISTENT_STATUS" }),
  });
  const invalidStatusWlRes = await patchWaitlistRoute(invalidStatusWlReq);
  auditAssert(
    invalidStatusWlRes.status === 400,
    "PATCH /api/waitlist rejects invalid status enum with 400 Bad Request",
    `Expected 400, got ${invalidStatusWlRes.status}`
  );

  // 3.4 GET /api/staff with unknown ID
  const unknownStaffReq = new NextRequest("http://localhost:3000/api/staff?tenantId=byerman&staffId=completely_fake_staff_9999");
  const unknownStaffRes = await getStaffRoute(unknownStaffReq);
  auditAssert(
    unknownStaffRes.status === 404,
    "GET /api/staff with non-existent staffId returns 404 Not Found",
    `Expected 404, got ${unknownStaffRes.status}`
  );

  console.log("\n=================================================");
  console.log(`📋 Forensic Audit Summary: ${passedChecks} Passed, ${failedChecks} Failed (Total ${totalChecks})`);
  console.log("=================================================\n");

  if (failedChecks > 0) {
    console.error("🚨 INTEGRITY VIOLATION DETECTED!");
    process.exit(1);
  } else {
    console.log("🛡️ VERDICT: CLEAN — All integrity forensic assertions verified.");
  }
}

runForensicAudit().catch((err) => {
  console.error("Forensic test execution threw error:", err);
  process.exit(1);
});
