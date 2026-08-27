import { NextResponse, NextRequest } from "next/server";

// Rate limiting durumu (In-memory - Prod ortamı için Redis önerilir)
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 dakika
const MAX_REQUESTS_PER_WINDOW = 30; // Banka seviyesinde katı limit

export function applyRateLimit(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const now = Date.now();
  
  const userRecord = rateLimitMap.get(ip);
  if (!userRecord) {
    rateLimitMap.set(ip, { count: 1, lastReset: now });
    return null;
  }

  if (now - userRecord.lastReset > RATE_LIMIT_WINDOW) {
    userRecord.count = 1;
    userRecord.lastReset = now;
    return null;
  }

  if (userRecord.count >= MAX_REQUESTS_PER_WINDOW) {
    return new NextResponse("Too Many Requests - Rate limit exceeded.", { status: 429 });
  }

  userRecord.count += 1;
  return null;
}

// XSS, Clickjacking ve diğer zafiyetler için temel güvenlik başlıkları
export function applySecurityHeaders(res: NextResponse) {
  res.headers.set("Content-Security-Policy", "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests;");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "DENY"); // Clickjacking'i engeller
  res.headers.set("X-XSS-Protection", "1; mode=block");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  res.headers.set("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
  return res;
}

// API istekleri için CSRF Koruma doğrulaması
export function validateCSRFToken(req: NextRequest) {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return null; // Güvenli metodlar
  }

  // İstekte beklenen özel başlıkları kontrol et (Origin/Referer vs CSRF token)
  const csrfToken = req.headers.get("x-csrf-token");
  
  // Basit doğrulama: Eğer state modifying (POST/PUT/DELETE) ise x-csrf-token başlığı bulunmalı
  if (!csrfToken || csrfToken.length < 32) {
    return new NextResponse("Forbidden: Invalid CSRF Token", { status: 403 });
  }

  return null;
}

// Tüm özellikleri sarmalayan Ana Güvenlik Middleware (middleware.ts içinde kullanılmak üzere)
export function securityMiddleware(req: NextRequest) {
  // 1. Rate Limiting Kontrolü
  const rateLimitResponse = applyRateLimit(req);
  if (rateLimitResponse) return rateLimitResponse;

  // 2. CSRF Validasyonu (Sadece /api/ rotaları için örnek olarak)
  if (req.nextUrl.pathname.startsWith("/api/") && !req.nextUrl.pathname.startsWith("/api/auth")) {
    const csrfResponse = validateCSRFToken(req);
    if (csrfResponse) return csrfResponse;
  }

  // 3. Başarılı ise Next response'a Güvenlik Başlıklarını (Security Headers) uygula
  const response = NextResponse.next();
  return applySecurityHeaders(response);
}
