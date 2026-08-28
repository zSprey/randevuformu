import { NextRequest, NextResponse } from "next/server";
import { BruteForceGuard } from "@/lib/security/bruteForceGuard";
import {
  apiSuccess,
  apiUnauthorized,
  handleApiError,
} from "@/lib/apiResponse";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("rf_superadmin_session")?.value;
    const isValid = BruteForceGuard.verifyAdminToken(token);

    if (!isValid) {
      return apiUnauthorized("Oturum geçerli değil.");
    }

    return apiSuccess({
      authenticated: true,
      user: { username: "musa", role: "SUPER_ADMIN" },
    });
  } catch (err: any) {
    return handleApiError(err, "Oturum doğrulanamadı.");
  }
}

export async function POST(req: NextRequest) {
  const response = apiSuccess({ authenticated: false }, "Çıkış yapıldı.");
  response.cookies.delete("rf_superadmin_session");
  return response;
}
