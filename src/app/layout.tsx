import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "randevuformu.com | Türkiye'nin En Kolay Randevu Sistemi",
  description: "İşletmeniz için 30 saniyede online randevu sistemi kurun. WhatsApp bildirimli, SMS hatırlatmalı ücretsiz randevu formu.",
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
