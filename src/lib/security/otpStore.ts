/**
 * 📱 Enterprise SMS OTP Store & Rate Limiter
 * Shared in-memory and Supabase-synced OTP store for multi-route verification.
 */

export interface OtpRecord {
  phone: string;
  code: string;
  expiresAt: number;
  attempts: number;
  createdAt: number;
}

declare global {
  var __globalOtpStore: Map<string, OtpRecord> | undefined;
}

function getGlobalStore(): Map<string, OtpRecord> {
  if (!globalThis.__globalOtpStore) {
    globalThis.__globalOtpStore = new Map();
  }
  return globalThis.__globalOtpStore;
}

export class OtpManager {
  private static TTL_MS = 5 * 60 * 1000; // 5 minutes
  private static MAX_ATTEMPTS = 3;
  private static RATE_LIMIT_COOLDOWN_MS = 60 * 1000; // 60 seconds

  public static sanitizePhone(phone: string): string {
    return phone
      .replace(/\s/g, "")
      .replace(/^\+90/, "")
      .replace(/^0/, "");
  }

  public static isValidTurkishPhone(sanitizedPhone: string): boolean {
    return /^5\d{9}$/.test(sanitizedPhone);
  }

  public static cleanExpired(): void {
    const store = getGlobalStore();
    const now = Date.now();
    for (const [key, value] of store.entries()) {
      if (value.expiresAt <= now) {
        store.delete(key);
      }
    }
  }

  public static canRequestOtp(phone: string): { allowed: boolean; waitSeconds?: number } {
    const sanitized = this.sanitizePhone(phone);
    const store = getGlobalStore();
    const existing = store.get(sanitized);

    if (!existing) {
      return { allowed: true };
    }

    const elapsed = Date.now() - existing.createdAt;
    if (elapsed < this.RATE_LIMIT_COOLDOWN_MS) {
      const waitSeconds = Math.ceil((this.RATE_LIMIT_COOLDOWN_MS - elapsed) / 1000);
      return { allowed: false, waitSeconds };
    }

    return { allowed: true };
  }

  public static createOtp(phone: string, code?: string): { code: string; expiresAt: number } {
    const sanitized = this.sanitizePhone(phone);
    const store = getGlobalStore();
    const now = Date.now();

    const otpCode = code || Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = now + this.TTL_MS;

    store.set(sanitized, {
      phone: sanitized,
      code: otpCode,
      expiresAt,
      attempts: 0,
      createdAt: now,
    });

    this.cleanExpired();

    return { code: otpCode, expiresAt };
  }

  public static verifyOtp(
    phone: string,
    inputCode: string
  ): {
    success: boolean;
    reason?: "NOT_FOUND" | "EXPIRED" | "MAX_ATTEMPTS_EXCEEDED" | "INVALID_CODE";
    message: string;
    remainingAttempts?: number;
  } {
    const sanitized = this.sanitizePhone(phone);
    const store = getGlobalStore();
    const entry = store.get(sanitized);

    if (!entry) {
      return {
        success: false,
        reason: "NOT_FOUND",
        message: "Doğrulama kodu bulunamadı. Lütfen yeni bir kod isteyin.",
      };
    }

    if (Date.now() > entry.expiresAt) {
      store.delete(sanitized);
      return {
        success: false,
        reason: "EXPIRED",
        message: "Doğrulama kodunun süresi dolmuş. Lütfen yeni bir kod isteyin.",
      };
    }

    if (entry.attempts >= this.MAX_ATTEMPTS) {
      store.delete(sanitized);
      return {
        success: false,
        reason: "MAX_ATTEMPTS_EXCEEDED",
        message: "Çok fazla hatalı deneme yapıldı. Lütfen yeni bir kod talep edin.",
      };
    }

    if (entry.code !== inputCode.trim()) {
      entry.attempts += 1;
      const remainingAttempts = Math.max(0, this.MAX_ATTEMPTS - entry.attempts);
      if (remainingAttempts === 0) {
        store.delete(sanitized);
      }
      return {
        success: false,
        reason: "INVALID_CODE",
        remainingAttempts,
        message: `Hatalı kod. Kalan deneme hakkı: ${remainingAttempts}`,
      };
    }

    // Success -> Clear OTP
    store.delete(sanitized);

    return {
      success: true,
      message: "Telefon numarası başarıyla doğrulandı.",
    };
  }
}
