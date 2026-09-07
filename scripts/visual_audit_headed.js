const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

async function runVisualAudit() {
  console.log("=================================================");
  console.log("🚀 CANLI VISUAL AUDIT BAŞLATILIYOR (HEADED MODE)");
  console.log("Masaüstünüzde tarayıcı açılacak ve tüm adımları canlı göreceksiniz.");
  console.log("=================================================");

  const report = {
    startedAt: new Date().toISOString(),
    pagesTested: [],
    workingFeatures: [],
    defectsAndGaps: [],
    consoleErrors: [],
    networkFailures: []
  };

  // Launch browser in HEADED mode with slowMo so user can see every action
  let browser;
  try {
    browser = await chromium.launch({
      channel: "msedge",
      headless: false,
      slowMo: 600,
      args: ["--start-maximized"]
    });
  } catch {
    browser = await chromium.launch({
      headless: false,
      slowMo: 600,
      args: ["--start-maximized"]
    });
  }

  const context = await browser.newContext({
    viewport: { width: 1366, height: 768 }
  });
  const page = await context.newPage();

  // Track console errors
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      const text = msg.text();
      // Ignore favicon or non-critical 3rd party tracker errors
      if (!text.includes("favicon") && !text.includes("analytics")) {
        console.log("⚠️ [Tarayıcı Konsol Hatası]:", text);
        report.consoleErrors.push({ url: page.url(), text });
      }
    }
  });

  // Track network failures
  page.on("response", (response) => {
    if (response.status() >= 400 && response.status() !== 404) {
      report.networkFailures.push({
        url: response.url(),
        status: response.status()
      });
    }
  });

  try {
    // ──────────────────────────────────────────────────
    // 1. ANA SAYFA TESTİ (https://randevuformu.com)
    // ──────────────────────────────────────────────────
    console.log("\n[TEST 1/5] 🌐 Ana Sayfa Yükleniyor: https://randevuformu.com");
    await page.goto("https://randevuformu.com", { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForTimeout(2000);
    report.pagesTested.push("https://randevuformu.com");

    const pageTitle = await page.title();
    console.log("  ✓ Sayfa Başlığı:", pageTitle);
    report.workingFeatures.push(`Ana sayfa başarıyla yüklendi (${pageTitle})`);

    // Check Hero CTA button
    const heroBtn = page.locator("a:has-text('Randevu Formu Oluştur'), a:has-text('Ücretsiz Başla'), button:has-text('Başla')").first();
    if (await heroBtn.count() > 0) {
      console.log("  ✓ Ana Sayfa CTA Butonu mevcut.");
      report.workingFeatures.push("Ana Sayfa Kayıt / Randevu Formu Oluştur butonu aktif");
    } else {
      report.defectsAndGaps.push("Ana Sayfada belirgin bir CTA kayıt butonu eksik olabilir.");
    }

    // Scroll down to check visual elements
    console.log("  ⬇️ Sayfa aşağı kaydırılıyor (Özellikler & Sektörler)...");
    await page.evaluate(() => window.scrollBy({ top: 800, behavior: "smooth" }));
    await page.waitForTimeout(1500);
    await page.evaluate(() => window.scrollBy({ top: 1200, behavior: "smooth" }));
    await page.waitForTimeout(1500);

    // ──────────────────────────────────────────────────
    // 2. BY ERMAN RANDEVU FORMU TESTİ (https://randevuformu.com/byerman)
    // ──────────────────────────────────────────────────
    console.log("\n[TEST 2/5] 💈 By Erman Randevu Sayfası Test Ediliyor...");
    await page.goto("https://randevuformu.com/byerman", { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForTimeout(2500);
    report.pagesTested.push("https://randevuformu.com/byerman");

    // Check Verified Google Badge
    const googleBadge = page.locator("text=Doğrulanmış Google İşletmesi");
    if (await googleBadge.count() > 0) {
      console.log("  ✓ Doğrulanmış Google İşletmesi rozeti görünür.");
      report.workingFeatures.push("Doğrulanmış Google İşletmesi rozeti ve Google Maps yönlendirmesi aktif");
    }

    // Test Service Selection (Step 1)
    console.log("  💇 Hizmet seçimi (Adım 1) test ediliyor...");
    const serviceItems = page.locator("input[type='checkbox'], button:has-text('₺'), div:has-text('Saç Kesimi')");
    const serviceCount = await serviceItems.count();
    console.log(`  ✓ Bulunan hizmet/seçenek sayısı: ${serviceCount}`);

    // Click first primary service
    const firstService = page.locator("text=Saç Kesimi").first();
    if (await firstService.count() > 0) {
      await firstService.click();
      console.log("  ✓ 'Saç Kesimi' seçildi.");
      report.workingFeatures.push("Hizmet seçimi tıklanabilir ve çalışıyor");
      await page.waitForTimeout(1000);
    } else {
      report.defectsAndGaps.push("Saç Kesimi hizmeti bulunamadı veya tıklanamadı.");
    }

    // Click an extra service if available
    const extraService = page.locator("text=Maske, text=Ağda, text=Serum").first();
    if (await extraService.count() > 0) {
      await extraService.click();
      console.log("  ✓ Ekstra hizmet seçildi.");
      report.workingFeatures.push("Ekstra hizmet (add-on) seçimi çalışıyor");
      await page.waitForTimeout(1000);
    }

    // Click "Devam Et" / Next button
    const nextBtn = page.locator("button:has-text('Devam Et'), button:has-text('Tarih & Saat Seç'), button:has-text('İlerle')").first();
    if (await nextBtn.count() > 0 && await nextBtn.isEnabled()) {
      console.log("  ✓ 'Devam Et' butonuna tıklanıyor...");
      await nextBtn.click();
      await page.waitForTimeout(2000);
      report.workingFeatures.push("Hizmet seçiminden Tarih/Saat adımına geçiş başarılı");
    } else {
      console.log("  ⚠️ 'Devam Et' butonu bulunamadı veya aktif değil.");
      report.defectsAndGaps.push("Hizmet seçiminden sonraki 'Devam Et' butonu tetiklenemedi.");
    }

    // Test Date & Time Slots (Step 2)
    console.log("  📅 Tarih & Saat seçimi (Adım 2) test ediliyor...");
    const timeSlot = page.locator("button:has-text(':')").first();
    if (await timeSlot.count() > 0) {
      const slotText = await timeSlot.textContent();
      console.log(`  ✓ Saat slotu seçiliyor: ${slotText?.trim()}`);
      await timeSlot.click();
      report.workingFeatures.push(`Saat slot seçimi çalışıyor (${slotText?.trim()})`);
      await page.waitForTimeout(1500);

      // Click next to customer info
      const toCustomerBtn = page.locator("button:has-text('Devam Et'), button:has-text('Bilgileri Gir')").first();
      if (await toCustomerBtn.count() > 0 && await toCustomerBtn.isEnabled()) {
        await toCustomerBtn.click();
        await page.waitForTimeout(2000);
      }
    } else {
      console.log("  ℹ️ Bugün için uygun saat slotu listelenmedi (tatil veya çalışma saati dışı olabilir).");
      report.defectsAndGaps.push("Tarih seçiminde aktif saat slotu bulunamadı veya slotlar pasif.");
    }

    // Test Customer Info Form (Step 3)
    console.log("  ✍️ Müşteri bilgi formu kontrol ediliyor...");
    const nameInput = page.locator("input[placeholder*='Ad'], input[name*='name'], input[type='text']").first();
    const phoneInput = page.locator("input[placeholder*='05'], input[type='tel'], input[placeholder*='Telefon']").first();

    if (await nameInput.count() > 0 && await phoneInput.count() > 0) {
      console.log("  ✓ İsim ve telefon alanları dolduruluyor...");
      await nameInput.fill("Test Müşteri Playwright");
      await page.waitForTimeout(800);
      await phoneInput.fill("05321234567");
      await page.waitForTimeout(1000);
      report.workingFeatures.push("Müşteri iletişim formu alanları giriş kabul ediyor");
    }

    // ──────────────────────────────────────────────────
    // 3. AI CHATBOT WIDGET TESTİ
    // ──────────────────────────────────────────────────
    console.log("\n[TEST 3/5] 🤖 AI Chatbot Widget Test Ediliyor...");
    const chatBubble = page.locator("button:has(svg.lucide-message-circle), button[aria-label*='chat'], div.fixed button").last();
    if (await chatBubble.count() > 0) {
      console.log("  ✓ Chatbot balonu bulundu, açılıyor...");
      await chatBubble.click();
      await page.waitForTimeout(1500);

      const chatInput = page.locator("input[placeholder*='mesaj'], textarea[placeholder*='mesaj'], input[placeholder*='Sor']").first();
      if (await chatInput.count() > 0) {
        console.log("  ✓ Chatbot açıldı, test sorusu yazılıyor...");
        await chatInput.fill("Fiyatlar nedir?");
        await page.waitForTimeout(800);
        await page.keyboard.press("Enter");
        await page.waitForTimeout(3000);
        report.workingFeatures.push("AI Chatbot widget'ı açılıyor ve mesaj gönderme tetikleniyor");
      }
      // Close chat if possible
      const closeChat = page.locator("button:has(svg.lucide-x)").first();
      if (await closeChat.count() > 0) await closeChat.click();
    } else {
      report.defectsAndGaps.push("Sağ alttaki Chatbot açılış butonu bulunamadı.");
    }

    // ──────────────────────────────────────────────────
    // 4. SEKTÖRLER SAYFALARI TESTİ (https://randevuformu.com/sektorler/berber)
    // ──────────────────────────────────────────────────
    console.log("\n[TEST 4/5] 📐 Sektör Sayfaları Test Ediliyor (/sektorler/berber)...");
    await page.goto("https://randevuformu.com/sektorler/berber", { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForTimeout(2000);
    report.pagesTested.push("https://randevuformu.com/sektorler/berber");

    const sektorHeading = await page.locator("h1").first().textContent();
    console.log("  ✓ Sektör Başlığı:", sektorHeading?.trim());
    report.workingFeatures.push(`Sektör landing page aktif: ${sektorHeading?.trim()}`);

    // ──────────────────────────────────────────────────
    // 5. AYARLAR & PANEL ERİŞİM TESTİ (GÜVENLİK GUARD)
    // ──────────────────────────────────────────────────
    console.log("\n[TEST 5/5] 🔒 Güvenlik & Dashboard Giriş Kontrolü (/settings)...");
    await page.goto("https://randevuformu.com/settings", { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForTimeout(2000);
    const currentUrl = page.url();
    console.log("  ✓ /settings yönlendirme durumu:", currentUrl);
    if (currentUrl.includes("/login")) {
      console.log("  ✓ Auth Guard başarılı: Giriş yapmamış kullanıcı doğrudan /login'e yönlendirildi.");
      report.workingFeatures.push("Auth Guard koruması aktif: /settings rotası oturumsuz kullanıcılara kapalı");
    } else {
      console.log("  ℹ️ /settings doğrudan açıldı veya oturum mevcut.");
    }

  } catch (err) {
    console.error("Test akışı sırasında beklenmeyen hata:", err);
    report.defectsAndGaps.push(`Genel test yürütme hatası: ${err.message}`);
  } finally {
    console.log("\n🏁 Test tamamlandı. Tarayıcı 4 saniye sonra kapanacak...");
    await page.waitForTimeout(4000);
    await browser.close();

    const reportPath = path.join(__dirname, "../visual_qa_report.json");
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf-8");
    console.log(`\n📋 Rapor kaydedildi: ${reportPath}`);
    console.log("=================================================");
  }
}

runVisualAudit();
