import { ROLES, type Role } from "@/types/db";

/**
 * Role ranking and capability checks.
 *
 * Shared by the client (to hide UI a user cannot use) and the server (to
 * actually enforce it). The client copy is a convenience only — every check
 * here is repeated server-side in `lib/auth/server.ts` and again in
 * `firestore.rules`, because anything running in a browser can be edited.
 */

/** Rank derived from declaration order in `ROLES`, least → most privileged. */
const RANK: Record<Role, number> = Object.fromEntries(
  ROLES.map((role, index) => [role, index]),
) as Record<Role, number>;

export function rankOf(role: Role): number {
  return RANK[role];
}

/** True when `role` is at least as privileged as `minimum`. */
export function isAtLeast(role: Role, minimum: Role): boolean {
  return RANK[role] >= RANK[minimum];
}

export function hasAnyRole(role: Role, allowed: readonly Role[]): boolean {
  return allowed.includes(role);
}

export const isStaff = (role: Role): boolean => role !== "STUDENT";
export const isAdmin = (role: Role): boolean => isAtLeast(role, "ADMIN");
export const isSuperAdmin = (role: Role): boolean => role === "SUPER_ADMIN";

/**
 * Who may grant which roles. Admins deliberately cannot mint another
 * SUPER_ADMIN — that stays a SUPER_ADMIN action so the top of the tree cannot
 * be widened by anyone below it.
 */
export function canAssignRole(actor: Role, target: Role): boolean {
  if (actor === "SUPER_ADMIN") return true;
  if (actor === "ADMIN") return RANK[target] < RANK.ADMIN;
  return false;
}

/** Landing route per role, used after sign-in and by the proxy redirect. */
export function homeRouteFor(role: Role): string {
  return isAtLeast(role, "COUNSELLOR") ? "/admin" : "/dashboard";
}
