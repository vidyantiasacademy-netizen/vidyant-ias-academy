import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE } from "@/lib/auth/cookie";

/**
 * Proxy — what earlier Next.js versions called Middleware.
 *
 * This is an **optimistic** check and nothing more. It looks for the presence of
 * a session cookie and redirects, so a signed-out visitor who clicks a portal
 * link lands on the login page instead of a flash of empty dashboard. It does
 * not verify the cookie and it does not read a role.
 *
 * Two reasons it must stay this shallow:
 *
 * - It runs on every request, including prefetches. Verifying a session cookie
 *   means a Firebase round trip, so verifying here would put one on every
 *   hovered link.
 * - It is the wrong layer to trust. The real checks are `requireAuth()` /
 *   `requireRole()` inside the services and pages, and `firestore.rules` for
 *   anything the browser reads directly. A cookie that is expired, revoked or
 *   forged gets past this file and is then rejected by both of those.
 */

/** Everything under these prefixes needs a session. */
const PROTECTED_PREFIXES = ["/dashboard", "/admin", "/exam"];

/** Signed-in users are pushed off these. */
const AUTH_ROUTES = ["/login"];

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (isProtected && !hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(pathname + search)}`;

    return NextResponse.redirect(url);
  }

  if (hasSession && AUTH_ROUTES.includes(pathname)) {
    const url = request.nextUrl.clone();
    // `/dashboard` for everyone: the role is not known here, and the student
    // layout redirects staff onward once the cookie has actually been verified.
    url.pathname = "/dashboard";
    url.search = "";

    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  /**
   * Skips static assets, the image optimiser, the Sanity Studio (its own login)
   * and `/api` — route handlers do their own authorisation, and the payment and
   * Mux webhooks authenticate by HMAC and must never be redirected.
   */
  matcher: [
    "/((?!api|studio|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|svg|webp|ico|pdf)$).*)",
  ],
};
