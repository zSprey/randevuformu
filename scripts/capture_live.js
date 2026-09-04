const { chromium } = require("playwright");
const path = require("path");

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    deviceScaleFactor: 2
  });
  const page = await context.newPage();

  console.log("Opening https://randevuformu.com ...");
  await page.goto("https://randevuformu.com", { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(2000);

  // Take hero screenshot
  const heroCard = page.locator("section").first().locator(".lg\\:grid-cols-2 > div:last-child");
  if (await heroCard.count() > 0) {
    await heroCard.screenshot({ path: path.join(__dirname, "../public/live_dashboard_mockup.png") });
    console.log("Saved live_dashboard_mockup.png");
  }

  // Take whole hero section screenshot
  const heroSection = page.locator("section").first();
  await heroSection.screenshot({ path: path.join(__dirname, "../public/live_hero_section.png") });
  console.log("Saved live_hero_section.png");

  // Take demo booking form screenshot
  try {
    await page.goto("https://randevuformu.com/kuafor", { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(__dirname, "../public/live_booking_kuafor.png") });
    console.log("Saved live_booking_kuafor.png");
  } catch (e) {
    console.log("Booking demo capture error:", e.message);
  }

  await browser.close();
  console.log("CAPTURE_DONE");
}

run().catch(console.error);
