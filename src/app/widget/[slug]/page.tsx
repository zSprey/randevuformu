"use client";

import React, { use } from "react";
import BookingWidget from "@/components/booking/BookingWidget";

interface WidgetProps {
  params: Promise<{ slug: string }> | { slug: string };
}

export default function EmbedWidgetPage({ params }: WidgetProps) {
  const resolvedParams = "then" in params ? use(params as Promise<{ slug: string }>) : params;
  const slug = resolvedParams?.slug || "dr-ahmet";

  const defaultServices = [
    {
      id: "srv-1",
      name: "Genel Muayene & Konsültasyon",
      duration_minutes: 30,
      price_text: "Ücretsiz",
      price: 0,
      description: "Ön değerlendirme ve muayene seansı.",
    },
    {
      id: "srv-2",
      name: "Kapsamlı Tedavi / Seans",
      duration_minutes: 60,
      price_text: "₺1.500",
      price: 1500,
      description: "Tam kapsamlı uzman seansı.",
    },
  ];

  return (
    <div className="bg-transparent text-slate-100 p-2 sm:p-4 max-w-2xl mx-auto min-h-screen flex items-center justify-center">
      <div className="w-full">
        <BookingWidget
          businessName={slug.replace(/-/g, " ").toUpperCase()}
          businessSlug={slug}
          category="Online Randevu"
          services={defaultServices}
          tenantId={slug}
        />
      </div>
    </div>
  );
}
