import { NextRequest, NextResponse } from "next/server";
import { BruteForceGuard } from "@/lib/security/bruteForceGuard";
import {
  apiSuccess,
  apiUnauthorized,
  apiRateLimited,
  handleApiError,
} from "@/lib/apiResponse";

// Expected Super Admin Credentials
const SUPER_ADMIN_USER = process.env.SUPER_ADMIN_USER || "musa";
const SUPER_ADMIN_PASS = process.env.SUPER_ADMIN_PASS || "6872Fatma";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const body = await req.json();
    const { username = "", password = "" } = body;

    // 1. Validate Credentials First (Accepts musa, admin, 6872Fatma, 6872fatma)
    const cleanUser = (username || "").trim().toLowerCase();
    const cleanPass = (password || "").trim();
    const isUserValid = cleanUser === "musa" || cleanUser === "admin" || cleanUser === (SUPER_ADMIN_USER || "musa").trim().toLowerCase();
    const isPassValid =
      cleanPass === SUPER_ADMIN_PASS ||
      cleanPass === "6872Fatma" ||
      cleanPass.toLowerCase() === "6872fatma" ||
      cleanPass.toLowerCase() === (SUPER_ADMIN_PASS || "6872fatma").toLowerCase();

    // If correct credentials are provided, immediately clear any lockout and log in!
    if (isUserValid && isPassValid) {
      BruteForceGuard.clearAttempts(ip);
      BruteForceGuard.resetAll();
    } else {
      // 2. If invalid credentials, check Brute-force Lockout
      const lockout = BruteForceGuard.checkLockout(ip);
      if (lockout.isLocked) {
        return apiRateLimited(
          `Çok fazla hatalı deneme yapıldı. Güvenlik nedeniyle hesabınız kilitlendi. Lütfen ${lockout.remainingSeconds} saniye sonra tekrar deneyin.`,
          lockout.remainingSeconds,
          { isLocked: true, remainingSeconds: lockout.remainingSeconds }
        );
      }

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
    BruteForceGuard.resetAll();

    // 4. Create signed SuperAdmin Token
    const adminToken = BruteForceGuard.createAdminToken("musa");

    // 5. Response with secure cookies
    const response = apiSuccess({
      user: { username: "musa", role: "SUPER_ADMIN" },
      token: adminToken,
    }, "Super Admin girişi başarılı.");

    response.cookies.set("rf_superadmin_session", adminToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 24 * 60 * 60, // 24 hours
    });

    response.cookies.set("rf_superadmin", "true", {
      httpOnly: false,
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
