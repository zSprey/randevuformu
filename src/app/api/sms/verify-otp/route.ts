import { NextRequest, NextResponse } from "next/server";

// ──────────────────────────────────────────────────────────
// SMS OTP DOĞRULAMA
// POST /api/sms/verify-otp
// Body: { phone: "05XXXXXXXXX", code: "123456" }
// ──────────────────────────────────────────────────────────

// Not: Bu aynı sunucu instance'ındaki otpStore'a erişir.
// Production'da Upstash Redis ile değiştirilmelidir.
const otpStore = new Map<string, { code: string; expiresAt: number; attempts: number }>();

// send-otp rotasındaki store ile paylaşım için global referans
// (Vercel serverless'da aynı instance garanti değildir — production'da Redis kullanın)
declare global {
  var __otpStore: Map<string, { code: string; expiresAt: number; attempts: number }> | undefined;
}

function getOtpStore() {
  if (!globalThis.__otpStore) {
    globalThis.__otpStore = new Map();
  }
  return globalThis.__otpStore;
}

export async function POST(req: NextRequest) {
  try {
    const { phone, code } = await req.json();

    if (!phone || !code) {
      return NextResponse.json(
        { success: false, error: "Telefon numarası ve doğrulama kodu gereklidir." },
        { status: 400 }
      );
    }

    const sanitizedPhone = phone
      .replace(/\s/g, "")
      .replace(/^\+90/, "")
      .replace(/^0/, "");

    const store = getOtpStore();
    const entry = store.get(sanitizedPhone);

    if (!entry) {
      return NextResponse.json(
        { success: false, error: "Doğrulama kodu bulunamadı. Lütfen yeni bir kod isteyin." },
        { status: 404 }
      );
    }

    // Süre kontrolü
    if (Date.now() > entry.expiresAt) {
      store.delete(sanitizedPhone);
      return NextResponse.json(
        { success: false, error: "Doğrulama kodunun süresi dolmuş. Lütfen yeni bir kod isteyin." },
        { status: 410 }
      );
    }

    // Deneme sayısı kontrolü (max 3)
    if (entry.attempts >= 3) {
      store.delete(sanitizedPhone);
      return NextResponse.json(
        { success: false, error: "Çok fazla hatalı deneme. Lütfen yeni bir kod isteyin." },
        { status: 429 }
      );
    }

    // Kod doğrulama
    if (entry.code !== code.trim()) {
      entry.attempts += 1;
      return NextResponse.json(
        {
          success: false,
          error: `Hatalı kod. ${3 - entry.attempts} deneme hakkınız kaldı.`,
        },
        { status: 401 }
      );
    }

    // Başarılı doğrulama — OTP'yi temizle
    store.delete(sanitizedPhone);

    return NextResponse.json({
      success: true,
      verified: true,
      message: "Telefon numaranız başarıyla doğrulandı.",
    });
  } catch (error) {
    console.error("OTP doğrulama hatası:", error);
    return NextResponse.json(
      { success: false, error: "Doğrulama sırasında bir hata oluştu." },
      { status: 500 }
    );
  }
}
