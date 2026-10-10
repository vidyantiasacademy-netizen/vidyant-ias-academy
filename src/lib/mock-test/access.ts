import "server-only";

import { cookies } from "next/headers";

/**
 * The visitor's proof of ownership of a mock test sitting.
 *
 * One httpOnly cookie per sitting, holding the raw token whose hash is stored
 * on the attempt. httpOnly so a script on the page cannot lift it; SameSite=Lax
 * so another site cannot drive the Server Actions with it; thirty days so the
 * scorecard can be reopened from the same browser after the counselling call.
 */

const MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

function cookieName(attemptId: string): string {
  return `vm_${attemptId}`;
}

export async function readAttemptToken(attemptId: string): Promise<string | null> {
  // Firestore auto-ids are alphanumeric; anything else is not one of ours and
  // must not become part of a cookie name.
  if (!/^[A-Za-z0-9]{1,64}$/.test(attemptId)) return null;

  return (await cookies()).get(cookieName(attemptId))?.value ?? null;
}

/** Only callable from a Server Action or Route Handler — cookies cannot be set mid-render. */
export async function writeAttemptToken(attemptId: string, token: string): Promise<void> {
  (await cookies()).set(cookieName(attemptId), token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}
