import { NextResponse } from "next/server";
import Stripe from "stripe";
import crypto from "crypto";
import { supabase } from "@/lib/supabase";
import {
  apiSuccess,
  apiUnauthorized,
  apiBadRequest,
  handleApiError,
} from "@/lib/apiResponse";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "";
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "";
const IYZICO_SECRET_KEY = process.env.IYZICO_SECRET_KEY || "";

const stripe =
  STRIPE_SECRET_KEY && !STRIPE_SECRET_KEY.includes("dummy")
    ? new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2023-10-16" as any })
    : null;

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();

    // 1. Stripe Webhook Signature Check
    const stripeSignature = req.headers.get("stripe-signature");
    if (stripeSignature && stripe && STRIPE_WEBHOOK_SECRET) {
      return await handleStripeWebhook(rawBody, stripeSignature);
    }

    // 2. Iyzico Webhook Signature Check
    const iyzicoSignature = req.headers.get("x-iyz-signature");
    if (iyzicoSignature) {
      return await handleIyzicoWebhook(rawBody, iyzicoSignature);
    }

    // 3. Fallback JSON parse for Iyzico callback / sandbox post
    try {
      const jsonBody = JSON.parse(rawBody);
      if (jsonBody && (jsonBody.iyziEventType || jsonBody.paymentId || jsonBody.status)) {
        return await handleIyzicoWebhook(rawBody, "");
      }
    } catch {
      // ignore json parse error
    }

    return apiSuccess({ received: true, note: "Processed webhook default payload" });
  } catch (error: any) {
    return handleApiError(error, "Webhook işleme hatası meydana geldi.");
  }
}

async function handleStripeWebhook(rawBody: string, signature: string): Promise<NextResponse> {
  try {
    if (!stripe) {
      return apiSuccess({ received: true, note: "Stripe SDK not initialized in development." });
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, STRIPE_WEBHOOK_SECRET);
    } catch (sigErr: any) {
      console.error("[Stripe Webhook] Signature mismatch:", sigErr.message);
      return apiBadRequest("Stripe webhook imza doğrulaması başarısız.", { details: sigErr.message });
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const appointmentId = session.metadata?.appointmentId;
        const tenantId = session.metadata?.tenantId;

        console.log(`[Stripe] Checkout completed for appointment: ${appointmentId}`);

        if (appointmentId) {
          // Update appointment payment status in Supabase
          await supabase
            .from("appointments")
            .update({
              payment_status: "PAID",
              stripe_payment_id: session.payment_intent as string,
              status: "CONFIRMED",
            })
            .eq("id", appointmentId);

          // Log notification audit
          if (tenantId) {
            await supabase.from("notification_logs").insert({
              tenant_id: tenantId,
              appointment_id: appointmentId,
              channel: "EMAIL",
              recipient: session.customer_email || "customer",
              message_body: `Stripe online ödeme başarıyla alındı. Tutar: ${(session.amount_total || 0) / 100} TRY`,
              status: "SENT",
            });
          }
        }
        break;
      }
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`[Stripe] Payment intent succeeded: ${paymentIntent.id}`);
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log(`[Stripe] Subscription event: ${subscription.id}`);
        break;
      }
      default:
        console.log(`[Stripe] Unhandled event type: ${event.type}`);
    }

    return apiSuccess({ received: true });
  } catch (error: any) {
    return handleApiError(error, "Stripe webhook hatası.");
  }
}

async function handleIyzicoWebhook(rawBody: string, signature: string): Promise<NextResponse> {
  try {
    if (signature && IYZICO_SECRET_KEY) {
      const expectedSignature = crypto
        .createHmac("sha256", IYZICO_SECRET_KEY)
        .update(rawBody)
        .digest("base64");

      if (signature !== expectedSignature) {
        console.error("[Iyzico Webhook] Signature mismatch");
        return apiUnauthorized("Geçersiz İyzico webhook imzası.");
      }
    }

    const payload = JSON.parse(rawBody);
    const { status, paymentId, basketId, conversationId } = payload;

    if (status === "SUCCESS") {
      console.log(`[Iyzico] Payment successful. PaymentId: ${paymentId}, BasketId: ${basketId}`);

      const targetAppointmentId = basketId || conversationId?.replace("conv_", "").split("_")[1];

      if (targetAppointmentId) {
        await supabase
          .from("appointments")
          .update({
            payment_status: "PAID",
            payment_gateway: "IYZICO",
            status: "CONFIRMED",
          })
          .eq("id", targetAppointmentId);
      }
    }

    return apiSuccess({ status: "success", paymentId });
  } catch (error: any) {
    return handleApiError(error, "İyzico webhook işleme hatası.");
  }
}
