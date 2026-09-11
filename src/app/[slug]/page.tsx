import React from "react";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { SEKTOR_DATA } from "@/lib/sektorler";
import { DEFAULT_BYERMAN_PROFILE } from "@/lib/storage/profileStore";
import { DEFAULT_BYERMAN_SERVICES } from "@/lib/storage/servicesStore";
import { getGeoLocation } from "@/lib/seo/geoEngine";
import BookingPageClient from "./BookingPageClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getBusinessData(slug: string) {
  const isErman = slug === "byerman" || slug === "ermankuafor";

  if (isErman) {
    return {
      business: {
        id: "byerman",
        name: DEFAULT_BYERMAN_PROFILE.name,
        slug: "byerman",
        phone: DEFAULT_BYERMAN_PROFILE.phone,
        address: DEFAULT_BYERMAN_PROFILE.address,
        city: DEFAULT_BYERMAN_PROFILE.city || "İstanbul",
        category: "Erkek Berberi",
        description: "Usta ellerde klasik Türk erkek berberi hizmeti. Sıcak havlu, ustura sakal tıraşı ve saç kesimi.",
        working_hours: DEFAULT_BYERMAN_PROFILE.working_hours,
        services: DEFAULT_BYERMAN_SERVICES,
      },
      isDemo: false,
    };
  }

  // Check matched showcase sector
  const matchedSector = Object.values(SEKTOR_DATA).find(
    (s) => s.exampleSlug === slug || s.slug === slug
  );

  if (matchedSector) {
    return {
      business: {
        id: `demo-${matchedSector.slug}`,
        name: matchedSector.exampleName || matchedSector.title,
        slug: slug,
        category: matchedSector.category,
        address: "Kadıköy / İstanbul",
        city: "İstanbul",
        phone: "+90 538 480 90 01",
        services: matchedSector.services || [],
      },
      isDemo: true,
    };
  }

  // Supabase lookup
  try {
    const { data } = await supabase
      .from("businesses")
      .select("*, services(*)")
      .eq("slug", slug)
      .maybeSingle();

    if (data) {
      return {
        business: data,
        isDemo: false,
      };
    }
  } catch (err) {
    console.warn("Server Supabase lookup failed for slug:", slug, err);
  }

  // Generic registered business fallback
  const displayName = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return {
    business: {
      id: slug,
      name: displayName,
      slug: slug,
      category: "Randevu Hizmeti",
      address: "İstanbul, Türkiye",
      city: "İstanbul",
      phone: "+90 538 480 90 01",
      services: [
        {
          id: "srv-standard",
          name: "Standart Randevu Seansı",
          duration_minutes: 30,
          description: "Birebir randevu ve uzman danışmanlık hizmeti.",
        },
      ],
    },
    isDemo: false,
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  if (slug === "dr-ahmet") {
    return {
      title: {
        absolute: "By Erman - Erkek Berberi Randevu Al | RandevuFormu",
      },
    };
  }

  const { business } = await getBusinessData(slug);
  const isByErman = slug === "byerman" || slug === "ermankuafor";
  const businessName = business?.name || slug;
  const category = business?.category || "Randevu";
  const location = business?.address || "İstanbul";

  const title = isByErman
    ? "By Erman Erkek Berberi | Online Randevu Al — Ümraniye İstanbul"
    : `${businessName} Randevu Al | RandevuFormu`;

  const description = isByErman
    ? "By Erman Erkek Berberi resmi online randevu sayfası. Ümraniye İstanbul berber randevusu, saç kesimi, sakal tıraşı, usta seçimi, çalışma saatleri ve güncel fiyat listesi. 30 saniyede WhatsApp onaylı randevunuzu oluşturun."
    : `${businessName} online randevu sayfası. ${category} — ${location}. Müsait çalışma saatlerini inceleyin, 30 saniyede kolayca randevu alın.`;

  const canonicalUrl = `https://${slug}.randevuformu.com`;

  const keywords = isByErman
    ? [
        "by erman",
        "byerman",
        "by erman randevu",
        "by erman berber",
        "by erman erkek berberi",
        "erman güler berber",
        "ümraniye erkek berberi",
        "ümraniye berber randevu",
        "istanbul berber randevu",
        "by erman online randevu",
        "randevuformu byerman",
      ]
    : [businessName, `${businessName} randevu`, category, location];

  return {
    title: {
      absolute: title,
    },
    description,
    keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: "website",
      siteName: "RandevuFormu",
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: `${businessName} Randevu Formu`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-image.png"],
    },
  };
}

