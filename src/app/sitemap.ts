// app/sitemap.ts
import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';
import { SEKTOR_DATA } from '@/lib/sektorler';
import { INITIAL_BLOG_POSTS } from '@/lib/blogData';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://randevuformu.com';

  // 1. Statik Rotalar & Programmatic SEO Lokasyon Dizinleri
  const programmaticRoutes = [
    '',
    '/kesfet',
    '/kesfet/istanbul/kadikoy/kuafor',
    '/kesfet/istanbul/sisli/dis-hekimi',
    '/kesfet/ankara/cankaya/diyetisyen',
    '/ornek',
    '/blog',
    '/contact',
    '/login',
  ];

  const corePages: MetadataRoute.Sitemap = programmaticRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : (route.startsWith('/kesfet') ? 'daily' : 'weekly'),
    priority: route === '' ? 1 : (route.startsWith('/kesfet') ? 0.8 : 0.7),
  }));

  // 2. Sektör Sayfaları (Programmatic SEO)
  const sectorPages: MetadataRoute.Sitemap = Object.keys(SEKTOR_DATA).map((slug) => ({
    url: `${baseUrl}/sektorler/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // 3. Blog Yazıları
  const blogPages: MetadataRoute.Sitemap = INITIAL_BLOG_POSTS.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // 4. Örnek Şablonlar
  const examplePages: MetadataRoute.Sitemap = Object.values(SEKTOR_DATA).map((item) => ({
    url: `${baseUrl}/ornek/${item.exampleSlug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  // 5. Kayıtlı İşletmeler
  let businessPages: MetadataRoute.Sitemap = [];
  try {
    const { data: businesses } = await supabase
      .from('businesses')
      .select('slug, created_at');

    if (businesses && businesses.length > 0) {
      businessPages = businesses.map((b) => ({
        url: `${baseUrl}/${b.slug}`,
        lastModified: b.created_at ? new Date(b.created_at) : new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      }));
    }
  } catch {}

  return [...corePages, ...sectorPages, ...blogPages, ...examplePages, ...businessPages];
}
