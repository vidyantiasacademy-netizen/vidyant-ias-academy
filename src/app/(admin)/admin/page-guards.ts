import "server-only";

import { notFound, redirect } from "next/navigation";

import { isAtLeast } from "@/lib/auth/roles";
import { requireAuthPage } from "@/lib/auth/server";
import { isAppError } from "@/lib/errors";
import type { Role } from "@/types/db";

/**
 * Narrows an admin page to a minimum role. Someone below it goes back to the
 * overview rather than meeting a 403 — the admin layout lets every staff rank
 * in, so each page narrows again (see `admin/page.tsx` for why the layout's
 * check is not relied on).
 */
export async function requireRolePage(path: string, minimum: Role) {
  const session = await requireAuthPage(path);
  if (!isAtLeast(session.role, minimum)) redirect("/admin");
  return session;
}

/** Turns a service's `NOT_FOUND` into the route's 404 instead of an error page. */
export async function orNotFound<T>(promise: Promise<T>): Promise<T> {
  try {
    return await promise;
  } catch (error) {
    if (isAppError(error) && error.code === "NOT_FOUND") notFound();
    throw error;
  }
}
