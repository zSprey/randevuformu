import { NextRequest, NextResponse } from "next/server";

// ──────────────────────────────────────────────────────────
// SMS OTP GÖNDERME — Netgsm XML API
// POST /api/sms/send-otp
// Body: { phone: "05XXXXXXXXX" }
// ──────────────────────────────────────────────────────────

const NETGSM_USERCODE = process.env.NETGSM_USERCODE || "";
const NETGSM_PASSWORD = process.env.NETGSM_PASSWORD || "";
const NETGSM_MSGHEADER = process.env.NETGSM_MSGHEADER || "RANDEVUFRM";

// Basit sunucu taraflı OTP deposu (Production'da Upstash Redis kullanın)
const otpStore = new Map<string, { code: string; expiresAt: number; attempts: number }>();

// Süresi dolmuş OTP'leri temizle
function cleanupExpiredOtps() {
  const now = Date.now();
  for (const [key, value] of otpStore.entries()) {
    if (value.expiresAt < now) {
      otpStore.delete(key);
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();

    if (!phone || typeof phone !== "string") {
      return NextResponse.json(
        { success: false, error: "Telefon numarası gereklidir." },
        { status: 400 }
      );
    }

    // Türk telefon formatına normalize et
    const sanitizedPhone = phone
      .replace(/\s/g, "")
      .replace(/^\+90/, "")
      .replace(/^0/, "");

    if (!/^5\d{9}$/.test(sanitizedPhone)) {
      return NextResponse.json(
        { success: false, error: "Geçerli bir Türk cep telefonu numarası girin (05XX XXX XX XX)." },
        { status: 400 }
      );
    }

    // Rate limit: Aynı numaraya 60 saniye içinde tekrar OTP gönderme
    const existing = otpStore.get(sanitizedPhone);
    if (existing && existing.expiresAt - 4 * 60 * 1000 > Date.now()) {
      return NextResponse.json(
        { success: false, error: "Lütfen 60 saniye bekleyip tekrar deneyin." },
        { status: 429 }
      );
    }

    // 6 haneli OTP üret
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Netgsm XML API ile SMS gönder
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
        // SMS gönderimi başarısız olsa bile OTP'yi kaydet (dev ortamında test için)
      }
    } else {
      // Geliştirme ortamı: Netgsm kimlik bilgileri yoksa konsola yazdır
      console.log(`[DEV] OTP for ${sanitizedPhone}: ${otpCode}`);
    }

    // OTP'yi kaydet (5 dakika geçerli, max 3 deneme)
    otpStore.set(sanitizedPhone, {
      code: otpCode,
      expiresAt: Date.now() + 5 * 60 * 1000,
      attempts: 0,
    });

    // Periyodik temizlik
    cleanupExpiredOtps();

    return NextResponse.json({
      success: true,
      message: "Doğrulama kodu telefonunuza gönderildi.",
      // Geliştirme ortamında kodu döndür (production'da kaldır!)
      ...(process.env.NODE_ENV === "development" ? { devCode: otpCode } : {}),
    });
  } catch (error) {
    console.error("OTP gönderim hatası:", error);
    return NextResponse.json(
      { success: false, error: "SMS gönderilemedi. Lütfen tekrar deneyin." },
      { status: 500 }
    );
  }
}
