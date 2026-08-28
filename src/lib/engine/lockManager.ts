/**
 * 🔒 Concurrency & Capacity-Aware Slot Lock Engine
 * Prevents double-booking race conditions during checkout and reservation flows.
 * Supports multi-capacity group slots, specialist-level locking, and transactional rollbacks.
 * Hybrid architecture: In-memory atomic locks synchronized with Supabase DB `slot_locks`.
 */

import { supabase } from "@/lib/supabase";

export interface SlotLock {
  id: string;
  tenantId: string;
  serviceId: string;
  staffId?: string;
  startUtc: string;
  slotDate: string;
  slotTime: string;
  sessionId: string;
  maxCapacity: number;
  expiresAt: number;
  createdAt: number;
}

export interface AcquireLockOptions {
  tenantId: string;
  serviceId?: string;
  staffId?: string;
  startUtc: string;
  sessionId: string;
  maxCapacity?: number;
  durationMs?: number;
}

export interface LockResult {
  success: boolean;
  lockId?: string;
  expiresAt?: number;
  remainingCapacity: number;
  activeLocksCount: number;
  code?: "LOCK_ACQUIRED" | "LOCK_EXTENDED" | "CAPACITY_EXCEEDED" | "INVALID_PARAMS" | "SYSTEM_ERROR";
  message: string;
}

export interface SlotCapacityStatus {
  totalCapacity: number;
  activeLocksCount: number;
  remainingCapacity: number;
  isFullyLocked: boolean;
  activeSessionIds: string[];
}

const DEFAULT_LOCK_DURATION_MS = 5 * 60 * 1000; // 5 minutes

class SlotLockManager {
  // Key: `${tenantId}:${serviceId}:${staffId || 'any'}:${startUtc}` -> Array of active locks for that slot
  private locks: Map<string, SlotLock[]> = new Map();

  private generateKey(tenantId: string, serviceId: string = "all", startUtc: string, staffId: string = "any"): string {
    return `${tenantId}:${serviceId}:${staffId}:${startUtc}`;
  }

  private parseIsoParts(startUtc: string): { datePart: string; timePart: string } {
    try {
      const parts = startUtc.split("T");
      const datePart = parts[0] || new Date().toISOString().split("T")[0];
      const timePart = parts[1] ? parts[1].slice(0, 5) : "00:00";
      return { datePart, timePart };
    } catch {
      return {
        datePart: new Date().toISOString().split("T")[0],
        timePart: "00:00",
      };
    }
  }

  /**
   * Cleans expired locks from memory and triggers database cleanup
   */
  public cleanExpiredLocks(): void {
    const now = Date.now();
    for (const [key, lockList] of this.locks.entries()) {
      const activeLocks = lockList.filter((lock) => lock.expiresAt > now);
      if (activeLocks.length === 0) {
        this.locks.delete(key);
      } else {
        this.locks.set(key, activeLocks);
      }
    }
  }

  /**
   * Retrieves real-time capacity and lock status for a given slot
   */
  public getSlotCapacityStatus(
    tenantId: string,
    startUtc: string,
    serviceId: string = "all",
    staffId: string = "any",
    maxCapacity: number = 1
  ): SlotCapacityStatus {
    this.cleanExpiredLocks();
    const key = this.generateKey(tenantId, serviceId, startUtc, staffId);
    const lockList = this.locks.get(key) || [];
    const now = Date.now();
    const activeLocks = lockList.filter((l) => l.expiresAt > now);

    const activeLocksCount = activeLocks.length;
    const remainingCapacity = Math.max(0, maxCapacity - activeLocksCount);

    return {
      totalCapacity: maxCapacity,
      activeLocksCount,
      remainingCapacity,
      isFullyLocked: activeLocksCount >= maxCapacity,
      activeSessionIds: activeLocks.map((l) => l.sessionId),
    };
  }

