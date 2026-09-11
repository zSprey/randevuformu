import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "RandevuFormu İşletme Yönetim Masası",
    short_name: "RandevuFormu",
    description: "Yeni nesil randevu, müşteri ve salon yönetim sistemi",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#0A0F1C",
    theme_color: "#0F2A4A",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icon.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/apple-icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
