import "server-only";

import { cookies, headers } from "next/headers";
import { cache } from "react";

import { AppError, ERROR_CODES } from "@/lib/errors";
import { getAdminAuth } from "@/lib/firebase/admin";

import {
  SESSION_COOKIE,
  SESSION_COOKIE_OPTIONS,
  SESSION_MAX_AGE_MS,
} from "./cookie";
import type { AppClaims, SessionUser } from "./types";

/**
 * Session management.
 *
 * The browser signs in with the Firebase client SDK, posts the resulting ID
 * token once to `POST /api/auth/session`, and from then on carries an httpOnly
 * session cookie minted by the Admin SDK. That cookie is what makes
 * authorisation possible in Server Components, Server Actions, Route Handlers
 * and the proxy — an ID token held in browser memory is invisible to all four.
 *
 * It also means sign-out is real: `revokeRefreshTokens` plus a cleared cookie
 * ends the session server-side, which an in-memory ID token cannot do.
 */

export { SESSION_COOKIE } from "./cookie";

/**
 * Exchanges a freshly minted ID token for a session cookie.
 *
 * Rejects tokens older than five minutes: that window is what stops a leaked
 * token from being replayed into a long-lived session hours later.
 *
 * Also rejects any provider but email/password. Accounts are provisioned by the
 * centre, and a federated provider (Google) would let anyone with an account
 * there create one here. Removing the button is not enough: the client SDK and
 * the public API key can sign in with any provider enabled on the project.
 */
export async function createSession(idToken: string): Promise<SessionUser> {
  const auth = getAdminAuth();

  const decoded = await auth.verifyIdToken(idToken, true);

  const authAgeMs = Date.now() - decoded.auth_time * 1000;
  if (authAgeMs > 5 * 60 * 1000) {
    throw new AppError(ERROR_CODES.AUTH_REQUIRED, {
      message: "Your sign-in attempt expired. Please sign in again.",
    });
  }

  if (decoded.firebase.sign_in_provider !== "password") {
    throw new AppError(ERROR_CODES.FORBIDDEN, {
      message: "Sign in with the email address the centre registered for you.",
    });
  }

  const claims = decoded as unknown as Partial<AppClaims>;
  if (claims.active === false) {
    throw new AppError(ERROR_CODES.FORBIDDEN, {
      message: "This account has been deactivated. Please contact the centre.",
    });
  }

  const cookie = await auth.createSessionCookie(idToken, {
    expiresIn: SESSION_MAX_AGE_MS,
  });

  const store = await cookies();
  store.set(SESSION_COOKIE, cookie, {
    ...SESSION_COOKIE_OPTIONS,
    maxAge: SESSION_MAX_AGE_MS / 1000,
  });

  return {
    uid: decoded.uid,
    email: decoded.email ?? null,
    role: claims.role ?? "STUDENT",
    active: claims.active ?? true,
    expiresAt: new Date(Date.now() + SESSION_MAX_AGE_MS).toISOString(),
  };
}

/**
 * Verifies the session cookie and returns the caller, or `null`.
 *
 * `cache()` memoises this for the duration of one render pass, so a layout, a
 * page and three services can each call it and the cookie is verified once.
 *
 * `checkRevoked` is on: it costs one Firebase lookup per request, but without it
 * a sacked faculty member keeps full access for the rest of the cookie's five
 * days. Use `getSessionFast()` on hot read-only paths where that is acceptable.
 */
export const getSession = cache(async (): Promise<SessionUser | null> => {
  return verifyCookie(true);
});

/** Same check without the revocation lookup. No network call. */
export const getSessionFast = cache(async (): Promise<SessionUser | null> => {
  return verifyCookie(false);
});

async function verifyCookie(checkRevoked: boolean): Promise<SessionUser | null> {
  const store = await cookies();
  const cookie = store.get(SESSION_COOKIE)?.value;

  if (!cookie) return verifyBearer(checkRevoked);

  try {
    const decoded = await getAdminAuth().verifySessionCookie(cookie, checkRevoked);
    const claims = decoded as unknown as Partial<AppClaims>;

    if (claims.active === false) return null;

    return {
      uid: decoded.uid,
      email: decoded.email ?? null,
      role: claims.role ?? "STUDENT",
      active: claims.active ?? true,
      expiresAt: new Date(decoded.exp * 1000).toISOString(),
    };
  } catch {
    // Expired, revoked, tampered with, or Firebase is unreachable. All of them
    // mean "not signed in" — never fall through to an authorised state.
    return null;
  }
}

/**
 * The mobile app's credential: `Authorization: Bearer <Firebase ID token>`.
 *
 * A native app has no cookie jar the server can rely on, so it sends the ID
 * token the Firebase client SDK already refreshes every hour. Consulted only
 * when there is no session cookie, so the website's behaviour is unchanged.
 *
 * The same gates as `createSession` apply on every request, not once: the
 * token must come from the email/password provider (the centre provisions
 * accounts; a federated sign-in must not get in through the app either), and a
 * deactivated account is refused. `checkRevoked` makes a sign-out from the
 * website — which revokes refresh tokens — end the app's access too.
 *
 * Not a CSRF surface: a browser never attaches this header on its own, so a
 * forged cross-site request carries no credential.
 */
async function verifyBearer(checkRevoked: boolean): Promise<SessionUser | null> {
  const header = (await headers()).get("authorization");
  if (!header?.startsWith("Bearer ")) return null;

  const idToken = header.slice("Bearer ".length).trim();
  if (idToken.length < 16 || idToken.length > 4096) return null;

  try {
    const decoded = await getAdminAuth().verifyIdToken(idToken, checkRevoked);
    if (decoded.firebase.sign_in_provider !== "password") return null;

    const claims = decoded as unknown as Partial<AppClaims>;
    if (claims.active === false) return null;

    return {
      uid: decoded.uid,
      email: decoded.email ?? null,
      role: claims.role ?? "STUDENT",
      active: claims.active ?? true,
      expiresAt: new Date(decoded.exp * 1000).toISOString(),
    };
  } catch {
    // Expired, revoked, forged or unverifiable — all of them are "signed out".
    return null;
  }
}

/** Clears the cookie and, optionally, every refresh token for the user. */
export async function destroySession(options: { revokeAll?: boolean } = {}) {
  const store = await cookies();
  const cookie = store.get(SESSION_COOKIE)?.value;

  store.delete({ ...SESSION_COOKIE_OPTIONS, name: SESSION_COOKIE });

  if (!options.revokeAll || !cookie) return;

  try {
    const decoded = await getAdminAuth().verifySessionCookie(cookie, false);
    await getAdminAuth().revokeRefreshTokens(decoded.sub);
  } catch {
    // Already invalid — the cookie is gone either way.
  }
}