export default async function BusinessBookingPage({ params }: PageProps) {
  const { slug } = await params;

  // Permanent redirect for purged demo slug
  if (slug === "dr-ahmet") {
    redirect("/byerman");
  }

  const { business, isDemo } = await getBusinessData(slug);

  // Determine local business schema type based on category
  const lowerCat = (business.category || "").toLowerCase();
  let schemaType = "LocalBusiness";
  if (lowerCat.includes("berber") || slug.includes("berber") || slug === "byerman") {
    schemaType = "BarberShop";
  } else if (lowerCat.includes("kuaför") || lowerCat.includes("güzellik")) {
    schemaType = "HairSalon";
  } else if (lowerCat.includes("diş")) {
    schemaType = "Dentist";
  } else if (lowerCat.includes("diyet") || lowerCat.includes("klinik") || lowerCat.includes("psikolog")) {
    schemaType = "MedicalBusiness";
  } else if (lowerCat.includes("avukat") || lowerCat.includes("hukuk")) {
    schemaType = "LegalService";
  }

  // Calculate dynamic priceRange if services have prices
  const pricedServices = (business.services || []).filter(
    (s: any) =>
      (s.price && Number(s.price) > 0) ||
      (s.price_text && parseFloat(String(s.price_text).replace(/[^0-9.]/g, "")) > 0)
  );
  const minPrice =
    pricedServices.length > 0
      ? Math.min(
          ...pricedServices.map(
            (s: any) =>
              Number(s.price) ||
              parseFloat(String(s.price_text).replace(/[^0-9.]/g, ""))
          )
        )
      : null;
  const maxPrice =
    pricedServices.length > 0
      ? Math.max(
          ...pricedServices.map(
            (s: any) =>
              Number(s.price) ||
              parseFloat(String(s.price_text).replace(/[^0-9.]/g, ""))
          )
        )
      : null;
  const computedPriceRange =
    minPrice !== null && maxPrice !== null
      ? `₺${minPrice} - ₺${maxPrice}`
      : "₺₺";

  const isByErman = slug === "byerman" || slug === "ermankuafor";
  const geo = isByErman
    ? getGeoLocation("istanbul", "umraniye")
    : getGeoLocation("istanbul", "merkez");

  const localBusinessJsonLd = {
    "@type": schemaType,
    "@id": `https://${slug}.randevuformu.com/#localbusiness`,
    name: business.name,
    ...(isByErman
      ? {
          alternateName: [
            "By Erman",
            "ByErman",
            "By Erman Erkek Berberi",
            "Erman Güler",
            "By Erman Berber",
          ],
        }
      : {}),
    url: `https://${slug}.randevuformu.com`,
    telephone: business.phone || "+90 538 480 90 01",
    priceRange: computedPriceRange,
    image: "https://randevuformu.com/logo.png",
    ...(isByErman
      ? {
          hasMap: "https://share.google/VpkvdhoLKLSzWpHA6",
        }
      : {}),
    address: {
      "@type": "PostalAddress",
      streetAddress: business.address || "İstanbul, Türkiye",
      addressLocality: business.city || "İstanbul",
      addressRegion: "İstanbul",
      postalCode: geo.postalCode || "34760",
      addressCountry: "TR",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: geo.latitude,
      longitude: geo.longitude,
    },
    openingHours: "Mo,Tu,We,Th,Fr 09:30-21:30 Sa 09:30-23:00",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "148",
      bestRating: "5",
      worstRating: "1",
    },
    areaServed: [
      {
        "@type": "AdministrativeArea",
        name: isByErman ? "Ümraniye, İstanbul" : "İstanbul",
      },
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: `${business.name} Hizmet ve Fiyat Listesi`,
      itemListElement: (business.services || []).map((s: any) => {
        const itemPrice =
          Number(s.price) ||
          (s.price_text
            ? parseFloat(String(s.price_text).replace(/[^0-9.]/g, ""))
            : 0);
        return {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: s.name,
            description: s.description || undefined,
          },
          ...(itemPrice > 0
            ? {
                price: itemPrice,
                priceCurrency: "TRY",
              }
            : {}),
        };
      }),
    },
  };

  const byErmanFaqs = [
    {
      q: "By Erman Erkek Berberi randevusu nasıl alınır?",
      a: "byerman.randevuformu.com üzerinden By Erman Erkek Berberi için dilediğiniz ustayı (Erman Usta veya Ahmet Kalfa), almak istediğiniz saç-sakal hizmetini ve uygun saati seçerek 30 saniyede online randevunuzu alabilirsiniz. Rezervasyon anında WhatsApp ile onaylanır.",
    },
    {
      q: "By Erman Erkek Berberi nerede ve çalışma saatleri nedir?",
      a: "By Erman Erkek Berberi; İstiklal Mah. Reşit Paşa Cad. No: 88, Ümraniye, İstanbul adresindedir. Çalışma saatleri: Pazartesi - Cuma 09:30 - 21:30, Cumartesi 09:30 - 23:00, Pazar günleri kapalıdır.",
    },
    {
      q: "By Erman Erkek Berberi'nde hangi hizmetler verilmektedir?",
      a: "Saç kesimi, sakal tıraşı, saç & sakal tasarımı, çocuk saç kesimi, saç yıkama & fön, cilt bakımı ve sıcak havlu kompresi gibi profesyonel erkek berber hizmetleri sunulmaktadır.",
    },
  ];

  const fullJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      localBusinessJsonLd,
      ...(isByErman
        ? [
            {
              "@type": "FAQPage",
              mainEntity: byErmanFaqs.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: f.a,
                },
              })),
            },
          ]
        : []),
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(fullJsonLd) }}
      />
      <BookingPageClient slug={slug} initialBusiness={business} isDemo={isDemo} />
    </>
  );
}
