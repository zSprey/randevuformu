import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import crypto from "crypto";
import {
  apiSuccess,
  apiBadRequest,
  apiNotFound,
  handleApiError,
} from "@/lib/apiResponse";

function generateReferralCode(prefix: string = "REF"): string {
  const rand = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `${prefix}-${rand}`;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get("tenantId") || "default-tenant";

    const { data: existingReferral } = await supabase
      .from("referrals")
      .select("referral_code, reward_type, is_claimed, created_at")
      .eq("referrer_tenant_id", tenantId);

    let activeCode = existingReferral?.[0]?.referral_code;

    if (!activeCode) {
      const { data: tenant } = await supabase
        .from("tenants")
        .select("slug")
        .eq("id", tenantId)
        .maybeSingle();

      const prefix = tenant?.slug ? tenant.slug.toUpperCase().slice(0, 5) : "REF";
      activeCode = generateReferralCode(prefix);

      await supabase.from("referrals").insert({
        referrer_tenant_id: tenantId,
        referral_code: activeCode,
        reward_type: "free_month",
        is_claimed: false,
      });
    }

    const successfulReferrals = (existingReferral || []).filter((r) => r.is_claimed).length;
    const pendingReferrals = (existingReferral || []).filter((r) => !r.is_claimed).length;
    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "randevuformu.com";
    const referralLink = `https://${rootDomain}?ref=${activeCode}`;

    return apiSuccess({
      referralCode: activeCode,
      referralLink,
      stats: {
        totalInvites: (existingReferral || []).length,
        successfulReferrals,
        pendingReferrals,
        earnedFreeMonths: successfulReferrals,
      },
      rewardDescription: "Davet ettiğiniz her yeni işletme Pro plana geçtiğinde 1 ay ücretsiz kazanın!",
    });
  } catch (err: any) {
    return handleApiError(err, "Tavsiye bilgileri alınamadı.");
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { referralCode, newTenantId } = body;

    if (!referralCode || !newTenantId) {
      return apiBadRequest("referralCode ve newTenantId zorunludur.");
    }

    const cleanCode = referralCode.trim().toUpperCase();

    const { data: refRecord, error: refError } = await supabase
      .from("referrals")
      .select("id, referrer_tenant_id, referral_code, is_claimed")
      .eq("referral_code", cleanCode)
      .maybeSingle();

    if (refError || !refRecord) {
      return apiNotFound("Geçersiz veya süresi dolmuş tavsiye kodu.");
    }

    if (refRecord.referrer_tenant_id === newTenantId) {
      return apiBadRequest("Kendi tavsiye kodunuzu kullanamazsınız.");
    }

    await supabase
      .from("referrals")
      .update({
        referred_tenant_id: newTenantId,
        is_claimed: true,
      })
      .eq("id", refRecord.id);

    return apiSuccess(
      {
        valid: true,
        rewardApplied: "PRO_1_MONTH_FREE",
      },
      "Tavsiye kodu başarıyla uygulandı. 1 Ay ücretsiz Pro plan hediyeniz tanımlandı!"
    );
  } catch (err: any) {
    return handleApiError(err, "Tavsiye kodu uygulanamadı.");
  }
}
