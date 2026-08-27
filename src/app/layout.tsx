import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: '#4f46e5',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1, // Mobil cihazlarda input zoom'unu engeller (formlar için iyi bir UX)
};

export const metadata: Metadata = {
  metadataBase: new URL('https://randevuformu.com'),
  title: {
    default: "randevuformu.com | Türkiye'nin En Kolay Randevu Sistemi",
    template: "%s | randevuformu.com"
  },
  description: "Diş hekimi, güzellik salonu, psikolog veya avukatlar için WhatsApp bildirimli, SMS hatırlatmalı ücretsiz online randevu yönetim sistemi ve randevu formu oluşturucu.",
  keywords: ["randevu sistemi", "online randevu", "randevu formu", "doktor randevu programı", "güzellik salonu randevu", "randevu takip yazılımı", "ücretsiz randevu scripti", "whatsapp randevu sistemi"],
  authors: [{ name: "randevuformu.com" }],
  creator: "randevuformu.com",
  publisher: "randevuformu.com",
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "https://randevuformu.com",
    title: "randevuformu.com | 30 Saniyede Online Randevu Sistemi Kurun",
    description: "İşletmeniz için telefon trafiğini bitirin. Müşterileriniz 7/24 randevu alsın, sistem anında WhatsApp ile onaylasın.",
    siteName: "randevuformu.com",
    images: [
      {
        url: "/og-image.jpg", // Daha sonra public klasörüne bir OG görseli eklenecek
        width: 1200,
        height: 630,
        alt: "randevuformu.com Önizleme",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "randevuformu.com | Türkiye'nin En Kolay Randevu Sistemi",
    description: "İşletmeniz için 30 saniyede online randevu sistemi kurun.",
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={`${inter.className} bg-slate-50 text-slate-900 antialiased`}>
        {children}
      </body>
    </html>
  );
}
