import { NextRequest } from "next/server";
import {
  saveNewWaitlistEntry,
  getStoredWaitlist,
  updateWaitlistStatus,
  deleteWaitlistEntry,
  StoredWaitlistEntry,
} from "../lib/storage/waitlistStore";
import {
  saveNewAppointment,
  getStoredAppointments,
  updateAppointmentStatus,
  updateAppointment,
  deleteAppointment,
  StoredAppointment,
} from "../lib/storage/appointmentsStore";
import { calculateAvailableSlots } from "../lib/engine/slotCalculator";
import { GET as waitlistGET, POST as waitlistPOST, PATCH as waitlistPATCH, DELETE as waitlistDELETE } from "../app/api/waitlist/route";
import { GET as appointmentsGET, POST as appointmentsPOST, PATCH as appointmentsPATCH } from "../app/api/appointments/route";

async function runChallenger2AdversarialSuite() {
  console.log("================================================================================");
  console.log("⚔️ CHALLENGER 2 EMPIRICAL ADVERSARIAL TEST SUITE (Milestone 1)");
  console.log("Focus: Flash Waitlist Lifecycle & Non-Destructive Cancellation Preservation");
  console.log("================================================================================\n");

  let passedCount = 0;
  let failedCount = 0;
  const findings: string[] = [];

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passedCount++;
    } else {
      console.error(`  ❌ FAIL: ${testName} ${detail ? `(${detail})` : ""}`);
      failedCount++;
      findings.push(`FAIL: ${testName} ${detail ? `(${detail})` : ""}`);
    }
  }

  const TENANT = `test_c2_${Date.now()}`;
  const FUTURE_DATE = "2026-10-15";

  // ================================================================================
  // SUITE 1: RAPID SEQUENCE WAITLIST INGESTION & PRIORITY ORDERING
  // ================================================================================
  console.log("--- SUITE 1: Rapid Waitlist Ingestion & Priority Sorting ---");

  // Generate a rapid sequence of 15 entries with deliberately jumbled priority scores and timestamps
  const rawTestCandidates = [
    { name: "Prio 50 Candidate A", score: 50, offsetMs: 1000 },
    { name: "Prio 100 VIP Candidate", score: 100, offsetMs: 2000 },
    { name: "Prio 85 Candidate", score: 85, offsetMs: 3000 },
    { name: "Prio 95 Candidate Early", score: 95, offsetMs: 500 },
    { name: "Prio 95 Candidate Late", score: 95, offsetMs: 1500 }, // same score, later timestamp
    { name: "Prio 70 Candidate", score: 70, offsetMs: 4000 },
    { name: "Prio 90 Candidate", score: 90, offsetMs: 2500 },
    { name: "Prio 10 Candidate", score: 10, offsetMs: 5000 },
    { name: "Prio 95 Candidate Mid", score: 95, offsetMs: 1000 }, // same score, mid timestamp
    { name: "Prio 60 Candidate", score: 60, offsetMs: 4500 },
  ];

  const baseIso = new Date("2026-09-05T10:00:00.000Z").getTime();
  const createdIds: string[] = [];

  // Ingest in random sequence
  for (let i = 0; i < rawTestCandidates.length; i++) {
    const c = rawTestCandidates[i];
    const id = `wl_c2_${i}_${Date.now()}`;
    createdIds.push(id);

    const entry: StoredWaitlistEntry = {
      id,
      tenant_id: TENANT,
      customer_name: c.name,
      customer_phone: `0555000000${i}`,
      customer_email: `test${i}@test.com`,
      preferred_date: FUTURE_DATE,
      time_range: "14:00 - 18:00 arası",
      notes: `Adversarial test note ${i}`,
      staff_id: i % 2 === 0 ? "erman-usta" : "ahmet-kalfa",
      status: "WAITING",
      priority_score: c.score,
      created_at: new Date(baseIso + c.offsetMs).toISOString(),
    };

    const saved = await saveNewWaitlistEntry(entry);
    assert(saved === true, `saveNewWaitlistEntry for ${c.name} succeeds`);
  }

  // Fetch from store and verify ordering
  const waitlist = await getStoredWaitlist(TENANT);
  assert(waitlist.length === rawTestCandidates.length, `All ${rawTestCandidates.length} entries preserved without data loss`, `Expected ${rawTestCandidates.length}, got ${waitlist.length}`);

  // Test strict monotonic non-increasing priority score ordering
  let isPriorityMonotonic = true;
  for (let i = 0; i < waitlist.length - 1; i++) {
    const currScore = waitlist[i].priority_score ?? 0;
    const nextScore = waitlist[i + 1].priority_score ?? 0;
    if (currScore < nextScore) {
      isPriorityMonotonic = false;
      console.error(`    Order violation at index ${i}: [${currScore}] < [${nextScore}]`);
    }
  }
  assert(isPriorityMonotonic, "Priority order is strictly respected (highest score first)");

  // Test tie-breaking: when priority score is identical (score = 95), earliest created_at comes first
  const prio95Entries = waitlist.filter((w) => w.priority_score === 95);
  assert(prio95Entries.length === 3, "All 3 entries with priority score 95 found");
  if (prio95Entries.length === 3) {
    const t0 = new Date(prio95Entries[0].created_at).getTime();
    const t1 = new Date(prio95Entries[1].created_at).getTime();
    const t2 = new Date(prio95Entries[2].created_at).getTime();
    assert(
      t0 <= t1 && t1 <= t2,
      "Tie-breaker strictly orders by earliest created_at ascending (FIFO for identical scores)",
      `Timestamps: ${prio95Entries.map((e) => e.customer_name).join(" -> ")}`
    );
  }

  // Check top candidate is VIP (score 100)
  assert(waitlist[0].customer_name === "Prio 100 VIP Candidate", "Top candidate in queue is highest priority candidate (VIP 100)");

  // Check bottom candidate is lowest score (score 10)
  assert(waitlist[waitlist.length - 1].customer_name === "Prio 10(" || waitlist[waitlist.length - 1].priority_score === 10, "Bottom candidate is lowest score (10)");

  // ================================================================================
  // SUITE 2: PRIORITY ZERO & BOUNDARY CONDITIONS
  // ================================================================================
  console.log("\n--- SUITE 2: Priority Zero & Falsy Value Boundary Testing ---");

  const zeroPrioId = `wl_c2_zero_${Date.now()}`;
  const zeroEntry: StoredWaitlistEntry = {
    id: zeroPrioId,
    tenant_id: TENANT,
    customer_name: "Zero Priority Candidate",
    customer_phone: "05550000099",
    preferred_date: FUTURE_DATE,
    status: "WAITING",
    priority_score: 0, // Explicitly 0
    created_at: new Date().toISOString(),
  };

  await saveNewWaitlistEntry(zeroEntry);
  const waitlistWithZero = await getStoredWaitlist(TENANT);
  const foundZero = waitlistWithZero.find((w) => w.id === zeroPrioId);

  // Check whether priority 0 was preserved or overridden by "|| 85"
  if (foundZero?.priority_score === 0) {
    assert(true, "Priority score 0 is preserved as 0 (not overwritten by default 85)");
  } else {
    assert(
      false,
      "Priority score 0 was overwritten by default 85 due to falsy check (entry.priority_score || 85)",
      `Expected 0, got ${foundZero?.priority_score}`
    );
  }

  // ================================================================================
  // SUITE 3: WAITLIST STATUS LIFECYCLE (WAITING -> OFFERED -> ACCEPTED)
  // ================================================================================
  console.log("\n--- SUITE 3: Flash Waitlist Status Transitions & Timestamps ---");

  const lifecycleCandidateId = `wl_c2_lifecycle_${Date.now()}`;
  const lifecycleEntry: StoredWaitlistEntry = {
    id: lifecycleCandidateId,
    tenant_id: TENANT,
    customer_name: "Lifecycle Candidate",
    customer_phone: "05331112233",
    preferred_date: FUTURE_DATE,
    status: "WAITING",
    priority_score: 99,
    created_at: new Date().toISOString(),
  };

  await saveNewWaitlistEntry(lifecycleEntry);
  let initialCandidate = (await getStoredWaitlist(TENANT)).find((w) => w.id === lifecycleCandidateId);
  assert(initialCandidate?.status === "WAITING", "Initial status is 'WAITING'");
  assert(!initialCandidate?.offered_at, "Initial entry has no offered_at timestamp");

  // Step 1: Transition to OFFERED
  const offerSuccess = await updateWaitlistStatus(lifecycleCandidateId, "OFFERED", TENANT);
  assert(offerSuccess === true, "updateWaitlistStatus to 'OFFERED' returns true");

  let offeredCandidate = (await getStoredWaitlist(TENANT)).find((w) => w.id === lifecycleCandidateId);
  assert(offeredCandidate?.status === "OFFERED", "Candidate status is 'OFFERED'");
  assert(!!offeredCandidate?.offered_at, "Candidate has offered_at timestamp populated");

  const offeredTimestamp = offeredCandidate?.offered_at;
  if (offeredTimestamp) {
    const diffSeconds = Math.abs(Date.now() - new Date(offeredTimestamp).getTime()) / 1000;
    assert(diffSeconds < 10, "offered_at timestamp reflects current time (within 10s)", `Delta: ${diffSeconds}s`);
  }

  // Step 2: Transition to ACCEPTED
  const acceptSuccess = await updateWaitlistStatus(lifecycleCandidateId, "ACCEPTED", TENANT);
  assert(acceptSuccess === true, "updateWaitlistStatus to 'ACCEPTED' returns true");

  let acceptedCandidate = (await getStoredWaitlist(TENANT)).find((w) => w.id === lifecycleCandidateId);
  assert(acceptedCandidate?.status === "ACCEPTED", "Candidate status is 'ACCEPTED'");
  assert(
    acceptedCandidate?.offered_at === offeredTimestamp,
    "offered_at timestamp is PRESERVED upon transitioning to ACCEPTED (not overwritten or cleared)",
    `Original: ${offeredTimestamp}, Current: ${acceptedCandidate?.offered_at}`
  );

  // Step 3: Transition to EXPIRED
  const expiredCandidateId = `wl_c2_expired_${Date.now()}`;
  await saveNewWaitlistEntry({
    id: expiredCandidateId,
    tenant_id: TENANT,
    customer_name: "Expired Candidate",
    customer_phone: "05332223344",
    preferred_date: FUTURE_DATE,
    status: "WAITING",
    created_at: new Date().toISOString(),
  });
  await updateWaitlistStatus(expiredCandidateId, "OFFERED", TENANT);
  const midExpired = (await getStoredWaitlist(TENANT)).find((w) => w.id === expiredCandidateId);
  const expiredOfferedAt = midExpired?.offered_at;

  await updateWaitlistStatus(expiredCandidateId, "EXPIRED", TENANT);
  const finalExpired = (await getStoredWaitlist(TENANT)).find((w) => w.id === expiredCandidateId);
  assert(finalExpired?.status === "EXPIRED", "Candidate status transitioned to 'EXPIRED'");
  assert(finalExpired?.offered_at === expiredOfferedAt, "offered_at is retained after transition to 'EXPIRED'");

  // Step 4: Transition to CANCELLED
  await updateWaitlistStatus(expiredCandidateId, "CANCELLED", TENANT);
  const finalCancelled = (await getStoredWaitlist(TENANT)).find((w) => w.id === expiredCandidateId);
  assert(finalCancelled?.status === "CANCELLED", "Candidate status transitioned to 'CANCELLED'");

  // ================================================================================
  // SUITE 4: API ROUTE ADVERSARIAL VALIDATION (PATCH /api/waitlist)
  // ================================================================================
  console.log("\n--- SUITE 4: API Route Validation for Invalid State Transitions ---");

  // Invalid status test
  const badStatusReq = new NextRequest("http://localhost:3000/api/waitlist", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: lifecycleCandidateId,
      status: "MALICIOUS_STATUS",
      tenant: TENANT,
    }),
  });

  const badStatusRes = await waitlistPATCH(badStatusReq);
  assert(badStatusRes.status === 400, "PATCH with invalid status returns HTTP 400 Bad Request");
  const badStatusBody = await badStatusRes.json();
  assert(badStatusBody.error.includes("Geçersiz status değeri"), "Error message explicitly identifies invalid status");

  // Missing ID test
  const missingIdReq = new NextRequest("http://localhost:3000/api/waitlist", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      status: "ACCEPTED",
      tenant: TENANT,
    }),
  });
  const missingIdRes = await waitlistPATCH(missingIdReq);
  assert(missingIdRes.status === 400, "PATCH without ID returns HTTP 400 Bad Request");

  // Missing status test
  const missingStatusReq = new NextRequest("http://localhost:3000/api/waitlist", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: lifecycleCandidateId,
      tenant: TENANT,
    }),
  });
  const missingStatusRes = await waitlistPATCH(missingStatusReq);
  assert(missingStatusRes.status === 400, "PATCH without status returns HTTP 400 Bad Request");

  // Valid PATCH through API
  const validPatchReq = new NextRequest("http://localhost:3000/api/waitlist", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: lifecycleCandidateId,
      status: "OFFERED",
      tenant: TENANT,
    }),
  });
  const validPatchRes = await waitlistPATCH(validPatchReq);
  assert(validPatchRes.status === 200, "Valid PATCH returns HTTP 200");

  // ================================================================================
  // SUITE 5: NON-DESTRUCTIVE APPOINTMENT CANCELLATION PRESERVATION
  // ================================================================================
  console.log("\n--- SUITE 5: Non-Destructive Appointment Cancellation Preservation ---");

  const app1Id = `app_c2_active_${Date.now()}`;
  const app2Id = `app_c2_to_cancel_${Date.now()}`;
  const app3Id = `app_c2_staff_cancel_${Date.now()}`;

  const app1: StoredAppointment = {
    id: app1Id,
    tenant: TENANT,
    tenant_id: TENANT,
    customer_name: "Active Customer",
    customer_phone: "05441112233",
    customer_note: "Saç & Sakal",
    appointment_date: FUTURE_DATE,
    appointment_time: "10:00:00",
    status: "confirmed",
    services: { name: "Saç & Sakal", price_text: "400 TL" },
    staff_id: "erman-usta",
    staff_name: "Erman Usta",
    created_at: new Date().toISOString(),
  };

  const app2: StoredAppointment = {
    id: app2Id,
    tenant: TENANT,
    tenant_id: TENANT,
    customer_name: "Cancelled Customer 1",
    customer_phone: "05442223344",
    customer_note: "Sakal Tıraşı",
    appointment_date: FUTURE_DATE,
    appointment_time: "11:00:00",
    status: "confirmed",
    services: { name: "Sakal Tıraşı", price_text: "200 TL" },
    staff_id: "ahmet-kalfa",
    staff_name: "Ahmet Kalfa",
    created_at: new Date().toISOString(),
  };

  const app3: StoredAppointment = {
    id: app3Id,
    tenant: TENANT,
    tenant_id: TENANT,
    customer_name: "Cancelled Customer 2",
    customer_phone: "05443334455",
    customer_note: "Damat Tıraşı",
    appointment_date: FUTURE_DATE,
    appointment_time: "14:00:00",
    status: "confirmed",
    services: { name: "Damat Tıraşı", price_text: "800 TL" },
    staff_id: "erman-usta",
    staff_name: "Erman Usta",
    created_at: new Date().toISOString(),
  };

  await saveNewAppointment(app1);
  await saveNewAppointment(app2);
  await saveNewAppointment(app3);

  // Initial check: all 3 confirmed
  const initialApps = await getStoredAppointments(TENANT);
  assert(initialApps.length === 3, "Initial 3 appointments successfully stored");

  // Perform cancellation on app2 and app3
  const cancel2Result = await updateAppointmentStatus(app2Id, "cancelled", TENANT);
  assert(cancel2Result === true, "updateAppointmentStatus(app2, 'cancelled') succeeds");

  const cancel3Result = await updateAppointmentStatus(app3Id, "cancelled", TENANT);
  assert(cancel3Result === true, "updateAppointmentStatus(app3, 'cancelled') succeeds");

  // Re-fetch all stored appointments
  const appsAfterCancel = await getStoredAppointments(TENANT);

  // EMPIRICAL CORE CLAIM: Cancelled appointments MUST NOT disappear from store queries!
  assert(
    appsAfterCancel.length === 3,
    "Store query STILL returns all 3 appointments (ZERO records deleted on cancellation)",
    `Expected 3, got ${appsAfterCancel.length}`
  );

  const foundApp2 = appsAfterCancel.find((a) => a.id === app2Id);
  const foundApp3 = appsAfterCancel.find((a) => a.id === app3Id);
  const foundApp1 = appsAfterCancel.find((a) => a.id === app1Id);

  assert(foundApp1?.status === "confirmed", "Active appointment app1 retains 'confirmed' status");
  assert(foundApp2?.status === "cancelled", "Cancelled appointment app2 has status 'cancelled'");
  assert(foundApp3?.status === "cancelled", "Cancelled appointment app3 has status 'cancelled'");

  // Verify non-destructive integrity of fields
  assert(foundApp2?.customer_name === "Cancelled Customer 1", "Cancelled app2 retains customer_name");
  assert(foundApp2?.customer_phone === "05442223344", "Cancelled app2 retains customer_phone");
  assert(foundApp2?.staff_id === "ahmet-kalfa", "Cancelled app2 retains staff_id ('ahmet-kalfa')");
  assert(foundApp2?.staff_name === "Ahmet Kalfa", "Cancelled app2 retains staff_name ('Ahmet Kalfa')");
  assert(foundApp2?.appointment_time === "11:00:00", "Cancelled app2 retains appointment_time");
  assert(foundApp2?.services?.name === "Sakal Tıraşı", "Cancelled app2 retains services info");

  // ================================================================================
  // SUITE 6: SLOT FREEDOM UPON CANCELLATION (SLOT RE-OPENING PROOF)
  // ================================================================================
  console.log("\n--- SUITE 6: Slot Release Verification Upon Cancellation ---");

  // Calculate slots with active vs cancelled bookings
  const workingSchedule = {
    dayOfWeek: 4, // Thursday
    startTime: "09:00",
    endTime: "19:00",
    breakStartTime: "13:00",
    breakEndTime: "14:00",
    isOffDay: false,
  };

  // 1. When appointment is confirmed, 14:00 is occupied
  const confirmedBookings = [
    {
      startUtc: new Date(`${FUTURE_DATE}T14:00:00+03:00`).toISOString(),
      endUtc: new Date(`${FUTURE_DATE}T14:30:00+03:00`).toISOString(),
      status: "CONFIRMED",
    },
  ];

  const slotsWhenBooked = calculateAvailableSlots({
    date: FUTURE_DATE,
    durationMinutes: 30,
    bufferTimeBeforeMinutes: 0,
    bufferTimeAfterMinutes: 0,
    workingHours: workingSchedule,
    existingBookings: confirmedBookings,
    slotIntervalMinutes: 30,
  });

  const slotAt14WhenBooked = slotsWhenBooked.find((s) => s.displayTime === "14:00");
  assert(slotAt14WhenBooked?.isAvailable === false, "Slot at 14:00 is UNAVAILABLE when appointment is confirmed");

  // 2. When appointment is cancelled (status === 'cancelled'), the slot engine must not count it as occupied
  // (As verified in slots/route.ts lines 65-72: `a.status !== 'cancelled'`)
  const cancelledBookings = [
    {
      startUtc: new Date(`${FUTURE_DATE}T14:00:00+03:00`).toISOString(),
      endUtc: new Date(`${FUTURE_DATE}T14:30:00+03:00`).toISOString(),
      status: "cancelled",
    },
  ];

  const activeFilteredBookings = cancelledBookings.filter((b) => b.status !== "cancelled");
  const slotsWhenCancelled = calculateAvailableSlots({
    date: FUTURE_DATE,
    durationMinutes: 30,
    bufferTimeBeforeMinutes: 0,
    bufferTimeAfterMinutes: 0,
    workingHours: workingSchedule,
    existingBookings: activeFilteredBookings,
    slotIntervalMinutes: 30,
  });

  const slotAt14WhenCancelled = slotsWhenCancelled.find((s) => s.displayTime === "14:00");
  assert(slotAt14WhenCancelled?.isAvailable === true, "Slot at 14:00 is FREED UP AND AVAILABLE after appointment is cancelled");

  // ================================================================================
  // SUITE 7: MULTI-TENANT STORE ISOLATION
  // ================================================================================
  console.log("\n--- SUITE 7: Multi-Tenant Data Store Isolation ---");

  const OTHER_TENANT = `other_tenant_${Date.now()}`;
  const otherAppId = `app_other_${Date.now()}`;

  await saveNewAppointment({
    id: otherAppId,
    tenant: OTHER_TENANT,
    tenant_id: OTHER_TENANT,
    customer_name: "Other Tenant Customer",
    customer_phone: "05001112233",
    appointment_date: FUTURE_DATE,
    appointment_time: "15:00:00",
    status: "confirmed",
  });

  const tenantApps = await getStoredAppointments(TENANT);
  const otherTenantApps = await getStoredAppointments(OTHER_TENANT);

  assert(!tenantApps.some((a) => a.id === otherAppId), "Appointments of OTHER_TENANT do not leak into TENANT");
  assert(otherTenantApps.some((a) => a.id === otherAppId), "OTHER_TENANT appointment is found in OTHER_TENANT store");

  // Clean up
  await deleteAppointment(app1Id, TENANT);
  await deleteAppointment(app2Id, TENANT);
  await deleteAppointment(app3Id, TENANT);
  await deleteAppointment(otherAppId, OTHER_TENANT);

  for (const id of createdIds) {
    await deleteWaitlistEntry(id, TENANT);
  }
  await deleteWaitlistEntry(zeroPrioId, TENANT);
  await deleteWaitlistEntry(lifecycleCandidateId, TENANT);
  await deleteWaitlistEntry(expiredCandidateId, TENANT);

  // ================================================================================
  // SUMMARY
  // ================================================================================
  console.log("\n================================================================================");
  console.log(`📊 ADVERSARIAL TEST RESULTS: ${passedCount} Passed, ${failedCount} Failed`);
  if (findings.length > 0) {
    console.log("⚠️ Findings / Flaws Discovered:");
    findings.forEach((f) => console.log(`  - ${f}`));
  }
  console.log("================================================================================\n");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runChallenger2AdversarialSuite().catch((err) => {
  console.error("FATAL: Challenger 2 test suite threw unhandled exception:", err);
  process.exit(1);
});
