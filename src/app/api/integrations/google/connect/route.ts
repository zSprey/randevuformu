import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get("tenantId") || "default-tenant";
    const staffId = searchParams.get("staffId") || "default-staff";
    const returnUrl = searchParams.get("returnUrl") || "/dashboard/settings";

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri =
      process.env.GOOGLE_REDIRECT_URI ||
      `${process.env.NEXT_PUBLIC_APP_URL || "https://randevuformu.com"}/api/integrations/google/callback`;

    if (!clientId || !clientSecret) {
      return NextResponse.json({
        success: true,
        url: `${returnUrl}?success=google_connected_sandbox`,
        message: "Geliştirme modu: Google Takvim simülasyonu bağlandı.",
      });
    }

    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

    const statePayload = Buffer.from(
      JSON.stringify({
        tenantId,
        staffId,
        returnUrl,
        timestamp: Date.now(),
      })
    ).toString("base64url");

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: [
        "https://www.googleapis.com/auth/calendar",
        "https://www.googleapis.com/auth/calendar.events",
        "https://www.googleapis.com/auth/userinfo.email",
      ],
      state: statePayload,
    });

    const acceptHeader = req.headers.get("accept") || "";
    if (acceptHeader.includes("application/json")) {
      return NextResponse.json({ url: authUrl });
    }

    return NextResponse.redirect(authUrl);
  } catch (error: any) {
    console.error("[Google Connect Error]:", error);
    return NextResponse.json({ error: error.message || "OAuth başlatılamadı" }, { status: 500 });
  }
}
