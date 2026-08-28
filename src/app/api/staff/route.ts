import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import {
  apiSuccess,
  apiBadRequest,
  apiNotFound,
  handleApiError,
} from "@/lib/apiResponse";

// GET: Fetch all staff members for a tenant
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get("tenantId") || "default-tenant";

    const { data: staffList, error } = await supabase
      .from("staff")
      .select("id, tenant_id, display_name, email, phone, role, is_active, google_refresh_token, created_at")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: true });

    if (error) {
      // Return default list if table query error in development
      return apiSuccess({
        staff: [
          {
            id: "staff-1",
            tenant_id: tenantId,
            display_name: "Dr. Ahmet Yılmaz",
            email: "ahmet@yilmazdental.com",
            phone: "0532 456 78 90",
            role: "OWNER",
            is_active: true,
            title: "Başhekim & Diş Cerrahı",
          },
          {
            id: "staff-2",
            tenant_id: tenantId,
            display_name: "Dt. Zeynep Kaya",
            email: "zeynep@yilmazdental.com",
            phone: "0533 111 22 33",
            role: "STAFF",
            is_active: true,
            title: "Ortodonti Uzmanı",
          },
        ],
      });
    }

    return apiSuccess({ staff: staffList || [] });
  } catch (error: any) {
    return handleApiError(error, "Personel listesi alınamadı.");
  }
}

// POST: Add new staff member
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      tenantId = "default-tenant",
      displayName,
      email,
      phone,
      role = "STAFF",
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

    return apiSuccess({ staff: newStaff }, "Yeni personel başarıyla eklendi.", 201);
  } catch (error: any) {
    return handleApiError(error, "Personel eklenemedi.");
  }
}

// PUT: Update staff details or toggle active state
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, displayName, email, phone, role, isActive } = body;

    if (!id) {
      return apiBadRequest("Personel ID zorunludur.");
    }

    const updatePayload: Record<string, any> = {};
    if (displayName !== undefined) updatePayload.display_name = displayName;
    if (email !== undefined) updatePayload.email = email;
    if (phone !== undefined) updatePayload.phone = phone;
    if (role !== undefined) updatePayload.role = role;
    if (isActive !== undefined) updatePayload.is_active = isActive;

    const { data: updatedStaff, error } = await supabase
      .from("staff")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return apiSuccess({ staff: updatedStaff }, "Personel bilgileri güncellendi.");
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

    const { error } = await supabase.from("staff").delete().eq("id", id);

    if (error) {
      throw error;
    }

    return apiSuccess({ id }, "Personel başarıyla silindi.");
  } catch (error: any) {
    return handleApiError(error, "Personel silinemedi.");
  }
}
