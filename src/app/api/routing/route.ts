import { NextRequest, NextResponse } from "next/server";
import { StaffRouter, RoutingStrategy } from "@/lib/engine/staffRouter";
import { supabase } from "@/lib/supabase";

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
      return NextResponse.json(
        { error: "tenantId ve serviceId zorunludur" },
        { status: 400 }
      );
    }

    // Fetch staff for tenant
    const { data: dbStaff } = await supabase
      .from("staff")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("is_active", true);

    const staffList = (dbStaff || []).map((s: any) => ({
      id: s.id,
      tenantId: s.tenant_id,
      name: s.display_name,
      role: s.role || "STAFF",
      isActive: s.is_active,
    }));

    if (staffList.length === 0) {
      return NextResponse.json({
        success: true,
        assignedStaff: {
          id: "default-staff",
          tenantId,
          name: "Baş Hekim / Baş Uzman",
          role: "STAFF",
          isActive: true,
        },
        strategyUsed: strategy,
        reason: "Varsayılan işletme yetkilisi atandı.",
      });
    }

    // Fetch existing appointments
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
      status: a.status,
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
        bufferTimeBeforeMinutes: 0,
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
    } else {
      result = StaffRouter.routeRoundRobin(staffList as any, serviceId, tenantId);
    }

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Personel yönlendirme hatası" },
      { status: 500 }
    );
  }
}
