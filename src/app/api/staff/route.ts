import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import {
  getStaffWorkingHours,
  saveStaffWorkingHours,
  BYERMAN_STAFF_LIST,
  getDefaultStaffWorkingHours,
  markStaffDeleted,
  isStaffDeleted,
  getAvailableStaff,
} from "@/lib/storage/staffStore";
import { StaffWorkingHours } from "@/types/schema";
import {
  apiSuccess,
  apiBadRequest,
  apiNotFound,
  handleApiError,
} from "@/lib/apiResponse";

export const dynamic = "force-dynamic";

// GET: Fetch all staff members for a tenant with their working hours and break schedules
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get("tenantId") || searchParams.get("tenant") || "byerman";
    const staffId = searchParams.get("staffId") || searchParams.get("id");

    const isByErman = tenantId === "byerman" || tenantId === "byerman-id";

    // 1. If specific staffId requested
    if (staffId) {
      if (isStaffDeleted(staffId)) {
        return apiNotFound("Personel bulunamadı veya silinmiş.");
      }

      const { data: singleStaff } = await supabase
        .from("staff")
        .select("id, tenant_id, display_name, email, phone, role, is_active, google_refresh_token, created_at")
        .eq("id", staffId)
        .maybeSingle();

      const hours = await getStaffWorkingHours(staffId, tenantId);

      if (singleStaff) {
        return apiSuccess({
          staff: {
            ...singleStaff,
            workingHours: hours,
          },
        });
      }

      // Check By Erman static staff
      const staticBarber = BYERMAN_STAFF_LIST.find((s) => s.id === staffId);
      if (staticBarber) {
        return apiSuccess({
          staff: {
            id: staticBarber.id,
            tenant_id: tenantId,
            display_name: staticBarber.name,
            role: staticBarber.role,
            is_active: true,
            workingHours: hours,
          },
        });
      }

      return apiNotFound("Personel bulunamadı.");
    }

    // 2. Fetch all staff for tenant
    const { data: staffList, error } = await supabase
      .from("staff")
      .select("id, tenant_id, display_name, email, phone, role, is_active, google_refresh_token, created_at")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: true });

    let finalStaff: any[] = (staffList || []).filter((s) => !isStaffDeleted(s.id));

    // If By Erman and DB has no records, fallback to official By Erman specialists (excluding any deleted ones)
    if (isByErman && (!finalStaff || finalStaff.length === 0)) {
      finalStaff = getAvailableStaff(tenantId).filter((s) => s.id !== "ANY_STAFF").map((s) => ({
        id: s.id,
        tenant_id: "byerman",
        display_name: s.name,
        email: `${s.id}@byerman.com`,
        phone: "+905384809001",
        role: s.role,
        is_active: true,
        created_at: new Date().toISOString(),
      }));
    }

    // Attach working hours & breaks to each specialist
    const enriched = await Promise.all(
      finalStaff.map(async (s) => {
        const hours = await getStaffWorkingHours(s.id, tenantId);
        return {
          ...s,
          workingHours: hours,
        };
      })
    );

    return apiSuccess({ staff: enriched });
  } catch (error: any) {
    return handleApiError(error, "Personel listesi alınamadı.");
  }
}

// POST: Add new staff member with optional working hours
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      tenantId = "byerman",
      displayName,
      email,
      phone,
      role = "STAFF",
      workingHours,
      working_hours,
    } = body;

    if (!displayName) {
      return apiBadRequest("Personel ismi zorunludur.");
    }

    const { data: newStaff, error } = await supabase
      .from("staff")
      .insert({
        tenant_id: tenantId,
        display_name: displayName,
        email: email || null,
        phone: phone || null,
        role,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    const effectiveHours: StaffWorkingHours[] =
      workingHours || working_hours || getDefaultStaffWorkingHours(newStaff.id);

    await saveStaffWorkingHours(newStaff.id, effectiveHours, tenantId);

    return apiSuccess(
      {
        staff: {
          ...newStaff,
          workingHours: effectiveHours,
        },
      },
      "Yeni personel başarıyla eklendi.",
      201
    );
  } catch (error: any) {
    return handleApiError(error, "Personel eklenemedi.");
  }
}

// PUT: Update staff details, active state, or weekly working hours & breaks
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id,
      displayName,
      email,
      phone,
      role,
      isActive,
      workingHours,
      working_hours,
      tenantId = "byerman",
    } = body;

    if (!id) {
      return apiBadRequest("Personel ID zorunludur.");
    }

    const updatePayload: Record<string, any> = {};
    if (displayName !== undefined) updatePayload.display_name = displayName;
    if (email !== undefined) updatePayload.email = email;
    if (phone !== undefined) updatePayload.phone = phone;
    if (role !== undefined) updatePayload.role = role;
    if (isActive !== undefined) updatePayload.is_active = isActive;

    let updatedStaff = null;
    if (Object.keys(updatePayload).length > 0) {
      const { data, error } = await supabase
        .from("staff")
        .update(updatePayload)
        .eq("id", id)
        .select()
        .maybeSingle();

      if (error) {
        console.warn("[StaffRoute PUT] Supabase staff update error:", error);
      }
      updatedStaff = data;
    }

    const hoursToSave: StaffWorkingHours[] | undefined = workingHours || working_hours;
    if (hoursToSave && Array.isArray(hoursToSave)) {
      await saveStaffWorkingHours(id, hoursToSave, tenantId);
    }

    const currentHours = await getStaffWorkingHours(id, tenantId);

    return apiSuccess(
      {
        staff: {
          ...(updatedStaff || { id, display_name: displayName, is_active: isActive }),
          workingHours: currentHours,
        },
      },
      "Personel bilgileri ve çalışma saatleri başarıyla güncellendi."
    );
  } catch (error: any) {
    return handleApiError(error, "Personel güncellenemedi.");
  }
}

// DELETE: Remove staff member
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return apiBadRequest("id parametresi zorunludur.");
    }

    // Mark as deleted in runtime store so it never reappears in bookings or lists
    markStaffDeleted(id);

    // Also delete working hours
    try {
      await supabase.from("staff_working_hours").delete().eq("staff_id", id);
    } catch {
      // Ignore
    }

    try {
      await supabase.from("staff").delete().eq("id", id);
    } catch {
      // Ignore
    }

    return apiSuccess({ id }, "Personel başarıyla silindi.");
  } catch (error: any) {
    return handleApiError(error, "Personel silinemedi.");
  }
}
