import "server-only";

import { cache } from "react";

import { requireRole, requireSelfOrRole } from "@/lib/auth/server";
import { COLLECTIONS, docId } from "@/lib/firebase/collections";
import {
  FieldValue,
  auditOnCreate,
  auditOnUpdate,
  collection,
  paginate,
  requireEntity,
  toEntities,
  toEntity,
} from "@/lib/firebase/firestore";
import type {
  Enrollment,
  EnrollmentDoc,
  EnrollmentStatus,
  Page,
  PageRequest,
} from "@/types/db";

/**
 * Enrollments — the access grant.
 *
 * This is the collection every other access check goes through, so it is also
 * the one students may never write. `status` is the switch between "has paid"
 * and "has not", and the only writers are this service (behind a staff role
 * check) and the Razorpay webhook.
 */

/**
 * The hot path: is this student allowed into this course right now?
 *
 * Memoised per render pass, because a page that lists ten lessons would
 * otherwise ask the same question ten times. The deterministic document id
 * makes it a single document read rather than a query.
 */
export const hasAccess = cache(
  async (studentUid: string, courseId: string): Promise<boolean> => {
    const snapshot = await collection(COLLECTIONS.enrollments)
      .doc(docId.enrollment(studentUid, courseId))
      .get();

    if (!snapshot.exists) return false;

    const data = snapshot.data() as EnrollmentDoc;
    if (data.status !== "active") return false;

    // An expired window is not access, even while the status still says active:
    // the nightly expiry job may not have run yet.
    if (data.endsAt && data.endsAt < new Date().toISOString().slice(0, 10)) {
      return false;
    }

    return true;
  },
);

export async function listForStudent(studentUid: string): Promise<Enrollment[]> {
  await requireSelfOrRole(studentUid, "MENTOR");

  const snapshot = await collection(COLLECTIONS.enrollments)
    .where("studentUid", "==", studentUid)
    .orderBy("createdAt", "desc")
    .get();

  return toEntities<EnrollmentDoc>(snapshot.docs) as Enrollment[];
}

export async function listForCourse(
  courseId: string,
  page: PageRequest = {},
): Promise<Page<Enrollment>> {
  await requireRole("COUNSELLOR");

  const query = collection(COLLECTIONS.enrollments)
    .where("courseId", "==", courseId)
    .orderBy("createdAt", "desc");

  return paginate<EnrollmentDoc>(query, page) as Promise<Page<Enrollment>>;
}

/** One student's enrollment in one course, any status, for the enrolment desk. */
export async function getForStudentInCourse(
  studentUid: string,
  courseId: string,
): Promise<Enrollment | null> {
  await requireRole("COUNSELLOR");

  const snapshot = await collection(COLLECTIONS.enrollments)
    .doc(docId.enrollment(studentUid, courseId))
    .get();

  return toEntity<Enrollment>(snapshot);
}

export interface GrantInput {
  studentUid: string;
  courseId: string;
  batchId?: string | null;
  startsAt: string;
  endsAt?: string | null;
  paymentId?: string | null;
}

/**
 * Creates or reactivates an enrollment and keeps the denormalised counters in
 * step, in one transaction. Without the transaction, two counsellors enrolling
 * at once would both read the same `seatsFilled` and one increment would vanish.
 *
 * `actorUid` is passed explicitly rather than read from the session because the
 * payment webhook calls this with no session at all — see `grantFromPayment`.
 */
async function grant(
  input: GrantInput,
  actorUid: string | "system",
  status: EnrollmentStatus,
): Promise<Enrollment> {
  const db = collection(COLLECTIONS.enrollments).firestore;
  const ref = collection(COLLECTIONS.enrollments).doc(
    docId.enrollment(input.studentUid, input.courseId),
  );

  await db.runTransaction(async (tx) => {
    const existing = await tx.get(ref);

    const doc: EnrollmentDoc = {
      studentUid: input.studentUid,
      courseId: input.courseId,
      batchId: input.batchId ?? null,
      status,
      startsAt: input.startsAt,
      endsAt: input.endsAt ?? null,
      paymentId: input.paymentId ?? null,
      enrolledOfflineBy: input.paymentId ? null : actorUid === "system" ? null : actorUid,
    };

    if (existing.exists) {
      tx.update(ref, { ...doc, ...auditOnUpdate(actorUid) });
    } else {
      tx.set(ref, { ...doc, ...auditOnCreate(actorUid) });

      tx.update(collection(COLLECTIONS.courses).doc(input.courseId), {
        "stats.enrolledCount": FieldValue.increment(1),
      });

      if (input.batchId) {
        tx.update(collection(COLLECTIONS.batches).doc(input.batchId), {
          seatsFilled: FieldValue.increment(1),
        });
      }
    }

    if (status === "active") {
      tx.update(collection(COLLECTIONS.students).doc(docId.user(input.studentUid)), {
        activeEnrollmentIds: FieldValue.arrayUnion(ref.id),
      });
    }
  });

  return requireEntity<Enrollment>(await ref.get(), "enrollment");
}

/** Offline enrollment: cash, cheque, scholarship. Staff only. */
export async function enrollOffline(input: GrantInput): Promise<Enrollment> {
  const actor = await requireRole("COUNSELLOR");
  return grant(input, actor.uid, "active");
}

/**
 * Called by the Razorpay webhook after a verified capture. No session exists on
 * a webhook request, so this is the one entry point with no role check — which
 * is why it is not exported from the barrel and the route handler that calls it
 * verifies the HMAC signature first.
 */
export async function grantFromPayment(input: GrantInput): Promise<Enrollment> {
  return grant(input, "system", "active");
}

export async function setStatus(
  enrollmentId: string,
  status: EnrollmentStatus,
): Promise<void> {
  const actor = await requireRole("ADMIN");

  const ref = collection(COLLECTIONS.enrollments).doc(enrollmentId);
  const enrollment = requireEntity<Enrollment>(await ref.get(), "enrollment");

  await ref.update({ status, ...auditOnUpdate(actor.uid) });

  const studentRef = collection(COLLECTIONS.students).doc(
    docId.user(enrollment.studentUid),
  );

  await studentRef.update({
    activeEnrollmentIds:
      status === "active"
        ? FieldValue.arrayUnion(enrollmentId)
        : FieldValue.arrayRemove(enrollmentId),
  });
}

export const enrollmentService = {
  hasAccess,
  listForStudent,
  listForCourse,
  getForStudentInCourse,
  enrollOffline,
  setStatus,
};
