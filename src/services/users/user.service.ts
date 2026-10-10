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
  paginate,
  pickFields,
  requireEntity,
  toEntity,
} from "@/lib/firebase/firestore";
import type { Page, Role, Student, StudentDoc, User, UserDoc } from "@/types/db";

import { storageService, type AvatarUpload } from "../storage/storage.service";

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

export interface NewUserInput {
  displayName: string;
  email: string;
  /** 10 digits, no country code — already normalised by `phoneField`. */
  phone: string | null;
  role: Role;
  /** Initial password, handed to the person by the super admin. */
  password: string;
  /** Optional profile photograph, stored before the profile is written. */
  photo?: AvatarUpload | null;
}

/** Admin SDK error codes for a duplicate or rejected account, mapped to the form field. */
const CREATE_ERRORS: Record<string, { field: string; message: string }> = {
  "auth/email-already-exists": { field: "email", message: "An account already uses this email." },
  "auth/phone-number-already-exists": {
    field: "phone",
    message: "An account already uses this mobile number.",
  },
  "auth/invalid-password": { field: "password", message: "Use a password of at least 8 characters." },
  "auth/invalid-email": { field: "email", message: "Enter a valid email address." },
};

/**
 * Creates an account on someone's behalf — a student registered at the desk,
 * or a new member of staff — with the role already set.
 *
 * SUPER_ADMIN only. The Auth user, its claim and `users/{uid}` are written
 * together; if the document writes fail the Auth user is deleted again, so a
 * half-made account never lingers with a claim and no profile. When the person
 * first signs in, `ensureUserDocuments` finds the document and keeps the role.
 */
export async function createUser(input: NewUserInput): Promise<User> {
  const actor = await requireRole("SUPER_ADMIN");

  if (!canAssignRole(actor.role, input.role)) {
    throw new AppError(ERROR_CODES.FORBIDDEN, { message: "You cannot assign that role." });
  }

  const auth = getAdminAuth();

  let uid: string;
  try {
    const record = await auth.createUser({
      email: input.email,
      password: input.password,
      displayName: input.displayName,
      ...(input.phone ? { phoneNumber: `+91${input.phone}` } : {}),
    });
    uid = record.uid;
  } catch (error) {
    const code = (error as { code?: string }).code ?? "";
    const known = CREATE_ERRORS[code];
    if (!known) throw error;

    throw new AppError(code.endsWith("-exists") ? ERROR_CODES.CONFLICT : ERROR_CODES.VALIDATION_ERROR, {
      message: known.message,
      fieldErrors: { [known.field]: [known.message] },
      cause: error,
    });
  }

  let photoPath: string | null = null;

  try {
    await auth.setCustomUserClaims(uid, { role: input.role, active: true });

    // Uploaded inside the rollback block: a rejected photo deletes the Auth user
    // again, so the form can simply be resubmitted.
    photoPath = input.photo ? await storageService.uploadAvatarFor(uid, input.photo) : null;

    const doc: UserDoc = {
      uid,
      role: input.role,
      email: input.email,
      phone: input.phone,
      displayName: input.displayName,
      photoPath,
      isActive: true,
      lastLoginAt: null,
    };

    const userRef = collection(COLLECTIONS.users).doc(docId.user(uid));
    await userRef.set({ ...doc, ...auditOnCreate(actor.uid) });

    // A student needs a learner profile before the enrolment desk can find them.
    if (input.role === "STUDENT") {
      const student: StudentDoc = {
        uid,
        rollNumber: null,
        fullName: input.displayName,
        phone: input.phone ?? "",
        email: input.email,
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

      await collection(COLLECTIONS.students)
        .doc(docId.user(uid))
        .set({ ...student, ...auditOnCreate(actor.uid) });
    }

    return requireEntity<User>(await userRef.get(), "user");
  } catch (error) {
    await auth.deleteUser(uid).catch(() => undefined);
    if (photoPath) await storageService.remove(photoPath).catch(() => undefined);
    throw error;
  }
}

/**
 * Every account, newest first, optionally narrowed to one role. SUPER_ADMIN
 * only — it lists students' contact details alongside staff.
 */
export async function listAll(
  { role, cursor }: { role?: Role; cursor?: string | null } = {},
): Promise<Page<User>> {
  await requireRole("SUPER_ADMIN");

  const users = collection(COLLECTIONS.users);
  const filtered = role ? users.where("role", "==", role) : users;

  return paginate<UserDoc>(filtered.orderBy("createdAt", "desc"), { limit: 25, cursor });
}

/** Uid → display name, for "added by" columns. Missing uids are left out. */
export async function getDisplayNames(uids: string[]): Promise<Record<string, string>> {
  await requireRole("ADMIN");

  const unique = [...new Set(uids)];
  if (unique.length === 0) return {};

  const users = collection(COLLECTIONS.users);
  const snapshots = await users.firestore.getAll(...unique.map((uid) => users.doc(docId.user(uid))));

  return Object.fromEntries(
    snapshots
      .map((snapshot) => toEntity<User>(snapshot))
      .filter((user): user is User => user !== null)
      .map((user) => [user.uid, user.displayName]),
  );
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
  createUser,
  listAll,
  getDisplayNames,
  getOwnStudentProfile,
};
