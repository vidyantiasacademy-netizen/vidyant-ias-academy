"use client";

import type { LeadFormType } from "@/lib/validation/schemas";

export interface LeadContext {
  page?: string;
  source?: string;
  campaign?: string;
  course?: string;
  event?: string;
  referrer?: string;
}

export class LeadSubmissionError extends Error {
  constructor(
    message: string,
    readonly kind: "network" | "validation" | "server" | "rate-limit",
  ) {
    super(message);
    this.name = "LeadSubmissionError";
  }
}

/** Reads attribution params that ad platforms append to landing URLs. */
export function readLeadContext(extra: LeadContext = {}): LeadContext {
  if (typeof window === "undefined") return extra;

  const params = new URLSearchParams(window.location.search);
  return {
    page: window.location.pathname,
    source: params.get("utm_source") ?? "website",
    campaign: params.get("utm_campaign") ?? undefined,
    referrer: document.referrer || undefined,
    ...extra,
  };
}

export async function postLead(
  form: LeadFormType,
  data: Record<string, unknown>,
  context: LeadContext = {},
) {
  let response: Response;

  try {
    response = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ form, data, context: readLeadContext(context) }),
    });
  } catch {
    throw new LeadSubmissionError(
      "We couldn't connect right now. Please try again.",
      "network",
    );
  }

  if (response.status === 429) {
    throw new LeadSubmissionError(
      "Too many submissions from this device. Please try again in a few minutes.",
      "rate-limit",
    );
  }

  if (response.status === 422) {
    throw new LeadSubmissionError(
      "Please review the highlighted fields and try again.",
      "validation",
    );
  }

  if (!response.ok) {
    throw new LeadSubmissionError(
      "Something went wrong. Please try again.",
      "server",
    );
  }

  return (await response.json()) as { ok: true; id: string };
}
