import type { Locale } from "@/i18n/config";
import type { IsoDateTime } from "@/types/db";

/**
 * Types shared by the WhatsApp lead bot: what Meta sends us, what we send
 * back, and the conversation state kept per WhatsApp number.
 */

// ------------------------------------------------------------------ inbound

/** The subset of a Cloud API webhook payload the bot reads. */
export interface WebhookPayload {
  object?: string;
  entry?: {
    changes?: {
      field?: string;
      value?: {
        contacts?: { wa_id?: string; profile?: { name?: string } }[];
        messages?: WebhookMessage[];
      };
    }[];
  }[];
}

export interface WebhookMessage {
  id: string;
  from: string;
  type: string;
  text?: { body?: string };
  interactive?: {
    type?: string;
    button_reply?: { id?: string };
    list_reply?: { id?: string };
  };
}

/** One inbound message, flattened to what the bot needs. */
export interface InboundMessage {
  messageId: string;
  /** The sender's number as WhatsApp reports it: country code, no `+`. */
  waId: string;
  profileName: string | null;
  input: BotInput;
}

/** What the person did: tapped one of our options, typed text, or sent something else. */
export type BotInput =
  | { kind: "reply"; id: string }
  | { kind: "text"; text: string }
  | { kind: "unsupported" };

// ----------------------------------------------------------------- outbound

/**
 * A message the bot sends. Meta's limits are enforced where the copy is
 * written: at most 3 buttons of 20 characters, at most 10 list rows with
 * 24-character titles, and a list button label of 20 characters.
 */
export type Outgoing =
  | { type: "text"; body: string }
  | { type: "buttons"; body: string; buttons: { id: string; title: string }[] }
  | {
      type: "list";
      body: string;
      button: string;
      rows: { id: string; title: string; description?: string }[];
    };

// -------------------------------------------------------------------- state

export const BOT_STEPS = [
  "language",
  "menu",
  "attempt",
  "mode",
  "name-confirm",
  "name-input",
  "slot",
  "done",
] as const;

export type BotStep = (typeof BOT_STEPS)[number];

export type Interest = "courses" | "fees" | "counselling" | "mock" | "human";

/** The conversation itself — everything the flow reads and writes. */
export interface BotState {
  locale: Locale | null;
  step: BotStep;
  interest: Interest | null;
  /** Stored as the website forms store them, so counsellors read one vocabulary. */
  attempt: string | null;
  mode: string | null;
  preferredTime: string | null;
  /** The name the person confirmed or typed; `null` until they do. */
  name: string | null;
}

/** `whatsappSessions/{waId}` — one document per WhatsApp number. */
export interface WhatsAppSessionDoc {
  waId: string;
  profileName: string | null;
  state: BotState;
  /** The enquiry this number's answers are written to. Allocated once, reused. */
  enquiryId: string | null;
  /** False between allocating `enquiryId` and the lead pipeline accepting it. */
  enquiryCreated: boolean;
  /** While in the future, the bot stays silent so a counsellor can talk. */
  pausedUntil: IsoDateTime | null;
  lastInboundAt: IsoDateTime;
  /** Meta retries webhooks; the last few message ids make a retry a no-op. */
  recentMessageIds: string[];
}
