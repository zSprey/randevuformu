---
name: strix-security
description: Autonomous AI Penetration Testing, OWASP Top 10 Vulnerability Scanning & Security Audit Skill based on Strix AI (strix.ai).
allowed-tools: Bash(*) Read(*) Write(*)
---

# 🛡️ Strix AI Security & Autonomous Penetration Testing Skill
> **Reference:** [strix.ai](https://www.strix.ai/) — Autonomous AI Pentesting & Vulnerability Assessment Framework

Bu yetenek, projedeki tüm API uç noktalarını, kimlik doğrulama sınırlarını, veri modellerini ve dışa açık formları otomatik olarak güvenlik testlerinden geçirir ve Proof-of-Concept (PoC) raporları üretir.

---

## 🎯 Güvenlik Denetim Alanları (Audit Domains)

1. **Authentication & Authorization (Kimlik & Yetkilendirme):**
   - Rota koruma denetimi (`/dashboard`, `/admin`, `/calendar`, `/settings`).
   - Token manipülasyonu ve oturum çalma riskleri.
   - Rol bazlı erişim kontrolü (RBAC: `SUPER_ADMIN`, `TENANT_OWNER`, `STAFF`, `CUSTOMER`).

2. **Injection & Input Validation:**
   - SQL / NoSQL Injection (Supabase RLS bypass denemeleri).
   - Cross-Site Scripting (XSS) payload kontrolleri.
   - Zod schema doğrulama sınırları (Türkçe telefon regex, e-posta formatı).

3. **Concurrency & Race Conditions:**
   - Slot çift rezervasyon (double booking) race condition saldırı simülasyonu.
   - Dağıtık kilit (`slot_locks`) süre aşımı ve manipülasyonu.

4. **Payment & Webhook Security:**
   - Stripe & İyzico Webhook imza doğrulama bypass testleri (HMAC-SHA256).
   - Tutar manipülasyonu (Price tampering).

5. **Rate Limiting & DoS Protection:**
   - SMS OTP flood ve maliyet tüketme saldırı kontrolleri (`/api/sms/send-otp`).

---

## ⚡ Strix CLI & Otomatik Tarayıcı Çalıştırma

```bash
# Proje içi Strix Security Audit çalıştır
npx tsx src/lib/security/strixScanner.ts
```
