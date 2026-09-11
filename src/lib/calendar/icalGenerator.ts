/**
 * iCalendar (RFC 5545) & WebCal Generator
 * Müşteri ve İşletme Takvim Entegrasyonları için saat dilimi korumalı ve alarmlı takvim üreticisi.
 */

export interface CalendarEventParams {
  id: string;
  title: string;
  description?: string;
  location?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  durationMinutes: number;
  organizerName?: string;
  organizerEmail?: string;
  customerName?: string;
  customerPhone?: string;
  url?: string;
}

/**
 * Tarih ve saati UTC stringine dönüştürür (YYYYMMDDTHHMMSSZ)
 * Türkiye GMT+3 saat dilimi farkını (-3 saat) hesaplar.
 */
function toUtcString(dateStr: string, timeStr: string, addMinutes = 0): string {
  try {
    const [year, month, day] = dateStr.split("-").map(Number);
    const [hour, minute] = timeStr.split(":").map(Number);

    // Türkiye saati (GMT+3) olarak Date nesnesi oluştur
    const localDate = new Date(Date.UTC(year, month - 1, day, hour - 3, minute + addMinutes, 0));

    const y = localDate.getUTCFullYear();
    const m = String(localDate.getUTCMonth() + 1).padStart(2, "0");
    const d = String(localDate.getUTCDate()).padStart(2, "0");
    const h = String(localDate.getUTCHours()).padStart(2, "0");
    const min = String(localDate.getUTCMinutes()).padStart(2, "0");
    const s = String(localDate.getUTCSeconds()).padStart(2, "0");

    return `${y}${m}${d}T${h}${min}${s}Z`;
  } catch {
    const cleanDate = dateStr.replace(/-/g, "");
    const cleanTime = timeStr.replace(/:/g, "").padEnd(4, "0");
    return `${cleanDate}T${cleanTime}00Z`;
  }
}

/**
 * Tek bir randevu için çift alarmlı (1 gün ve 1 saat önce) .ics dosyası metni üretir.
 */
export function generateSingleEventIcs(event: CalendarEventParams): string {
  const dtStart = toUtcString(event.date, event.time, 0);
  const dtEnd = toUtcString(event.date, event.time, event.durationMinutes || 45);
  const nowUtc = toUtcString(new Date().toISOString().split("T")[0], "12:00", 0);
  const uid = `rf-${event.id || Date.now()}@randevuformu.com`;

  const cleanTitle = (event.title || "Randevu").replace(/\n/g, " ");
  const cleanDesc = (event.description || "").replace(/\n/g, "\\n");
  const cleanLoc = (event.location || "").replace(/\n/g, " ");

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//randevuformu.com//Randevu Takvimi v2.0//TR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${nowUtc}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${cleanTitle}`,
    `DESCRIPTION:${cleanDesc}`,
    cleanLoc ? `LOCATION:${cleanLoc}` : "",
    event.url ? `URL:${event.url}` : "",
    "STATUS:CONFIRMED",
    // 1. Alarm: Randevudan 1 Gün Önce (24 saat)
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    "DESCRIPTION:Yarın randevunuz var! Lütfen hazırlığınızı yapınız.",
    "TRIGGER:-P1D",
    "END:VALARM",
    // 2. Alarm: Randevudan 1 Saat Önce (60 dakika)
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    "DESCRIPTION:Randevunuza 1 saat kaldı! Yola çıkma vakti.",
    "TRIGGER:-PT1H",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");
}

/**
 * Google Takvim web bağlantısı üretir (saat dilimi korumalı ve doğru süreli)
 */
export function generateGoogleCalendarUrl(event: CalendarEventParams): string {
  const dtStart = toUtcString(event.date, event.time, 0);
  const dtEnd = toUtcString(event.date, event.time, event.durationMinutes || 45);

  const title = encodeURIComponent(event.title || "Randevu");
  const details = encodeURIComponent(
    `${event.description || ""}\n\nRandevu Formu: ${event.url || "https://randevuformu.com"}`
  );
  const location = encodeURIComponent(event.location || "");

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dtStart}/${dtEnd}&details=${details}&location=${location}`;
}

/**
 * İşletmeci için çoklu randevulu canlı WebCal akışı (iCal Feed) üretir.
 */
export function generateMultiEventFeed(
  calendarName: string,
  events: CalendarEventParams[],
  refreshMinutes = 15
): string {
  const nowUtc = toUtcString(new Date().toISOString().split("T")[0], "12:00", 0);

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//randevuformu.com//Isletme Canli Takvim Akisi v2.0//TR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${calendarName}`,
    `X-WR-CALDESC:${calendarName} Canlı Randevu Akışı - randevuformu.com`,
    `X-WR-TIMEZONE:Europe/Istanbul`,
    `REFRESH-INTERVAL;VALUE=DURATION:PT${refreshMinutes}M`,
    `X-PUBLISHED-TTL:PT${refreshMinutes}M`,
    "BEGIN:VTIMEZONE",
    "TZID:Europe/Istanbul",
    "BEGIN:STANDARD",
    "DTSTART:19700101T000000",
    "TZOFFSETFROM:+0300",
    "TZOFFSETTO:+0300",
    "TZNAME:TRT",
    "END:STANDARD",
    "END:VTIMEZONE",
  ];

  const effectiveEvents = [...events];
  if (effectiveEvents.length === 0) {
    const today = new Date().toISOString().split("T")[0];
    effectiveEvents.push({
      id: "sync-status",
      title: `✅ ${calendarName} - Canlı Bağlantı Aktif`,
      description: "RandevuFormu canlı takvim senkronizasyonunuz başarıyla bağlandı. Yeni gelen randevular otomatik olarak buraya düşecektir.\n\nPanel: https://randevuformu.com/calendar",
      location: "RandevuFormu Bulut Senkronizasyonu",
      date: today,
      time: "09:00",
      durationMinutes: 30,
      url: "https://randevuformu.com/calendar",
    });
  }

  for (const ev of effectiveEvents) {
    const dtStart = toUtcString(ev.date, ev.time, 0);
    const dtEnd = toUtcString(ev.date, ev.time, ev.durationMinutes || 45);
    const uid = `rf-${ev.id}@randevuformu.com`;
    const cleanTitle = (ev.title || "Randevu").replace(/\n/g, " ");
    const cleanDesc = (ev.description || "").replace(/\n/g, "\\n");
    const cleanLoc = (ev.location || "").replace(/\n/g, " ");

    lines.push(
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${nowUtc}`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:${cleanTitle}`,
      `DESCRIPTION:${cleanDesc}`,
      cleanLoc ? `LOCATION:${cleanLoc}` : "",
      ev.url ? `URL:${ev.url}` : "",
      "STATUS:CONFIRMED",
      // İşletmeci için Alarmlar: 1 saat önce ve 15 dakika önce
      "BEGIN:VALARM",
      "ACTION:DISPLAY",
      `DESCRIPTION:Sıradaki Müşteri: ${cleanTitle}`,
      "TRIGGER:-PT1H",
      "END:VALARM",
      "BEGIN:VALARM",
      "ACTION:DISPLAY",
      `DESCRIPTION:15 Dakika Sonra: ${cleanTitle}`,
      "TRIGGER:-PT15M",
      "END:VALARM",
      "END:VEVENT"
    );
  }

  lines.push("END:VCALENDAR");
  return lines.filter(Boolean).join("\r\n");
}
