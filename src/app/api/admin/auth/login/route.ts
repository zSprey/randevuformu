import { NextRequest, NextResponse } from "next/server";
import { BruteForceGuard } from "@/lib/security/bruteForceGuard";
import {
  apiSuccess,
  apiUnauthorized,
  apiRateLimited,
  handleApiError,
} from "@/lib/apiResponse";

// Expected Super Admin Credentials (Strictly from Environment Variables)
const SUPER_ADMIN_USER = process.env.SUPER_ADMIN_USER || "admin";
const SUPER_ADMIN_PASS = process.env.SUPER_ADMIN_PASS || "";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const body = await req.json();
    const { username = "", password = "" } = body;

    // 1. Check Brute-force Lockout
    const lockout = BruteForceGuard.checkLockout(ip);
    if (lockout.isLocked) {
      return apiRateLimited(
        `Çok fazla hatalı deneme yapıldı. Güvenlik nedeniyle hesabınız kilitlendi. Lütfen ${lockout.remainingSeconds} saniye sonra tekrar deneyin.`,
        lockout.remainingSeconds,
        { isLocked: true, remainingSeconds: lockout.remainingSeconds }
      );
    }

    // 2. Validate Credentials with Constant-Time Comparison
    const isUserValid = BruteForceGuard.safeEqual(username.trim(), SUPER_ADMIN_USER);
    const isPassValid = BruteForceGuard.safeEqual(password, SUPER_ADMIN_PASS);

    if (!isUserValid || !isPassValid) {
      const attemptResult = BruteForceGuard.recordFailedAttempt(ip);

      if (attemptResult.isNowLocked) {
        return apiRateLimited(
          "5 kez hatalı giriş yapıldı. Güvenlik nedeniyle sistem 15 dakika kilitlendi.",
          15 * 60,
          { isLocked: true, attemptsLeft: 0 }
        );
      }

      return apiUnauthorized(
        `Kullanıcı adı veya şifre hatalı! Kalan deneme hakkı: ${attemptResult.attemptsLeft}`,
        { attemptsLeft: attemptResult.attemptsLeft }
      );
    }

    // 3. Clear attempts on successful login
    BruteForceGuard.clearAttempts(ip);

    // 4. Create signed SuperAdmin Token
    const adminToken = BruteForceGuard.createAdminToken(username.trim());

    // 5. Response with secure cookie
    const response = apiSuccess({
      user: { username: SUPER_ADMIN_USER, role: "SUPER_ADMIN" },
      token: adminToken,
    }, "Super Admin girişi başarılı.");

    response.cookies.set("rf_superadmin_session", adminToken, {
      httpOnly: false, // Accessible to client and edge middleware
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 24 * 60 * 60, // 24 hours
    });

    return response;
  } catch (err: any) {
    return handleApiError(err, "Giriş işlemi sırasında hata oluştu.");
  }
}