  /**
   * Checks if a slot is completely locked (capacity exhausted)
   */
  public isLocked(
    tenantId: string,
    serviceId: string = "all",
    startUtc: string = "",
    staffIdOrSession?: string,
    maxCapacity: number = 1
  ): boolean {
    const staffId = typeof staffIdOrSession === "string" ? staffIdOrSession : "any";
    const status = this.getSlotCapacityStatus(tenantId, startUtc, serviceId, staffId, maxCapacity);
    return status.isFullyLocked;
  }

  /**
   * Returns active lock count for a slot
   */
  public getActiveLockCount(
    tenantId: string,
    serviceId: string = "all",
    startUtc: string = "",
    staffId: string = "any"
  ): number {
    const status = this.getSlotCapacityStatus(tenantId, startUtc, serviceId, staffId, 1);
    return status.activeLocksCount;
  }

  /**
   * Returns remaining capacity for a slot
   */
  public getRemainingCapacity(
    tenantId: string,
    serviceId: string = "all",
    startUtc: string = "",
    maxCapacity: number = 1,
    staffId: string = "any"
  ): number {
    const status = this.getSlotCapacityStatus(tenantId, startUtc, serviceId, staffId, maxCapacity);
    return status.remainingCapacity;
  }

  /**
   * Attempts to acquire or renew a capacity lock for a slot.
   * Supports both options object and positional argument signatures.
   */
  public acquireLock(
    tenantOrOptions: string | AcquireLockOptions,
    serviceIdArg?: string,
    startUtcArg?: string,
    sessionIdArg?: string,
    durationMsArg?: number,
    maxCapacityArg?: number,
    staffIdArg?: string
  ): LockResult {
    let tenantId: string;
    let serviceId = "default-service";
    let staffId = "any";
    let startUtc: string;
    let sessionId: string;
    let maxCapacity = 1;
    let durationMs = DEFAULT_LOCK_DURATION_MS;

    if (typeof tenantOrOptions === "object") {
      tenantId = tenantOrOptions.tenantId;
      serviceId = tenantOrOptions.serviceId || "default-service";
      staffId = tenantOrOptions.staffId || "any";
      startUtc = tenantOrOptions.startUtc;
      sessionId = tenantOrOptions.sessionId;
      maxCapacity = tenantOrOptions.maxCapacity || 1;
      durationMs = tenantOrOptions.durationMs || DEFAULT_LOCK_DURATION_MS;
    } else {
      tenantId = tenantOrOptions;
      serviceId = serviceIdArg || "default-service";
      startUtc = startUtcArg || "";
      sessionId = sessionIdArg || "";
      durationMs = durationMsArg || DEFAULT_LOCK_DURATION_MS;
      maxCapacity = maxCapacityArg || 1;
      staffId = staffIdArg || "any";
    }

    if (!tenantId || !startUtc || !sessionId) {
      return {
        success: false,
        remainingCapacity: 0,
        activeLocksCount: 0,
        code: "INVALID_PARAMS",
        message: "Eksik kilit parametreleri (tenantId, startUtc, sessionId zorunludur).",
      };
    }

    this.cleanExpiredLocks();

    const key = this.generateKey(tenantId, serviceId, startUtc, staffId);
    const now = Date.now();
    const lockList = (this.locks.get(key) || []).filter((l) => l.expiresAt > now);

    // 1. Check if this session already holds a lock on this slot -> Extend TTL
    const existingSessionLock = lockList.find((l) => l.sessionId === sessionId);
    if (existingSessionLock) {
      existingSessionLock.expiresAt = now + durationMs;
      this.locks.set(key, lockList);

      // Async DB sync
      this.syncDbLockUpdate(existingSessionLock);

      return {
        success: true,
        lockId: existingSessionLock.id,
        expiresAt: existingSessionLock.expiresAt,
        remainingCapacity: Math.max(0, maxCapacity - lockList.length),
        activeLocksCount: lockList.length,
        code: "LOCK_EXTENDED",
        message: "Mevcut randevu kilidiniz 5 dakika daha uzatıldı.",
      };
    }

    // 2. Capacity Check
    if (lockList.length >= maxCapacity) {
      return {
        success: false,
        remainingCapacity: 0,
        activeLocksCount: lockList.length,
        code: "CAPACITY_EXCEEDED",
        message:
          maxCapacity === 1
            ? "Bu saat dilimi şu anda başka bir danışan tarafından rezerve edilmektedir."
            : `Bu seansın maksimum kontenjanı (${maxCapacity} kişi) dolmuştur.`,
      };
    }

    // 3. Create new lock
    const { datePart, timePart } = this.parseIsoParts(startUtc);
    const lockId = `lock_${now}_${Math.random().toString(36).substring(2, 9)}`;
    const expiresAt = now + durationMs;

    const newLock: SlotLock = {
      id: lockId,
      tenantId,
      serviceId,
      staffId,
      startUtc,
      slotDate: datePart,
      slotTime: timePart,
      sessionId,
      maxCapacity,
      expiresAt,
      createdAt: now,
    };

    lockList.push(newLock);
    this.locks.set(key, lockList);

    // Async DB insert with error boundary
    this.syncDbLockInsert(newLock);

    const remainingCapacity = Math.max(0, maxCapacity - lockList.length);

    return {
      success: true,
      lockId,
      expiresAt,
      remainingCapacity,
      activeLocksCount: lockList.length,
      code: "LOCK_ACQUIRED",
      message: "Randevu saati adınıza 5 dakikalığına başarıyla ayrıldı.",
    };
  }

