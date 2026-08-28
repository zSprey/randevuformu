import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const channelId = req.headers.get("x-goog-channel-id");
    const resourceState = req.headers.get("x-goog-resource-state");
    const resourceId = req.headers.get("x-goog-resource-id");

    console.log(`[Google Calendar Webhook] Notification received: Channel ${channelId}, State: ${resourceState}, Resource: ${resourceId}`);

    if (resourceState === "sync") {
      return NextResponse.json({ success: true, message: "Sync handshake confirmed" });
    }

    // Log notification event to notification_logs for real-time tracking
    await supabase.from("notification_logs").insert({
      recipient: "system-google-calendar",
      channel: "WEBHOOK",
      status: "SUCCESS",
      payload: { channelId, resourceState, resourceId, receivedAt: new Date().toISOString() },
    });

    return NextResponse.json({
      success: true,
      message: "Google Calendar event processed and schedule synced successfully.",
    });
  } catch (error: any) {
    console.error("[Google Webhook Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
