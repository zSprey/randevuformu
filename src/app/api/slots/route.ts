import { NextResponse, NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { calculateAvailableSlots } from "@/lib/engine/slotCalculator";
import { slotLockManager } from "@/lib/engine/lockManager";
import {
  apiSuccess,
  apiBadRequest,
  apiConflict,
  handleApiError,
} from "@/lib/apiResponse";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug") || "dr-ahmet";
    const date = searchParams.get("date") || new Date().toISOString().split("T")[0];
    const duration = parseInt(searchParams.get("duration") || "30", 10);
    const staffId = searchParams.get("staffId") || undefined;
    const serviceId = searchParams.get("serviceId") || "default-service";
    const maxCapacity = parseInt(searchParams.get("maxCapacity") || "1", 10);

    // 1. Fetch business ID
    const { data: business } = await supabase
      .from("businesses")
      .select("id, name")
      .eq("slug", slug)
      .single();

    const businessId = business?.id || "demo-business-id";

    // 2. Fetch existing appointments for this day
    let query = supabase
      .from("appointments")
      .select("appointment_date, appointment_time, status, staff_id")
      .eq("business_id", businessId)
      .eq("appointment_date", date);

    if (staffId && staffId !== "ANY_STAFF") {
      query = query.eq("staff_id", staffId);
    }

    const { data: dbAppointments } = await query;

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

    // 3. Define standard working hours (Erman Kuaför: 09:00-20:00 every 30 mins)
    const dateParts = date.split("-").map(Number);
    const targetDateObj = new Date(Date.UTC(dateParts[0], dateParts[1] - 1, dateParts[2], 12, 0, 0));
    const dayOfWeek = targetDateObj.getUTCDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6;

    const isErmanKuafor = slug === "byerman" || slug === "ermankuafor";

    const workingHours = {
      dayOfWeek,
      startTime: "09:00",
      endTime: isErmanKuafor ? "20:00" : "18:00",
      breakStartTime: isErmanKuafor ? undefined : "12:30",
      breakEndTime: isErmanKuafor ? undefined : "13:30",
      isOffDay: isErmanKuafor ? false : dayOfWeek === 0, // Erman Kuaför open every day
    };

    // 4. Calculate available slots
    const slots = calculateAvailableSlots({
      date,
      durationMinutes: duration,
      bufferTimeBeforeMinutes: isErmanKuafor ? 0 : 5,
      bufferTimeAfterMinutes: isErmanKuafor ? 0 : 5,
      workingHours,
      existingBookings,
      slotIntervalMinutes: 30,
    });

    // 5. Annotate slots with real-time capacity and lock status
    const annotatedSlots = slots.map((slot) => {
      const lockStatus = slotLockManager.getSlotCapacityStatus(
        businessId,
        slot.startUtc,
        serviceId,
        staffId || "any",
        maxCapacity
      );

      if (lockStatus.isFullyLocked) {
        return {
          ...slot,
          isAvailable: false,
          remainingCapacity: 0,
          reasonIfNotAvailable: "Şu anda başka bir danışan işlem yapıyor (Kilitli)",
        };
      }

      return {
        ...slot,
        remainingCapacity: lockStatus.remainingCapacity,
      };
    });

    return apiSuccess({
      date,
      totalSlots: annotatedSlots.length,
      availableSlotsCount: annotatedSlots.filter((s) => s.isAvailable).length,
      slots: annotatedSlots,
    });
  } catch (error: any) {
    return handleApiError(error, "Slotlar hesaplanırken bir hata oluştu.");
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tenantId, serviceId = "default-service", staffId = "any", startUtc, sessionId, maxCapacity = 1 } = body;

    if (!tenantId || !startUtc || !sessionId) {
      return apiBadRequest("Eksik parametreler (tenantId, startUtc, sessionId zorunludur).");
    }

    const lockResult = slotLockManager.acquireLock({
      tenantId,
      serviceId,
      staffId,
      startUtc,
      sessionId,
      maxCapacity,
    });

    if (!lockResult.success) {
      return apiConflict(lockResult.message, {
        code: lockResult.code,
        remainingCapacity: lockResult.remainingCapacity,
      });
    }

    return apiSuccess(lockResult, lockResult.message);
  } catch (error: any) {
    return handleApiError(error, "Kilit işlemi başarısız oldu.");
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { tenantId, serviceId = "all", staffId = "any", startUtc, sessionId } = body;

    if (!tenantId || !startUtc || !sessionId) {
      return apiBadRequest("Eksik parametreler (tenantId, startUtc, sessionId zorunludur).");
    }

    const released = slotLockManager.releaseLock(tenantId, serviceId, startUtc, sessionId, staffId);

    return apiSuccess(
      { released },
      released ? "Kilit başarıyla kaldırıldı." : "Kaldırılacak aktif kilit bulunamadı."
    );
  } catch (error: any) {
    return handleApiError(error, "Kilit kaldırma işlemi başarısız oldu.");
  }
}
