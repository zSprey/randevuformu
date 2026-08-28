import { NextRequest, NextResponse } from "next/server";
import { BruteForceGuard } from "@/lib/security/bruteForceGuard";

// Expected Super Admin Credentials
const SUPER_ADMIN_USER = process.env.SUPER_ADMIN_USER || "musa";
const SUPER_ADMIN_PASS = process.env.SUPER_ADMIN_PASS || "6872Fatma";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const body = await req.json();
    const { username = "", password = "" } = body;

    // 1. Check Brute-force Lockout
    const lockout = BruteForceGuard.checkLockout(ip);
    if (lockout.isLocked) {
      return NextResponse.json(
        {
          error: `Çok fazla hatalı deneme yapıldı. Güvenlik nedeniyle hesabınız kilitlendi. Lütfen ${lockout.remainingSeconds} saniye sonra tekrar deneyin.`,
          isLocked: true,
          remainingSeconds: lockout.remainingSeconds,
        },
        { status: 429 }
      );
    }

    // 2. Validate Credentials with Constant-Time Comparison
    const isUserValid = BruteForceGuard.safeEqual(username.trim(), SUPER_ADMIN_USER);
    const isPassValid = BruteForceGuard.safeEqual(password, SUPER_ADMIN_PASS);

    if (!isUserValid || !isPassValid) {
      const attemptResult = BruteForceGuard.recordFailedAttempt(ip);

      if (attemptResult.isNowLocked) {
        return NextResponse.json(
          {
            error: "5 kez hatalı giriş yapıldı. Güvenlik nedeniyle sistem 15 dakika kilitlendi.",
            isLocked: true,
            attemptsLeft: 0,
          },
          { status: 429 }
        );
      }

      return NextResponse.json(
        {
          error: `Kullanıcı adı veya şifre hatalı! Kalan deneme hakkı: ${attemptResult.attemptsLeft}`,
          attemptsLeft: attemptResult.attemptsLeft,
        },
        { status: 401 }
      );
    }

    // 3. Clear attempts on successful login
    BruteForceGuard.clearAttempts(ip);

    // 4. Create signed SuperAdmin Token
    const adminToken = BruteForceGuard.createAdminToken(username.trim());

    // 5. Response with secure HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      message: "Super Admin girişi başarılı.",
      user: { username: SUPER_ADMIN_USER, role: "SUPER_ADMIN" },
    });

    response.cookies.set("rf_superadmin_session", adminToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 24 * 60 * 60, // 24 hours
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Giriş işlemi başarısız" }, { status: 500 });
  }
}
