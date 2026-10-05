import "server-only";

import { requireRole } from "@/lib/auth/server";
import { COLLECTIONS } from "@/lib/firebase/collections";
import {
  FieldValue,
  auditOnCreate,
  auditOnUpdate,
  collection,
  paginate,
  requireEntity,
} from "@/lib/firebase/firestore";
import type { Lead } from "@/lib/leads/types";
import type {
  Enquiry,
  EnquiryDoc,
  EnquiryStatus,
  Page,
  PageRequest,
} from "@/types/db";

/**
 * Enquiries — the CRM side of the public forms.
 *
 * `createFromLead` is called by the Firestore lead sink, which runs inside the
 * public `POST /api/leads` request. There is no session on that request (the
 * person filling the form is a visitor, not a user), so it takes no role check —
 * the rate limiter, honeypot and Zod schema in the existing lead pipeline are
 * what protect it, and the `enquiries` collection is closed to all client reads
 * and writes in `firestore.rules`.
 */

/** Visitor-facing write. No authentication, by design. */
export async function createFromLead(lead: Lead): Promise<string> {
  const doc: EnquiryDoc = {
    form: lead.form,
    name: lead.name,
    phone: lead.phone,
    email: lead.email ?? null,
    source: lead.source,
    campaign: lead.campaign ?? null,
    courseId: null,
    page: lead.page ?? null,
    status: "new",
    assignedTo: null,
    followUpAt: null,
    answers: {
      ...lead.answers,
      // The public forms identify a course by slug; an admin links the id later.
      ...(lead.course ? { courseSlug: lead.course } : {}),
      ...(lead.event ? { eventId: lead.event } : {}),
      ...(lead.referrer ? { referrer: lead.referrer } : {}),
    },
    activity: [],
    convertedStudentUid: null,
  };

  // The lead id is already a UUID, so reusing it makes a retried submit
  // idempotent instead of creating a duplicate enquiry.
  const ref = collection(COLLECTIONS.enquiries).doc(lead.id);
  await ref.set({ ...doc, ...auditOnCreate("system") });

  return ref.id;
}

export async function list(
  filters: { status?: EnquiryStatus; assignedTo?: string } = {},
  page: PageRequest = {},
): Promise<Page<Enquiry>> {
  await requireRole("COUNSELLOR");

  let query = collection(COLLECTIONS.enquiries).orderBy("createdAt", "desc");

  if (filters.status) query = query.where("status", "==", filters.status);
  if (filters.assignedTo) query = query.where("assignedTo", "==", filters.assignedTo);

  return paginate<EnquiryDoc>(query, page) as Promise<Page<Enquiry>>;
}

export async function getById(enquiryId: string): Promise<Enquiry> {
  await requireRole("COUNSELLOR");

  return requireEntity<Enquiry>(
    await collection(COLLECTIONS.enquiries).doc(enquiryId).get(),
    "enquiry",
  );
}

export async function setStatus(
  enquiryId: string,
  status: EnquiryStatus,
  note?: string,
): Promise<void> {
  const actor = await requireRole("COUNSELLOR");

  await collection(COLLECTIONS.enquiries)
    .doc(enquiryId)
    .update({
      status,
      ...(note
        ? {
            activity: FieldValue.arrayUnion({
              at: new Date().toISOString(),
              by: actor.uid,
              note,
            }),
          }
        : {}),
      ...auditOnUpdate(actor.uid),
    });
}

export async function assign(enquiryId: string, counsellorUid: string): Promise<void> {
  const actor = await requireRole("ADMIN");

  await collection(COLLECTIONS.enquiries)
    .doc(enquiryId)
    .update({ assignedTo: counsellorUid, ...auditOnUpdate(actor.uid) });
}

/** Records the call outcome. Append-only, so the follow-up history survives. */
export async function addNote(enquiryId: string, note: string): Promise<void> {
  const actor = await requireRole("COUNSELLOR");

  await collection(COLLECTIONS.enquiries)
    .doc(enquiryId)
    .update({
      activity: FieldValue.arrayUnion({
        at: new Date().toISOString(),
        by: actor.uid,
        note,
      }),
      ...auditOnUpdate(actor.uid),
    });
}

export const enquiryService = {
  createFromLead,
  list,
  getById,
  setStatus,
  assign,
  addNote,
};
