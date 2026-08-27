import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Tüm yollar için geçerli olacak güvenlik başlıkları
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            // Tıklama korsanlığını (Clickjacking) önler. Sitenizin başka bir sitede iframe içinde açılmasını engeller.
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            // Tarayıcıların MIME type sniffing yapmasını engeller
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            // Yönlendirmelerde hassas verilerin (URL parametreleri) dış sitelere gitmesini engeller
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            // Sitenizde kullanılabilecek tarayıcı özelliklerini (kamera, mikrofon, geolokasyon vb.) kısıtlar
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
          {
            // Basit Content-Security-Policy (XSS saldırılarını engellemek için)
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.tailwindcss.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https:;"
          }
        ]
      }
    ];
  }
};

export default nextConfig;
