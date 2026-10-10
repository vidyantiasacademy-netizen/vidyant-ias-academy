import "server-only";

import { isAtLeast } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/server";
import { ENQUIRY_STATUS_LABELS } from "@/lib/enquiries/labels";
import { AppError, ERROR_CODES } from "@/lib/errors";
import { COLLECTIONS, docId } from "@/lib/firebase/collections";
import {
  FieldValue,
  Timestamp,
  auditOnCreate,
  auditOnUpdate,
  collection,
  paginate,
  requireEntity,
  toEntity,
} from "@/lib/firebase/firestore";
import type { Lead } from "@/lib/leads/types";
import type {
  Enquiry,
  EnquiryDoc,
  EnquiryStatus,
  IsoDateTime,
  Page,
  PageRequest,
  User,
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

/**
 * Moves the enquiry along the pipeline. Every move is logged, with the
 * counsellor's note when there is one, so the history shows when a lead went
 * cold and not only that it did.
 */
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
      // A closed lead has nothing left to follow up.
      ...(status === "enrolled" || status === "lost" ? { followUpAt: null } : {}),
      activity: FieldValue.arrayUnion({
        at: new Date().toISOString(),
        by: actor.uid,
        note: `Status → ${ENQUIRY_STATUS_LABELS[status]}${note ? `: ${note}` : ""}`,
      }),
      ...auditOnUpdate(actor.uid),
    });
}

/** Sets or clears when the next call is due. */
export async function setFollowUp(
  enquiryId: string,
  followUpAt: IsoDateTime | null,
): Promise<void> {
  const actor = await requireRole("COUNSELLOR");

  await collection(COLLECTIONS.enquiries)
    .doc(enquiryId)
    .update({
      // Written as a Timestamp like every other date, so it reads back as ISO.
      followUpAt: followUpAt ? Timestamp.fromDate(new Date(followUpAt)) : null,
      ...auditOnUpdate(actor.uid),
    });
}

/**
 * A counsellor takes an unowned lead. Inside a transaction, so two counsellors
 * opening the same fresh enquiry cannot both end up thinking they own it.
 * Reassigning someone else's lead stays an admin action (`assign`).
 */
export async function claim(enquiryId: string): Promise<void> {
  const actor = await requireRole("COUNSELLOR");
  const ref = collection(COLLECTIONS.enquiries).doc(enquiryId);

  await ref.firestore.runTransaction(async (transaction) => {
    const enquiry = requireEntity<Enquiry>(await transaction.get(ref), "enquiry");

    if (enquiry.assignedTo === actor.uid) return;
    if (enquiry.assignedTo) {
      throw new AppError(ERROR_CODES.CONFLICT, {
        message: "Another counsellor has already taken this enquiry.",
      });
    }

    transaction.update(ref, { assignedTo: actor.uid, ...auditOnUpdate(actor.uid) });
  });
}

/** Hands the enquiry to a counsellor, or back to the unassigned pool with `null`. */
export async function assign(enquiryId: string, counsellorUid: string | null): Promise<void> {
  const actor = await requireRole("ADMIN");

  if (counsellorUid) {
    const users = collection(COLLECTIONS.users);
    const owner = toEntity<User>(await users.doc(docId.user(counsellorUid)).get());

    if (!owner || !owner.isActive || !isAtLeast(owner.role, "COUNSELLOR")) {
      throw new AppError(ERROR_CODES.VALIDATION_ERROR, {
        message: "Enquiries can only be assigned to an active counsellor or admin.",
      });
    }
  }

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

/**
 * Puts a free mock test result on the visitor's enquiry, so the counsellor who
 * calls sees the score and the weak subjects before dialling.
 *
 * System write, no session: it runs inside the visitor's own submit, which the
 * mock test service has already authorised by their attempt token.
 */
export async function recordMockResult(
  enquiryId: string,
  summary: { testTitle: string; score: number; totalMarks: number; weakSubjects: string[] },
): Promise<void> {
  const weak = summary.weakSubjects.length
    ? ` Weakest: ${summary.weakSubjects.join(", ")}.`
    : "";

  await collection(COLLECTIONS.enquiries)
    .doc(enquiryId)
    .update({
      "answers.mockScore": `${summary.score} / ${summary.totalMarks}`,
      ...(summary.weakSubjects.length
        ? { "answers.mockWeakSubjects": summary.weakSubjects.join(", ") }
        : {}),
      activity: FieldValue.arrayUnion({
        at: new Date().toISOString(),
        by: "system",
        note: `Finished "${summary.testTitle}": ${summary.score} / ${summary.totalMarks}.${weak}`,
      }),
      ...auditOnUpdate("system"),
    });
}

/**
 * Brings a WhatsApp bot enquiry up to date with the chat: the answers so far,
 * the name once the person confirms it, and a history line per menu choice.
 *
 * System write, no session: the WhatsApp webhook has verified Meta's
 * signature before this runs. Answers are written as a full snapshot each
 * time, so a late or repeated call converges on the chat's latest state.
 */
export async function syncFromWhatsApp(
  enquiryId: string,
  update: { name?: string; answers: Record<string, string>; note?: string },
): Promise<void> {
  await collection(COLLECTIONS.enquiries)
    .doc(enquiryId)
    .update({
      ...(update.name ? { name: update.name } : {}),
      ...Object.fromEntries(
        Object.entries(update.answers).map(([key, value]) => [`answers.${key}`, value]),
      ),
      ...(update.note
        ? {
            activity: FieldValue.arrayUnion({
              at: new Date().toISOString(),
              by: "system",
              note: update.note,
            }),
          }
        : {}),
      ...auditOnUpdate("system"),
    });
}

/**
 * Uid → display name for the people who own or wrote on an enquiry.
 *
 * Only staff names come back: a counsellor has no business resolving an
 * arbitrary uid to a student's name, and every author on a call log is staff.
 */
export async function getStaffNames(uids: string[]): Promise<Record<string, string>> {
  await requireRole("COUNSELLOR");

  const unique = [...new Set(uids)].filter((uid) => uid && uid !== "system");
  if (unique.length === 0) return {};

  const users = collection(COLLECTIONS.users);
  const snapshots = await users.firestore.getAll(...unique.map((uid) => users.doc(docId.user(uid))));

  return Object.fromEntries(
    snapshots
      .map((snapshot) => toEntity<User>(snapshot))
      .filter((user): user is User => user !== null && user.role !== "STUDENT")
      .map((user) => [user.uid, user.displayName]),
  );
}

export const enquiryService = {
  createFromLead,
  list,
  getById,
  setStatus,
  setFollowUp,
  claim,
  assign,
  addNote,
  recordMockResult,
  syncFromWhatsApp,
  getStaffNames,
};
