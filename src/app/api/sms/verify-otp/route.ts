import { NextRequest, NextResponse } from "next/server";
import { OtpManager } from "@/lib/security/otpStore";
import {
  apiSuccess,
  apiBadRequest,
  apiNotFound,
  apiUnauthorized,
  apiRateLimited,
  apiError,
  handleApiError,
} from "@/lib/apiResponse";

// ──────────────────────────────────────────────────────────
// SMS OTP DOĞRULAMA
// POST /api/sms/verify-otp
// Body: { phone: "05XXXXXXXXX", code: "123456" }
// ──────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, code } = body;

    if (!phone || !code) {
      return apiBadRequest("Telefon numarası ve doğrulama kodu gereklidir.");
    }

    const verifyResult = OtpManager.verifyOtp(phone, code);

    if (!verifyResult.success) {
      switch (verifyResult.reason) {
        case "NOT_FOUND":
          return apiNotFound(verifyResult.message);
        case "EXPIRED":
          return apiError(verifyResult.message, 410, "OTP_EXPIRED");
        case "MAX_ATTEMPTS_EXCEEDED":
          return apiRateLimited(verifyResult.message);
        case "INVALID_CODE":
        default:
          return apiUnauthorized(verifyResult.message, {
            remainingAttempts: verifyResult.remainingAttempts,
          });
      }
    }

    return apiSuccess(
      {
        verified: true,
        phone: OtpManager.sanitizePhone(phone),
      },
      "Telefon numaranız başarıyla doğrulandı."
    );
  } catch (error: any) {
    return handleApiError(error, "Doğrulama sırasında bir hata oluştu.");
  }
}
