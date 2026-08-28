import crypto from "crypto";

export interface MeetingDetails {
  platform: "GOOGLE_MEET" | "ZOOM" | "IN_PERSON";
  meetingUrl?: string;
  meetingId?: string;
  passcode?: string;
  instructions: string;
}

export class MeetingGenerator {
  /**
   * Generates a deterministic or dynamic Google Meet link for online appointments
   */
  public static generateGoogleMeet(bookingId: string): MeetingDetails {
    // Generate a 10-char slug in format xxx-yyyy-zzz
    const hash = crypto.createHash("md5").update(`meet-${bookingId}`).digest("hex").slice(0, 10);
    const slug = `${hash.slice(0, 3)}-${hash.slice(3, 7)}-${hash.slice(7, 10)}`;
    const meetingUrl = `https://meet.google.com/${slug}`;

    return {
      platform: "GOOGLE_MEET",
      meetingUrl,
      meetingId: slug,
      instructions: "Randevu saatinde linke tıklayarak Google Meet üzerinden doğrudan görüşmeye katılabilirsiniz.",
    };
  }

  /**
   * Generates Zoom meeting details
   */
  public static generateZoom(bookingId: string): MeetingDetails {
    const meetingId = (Math.floor(1000000000 + Math.random() * 9000000000)).toString();
    const passcode = (Math.floor(100000 + Math.random() * 900000)).toString();
    const meetingUrl = `https://us05web.zoom.us/j/${meetingId}?pwd=${passcode}`;

    return {
      platform: "ZOOM",
      meetingUrl,
      meetingId,
      passcode,
      instructions: `Zoom Toplantı ID: ${meetingId} | Şifre: ${passcode}`,
    };
  }

  /**
   * Unified meeting creator based on service preferences
   */
  public static createMeeting(
    isOnline: boolean,
    platform: "GOOGLE_MEET" | "ZOOM" = "GOOGLE_MEET",
    bookingId: string
  ): MeetingDetails {
    if (!isOnline) {
      return {
        platform: "IN_PERSON",
        instructions: "Yüz yüze randevu. Lütfen randevu saatinden 5 dakika önce adreste olunuz.",
      };
    }

    if (platform === "ZOOM") {
      return this.generateZoom(bookingId);
    }

    return this.generateGoogleMeet(bookingId);
  }
}
