import { NextRequest, NextResponse } from "next/server";
import { isBusinessApproved } from "@/lib/storage/applicationStore";
import { apiSuccess, apiBadRequest, handleApiError } from "@/lib/apiResponse";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email") || searchParams.get("identifier");

    if (!email) {
      return apiBadRequest("E-posta adresi gereklidir.");
    }

    const check = await isBusinessApproved(email);

    return apiSuccess({
      email,
      allowed: check.allowed,
      status: check.status,
      businessName: check.application?.business_name,
      rejectionReason: check.application?.rejection_reason,
    });
  } catch (error: any) {
    return handleApiError(error, "Durum kontrolü başarısız.");
  }
}
