import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: '#0F2A4A',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://randevuformu.com'),
  title: {
    default: "Randevu Formu & Online Randevu Sistemi | randevuformu.com",
    template: "%s | Randevu Formu"
  },
  description: "Randevu formu ve online randevu sistemi ile işletmenizi büyütün. Berber, kuaför, güzellik salonu, diş hekimi, diyetisyen ve klinikler için WhatsApp onaylı, takvim entegrasyonlu randevu yazılımı.",
  keywords: [
    "randevu formu",
    "online randevu sistemi",
    "randevu sistemi",
    "ücretsiz randevu programı",
    "randevu formu oluşturma",
    "kuaför randevu programı",
    "berber randevu sistemi",
    "doktor randevu programı",
    "güzellik salonu randevu programı",
    "diyetisyen randevu yazılımı",
    "klinik randevu sistemi",
    "whatsapp randevu sistemi",
    "müşteri randevu takip",
    "online rezervasyon programı",
    "randevu yazılımı",
    "randevuformu",
    "randevuformu.com"
  ],
  authors: [{ name: "randevuformu.com" }],
  creator: "randevuformu.com",
  publisher: "randevuformu.com",
  applicationName: "randevuformu.com",
  category: "BusinessApplication",
  alternates: {
    canonical: 'https://randevuformu.com',
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "https://randevuformu.com",
    title: "Randevu Formu & Online Randevu Sistemi | randevuformu.com",
    description: "İşletmeniz için 30 saniyede online randevu formu kurun. WhatsApp ve SMS onaylı randevu platformu.",
    siteName: "randevuformu.com",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Randevu Formu - Online Randevu ve Rezervasyon Sistemi",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Randevu Formu & Online Randevu Sistemi | randevuformu.com",
    description: "İşletmeniz için 30 saniyede online randevu formu kurun. WhatsApp ve SMS onaylı randevu platformu.",
    images: ["/og-image.jpg"],
    creator: "@randevuformu",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
      noarchive: true,
    },
  },
  verification: {
    google: 'googlefa628ba0ea483542',
    other: {
      'google-site-verification': ['googlefa628ba0ea483542', 'fa628ba0ea483542'],
    },
  },
  other: {
    'revisit-after': '1 days',
    'geo.region': 'TR',
    'rating': 'general',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://randevuformu.com/#website",
        "url": "https://randevuformu.com",
        "name": "randevuformu.com",
        "description": "Türkiye'nin Lider Online Randevu ve Müşteri Rezervasyon Platformu",
        "publisher": {
          "@id": "https://randevuformu.com/#organization"
        },
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://randevuformu.com/kesfet?q={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@type": "SoftwareApplication",
        "@id": "https://randevuformu.com/#software",
        "name": "randevuformu.com",
        "url": "https://randevuformu.com",
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "All",
        "browserRequirements": "Requires JavaScript. Requires HTML5.",
        "description": "İşletmeniz için 30 saniyede online randevu formu kurun. WhatsApp ve SMS onaylı randevu yönetim platformu.",
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.9",
          "reviewCount": "520",
          "bestRating": "5",
          "worstRating": "1"
        },
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "TRY",
          "availability": "https://schema.org/InStock"
        }
      },
      {
        "@type": "Organization",
        "@id": "https://randevuformu.com/#organization",
        "name": "randevuformu.com",
        "url": "https://randevuformu.com",
        "logo": "https://randevuformu.com/og-image.jpg",
        "description": "Türkiye'nin en kolay online randevu ve rezervasyon yönetim yazılımı.",
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": "+90-538-480-9001",
          "contactType": "customer service",
          "areaServed": "TR",
          "availableLanguage": "Turkish"
        }
      },
      {
        "@type": "FAQPage",
        "@id": "https://randevuformu.com/#faq",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "randevuformu.com nedir ve işletmeme ne sağlar?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "randevuformu.com, işletmelerin 30 saniyede kendi online randevu bağlantılarını oluşturup web sitelerine veya Instagram biyografilerine eklemelerini sağlayan yeni nesil randevu platformudur. Telefon trafiğinizi sonlandırır ve randevuları 7/24 otomatik toplar."
            }
          },
          {
            "@type": "Question",
            "name": "Randevu sistemi WhatsApp ve SMS ile doğrulanıyor mu?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Evet. Alınan tüm randevular anında WhatsApp ve SMS bildirimleriyle müşterinize ve işletmenize teyit edilir, randevu saati öncesi otomatik hatırlatmalar iletilir."
            }
          },
          {
            "@type": "Question",
            "name": "randevuformu.com'u kullanmak ücretsiz mi?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Evet. Temel online randevu formu oluşturma ve takvim özellikleri tamamen ücretsiz olarak sunulmaktadır. Kurulum için kredi kartı gerekmez."
            }
          },
          {
            "@type": "Question",
            "name": "Hangi sektörler randevuformu.com'u kullanabilir?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Kuaför, berber, güzellik merkezi, diş hekimi, diyetisyen, veteriner, fizyoterapist, psikolog, avukat, danışmanlık ve oto servis başta olmak üzere randevuyla çalışan tüm sektörler için özel şablonlar mevcuttur."
            }
          }
        ]
      }
    ]
  };

  return (
    <html lang="tr">
      <head>
        <meta name="google-site-verification" content="googlefa628ba0ea483542" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
