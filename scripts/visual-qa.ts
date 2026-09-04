import { chromium } from "playwright";
import * as fs from "fs";
import * as path from "path";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const OUTPUT_DIR = path.join(__dirname, "../.playwright/screenshots");

async function runVisualQA() {
  console.log("🚀 Visual QA Auditor starting...");
  console.log(`📍 Testing against: ${BASE_URL}`);

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  const pagesToAudit = [
    { name: "home_hero", path: "/" },
    { name: "kuafor_template", path: "/kuafor" },
    { name: "diyetisyen_template", path: "/diyetisyen" },
    { name: "login_page", path: "/login" },
  ];

  const results: Array<{ name: string; url: string; status: number; screenshot: string }> = [];

  for (const item of pagesToAudit) {
    const fullUrl = `${BASE_URL}${item.path}`;
    console.log(`📸 Capturing: ${fullUrl}`);
    try {
      const response = await page.goto(fullUrl, { waitUntil: "networkidle", timeout: 15000 });
      const status = response?.status() || 0;

      // Verify no purple/indigo neon in DOM classes
      const purpleElements = await page.evaluate(() => {
        const els = document.querySelectorAll("[class*='purple'], [class*='indigo-600']");
        return Array.from(els).map(el => ({ tag: el.tagName, className: el.className }));
      });

      if (purpleElements.length > 0) {
        console.warn(`⚠️ Warning: Found ${purpleElements.length} elements with purple/indigo classes on ${item.path}`);
      } else {
        console.log(`✅ Clean Design System: 0 purple/indigo neon classes on ${item.path}`);
      }

      const screenshotPath = path.join(OUTPUT_DIR, `${item.name}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: false });

      results.push({
        name: item.name,
        url: fullUrl,
        status,
        screenshot: screenshotPath,
      });
    } catch (err: any) {
      console.error(`❌ Failed to capture ${fullUrl}:`, err.message);
    }
  }

  await browser.close();

  console.log("\n📊 Visual QA Audit Summary:");
  console.table(results);
  console.log(`📁 Screenshots saved to: ${OUTPUT_DIR}`);
}

runVisualQA().catch((err) => {
  console.error("QA Script error:", err);
  process.exit(1);
});
