import "server-only";

import { isAdminConfigured } from "@/lib/firebase/admin";

import type { LeadSink } from "./types";

/**
 * Writes every website lead into the `enquiries` collection, so the admin CRM
 * and the public forms share one record.
 *
 * The service is imported lazily inside `deliver` rather than at module scope:
 * `lib/leads/service.ts` is loaded on every lead submission, and a top-level
 * import would pull the whole Admin SDK into that request even when Firebase is
 * not configured.
 */
export const firestoreSink: LeadSink = {
  name: "firestore",
  async deliver(lead) {
    if (!isAdminConfigured()) return;

    const { enquiryService } = await import("@/services/enquiries/enquiry.service");
    await enquiryService.createFromLead(lead);
  },
};