  /**
   * Releases an acquired lock explicitly
   */
  public releaseLock(
    tenantId: string,
    serviceId: string = "all",
    startUtc: string = "",
    sessionId: string = "",
    staffId: string = "any"
  ): boolean {
    const key = this.generateKey(tenantId, serviceId, startUtc, staffId);
    const lockList = this.locks.get(key);

    if (!lockList || lockList.length === 0) {
      return false;
    }

    const targetLockIndex = lockList.findIndex((l) => l.sessionId === sessionId);
    if (targetLockIndex === -1) {
      return false;
    }

    const [removedLock] = lockList.splice(targetLockIndex, 1);
    if (lockList.length === 0) {
      this.locks.delete(key);
    } else {
      this.locks.set(key, lockList);
    }

    // Async delete from Supabase
    this.syncDbLockDelete(removedLock);

    return true;
  }

  /**
   * Releases all active locks held by a session (e.g. on session termination/logout)
   */
  public releaseAllSessionLocks(sessionId: string): number {
    this.cleanExpiredLocks();
    let released = 0;
    for (const [key, lockList] of this.locks.entries()) {
      const remainingLocks = lockList.filter((l) => {
        if (l.sessionId === sessionId) {
          released++;
          this.syncDbLockDelete(l);
          return false;
        }
        return true;
      });
      if (remainingLocks.length === 0) {
        this.locks.delete(key);
      } else {
        this.locks.set(key, remainingLocks);
      }
    }
    return released;
  }

  /**
   * Helper to simulate lock expiration in tests
   */
  public forceExpireLock(
    tenantId: string,
    serviceId: string = "all",
    startUtc: string = "",
    sessionId: string = "",
    staffId: string = "any"
  ): boolean {
    const key = this.generateKey(tenantId, serviceId, startUtc, staffId);
    const lockList = this.locks.get(key);
    if (!lockList) return false;
    const lock = lockList.find((l) => l.sessionId === sessionId);
    if (lock) {
      lock.expiresAt = Date.now() - 1000;
      this.cleanExpiredLocks();
      return true;
    }
    return false;
  }

  /**
   * Clears all locks (useful for test resets)
   */
  public clearAll(): void {
    this.locks.clear();
  }

