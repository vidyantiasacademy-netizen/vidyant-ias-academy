import { NextResponse, type NextRequest } from "next/server";

import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  isLocale,
  localizeHref,
  splitLocale,
  type Locale,
} from "@/i18n/config";
import { SESSION_COOKIE } from "@/lib/auth/cookie";

/**
 * Proxy — what earlier Next.js versions called Middleware.
 *
 * Two jobs. First, locale routing: every page lives under `app/[lang]`, English
 * is served from the bare path (rewritten to `/en/...` internally), Hindi from
 * `/hi/...`. See `src/i18n/config.ts`.
 *
 * Second, the auth redirect. That is an **optimistic** check and nothing more.
 * It looks for the presence of a session cookie and redirects, so a signed-out visitor who clicks a portal
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

/** Everything under these prefixes needs a session. Locale-free paths. */
const PROTECTED_PREFIXES = ["/dashboard", "/admin", "/exam"];

/** Signed-in users are pushed off these. */
const AUTH_ROUTES = ["/login"];

export function proxy(request: NextRequest) {
  const { pathname: publicPath, search } = request.nextUrl;
  const { locale: prefixLocale, pathname, prefixed } = splitLocale(publicPath);
  const remembered = request.cookies.get(LOCALE_COOKIE)?.value;

  // `/en/...` is never a public URL — English lives at the bare path. Collapse
  // it, and remember the choice: this is how the language switcher gets an
  // English reader whose cookie still says Hindi back to the bare path.
  if (prefixed && prefixLocale === DEFAULT_LOCALE) {
    const url = request.nextUrl.clone();
    url.pathname = pathname;
    return withLocaleCookie(NextResponse.redirect(url), DEFAULT_LOCALE);
  }

  // A bare path from a reader who last chose another language: send them to
  // that language. Covers every hard-coded `href="/login"` and server
  // `redirect("/dashboard")` in one place. Crawlers carry no cookie, so the bare
  // URLs they index are always English.
  if (!prefixed && isLocale(remembered) && remembered !== DEFAULT_LOCALE) {
    const url = request.nextUrl.clone();
    url.pathname = localizeHref(pathname, remembered);
    return NextResponse.redirect(url);
  }

  const locale = prefixLocale;
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (isProtected && !hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = localizeHref("/login", locale);
    url.search = `?next=${encodeURIComponent(publicPath + search)}`;

    return NextResponse.redirect(url);
  }

  if (hasSession && AUTH_ROUTES.includes(pathname)) {
    const url = request.nextUrl.clone();
    // `/dashboard` for everyone: the role is not known here, and the student
    // layout redirects staff onward once the cookie has actually been verified.
    url.pathname = localizeHref("/dashboard", locale);
    url.search = "";

    return NextResponse.redirect(url);
  }

  // Every route lives under `app/[lang]`. The default locale has no prefix in
  // the URL, so give it one internally; a prefixed locale already matches.
  if (prefixed) {
    return withLocaleCookie(NextResponse.next(), locale, remembered);
  }

  const url = request.nextUrl.clone();
  url.pathname = `/${DEFAULT_LOCALE}${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

/** Sets the locale cookie, skipping the `Set-Cookie` when it already matches. */
function withLocaleCookie(response: NextResponse, locale: Locale, current?: string) {
  if (current === locale) return response;

  response.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  return response;
}

export const config = {
  /**
   * Skips static assets, the image optimiser, the Sanity Studio (its own login)
   * and `/api` — route handlers do their own authorisation, and the payment and
   * Mux webhooks authenticate by HMAC and must never be redirected. None of
   * these live under `app/[lang]`, so none of them may be locale-rewritten;
   * that includes the root `opengraph-image`, which has no file extension.
   */
  matcher: [
    "/((?!api|studio|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|opengraph-image|.*\\.(?:png|jpg|jpeg|svg|webp|ico|pdf)$).*)",
  ],
};
