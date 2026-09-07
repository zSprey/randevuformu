import { NextRequest, NextResponse } from "next/server";
import {
  getAppointmentById,
  verifyAppointmentToken,
  generateAppointmentToken,
  updateAppointmentStatus,
  updateAppointment,
  getStoredAppointments,
} from "@/lib/storage/appointmentsStore";
import { getStoredWaitlist } from "@/lib/storage/waitlistStore";
import {
  apiSuccess,
  apiBadRequest,
  apiNotFound,
  apiUnauthorized,
  handleApiError,
} from "@/lib/apiResponse";

export const dynamic = "force-dynamic";

// GET: Validate token & return appointment details for customer self-service
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const token = searchParams.get("token");
    const tenant = searchParams.get("tenant") || "byerman";

    if (!id || !token) {
      return apiBadRequest("Geçersiz istek: id ve token parametreleri zorunludur.");
    }

    const app = await getAppointmentById(id, tenant);
    if (!app) {
      return apiNotFound("Randevu kaydı bulunamadı veya süresi dolmuş.");
    }

    const isValidToken = verifyAppointmentToken(app, token);
    if (!isValidToken) {
      return apiUnauthorized("Geçersiz veya süresi dolmuş randevu erişim bağlantısı.");
    }

    return apiSuccess({
      appointment: {
        id: app.id,
        customer_name: app.customer_name,
        customer_phone: app.customer_phone,
        appointment_date: app.appointment_date,
        appointment_time: app.appointment_time,
        status: app.status,
        service_name: app.services?.name || app.customer_note || "Hizmet",
        staff_name: app.staff_name || "Uzman Personel",
        tenant: app.tenant || tenant,
      },
      business: {
        slug: app.tenant || tenant,
        name: (app.tenant === "byerman" || !app.tenant) ? "By Erman - Erkek Berberi" : app.tenant.toUpperCase(),
      },
    });
  } catch (error: any) {
    return handleApiError(error, "Randevu bilgileri yüklenirken hata oluştu.");
  }
}

// POST: Self-service Cancel or Reschedule by customer
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { id, token, action, new_date, new_time, reason, tenant = "byerman" } = body;

    if (!id || !token || !action) {
      return apiBadRequest("Eksik parametre: id, token ve action (cancel/reschedule) gereklidir.");
    }

    const app = await getAppointmentById(id, tenant);
    if (!app) {
      return apiNotFound("Randevu bulunamadı.");
    }

    const isValid = verifyAppointmentToken(app, token);
    if (!isValid) {
      return apiUnauthorized("Yetkisiz işlem: Geçersiz erişim anahtarı.");
    }

    if (action === "cancel") {
      // 1. Mark appointment as cancelled
      await updateAppointmentStatus(id, "cancelled", app.tenant || tenant);

      // 2. Check waitlist for candidates waiting on that date
      const targetTenant = app.tenant || tenant;
      const waitlist = await getStoredWaitlist(targetTenant);
      const candidatesOnDate = waitlist.filter(
        (w) =>
          w.status === "WAITING" &&
          (w.preferred_date === app.appointment_date || !w.preferred_date)
      );

      const topCandidate = candidatesOnDate[0] || null;

      return apiSuccess({
        id,
        status: "cancelled",
        cancelledDate: app.appointment_date,
        cancelledTime: app.appointment_time,
        waitlistCandidate: topCandidate
          ? {
              id: topCandidate.id,
              name: topCandidate.customer_name,
              phone: topCandidate.customer_phone,
              time_preference: topCandidate.time_range,
            }
          : null,
      }, "Randevunuz başarıyla iptal edildi. İşletmeye bildirim iletildi.");
    }

    if (action === "reschedule") {
      if (!new_date || !new_time) {
        return apiBadRequest("Erteleme işlemi için yeni tarih ve saat seçilmelidir.");
      }

      await updateAppointment(
        id,
        {
          appointment_date: new_date,
          appointment_time: new_time,
          status: "confirmed",
        },
        app.tenant || tenant
      );

      return apiSuccess({
        id,
        status: "confirmed",
        newDate: new_date,
        newTime: new_time,
      }, "Randevunuz başarıyla yeni tarihe ertelendi.");
    }

    return apiBadRequest("Geçersiz işlem tipi (yalnızca 'cancel' veya 'reschedule').");
  } catch (error: any) {
    return handleApiError(error, "İşlem gerçekleştirilirken hata oluştu.");
  }
}
