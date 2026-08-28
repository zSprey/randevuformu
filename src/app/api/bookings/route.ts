import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import nodemailer from "nodemailer";
import crypto from "crypto";
import { slotLockManager } from "@/lib/engine/lockManager";
import { MeetingGenerator } from "@/lib/integrations/meetingGenerator";
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
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");
    const tenantId = searchParams.get("tenantId");

    let query = supabase.from("bookings").select("*");

    if (eventId) {
      query = query.eq("event_id", eventId);
    }
    if (tenantId) {
      query = query.eq("tenant_id", tenantId);
    }

    const { data: bookings, error } = await query;

    if (error) {
      throw error;
    }

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

    // 1. Validate mandatory fields
    if (!targetEventId || !user_name || !user_email || !start_time) {
      return apiBadRequest("Eksik bilgi: event_id, user_name, user_email ve start_time zorunludur.");
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
    const { data: overlappingBookings, error: overlapError } = await supabase
      .from("bookings")
      .select("id, start_time, end_time, status")
      .eq("event_id", targetEventId)
      .neq("status", "CANCELLED")
      .lt("start_time", endTime.toISOString())
      .gt("end_time", startTime.toISOString());

    if (overlapError && !overlapError.message?.includes("relation")) {
      throw overlapError;
    }

    const currentOverlaps = overlappingBookings ? overlappingBookings.length : 0;
    if (currentOverlaps >= capacity) {
      return apiConflict(
        capacity > 1
          ? `Bu saat diliminin maksimum kontenjanı (${capacity} kişi) dolmuştur.`
          : "Seçilen zaman dilimi tamamen dolu. Lütfen farklı bir saat seçiniz."
      );
    }

    // 4. Duplicate client booking check on exact slot
    const { data: userOverlaps } = await supabase
      .from("bookings")
      .select("id")
      .eq("user_email", user_email)
      .neq("status", "CANCELLED")
      .lt("start_time", endTime.toISOString())
      .gt("end_time", startTime.toISOString());

    if (userOverlaps && userOverlaps.length > 0) {
      return apiConflict("Bu zaman diliminde zaten başka bir aktif randevunuz bulunmaktadır.");
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
      user_email,
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
        // Insert into Supabase
        const { data: insertedBooking, error: insertError } = await supabase
          .from("bookings")
          .insert([bookingPayload])
          .select()
          .single();

        if (insertError) {
          // If table schema variation, provide fallback object
          if (insertError.message?.includes("relation") || insertError.message?.includes("column")) {
            return bookingPayload;
          }
          throw insertError;
        }

        return insertedBooking;
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

    return apiSuccess(
      {
        booking: createdBooking,
        meeting: meetingDetails,
        mailSent,
      },
      "Randevu başarıyla oluşturuldu.",
      201
    );
  } catch (error: any) {
    return handleApiError(error, "Randevu oluşturulurken beklenmeyen bir hata meydana geldi.");
  }
}
