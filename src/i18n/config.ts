/**
 * Locale configuration — the one place that knows which languages exist.
 *
 * Routing is "prefix as needed": English, the default, lives at the bare path
 * (`/courses`) and every other locale under its own prefix (`/hi/courses`).
 * Internally every route sits under `app/[lang]`; `src/proxy.ts` rewrites the
 * bare path to `/en/...` so the default locale never shows a prefix.
 *
 * Kept free of `server-only` / `next/*` imports: the proxy, Server Components,
 * Client Components and the Sanity Studio config all read it.
 */

export const LOCALES = ["en", "hi"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

/**
 * Remembers the visitor's last explicit choice. The proxy sends a bare path to
 * the remembered locale, so an unprefixed link or a server `redirect("/login")`
 * keeps a Hindi reader in Hindi.
 */
export const LOCALE_COOKIE = "NEXT_LOCALE";

export const LOCALE_META: Record<
  Locale,
  {
    /** English name, for the Studio and admin screens. */
    label: string;
    /** The language's own name, for the switcher. */
    nativeLabel: string;
    /** `<html lang>` and `hreflang`. */
    htmlLang: string;
    /** Open Graph `og:locale`. */
    ogLocale: string;
  }
> = {
  en: { label: "English", nativeLabel: "English", htmlLang: "en-IN", ogLocale: "en_IN" },
  hi: { label: "Hindi", nativeLabel: "हिन्दी", htmlLang: "hi-IN", ogLocale: "hi_IN" },
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

/**
 * Splits a public pathname into its locale and the locale-free remainder.
 * `/hi/courses` → `{ locale: "hi", pathname: "/courses" }`; a bare path is the
 * default locale.
 */
export function splitLocale(pathname: string): { locale: Locale; pathname: string; prefixed: boolean } {
  const segment = pathname.split("/")[1];

  if (isLocale(segment)) {
    const rest = pathname.slice(segment.length + 1);
    return { locale: segment, pathname: rest === "" ? "/" : rest, prefixed: true };
  }

  return { locale: DEFAULT_LOCALE, pathname, prefixed: false };
}

/**
 * The public URL of `href` in `locale`. Leaves external, hash-only and
 * already-prefixed links alone, so it is safe to run over any `href`.
 */
export function localizeHref(href: string, locale: Locale): string {
  if (!href.startsWith("/") || href.startsWith("//")) return href;
  if (splitLocale(href).prefixed) return href;
  if (locale === DEFAULT_LOCALE) return href;

  // `/`, `/?q=…` and `/#top` are the home page: `/hi`, not `/hi/`.
  if (href === "/" || href.startsWith("/?") || href.startsWith("/#")) {
    return `/${locale}${href.slice(1)}`;
  }

  return `/${locale}${href}`;
}
