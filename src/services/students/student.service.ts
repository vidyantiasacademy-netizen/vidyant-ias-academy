import "server-only";

import { requireRole, requireSelfOrRole } from "@/lib/auth/server";
import { COLLECTIONS, docId } from "@/lib/firebase/collections";
import {
  auditOnCreate,
  auditOnUpdate,
  collection,
  paginate,
  pickFields,
  requireEntity,
  toEntity,
} from "@/lib/firebase/firestore";
import type { Page, PageRequest, Student, StudentDoc } from "@/types/db";

/**
 * Student profiles.
 *
 * Every function authorises before it reads. That is the point of the service
 * layer: a Server Component that calls `studentService.getById(someUid)` cannot
 * accidentally read another student's record, because the check is inside the
 * function rather than in the page that happened to call it.
 */

/** Fields a student may change about themselves. */
const SELF_EDITABLE: readonly (keyof StudentDoc)[] = [
  "fullName",
  "phone",
  "dateOfBirth",
  "city",
  "state",
  "optionalSubject",
  "preparationStage",
  "attemptsGiven",
  "targetExamYear",
];

/** Fields only staff may change — the ones that confer access or assignment. */
const STAFF_EDITABLE: readonly (keyof StudentDoc)[] = [
  ...SELF_EDITABLE,
  "rollNumber",
  "mentorUid",
  "notes",
];

export async function getById(uid: string): Promise<Student | null> {
  await requireSelfOrRole(uid, "MENTOR");

  const snapshot = await collection(COLLECTIONS.students).doc(docId.user(uid)).get();
  return toEntity<Student>(snapshot);
}

export async function updateProfile(
  uid: string,
  patch: Partial<StudentDoc>,
): Promise<Student> {
  const actor = await requireSelfOrRole(uid, "ADMIN");

  const allowed = actor.uid === uid ? SELF_EDITABLE : STAFF_EDITABLE;
  const fields = pickFields(patch, allowed);

  const ref = collection(COLLECTIONS.students).doc(docId.user(uid));

  if (Object.keys(fields).length > 0) {
    await ref.update({ ...fields, ...auditOnUpdate(actor.uid) });
  }

  return requireEntity<Student>(await ref.get(), "student");
}

/** Admin student list, newest first. Backed by the `createdAt` index. */
export async function list(page: PageRequest = {}): Promise<Page<Student>> {
  await requireRole("COUNSELLOR");

  const query = collection(COLLECTIONS.students).orderBy("createdAt", "desc");
  return paginate<StudentDoc>(query, page) as Promise<Page<Student>>;
}

/** The mentor's own caseload. */
export async function listByMentor(mentorUid: string): Promise<Student[]> {
  await requireSelfOrRole(mentorUid, "ADMIN");

  const snapshot = await collection(COLLECTIONS.students)
    .where("mentorUid", "==", mentorUid)
    .orderBy("fullName")
    .get();

  return snapshot.docs
    .map((doc) => toEntity<Student>(doc))
    .filter((student): student is Student => student !== null);
}

/**
 * Creates a profile for a student the institute enrolled offline, before they
 * have ever signed in. Keyed by a generated id until their first sign-in links
 * it to a uid — which is why `uid` is nullable in practice for these records
 * and `rollNumber` is the handle the front desk uses.
 */
export async function createOffline(
  input: Omit<StudentDoc, "uid" | "activeEnrollmentIds" | "mentorUid" | "notes"> & {
    mentorUid?: string | null;
    notes?: string | null;
  },
): Promise<Student> {
  const actor = await requireRole("COUNSELLOR");

  const ref = collection(COLLECTIONS.students).doc();

  await ref.set({
    ...input,
    uid: ref.id,
    activeEnrollmentIds: [],
    mentorUid: input.mentorUid ?? null,
    notes: input.notes ?? null,
    ...auditOnCreate(actor.uid),
  });

  return requireEntity<Student>(await ref.get(), "student");
}

/**
 * Finds students who have signed in, by email, mobile number or roll number —
 * what the front desk has in hand when someone pays at the counter.
 *
 * Only signed-in students are found on purpose. Access checks go by the Firebase
 * Auth uid, and a profile made by `createOffline` has a generated id that no
 * sign-in is linked to yet, so enrolling one would grant access to nobody.
 */
export async function findByContact(query: string): Promise<Student[]> {
  await requireRole("COUNSELLOR");

  const value = query.trim();
  if (!value) return [];

  const lookups: [keyof StudentDoc, string][] = [];

  if (value.includes("@")) {
    lookups.push(["email", value], ["email", value.toLowerCase()]);
  } else {
    const digits = value.replace(/\D/g, "");
    // Stored as the bare 10-digit number; accept +91 or a leading 0 as typed.
    if (digits.length >= 10) lookups.push(["phone", digits.slice(-10)]);
    lookups.push(["rollNumber", value.toUpperCase()]);
  }

  const snapshots = await Promise.all(
    lookups.map(([field, needle]) =>
      collection(COLLECTIONS.students).where(field, "==", needle).limit(10).get(),
    ),
  );

  const byId = new Map<string, Student>();
  for (const doc of snapshots.flatMap((snapshot) => snapshot.docs)) {
    const student = toEntity<Student>(doc);
    if (student && student.id === student.uid) byId.set(student.id, student);
  }

  // Signed in means a `users` document under the same id.
  const users = byId.size
    ? await collection(COLLECTIONS.users).firestore.getAll(
        ...[...byId.keys()].map((uid) => collection(COLLECTIONS.users).doc(docId.user(uid))),
      )
    : [];

  return users.filter((user) => user.exists).map((user) => byId.get(user.id)!);
}

/** Several students by uid, for a roster. Missing ids are skipped. */
export async function getMany(uids: string[]): Promise<Student[]> {
  await requireRole("COUNSELLOR");

  if (uids.length === 0) return [];

  const snapshots = await collection(COLLECTIONS.students).firestore.getAll(
    ...uids.map((uid) => collection(COLLECTIONS.students).doc(docId.user(uid))),
  );

  return snapshots
    .map((snapshot) => toEntity<Student>(snapshot))
    .filter((student): student is Student => student !== null);
}

export const studentService = {
  getById,
  updateProfile,
  list,
  listByMentor,
  createOffline,
  findByContact,
  getMany,
};
