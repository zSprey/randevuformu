---
name: skill-ui
description: UI/UX Reverse Engineering, Design System Extraction & Visual Verification Skill powered by Playwright and Tailwind CSS.
allowed-tools: Bash(playwright-cli:*) Read(*) Write(*)
---

# 🎨 Skill UI: Frontend Design System & Visual Verification Engine

Bu yetenek (Skill), yapay zeka ajanlarının web arayüzlerini tersine mühendislikle (reverse engineering) incelemesini, tasarım token'larını (renk paletleri, tipografi, boşluklar, gölgeler, glassmorphism) çıkarmasını ve Playwright motoru ile pixel-perfect bileşenler üretmesini sağlar.

---

## 🚀 Temel Yetenekler & İş Akışları

### 1. Canlı Tasarım Analizi & Token Çıkarma
Hedef web sitesini veya mevcut uygulamayı Playwright ile açıp DOM yapısını ve hesaplanmış CSS stillerini (Computed Styles) analiz eder:

```bash
# Sayfayı aç ve snapshot al
npx playwright-cli open https://randevuformu.com
npx playwright-cli snapshot

# Hesaplanan renk ve tipografi stillerini çek
npx playwright-cli eval "() => {
  const el = document.querySelector('button');
  const style = window.getComputedStyle(el);
  return { bg: style.backgroundColor, color: style.color, radius: style.borderRadius, font: style.fontFamily };
}"
```

### 2. Dark Luxury & Glassmorphic Tasarım Standartları
Tüm üretilen UI bileşenleri aşağıdaki tasarım kurallarına uymalıdır:
- **Arka Plan:** `bg-slate-950` / `bg-slate-900/80` ile derin karanlık mod.
- **Cam Efekti (Glassmorphism):** `backdrop-blur-xl border border-white/10 shadow-2xl`.
- **Vurgu Renkleri:** `indigo-600` / `indigo-500`, başarı için `emerald-500`, uyarı/no-show için `amber-500`.
- **Animasyonlar:** `framer-motion` ile yumuşak geçişler (`layout`, `initial={{ opacity: 0, y: 10 }}`, `animate={{ opacity: 1, y: 0 }}`).

### 3. Görsel Doğrulama (Visual Verification)
Bileşen geliştirildikten sonra Playwright ile otomatik ekran görüntüsü ve durum kontrolü:

```bash
# Ekran görüntüsü al
npx playwright-cli screenshot
# Mobil görünüm testi
npx playwright-cli resize 375 812
npx playwright-cli screenshot
```
