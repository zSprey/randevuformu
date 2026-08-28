import crypto from "crypto";

export interface WalletPassPayload {
  passType: "APPLE_WALLET" | "GOOGLE_WALLET";
  serialNumber: string;
  authenticationToken: string;
  organizationName: string;
  description: string;
  backgroundColor: string; // e.g. #0B0F19 (Dark Luxury)
  foregroundColor: string; // e.g. #FFFFFF
  labelColor: string; // e.g. #6366F1 (Indigo)
  fields: {
    primary: { label: string; value: string };
    secondary: { label: string; value: string }[];
    auxiliary: { label: string; value: string }[];
    backFields: { label: string; value: string }[];
  };
  barcode: {
    format: "PKBarcodeFormatQR";
    message: string;
    messageEncoding: "iso-8859-1";
    altText: string;
  };
  relevantDate: string; // ISO 8601
  locations?: {
    latitude: number;
    longitude: number;
    relevantText: string;
  }[];
}

export class WalletPassGenerator {
  /**
   * Generates a dark luxury Apple / Google Wallet pass payload
   */
  public static generatePass(options: {
    bookingId: string;
    customerName: string;
    businessName: string;
    serviceName: string;
    appointmentDate: string; // YYYY-MM-DD
    appointmentTime: string; // HH:mm
    venueAddress?: string;
    latitude?: number;
    longitude?: number;
  }): WalletPassPayload {
    const serialNumber = `RF-PASS-${crypto.createHash("md5").update(options.bookingId).digest("hex").slice(0, 10).toUpperCase()}`;
    const relevantDate = `${options.appointmentDate}T${options.appointmentTime}:00+03:00`;
    const checkinUrl = `https://randevuformu.com/checkin/${options.bookingId}`;

    return {
      passType: "APPLE_WALLET",
      serialNumber,
      authenticationToken: crypto.randomBytes(16).toString("hex"),
      organizationName: options.businessName,
      description: `${options.businessName} VIP Randevu Kartı`,
      backgroundColor: "#070B12",
      foregroundColor: "#FFFFFF",
      labelColor: "#818CF8",
      fields: {
        primary: {
          label: "HİZMET",
          value: options.serviceName,
        },
        secondary: [
          {
            label: "DANIŞAN",
            value: options.customerName,
          },
          {
            label: "TARİH & SAAT",
            value: `${options.appointmentDate} - ${options.appointmentTime}`,
          },
        ],
        auxiliary: [
          {
            label: "İŞLETME",
            value: options.businessName,
          },
          {
            label: "GÜVENCE",
            value: "256-Bit SSL VIP",
          },
        ],
        backFields: [
          {
            label: "RANDEVU KURALLARI",
            value: "Lütfen randevu saatinizden 5 dakika önce adreste hazır bulununuz. İptal ve erteleme işlemleri 24 saat öncesine kadar kesintisiz yapılabilir.",
          },
          {
            label: "İLETİŞİM & DESTEK",
            value: "randevuformuu@gmail.com | randevuformu.com",
          },
          {
            label: "ADRES",
            value: options.venueAddress || "Klinik Merkez Binası, Kat 3",
          },
        ],
      },
      barcode: {
        format: "PKBarcodeFormatQR",
        message: checkinUrl,
        messageEncoding: "iso-8859-1",
        altText: serialNumber,
      },
      relevantDate,
      locations: options.latitude && options.longitude ? [
        {
          latitude: options.latitude,
          longitude: options.longitude,
          relevantText: `${options.businessName} Randevunuza Hoş Geldiniz!`,
        },
      ] : undefined,
    };
  }
}
