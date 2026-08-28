import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const errorParam = searchParams.get("error");

    if (errorParam) {
      return NextResponse.redirect(
        new URL(`/dashboard/settings?error=google_auth_${errorParam}`, req.url)
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL("/dashboard/settings?error=missing_oauth_params", req.url)
      );
    }

    let stateData: { tenantId: string; staffId: string; returnUrl: string };
    try {
      stateData = JSON.parse(Buffer.from(state, "base64url").toString("utf-8"));
    } catch {
      return NextResponse.redirect(
        new URL("/dashboard/settings?error=invalid_oauth_state", req.url)
      );
    }

    const { tenantId, staffId, returnUrl } = stateData;

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri =
      process.env.GOOGLE_REDIRECT_URI ||
      `${process.env.NEXT_PUBLIC_APP_URL || "https://randevuformu.com"}/api/integrations/google/callback`;

    if (clientId && clientSecret) {
      const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
      const { tokens } = await oauth2Client.getToken(code);

      if (tokens.refresh_token) {
        await supabase
          .from("staff")
          .update({ google_refresh_token: tokens.refresh_token, is_active: true })
          .eq("id", staffId)
          .eq("tenant_id", tenantId);
      }
    }

    return NextResponse.redirect(
      new URL(`${returnUrl || "/dashboard/settings"}?success=google_calendar_connected`, req.url)
    );
  } catch (error: any) {
    console.error("[Google Callback Error]:", error);
    return NextResponse.redirect(
      new URL(`/dashboard/settings?error=${encodeURIComponent(error.message)}`, req.url)
    );
  }
}
