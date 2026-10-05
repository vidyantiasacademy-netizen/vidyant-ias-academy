import type { IsoDateTime, Role, Uid } from "@/types/db";

export type { Role };
export { ROLES } from "@/types/db";

/**
 * Firebase Auth custom claims we set ourselves.
 *
 * Claims are the only authorisation input Firestore Security Rules can read
 * without a document lookup, so the role is mirrored here from `users/{uid}`.
 * They are signed by Google and unforgeable by the client, but they are cached
 * in the ID token for up to an hour — a demotion therefore also has to revoke
 * refresh tokens, which `userService.setRole()` does.
 */
export interface AppClaims {
  role: Role;
  /** Mirrors `users/{uid}.isActive`. A false value fails every rule. */
  active: boolean;
}

/**
 * The verified caller. Built from the session cookie, never from client input.
 *
 * Deliberately small: enough to authorise, not enough to render a profile. Use
 * `getCurrentUserProfile()` when the name or photo is needed, so pages that
 * only gate on role cost no Firestore read.
 */
export interface SessionUser {
  uid: Uid;
  email: string | null;
  role: Role;
  active: boolean;
  /** When the session cookie expires. */
  expiresAt: IsoDateTime;
}
