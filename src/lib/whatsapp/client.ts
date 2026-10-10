import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

import type { Outgoing } from "./types";

/**
 * WhatsApp Cloud API (Meta Graph API): configuration, webhook signatures and
 * sending.
 *
 * Meta Business → WhatsApp → API setup gives the phone number id and the
 * token; App settings → Basic gives the app secret. See `.env.example`.
 */

const GRAPH_VERSION = process.env.WHATSAPP_GRAPH_VERSION || "v23.0";

export function isWhatsAppConfigured(): boolean {
  return Boolean(
    process.env.WHATSAPP_ACCESS_TOKEN &&
      process.env.WHATSAPP_PHONE_NUMBER_ID &&
      process.env.WHATSAPP_APP_SECRET &&
      process.env.WHATSAPP_VERIFY_TOKEN,
  );
}

/** Meta's subscription handshake: `hub.verify_token` must match ours. */
export function verifyToken(token: string | null): boolean {
  const expected = process.env.WHATSAPP_VERIFY_TOKEN;
  if (!expected || !token) return false;

  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(token, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Verifies `X-Hub-Signature-256: sha256=<hex>`, an HMAC of the raw body with
 * the app secret. Without it anyone who finds the URL could write leads and
 * make the bot message arbitrary numbers.
 */
export function verifySignature(rawBody: string, header: string | null): boolean {
  const secret = process.env.WHATSAPP_APP_SECRET;
  if (!secret || !header?.startsWith("sha256=")) return false;

  const expected = createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");

  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(header.slice("sha256=".length), "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}

function toGraphPayload(to: string, message: Outgoing) {
  const base = { messaging_product: "whatsapp", recipient_type: "individual", to };

  switch (message.type) {
    case "text":
      return { ...base, type: "text", text: { body: message.body, preview_url: true } };
    case "buttons":
      return {
        ...base,
        type: "interactive",
        interactive: {
          type: "button",
          body: { text: message.body },
          action: {
            buttons: message.buttons.map((button) => ({ type: "reply", reply: button })),
          },
        },
      };
    case "list":
      return {
        ...base,
        type: "interactive",
        interactive: {
          type: "list",
          body: { text: message.body },
          action: { button: message.button, sections: [{ rows: message.rows }] },
        },
      };
  }
}

/**
 * Sends the replies in order. Each waits for the previous one, because
 * WhatsApp shows messages in the order it accepts them.
 */
export async function sendMessages(to: string, messages: Outgoing[]): Promise<void> {
  if (!isWhatsAppConfigured()) {
    console.warn("[whatsapp] not configured; skipping %d replies", messages.length);
    return;
  }

  const url = `https://graph.facebook.com/${GRAPH_VERSION}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

  for (const message of messages) {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(toGraphPayload(to, message)),
    });

    if (!response.ok) {
      throw new Error(`WhatsApp send failed (${response.status}): ${await response.text()}`);
    }
  }
}
