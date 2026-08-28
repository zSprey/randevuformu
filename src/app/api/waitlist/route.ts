import { NextRequest, NextResponse } from "next/server";
import { waitlistEngine } from "@/lib/engine/waitlistEngine";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tenantId, serviceId, customerName, customerPhone, customerEmail, preferredDate } = body;

    if (!tenantId || !customerName || !customerPhone || !preferredDate) {
      return NextResponse.json(
        { error: "Eksik parametreler (tenantId, customerName, customerPhone, preferredDate zorunludur)" },
        { status: 400 }
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

    return NextResponse.json({
      success: true,
      message: "Yedek listeye başarıyla kaydedildiniz. Slot açıldığında WhatsApp ile bildirim alacaksınız.",
      entry,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Yedek liste kaydı başarısız oldu" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tenantId = searchParams.get("tenantId");
  const date = searchParams.get("date");

  if (!tenantId || !date) {
    return NextResponse.json(
      { error: "tenantId ve date parametreleri zorunludur" },
      { status: 400 }
    );
  }

  const list = waitlistEngine.getWaitlist(tenantId, date);
  return NextResponse.json({ success: true, count: list.length, waitlist: list });
}