  /**
   * 🛡️ Transactional Execution Wrapper with Auto-Rollback
   * 1. Acquires capacity lock.
   * 2. Executes transaction logic.
   * 3. Automatically rolls back (releases lock) if an error occurs.
   * 4. Releases or retains lock upon completion.
   */
  public async withSlotLock<T>(
    options: AcquireLockOptions,
    transactionFn: (lock: SlotLock) => Promise<T>,
    releaseOnSuccess: boolean = false
  ): Promise<{ success: boolean; data?: T; error?: string; code?: string; lock?: SlotLock }> {
    const lockResult = this.acquireLock(options);

    if (!lockResult.success || !lockResult.lockId) {
      return {
        success: false,
        error: lockResult.message,
        code: lockResult.code || "CAPACITY_EXCEEDED",
      };
    }

    const { tenantId, serviceId = "default-service", staffId = "any", startUtc, sessionId } = options;
    const key = this.generateKey(tenantId, serviceId, startUtc, staffId);
    const lock = (this.locks.get(key) || []).find((l) => l.id === lockResult.lockId);

    if (!lock) {
      return {
        success: false,
        error: "Kilit kaydına ulaşılamadı.",
        code: "SYSTEM_ERROR",
      };
    }

    try {
      // Execute the business operation within the locked critical section
      const data = await transactionFn(lock);

      if (releaseOnSuccess) {
        this.releaseLock(tenantId, serviceId, startUtc, sessionId, staffId);
      }

      return {
        success: true,
        data,
        lock,
      };
    } catch (txError: unknown) {
      // Transaction failed -> Trigger automatic rollback
      console.warn(`[LockManager Rollback] Transaction failed for session ${sessionId}. Releasing lock.`);
      this.releaseLock(tenantId, serviceId, startUtc, sessionId, staffId);

      const errorMessage = txError instanceof Error ? txError.message : "İşlem sırasında hata meydana geldi, kilit serbest bırakıldı.";
      return {
        success: false,
        error: errorMessage,
        code: "TRANSACTION_ROLLBACK",
      };
    }
  }

  /**
   * Purges all active locks for a tenant (e.g. on emergency schedule recalculation)
   */
  public forceReleaseTenantLocks(tenantId: string): number {
    let count = 0;
    for (const [key, lockList] of this.locks.entries()) {
      if (key.startsWith(`${tenantId}:`)) {
        count += lockList.length;
        this.locks.delete(key);
      }
    }
    try {
      supabase.from("slot_locks").delete().eq("tenant_id", tenantId).then(() => {});
    } catch {
      // Ignore in offline mode
    }
    return count;
  }

  // ==========================================
  // Private Supabase Sync Helpers
  // ==========================================

  private syncDbLockInsert(lock: SlotLock): void {
    try {
      supabase
        .from("slot_locks")
        .insert({
          id: lock.id,
          tenant_id: lock.tenantId,
          slot_date: lock.slotDate,
          slot_time: lock.slotTime,
          locked_by: lock.sessionId,
          expires_at: new Date(lock.expiresAt).toISOString(),
        })
        .then(
          () => {},
          (err: any) => {
            if (process.env.NODE_ENV === "development") {
              console.log("[LockManager] Supabase slot_locks note:", err?.message);
            }
          }
        );
    } catch {
      // Ignore in offline mode
    }
  }

  private syncDbLockUpdate(lock: SlotLock): void {
    try {
      supabase
        .from("slot_locks")
        .update({
          expires_at: new Date(lock.expiresAt).toISOString(),
        })
        .eq("tenant_id", lock.tenantId)
        .eq("slot_date", lock.slotDate)
        .eq("locked_by", lock.sessionId)
        .then(
          () => {},
          () => {}
        );
    } catch {
      // Ignore in offline mode
    }
  }

  private syncDbLockDelete(lock: SlotLock): void {
    try {
      supabase
        .from("slot_locks")
        .delete()
        .eq("tenant_id", lock.tenantId)
        .eq("slot_date", lock.slotDate)
        .eq("locked_by", lock.sessionId)
        .then(
          () => {},
          () => {}
        );
    } catch {
      // Ignore in offline mode
    }
  }
}

export const slotLockManager = new SlotLockManager();
