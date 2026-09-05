import { NextResponse, NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { calculateAvailableSlots } from "@/lib/engine/slotCalculator";
import { StaffRouter } from "@/lib/engine/staffRouter";
import { slotLockManager } from "@/lib/engine/lockManager";
import {
  getByErmanStaffAsEngineStaff,
  getStaffWorkingHours,
  getStaffById,
  BYERMAN_STAFF_LIST,
} from "@/lib/storage/staffStore";
import { getStoredAppointments } from "@/lib/storage/appointmentsStore";
import { Appointment } from "@/types/schema";
import {
  apiSuccess,
  apiBadRequest,
  apiConflict,
  handleApiError,
} from "@/lib/apiResponse";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug") || searchParams.get("tenant") || "byerman";
    const date = searchParams.get("date") || new Date().toISOString().split("T")[0];
    const duration = parseInt(searchParams.get("duration") || "30", 10);
    const staffId = searchParams.get("staffId") || searchParams.get("staff_id") || undefined;
    const serviceId = searchParams.get("serviceId") || "default-service";
    const maxCapacity = parseInt(searchParams.get("maxCapacity") || "1", 10);

    const isErmanKuafor = slug === "byerman" || slug === "ermankuafor";

    // 1. Fetch business ID
    const { data: business } = await supabase
      .from("businesses")
      .select("id, name")
      .eq("slug", slug)
      .maybeSingle();

    const businessId = business?.id || (isErmanKuafor ? "byerman-id" : "demo-business-id");

    // 2. Fetch existing appointments from dual storage (Edge Config + Supabase)
    const storedApps = await getStoredAppointments(slug);
    
    // Also query Supabase directly for any external entries
    let dbQuery = supabase
      .from("appointments")
      .select("id, appointment_date, appointment_time, status, staff_id")
      .eq("appointment_date", date);

    if (isErmanKuafor) {
      dbQuery = dbQuery.or("business_id.eq.byerman,tenant_id.eq.byerman,tenant.eq.byerman");
    } else {
      dbQuery = dbQuery.eq("business_id", businessId);
    }

    const { data: dbAppointments } = await dbQuery;

    // Merge and deduplicate appointments
    const appointmentMap = new Map<string, any>();

    for (const a of storedApps) {
      if (a.appointment_date === date && a.status !== "cancelled") {
        appointmentMap.set(a.id, a);
      }
    }

    for (const a of dbAppointments || []) {
      if (a.status !== "cancelled" && a.status !== "CANCELLED") {
        if (!appointmentMap.has(a.id)) {
          appointmentMap.set(a.id, a);
        }
      }
    }

    // Convert to Appointment objects suitable for StaffRouter & slot calculator
    const existingBookings: Appointment[] = Array.from(appointmentMap.values()).map((a) => {
      const timeClean = a.appointment_time?.slice(0, 5) || "09:00";
      const startUtc = new Date(`${a.appointment_date}T${timeClean}:00+03:00`).toISOString();
      const endUtc = new Date(new Date(startUtc).getTime() + duration * 60000).toISOString();
      return {
        id: a.id,
        tenantId: slug,
        serviceId: serviceId,
        staffId: a.staff_id || "erman-usta",
        customerId: "cust",
        customerName: a.customer_name || "",
        customerEmail: "",
        customerPhone: a.customer_phone || "",
        startUtc,
        endUtc,
        status: "CONFIRMED",
        paymentStatus: "PAID",
        paymentAmount: 0,
        cancellationToken: "",
        rescheduleToken: "",
        createdAt: a.created_at || new Date().toISOString(),
        updatedAt: a.created_at || new Date().toISOString(),
      };
    });

    const isAnyStaff = !staffId || staffId === "ANY_STAFF";

    // 3. Multi-Staff Resolution: If ANY_STAFF or undefined, use StaffRouter.calculateAggregatedSlots
    if (isAnyStaff && isErmanKuafor) {
      const engineStaff = await getByErmanStaffAsEngineStaff();

      const aggregated = StaffRouter.calculateAggregatedSlots({
        date,
        service: {
          id: serviceId,
          tenantId: businessId,
          name: "Tıraş Hizmeti",
          slug: "tiras",
          durationMinutes: duration,
          bufferTimeBeforeMinutes: isErmanKuafor ? 0 : 5,
          bufferTimeAfterMinutes: isErmanKuafor ? 0 : 5,
          price: 350,
          currency: "TRY",
          requirePrepayment: false,
          maxCapacityPerSlot: maxCapacity,
          assignedStaffIds: [],
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        staffList: engineStaff,
        existingBookings,
        slotIntervalMinutes: 30,
        timezone: "Europe/Istanbul",
        checkLockManager: true,
      });

      return apiSuccess({
        date,
        totalSlots: aggregated.slots.length,
        availableSlotsCount: aggregated.totalAvailableSlots,
        slots: aggregated.slots,
      });
    }

    // 4. Single Staff Slot Calculation (or non-Erman salon)
    const effectiveStaffId = staffId || "erman-usta";
    const staffMeta = getStaffById(effectiveStaffId);
    const staffName = staffMeta?.name || (effectiveStaffId === "erman-usta" ? "Erman Usta" : "Ahmet Kalfa");

    const dateParts = date.split("-").map(Number);
    const targetDateObj = new Date(Date.UTC(dateParts[0], dateParts[1] - 1, dateParts[2], 12, 0, 0));
    const dayOfWeek = targetDateObj.getUTCDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6;

    const staffWeeklyHours = await getStaffWorkingHours(effectiveStaffId, slug);
    const daySchedule = staffWeeklyHours.find((wh) => wh.dayOfWeek === dayOfWeek) || {
      dayOfWeek,
      startTime: "09:00",
      endTime: "20:00",
      breakStartTime: effectiveStaffId === "ahmet-kalfa" ? "14:00" : "13:00",
      breakEndTime: effectiveStaffId === "ahmet-kalfa" ? "15:00" : "14:00",
      isOffDay: false,
    };

    // Filter bookings assigned to this staff member
    const staffBookings = existingBookings
      .filter((b) => b.staffId === effectiveStaffId)
      .map((b) => ({
        startUtc: b.startUtc,
        endUtc: b.endUtc,
        status: b.status,
      }));

    const slots = calculateAvailableSlots({
      date,
      durationMinutes: duration,
      bufferTimeBeforeMinutes: isErmanKuafor ? 0 : 5,
      bufferTimeAfterMinutes: isErmanKuafor ? 0 : 5,
      workingHours: daySchedule,
      existingBookings: staffBookings,
      slotIntervalMinutes: 30,
    });

    // Annotate slots with real-time capacity and lock status
    const annotatedSlots = slots.map((slot) => {
      const lockStatus = slotLockManager.getSlotCapacityStatus(
        businessId,
        slot.startUtc,
        serviceId,
        effectiveStaffId,
        maxCapacity
      );

      const isLocked = lockStatus.isFullyLocked;
      const isAvailable = slot.isAvailable && !isLocked;

      return {
        ...slot,
        isAvailable,
        availableStaffIds: isAvailable ? [effectiveStaffId] : [],
        availableStaffNames: isAvailable ? [staffName] : [],
        availableStaffCount: isAvailable ? 1 : 0,
        remainingCapacity: isLocked ? 0 : lockStatus.remainingCapacity,
        reasonIfNotAvailable: isLocked
          ? "Şu anda başka bir danışan işlem yapıyor (Kilitli)"
          : slot.reasonIfNotAvailable,
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
