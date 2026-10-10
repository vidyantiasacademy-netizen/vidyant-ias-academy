import "server-only";

import { randomUUID } from "node:crypto";

import { submitLead } from "@/lib/leads/service";
import { LEAD_FORMS } from "@/lib/validation/schemas";
import { enquiryService } from "@/services/enquiries/enquiry.service";
import { whatsappSessionService } from "@/services/whatsapp/session.service";

import { sendMessages } from "./client";
import { INTEREST_LABELS, advance, isRestart } from "./flow";
import type {
  BotInput,
  BotState,
  InboundMessage,
  Outgoing,
  WebhookMessage,
  WebhookPayload,
} from "./types";

/** A chat idle this long starts again at the menu. Matches WhatsApp's free reply window. */
const CONVERSATION_MS = 24 * 60 * 60 * 1000;
/** How long "Talk to a counsellor" keeps the bot quiet. */
const HANDOFF_MS = 24 * 60 * 60 * 1000;

function toInput(message: WebhookMessage): BotInput {
  if (message.type === "text" && message.text?.body) {
    return { kind: "text", text: message.text.body };
  }
  const id = message.interactive?.button_reply?.id ?? message.interactive?.list_reply?.id;
  if (message.type === "interactive" && id) return { kind: "reply", id };
  return { kind: "unsupported" };
}

/** Flattens a webhook delivery into the messages people sent. Status receipts are skipped. */
export function parseWebhook(payload: WebhookPayload): InboundMessage[] {
  if (payload.object !== "whatsapp_business_account") return [];

  return (payload.entry ?? []).flatMap((entry) =>
    (entry.changes ?? []).flatMap((change) => {
      if (change.field !== "messages" || !change.value?.messages) return [];

      const contacts = change.value.contacts ?? [];
      return change.value.messages
        .filter((message) => message.id && message.from)
        .map((message) => ({
          messageId: message.id,
          waId: message.from,
          profileName:
            contacts.find((contact) => contact.wa_id === message.from)?.profile?.name?.trim() ||
            null,
          input: toInput(message),
        }));
    }),
  );
}

/**
 * The enquiry stores Indian numbers as 10 digits, like the website forms; any
 * other country keeps its full international form.
 */
function enquiryPhone(waId: string): string {
  return /^91[6-9]\d{9}$/.test(waId) ? waId.slice(2) : `+${waId}`;
}

function enquiryAnswers(waId: string, state: BotState): Record<string, string> {
  const answers: Record<string, string> = { whatsappId: waId };
  if (state.locale) answers.language = state.locale === "hi" ? "Hindi" : "English";
  if (state.interest) answers.interest = INTEREST_LABELS[state.interest];
  if (state.attempt) answers.attempt = state.attempt;
  if (state.mode) answers.mode = state.mode;
  if (state.preferredTime) answers.preferredTime = state.preferredTime;
  return answers;
}

interface TurnOutput {
  replies: Outgoing[];
  lead: {
    enquiryId: string;
    create: boolean;
    name: string;
    nameConfirmed: boolean;
    answers: Record<string, string>;
    note?: string;
  } | null;
}

/** One message from one person: advance the chat, write the lead, reply. */
export async function handleInbound(message: InboundMessage): Promise<void> {
  const now = Date.now();
  const nowIso = new Date(now).toISOString();

  const output = await whatsappSessionService.runTurn<TurnOutput>(
    message.waId,
    message.messageId,
    (session) => {
      const profileName = message.profileName ?? session?.profileName ?? null;
      const restart = isRestart(message.input);
      const paused = Boolean(session?.pausedUntil && session.pausedUntil > nowIso);

      // A counsellor has the chat: stay out of it unless the person asks for the menu.
      if (session && paused && !restart) {
        return {
          session: { ...session, profileName, lastInboundAt: nowIso },
          output: { replies: [], lead: null },
        };
      }

      const expired = Boolean(session && now - Date.parse(session.lastInboundAt) > CONVERSATION_MS);
      const result = advance(session?.state ?? null, message.input, { profileName, expired });

      // Allocated inside the transaction, so a burst of taps settles on one enquiry.
      const enquiryId = result.lead ? (session?.enquiryId ?? randomUUID()) : (session?.enquiryId ?? null);
      const create = Boolean(result.lead) && !session?.enquiryCreated;

      return {
        session: {
          waId: message.waId,
          profileName,
          state: result.state,
          enquiryId,
          enquiryCreated: session?.enquiryCreated ?? false,
          pausedUntil: result.handoff
            ? new Date(now + HANDOFF_MS).toISOString()
            : restart
              ? null
              : (session?.pausedUntil ?? null),
          lastInboundAt: nowIso,
          recentMessageIds: session?.recentMessageIds ?? [],
        },
        output: {
          replies: result.replies,
          lead:
            result.lead && enquiryId
              ? {
                  enquiryId,
                  create,
                  name: result.state.name ?? profileName ?? "WhatsApp user",
                  nameConfirmed: Boolean(result.state.name),
                  answers: enquiryAnswers(message.waId, result.state),
                  note: result.lead.note,
                }
              : null,
        },
      };
    },
  );

  // Already handled: Meta redelivered the webhook.
  if (!output) return;

  // Reply first: the person is waiting on their phone, the counsellor is not.
  try {
    await sendMessages(message.waId, output.replies);
  } catch (error) {
    console.error("[whatsapp] reply failed", message.waId, error);
  }

  const { lead } = output;
  if (!lead) return;

  try {
    if (lead.create) {
      await submitLead({
        id: lead.enquiryId,
        form: LEAD_FORMS.whatsapp,
        data: { name: lead.name, phone: enquiryPhone(message.waId), ...lead.answers },
        context: { source: "whatsapp" },
      });
      await whatsappSessionService.markEnquiryCreated(message.waId);
    }

    // On the create path too: the enquiry starts with an empty history.
    await enquiryService.syncFromWhatsApp(lead.enquiryId, {
      name: lead.nameConfirmed ? lead.name : undefined,
      answers: lead.answers,
      note: lead.note,
    });
  } catch (error) {
    console.error("[whatsapp] lead write failed", lead.enquiryId, error);
  }
}
