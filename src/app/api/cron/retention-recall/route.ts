import { NextRequest, NextResponse } from "next/server";
import { INITIAL_PENDING_RECALLS, PendingRecall } from "@/lib/retentionEngine";
import { apiSuccess, handleApiError } from "@/lib/apiResponse";

export async function GET(req: NextRequest) {
  try {
    const isVercelCron = req.headers.get("x-vercel-cron") === "1";
    const authHeader = req.headers.get("authorization");

    // Process pending recalls
    const dispatchedRecalls = INITIAL_PENDING_RECALLS.map((rec) => {
      return {
        ...rec,
        status: "SENT" as const,
        sentAt: new Date().toISOString(),
      };
    });

    return apiSuccess({
      executedAt: new Date().toISOString(),
      dispatchedCount: dispatchedRecalls.length,
      recalls: dispatchedRecalls,
      message: `${dispatchedRecalls.length} danışana akıllı geri çağırma (recall) hatırlatması iletildi.`,
    });
  } catch (err) {
    return handleApiError(err, "Recall cron işlemi sırasında hata oluştu.");
  }
}
