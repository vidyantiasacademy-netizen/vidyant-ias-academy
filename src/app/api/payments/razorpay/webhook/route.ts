import { NextResponse } from "next/server";

import { paymentService } from "@/services/payments/payment.service";

/**
 * Razorpay webhook.
 *
 * The authoritative record of whether money arrived. The browser's success
 * callback is a UX convenience; this is what grants the enrollment, so a
 * student whose connection drops after paying still gets their course.
 *
 * Three things this route must get right:
 *
 * 1. Read the body as **text**, before any JSON parsing. The HMAC is computed
 *    over the exact bytes Razorpay sent — `JSON.stringify(await req.json())`
 *    re-serialises them and the signature will never match.
 * 2. Verify before trusting anything, including the event name.
 * 3. Return 200 for events we do not handle. A non-2xx makes Razorpay retry the
 *    same event for hours.
 *
 * Configure at Razorpay Dashboard → Settings → Webhooks:
 *   URL     https://www.vidyantias.com/api/payments/razorpay/webhook
 *   Events  payment.captured, payment.failed, refund.processed
 *   Secret  the value of RAZORPAY_WEBHOOK_SECRET
 */
export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  if (!signature) {
    return NextResponse.json({ ok: false, error: "missing_signature" }, { status: 400 });
  }

  let verified: boolean;

  try {
    verified = paymentService.verifyWebhookSignature(rawBody, signature);
  } catch (error) {
    // Secret not configured. 500 so Razorpay retries once it is.
    console.error("[razorpay] webhook not configured", error);
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 500 });
  }

  if (!verified) {
    console.error("[razorpay] webhook signature mismatch");
    return NextResponse.json({ ok: false, error: "invalid_signature" }, { status: 401 });
  }

  // Razorpay's own event id, used for idempotency. Falls back to a hash of the
  // delivery when the header is absent on older webhook versions.
  const eventId = request.headers.get("x-razorpay-event-id") ?? signature;

  try {
    const event = JSON.parse(rawBody) as Parameters<
      typeof paymentService.handleWebhook
    >[0];

    const { applied } = await paymentService.handleWebhook(event, eventId);

    return NextResponse.json({ ok: true, applied });
  } catch (error) {
    // The signature was valid, so this is our bug, not a forged request. 500
    // asks Razorpay to retry after the fix is deployed.
    console.error("[razorpay] webhook handling failed", error);
    return NextResponse.json({ ok: false, error: "handler_failed" }, { status: 500 });
  }
}
