import { NextResponse, after } from "next/server";

import { verifySignature, verifyToken } from "@/lib/whatsapp/client";
import { handleInbound, parseWebhook } from "@/lib/whatsapp/handler";
import type { WebhookPayload } from "@/lib/whatsapp/types";

/**
 * WhatsApp Cloud API webhook — the lead bot's front door.
 *
 * Configure at Meta for Developers → your app → WhatsApp → Configuration:
 *   Callback URL  https://www.vidyantias.com/api/webhooks/whatsapp
 *   Verify token  the value of WHATSAPP_VERIFY_TOKEN
 *   Fields        subscribe to `messages`
 */

/** Subscription handshake: Meta echoes `hub.challenge` back once the token matches. */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;

  if (params.get("hub.mode") !== "subscribe" || !verifyToken(params.get("hub.verify_token"))) {
    return new Response("Forbidden", { status: 403 });
  }

  return new Response(params.get("hub.challenge") ?? "", {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  });
}

export async function POST(request: Request) {
  const rawBody = await request.text();

  if (!verifySignature(rawBody, request.headers.get("x-hub-signature-256"))) {
    return NextResponse.json({ ok: false, error: "invalid_signature" }, { status: 401 });
  }

  let payload: WebhookPayload;
  try {
    payload = JSON.parse(rawBody) as WebhookPayload;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const messages = parseWebhook(payload);

  // Meta wants a 200 within a few seconds or it redelivers, so the work runs
  // after the response. One at a time, so one person's burst stays in order.
  after(async () => {
    for (const message of messages) {
      try {
        await handleInbound(message);
      } catch (error) {
        console.error("[whatsapp] message failed", message.messageId, error);
      }
    }
  });

  return NextResponse.json({ ok: true });
}
