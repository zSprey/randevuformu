import { NextResponse, NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { calculateAvailableSlots } from "@/lib/engine/slotCalculator";
import { slotLockManager } from "@/lib/engine/lockManager";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug") || "dr-ahmet";
    const date = searchParams.get("date") || new Date().toISOString().split("T")[0];
    const duration = parseInt(searchParams.get("duration") || "30");

    // 1. Fetch business ID
    const { data: business } = await supabase
      .from("businesses")
      .select("id, name")
      .eq("slug", slug)
      .single();

    const businessId = business?.id || "demo-business-id";

    // 2. Fetch existing appointments for this day
    const { data: dbAppointments } = await supabase
      .from("appointments")
      .select("appointment_date, appointment_time, status")
      .eq("business_id", businessId)
      .eq("appointment_date", date);

    const existingBookings = (dbAppointments || []).map((a: any) => {
      const timeClean = a.appointment_time?.slice(0, 5) || "09:00";
      const startUtc = new Date(`${a.appointment_date}T${timeClean}:00+03:00`).toISOString();
      const endUtc = new Date(new Date(startUtc).getTime() + duration * 60000).toISOString();
      return {
        startUtc,
        endUtc,
        status: a.status || "confirmed",
      };
    });

    // 3. Define standard default working hours (Monday-Saturday: 09:00-18:00, Sunday off)
    const targetDateObj = new Date(`${date}T12:00:00Z`);
    const dayOfWeek = targetDateObj.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6;

    const workingHours = {
      dayOfWeek,
      startTime: "09:00",
      endTime: "18:00",
      breakStartTime: "12:30",
      breakEndTime: "13:30",
      isOffDay: dayOfWeek === 0, // Sunday off
    };

    // 4. Calculate available slots
    const slots = calculateAvailableSlots({
      date,
      durationMinutes: duration,
      bufferTimeBeforeMinutes: 5,
      bufferTimeAfterMinutes: 5,
      workingHours,
      existingBookings,
      slotIntervalMinutes: 30,
    });

    // 5. Annotate slots with active real-time lock status
    const annotatedSlots = slots.map((slot) => {
      const locked = slotLockManager.isLocked(businessId, "service", slot.startUtc);
      if (locked) {
        return {
          ...slot,
          isAvailable: false,
          reasonIfNotAvailable: "Şu anda başka bir kullanıcı işlem yapıyor (Kilitli)",
        };
      }
      return slot;
    });

    return NextResponse.json({
      success: true,
      date,
      totalSlots: annotatedSlots.length,
      availableSlotsCount: annotatedSlots.filter((s) => s.isAvailable).length,
      slots: annotatedSlots,
    });
  } catch (error: any) {
    console.error("[Slots API Error]:", error);
    return NextResponse.json(
      { error: error.message || "Slotlar hesaplanırken bir hata oluştu" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tenantId, serviceId, startUtc, sessionId } = body;

    if (!tenantId || !startUtc || !sessionId) {
      return NextResponse.json(
        { error: "Eksik parametreler (tenantId, startUtc, sessionId gereklidir)" },
        { status: 400 }
      );
    }

    const lockResult = slotLockManager.acquireLock(
      tenantId,
      serviceId || "default-service",
      startUtc,
      sessionId
    );

    if (!lockResult.success) {
      return NextResponse.json(lockResult, { status: 409 });
    }

    return NextResponse.json(lockResult, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Kilit işlemi başarısız oldu" },
      { status: 500 }
    );
  }
}
