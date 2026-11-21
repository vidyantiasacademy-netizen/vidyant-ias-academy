import "server-only";

import { AppError, ERROR_CODES } from "@/lib/errors";
import { getAdminAuth } from "@/lib/firebase/admin";

/**
 * Turns the ID token from the Google popup (`lib/firebase/google-verify.ts`)
 * into the Google-verified email it proves. A mock or PYQ sitting is keyed by
 * this address, so "one sitting per paper" means one per Google account.
 */

/** A sign-in older than this must be done again. */
const MAX_AGE_SECONDS = 10 * 60;

const UNVERIFIED = "Your Google account could not be verified. Please try again.";

export async function verifiedEmailFromToken(idToken: string): Promise<string> {
  let decoded;
  try {
    decoded = await getAdminAuth().verifyIdToken(idToken);
  } catch {
    throw new AppError(ERROR_CODES.VALIDATION_ERROR, { message: UNVERIFIED });
  }

  const fresh = Date.now() / 1000 - decoded.auth_time <= MAX_AGE_SECONDS;

  if (
    decoded.firebase.sign_in_provider !== "google.com" ||
    !decoded.email ||
    decoded.email_verified !== true ||
    !fresh
  ) {
    throw new AppError(ERROR_CODES.VALIDATION_ERROR, { message: UNVERIFIED });
  }

  await forgetGoogleOnlyUser(decoded.uid);
  return decoded.email.toLowerCase();
}

/**
 * Each verification leaves a Firebase Auth user behind. One that exists only
 * because of this check is deleted, so the Auth console lists real accounts.
 * The sitting is keyed by email, which survives the deletion. A user with any
 * other sign-in method is left alone.
 */
async function forgetGoogleOnlyUser(uid: string): Promise<void> {
  try {
    const auth = getAdminAuth();
    const user = await auth.getUser(uid);
    const googleOnly =
      user.providerData.length > 0 &&
      user.providerData.every((provider) => provider.providerId === "google.com");

    if (googleOnly) await auth.deleteUser(uid);
  } catch (error) {
    console.error("[mock-test] could not tidy up the Google verification user", uid, error);
  }
}
