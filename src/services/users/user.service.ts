import "server-only";

import { canAssignRole } from "@/lib/auth/roles";
import { requireAuth, requireRole, requireSelfOrRole } from "@/lib/auth/server";
import { AppError, ERROR_CODES } from "@/lib/errors";
import { getAdminAuth } from "@/lib/firebase/admin";
import { COLLECTIONS, docId } from "@/lib/firebase/collections";
import {
  FieldValue,
  auditOnCreate,
  auditOnUpdate,
  collection,
  pickFields,
  requireEntity,
  toEntity,
} from "@/lib/firebase/firestore";
import type { Role, Student, StudentDoc, User, UserDoc } from "@/types/db";

/**
 * Accounts and roles.
 *
 * `users/{uid}` is the source of truth for a role; the Firebase Auth custom
 * claim is a copy that Security Rules and the session cookie can read without a
 * document lookup. `setRole()` is the only writer of either, and it writes both
 * — a role that exists in one place and not the other is a silent
 * privilege bug.
 */

/**
 * Called by `POST /api/auth/session` on first sign-in.
 *
 * Creating these documents server-side is what keeps roles honest: a client
 * that wrote its own `users/{uid}` would pick its own role, so the rules forbid
 * creating that document from the browser at all. Everyone starts as STUDENT;
 * staff are promoted by an admin afterwards.
 */
export async function ensureUserDocuments(uid: string): Promise<User> {
  const auth = getAdminAuth();
  const record = await auth.getUser(uid);

  const userRef = collection(COLLECTIONS.users).doc(docId.user(uid));
  const existing = await userRef.get();

  if (existing.exists) {
    await userRef.update({
      lastLoginAt: FieldValue.serverTimestamp(),
      ...auditOnUpdate(uid),
    });

    return requireEntity<User>(await userRef.get(), "user");
  }

  const displayName = record.displayName ?? record.email?.split("@")[0] ?? "Student";

  const doc: UserDoc = {
    uid,
    role: "STUDENT",
    email: record.email ?? null,
    phone: normalisePhone(record.phoneNumber),
    displayName,
    photoPath: null,
    isActive: true,
    lastLoginAt: null,
  };

  await userRef.set({
    ...doc,
    lastLoginAt: FieldValue.serverTimestamp(),
    ...auditOnCreate(uid),
  });

  // The claim has to exist from the first request, or the first Firestore read
  // the browser makes is denied by rules that expect `request.auth.token.role`.
  await auth.setCustomUserClaims(uid, { role: "STUDENT", active: true });

  const studentRef = collection(COLLECTIONS.students).doc(docId.user(uid));

  if (!(await studentRef.get()).exists) {
    const student: StudentDoc = {
      uid,
      rollNumber: null,
      fullName: displayName,
      phone: normalisePhone(record.phoneNumber) ?? "",
      email: record.email ?? null,
      dateOfBirth: null,
      city: null,
      state: null,
      optionalSubject: null,
      preparationStage: null,
      attemptsGiven: 0,
      targetExamYear: null,
      activeEnrollmentIds: [],
      mentorUid: null,
      notes: null,
    };

    await studentRef.set({ ...student, ...auditOnCreate(uid) });
  }

  return requireEntity<User>(await userRef.get(), "user");
}

/** Firebase stores `+919876543210`; the rest of the app stores `9876543210`. */
function normalisePhone(phoneNumber: string | undefined): string | null {
  if (!phoneNumber) return null;
  return phoneNumber.replace(/^\+91/, "").replace(/\D/g, "").slice(-10) || null;
}

export async function getById(uid: string): Promise<User | null> {
  await requireSelfOrRole(uid, "COUNSELLOR");

  const snapshot = await collection(COLLECTIONS.users).doc(docId.user(uid)).get();
  return toEntity<User>(snapshot);
}

const SELF_EDITABLE: readonly (keyof UserDoc)[] = ["displayName", "phone", "photoPath"];

export async function updateProfile(
  uid: string,
  patch: Partial<UserDoc>,
): Promise<void> {
  const actor = await requireSelfOrRole(uid, "ADMIN");
  const fields = pickFields(patch, SELF_EDITABLE);

  if (Object.keys(fields).length === 0) return;

  await collection(COLLECTIONS.users)
    .doc(docId.user(uid))
    .update({ ...fields, ...auditOnUpdate(actor.uid) });
}

/**
 * Changes a role, in both places, then forces a token refresh.
 *
 * Revoking refresh tokens is the part that is easy to forget: custom claims are
 * baked into an ID token for up to an hour, so a demotion without revocation
 * leaves the old privileges live for that long.
 */
export async function setRole(uid: string, role: Role): Promise<void> {
  const actor = await requireRole("ADMIN");

  if (!canAssignRole(actor.role, role)) {
    throw new AppError(ERROR_CODES.FORBIDDEN, {
      message: "You cannot assign that role.",
      cause: new Error(`${actor.role} may not assign ${role}`),
    });
  }

  if (uid === actor.uid) {
    throw new AppError(ERROR_CODES.FORBIDDEN, {
      message: "You cannot change your own role.",
    });
  }

  const auth = getAdminAuth();
  const userRef = collection(COLLECTIONS.users).doc(docId.user(uid));
  const user = requireEntity<User>(await userRef.get(), "user");

  await userRef.update({ role, ...auditOnUpdate(actor.uid) });
  await auth.setCustomUserClaims(uid, { role, active: user.isActive });
  await auth.revokeRefreshTokens(uid);
}

/** Deactivates without deleting, so results and payments keep their owner. */
export async function setActive(uid: string, isActive: boolean): Promise<void> {
  const actor = await requireRole("ADMIN");

  const userRef = collection(COLLECTIONS.users).doc(docId.user(uid));
  const user = requireEntity<User>(await userRef.get(), "user");

  const auth = getAdminAuth();

  await userRef.update({ isActive, ...auditOnUpdate(actor.uid) });
  await auth.setCustomUserClaims(uid, { role: user.role, active: isActive });
  await auth.updateUser(uid, { disabled: !isActive });
  await auth.revokeRefreshTokens(uid);
}

export async function listStaff(): Promise<User[]> {
  await requireRole("ADMIN");

  const snapshot = await collection(COLLECTIONS.users)
    .where("role", "!=", "STUDENT")
    .orderBy("role")
    .get();

  return snapshot.docs
    .map((doc) => toEntity<User>(doc))
    .filter((user): user is User => user !== null);
}

/** The caller's own student profile. The portal's first read on every page. */
export async function getOwnStudentProfile(): Promise<Student | null> {
  const user = await requireAuth();

  const snapshot = await collection(COLLECTIONS.students)
    .doc(docId.user(user.uid))
    .get();

  return toEntity<Student>(snapshot);
}

export const userService = {
  ensureUserDocuments,
  getById,
  updateProfile,
  setRole,
  setActive,
  listStaff,
  getOwnStudentProfile,
};
