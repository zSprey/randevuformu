import { NextResponse } from "next/server";
import { SEKTOR_DATA } from "@/lib/sektorler";
import { INITIAL_BLOG_POSTS } from "@/lib/blogData";

export const dynamic = "force-dynamic";

async function submitIndexNow() {
  const host = "randevuformu.com";
  const key = "randevuformu2026indexnowkey";
  const keyLocation = `https://${host}/randevuformu-indexnow.txt`;

  const sectorUrls = Object.keys(SEKTOR_DATA).map((s) => `https://${host}/sektorler/${s}`);
  const blogUrls = INITIAL_BLOG_POSTS.map((b) => `https://${host}/blog/${b.slug}`);
  const exampleUrls = Object.values(SEKTOR_DATA).map((s) => `https://${host}/ornek/${s.exampleSlug}`);

  const urlList = [
    `https://${host}`,
    `https://${host}/byerman`,
    `https://${host}/login`,
    `https://${host}/ornek`,
    `https://${host}/kesfet`,
    `https://${host}/contact`,
    `https://${host}/blog`,
    `https://${host}/kesfet/istanbul/kadikoy/kuafor`,
    `https://${host}/kesfet/istanbul/sisli/dis-hekimi`,
    `https://${host}/kesfet/ankara/cankaya/diyetisyen`,
    ...sectorUrls,
    ...blogUrls,
    ...exampleUrls,
  ];

  const payload = {
    host,
    key,
    keyLocation,
    urlList,
  };

  const endpoints = [
    "https://api.indexnow.org/indexnow",
    "https://www.bing.com/indexnow",
    "https://yandex.com/indexnow",
  ];

  const results: Record<string, number> = {};

  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify(payload),
      });
      results[endpoint] = res.status;
    } catch (err: any) {
      results[endpoint] = 500;
    }
  }

  // Google Sitemap Ping
  try {
    await fetch(`https://www.google.com/ping?sitemap=https://${host}/sitemap.xml`, { method: "GET" });
  } catch {}

  // Bing Sitemap Ping
  try {
    await fetch(`https://www.bing.com/ping?sitemap=https://${host}/sitemap.xml`, { method: "GET" });
  } catch {}

  return {
    success: true,
    submittedUrls: urlList.length,
    endpoints: results,
    message: `${urlList.length} adet URL arama motorlarına (IndexNow, Bing, Yandex, Google) anında dizine ekleme için iletildi.`,
  };
}

export async function GET() {
  try {
    const result = await submitIndexNow();
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST() {
  try {
    const result = await submitIndexNow();
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
