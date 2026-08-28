import { calculateAvailableSlots } from "../lib/engine/slotCalculator";
import { slotLockManager } from "../lib/engine/lockManager";

/**
 * 🔍 Reality Checker & QA Test Runner
 * Verifies core slot calculation, buffer times, locks, and race conditions.
 */

function runTests() {
  console.log("=========================================");
  console.log("🧪 QA Engine - Running Automated Reality Checks");
  console.log("=========================================\n");

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

  const workingHours = {
    dayOfWeek: 1 as const, // Monday
    startTime: "09:00",
    endTime: "12:00",
    breakStartTime: "10:30",
    breakEndTime: "11:00",
    isOffDay: false,
  };

  // Test 1: Standard slot generation without existing bookings
  const slots1 = calculateAvailableSlots({
    date: "2026-09-01",
    durationMinutes: 30,
    workingHours,
    existingBookings: [],
    slotIntervalMinutes: 30,
  });

  assert(slots1.length === 6, "Total generated slots from 09:00 to 12:00 (30 min step) should be 6");
  
  const breakSlot = slots1.find((s) => s.displayTime === "10:30");
  assert(breakSlot?.isAvailable === false, "Slot at 10:30 during break should NOT be available");

  // Test 2: Overlap detection with existing booking
  const slots2 = calculateAvailableSlots({
    date: "2026-09-01",
    durationMinutes: 30,
    workingHours,
    existingBookings: [
      {
        startUtc: new Date("2026-09-01T09:30:00+03:00").toISOString(),
        endUtc: new Date("2026-09-01T10:00:00+03:00").toISOString(),
        status: "confirmed",
      },
    ],
    slotIntervalMinutes: 30,
  });

  const bookedSlot = slots2.find((s) => s.displayTime === "09:30");
  assert(bookedSlot?.isAvailable === false, "Slot at 09:30 with confirmed booking must be marked UNAVAILABLE");

  const freeSlot = slots2.find((s) => s.displayTime === "09:00");
  assert(freeSlot?.isAvailable === true, "Slot at 09:00 without booking should be AVAILABLE");

  // Test 3: Concurrency Lock Manager test
  const lock1 = slotLockManager.acquireLock(
    "tenant-1",
    "service-1",
    "2026-09-01T14:00:00Z",
    "user-session-A"
  );
  assert(lock1.success === true, "User A should successfully acquire slot lock");

  const lock2 = slotLockManager.acquireLock(
    "tenant-1",
    "service-1",
    "2026-09-01T14:00:00Z",
    "user-session-B"
  );
  assert(lock2.success === false, "User B must be BLOCKED from locking the same slot simultaneously");

  slotLockManager.releaseLock("tenant-1", "service-1", "2026-09-01T14:00:00Z", "user-session-A");
  assert(
    slotLockManager.isLocked("tenant-1", "service-1", "2026-09-01T14:00:00Z") === false,
    "Lock should be cleanly released after checkout"
  );

  console.log("\n=========================================");
  console.log(`📊 QA Results: ${passed} Passed, ${failed} Failed`);
  console.log("=========================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
