import { NextRequest, NextResponse } from "next/server";
import { BruteForceGuard } from "@/lib/security/bruteForceGuard";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("rf_superadmin_session")?.value;
    const isValid = BruteForceGuard.verifyAdminToken(token);

    if (!isValid) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      user: { username: "musa", role: "SUPER_ADMIN" },
    });
  } catch (err: any) {
    return NextResponse.json({ authenticated: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const response = NextResponse.json({ success: true, message: "Çıkış yapıldı" });
  response.cookies.delete("rf_superadmin_session");
  return response;
}
