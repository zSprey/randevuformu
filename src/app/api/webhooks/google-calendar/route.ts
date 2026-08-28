import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import {
  apiSuccess,
  handleApiError,
} from "@/lib/apiResponse";

export async function POST(req: NextRequest) {
  try {
    const channelId = req.headers.get("x-goog-channel-id");
    const resourceState = req.headers.get("x-goog-resource-state");
    const resourceId = req.headers.get("x-goog-resource-id");

    console.log(
      `[Google Calendar Webhook] Notification received: Channel ${channelId}, State: ${resourceState}, Resource: ${resourceId}`
    );

    if (resourceState === "sync") {
      return apiSuccess({ received: true }, "Google Takvim senkronizasyon bağlantısı onaylandı.");
    }

    // Log notification event to notification_logs for real-time tracking
    await supabase.from("notification_logs").insert({
      recipient: "system-google-calendar",
      channel: "WEBHOOK",
      status: "SUCCESS",
      payload: { channelId, resourceState, resourceId, receivedAt: new Date().toISOString() },
    });

    return apiSuccess(
      { channelId, resourceId },
      "Google Calendar etkinliği işlendi ve takvim eşitlendi."
    );
  } catch (error: any) {
    return handleApiError(error, "Google Calendar webhook işlenemedi.");
  }
}
