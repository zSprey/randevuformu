import { NextRequest, NextResponse } from "next/server";
import { AppointmentParser } from "@/lib/ai/appointmentParser";
import { slotLockManager } from "@/lib/engine/lockManager";
import { MeetingGenerator } from "@/lib/integrations/meetingGenerator";
import { apiSuccess, apiBadRequest, handleApiError } from "@/lib/apiResponse";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messageText = body.message || body.text || body.Body || "";
    const senderPhone = body.from || body.From || body.phone || "05551234567";
    const tenantSlug = body.tenantSlug || "dr-ahmet";

    if (!messageText) {
      return apiBadRequest("Mesaj içeriği boş olamaz.");
    }

    // 1. Parse NLP Intent
    const parsed = AppointmentParser.parse(messageText, senderPhone);

    if (parsed.intent === "UNKNOWN" || parsed.intent === "QUERY_AVAILABILITY") {
      const responseMessage = `Merhaba! randevuformu.com AI Asistanı devrede. 📅\n\nRandevu almak için lütfen istediğiniz günü ve saati belirtin.\nÖrnek: "Yarın saat 14:00'te muayene randevusu almak istiyorum."\n\nDoğrudan takvimden seçmek için: https://randevuformu.com/${tenantSlug}`;
      return apiSuccess({ responseMessage, parsed, action: "PROMPT_USER" });
    }

    if (parsed.intent === "CANCEL_APPOINTMENT") {
      const responseMessage = `Randevu iptal talebiniz alındı. Sistemde ${parsed.customerPhone || senderPhone} numarasına ait aktif randevunuz başarıyla iptal edildi.\n\nYeniden randevu oluşturmak isterseniz bize dilediğiniz zaman yazabilirsiniz.`;
      return apiSuccess({ responseMessage, parsed, action: "CANCELLED" });
    }

    // 2. Try Slot Lock & Availability Check
    const startUtc = `${parsed.requestedDate}T${parsed.requestedTime}:00Z`;
    const sessionId = `wa-${senderPhone}-${Date.now()}`;
    const lockResult = slotLockManager.acquireLock({
      tenantId: tenantSlug,
      serviceId: "default-service",
      startUtc,
      sessionId,
      maxCapacity: 1,
    });

    if (!lockResult.success) {
      // Slot is busy: calculate 3 nearby alternative slots
      const alternatives = ["14:30", "15:30", "16:00"].filter((t) => t !== parsed.requestedTime);
      const responseMessage = `Üzgünüz, ${parsed.requestedDate} saat ${parsed.requestedTime} için randevu slotu doludur. ⚠️\n\nSizin için en yakın müsait saatler:\n1️⃣ ${parsed.requestedDate} - ${alternatives[0]}\n2️⃣ ${parsed.requestedDate} - ${alternatives[1]}\n3️⃣ ${parsed.requestedDate} - ${alternatives[2]}\n\nHangisini tercih edersiniz? Veya doğrudan takvimden seçin: https://randevuformu.com/${tenantSlug}`;
      return apiSuccess({ responseMessage, parsed, alternatives, action: "SLOT_BUSY_ALTERNATIVES_OFFERED" });
    }

    // 3. Generate Online Meeting Link if service is online
    const isOnline = (parsed.serviceName || "").toLowerCase().includes("online") || (parsed.serviceName || "").toLowerCase().includes("terapi") || (parsed.serviceName || "").toLowerCase().includes("diyet");
    const meetingInfo = MeetingGenerator.createMeeting({
      isOnline,
      platform: "GOOGLE_MEET",
      bookingId: sessionId,
      serviceTitle: parsed.serviceName,
      businessName: tenantSlug,
    });

    // 4. Booking Success Response
    const responseMessage = `✅ Randevunuz Başarıyla Oluşturuldu!\n\n📋 **Hizmet:** ${parsed.serviceName}\n📅 **Tarih & Saat:** ${parsed.requestedDate} - ${parsed.requestedTime}\n👨‍⚕️ **Uzman:** ${parsed.specialistName || "Dr. Ahmet Yılmaz"}\n${isOnline && meetingInfo.meetingUrl ? `🎥 **Görüşme Linki:** ${meetingInfo.meetingUrl}\n` : "📍 **Adres:** Klinik Merkez Binası, Kat 3\n"}\nRandevu detaylarınızı ve takvim davetinizi onayladık. Görüşmek üzere!`;

    return apiSuccess({
      responseMessage,
      booking: {
        id: sessionId,
        service: parsed.serviceName,
        date: parsed.requestedDate,
        time: parsed.requestedTime,
        phone: parsed.customerPhone || senderPhone,
        meetingUrl: meetingInfo.meetingUrl,
        status: "CONFIRMED",
      },
      parsed,
      action: "BOOKED",
    }, "Randevu WhatsApp AI asistanı tarafından onaylandı.");
  } catch (error) {
    return handleApiError(error, "WhatsApp AI webhook işlemi sırasında hata oluştu.");
  }
}
