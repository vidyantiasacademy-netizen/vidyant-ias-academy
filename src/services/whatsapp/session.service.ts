import "server-only";

import { requireRole } from "@/lib/auth/server";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { auditOnUpdate, collection } from "@/lib/firebase/firestore";
import type { WhatsAppSessionDoc } from "@/lib/whatsapp/types";
import type { IsoDateTime } from "@/types/db";

/**
 * WhatsApp bot conversations — `whatsappSessions/{waId}`.
 *
 * The webhook writes without a session (Meta's signature is its auth); the
 * pause / resume controls are counsellor actions.
 */

const RECENT_IDS = 20;

/**
 * Runs one inbound message through `turn` inside a transaction, so two
 * messages sent in quick succession cannot both read the same step.
 *
 * `turn` may run more than once on contention and must not do I/O. Returns
 * `null` when the message id was already handled — Meta redelivers a webhook
 * it thinks failed.
 */
export async function runTurn<T>(
  waId: string,
  messageId: string,
  turn: (session: WhatsAppSessionDoc | null) => { session: WhatsAppSessionDoc; output: T },
): Promise<T | null> {
  const ref = collection(COLLECTIONS.whatsappSessions).doc(waId);

  return ref.firestore.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    const current = snapshot.exists ? (snapshot.data() as WhatsAppSessionDoc) : null;

    if (current?.recentMessageIds.includes(messageId)) return null;

    const { session, output } = turn(current);
    transaction.set(ref, {
      ...session,
      recentMessageIds: [...(current?.recentMessageIds ?? []), messageId].slice(-RECENT_IDS),
      ...auditOnUpdate("system"),
    });

    return output;
  });
}

/** The lead pipeline accepted the enquiry; later turns only update it. */
export async function markEnquiryCreated(waId: string): Promise<void> {
  await collection(COLLECTIONS.whatsappSessions).doc(waId).update({ enquiryCreated: true });
}

/** What the lead page shows about the bot for this number, or `null` if it never chatted. */
export async function getStatus(
  waId: string,
): Promise<{ pausedUntil: IsoDateTime | null; lastInboundAt: IsoDateTime } | null> {
  await requireRole("COUNSELLOR");

  const snapshot = await collection(COLLECTIONS.whatsappSessions).doc(waId).get();
  if (!snapshot.exists) return null;

  const session = snapshot.data() as WhatsAppSessionDoc;
  return { pausedUntil: session.pausedUntil, lastInboundAt: session.lastInboundAt };
}

/** A counsellor takes the chat over (`until` in the future) or hands it back (`null`). */
export async function setPaused(waId: string, until: IsoDateTime | null): Promise<void> {
  const actor = await requireRole("COUNSELLOR");

  await collection(COLLECTIONS.whatsappSessions)
    .doc(waId)
    .update({ pausedUntil: until, ...auditOnUpdate(actor.uid) });
}

export const whatsappSessionService = {
  runTurn,
  markEnquiryCreated,
  getStatus,
  setPaused,
};
