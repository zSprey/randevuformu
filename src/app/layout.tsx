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
    default: "Her Sektör İçin Online Randevu Sistemi & Randevu Formu | randevuformu.com",
    template: "%s | Randevu Formu"
  },
  description: "Berberler, kuaförler, diş hekimleri, güzellik salonları, klinikler, diyetisyenler ve her sektör için online randevu sistemi. WhatsApp onaylı, 30 saniyede kurulum ve takvim eşitlemeli randevu yazılımı.",
  keywords: [
    "berberler için randevu",
    "her sektör için randevu sistemi",
    "online randevu sistemi",
    "randevu formu",
    "randevu sistemi",
    "berber randevu sistemi",
    "berber randevu programı",
    "kuaför randevu programı",
    "kuaför randevu sistemi",
    "klinik randevu sistemi",
    "diş hekimi randevu sistemi",
    "diyetisyen randevu yazılımı",
    "ücretsiz randevu programı",
    "randevu formu oluşturma",
    "whatsapp randevu sistemi",
    "müşteri randevu takip",
    "online rezervasyon programı",
    "randevu yazılımı",
    "randevuformu",
    "randevuformu.com",
    "byerman",
    "by erman"
  ],
  authors: [{ name: "randevuformu.com" }],
  creator: "randevuformu.com",
  publisher: "randevuformu.com",
  applicationName: "randevuformu.com",
  category: "BusinessApplication",
  manifest: "/manifest.webmanifest",
  alternates: {
    canonical: 'https://randevuformu.com',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '48x48' },
      { url: '/icon.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
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
        url: "/og-image.png",
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
    images: ["/og-image.png"],
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
        "@type": "Organization",
        "@id": "https://randevuformu.com/#organization",
        "name": "randevuformu.com",
        "url": "https://randevuformu.com",
        "logo": "https://randevuformu.com/logo.png",
        "image": "https://randevuformu.com/logo.png",
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
        "@type": "SoftwareApplication",
        "@id": "https://randevuformu.com/#software",
        "name": "randevuformu.com - Her Sektör İçin Online Randevu Sistemi",
        "operatingSystem": "Web, iOS, Android",
        "applicationCategory": "BusinessApplication",
        "applicationSubCategory": "Appointment Scheduling & Reservation Software",
        "description": "Berberler, kuaförler, diş hekimleri, diyetisyenler, klinikler ve tüm randevulu sektörler için WhatsApp onaylı, çift yönlü takvim eşitlemeli online randevu formu yazılımı.",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "TRY",
          "description": "Ücretsiz Başlangıç Paketi"
        },
        "featureList": [
          "Berberler İçin Randevu Sistemi (Usta ve Koltuk Seçimi)",
          "Kuaför ve Güzellik Salonu Randevu Programı",
          "Diş Hekimi ve Klinik Randevu Yazılımı",
          "Diyetisyen ve Terapist Seans Takvimi",
          "Her Sektör İçin Özel Subdomain (isletme.randevuformu.com)",
          "WhatsApp ve SMS Otomatik Onay & Hatırlatma",
          "Google Takvim ve Outlook Çift Yönlü Senkronizasyon",
          "Kredi Kartı & Kapora Sanal POS Entegrasyonu"
        ]
      },
      {
        "@type": "FAQPage",
        "@id": "https://randevuformu.com/#faq",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "RandevuFormu hangi sektörler için online randevu sistemi sunar?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "RandevuFormu; berberler, kuaförler, güzellik merkezleri, diş hekimleri, diyetisyenler, psikologlar, veterinerler, avukatlar, oto servisler, dövmeciler, fotoğrafçılar ve randevu ile çalışan tüm hizmet sektörleri için özel çözümler sunar."
            }
          },
          {
            "@type": "Question",
            "name": "Berberler için randevu sistemi nasıl çalışır?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Berber işletmeleri 30 saniyede ücretsiz profillerini açar; ustalarını (personel), çalışma saatlerini ve saç-sakal hizmetlerini listeler. Müşteriler Instagram biyografisi veya WhatsApp linkinden diledikleri ustayı ve saati seçerek 30 saniyede randevu alır, teyitler anında WhatsApp ile iletilir."
            }
          },
          {
            "@type": "Question",
            "name": "Her sektör için online randevu formu kurmak ücretli mi?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Hayır, randevuformu.com üzerinde işletme profilinizi açmak ve temel randevu formunuzu yayınlamak tamamen ücretsizdir. Kredi kartı gerekmez."
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
