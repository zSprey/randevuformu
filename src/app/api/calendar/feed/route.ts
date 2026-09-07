import { NextRequest, NextResponse } from "next/server";
import { getStoredAppointments } from "@/lib/storage/appointmentsStore";
import { getBusinessProfile } from "@/lib/storage/profileStore";
import { generateMultiEventFeed, CalendarEventParams } from "@/lib/calendar/icalGenerator";

export const dynamic = "force-dynamic";

/**
 * GET /api/calendar/feed?tenant=[slug]
 * 
 * İşletme sahibinin telefonundaki Apple Takvim, Google Takvim veya Outlook'a
 * canlı iCal / WebCal abonelik akışı sağlar.
 * Yeni randevular otomatik olarak telefon takvimine düşer ve bildirim çalar.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tenant = (searchParams.get("tenant") || searchParams.get("slug") || "byerman").toLowerCase().trim();

    // 1. İşletme profilini ve randevularını çek
    const [profile, appointments] = await Promise.all([
      getBusinessProfile(tenant),
      getStoredAppointments(tenant),
    ]);

    const businessTitle = profile?.name || (tenant === "byerman" ? "By Erman - Erkek Berberi" : `${tenant.toUpperCase()} Randevuları`);
    const location = profile?.google_maps_url || profile?.address || "İşletme Salonu";

    // 2. Aktif (iptal edilmemiş) randevuları dönüştür
    const activeAppointments = appointments.filter((app) => app.status !== "cancelled");

    const events: CalendarEventParams[] = activeAppointments.map((app) => {
      const serviceName = app.services?.name || "Randevu Hizmeti";
      const staffInfo = app.staff_name ? ` (Personel: ${app.staff_name})` : "";
      const title = `${app.customer_name} - ${serviceName}${staffInfo}`;
      
      const descLines = [
        `Müşteri: ${app.customer_name}`,
        `Telefon: ${app.customer_phone}`,
        `Hizmet: ${serviceName}`,
        app.staff_name ? `Personel / Koltuk: ${app.staff_name}` : "",
        app.services?.price_text ? `Ücret: ${app.services.price_text}` : "",
        app.customer_note ? `Müşteri Notu: ${app.customer_note}` : "",
        `Durum: ${app.status === "confirmed" ? "Onaylandı" : app.status === "seated" ? "Koltukta" : "Bekliyor"}`,
        `Yönetim Paneli: https://randevuformu.com/calendar`,
      ].filter(Boolean);

      return {
        id: app.id,
        title,
        description: descLines.join("\n"),
        location,
        date: app.appointment_date,
        time: app.appointment_time,
        durationMinutes: 45, // varsayılan seans süresi
        url: `https://randevuformu.com/calendar`,
        customerName: app.customer_name,
        customerPhone: app.customer_phone,
      };
    });

    // 3. RFC 5545 iCalendar akışını üret (15 dk yenileme aralıklı)
    const icsContent = generateMultiEventFeed(businessTitle, events, 15);

    return new NextResponse(icsContent, {
      status: 200,
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Cache-Control": "no-cache, no-store, max-age=0, must-revalidate",
        "Content-Disposition": `inline; filename="${tenant}-randevulari.ics"`,
        "X-Published-TTL": "PT15M",
      },
    });
  } catch (error: any) {
    console.error("[Calendar Feed Error]:", error);
    return new NextResponse("Takvim akışı oluşturulurken hata oluştu.", { status: 500 });
  }
}
