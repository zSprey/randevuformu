import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const PLANS = {
  free: {
    id: "free",
    name: "Ücretsiz Başlangıç",
    priceMonthly: 0,
    maxAppointmentsMonthly: 50,
    maxStaff: 1,
    smsIncluded: 0,
    customDomain: false,
    googleSync: false,
  },
  pro: {
    id: "pro",
    name: "Profesyonel Klinik",
    priceMonthly: 499,
    maxAppointmentsMonthly: -1, // unlimited
    maxStaff: 5,
    smsIncluded: 500,
    customDomain: true,
    googleSync: true,
  },
  enterprise: {
    id: "enterprise",
    name: "Kurumsal Zincir",
    priceMonthly: 1499,
    maxAppointmentsMonthly: -1,
    maxStaff: -1,
    smsIncluded: -1,
    customDomain: true,
    googleSync: true,
    dedicatedSupport: true,
  },
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tenantId = searchParams.get("tenantId");

  if (!tenantId) {
    return NextResponse.json({ success: true, availablePlans: PLANS });
  }

  // Fetch tenant subscription details
  const { data: tenant } = await supabase
    .from("tenants")
    .select("id, name, plan")
    .eq("id", tenantId)
    .single();

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("tenant_id", tenantId)
    .maybeSingle();

  const currentPlanKey = (tenant?.plan || sub?.plan || "pro") as keyof typeof PLANS;
  const currentPlan = PLANS[currentPlanKey] || PLANS.pro;

  return NextResponse.json({
    success: true,
    tenant,
    currentPlan,
    subscription: sub,
    availablePlans: PLANS,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tenantId, planKey } = body;

    if (!tenantId || !planKey || !PLANS[planKey as keyof typeof PLANS]) {
      return NextResponse.json(
        { error: "Geçersiz paket veya tenantId seçimi." },
        { status: 400 }
      );
    }

    // Update tenant plan
    const { error: tenantErr } = await supabase
      .from("tenants")
      .update({ plan: planKey })
      .eq("id", tenantId);

    if (tenantErr) {
      console.warn("Tenant update warning:", tenantErr);
    }

    // Upsert subscription
    await supabase.from("subscriptions").upsert({
      tenant_id: tenantId,
      plan: planKey,
      status: "active",
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: `Tebrikler! Hesabınız ${PLANS[planKey as keyof typeof PLANS].name} paketine başarıyla yükseltildi.`,
      plan: PLANS[planKey as keyof typeof PLANS],
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Abonelik güncellenemedi." },
      { status: 500 }
    );
  }
}
