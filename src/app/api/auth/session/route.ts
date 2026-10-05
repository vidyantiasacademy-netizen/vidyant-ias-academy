import { NextResponse } from "next/server";
import { z } from "zod";

import { createSession, destroySession, getSessionFast } from "@/lib/auth/session";
import { AppError, ERROR_CODES, toAppError } from "@/lib/errors";
import { isAdminConfigured } from "@/lib/firebase/admin";
import { homeRouteFor } from "@/lib/auth/roles";
import { getCurrentUserProfile } from "@/lib/auth/server";
import { userService } from "@/services/users/user.service";

/**
 * Session exchange: Firebase ID token in, httpOnly session cookie out.
 *
 * This is the hinge of the whole auth design. The browser signs in with the
 * Firebase client SDK and holds an ID token that only JavaScript can see; this
 * route turns it into a cookie that Server Components, Server Actions, Route
 * Handlers and the proxy can all read. Without it, nothing rendered on the
 * server would know who the visitor is.
 *
 * It is also where a user's Firestore documents are created, because the client
 * must not be the thing that decides its own role.
 */

const bodySchema = z.object({
  idToken: z.string().min(16).max(4096),
});

export async function POST(request: Request) {
  try {
    if (!isAdminConfigured()) {
      throw new AppError(ERROR_CODES.CONFIG_ERROR, {
        message: "Sign-in is not available yet.",
      });
    }

    const parsed = bodySchema.safeParse(await request.json().catch(() => null));

    if (!parsed.success) {
      throw new AppError(ERROR_CODES.VALIDATION_ERROR, {
        message: "Invalid sign-in request.",
      });
    }

    const session = await createSession(parsed.data.idToken);

    // Idempotent: creates the `users` / `students` documents on first sign-in,
    // and only touches `lastLoginAt` afterwards.
    await userService.ensureUserDocuments(session.uid);

    return NextResponse.json({
      ok: true,
      uid: session.uid,
      role: session.role,
      redirectTo: homeRouteFor(session.role),
    });
  } catch (error) {
    const appError = toAppError(error);
    return NextResponse.json(appError.toJSON(), { status: appError.status });
  }
}

/**
 * Who is signed in, for UI that renders on a static page.
 *
 * The marketing site is statically rendered and deliberately does not load the
 * Firebase Auth chunk, so its header cannot read the client SDK and must not
 * read cookies on the server — either would turn every public page dynamic.
 * It asks here instead, once, after hydration.
 *
 * Returns only what a header needs to draw itself. No uid, no email, no claims
 * beyond the role that decides which portal the link points at.
 */
export async function GET() {
  const session = await getSessionFast();

  if (!session) {
    return NextResponse.json(
      { signedIn: false },
      { headers: { "Cache-Control": "no-store" } },
    );
  }

  const profile = await getCurrentUserProfile();

  return NextResponse.json(
    {
      signedIn: true,
      displayName: profile?.displayName ?? session.email ?? "Your account",
      role: session.role,
      homeRoute: homeRouteFor(session.role),
    },
    // Never cached: a shared cache would hand one student's name to the next
    // visitor on the same edge node.
    { headers: { "Cache-Control": "no-store, private" } },
  );
}

/** Sign-out. Clears the cookie and revokes refresh tokens. */
export async function DELETE() {
  await destroySession({ revokeAll: true });
  return NextResponse.json({ ok: true });
}
