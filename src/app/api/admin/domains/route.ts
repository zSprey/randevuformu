import { NextRequest, NextResponse } from "next/server";
import { promises as dns } from "dns";
import { supabase } from "@/lib/supabase";
import {
  apiSuccess,
  apiBadRequest,
  apiValidationError,
  handleApiError,
} from "@/lib/apiResponse";

const CNAME_TARGET = process.env.CUSTOM_DOMAIN_CNAME_TARGET || "cname.randevuformu.com";

function isValidDomain(domain: string): boolean {
  const domainRegex = /^(?!:\/\/)([a-zA-Z0-9-_]+\.)*[a-zA-Z0-9][a-zA-Z0-9-_]+\.[a-zA-Z]{2,11}$/;
  return domainRegex.test(domain);
}

// GET: Check DNS Status & Verification for Tenant Domain
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get("tenantId") || "default-tenant";

    const { data: tenant, error } = await supabase
      .from("tenants")
      .select("id, slug, custom_domain")
      .eq("id", tenantId)
      .single();

    if (error || !tenant || !tenant.custom_domain) {
      return apiSuccess({
        configured: false,
        domain: null,
        status: "NOT_CONFIGURED",
        instructions: {
          recordType: "CNAME",
          host: "randevu",
          value: CNAME_TARGET,
        },
      });
    }

    const domain = tenant.custom_domain;
    let isCnameValid = false;
    let resolvedCname = "";

    try {
      const cnames = await dns.resolveCname(domain);
      resolvedCname = cnames[0] || "";
      isCnameValid = cnames.some((c) => c.toLowerCase().includes(CNAME_TARGET.toLowerCase()));
    } catch {
      isCnameValid = false;
    }

    return apiSuccess({
      configured: true,
      domain,
      status: isCnameValid ? "VERIFIED_ACTIVE" : "PENDING_DNS",
      cnameTarget: CNAME_TARGET,
      resolvedTarget: resolvedCname || null,
      sslActive: isCnameValid,
    });
  } catch (err: any) {
    return handleApiError(err, "Alan adı durumu sorgulanamadı.");
  }
}

// POST: Bind new Custom Domain to Tenant
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tenantId = "default-tenant", domain } = body;

    if (!domain) {
      return apiBadRequest("domain parametresi zorunludur.");
    }

    const cleanDomain = domain.trim().toLowerCase().replace(/^https?:\/\//, "");

    if (!isValidDomain(cleanDomain)) {
      return apiValidationError("Geçersiz alan adı formatı.");
    }

    // Save in DB
    await supabase
      .from("tenants")
      .update({ custom_domain: cleanDomain })
      .eq("id", tenantId);

    return apiSuccess({
      domain: cleanDomain,
      status: "PENDING_DNS",
      dnsInstructions: {
        type: "CNAME",
        name: cleanDomain.startsWith("www.") ? "www" : cleanDomain.split(".")[0],
        value: CNAME_TARGET,
      },
    }, "Özel alan adı başarıyla tanımlandı.");
  } catch (err: any) {
    return handleApiError(err, "Özel alan adı kaydedilemedi.");
  }
}
