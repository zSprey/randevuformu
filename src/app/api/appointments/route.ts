import { NextRequest, NextResponse } from "next/server";
import {
  getStoredAppointments,
  saveNewAppointment,
  updateAppointmentStatus,
  deleteAppointment,
  StoredAppointment,
} from "@/lib/storage/appointmentsStore";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const appointments = await getStoredAppointments();
    return NextResponse.json({ success: true, appointments });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message, appointments: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customer_name, customer_phone, customer_note, appointment_date, appointment_time, service_name } = body;

    if (!customer_name || !customer_phone) {
      return NextResponse.json({ success: false, error: "Müşteri adı ve telefon zorunludur." }, { status: 400 });
    }

    const newApp: StoredAppointment = {
      id: `app_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      customer_name: customer_name.trim(),
      customer_phone: customer_phone.trim(),
      customer_note: customer_note || service_name || "Saç Kesimi & Yıkama",
      appointment_date: appointment_date || new Date().toISOString().split("T")[0],
      appointment_time: appointment_time ? (appointment_time.length === 5 ? `${appointment_time}:00` : appointment_time) : "14:00:00",
      status: "confirmed",
      services: { name: service_name || customer_note || "Saç Kesimi & Yıkama" },
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
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ success: false, error: "ID ve status zorunludur." }, { status: 400 });
    }

    await updateAppointmentStatus(id, status);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "ID parametresi zorunludur." }, { status: 400 });
    }

    await deleteAppointment(id);
    return NextResponse.json({ success: true, message: "Randevu başarıyla silindi." });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
