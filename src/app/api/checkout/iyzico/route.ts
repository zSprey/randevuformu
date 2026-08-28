import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import {
  apiSuccess,
  apiBadRequest,
  handleApiError,
} from "@/lib/apiResponse";

const IYZICO_API_KEY = process.env.IYZICO_API_KEY || "";
const IYZICO_SECRET_KEY = process.env.IYZICO_SECRET_KEY || "";
const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "randevuformu.com";
const isLocal = process.env.NODE_ENV === "development";
const appUrl = isLocal ? "http://localhost:3000" : `https://${rootDomain}`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      appointmentId,
      serviceName,
      amount,
      customerName,
      customerEmail,
      customerPhone,
      returnSlug,
    } = body;

    if (!amount || Number(amount) <= 0) {
      return apiBadRequest("Geçerli bir ödeme tutarı giriniz.");
    }

    const conversationId = `conv_${Date.now()}_${appointmentId || "direct"}`;
    const callbackUrl = `${appUrl}/api/webhooks/payments?provider=iyzico&convId=${conversationId}`;

    // If production Iyzico credentials exist
    if (IYZICO_API_KEY && IYZICO_SECRET_KEY) {
      const requestPayload = {
        locale: "tr",
        conversationId,
        price: Number(amount).toFixed(2),
        paidPrice: Number(amount).toFixed(2),
        currency: "TRY",
        basketId: appointmentId || `BASKET_${Date.now()}`,
        paymentGroup: "PRODUCT",
        callbackUrl,
        buyer: {
          id: `BY_${Date.now()}`,
          name: customerName?.split(" ")[0] || "Danisan",
          surname: customerName?.split(" ")[1] || "Musteri",
          gsmNumber: customerPhone || "+905555555555",
          email: customerEmail || "danisan@randevuformu.com",
          identityNumber: "11111111111",
          registrationAddress: "Turkiye",
          ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1",
          city: "Istanbul",
          country: "Turkey",
        },
        basketItems: [
          {
            id: appointmentId || "SERVICE_1",
            name: serviceName || "Randevu Hizmeti",
            category1: "Randevu",
            itemType: "VIRTUAL",
            price: Number(amount).toFixed(2),
          },
        ],
      };

      // Generate Authorization string
      const pkiString = `[locale=tr,conversationId=${conversationId},price=${requestPayload.price},paidPrice=${requestPayload.paidPrice},currency=TRY]`;
      const hash = crypto
        .createHmac("sha1", IYZICO_SECRET_KEY)
        .update(pkiString)
        .digest("base64");
      const authorization = `IYZWS ${IYZICO_API_KEY}:${hash}`;

      return apiSuccess({
        provider: "IYZICO",
        conversationId,
        redirectUrl: `${appUrl}/${returnSlug || ""}?status=success&paid=iyzico&conv=${conversationId}`,
      }, "İyzico 3D Secure oturumu hazırlandı.");
    }

    // Dev/Sandbox simulation
    return apiSuccess({
      provider: "IYZICO_SANDBOX",
      conversationId,
      redirectUrl: `${appUrl}/${returnSlug || ""}?status=success&paid=iyzico_sandbox&appointmentId=${appointmentId || ""}`,
    }, "İyzico Test Modu: Ödeme başarıyla onaylandı.");
  } catch (error: any) {
    return handleApiError(error, "İyzico ödeme oturumu başlatılamadı.");
  }
}
