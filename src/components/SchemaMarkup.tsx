import React from 'react';

export type SchemaType = 
  | 'LocalBusiness' 
  | 'MedicalClinic' 
  | 'ProfessionalService' 
  | 'BreadcrumbList' 
  | 'FAQPage'
  | 'WebSite';

interface SchemaProps {
  type: SchemaType;
  data: any;
}

export default function SchemaMarkup({ type, data }: SchemaProps) {
  let schemaContent: any = {};

  if (type === 'LocalBusiness' || type === 'MedicalClinic' || type === 'ProfessionalService') {
    schemaContent = {
      "@context": "https://schema.org",
      "@type": type,
      "name": data.name,
      "image": data.image || "https://randevuformu.com/og-image.jpg",
      "@id": data.url,
      "url": data.url,
      "telephone": data.phone,
      "address": {
        "@type": "PostalAddress",
        "streetAddress": data.address || "",
        "addressLocality": data.city || "İstanbul",
        "addressRegion": data.region || "TR",
        "postalCode": data.postalCode || "",
        "addressCountry": "TR"
      },
      "geo": data.geo ? {
        "@type": "GeoCoordinates",
        "latitude": data.geo.latitude,
        "longitude": data.geo.longitude
      } : undefined,
      "openingHoursSpecification": data.openingHours || [
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
          "opens": "09:00",
          "closes": "18:00"
        }
      ],
      "priceRange": data.priceRange || "₺₺",
      "department": data.department,
      "aggregateRating": data.rating ? {
        "@type": "AggregateRating",
        "ratingValue": data.rating.value,
        "reviewCount": data.rating.count
      } : undefined
    };
  } else if (type === 'BreadcrumbList') {
    schemaContent = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": data.items.map((item: any, index: number) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": item.name,
        "item": item.url
      }))
    };
  } else if (type === 'FAQPage') {
    schemaContent = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": data.faqs.map((faq: any) => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer
        }
      }))
    };
  } else if (type === 'WebSite') {
    schemaContent = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": data.name,
      "url": data.url,
      "potentialAction": data.searchUrl ? {
        "@type": "SearchAction",
        "target": `${data.searchUrl}?q={search_term_string}`,
        "query-input": "required name=search_term_string"
      } : undefined
    };
  } else {
    // Fallback for completely custom schemas
    schemaContent = {
      "@context": "https://schema.org",
      "@type": type,
      ...data
    };
  }

  // Clean undefined properties cleanly
  const cleanSchema = JSON.parse(JSON.stringify(schemaContent));

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(cleanSchema) }}
    />
  );
}
