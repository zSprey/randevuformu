import { NextRequest, NextResponse } from "next/server";
import { OtpManager } from "@/lib/security/otpStore";
import {
  apiSuccess,
  apiBadRequest,
  apiRateLimited,
  handleApiError,
} from "@/lib/apiResponse";

// ──────────────────────────────────────────────────────────
// SMS OTP GÖNDERME — Netgsm XML API
// POST /api/sms/send-otp
// Body: { phone: "05XXXXXXXXX" }
// ──────────────────────────────────────────────────────────

const NETGSM_USERCODE = process.env.NETGSM_USERCODE || "";
const NETGSM_PASSWORD = process.env.NETGSM_PASSWORD || "";
const NETGSM_MSGHEADER = process.env.NETGSM_MSGHEADER || "RANDEVUFRM";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone } = body;

    if (!phone || typeof phone !== "string") {
      return apiBadRequest("Telefon numarası gereklidir.");
    }

    const sanitizedPhone = OtpManager.sanitizePhone(phone);

    if (!OtpManager.isValidTurkishPhone(sanitizedPhone)) {
      return apiBadRequest("Geçerli bir Türk cep telefonu numarası girin (05XX XXX XX XX).");
    }

    // Rate limit check: 60 seconds cooldown
    const rateCheck = OtpManager.canRequestOtp(sanitizedPhone);
    if (!rateCheck.allowed) {
      return apiRateLimited(
        `Lütfen ${rateCheck.waitSeconds} saniye bekleyip tekrar deneyin.`,
        rateCheck.waitSeconds
      );
    }

    // Create OTP
    const { code: otpCode } = OtpManager.createOtp(sanitizedPhone);

    // Send SMS via Netgsm XML API if credentials configured
    if (NETGSM_USERCODE && NETGSM_PASSWORD) {
      const xmlBody = `<?xml version="1.0" encoding="UTF-8"?>
<mainbody>
  <header>
    <company>Netgsm</company>
    <usercode>${NETGSM_USERCODE}</usercode>
    <password>${NETGSM_PASSWORD}</password>
    <type>1:n</type>
    <msgheader>${NETGSM_MSGHEADER}</msgheader>
  </header>
  <body>
    <msg><![CDATA[randevuformu.com dogrulama kodunuz: ${otpCode}. Bu kod 5 dakika gecerlidir. Kodunuzu kimseyle paylasmayiniz.]]></msg>
    <no>${sanitizedPhone}</no>
  </body>
</mainbody>`;

      try {
        await fetch("https://api.netgsm.com.tr/sms/send/get", {
          method: "POST",
          headers: { "Content-Type": "application/xml" },
          body: xmlBody,
        });
      } catch (smsError) {
        console.error("Netgsm SMS gönderim hatası:", smsError);
      }
    } else {
      // Dev mode: log to console
      console.log(`[DEV SMS OTP] Phone: ${sanitizedPhone}, Code: ${otpCode}`);
    }

    return apiSuccess(
      {
        phone: sanitizedPhone,
        ...(process.env.NODE_ENV === "development" ? { devCode: otpCode } : {}),
      },
      "Doğrulama kodu telefonunuza SMS ile gönderildi."
    );
  } catch (error: any) {
    return handleApiError(error, "SMS gönderimi sırasında bir hata oluştu.");
  }
}
