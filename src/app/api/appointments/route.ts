import { NextRequest, NextResponse } from "next/server";
import {
  getStoredAppointments,
  saveNewAppointment,
  updateAppointmentStatus,
  updateAppointment,
  deleteAppointment,
  StoredAppointment,
} from "@/lib/storage/appointmentsStore";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tenant =
      searchParams.get("tenant") ||
      searchParams.get("businessId") ||
      req.cookies.get("rf_tenant")?.value ||
      "";
    const staffId = searchParams.get("staff_id") || searchParams.get("staffId");
    const date = searchParams.get("date");

    let appointments = await getStoredAppointments(tenant);

    if (staffId && staffId !== "ANY_STAFF") {
      appointments = appointments.filter((a) => a.staff_id === staffId);
    }

    if (date) {
      appointments = appointments.filter((a) => a.appointment_date === date);
    }

    return NextResponse.json({ success: true, appointments });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message, appointments: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      customer_name,
      customer_phone,
      customer_note,
      appointment_date,
      appointment_time,
      service_name,
      tenant,
      tenant_id,
      business_id,
      staff_id,
      staff_name,
      staffId,
      staffName,
    } = body;

    if (!customer_name || !customer_phone) {
      return NextResponse.json({ success: false, error: "Müşteri adı ve telefon zorunludur." }, { status: 400 });
    }

    const assignedTenant = (tenant || tenant_id || business_id || "byerman").toLowerCase();
    const resolvedStaffId = staff_id || staffId || undefined;
    let resolvedStaffName = staff_name || staffName || undefined;

    if (resolvedStaffId && !resolvedStaffName) {
      if (resolvedStaffId === "erman-usta") resolvedStaffName = "Erman Usta";
      else if (resolvedStaffId === "ahmet-kalfa") resolvedStaffName = "Ahmet Kalfa";
      else if (resolvedStaffId === "ANY_STAFF") resolvedStaffName = "Fark Etmez / İlk Müsait Usta";
    }

    const newApp: StoredAppointment = {
      id: `app_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      tenant: assignedTenant,
      tenant_id: assignedTenant,
      business_id: assignedTenant,
      customer_name: customer_name.trim(),
      customer_phone: customer_phone.trim(),
      customer_note: customer_note || service_name || "Genel Randevu",
      appointment_date: appointment_date || new Date().toISOString().split("T")[0],
      appointment_time: appointment_time ? (appointment_time.length === 5 ? `${appointment_time}:00` : appointment_time) : "14:00:00",
      status: "confirmed",
      services: { name: service_name || customer_note || "Genel Randevu" },
      staff_id: resolvedStaffId,
      staff_name: resolvedStaffName,
      created_at: new Date().toISOString(),
    };

    await saveNewAppointment(newApp);

    return NextResponse.json({ success: true, appointment: newApp }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, tenant, staff_id, staff_name, staffId, staffName } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "ID parametresi zorunludur." }, { status: 400 });
    }

    const updates: Partial<StoredAppointment> = {};
    if (status) updates.status = status;
    if (staff_id || staffId) updates.staff_id = staff_id || staffId;
    if (staff_name || staffName) updates.staff_name = staff_name || staffName;

    if (status && Object.keys(updates).length === 1) {
      await updateAppointmentStatus(id, status, tenant);
    } else {
      await updateAppointment(id, updates, tenant);
    }

    return NextResponse.json({ success: true, updates });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const tenant = searchParams.get("tenant") || req.cookies.get("rf_tenant")?.value || "";

    if (!id) {
      return NextResponse.json({ success: false, error: "ID parametresi zorunludur." }, { status: 400 });
    }

    await deleteAppointment(id, tenant);
    return NextResponse.json({ success: true, message: "Randevu başarıyla silindi." });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
