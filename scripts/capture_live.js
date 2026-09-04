const { chromium } = require("playwright");
const path = require("path");

async function run() {
  console.log("Launching Edge browser for fresh capture...");
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 950 },
    deviceScaleFactor: 2,
    extraHTTPHeaders: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Pragma": "no-cache"
    }
  });
  const page = await context.newPage();

  const freshUrl = "https://randevuformu.com?v=" + Date.now();
  console.log("Navigating to", freshUrl);
  await page.goto(freshUrl, { waitUntil: "networkidle", timeout: 45000 });
  await page.waitForTimeout(3000);

  // Take screenshot of hero visual card (dashboard mockup)
  const heroCard = page.locator("section").first().locator(".lg\\:grid-cols-2 > div:last-child");
  if (await heroCard.count() > 0) {
    const cardPath = path.join(__dirname, "../public/live_dashboard_mockup.png");
    await heroCard.screenshot({ path: cardPath });
    console.log("Saved live_dashboard_mockup.png to", cardPath);
  }

  // Full hero screenshot
  const heroSection = page.locator("section").first();
  await heroSection.screenshot({ path: path.join(__dirname, "../public/live_hero_section.png") });
  console.log("Saved live_hero_section.png");

  // Also capture mobile viewport of the site
  const mobileContext = await browser.newContext({
    viewport: { width: 412, height: 915 },
    deviceScaleFactor: 2,
    isMobile: true
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto(freshUrl, { waitUntil: "networkidle", timeout: 45000 });
  await mobilePage.waitForTimeout(2000);
  await mobilePage.screenshot({ path: path.join(__dirname, "../public/live_mobile_view.png") });
  console.log("Saved live_mobile_view.png");

  await browser.close();
  console.log("ALL_CAPTURES_SUCCESSFUL");
}

run().catch(console.error);
