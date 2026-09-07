import { NextRequest, NextResponse } from "next/server";
import { BruteForceGuard } from "@/lib/security/bruteForceGuard";

export async function GET(req: NextRequest) {
  BruteForceGuard.resetAll();
  return NextResponse.json({
    success: true,
    message: "Admin giriş kilidi başarıyla kaldırıldı. Giriş yapabilirsiniz.",
  });
}

export async function POST(req: NextRequest) {
  BruteForceGuard.resetAll();
  return NextResponse.json({
    success: true,
    message: "Admin giriş kilidi başarıyla kaldırıldı. Giriş yapabilirsiniz.",
  });
}
