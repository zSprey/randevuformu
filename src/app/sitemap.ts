import { MetadataRoute } from 'next'
 
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://randevuformu.com',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: 'https://randevuformu.com/dr-ahmet',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    // İleride buraya dinamik olarak tüm işletmelerin profilleri eklenecek
  ]
}
