import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export const RESERVED_SUBDOMAINS = new Set([
  "www",
  "admin",
  "api",
  "app",
  "login",
  "panel",
  "dashboard",
  "settings",
  "staff",
  "calendar",
  "clients",
  "packages",
  "retention",
  "qr-stand",
  "blog",
  "sektorler",
  "kesfet",
  "contact",
  "ornek",
  "tv",
  "widget",
  "auth",
  "mail",
  "status",
  "assets",
  "cdn",
  "static",
  "help",
  "support",
  "dev",
  "test",
  "staging",
  "root",
  "mail",
  "smtp",
  "pop",
  "imap",
]);

export function cleanSubdomain(input: string): string {
  if (!input) return "";
  let s = input.trim().toLowerCase();

  // Turkish character mapping
  const trMap: Record<string, string> = {
    ç: "c",
    ğ: "g",
    ı: "i",
    ö: "o",
    ş: "s",
    ü: "u",
  };
  s = s.replace(/[çğıöşü]/g, (m) => trMap[m] || m);

  // Replace spaces, underscores with hyphens
  s = s.replace(/[\s_]+/g, "-");

  // Remove any non-alphanumeric and non-hyphen chars
  s = s.replace(/[^a-z0-9-]/g, "");

  // Collapse multiple hyphens
  s = s.replace(/-+/g, "-");

  // Strip leading/trailing hyphens
  s = s.replace(/^-+|-+$/g, "");

  return s;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawSubdomain = searchParams.get("subdomain") || "";
    const currentSlug = (searchParams.get("currentSlug") || "").trim().toLowerCase();

    const subdomain = cleanSubdomain(rawSubdomain);

    if (!subdomain) {
      return NextResponse.json({
        success: false,
        available: false,
        reason: "Lütfen bir alan adı giriniz.",
      });
    }

    if (subdomain.length < 3) {
      return NextResponse.json({
        success: false,
        available: false,
        subdomain,
        reason: "Alan adı en az 3 karakter olmalıdır.",
      });
    }

    if (subdomain.length > 30) {
      return NextResponse.json({
        success: false,
        available: false,
        subdomain,
        reason: "Alan adı en fazla 30 karakter olabilir.",
      });
    }

    // Reserved check
    if (RESERVED_SUBDOMAINS.has(subdomain)) {
      return NextResponse.json({
        success: false,
        available: false,
        subdomain,
        reason: `'${subdomain}' sistem tarafından rezerve edilmiş bir alan adıdır.`,
      });
    }

    // If it's already the current business's own slug, it's available for them
    if (currentSlug && subdomain === currentSlug) {
      return NextResponse.json({
        success: true,
        available: true,
        subdomain,
        fullUrl: `https://${subdomain}.randevuformu.com`,
        pathUrl: `https://randevuformu.com/${subdomain}`,
        reason: "Mevcut alan adınız.",
      });
    }

    // Check database to see if taken by another business
    try {
      const { data, error } = await supabase
        .from("business_profiles")
        .select("business_slug")
        .eq("business_slug", subdomain)
        .maybeSingle();

      if (!error && data && data.business_slug) {
        return NextResponse.json({
          success: false,
          available: false,
          subdomain,
          reason: `'${subdomain}.randevuformu.com' başka bir işletme tarafından alınmış.`,
        });
      }
    } catch (err) {
      console.warn("Database check error:", err);
    }

    // Default "byerman" check
    if (subdomain === "byerman" && currentSlug !== "byerman") {
      return NextResponse.json({
        success: false,
        available: false,
        subdomain,
        reason: "'byerman.randevuformu.com' kullanımda.",
      });
    }

    return NextResponse.json({
      success: true,
      available: true,
      subdomain,
      fullUrl: `https://${subdomain}.randevuformu.com`,
      pathUrl: `https://randevuformu.com/${subdomain}`,
      reason: `'${subdomain}.randevuformu.com' boşta ve kullanıma uygun!`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Alan adı kontrol edilemedi." },
      { status: 500 }
    );
  }
}
