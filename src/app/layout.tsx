import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: '#4f46e5',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://randevuformu.com'),
  title: {
    default: "randevuformu.com | Yeni Nesil Online Randevu & Rezervasyon Sistemi",
    template: "%s | randevuformu.com"
  },
  description: "İşletmeniz için 30 saniyede online randevu sistemi kurun. Berber, kuaför, güzellik salonu, diş hekimi, diyetisyen ve klinikler için WhatsApp ve SMS onaylı randevu formu platformu.",
  keywords: [
    "randevu sistemi",
    "online randevu",
    "randevu formu",
    "kuaför randevu programı",
    "berber randevu sistemi",
    "doktor randevu programı",
    "güzellik salonu randevu sistemi",
    "diyetisyen randevu yazılımı",
    "ücretsiz randevu formu",
    "whatsapp randevu sistemi",
    "randevuformu"
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
    title: "randevuformu.com | Yeni Nesil Online Randevu & Rezervasyon Sistemi",
    description: "İşletmeniz için 30 saniyede online randevu sistemi kurun. WhatsApp ve SMS onaylı randevu formu platformu.",
    siteName: "randevuformu.com",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "randevuformu.com - Online Randevu Sistemi",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "randevuformu.com | Yeni Nesil Online Randevu & Rezervasyon Sistemi",
    description: "İşletmeniz için 30 saniyede online randevu sistemi kurun. WhatsApp ve SMS onaylı randevu formu platformu.",
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
    },
  },
  other: {
    'revisit-after': '1 days',
    'geo.region': 'TR',
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
        "@type": "WebApplication",
        "@id": "https://randevuformu.com/#webapp",
        "name": "randevuformu.com",
        "url": "https://randevuformu.com",
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "All",
        "browserRequirements": "Requires JavaScript. Requires HTML5.",
        "description": "İşletmeniz için 30 saniyede online randevu sistemi kurun. WhatsApp ve SMS onaylı randevu formu platformu.",
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
        "sameAs": []
      }
    ]
  };

  return (
    <html lang="tr">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.className} bg-slate-950 text-slate-100 antialiased selection:bg-indigo-500 selection:text-white`}>
        {children}
      </body>
    </html>
  );
}
