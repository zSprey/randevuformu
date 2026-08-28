import crypto from "crypto";

export type MeetingPlatform = "GOOGLE_MEET" | "ZOOM" | "MICROSOFT_TEAMS" | "JITSI_MEET" | "IN_PERSON";

export interface MeetingDetails {
  platform: MeetingPlatform;
  meetingUrl?: string;
  meetingId?: string;
  passcode?: string;
  hostUrl?: string;
  instructions: string;
  calendarDescription: string;
  isOnline: boolean;
  createdAt: string;
}

export interface CreateMeetingOptions {
  isOnline: boolean;
  platform?: MeetingPlatform;
  bookingId: string;
  serviceTitle?: string;
  businessName?: string;
  customerName?: string;
  address?: string;
}

export class MeetingGenerator {
  /**
   * Generates a Google Meet link in format xxx-yyyy-zzz
   */
  public static generateGoogleMeet(bookingId: string, businessName?: string): MeetingDetails {
    // Generate high-entropy alphabet characters for the 3-4-3 slug
    const cleanId = bookingId.replace(/[^a-zA-Z0-9]/g, "");
    const hash = crypto.createHash("sha256").update(`meet-${cleanId}-${Date.now()}`).digest("hex");
    
    // Map hex to lowercase alphabetic chars [a-z]
    const alpha = hash.split("").map((c) => String.fromCharCode(97 + (parseInt(c, 16) % 26))).join("");
    const slug = `${alpha.slice(0, 3)}-${alpha.slice(3, 7)}-${alpha.slice(7, 10)}`;
    const meetingUrl = `https://meet.google.com/${slug}`;

    const instructions =
      "Randevu saatinde linke tıklayarak Google Meet üzerinden doğrudan görüşmeye katılabilirsiniz. Tarayıcı veya Google Meet uygulaması gereklidir.";

    const calendarDescription = [
      `🌐 Online Görüşme: Google Meet`,
      `🔗 Katılım Linki: ${meetingUrl}`,
      `🏷️ Toplantı Kodu: ${slug}`,
      businessName ? `🏢 Düzenleyen: ${businessName}` : "",
      `ℹ️ Lütfen randevu saatinden 2 dakika önce hazır olunuz.`,
    ]
      .filter(Boolean)
      .join("\n");

    return {
      platform: "GOOGLE_MEET",
      meetingUrl,
      meetingId: slug,
      instructions,
      calendarDescription,
      isOnline: true,
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Generates cryptographically secure Zoom meeting details
   */
  public static generateZoom(bookingId: string, businessName?: string): MeetingDetails {
    // 10-digit meeting ID
    const meetingId = crypto.randomInt(1000000000, 9999999999).toString();
    // 6-digit numeric passcode
    const passcode = crypto.randomInt(100000, 999999).toString();
    const pwdHash = crypto.createHash("md5").update(passcode).digest("hex").slice(0, 12);
    const meetingUrl = `https://us05web.zoom.us/j/${meetingId}?pwd=${pwdHash}`;

    const instructions = `Zoom Toplantı ID: ${meetingId} | Şifre: ${passcode}. Randevu saatinde linke tıklayarak veya Zoom uygulamasında ID girerek bağlanabilirsiniz.`;

    const calendarDescription = [
      `🌐 Online Görüşme: Zoom`,
      `🔗 Katılım Linki: ${meetingUrl}`,
      `🆔 Toplantı ID: ${meetingId}`,
      `🔑 Parola: ${passcode}`,
      businessName ? `🏢 Düzenleyen: ${businessName}` : "",
      `ℹ️ Lütfen randevu saatinden 2 dakika önce hazır olunuz.`,
    ]
      .filter(Boolean)
      .join("\n");

    return {
      platform: "ZOOM",
      meetingUrl,
      meetingId,
      passcode,
      instructions,
      calendarDescription,
      isOnline: true,
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Generates Microsoft Teams meeting details
   */
  public static generateTeams(bookingId: string, businessName?: string): MeetingDetails {
    const cleanId = bookingId.replace(/[^a-zA-Z0-9]/g, "");
    const threadId = crypto.randomBytes(8).toString("hex");
    const meetingId = crypto.randomInt(100000000, 999999999).toString();
    const passcode = crypto.randomBytes(4).toString("hex").toUpperCase();
    const meetingUrl = `https://teams.microsoft.com/l/meetup-join/19%3ameeting_${threadId}%40thread.v2/0?context=%7b%22Tid%22%3a%22rf-${cleanId}%22%7d`;

    const instructions = `Microsoft Teams toplantısı. Randevu saatinde linke tıklayarak web tarayıcınızdan veya Teams uygulamasından katılabilirsiniz. (Toplantı Kimliği: ${meetingId})`;

    const calendarDescription = [
      `🌐 Online Görüşme: Microsoft Teams`,
      `🔗 Katılım Linki: ${meetingUrl}`,
      `🆔 Toplantı Kimliği: ${meetingId}`,
      `🔑 Geçiş Kodu: ${passcode}`,
      businessName ? `🏢 Düzenleyen: ${businessName}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    return {
      platform: "MICROSOFT_TEAMS",
      meetingUrl,
      meetingId,
      passcode,
      instructions,
      calendarDescription,
      isOnline: true,
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Generates Jitsi Meet (Open-Source Instant WebRTC) meeting details
   */
  public static generateJitsi(bookingId: string, businessName?: string): MeetingDetails {
    const hash = crypto.randomBytes(6).toString("hex");
    const roomSlug = `randevuformu-${bookingId.slice(0, 8)}-${hash}`;
    const meetingUrl = `https://meet.jit.si/${roomSlug}`;

    const instructions =
      "Kurulum ve üyelik gerektirmeyen şifreli Jitsi Meet görüşmesi. Randevu saatinde linke tıklayarak tarayıcınızdan doğrudan katılabilirsiniz.";

    const calendarDescription = [
      `🌐 Online Görüşme: Jitsi Meet (WebRTC)`,
      `🔗 Doğrudan Katılım: ${meetingUrl}`,
      businessName ? `🏢 Düzenleyen: ${businessName}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    return {
      platform: "JITSI_MEET",
      meetingUrl,
      meetingId: roomSlug,
      instructions,
      calendarDescription,
      isOnline: true,
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Generates In-Person meeting details
   */
  public static generateInPerson(address?: string, businessName?: string): MeetingDetails {
    const venueAddress = address || "İşletme Adresi / Muayenehane";
    const instructions = `Yüz yüze randevu. Lütfen randevu saatinden 5-10 dakika önce adreste hazır bulununuz. Adres: ${venueAddress}`;

    const calendarDescription = [
      `📍 Yüz Yüze Randevu`,
      `🏢 İşletme: ${businessName || "Randevu Noktası"}`,
      `🗺️ Adres: ${venueAddress}`,
      `ℹ️ Lütfen randevu saatinizden 5 dakika önce danışmada olunuz.`,
    ].join("\n");

    return {
      platform: "IN_PERSON",
      instructions,
      calendarDescription,
      isOnline: false,
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Unified meeting creator based on service options
   */
  public static createMeeting(options: CreateMeetingOptions): MeetingDetails {
    const { isOnline, platform = "GOOGLE_MEET", bookingId, businessName, address } = options;

    if (!isOnline || platform === "IN_PERSON") {
      return this.generateInPerson(address, businessName);
    }

    switch (platform) {
      case "ZOOM":
        return this.generateZoom(bookingId, businessName);
      case "MICROSOFT_TEAMS":
        return this.generateTeams(bookingId, businessName);
      case "JITSI_MEET":
        return this.generateJitsi(bookingId, businessName);
      case "GOOGLE_MEET":
      default:
        return this.generateGoogleMeet(bookingId, businessName);
    }
  }
}
