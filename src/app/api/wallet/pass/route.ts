import { NextRequest } from "next/server";
import { WalletPassGenerator } from "@/lib/integrations/walletPassGenerator";
import { apiSuccess, apiBadRequest, handleApiError } from "@/lib/apiResponse";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { bookingId, customerName, businessName, serviceName, appointmentDate, appointmentTime, venueAddress } = body;

    if (!customerName || !businessName || !serviceName) {
      return apiBadRequest("Danışan, işletme ve hizmet bilgisi zorunludur.");
    }

    const pass = WalletPassGenerator.generatePass({
      bookingId: bookingId || `bk-${Date.now()}`,
      customerName,
      businessName,
      serviceName,
      appointmentDate: appointmentDate || new Date().toISOString().split("T")[0],
      appointmentTime: appointmentTime || "14:00",
      venueAddress,
      latitude: 41.0082,
      longitude: 28.9784,
    });

    return apiSuccess({
      pass,
      downloadFilename: `randevu-${pass.serialNumber}.pkpass`,
      message: "Apple & Google Wallet VIP randevu kartı başarıyla üretildi.",
    });
  } catch (err) {
    return handleApiError(err, "Wallet kartı üretilirken hata oluştu.");
  }
}
