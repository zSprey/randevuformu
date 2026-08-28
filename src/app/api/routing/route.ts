import { NextRequest, NextResponse } from "next/server";
import { StaffRouter, RoutingStrategy, StaffRoutingError } from "@/lib/engine/staffRouter";
import { supabase } from "@/lib/supabase";
import {
  apiSuccess,
  apiBadRequest,
  apiConflict,
  apiNotFound,
  handleApiError,
} from "@/lib/apiResponse";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      tenantId,
      serviceId,
      date,
      startUtc,
      strategy = "ROUND_ROBIN",
    } = body;

    if (!tenantId || !serviceId) {
      return apiBadRequest("tenantId ve serviceId zorunludur.");
    }

    // 1. Fetch active staff for tenant
    const { data: dbStaff } = await supabase
      .from("staff")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("is_active", true);

    const staffList = (dbStaff || []).map((s: any) => ({
      id: s.id,
      tenantId: s.tenant_id,
      name: s.display_name || s.name || "Uzman",
      role: s.role || "STAFF",
      isActive: s.is_active !== false,
      workingHours: s.working_hours || undefined,
    }));

    if (staffList.length === 0) {
      // Default fallback specialist for new tenants
      const defaultSpecialist = {
        id: "default-staff",
        tenantId,
        name: "Baş Hekim / Baş Uzman",
        role: "STAFF",
        isActive: true,
      };

      return apiSuccess({
        assignedStaff: defaultSpecialist,
        strategyUsed: strategy,
        reason: "İşletme için kayıtlı özel personel bulunmadığından varsayılan yetkili atandı.",
        availableStaffCount: 1,
      });
    }

    // 2. Fetch existing appointments
    const { data: dbAppointments } = await supabase
      .from("appointments")
      .select("id, staff_id, start_utc, end_utc, status")
      .eq("tenant_id", tenantId);

    const appointments = (dbAppointments || []).map((a: any) => ({
      id: a.id,
      tenantId,
      staffId: a.staff_id,
      startUtc: a.start_utc,
      endUtc: a.end_utc,
      status: a.status || "CONFIRMED",
    }));

    let result;
    if (strategy === "LEAST_BUSY" && date) {
      result = StaffRouter.routeLeastBusy(staffList as any, appointments as any, date);
    } else if (strategy === "AVAILABILITY_FIRST" && startUtc && date) {
      const mockService = {
        id: serviceId,
        tenantId,
        name: "Hizmet",
        durationMinutes: 30,
        bufferTimeBeforeMinutes: 5,
        bufferTimeAfterMinutes: 5,
        price: 0,
        currency: "TRY",
        requirePrepayment: false,
        maxCapacityPerSlot: 1,
        assignedStaffIds: [],
        isActive: true,
      };

      result = StaffRouter.routeAvailabilityFirst(
        staffList as any,
        mockService as any,
        startUtc,
        appointments as any,
        date
      );
    } else if (strategy === "PRIORITY" && date) {
      result = StaffRouter.routePriority(staffList as any, appointments as any, date);
    } else {
      result = StaffRouter.routeRoundRobin(staffList as any, serviceId, tenantId);
    }

    return apiSuccess({
      assignedStaff: result.assignedStaff,
      strategyUsed: result.strategyUsed,
      reason: result.reason,
      availableStaffCount: result.availableStaffCount,
      totalStaffEvaluated: result.totalStaffEvaluated,
    });
  } catch (error: any) {
    if (error instanceof StaffRoutingError) {
      if (error.code === "NO_ELIGIBLE_STAFF" || error.code === "NO_STAFF_AVAILABLE") {
        return apiNotFound(error.message, { code: error.code });
      }
      if (error.code === "SCHEDULE_CONFLICT") {
        return apiConflict(error.message, { code: error.code });
      }
      return apiBadRequest(error.message, { code: error.code });
    }

    return handleApiError(error, "Personel yönlendirme işlemi sırasında bir hata oluştu.");
  }
}
