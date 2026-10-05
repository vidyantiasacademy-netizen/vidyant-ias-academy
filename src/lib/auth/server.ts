import "server-only";

import { redirect } from "next/navigation";
import { cache } from "react";

import { AppError, ERROR_CODES } from "@/lib/errors";
import { COLLECTIONS, docId } from "@/lib/firebase/collections";
import { collection, toEntity } from "@/lib/firebase/firestore";
import type { Student, User } from "@/types/db";

import { hasAnyRole, isAtLeast } from "./roles";
import { getSession } from "./session";
import type { Role, SessionUser } from "./types";

/**
 * The authorisation API for everything that runs on the server.
 *
 * Server Components, Server Actions and Route Handlers call these; nothing
 * calls `getSession()` and compares roles by hand. Two reasons: the checks stay
 * in one auditable place, and a Server Action reached by a direct POST — which
 * bypasses every UI guard and the proxy — still goes through them.
 *
 * These functions are the second of three layers. The proxy does an optimistic
 * redirect for UX; this layer is the real gate for anything the server reads or
 * writes; `firestore.rules` is the gate for anything the browser reads or
 * writes directly. All three are required.
 */

export { getSession, getSessionFast } from "./session";

/** The caller, or `null`. Never redirects — use for optional personalisation. */
export async function getCurrentUser(): Promise<SessionUser | null> {
  return getSession();
}

/** The caller, or `AUTH_REQUIRED`. For Server Actions and Route Handlers. */
export async function requireAuth(): Promise<SessionUser> {
  const user = await getSession();

  if (!user) throw new AppError(ERROR_CODES.AUTH_REQUIRED);

  return user;
}

/**
 * The caller, or a redirect to sign-in. For pages and layouts, where throwing
 * would render an error screen instead of sending the visitor to log in.
 */
export async function requireAuthPage(returnTo?: string): Promise<SessionUser> {
  const user = await getSession();

  if (!user) {
    const next = returnTo ? `?next=${encodeURIComponent(returnTo)}` : "";
    redirect(`/login${next}`);
  }

  return user;
}

/**
 * Requires a minimum rank: `requireRole("FACULTY")` also admits ADMIN and
 * SUPER_ADMIN. Use `requireAnyRole` when the set is not a range.
 */
export async function requireRole(minimum: Role): Promise<SessionUser> {
  const user = await requireAuth();

  if (!isAtLeast(user.role, minimum)) {
    throw new AppError(ERROR_CODES.FORBIDDEN, {
      cause: new Error(`${user.uid} is ${user.role}, needs ${minimum}`),
    });
  }

  return user;
}

export async function requireAnyRole(allowed: readonly Role[]): Promise<SessionUser> {
  const user = await requireAuth();

  if (!hasAnyRole(user.role, allowed)) {
    throw new AppError(ERROR_CODES.FORBIDDEN, {
      cause: new Error(`${user.uid} is ${user.role}, needs one of ${allowed.join(", ")}`),
    });
  }

  return user;
}

/**
 * Requires that the caller is the subject, or staff acting on them. The check
 * every "read my own record" service needs — without it, swapping a uid in a
 * Server Action argument reads somebody else's data.
 */
export async function requireSelfOrRole(
  subjectUid: string,
  minimum: Role,
): Promise<SessionUser> {
  const user = await requireAuth();

  if (user.uid === subjectUid || isAtLeast(user.role, minimum)) return user;

  throw new AppError(ERROR_CODES.FORBIDDEN, {
    cause: new Error(`${user.uid} may not act on ${subjectUid}`),
  });
}

/** The caller's `users/{uid}` document. Memoised per render pass. */
export const getCurrentUserProfile = cache(async (): Promise<User | null> => {
  const session = await getSession();
  if (!session) return null;

  const snapshot = await collection(COLLECTIONS.users)
    .doc(docId.user(session.uid))
    .get();

  return toEntity<User>(snapshot);
});

/** The caller's `students/{uid}` document, or `null` if they are not a student. */
export const getCurrentStudent = cache(async (): Promise<Student | null> => {
  const session = await getSession();
  if (!session) return null;

  const snapshot = await collection(COLLECTIONS.students)
    .doc(docId.user(session.uid))
    .get();

  return toEntity<Student>(snapshot);
});
