import crypto from "crypto";

interface AttemptRecord {
  count: number;
  firstAttempt: number;
  lockoutUntil: number | null;
}

// In-memory brute force cache with automatic cleanup
const attemptMap = new Map<string, AttemptRecord>();

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes lockout

const ADMIN_SECRET = process.env.ADMIN_SECRET_KEY || "randevuformu_superadmin_secret_key_2026_x99";

export class BruteForceGuard {
  private static cleanup() {
    const now = Date.now();
    for (const [ip, record] of attemptMap.entries()) {
      if (record.lockoutUntil && record.lockoutUntil < now) {
        attemptMap.delete(ip);
      } else if (now - record.firstAttempt > WINDOW_MS && !record.lockoutUntil) {
        attemptMap.delete(ip);
      }
    }
  }

  public static checkLockout(identifier: string): { isLocked: boolean; remainingSeconds: number } {
    this.cleanup();
    const record = attemptMap.get(identifier);
    const now = Date.now();

    if (!record) {
      return { isLocked: false, remainingSeconds: 0 };
    }

    if (record.lockoutUntil && record.lockoutUntil > now) {
      const remainingSeconds = Math.ceil((record.lockoutUntil - now) / 1000);
      return { isLocked: true, remainingSeconds };
    }

    return { isLocked: false, remainingSeconds: 0 };
  }

  public static recordFailedAttempt(identifier: string): { attemptsLeft: number; isNowLocked: boolean } {
    const now = Date.now();
    let record = attemptMap.get(identifier);

    if (!record) {
      record = { count: 1, firstAttempt: now, lockoutUntil: null };
      attemptMap.set(identifier, record);
      return { attemptsLeft: MAX_ATTEMPTS - 1, isNowLocked: false };
    }

    record.count += 1;

    if (record.count >= MAX_ATTEMPTS) {
      record.lockoutUntil = now + LOCKOUT_MS;
      return { attemptsLeft: 0, isNowLocked: true };
    }

    return { attemptsLeft: MAX_ATTEMPTS - record.count, isNowLocked: false };
  }

  public static clearAttempts(identifier: string) {
    attemptMap.delete(identifier);
  }

  /**
   * Constant-time comparison to prevent timing attacks
   */
  public static safeEqual(a: string, b: string): boolean {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) {
      return false;
    }
    return crypto.timingSafeEqual(bufA, bufB);
  }

  /**
   * Create signed SuperAdmin session token
   */
  public static createAdminToken(username: string): string {
    const payload = JSON.stringify({
      user: username,
      role: "SUPER_ADMIN",
      issuedAt: Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });
    const base64Payload = Buffer.from(payload).toString("base64url");
    const hmac = crypto.createHmac("sha256", ADMIN_SECRET).update(base64Payload).digest("hex");
    return `${base64Payload}.${hmac}`;
  }

  /**
   * Verify signed SuperAdmin session token
   */
  public static verifyAdminToken(token?: string | null): boolean {
    if (!token) return false;
    const parts = token.split(".");
    if (parts.length !== 2) return false;

    const [base64Payload, signature] = parts;
    const expectedHmac = crypto.createHmac("sha256", ADMIN_SECRET).update(base64Payload).digest("hex");

    if (!this.safeEqual(signature, expectedHmac)) {
      return false;
    }

    try {
      const payload = JSON.parse(Buffer.from(base64Payload, "base64url").toString("utf-8"));
      if (payload.expiresAt < Date.now()) {
        return false;
      }
      return payload.role === "SUPER_ADMIN" && payload.user === "musa";
    } catch {
      return false;
    }
  }
}
