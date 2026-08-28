/**
 * ⚡ 50-Agent Swarm Feature: Dynamic Peak-Hour Smart Pricing Engine (Ajan 32)
 * Automatically optimizes pricing based on demand, day of week, and time of day.
 */

export interface PricingRule {
  dayOfWeek?: number; // 5: Cuma, 6: Cumartesi
  startHour?: number; // e.g. 14 (14:00)
  endHour?: number;   // e.g. 18 (18:00)
  multiplier: number; // e.g. 1.2 (+20% surge) or 0.9 (10% discount)
  tag: string;        // e.g. "Yoğun Saat Primi" or "Erken Saat İndirimi"
}

export function calculateDynamicPrice(
  basePrice: number,
  dateStr: string, // "YYYY-MM-DD"
  timeStr: string  // "HH:MM"
): { finalPrice: number; originalPrice: number; discountOrSurgeTag?: string; isSurge: boolean } {
  if (basePrice <= 0) {
    return { finalPrice: 0, originalPrice: 0, isSurge: false };
  }

  const dateObj = new Date(`${dateStr}T${timeStr}:00+03:00`);
  const dayOfWeek = dateObj.getDay();
  const hour = dateObj.getHours();

  // Rules:
  // 1. Weekend / Friday Peak Surge (+15%) between 14:00 and 19:00
  if ((dayOfWeek === 5 || dayOfWeek === 6) && hour >= 14 && hour <= 19) {
    const finalPrice = Math.round(basePrice * 1.15);
    return {
      finalPrice,
      originalPrice: basePrice,
      discountOrSurgeTag: "Yoğun Saat (Prime Time)",
      isSurge: true,
    };
  }

  // 2. Early Morning Off-Peak Discount (-10%) between 09:00 and 11:00 on weekdays
  if (dayOfWeek >= 1 && dayOfWeek <= 4 && hour >= 9 && hour < 11) {
    const finalPrice = Math.round(basePrice * 0.9);
    return {
      finalPrice,
      originalPrice: basePrice,
      discountOrSurgeTag: "Erken Seans İndirimi %10",
      isSurge: false,
    };
  }

  return {
    finalPrice: basePrice,
    originalPrice: basePrice,
    isSurge: false,
  };
}
