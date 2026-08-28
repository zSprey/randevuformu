import { calculateAvailableSlots } from "../lib/engine/slotCalculator";
import { slotLockManager } from "../lib/engine/lockManager";
import { BruteForceGuard } from "../lib/security/bruteForceGuard";

/**
 * 🔍 Reality Checker & QA Test Runner
 * Verifies core slot calculation, buffer times, locks, race conditions,
 * group capacity limits, session timeouts, and brute-force defenses.
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

  // -------------------------------------------------------------------------
  // SUITE 1: Standard Slot Generation & Working Hours
  // -------------------------------------------------------------------------
  console.log("--- Suite 1: Slot Calculation & Working Hours ---");
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

  // Off-day check
  const offDaySlots = calculateAvailableSlots({
    date: "2026-09-06",
    durationMinutes: 30,
    workingHours: { ...workingHours, isOffDay: true },
    existingBookings: [],
  });
  assert(offDaySlots.length === 0, "Off-day working hours must return 0 slots");

  // -------------------------------------------------------------------------
  // SUITE 2: Existing Bookings & Buffer Times
  // -------------------------------------------------------------------------
  console.log("\n--- Suite 2: Existing Bookings & Buffer Times ---");
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
      {
        startUtc: new Date("2026-09-01T11:30:00+03:00").toISOString(),
        endUtc: new Date("2026-09-01T12:00:00+03:00").toISOString(),
        status: "CANCELLED", // Cancelled booking should NOT block slot
      },
    ],
    slotIntervalMinutes: 30,
  });

  const bookedSlot = slots2.find((s) => s.displayTime === "09:30");
  assert(bookedSlot?.isAvailable === false, "Slot at 09:30 with confirmed booking must be marked UNAVAILABLE");

  const freeSlot = slots2.find((s) => s.displayTime === "09:00");
  assert(freeSlot?.isAvailable === true, "Slot at 09:00 without booking should be AVAILABLE");

  const cancelledSlot = slots2.find((s) => s.displayTime === "11:30");
  assert(cancelledSlot?.isAvailable === true, "Slot at 11:30 with CANCELLED booking must remain AVAILABLE");

  // Buffer time collision check (10 min buffer before/after)
  const bufferSlots = calculateAvailableSlots({
    date: "2026-09-01",
    durationMinutes: 30,
    bufferTimeBeforeMinutes: 10,
    bufferTimeAfterMinutes: 10,
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
  // Slot at 09:00 ends at 09:30 + 10 min buffer after = 09:40, overlaps 09:30 booking
  const bufferedSlot = bufferSlots.find((s) => s.displayTime === "09:00");
  assert(bufferedSlot?.isAvailable === false, "Adjacent slot with 10 min buffer overlapping booking must be UNAVAILABLE");

  // -------------------------------------------------------------------------
  // SUITE 3: Group Capacity Limits (Slot Calculator)
  // -------------------------------------------------------------------------
  console.log("\n--- Suite 3: Group Capacity Limits (Slot Calculator) ---");
  const groupSlots = calculateAvailableSlots({
    date: "2026-09-01",
    durationMinutes: 30,
    workingHours,
    maxCapacity: 5,
    existingBookings: [
      // 3 active bookings at 09:00
      {
        startUtc: new Date("2026-09-01T09:00:00+03:00").toISOString(),
        endUtc: new Date("2026-09-01T09:30:00+03:00").toISOString(),
        status: "confirmed",
      },
      {
        startUtc: new Date("2026-09-01T09:00:00+03:00").toISOString(),
        endUtc: new Date("2026-09-01T09:30:00+03:00").toISOString(),
        status: "confirmed",
      },
      {
        startUtc: new Date("2026-09-01T09:00:00+03:00").toISOString(),
        endUtc: new Date("2026-09-01T09:30:00+03:00").toISOString(),
        status: "confirmed",
      },
      // 5 active bookings at 09:30 (Fully booked)
      ...Array.from({ length: 5 }, () => ({
        startUtc: new Date("2026-09-01T09:30:00+03:00").toISOString(),
        endUtc: new Date("2026-09-01T10:00:00+03:00").toISOString(),
        status: "confirmed",
      })),
      // 1 cancelled booking at 09:00 (should not count)
      {
        startUtc: new Date("2026-09-01T09:00:00+03:00").toISOString(),
        endUtc: new Date("2026-09-01T09:30:00+03:00").toISOString(),
        status: "CANCELLED",
      },
    ],
    slotIntervalMinutes: 30,
  });

  const partialGroupSlot = groupSlots.find((s) => s.displayTime === "09:00");
  assert(
    partialGroupSlot?.isAvailable === true &&
    partialGroupSlot.remainingCapacity === 2 &&
    partialGroupSlot.bookedCount === 3,
    "Group slot with 3/5 bookings should remain AVAILABLE with remainingCapacity=2"
  );

  const fullGroupSlot = groupSlots.find((s) => s.displayTime === "09:30");
  assert(
    fullGroupSlot?.isAvailable === false &&
    fullGroupSlot.remainingCapacity === 0 &&
    fullGroupSlot.bookedCount === 5,
    "Group slot with 5/5 bookings should be UNAVAILABLE with remainingCapacity=0"
  );

  // -------------------------------------------------------------------------
  // SUITE 4: Concurrency Lock Manager & Group Capacity Locking
  // -------------------------------------------------------------------------
  console.log("\n--- Suite 4: Concurrency Lock Manager & Multi-Session Holds ---");
  slotLockManager.clearAll();

  // Test 4.1: Single-capacity 1-on-1 locking
  const lock1 = slotLockManager.acquireLock(
    "tenant-1",
    "service-1",
    "2026-09-01T14:00:00Z",
    "user-session-A"
  );
  assert(lock1.success === true, "User A should successfully acquire single-capacity slot lock");

  const lock2 = slotLockManager.acquireLock(
    "tenant-1",
    "service-1",
    "2026-09-01T14:00:00Z",
    "user-session-B"
  );
  assert(lock2.success === false, "User B must be BLOCKED from locking the same slot simultaneously");

  // Same user extends lock
  const extendLock = slotLockManager.acquireLock(
    "tenant-1",
    "service-1",
    "2026-09-01T14:00:00Z",
    "user-session-A"
  );
  assert(extendLock.success === true && extendLock.message.includes("uzatıldı"), "User A can re-acquire/extend their own lock");

  // Explicit release
  slotLockManager.releaseLock("tenant-1", "service-1", "2026-09-01T14:00:00Z", "user-session-A");
  assert(
    slotLockManager.isLocked("tenant-1", "service-1", "2026-09-01T14:00:00Z") === false,
    "Lock should be cleanly released after checkout"
  );

  // Test 4.2: Group capacity locks (maxCapacity = 3)
  const groupSlotUtc = "2026-09-01T15:00:00Z";
  const gLock1 = slotLockManager.acquireLock("tenant-1", "srv-group", groupSlotUtc, "sess-1", 300000, 3);
  const gLock2 = slotLockManager.acquireLock("tenant-1", "srv-group", groupSlotUtc, "sess-2", 300000, 3);
  const gLock3 = slotLockManager.acquireLock("tenant-1", "srv-group", groupSlotUtc, "sess-3", 300000, 3);
  const gLock4 = slotLockManager.acquireLock("tenant-1", "srv-group", groupSlotUtc, "sess-4", 300000, 3);

  assert(gLock1.success && gLock2.success && gLock3.success, "First 3 sessions should successfully acquire group locks");
  assert(gLock4.success === false, "4th session must be BLOCKED when group capacity of 3 is reached");
  assert(slotLockManager.getActiveLockCount("tenant-1", "srv-group", groupSlotUtc) === 3, "Active lock count should be exactly 3");
  assert(slotLockManager.getRemainingCapacity("tenant-1", "srv-group", groupSlotUtc, 3) === 0, "Remaining lock capacity should be 0");

  // Release 1 group slot
  slotLockManager.releaseLock("tenant-1", "srv-group", groupSlotUtc, "sess-2");
  assert(slotLockManager.getRemainingCapacity("tenant-1", "srv-group", groupSlotUtc, 3) === 1, "Remaining capacity should become 1 after release");

  // Now session-4 can acquire
  const gLock4Retry = slotLockManager.acquireLock("tenant-1", "srv-group", groupSlotUtc, "sess-4", 300000, 3);
  assert(gLock4Retry.success === true, "Session 4 should now acquire lock after capacity freed");

  // -------------------------------------------------------------------------
  // SUITE 5: Session Timeouts & Expiration Edge Cases
  // -------------------------------------------------------------------------
  console.log("\n--- Suite 5: Session Timeouts & Expiration Edge Cases ---");

  // Test 5.1: Lock timeout auto-expiration
  const timeoutSlotUtc = "2026-09-01T16:00:00Z";
  slotLockManager.acquireLock("tenant-1", "srv-timeout", timeoutSlotUtc, "sess-stale");
  assert(slotLockManager.isLocked("tenant-1", "srv-timeout", timeoutSlotUtc) === true, "Slot is locked initially");

  // Simulate timeout expiry
  slotLockManager.forceExpireLock("tenant-1", "srv-timeout", timeoutSlotUtc, "sess-stale");
  assert(
    slotLockManager.isLocked("tenant-1", "srv-timeout", timeoutSlotUtc) === false,
    "Expired lock must automatically be treated as unlocked"
  );

  const freshLock = slotLockManager.acquireLock("tenant-1", "srv-timeout", timeoutSlotUtc, "sess-fresh");
  assert(freshLock.success === true, "New session can acquire slot after previous lock timed out");

  // Test 5.2: Session logout / releaseAllSessionLocks
  slotLockManager.acquireLock("tenant-1", "srv-1", "2026-09-01T17:00:00Z", "sess-multi");
  slotLockManager.acquireLock("tenant-1", "srv-2", "2026-09-01T18:00:00Z", "sess-multi");
  const releasedCount = slotLockManager.releaseAllSessionLocks("sess-multi");
  assert(releasedCount === 2, "releaseAllSessionLocks should cleanly release all locks held by that session");

  // Test 5.3: Session Token Expiration (BruteForceGuard / Admin Token)
  const expiredToken = BruteForceGuard.createAdminToken("musa", -1000); // Created with negative TTL (already expired)
  assert(BruteForceGuard.verifyAdminToken(expiredToken) === false, "Expired admin session token must be REJECTED");

  const validToken = BruteForceGuard.createAdminToken("musa", 60000); // 1 minute valid
  assert(BruteForceGuard.verifyAdminToken(validToken) === true, "Fresh admin session token must be ACCEPTED");

  // -------------------------------------------------------------------------
  // SUITE 6: Brute-Force Lockout Defenses & Timing Attack Defenses
  // -------------------------------------------------------------------------
  console.log("\n--- Suite 6: Brute-Force Lockout Defenses ---");
  BruteForceGuard.resetAll();

  const attackerIp = "198.51.100.25";
  const legitIp = "203.0.113.50";

  // Attempts 1 to 4 should decrement attemptsLeft without lockout
  const a1 = BruteForceGuard.recordFailedAttempt(attackerIp);
  assert(a1.attemptsLeft === 4 && a1.isNowLocked === false, "Attempt 1: 4 attempts left, not locked");

  const a2 = BruteForceGuard.recordFailedAttempt(attackerIp);
  assert(a2.attemptsLeft === 3 && a2.isNowLocked === false, "Attempt 2: 3 attempts left, not locked");

  const a3 = BruteForceGuard.recordFailedAttempt(attackerIp);
  assert(a3.attemptsLeft === 2 && a3.isNowLocked === false, "Attempt 3: 2 attempts left, not locked");

  const a4 = BruteForceGuard.recordFailedAttempt(attackerIp);
  assert(a4.attemptsLeft === 1 && a4.isNowLocked === false, "Attempt 4: 1 attempt left, not locked");

  // Attempt 5 triggers instant lockout
  const a5 = BruteForceGuard.recordFailedAttempt(attackerIp);
  assert(a5.attemptsLeft === 0 && a5.isNowLocked === true, "Attempt 5: 0 attempts left, INSTANT LOCKOUT triggered");

  // Check lockout status
  const lockoutStatus = BruteForceGuard.checkLockout(attackerIp);
  assert(
    lockoutStatus.isLocked === true && lockoutStatus.remainingSeconds > 0,
    "Lockout verification must report isLocked=true with remaining countdown"
  );

  // IP isolation: Legitimate user IP is unaffected by attacker lockout
  const legitStatus = BruteForceGuard.checkLockout(legitIp);
  assert(legitStatus.isLocked === false, "Legitimate IP must NOT be affected by attacker IP lockout");

  // Clear attempts on legit user login
  BruteForceGuard.recordFailedAttempt(legitIp);
  BruteForceGuard.clearAttempts(legitIp);
  assert(BruteForceGuard.getAttemptCount(legitIp) === 0, "clearAttempts must reset failed count on successful auth");

  // Constant-time comparison checks (prevent timing attacks)
  assert(BruteForceGuard.safeEqual("supersecret123", "supersecret123") === true, "safeEqual returns true for identical strings");
  assert(BruteForceGuard.safeEqual("supersecret123", "supersecret999") === false, "safeEqual returns false for different strings of same length");
  assert(BruteForceGuard.safeEqual("short", "much_longer_string") === false, "safeEqual returns false for different length strings without throwing");

  // HMAC token tampering defense
  const legitToken = BruteForceGuard.createAdminToken("musa");
  const tamperedToken = legitToken.substring(0, legitToken.length - 4) + "abcd";
  assert(BruteForceGuard.verifyAdminToken(tamperedToken) === false, "Tampered HMAC signature must be REJECTED");

  // Malformed token defense
  assert(BruteForceGuard.verifyAdminToken("not-a-token") === false, "Malformed single string token safely rejected");
  assert(BruteForceGuard.verifyAdminToken(null) === false, "Null token safely rejected");
  assert(BruteForceGuard.verifyAdminToken("eyJhbGciOi.fake") === false, "Invalid JSON payload safely rejected");

  console.log("\n=========================================");
  console.log(`📊 QA Results: ${passed} Passed, ${failed} Failed`);
  console.log("=========================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
