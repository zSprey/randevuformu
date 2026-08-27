import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { data: businesses } = await supabase
    .from('businesses')
    .select('slug, created_at');

  const baseUrl = 'https://randevuformu.com';

  const defaultPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    }
  ];

  const businessPages: MetadataRoute.Sitemap = (businesses || []).map((business) => ({
    url: `${baseUrl}/${business.slug}`,
    lastModified: business.created_at ? new Date(business.created_at) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...defaultPages, ...businessPages];
}
