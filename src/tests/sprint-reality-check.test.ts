import React from "react";
import ServicePriceBadge from "../components/common/ServicePriceBadge";
import { processCustomerMessage } from "../lib/ai/chatbotEngine";
import { DEFAULT_BYERMAN_SERVICES } from "../lib/storage/servicesStore";
import fs from "fs";
import path from "path";

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${testName}${detail ? ` -> ${detail}` : ""}`);
    failed++;
  }
}

async function runAllTests() {
  console.log("=================================================");
  console.log("🔍 SPRINT REALITY CHECK - DEEP VERIFICATION SUITE");
  console.log("=================================================\n");

  // -------------------------------------------------------------
  // SUITE 1: ServicePriceBadge Logic & Edge Cases
  // -------------------------------------------------------------
  console.log("--- Suite 1: ServicePriceBadge (Faz 1) ---");

  // 1.1 Empty / null / 0 / negative
  assert(ServicePriceBadge({ price: null }) === null, "price=null returns null");
  assert(ServicePriceBadge({ price: undefined }) === null, "price=undefined returns null");
  assert(ServicePriceBadge({ price: 0 }) === null, "price=0 returns null");
  assert(ServicePriceBadge({ price: -50 }) === null, "price=-50 returns null");
  assert(ServicePriceBadge({ price: "" }) === null, "price='' returns null");
  assert(ServicePriceBadge({ price: "abc" }) === null, "price='abc' returns null");
  assert(ServicePriceBadge({ price: "   " }) === null, "price='   ' returns null");

  // 1.2 Valid prices
  const rendered250 = ServicePriceBadge({ price: 250, variant: "blue" });
  assert(rendered250 !== null, "price=250 renders a component");
  // @ts-ignore
  assert(rendered250?.props?.children === "₺250", "price=250 renders ₺250");

  const renderedThousands = ServicePriceBadge({ price: 1500, variant: "emerald" });
  // @ts-ignore
  assert(renderedThousands?.props?.children === "₺1.500", "price=1500 renders ₺1.500 (tr-TR thousand separator)");

  const renderedWithPrefix = ServicePriceBadge({ price: 100, prefix: "+", variant: "extra" });
  // @ts-ignore
  assert(renderedWithPrefix?.props?.children === "+₺100", "prefix='+' renders +₺100");

  const renderedFromString = ServicePriceBadge({ price: "₺350", variant: "plain" });
  // @ts-ignore
  assert(renderedFromString?.props?.children === "₺350", "price='₺350' extracts number and renders ₺350");

  // -------------------------------------------------------------
  // SUITE 2: Chatbot Deterministic Intent & CRO Response (Faz 2)
  // -------------------------------------------------------------
  console.log("\n--- Suite 2: Chatbot Intent & Price Logic (Faz 2) ---");

  // 2.1 Priced service
  const sakalRes = await processCustomerMessage("Sakal tıraşı fiyatı ne kadar?", "byerman");
  assert(sakalRes.reply.includes("₺200"), "Sakal tıraşı query includes exact DB price ₺200", sakalRes.reply);
  assert(sakalRes.reply.includes("25 dakika"), "Sakal tıraşı query includes duration 25 dakika");
  assert(!sakalRes.reply.includes("₺350") && !sakalRes.reply.includes("₺500"), "No price hallucination or random fallback for sakal tıraşı");

  // 2.2 Another priced service
  const cocukRes = await processCustomerMessage("Çocuk saç kesimi kaç tl?", "byerman");
  assert(cocukRes.reply.includes("₺250"), "Çocuk saç kesimi query includes exact DB price ₺250", cocukRes.reply);

  // 2.3 General price list
  const listRes = await processCustomerMessage("Fiyat listeniz ve seans ücretleri nedir?", "byerman");
  assert(listRes.reply.includes("₺350"), "General price list includes Saç Kesimi (₺350)");
  assert(listRes.reply.includes("₺200"), "General price list includes Sakal Tıraşı (₺200)");
  assert(listRes.reply.includes("₺500"), "General price list includes Komple Tıraş (₺500)");
  assert(listRes.reply.includes("ön ödeme gerekmez"), "General price list includes payment reassurance");

  // 2.4 Unpriced service in a sector (simulate unpriced service query)
  const unpricedRes = await processCustomerMessage("Dövme fiyatı ne kadar?", "dovmeci");
  const hasCroCopyOrPrice =
    unpricedRes.reply.includes("Bu hizmetimiz") &&
    unpricedRes.reply.includes("güncel fiyat bilgisi sisteme henüz tanımlanmamıştır; en doğru ve net bilgiyi işletmemizle doğrudan iletişime geçerek öğrenebilirsiniz 🙂");
  assert(
    hasCroCopyOrPrice || unpricedRes.reply.includes("₺"),
    "Dovmeci sector either returns CRO disclaimer for unpriced services or deterministic price",
    unpricedRes.reply
  );

  // 2.5 Explicit Unpriced Service Test (price: null)
  const genericUnpricedRes = await processCustomerMessage("Standart seans ücreti ne kadar?", "yeni-isletme");
  assert(
    genericUnpricedRes.reply.includes("Bu hizmetimiz (Standart Seans & Hizmet) için güncel fiyat bilgisi sisteme henüz tanımlanmamıştır; en doğru ve net bilgiyi işletmemizle doğrudan iletişime geçerek öğrenebilirsiniz 🙂"),
    "Unpriced service returns exact CRO disclaimer with business contact",
    genericUnpricedRes.reply
  );
  assert(
    !genericUnpricedRes.reply.includes("₺"),
    "Unpriced service NEVER hallucinates or outputs a price symbol ₺",
    genericUnpricedRes.reply
  );

  // -------------------------------------------------------------
  // SUITE 3: Brand Assets, Favicon & Schema.org JSON-LD (Faz 3)
  // -------------------------------------------------------------
  console.log("\n--- Suite 3: Brand Assets & Schema (Faz 3) ---");

  const appDir = path.join(__dirname, "..", "app");
  const publicDir = path.join(__dirname, "..", "..", "public");

  const iconAppPath = path.join(appDir, "icon.png");
  const appleIconAppPath = path.join(appDir, "apple-icon.png");
  const faviconAppPath = path.join(appDir, "favicon.ico");
  const ogAppPath = path.join(appDir, "opengraph-image.png");

  assert(fs.existsSync(iconAppPath) && fs.statSync(iconAppPath).size > 1000, "src/app/icon.png exists and > 1KB");
  assert(fs.existsSync(appleIconAppPath) && fs.statSync(appleIconAppPath).size > 1000, "src/app/apple-icon.png exists and > 1KB");
  assert(fs.existsSync(faviconAppPath) && fs.statSync(faviconAppPath).size > 1000, "src/app/favicon.ico exists and > 1KB");
  assert(fs.existsSync(ogAppPath) && fs.statSync(ogAppPath).size > 5000, "src/app/opengraph-image.png exists and > 5KB");

  const layoutContent = fs.readFileSync(path.join(appDir, "layout.tsx"), "utf-8");
  assert(layoutContent.includes("https://randevuformu.com/logo.png"), "Organization schema.org has logo URL https://randevuformu.com/logo.png");
  assert(layoutContent.includes("icon: ["), "layout.tsx metadata.icons has icon array");
  assert(layoutContent.includes("apple: ["), "layout.tsx metadata.icons has apple icon array");

  // -------------------------------------------------------------
  // SUITE 4: SEO Metadata, Titles, Canonical & Schemas (Faz 4)
  // -------------------------------------------------------------
  console.log("\n--- Suite 4: SEO Subdomains, Schemas & Sitemap (Faz 4) ---");

  const slugPageContent = fs.readFileSync(path.join(appDir, "[slug]", "page.tsx"), "utf-8");

  // 4.1 Absolute title in generateMetadata
  assert(
    slugPageContent.includes("title: {") && slugPageContent.includes("absolute: title"),
    "generateMetadata in [slug]/page.tsx uses absolute title to avoid layout template duplication"
  );

  // 4.2 LocalBusiness schema.org
  assert(slugPageContent.includes('"@type": schemaType'), "LocalBusiness dynamic schema type is set");
  assert(slugPageContent.includes('schemaType = "BarberShop"'), "BarberShop schema type detected for berber");
  assert(slugPageContent.includes("priceRange: computedPriceRange"), "priceRange is dynamically computed");
  assert(slugPageContent.includes("hasOfferCatalog: {"), "hasOfferCatalog is present in local business schema");

  // 4.3 Canonical URL
  assert(slugPageContent.includes("canonical: canonicalUrl"), "Canonical URL alternates is set");
  assert(slugPageContent.includes("https://${slug}.randevuformu.com"), "Canonical URL points to subdomain");

  // 4.4 Sitemap
  const sitemapContent = fs.readFileSync(path.join(appDir, "sitemap.ts"), "utf-8");
  assert(sitemapContent.includes("https://byerman.randevuformu.com"), "sitemap.ts contains byerman subdomain");
  assert(sitemapContent.includes("priority: 1.0"), "byerman subdomain has priority 1.0");

  // 4.5 Robots.ts
  const robotsContent = fs.readFileSync(path.join(appDir, "robots.ts"), "utf-8");
  assert(robotsContent.includes("userAgent: '*'"), "robots.ts allows all user agents");
  assert(robotsContent.includes("sitemap: 'https://randevuformu.com/sitemap.xml'"), "robots.ts links to sitemap");

  // 4.6 Kesfet directory SEO
  const kesfetContent = fs.readFileSync(path.join(appDir, "kesfet", "[sehir]", "[ilce]", "[sektor]", "page.tsx"), "utf-8");
  assert(kesfetContent.includes("BreadcrumbList"), "kesfet page has BreadcrumbList schema");
  assert(kesfetContent.includes("FAQPage"), "kesfet page has FAQPage schema");
  assert(kesfetContent.includes("ItemList"), "kesfet page has ItemList schema");
  assert(kesfetContent.includes("absolute: title"), "kesfet page uses absolute title");

  // 4.7 Home page FAQ and Brand definition
  const homeContent = fs.readFileSync(path.join(appDir, "page.tsx"), "utf-8");
  assert(homeContent.includes("RandevuFormu Nedir? Nasıl Çalışır?"), "Home page has brand explainer section");
  assert(homeContent.includes("RandevuFormu nedir?"), "Home page FAQ has brand FAQ");

  console.log("\n=================================================");
  console.log(`📊 SPRINT SUITE RESULTS: ${passed} Passed, ${failed} Failed`);
  console.log("=================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runAllTests().catch((err) => {
  console.error("Test runner failed:", err);
  process.exit(1);
});
