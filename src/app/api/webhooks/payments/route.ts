import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import crypto from 'crypto';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';
const IYZICO_SECRET_KEY = process.env.IYZICO_SECRET_KEY || '';

// Initialize Stripe
const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16' as any, // specify suitable version
});

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    
    // Check for Stripe Signature
    const stripeSignature = req.headers.get('stripe-signature');
    if (stripeSignature) {
      return await handleStripeWebhook(rawBody, stripeSignature);
    }
    
    // Check for Iyzico Signature
    const iyzicoSignature = req.headers.get('x-iyz-signature');
    if (iyzicoSignature) {
      return await handleIyzicoWebhook(rawBody, iyzicoSignature);
    }
    
    // Fallback if Iyzico does not send header but IP or body check is needed
    try {
      const jsonBody = JSON.parse(rawBody);
      // 'iyziEventType' or specific Iyzico properties
      if (jsonBody && (jsonBody.iyziEventType || jsonBody.paymentId)) {
        return await handleIyzicoWebhook(rawBody, '');
      }
    } catch (e) {
      // ignore JSON parse error for fallback
    }

    return NextResponse.json({ error: 'Unknown webhook provider or missing signature' }, { status: 400 });
  } catch (error: any) {
    console.error('[Webhook] General Error:', error);
    return NextResponse.json({ error: 'Webhook processing failed', details: error.message }, { status: 500 });
  }
}

async function handleStripeWebhook(rawBody: string, signature: string) {
  try {
    const event = stripe.webhooks.constructEvent(rawBody, signature, STRIPE_WEBHOOK_SECRET);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log(`[Stripe] Checkout session completed: ${session.id}`);
        // TODO: Update order status to paid, fulfill order, etc.
        // e.g., await updateOrderStatus(session.metadata.orderId, 'PAID');
        break;
      }
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`[Stripe] Payment intent succeeded: ${paymentIntent.id}`);
        break;
      }
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.error(`[Stripe] Payment failed: ${paymentIntent.id}`);
        // TODO: Handle failed payment, notify user
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log(`[Stripe] Subscription deleted: ${subscription.id}`);
        // TODO: Revoke user access
        break;
      }
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log(`[Stripe] Subscription updated: ${subscription.id}`);
        // TODO: Update subscription status in DB
        break;
      }
      default:
        console.log(`[Stripe] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error('[Stripe] Webhook signature verification failed:', error.message);
    return NextResponse.json({ error: 'Stripe signature verification failed' }, { status: 400 });
  }
}

async function handleIyzicoWebhook(rawBody: string, signature: string) {
  try {
    // Basic signature validation for Iyzico
    // Production Iyzico integration typically requires calculating HMAC SHA256 of the payload + secret key
    if (signature && IYZICO_SECRET_KEY) {
      const expectedSignature = crypto
        .createHmac('sha256', IYZICO_SECRET_KEY)
        .update(rawBody)
        .digest('base64');
        
      if (signature !== expectedSignature) {
        console.error('[Iyzico] Signature mismatch');
        return NextResponse.json({ error: 'Invalid Iyzico signature' }, { status: 401 });
      }
    }

    const payload = JSON.parse(rawBody);
    const { status, paymentId, conversationId } = payload;

    if (status === 'SUCCESS') {
      console.log(`[Iyzico] Payment successful. PaymentId: ${paymentId}, ConversationId: ${conversationId}`);
      // TODO: Fulfill order, update DB record matching the conversationId or paymentId
      // e.g., await completeOrder(conversationId);
    } else {
      console.error(`[Iyzico] Payment failed. PaymentId: ${paymentId}, Error: ${payload.errorMessage}`);
      // TODO: Handle failure, update DB
    }

    // Iyzico expects a 200 OK response to acknowledge receipt
    return NextResponse.json({ status: 'success' }, { status: 200 });
  } catch (error: any) {
    console.error('[Iyzico] Webhook processing failed:', error.message);
    return NextResponse.json({ error: 'Iyzico webhook failed' }, { status: 400 });
  }
}
