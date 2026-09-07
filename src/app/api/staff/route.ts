import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import {
  getStaffWorkingHours,
  saveStaffWorkingHours,
  getDefaultStaffWorkingHours,
  markStaffDeleted,
  isStaffDeleted,
  getStoredStaff,
  addStoredStaff,
  updateStoredStaff,
  deleteStoredStaff,
  normalizeTenant,
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
    const rawTenant = searchParams.get("tenantId") || searchParams.get("tenant") || searchParams.get("slug") || "byerman";
    const tenantId = normalizeTenant(rawTenant);
    const staffId = searchParams.get("staffId") || searchParams.get("id");

    // 1. If specific staffId requested
    if (staffId) {
      if (isStaffDeleted(staffId, tenantId)) {
        return apiNotFound("Personel bulunamadı veya silinmiş.");
      }

      const allStaff = await getStoredStaff(tenantId, true);
      const found = allStaff.find((s) => s.id === staffId);

      if (!found) {
        return apiNotFound("Personel bulunamadı.");
      }

      const hours = await getStaffWorkingHours(staffId, tenantId);
      const result = {
        ...found,
        display_name: found.display_name || found.name,
        workingHours: hours,
      };

      return NextResponse.json({
        success: true,
        data: { staff: result },
        staff: result,
      });
    }

    // 2. Fetch all active staff for tenant from persistent store
    const storedStaff = await getStoredStaff(tenantId, true);

    // Attach working hours & breaks to each specialist
    const enriched = await Promise.all(
      storedStaff.map(async (s) => {
        const hours = await getStaffWorkingHours(s.id, tenantId);
        return {
          ...s,
          display_name: s.display_name || s.name,
          role: s.role || "STAFF",
          title: s.title || s.role || "Uzman",
          workingHours: hours,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: { staff: enriched },
      staff: enriched,
    });
  } catch (error: any) {
    return handleApiError(error, "Personel listesi alınamadı.");
  }
}

// POST: Add new staff member with optional working hours
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      tenantId: rawTenant = "byerman",
      displayName,
      name,
      email,
      phone,
      role = "STAFF",
      title,
      workingHours,
      working_hours,
    } = body;

    const tenantId = normalizeTenant(rawTenant);
    const finalName = displayName || name;

    if (!finalName) {
      return apiBadRequest("Personel ismi zorunludur.");
    }

    // Save to persistent storage
    const newStaff = await addStoredStaff(tenantId, {
      name: finalName.trim(),
      display_name: finalName.trim(),
      email: email?.trim() || undefined,
      phone: phone?.trim() || undefined,
      role,
      title: title?.trim() || (role === "OWNER" ? "İşletme Sahibi" : "Uzman / Personel"),
    });

    const effectiveHours: StaffWorkingHours[] =
      workingHours || working_hours || getDefaultStaffWorkingHours(newStaff.id);

    await saveStaffWorkingHours(newStaff.id, effectiveHours, tenantId);

    // Optional Supabase write
    try {
      await supabase.from("staff").insert({
        id: newStaff.id,
        tenant_id: tenantId,
        display_name: newStaff.display_name,
        email: newStaff.email || null,
        phone: newStaff.phone || null,
        role: newStaff.role,
        is_active: true,
      });
    } catch {
      // Non-blocking
    }

    const payload = {
      ...newStaff,
      workingHours: effectiveHours,
    };

    return NextResponse.json(
      {
        success: true,
        data: { staff: payload },
        staff: payload,
        message: "Yeni personel başarıyla eklendi.",
      },
      { status: 201 }
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
      name,
      email,
      phone,
      role,
      title,
      isActive,
      workingHours,
      working_hours,
      tenantId: rawTenant = "byerman",
    } = body;

    if (!id) {
      return apiBadRequest("Personel ID zorunludur.");
    }

    const tenantId = normalizeTenant(rawTenant);

    const updatePayload: Record<string, any> = {};
    if (displayName !== undefined || name !== undefined) {
      updatePayload.display_name = displayName || name;
      updatePayload.name = displayName || name;
    }
    if (email !== undefined) updatePayload.email = email;
    if (phone !== undefined) updatePayload.phone = phone;
    if (role !== undefined) updatePayload.role = role;
    if (title !== undefined) updatePayload.title = title;
    if (isActive !== undefined) updatePayload.is_active = isActive;

    const updated = await updateStoredStaff(tenantId, id, updatePayload);

    const hoursToSave: StaffWorkingHours[] | undefined = workingHours || working_hours;
    if (hoursToSave && Array.isArray(hoursToSave)) {
      await saveStaffWorkingHours(id, hoursToSave, tenantId);
    }

    const currentHours = await getStaffWorkingHours(id, tenantId);

    const result = {
      ...(updated || { id, display_name: displayName || name, is_active: isActive }),
      workingHours: currentHours,
    };

    return NextResponse.json({
      success: true,
      data: { staff: result },
      staff: result,
      message: "Personel bilgileri ve çalışma saatleri başarıyla güncellendi.",
    });
  } catch (error: any) {
    return handleApiError(error, "Personel güncellenemedi.");
  }
}

// DELETE: Remove staff member
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const rawTenant = searchParams.get("tenantId") || searchParams.get("tenant") || "byerman";
    const tenantId = normalizeTenant(rawTenant);

    if (!id) {
      return apiBadRequest("id parametresi zorunludur.");
    }

    // Permanently remove and record in deleted_staff_ids
    await deleteStoredStaff(tenantId, id);

    // Also delete from Supabase if table exists
    try {
      await supabase.from("staff_working_hours").delete().eq("staff_id", id);
      await supabase.from("staff").delete().eq("id", id);
    } catch {
      // Non-blocking
    }

    return NextResponse.json({
      success: true,
      data: { id },
      id,
      message: "Personel başarıyla silindi.",
    });
  } catch (error: any) {
    return handleApiError(error, "Personel silinemedi.");
  }
}

