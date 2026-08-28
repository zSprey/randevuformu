/**
 * 🔒 Concurrency & Race Condition Lock Manager
 * Prevents double booking when multiple users select the same slot simultaneously.
 * Implements an in-memory auto-expiring distributed lock pattern.
 */

interface SlotLock {
  slotKey: string; // e.g. "tenantId:serviceId:2026-08-28T14:30:00.000Z"
  lockedBy: string; // user session / email
  expiresAt: number; // timestamp in ms
}

class SlotLockManager {
  private locks: Map<string, SlotLock> = new Map();
  private readonly DEFAULT_LOCK_DURATION_MS = 5 * 60 * 1000; // 5 minutes hold during checkout

  /**
   * Generates a unique lock key for a specific resource and time slot
   */
  private getLockKey(tenantId: string, staffOrServiceId: string, startUtc: string): string {
    return `${tenantId}:${staffOrServiceId}:${startUtc}`;
  }

  /**
   * Attempts to acquire a lock on a slot for 5 minutes.
   * Returns true if lock was acquired, false if already held by another user.
   */
  public acquireLock(
    tenantId: string,
    staffOrServiceId: string,
    startUtc: string,
    userIdOrSession: string,
    durationMs: number = this.DEFAULT_LOCK_DURATION_MS
  ): { success: boolean; message: string; remainingSeconds?: number } {
    const key = this.getLockKey(tenantId, staffOrServiceId, startUtc);
    const now = Date.now();
    const existingLock = this.locks.get(key);

    // If active lock exists and not expired
    if (existingLock && existingLock.expiresAt > now) {
      if (existingLock.lockedBy === userIdOrSession) {
        // Renew lock for the same user
        existingLock.expiresAt = now + durationMs;
        return {
          success: true,
          message: "Slot rezervasyonu uzatıldı.",
          remainingSeconds: Math.ceil(durationMs / 1000),
        };
      }

      const remainingSec = Math.ceil((existingLock.expiresAt - now) / 1000);
      return {
        success: false,
        message: "Bu saat dilimi şu anda başka bir kullanıcı tarafından işlemde.",
        remainingSeconds: remainingSec,
      };
    }

    // Acquire new lock
    this.locks.set(key, {
      slotKey: key,
      lockedBy: userIdOrSession,
      expiresAt: now + durationMs,
    });

    return {
      success: true,
      message: "Saat dilimi 5 dakika boyunca sizin için kilitlendi.",
      remainingSeconds: Math.ceil(durationMs / 1000),
    };
  }

  /**
   * Releases lock after appointment is finalized or cancelled
   */
  public releaseLock(tenantId: string, staffOrServiceId: string, startUtc: string, userIdOrSession: string): boolean {
    const key = this.getLockKey(tenantId, staffOrServiceId, startUtc);
    const existingLock = this.locks.get(key);

    if (existingLock && existingLock.lockedBy === userIdOrSession) {
      this.locks.delete(key);
      return true;
    }
    return false;
  }

  /**
   * Checks if a slot is currently locked
   */
  public isLocked(tenantId: string, staffOrServiceId: string, startUtc: string): boolean {
    const key = this.getLockKey(tenantId, staffOrServiceId, startUtc);
    const existingLock = this.locks.get(key);
    if (!existingLock) return false;
    return existingLock.expiresAt > Date.now();
  }

  /**
   * Cleanup expired locks periodically
   */
  public purgeExpired(): void {
    const now = Date.now();
    for (const [key, lock] of this.locks.entries()) {
      if (lock.expiresAt <= now) {
        this.locks.delete(key);
      }
    }
  }
}

export const slotLockManager = new SlotLockManager();
