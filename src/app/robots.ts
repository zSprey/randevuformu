// app/robots.ts
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/panel/', '/api/', '/admin/'], // İşletme yönetim paneli ve API rotaları indexlenmesin
    },
    sitemap: 'https://randevuformu.com/sitemap.xml',
  };
}
