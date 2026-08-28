export interface ParsedAppointmentIntent {
  intent: "BOOK_APPOINTMENT" | "CANCEL_APPOINTMENT" | "RESCHEDULE" | "QUERY_AVAILABILITY" | "UNKNOWN";
  serviceName?: string;
  serviceCategory?: string;
  requestedDate?: string; // YYYY-MM-DD
  requestedTime?: string; // HH:mm
  specialistName?: string;
  customerName?: string;
  customerPhone?: string;
  notes?: string;
  confidence: number;
}

export class AppointmentParser {
  private static SERVICES_MAP: Record<string, string> = {
    dolgu: "Diş Dolgusu & Tedavi",
    implant: "İmplant Muayenesi",
    temizlik: "Diş Taşı Temizliği",
    muayene: "Genel Muayene & Konsültasyon",
    diyet: "Online Beslenme Danışmanlığı",
    seans: "Klinik Terapi Seansı",
    terapi: "Bireysel Psikoterapi",
    boya: "Saç Boyama & Bakım",
    kesim: "Saç Kesim & Şekillendirme",
    bakım: "Cilt Bakımı & Medikal Estetik",
    pilates: "Reformer Pilates Seansı",
    masaj: "Medikal Masaj & Terapi",
    checkup: "Genel Sağlık Taraması",
  };

  /**
   * Parse Turkish conversational messages or speech transcripts into structured booking data
   */
  public static parse(text: string, defaultPhone?: string): ParsedAppointmentIntent {
    const raw = text.toLowerCase().trim();

    // 1. Detect Intent
    let intent: ParsedAppointmentIntent["intent"] = "UNKNOWN";
    if (raw.includes("randevu") || raw.includes("boşluk") || raw.includes("müsait") || raw.includes("seans") || raw.includes("yaz") || raw.includes("almak ist")) {
      intent = "BOOK_APPOINTMENT";
    } else if (raw.includes("iptal") || raw.includes("gelemeyeceğim") || raw.includes("vazgeçtim")) {
      intent = "CANCEL_APPOINTMENT";
    } else if (raw.includes("ertelemek") || raw.includes("değiştir") || raw.includes("başka gün")) {
      intent = "RESCHEDULE";
    } else if (raw.includes("fiyat") || raw.includes("kaç para") || raw.includes("ücret") || raw.includes("bilgi")) {
      intent = "QUERY_AVAILABILITY";
    }

    // 2. Extract Service
    let serviceName = "Genel Muayene & Konsültasyon";
    for (const [key, name] of Object.entries(this.SERVICES_MAP)) {
      if (raw.includes(key)) {
        serviceName = name;
        break;
      }
    }

    // 3. Extract Date (Relative & Absolute)
    const today = new Date();
    let requestedDate: string = today.toISOString().split("T")[0];

    if (raw.includes("yarın")) {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      requestedDate = tomorrow.toISOString().split("T")[0];
    } else if (raw.includes("bugün")) {
      requestedDate = today.toISOString().split("T")[0];
    } else if (raw.includes("pazartesi")) {
      requestedDate = this.getNextDayOfWeek(1);
    } else if (raw.includes("salı")) {
      requestedDate = this.getNextDayOfWeek(2);
    } else if (raw.includes("çarşamba")) {
      requestedDate = this.getNextDayOfWeek(3);
    } else if (raw.includes("perşembe")) {
      requestedDate = this.getNextDayOfWeek(4);
    } else if (raw.includes("cuma")) {
      requestedDate = this.getNextDayOfWeek(5);
    } else if (raw.includes("cumartesi")) {
      requestedDate = this.getNextDayOfWeek(6);
    } else {
      // Look for DD.MM or DD/MM or DD-MM format
      const dateMatch = raw.match(/(\d{1,2})[.\/-](\d{1,2})(?:[.\/-](\d{2,4}))?/);
      if (dateMatch) {
        const day = dateMatch[1].padStart(2, "0");
        const month = dateMatch[2].padStart(2, "0");
        const year = dateMatch[3] ? (dateMatch[3].length === 2 ? `20${dateMatch[3]}` : dateMatch[3]) : today.getFullYear().toString();
        requestedDate = `${year}-${month}-${day}`;
      }
    }

    // 4. Extract Time (e.g., 15:00, 15.30, saat 3, 14te, 16'da)
    let requestedTime = "14:00";
    const timeMatch = raw.match(/(?:saat\s*)?(\d{1,2})(?::|\.)(\d{2})/i) ||
      raw.match(/(?:saat\s*)(\d{1,2})(?:\s*(?:de|da|te|ta|e|a))?/i) ||
      raw.match(/(\d{1,2})\s*(?:'de|'da|'te|'ta|de|da|te|ta)/i);

    if (timeMatch) {
      let hour = parseInt(timeMatch[1], 10);
      const minute = timeMatch[2] ? timeMatch[2] : "00";
      // Adjust 12-hour colloquial Turkish (e.g. öğleden sonra 3 => 15)
      if (hour < 8 && (raw.includes("öğleden sonra") || raw.includes("akşam") || hour <= 6)) {
        hour += 12;
      }
      requestedTime = `${hour.toString().padStart(2, "0")}:${minute}`;
    }

    // 5. Extract Phone Number
    let customerPhone = defaultPhone;
    const phoneMatch = raw.match(/(?:0|\+90)?\s*(5\d{2})\s*(\d{3})\s*(\d{2})\s*(\d{2})/);
    if (phoneMatch) {
      customerPhone = `0${phoneMatch[1]}${phoneMatch[2]}${phoneMatch[3]}${phoneMatch[4]}`;
    }

    // 6. Extract Specialist Name if mentioned
    let specialistName: string | undefined;
    if (raw.includes("ahmet")) specialistName = "Dr. Ahmet Yılmaz";
    else if (raw.includes("ayşe")) specialistName = "Dyt. Ayşe Kaya";
    else if (raw.includes("mehmet")) specialistName = "Psk. Mehmet Demir";
    else if (raw.includes("nova") || raw.includes("elif")) specialistName = "Elif Karaca";

    return {
      intent,
      serviceName,
      requestedDate,
      requestedTime,
      specialistName,
      customerPhone,
      confidence: intent === "UNKNOWN" ? 0.4 : 0.95,
      notes: `WhatsApp AI NLP Otomatik Ayrıştırma: "${text}"`,
    };
  }

  private static getNextDayOfWeek(dayOfWeek: number): string {
    const d = new Date();
    const currentDay = d.getDay();
    let diff = dayOfWeek - currentDay;
    if (diff <= 0) diff += 7;
    d.setDate(d.getDate() + diff);
    return d.toISOString().split("T")[0];
  }
}
