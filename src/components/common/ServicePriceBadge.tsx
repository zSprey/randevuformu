import React from "react";

export interface ServicePriceBadgeProps {
  price?: number | string | null;
  variant?: "blue" | "emerald" | "plain" | "extra";
  prefix?: string;
  className?: string;
}

/**
 * ServicePriceBadge:
 * Faz 1 gereksinimi:
 * 1. Fiyat alanı boşsa (null, undefined, 0, boş metin) hiçbir şey render etmez (null döner).
 *    Açıklayıcı/placeholder metin dahi yazılmaz.
 * 2. Fiyat alanı doluysa (sayısal ve > 0) hem panelde hem müşteri formunda standart ₺ rozeti gösterir.
 */
export default function ServicePriceBadge({
  price,
  variant = "blue",
  prefix = "",
  className = "",
}: ServicePriceBadgeProps) {
  if (price === undefined || price === null) return null;

  const numPrice = typeof price === "number" ? price : parseFloat(String(price).replace(/[^0-9.]/g, ""));
  if (isNaN(numPrice) || numPrice <= 0) {
    return null;
  }

  const formatted = `${prefix}₺${numPrice.toLocaleString("tr-TR")}`;

  if (variant === "plain") {
    return <span className={className || "font-bold text-[#0F2A4A]"}>{formatted}</span>;
  }

  if (variant === "emerald") {
    return (
      <span
        className={
          className ||
          "text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/80"
        }
      >
        {formatted}
      </span>
    );
  }

  if (variant === "extra") {
    return (
      <span className={className || "text-[11px] font-bold text-indigo-700"}>
        {formatted}
      </span>
    );
  }

  // Default "blue" (Müşteri formu & genel rozet)
  return (
    <span
      className={
        className ||
        "font-bold text-[#0062FF] bg-[#0062FF]/10 px-2 py-0.5 rounded-md text-xs"
      }
    >
      {formatted}
    </span>
  );
}
