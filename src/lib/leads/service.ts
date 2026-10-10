import { randomUUID } from "node:crypto";

import type { LeadFormType } from "@/lib/validation/schemas";

import { firestoreSink } from "./firestore-sink";
import type { Lead, LeadSink } from "./types";

/**
 * CRM-agnostic lead pipeline.
 *
 * Two sinks today: the server console, and Firestore's `enquiries` collection
 * (which no-ops when Firebase Admin is not configured). When LeadSquared / Zoho
 * / HubSpot credentials arrive, add a sink module that implements `LeadSink` and
 * register it in `resolveSinks()` — no form or route changes required.
 *
 * `submitLead` only fails when *every* sink fails, so a Firebase outage still
 * leaves the lead in the server log rather than losing the enquiry.
 */

const consoleSink: LeadSink = {
  name: "console",
  async deliver(lead) {
    console.info(
      `[lead:${lead.form}] ${lead.id} ${lead.name} ${lead.phone} (${lead.source})`,
    );
  },
};

function resolveSinks(): LeadSink[] {
  // TODO(integration): push external CRM sinks here once credentials are provisioned.
  return [consoleSink, firestoreSink];
}

interface CreateLeadInput {
  /** Supplied when the caller must know the id up front (the WhatsApp bot). */
  id?: string;
  form: LeadFormType;
  data: Record<string, unknown>;
  context: {
    page?: string;
    source?: string;
    campaign?: string;
    course?: string;
    event?: string;
    referrer?: string;
  };
}

export function buildLead({ id, form, data, context }: CreateLeadInput): Lead {
  const { name, phone, email, ...rest } = data as {
    name: string;
    phone: string;
    email?: string;
    [key: string]: unknown;
  };

  // The honeypot value is a spam signal, never part of the lead record.
  const answers: Record<string, unknown> = { ...rest };
  delete answers.honeypot;

  return {
    id: id ?? randomUUID(),
    form,
    name,
    phone,
    email: email || undefined,
    source: context.source ?? "website",
    campaign: context.campaign,
    course: context.course ?? (answers.course as string | undefined),
    event: context.event ?? (answers.eventId as string | undefined),
    page: context.page,
    referrer: context.referrer,
    answers,
    timestamp: new Date().toISOString(),
  };
}

export async function submitLead(input: CreateLeadInput): Promise<Lead> {
  const lead = buildLead(input);

  const results = await Promise.allSettled(
    resolveSinks().map((sink) => sink.deliver(lead)),
  );

  const failed = results.filter((result) => result.status === "rejected");
  if (failed.length > 0 && failed.length === results.length) {
    throw new Error("All lead sinks failed");
  }

  return lead;
}
