/**
 * 🔒 Concurrency & Slot Lock Engine
 * Prevents double-booking race conditions during checkout/reservation.
 * Holds temporary locks (default: 5 minutes) for a specific time slot.
 * Works both in-memory and synchronized with Supabase DB `slot_locks`.
 */

import { supabase } from "@/lib/supabase";

export interface SlotLock {
  id?: string;
  tenantId: string;
  serviceId?: string;
  staffId?: string;
  startUtc: string;
  slotDate?: string;
  slotTime?: string;
  sessionId: string;
  lockedBy?: string;
  expiresAt: number;
  createdAt: number;
}

const DEFAULT_LOCK_DURATION_MS = 5 * 60 * 1000; // 5 minutes

class SlotLockManager {
  private locks: Map<string, SlotLock> = new Map();

  private getLockKey(tenantId: string, serviceId: string, startUtc: string): string {
    return `${tenantId}:${serviceId}:${startUtc}`;
  }

  /**
   * Attempts to acquire a lock for a given slot.
   * If the slot is already locked by another session, returns { success: false }.
   */
  public acquireLock(
    tenantId: string,
    serviceId: string,
    startUtc: string,
    sessionId: string,
    durationMs: number = DEFAULT_LOCK_DURATION_MS
  ): { success: boolean; message: string; expiresAt?: number } {
    this.cleanExpiredLocks();

    const key = this.getLockKey(tenantId, serviceId, startUtc);
    const existingLock = this.locks.get(key);

    const now = Date.now();

    if (existingLock && existingLock.expiresAt > now) {
      if (existingLock.sessionId === sessionId) {
        // Extend existing lock for the same user
        existingLock.expiresAt = now + durationMs;
        return {
          success: true,
          message: "Mevcut kilit süreniz uzatıldı.",
          expiresAt: existingLock.expiresAt,
        };
      }
      return {
        success: false,
        message: "Bu saat dilimi şu anda başka bir danışan tarafından rezerve edilmektedir.",
      };
    }

    const expiresAt = now + durationMs;
    const newLock: SlotLock = {
      tenantId,
      serviceId,
      startUtc,
      sessionId,
      expiresAt,
      createdAt: now,
    };

    this.locks.set(key, newLock);

    // Asynchronously try to record to Supabase if connected
    try {
      const [datePart, timePart] = startUtc.split("T");
      if (datePart && timePart) {
        supabase
          .from("slot_locks")
          .insert({
            tenant_id: tenantId,
            slot_date: datePart,
            slot_time: timePart.slice(0, 5),
            locked_by: sessionId,
            expires_at: new Date(expiresAt).toISOString(),
          })
          .then(() => {});
      }
    } catch (_) {}

    return {
      success: true,
      message: "Randevu saati 5 dakikalığına sizin adınıza ayrıldı.",
      expiresAt,
    };
  }

  /**
   * Checks if a slot is actively locked by anyone.
   */
  public isLocked(tenantId: string, serviceId: string, startUtc: string): boolean {
    this.cleanExpiredLocks();
    const key = this.getLockKey(tenantId, serviceId, startUtc);
    const lock = this.locks.get(key);
    return !!lock && lock.expiresAt > Date.now();
  }

  /**
   * Releases an acquired lock explicitly.
   */
  public releaseLock(
    tenantId: string,
    serviceId: string,
    startUtc: string,
    sessionId: string
  ): boolean {
    const key = this.getLockKey(tenantId, serviceId, startUtc);
    const lock = this.locks.get(key);

    if (lock && lock.sessionId === sessionId) {
      this.locks.delete(key);
      try {
        const [datePart, timePart] = startUtc.split("T");
        if (datePart && timePart) {
          supabase
            .from("slot_locks")
            .delete()
            .eq("tenant_id", tenantId)
            .eq("slot_date", datePart)
            .eq("locked_by", sessionId)
            .then(() => {});
        }
      } catch (_) {}
      return true;
    }
    return false;
  }

  private cleanExpiredLocks() {
    const now = Date.now();
    for (const [key, lock] of this.locks.entries()) {
      if (lock.expiresAt <= now) {
        this.locks.delete(key);
      }
    }
  }
}

export const slotLockManager = new SlotLockManager();
