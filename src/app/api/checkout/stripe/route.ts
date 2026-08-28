import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "";
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
      currency = "try",
      customerEmail,
      customerName,
      tenantId,
      returnSlug,
    } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Geçerli bir ödeme tutarı belirtilmelidir." },
        { status: 400 }
      );
    }

    const successRedirect = returnSlug
      ? `${appUrl}/${returnSlug}?status=success&appointmentId=${appointmentId || ""}`
      : `${appUrl}/dashboard?status=paid`;

    const cancelRedirect = returnSlug
      ? `${appUrl}/${returnSlug}?status=cancelled`
      : `${appUrl}/dashboard?status=cancelled`;

    // Stripe SDK initialized if key exists
    if (STRIPE_SECRET_KEY && !STRIPE_SECRET_KEY.includes("dummy")) {
      const stripe = new Stripe(STRIPE_SECRET_KEY, {
        apiVersion: "2023-10-16" as any,
      });

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        customer_email: customerEmail || undefined,
        line_items: [
          {
            price_data: {
              currency: currency.toLowerCase(),
              product_data: {
                name: serviceName || "Randevu Hizmet Bedeli / Kapora",
                description: customerName ? `Danışan: ${customerName}` : undefined,
              },
              unit_amount: Math.round(Number(amount) * 100), // convert to cents/kuruş
            },
            quantity: 1,
          },
        ],
        metadata: {
          appointmentId: appointmentId || "",
          tenantId: tenantId || "",
          customerName: customerName || "",
        },
        success_url: `${successRedirect}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelRedirect,
      });

      return NextResponse.json({
        success: true,
        url: session.url,
        sessionId: session.id,
      });
    }

    // Dev/Preview Fallback Simulation
    return NextResponse.json({
      success: true,
      url: `${successRedirect}&simulated=true`,
      message: "Geliştirme ortamı: Sanal ödeme onaylandı.",
    });
  } catch (error: any) {
    console.error("[Stripe Checkout Error]:", error);
    return NextResponse.json(
      { error: error.message || "Ödeme oturumu başlatılamadı." },
      { status: 500 }
    );
  }
}
