import type { LeadFormType } from "@/lib/validation/schemas";

/** Normalised lead record — the shape any future CRM adapter receives. */
export interface Lead {
  id: string;
  form: LeadFormType;
  name: string;
  phone: string;
  /** Optional: the callback form asks only for a name, a number and a slot. */
  email?: string;
  /** Traffic source, e.g. "organic", "google-ads". */
  source: string;
  campaign?: string;
  course?: string;
  event?: string;
  /** Page the form was submitted from. */
  page?: string;
  referrer?: string;
  /** Remaining form-specific answers. */
  answers: Record<string, unknown>;
  timestamp: string;
}

export interface LeadSink {
  readonly name: string;
  deliver(lead: Lead): Promise<void>;
}
