/**
 * Session cookie name and options.
 *
 * Split out of `session.ts` so that `proxy.ts` can read the cookie's name
 * without importing it. `session.ts` pulls in the Firebase Admin SDK, and the
 * proxy runs on every single request — importing it there would load the whole
 * Admin SDK into the hot path just to read one string.
 */

export const SESSION_COOKIE = "vid_session";

/** 5 days. Firebase caps session cookies at 14; shorter is cheaper to revoke. */
export const SESSION_MAX_AGE_MS = 5 * 24 * 60 * 60 * 1000;

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  // Served over https everywhere except local development.
  secure: process.env.NODE_ENV === "production",
  // `lax` rather than `strict`: `strict` drops the cookie on the first
  // navigation back from Razorpay Checkout, logging the student out mid-payment.
  sameSite: "lax" as const,
  path: "/",
};
