import { NextRequest, NextResponse } from "next/server";
import { promises as dns } from "dns";
import { supabase } from "@/lib/supabase";

const CNAME_TARGET = process.env.CUSTOM_DOMAIN_CNAME_TARGET || "cname.randevuformu.com";
const VERCEL_API_TOKEN = process.env.VERCEL_API_TOKEN;
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID;

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

    if (error || !tenant) {
      return NextResponse.json({
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

    if (!tenant.custom_domain) {
      return NextResponse.json({
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

    return NextResponse.json({
      configured: true,
      domain,
      status: isCnameValid ? "VERIFIED_ACTIVE" : "PENDING_DNS",
      cnameTarget: CNAME_TARGET,
      resolvedTarget: resolvedCname || null,
      sslActive: isCnameValid,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: Bind new Custom Domain to Tenant
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tenantId = "default-tenant", domain } = body;

    if (!domain) {
      return NextResponse.json({ error: "domain parametresi zorunludur" }, { status: 400 });
    }

    const cleanDomain = domain.trim().toLowerCase().replace(/^https?:\/\//, "");

    if (!isValidDomain(cleanDomain)) {
      return NextResponse.json({ error: "Geçersiz alan adı formatı." }, { status: 422 });
    }

    // Save in DB
    await supabase
      .from("tenants")
      .update({ custom_domain: cleanDomain })
      .eq("id", tenantId);

    return NextResponse.json({
      success: true,
      domain: cleanDomain,
      status: "PENDING_DNS",
      dnsInstructions: {
        type: "CNAME",
        name: cleanDomain.startsWith("www.") ? "www" : cleanDomain.split(".")[0],
        value: CNAME_TARGET,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
