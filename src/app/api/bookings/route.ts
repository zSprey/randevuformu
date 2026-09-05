import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import nodemailer from "nodemailer";
import crypto from "crypto";
import { slotLockManager } from "@/lib/engine/lockManager";
import { MeetingGenerator } from "@/lib/integrations/meetingGenerator";
import { sendDualBarberBookingSms } from "@/lib/sms/smsService";
import { getStoredAppointments, saveNewAppointment } from "@/lib/storage/appointmentsStore";
import {
  apiSuccess,
  apiBadRequest,
  apiNotFound,
  apiConflict,
  handleApiError,
} from "@/lib/apiResponse";

// SMTP Transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587", 10),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER || "randevuformuu@gmail.com",
    pass: process.env.SMTP_PASS || "",
  },
});

// GET: Fetch bookings for a specific event or tenant
export async function GET(request: Request) {
  try {
    const bookings = await getStoredAppointments();
    return apiSuccess({ bookings: bookings || [] });
  } catch (error: any) {
    return handleApiError(error, "Randevular getirilirken bir hata oluştu.");
  }
}

// POST: Create booking with Conflict Resolution, Capacity Locking, Meeting Generator, and Email Confirmation
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      event_id,
      service_id,
      tenant_id,
      user_name,
      user_email,
      user_phone,
      staff_id,
      start_time,
      end_time,
      is_online = false,
      meeting_platform = "GOOGLE_MEET",
      session_id,
      notes,
    } = body;

    const targetEventId = event_id || service_id;
    const targetTenantId = tenant_id || "default-tenant";

    const cleanPhone = (user_phone || "").replace(/\D/g, "");
    const effectiveEmail = user_email?.trim() || (cleanPhone ? `${cleanPhone}@musteri.randevuformu.com` : "musteri@randevuformu.com");

    // 1. Validate mandatory fields (name, service, start_time, and either phone or email)
    if (!targetEventId || !user_name || (!user_email && !user_phone) || !start_time) {
      return apiBadRequest("Eksik bilgi: Hizmet, isim, telefon/e-posta ve başlangıç saati zorunludur.");
    }

    const startTime = new Date(start_time);
    let endTime = end_time ? new Date(end_time) : new Date(startTime.getTime() + 30 * 60000);

    if (isNaN(startTime.getTime())) {
      return apiBadRequest("Geçersiz başlangıç zamanı formatı.");
    }

    if (startTime >= endTime) {
      endTime = new Date(startTime.getTime() + 30 * 60000);
    }

    // 2. Fetch event or service metadata
    const { data: event } = await supabase
      .from("events")
      .select("*")
      .eq("id", targetEventId)
      .maybeSingle();

    const eventTitle = event?.title || "Randevu";
    const capacity = event?.capacity || 1;

    // 3. Conflict Resolution Check (Database Overlap)
    let currentOverlaps = 0;
    try {
      // Check appointments table
      const { data: overlappingApps } = await supabase
        .from("appointments")
        .select("id, start_utc, end_utc, status")
        .neq("status", "CANCELLED")
        .lt("start_utc", endTime.toISOString())
        .gt("end_utc", startTime.toISOString());

      if (overlappingApps && overlappingApps.length > 0) {
        currentOverlaps = overlappingApps.length;
      } else {
        // Check bookings table as fallback
        const { data: overlappingBookings } = await supabase
          .from("bookings")
          .select("id, start_time, end_time, status")
          .eq("event_id", targetEventId)
          .neq("status", "CANCELLED")
          .lt("start_time", endTime.toISOString())
          .gt("end_time", startTime.toISOString());

        if (overlappingBookings) {
          currentOverlaps = overlappingBookings.length;
        }
      }
    } catch {
      currentOverlaps = 0;
    }

    if (currentOverlaps >= capacity) {
      return apiConflict(
        capacity > 1
          ? `Bu saat diliminin maksimum kontenjanı (${capacity} kişi) dolmuştur.`
          : "Seçilen zaman dilimi tamamen dolu. Lütfen farklı bir saat seçiniz."
      );
    }

    // 4. Duplicate client booking check on exact slot
    try {
      const { data: userOverlaps } = await supabase
        .from("appointments")
        .select("id")
        .or(`customer_email.eq.${effectiveEmail}${cleanPhone ? `,customer_phone.eq.${cleanPhone}` : ""}`)
        .neq("status", "CANCELLED")
        .lt("start_utc", endTime.toISOString())
        .gt("end_utc", startTime.toISOString());

      if (userOverlaps && userOverlaps.length > 0) {
        return apiConflict("Bu zaman diliminde zaten başka bir aktif randevunuz bulunmaktadır.");
      }
    } catch {
      // Graceful pass
    }

    // 5. Generate unique booking tokens & Meeting details
    const bookingUniqueId = `bk_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
    const cancellationToken = crypto.randomBytes(16).toString("hex");

    const meetingDetails = MeetingGenerator.createMeeting({
      isOnline: Boolean(is_online),
      platform: meeting_platform,
      bookingId: bookingUniqueId,
      businessName: eventTitle,
      customerName: user_name,
    });

    // 6. Capacity Lock with Auto-Rollback Transaction wrapper
    const bookingPayload = {
      id: bookingUniqueId,
      tenant_id: targetTenantId,
      event_id: targetEventId,
      user_name,
      user_email: effectiveEmail,
      user_phone: user_phone || null,
      staff_id: staff_id || null,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      status: "confirmed",
      meeting_url: meetingDetails.meetingUrl || null,
      meeting_id: meetingDetails.meetingId || null,
      meeting_platform: meetingDetails.platform,
      cancellation_token: cancellationToken,
      notes: notes || null,
    };

    const lockSessionId = session_id || `session_${bookingUniqueId}`;

    const txResult = await slotLockManager.withSlotLock(
      {
        tenantId: targetTenantId,
        serviceId: targetEventId,
        staffId: staff_id || "any",
        startUtc: startTime.toISOString(),
        sessionId: lockSessionId,
        maxCapacity: capacity,
      },
      async () => {
        // 1. Always save to persistent Edge Config Appointments Store
        try {
          const storedApp = {
            id: bookingUniqueId,
            customer_name: user_name,
            customer_phone: user_phone || "",
            customer_note: notes || eventTitle || "Saç Kesimi & Yıkama",
            appointment_date: startTime.toISOString().split("T")[0],
            appointment_time: startTime.toISOString().split("T")[1].slice(0, 8),
            status: "confirmed" as const,
            services: { name: notes || eventTitle || "Saç Kesimi & Yıkama" },
            created_at: new Date().toISOString(),
          };
          await saveNewAppointment(storedApp);
        } catch (err) {
          console.warn("[Bookings] Error saving to appointmentsStore:", err);
        }

        // 2. Also attempt Supabase appointments table
        try {
          const appointmentInsertData = {
            customer_name: user_name,
            customer_phone: user_phone || "",
            customer_note: notes || "",
            appointment_date: startTime.toISOString().split("T")[0],
            appointment_time: startTime.toISOString().split("T")[1].slice(0, 8),
            status: "confirmed",
          };

          await supabase.from("appointments").insert([appointmentInsertData]);
        } catch (e) {
          console.warn("[Bookings] Appointments table insert skipped:", e);
        }

        return bookingPayload;
      },
      true // Auto release lock on success since booking is committed
    );

    if (!txResult.success) {
      return apiConflict(txResult.error || "Randevu saati kilitlenemedi.");
    }

    const createdBooking = txResult.data || bookingPayload;

    // 7. Send Confirmation Email via Nodemailer (Resilient)
    let mailSent = false;
    if (process.env.SMTP_PASS) {
      try {
        const mailOptions = {
          from: process.env.SMTP_FROM_EMAIL || `"Randevu Sistemi" <${process.env.SMTP_USER || "noreply@randevuformu.com"}>`,
          to: user_email,
          subject: `Randevunuz Onaylandı: ${eventTitle}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
              <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 24px; text-align: center; color: #ffffff;">
                <h2 style="margin: 0; font-size: 22px;">Randevunuz Başarıyla Onaylandı</h2>
                <p style="margin: 6px 0 0 0; opacity: 0.9; font-size: 14px;">${eventTitle}</p>
              </div>
              <div style="padding: 24px; color: #1e293b; font-size: 15px; line-height: 1.6;">
                <p>Sayın <strong>${user_name}</strong>,</p>
                <p>Randevunuz başarıyla sisteme kaydedilmiştir.</p>
                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 16px 0;">
                  <p style="margin: 4px 0;">📅 <strong>Tarih & Başlangıç:</strong> ${startTime.toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" })}</p>
                  <p style="margin: 4px 0;">⏳ <strong>Bitiş:</strong> ${endTime.toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" })}</p>
                  ${meetingDetails.isOnline && meetingDetails.meetingUrl ? `<p style="margin: 8px 0 4px 0;">🔗 <strong>Online Görüşme Linki:</strong> <a href="${meetingDetails.meetingUrl}" style="color: #4f46e5; font-weight: bold;">Görüşmeye Katıl</a></p>` : ""}
                </div>
                <p style="font-size: 13px; color: #64748b;">${meetingDetails.instructions}</p>
              </div>
              <div style="background-color: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #64748b;">
                Bu bildirim randevuformu.com tarafından otomatik iletilmiştir.
              </div>
            </div>
          `,
        };
        await transporter.sendMail(mailOptions);
        mailSent = true;
      } catch (mailError) {
        console.warn("[Bookings Mail Warning]:", mailError);
      }
    }

    // 8. Dual SMS Notification (Müşteri + Erman Usta: +90 538 480 90 01)
    let smsResult = { customerSmsSent: false, barberSmsSent: false };
    if (user_phone) {
      try {
        const appointmentDate = startTime.toLocaleDateString("tr-TR", {
          timeZone: "Europe/Istanbul",
          day: "numeric",
          month: "long",
          weekday: "long",
        });
        const appointmentTime = startTime.toLocaleTimeString("tr-TR", {
          timeZone: "Europe/Istanbul",
          hour: "2-digit",
          minute: "2-digit",
        });

        smsResult = await sendDualBarberBookingSms({
          customerName: user_name,
          customerPhone: user_phone,
          appointmentDate,
          appointmentTime,
          serviceName: eventTitle || "Erkek Berberi Tıraş Hizmeti",
          barberPhone: "905384809001",
        });
      } catch (smsErr) {
        console.warn("[Bookings Dual SMS Warning]:", smsErr);
      }
    }

    return apiSuccess(
      {
        booking: createdBooking,
        meeting: meetingDetails,
        mailSent,
        smsResult,
      },
      "Randevu başarıyla oluşturuldu.",
      201
    );
  } catch (error: any) {
    return handleApiError(error, "Randevu oluşturulurken beklenmeyen bir hata meydana geldi.");
  }
}
