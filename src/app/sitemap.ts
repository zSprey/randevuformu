import { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";
import { SEKTOR_DATA } from "@/lib/sektorler";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_ROOT_DOMAIN
    ? `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`
    : "https://randevuformu.com";

  // 1. Static Core Landing Pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  // 2. Programmatic High-Intent Sector Landing Pages
  const sectorPages: MetadataRoute.Sitemap = Object.keys(SEKTOR_DATA).map((slug) => ({
    url: `${baseUrl}/sektorler/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  // 3. Dynamic Registered Tenant Business Pages
  let businessPages: MetadataRoute.Sitemap = [];
  try {
    const { data: businesses } = await supabase
      .from("businesses")
      .select("slug, created_at");

    if (businesses && businesses.length > 0) {
      businessPages = businesses.map((b) => ({
        url: `${baseUrl}/${b.slug}`,
        lastModified: b.created_at ? new Date(b.created_at) : new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      }));
    }
  } catch (err) {
    // fallback
  }

  return [...staticPages, ...sectorPages, ...businessPages];
}
