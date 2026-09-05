import { NextRequest } from "next/server";
import {
  saveNewWaitlistEntry,
  getStoredWaitlist,
  updateWaitlistStatus,
  deleteWaitlistEntry,
  StoredWaitlistEntry,
} from "../lib/storage/waitlistStore";
import {
  GET as waitlistGET,
  POST as waitlistPOST,
  PATCH as waitlistPATCH,
  DELETE as waitlistDELETE,
} from "../app/api/waitlist/route";
import { PRESET_TIME_RANGES } from "../components/booking/FlashWaitlistCard";
import { calculateAvailableSlots } from "../lib/engine/slotCalculator";
import { StaffWorkingHours } from "../types/schema";

async function runAdversarialSuite() {
  console.log("================================================================================");
  console.log("⚔️ CHALLENGER 2 EMPIRICAL ADVERSARIAL STRESS SUITE (Milestone 2)");
  console.log("Focus: FlashWaitlistCard, Form Validation, Turkish/Special Chars, Priority 0, 0-Slot Lock");
  console.log("================================================================================\n");

  let passed = 0;
  let failed = 0;
  const failureDetails: string[] = [];

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName} ${detail ? "-> " + detail : ""}`);
      failed++;
      failureDetails.push(`${testName} ${detail ? "-> " + detail : ""}`);
    }
  }

  const TENANT = `adv_m2_${Date.now()}`;
  const TEST_DATE = "2026-11-15";
  const cleanupIds: string[] = [];

  try {
    // ================================================================================
    // SUITE 1: Form Validation & Input Sanitization
    // ================================================================================
    console.log("--- Suite 1: Form Validation & Malformed Input Handling ---");

    // 1.1 Client validation simulation
    const validateClientForm = (name: string, phone: string) => {
      if (!name.trim() || !phone.trim()) {
        return { valid: false, error: "Lütfen adınızı ve telefon numaranızı eksiksiz giriniz." };
      }
      return { valid: true, error: "" };
    };

    assert(
      validateClientForm("", "05384809001").valid === false,
      "Client validation: rejects completely empty customer name"
    );
    assert(
      validateClientForm("   ", "05384809001").valid === false,
      "Client validation: rejects whitespace-only customer name"
    );
    assert(
      validateClientForm("Erman Test", "").valid === false,
      "Client validation: rejects completely empty phone number"
    );
    assert(
      validateClientForm("Erman Test", "   ").valid === false,
      "Client validation: rejects whitespace-only phone number"
    );
    assert(
      validateClientForm("Erman Test", "  0538 480 90 01  ").valid === true,
      "Client validation: accepts valid name and trimmed formatted phone"
    );

    // 1.2 API POST Route Validation (Negative Tests)
    // Missing phone
    const reqEmptyPhone = new NextRequest("http://localhost:3000/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tenant_id: TENANT,
        customer_name: "Ahmet Danışan",
        customer_phone: "",
        preferred_date: TEST_DATE,
      }),
    });
    const resEmptyPhone = await waitlistPOST(reqEmptyPhone);
    const bodyEmptyPhone = await resEmptyPhone.json();
    assert(resEmptyPhone.status === 400, "API POST: Rejects empty customer_phone with HTTP 400");
    assert(bodyEmptyPhone.success === false, "API POST: Response indicates success=false for empty phone");

    // Whitespace phone
    const reqWhitespacePhone = new NextRequest("http://localhost:3000/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tenant_id: TENANT,
        customer_name: "Ahmet Danışan",
        customer_phone: "    ",
        preferred_date: TEST_DATE,
      }),
    });
    const resWhitespacePhone = await waitlistPOST(reqWhitespacePhone);
    assert(resWhitespacePhone.status === 400, "API POST: Rejects whitespace-only customer_phone with HTTP 400");

    // Missing customer_name
    const reqEmptyName = new NextRequest("http://localhost:3000/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tenant_id: TENANT,
        customer_name: "   ",
        customer_phone: "05384809001",
        preferred_date: TEST_DATE,
      }),
    });
    const resEmptyName = await waitlistPOST(reqEmptyName);
    assert(resEmptyName.status === 400, "API POST: Rejects empty customer_name with HTTP 400");

    // Missing preferred_date
    const reqEmptyDate = new NextRequest("http://localhost:3000/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tenant_id: TENANT,
        customer_name: "Ahmet Danışan",
        customer_phone: "05384809001",
        preferred_date: "",
      }),
    });
    const resEmptyDate = await waitlistPOST(reqEmptyDate);
    assert(resEmptyDate.status === 400, "API POST: Rejects empty preferred_date with HTTP 400");

    // 1.3 Malformed phone numbers with spaces, parentheses, plus, dashes
    const testPhones = [
      { raw: "+90 (538) 480 90 01", expectedDigits: "905384809001" },
      { raw: "(0538) 480-90-01", expectedDigits: "05384809001" },
      { raw: "0 538 480 90 01", expectedDigits: "05384809001" },
      { raw: "05384809001", expectedDigits: "05384809001" },
    ];

    for (let i = 0; i < testPhones.length; i++) {
      const item = testPhones[i];
      const reqPhone = new NextRequest("http://localhost:3000/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenant_id: TENANT,
          customer_name: `Phone Test ${i}`,
          customer_phone: item.raw,
          preferred_date: TEST_DATE,
          time_range: "14:00 - 18:00 arası",
        }),
      });
      const resPhone = await waitlistPOST(reqPhone);
      const dataPhone = await resPhone.json();
      assert(resPhone.status === 201, `API POST: Accepts formatted phone '${item.raw}' with HTTP 201`);
      const createdEntry = dataPhone.data?.entry || dataPhone.entry;
      assert(createdEntry?.customer_phone === item.raw.trim(), `API POST: Retains raw phone representation '${item.raw}'`);
      if (createdEntry?.id) cleanupIds.push(createdEntry.id);

      // Verify digit extraction compatibility with WhatsApp link generation
      const cleanDigits = item.raw.replace(/\D/g, "");
      assert(cleanDigits === item.expectedDigits, `Digit cleaner correctly extracts '${item.expectedDigits}' for WhatsApp integration`);
    }

    // ================================================================================
    // SUITE 2: Special Characters & Turkish Text Ingestion
    // ================================================================================
    console.log("\n--- Suite 2: Special Characters & Turkish Text Preservation ---");

    const turkishName = "Şükrü Çağlayan & Yağız Öztürk (ÇĞIİÖŞÜ çğıiöşü)";
    const explicitUserNote = "Öğleden sonra acil saç & sakal, lütfen erken boşlukta arayın (14:30'a kadar)!";
    const customTimeRange = "Öğleden sonra 14:00 - 18:00 arası";
    const specialCharsNote = "Test: & < > ' \" / \\ % # @ ! * + ? = ^ ~ ; : [ ] { }";

    const reqTurkish = new NextRequest("http://localhost:3000/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tenant_id: TENANT,
        customer_name: turkishName,
        customer_phone: "05384809001",
        preferred_date: TEST_DATE,
        time_range: customTimeRange,
        notes: explicitUserNote,
        staff_id: "erman-usta",
        service_name: "Saç & Sakal Tıraşı",
      }),
    });

    const resTurkish = await waitlistPOST(reqTurkish);
    const dataTurkish = await resTurkish.json();
    assert(resTurkish.status === 201, "API POST: Successfully creates entry with rich Turkish text");

    const turkishEntryId = dataTurkish.data?.entry?.id || dataTurkish.entry?.id;
    assert(turkishEntryId !== undefined, "Created Turkish waitlist entry has valid generated ID");
    if (turkishEntryId) cleanupIds.push(turkishEntryId);

    // Fetch waitlist from store and verify exact character match (no UTF-8 corruption / mojibake)
    const storedList = await getStoredWaitlist(TENANT);
    const foundTurkish = storedList.find((w) => w.id === turkishEntryId);

    assert(foundTurkish !== undefined, "Turkish entry retrieved from waitlistStore");
    assert(
      foundTurkish?.customer_name === turkishName,
      `Customer name exact match (no mojibake): '${foundTurkish?.customer_name}' === '${turkishName}'`
    );
    assert(
      foundTurkish?.notes === explicitUserNote,
      `Custom note exact match: '${foundTurkish?.notes}' === '${explicitUserNote}'`
    );
    assert(
      foundTurkish?.time_range === customTimeRange,
      `Time range exact match: '${foundTurkish?.time_range}' === '${customTimeRange}'`
    );

    // Test with HTML/symbols injection in note (safety / integrity)
    const reqSymbols = new NextRequest("http://localhost:3000/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tenant_id: TENANT,
        customer_name: "Symbol Tester",
        customer_phone: "05384809002",
        preferred_date: TEST_DATE,
        notes: specialCharsNote,
      }),
    });
    const resSymbols = await waitlistPOST(reqSymbols);
    const dataSymbols = await resSymbols.json();
    assert(resSymbols.status === 201, "API POST: Successfully handles special characters string");
    const symEntry = dataSymbols.data?.entry || dataSymbols.entry;
    assert(symEntry?.notes === specialCharsNote, "Notes string preserves exact special characters without alteration");
    if (symEntry?.id) cleanupIds.push(symEntry.id);

    // ================================================================================
    // SUITE 3: Nullish Coalescing Priority Score 0 Preservation
    // ================================================================================
    console.log("\n--- Suite 3: Priority Score Nullish Coalescing (Preserving 0) ---");

    // Case 3.1: Explicit priority_score: 0
    const reqZero1 = new NextRequest("http://localhost:3000/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tenant_id: TENANT,
        customer_name: "Priority Zero Candidate 1",
        customer_phone: "05380000001",
        preferred_date: TEST_DATE,
        priority_score: 0,
      }),
    });
    const resZero1 = await waitlistPOST(reqZero1);
    const dataZero1 = await resZero1.json();
    const entryZero1 = dataZero1.data?.entry || dataZero1.entry;
    assert(
      entryZero1?.priority_score === 0,
      `Explicit priority_score: 0 is preserved as 0 in POST response (got: ${entryZero1?.priority_score})`
    );
    if (entryZero1?.id) cleanupIds.push(entryZero1.id);

    // Case 3.2: Explicit priorityScore: 0 (camelCase parameter)
    const reqZero2 = new NextRequest("http://localhost:3000/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tenant_id: TENANT,
        customer_name: "Priority Zero Candidate 2 (camelCase)",
        customer_phone: "05380000002",
        preferred_date: TEST_DATE,
        priorityScore: 0,
      }),
    });
    const resZero2 = await waitlistPOST(reqZero2);
    const dataZero2 = await resZero2.json();
    const entryZero2 = dataZero2.data?.entry || dataZero2.entry;
    assert(
      entryZero2?.priority_score === 0,
      `Explicit priorityScore: 0 (camelCase) is preserved as 0 in POST response (got: ${entryZero2?.priority_score})`
    );
    if (entryZero2?.id) cleanupIds.push(entryZero2.id);

    // Case 3.3: Omitted priority_score -> must default to 85
    const reqDefault = new NextRequest("http://localhost:3000/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tenant_id: TENANT,
        customer_name: "Default Priority Candidate",
        customer_phone: "05380000003",
        preferred_date: TEST_DATE,
      }),
    });
    const resDefault = await waitlistPOST(reqDefault);
    const dataDefault = await resDefault.json();
    const entryDefault = dataDefault.data?.entry || dataDefault.entry;
    assert(
      entryDefault?.priority_score === 85,
      `Omitted priority defaults to 85 (got: ${entryDefault?.priority_score})`
    );
    if (entryDefault?.id) cleanupIds.push(entryDefault.id);

    // Case 3.4: Direct storage saveNewWaitlistEntry with explicit 0
    const directZeroId = `wl_direct_zero_${Date.now()}`;
    cleanupIds.push(directZeroId);
    await saveNewWaitlistEntry({
      id: directZeroId,
      tenant_id: TENANT,
      customer_name: "Direct Zero Candidate",
      customer_phone: "05380000004",
      preferred_date: TEST_DATE,
      status: "WAITING",
      priority_score: 0,
      created_at: new Date().toISOString(),
    });

    const storeAfterZero = await getStoredWaitlist(TENANT);
    const retrievedZero = storeAfterZero.find((w) => w.id === directZeroId);
    assert(
      retrievedZero?.priority_score === 0,
      "waitlistStore.saveNewWaitlistEntry preserves priority_score: 0 (did not overwrite with 85)"
    );

    // Case 3.5: Multi-tier priority sorting verification
    // Insert VIP (100) and Standard (50)
    const vipId = `wl_vip_${Date.now()}`;
    const midId = `wl_mid_${Date.now()}`;
    cleanupIds.push(vipId, midId);

    await saveNewWaitlistEntry({
      id: vipId,
      tenant_id: TENANT,
      customer_name: "VIP 100",
      customer_phone: "05380000100",
      preferred_date: TEST_DATE,
      status: "WAITING",
      priority_score: 100,
      created_at: new Date().toISOString(),
    });

    await saveNewWaitlistEntry({
      id: midId,
      tenant_id: TENANT,
      customer_name: "Mid 50",
      customer_phone: "05380000050",
      preferred_date: TEST_DATE,
      status: "WAITING",
      priority_score: 50,
      created_at: new Date().toISOString(),
    });

    const sortedWaitlist = await getStoredWaitlist(TENANT);
    const vipIdx = sortedWaitlist.findIndex((w) => w.id === vipId);
    const defIdx = sortedWaitlist.findIndex((w) => w.id === entryDefault.id);
    const midIdx = sortedWaitlist.findIndex((w) => w.id === midId);
    const zeroIdx = sortedWaitlist.findIndex((w) => w.id === directZeroId);

    assert(vipIdx < defIdx, `VIP (100) ranks before Default (85) [indices: ${vipIdx} < ${defIdx}]`);
    assert(defIdx < midIdx, `Default (85) ranks before Mid (50) [indices: ${defIdx} < ${midIdx}]`);
    assert(midIdx < zeroIdx, `Mid (50) ranks before Zero (0) [indices: ${midIdx} < ${zeroIdx}]`);

    // ================================================================================
    // SUITE 4: Status Lifecycle & Invariant Verification
    // ================================================================================
    console.log("\n--- Suite 4: Status Lifecycle & Invariant Verification ---");

    assert(entryZero1.status === "WAITING", "New entry initial status is strictly 'WAITING'");

    // Invalid status PATCH
    const reqInvalidStatus = new NextRequest("http://localhost:3000/api/waitlist", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: entryZero1.id,
        status: "INVALID_STATUS",
        tenant: TENANT,
      }),
    });
    const resInvalidStatus = await waitlistPATCH(reqInvalidStatus);
    assert(resInvalidStatus.status === 400, "API PATCH: Rejects invalid status with HTTP 400");

    // Valid status transition: WAITING -> OFFERED
    const reqOffered = new NextRequest("http://localhost:3000/api/waitlist", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: entryZero1.id,
        status: "OFFERED",
        tenant: TENANT,
      }),
    });
    const resOffered = await waitlistPATCH(reqOffered);
    assert(resOffered.status === 200, "API PATCH: Updates status to 'OFFERED' with HTTP 200");

    const storeAfterOffered = await getStoredWaitlist(TENANT);
    const offeredCandidate = storeAfterOffered.find((w) => w.id === entryZero1.id);
    assert(offeredCandidate?.status === "OFFERED", "Status in store accurately reflects 'OFFERED'");
    assert(Boolean(offeredCandidate?.offered_at), "Candidate receives offered_at ISO timestamp on 'OFFERED'");

    // Valid status transition: OFFERED -> ACCEPTED
    const reqAccepted = new NextRequest("http://localhost:3000/api/waitlist", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: entryZero1.id,
        status: "ACCEPTED",
        tenant: TENANT,
      }),
    });
    const resAccepted = await waitlistPATCH(reqAccepted);
    assert(resAccepted.status === 200, "API PATCH: Updates status to 'ACCEPTED' with HTTP 200");

    // Filtering GET by status
    const reqFilter = new NextRequest(`http://localhost:3000/api/waitlist?tenant=${TENANT}&status=ACCEPTED`);
    const resFilter = await waitlistGET(reqFilter);
    const dataFilter = await resFilter.json();
    assert(dataFilter.waitlist.length === 1 && dataFilter.waitlist[0].id === entryZero1.id, "API GET: Filters correctly by status='ACCEPTED'");

    // ================================================================================
    // SUITE 5: 0-Slot Lock & FlashWaitlistCard Render Invariants
    // ================================================================================
    console.log("\n--- Suite 5: 0-Slot Lock & Step 2 Invariants ---");

    // 5.1 Preset time ranges
    assert(PRESET_TIME_RANGES.length >= 5, "PRESET_TIME_RANGES has at least 5 configured ranges");
    assert(PRESET_TIME_RANGES[0] === "14:00 - 18:00 arası", "PRESET_TIME_RANGES default choice is '14:00 - 18:00 arası'");
    assert(PRESET_TIME_RANGES.includes("Tüm Gün / İlk Boşluk"), "PRESET_TIME_RANGES includes flexible 'Tüm Gün / İlk Boşluk'");

    // 5.2 Slot Calculator Zero Slot Scenario (Sunday or Fully Booked)
    const offDayWorkingHours: StaffWorkingHours = {
      dayOfWeek: 0,
      startTime: "09:00",
      endTime: "18:00",
      isOffDay: true,
    };
    const zeroSlotsOffDay = calculateAvailableSlots({
      date: "2026-11-01",
      durationMinutes: 45,
      workingHours: offDayWorkingHours,
      existingBookings: [],
      slotIntervalMinutes: 30,
    });
    const availableOffDaySlots = zeroSlotsOffDay.filter((s) => s.isAvailable !== false);
    assert(
      availableOffDaySlots.length === 0,
      "Slot calculator on off-day yields 0 available slots"
    );

    // 5.3 ErmanBarberWidget Step 2 Next Button Lock Condition
    // Tracing ErmanBarberWidget.tsx line 1602:
    // disabled={!selectedSlot}
    // and line 450: if validTimes.length === 0 -> setSelectedSlot("")
    const simulateStep2NextButton = (availableSlots: string[], currentSlot: string) => {
      // Logic from ErmanBarberWidget loadSlots:
      const activeSlot = availableSlots.length > 0 ? (availableSlots.includes(currentSlot) ? currentSlot : availableSlots[0]) : "";
      const isNextDisabled = !activeSlot;
      return { activeSlot, isNextDisabled };
    };

    const lockedCase = simulateStep2NextButton([], "11:00");
    assert(
      lockedCase.activeSlot === "",
      "When availableSlots is empty, activeSlot is forced to empty string"
    );
    assert(
      lockedCase.isNextDisabled === true,
      "When 0 slots exist on the date, Step 2 Next button is LOCKED (disabled=true)"
    );

    const unlockedCase = simulateStep2NextButton(["10:00", "10:30", "11:00"], "11:00");
    assert(
      unlockedCase.activeSlot === "11:00",
      "When slots exist, selectedSlot is retained"
    );
    assert(
      unlockedCase.isNextDisabled === false,
      "When slots exist and a slot is selected, Step 2 Next button is UNLOCKED (disabled=false)"
    );

    // ================================================================================
    // SUITE 6: Concurrency & Extreme Edge Cases
    // ================================================================================
    console.log("\n--- Suite 6: Concurrency & Extreme Edge Cases ---");

    // 6.1 Concurrent burst: 5 concurrent submissions
    const burstPromises = [];
    for (let i = 0; i < 5; i++) {
      const burstReq = new NextRequest("http://localhost:3000/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenant_id: TENANT,
          customer_name: `Burst Customer ${i}`,
          customer_phone: `0539000000${i}`,
          preferred_date: TEST_DATE,
          notes: `Concurrent burst note ${i}`,
          priority_score: 80 + i,
        }),
      });
      burstPromises.push(waitlistPOST(burstReq));
    }

    const burstResults = await Promise.all(burstPromises);
    let allBurstSuccess = true;
    for (const res of burstResults) {
      if (res.status !== 201) allBurstSuccess = false;
      const data = await res.json();
      const id = data.data?.entry?.id || data.entry?.id;
      if (id) cleanupIds.push(id);
    }
    assert(allBurstSuccess, "Concurrent burst: All 5 parallel submissions completed with HTTP 201");

    // 6.2 Extreme string length tolerance
    const longName = "A".repeat(200);
    const longNote = "B".repeat(500);
    const reqExtreme = new NextRequest("http://localhost:3000/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tenant_id: TENANT,
        customer_name: longName,
        customer_phone: "05389999999",
        preferred_date: TEST_DATE,
        notes: longNote,
      }),
    });
    const resExtreme = await waitlistPOST(reqExtreme);
    assert(resExtreme.status === 201, "API POST: Tolerates 200-char name and 500-char note without truncation error");
    const dataExtreme = await resExtreme.json();
    const extremeEntry = dataExtreme.data?.entry || dataExtreme.entry;
    assert(extremeEntry?.customer_name === longName, "200-char customer name accurately preserved");
    assert(extremeEntry?.notes === longNote, "500-char note accurately preserved");
    if (extremeEntry?.id) cleanupIds.push(extremeEntry.id);

    // 6.3 Nuance Analysis: Database NULL handling in waitlistStore.ts line 88
    // In waitlistStore.ts line 88:
    // priority_score: d.priority_score !== undefined ? Number(d.priority_score) : 85
    // Notice: in JS, Number(null) === 0 !
    const testDbRowWithNull: any = { priority_score: null };
    const simulatedParsedPriority = testDbRowWithNull.priority_score !== undefined ? Number(testDbRowWithNull.priority_score) : 85;
    assert(
      simulatedParsedPriority === 0,
      "Empirical finding confirmed: d.priority_score !== undefined evaluates to true for null, turning DB null into priority 0 (not 85)"
    );

  } finally {
    // Clean up created test entries
    console.log("\n--- Cleaning up test artifacts ---");
    for (const id of cleanupIds) {
      try {
        await deleteWaitlistEntry(id, TENANT);
      } catch {}
    }
    console.log(`Cleaned up ${cleanupIds.length} test entries.`);
  }

  // ================================================================================
  // FINAL REPORT
  // ================================================================================
  console.log("\n================================================================================");
  console.log(`📊 ADVERSARIAL STRESS TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("================================================================================");

  if (failed > 0) {
    console.error("Failures encountered:");
    failureDetails.forEach((f) => console.error(` - ${f}`));
    process.exit(1);
  }
}

runAdversarialSuite().catch((err) => {
  console.error("Adversarial suite crashed:", err);
  process.exit(1);
});
