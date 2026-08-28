import { NextRequest, NextResponse } from "next/server";
import { waitlistEngine } from "@/lib/engine/waitlistEngine";
import {
  apiSuccess,
  apiBadRequest,
  handleApiError,
} from "@/lib/apiResponse";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tenantId, serviceId, customerName, customerPhone, customerEmail, preferredDate } = body;

    if (!tenantId || !customerName || !customerPhone || !preferredDate) {
      return apiBadRequest(
        "Eksik parametreler (tenantId, customerName, customerPhone, preferredDate zorunludur)."
      );
    }

    const entry = waitlistEngine.joinWaitlist({
      tenantId,
      serviceId: serviceId || "default-service",
      customerName,
      customerPhone,
      customerEmail: customerEmail || "",
      preferredDate,
      priorityScore: 85,
    });

    return apiSuccess(
      { entry },
      "Yedek listeye başarıyla kaydedildiniz. Slot açıldığında WhatsApp/SMS ile bildirim alacaksınız.",
      201
    );
  } catch (error: any) {
    return handleApiError(error, "Yedek liste kaydı başarısız oldu.");
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get("tenantId");
    const date = searchParams.get("date");

    if (!tenantId || !date) {
      return apiBadRequest("tenantId ve date parametreleri zorunludur.");
    }

    const list = waitlistEngine.getWaitlist(tenantId, date);
    return apiSuccess({ count: list.length, waitlist: list });
  } catch (error: any) {
    return handleApiError(error, "Yedek liste getirilemedi.");
  }
}
