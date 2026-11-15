import type { Metadata } from "next";

import {
  DEFAULT_LOCALE,
  LOCALES,
  LOCALE_META,
  localizeHref,
  type Locale,
} from "@/i18n/config";
import { getLocale } from "@/i18n/server";
import { BRAND, SITE_URL } from "@/lib/constants/site";

const DEFAULT_OG_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: `${BRAND.name} — UPSC preparation in ${BRAND.city}`,
};

interface PageMetadataInput {
  title: string;
  description: string;
  /** Locale-free path beginning with "/" — used for the canonical URL. */
  path: string;
  keywords?: string[];
  noIndex?: boolean;
  /** `article` for posts, analyses and notes; adds published/modified times. */
  type?: "website" | "article";
  publishedTime?: string | null;
  modifiedTime?: string | null;
}

/** Google shows roughly 60 characters of a title and 155–160 of a description. */
const TITLE_MAX = 60;
const DESCRIPTION_MAX = 160;
const BRAND_SUFFIX = ` | ${BRAND.name}`;

/**
 * The layout template appends " | vidyantIAS". Keep it when it fits; when it
 * would push the title past what Google shows, drop it (the page's own words
 * matter more than the brand, which is in the URL and the site name) — and
 * never append it to a title that already names the brand.
 */
function seoTitle(title: string): Metadata["title"] {
  const hasBrand = title.toLowerCase().includes(BRAND.name.toLowerCase());
  return hasBrand || title.length + BRAND_SUFFIX.length > TITLE_MAX ? { absolute: title } : title;
}

/** Cut at the last word boundary that fits, so the snippet never ends mid-word. */
export function clampDescription(text: string, max = DESCRIPTION_MAX) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(" "), max * 0.6)).replace(/[\s,;:—–-]+$/, "")}…`;
}

/**
 * Canonical plus `hreflang` alternates for a locale-free `path`. Each language
 * version is its own canonical, and `x-default` points at the English page.
 */
export function localizedAlternates(path: string, locale: Locale): Metadata["alternates"] {
  const absolute = (target: Locale) =>
    new URL(localizeHref(path, target), SITE_URL).toString();

  return {
    canonical: absolute(locale),
    languages: {
      ...Object.fromEntries(LOCALES.map((l) => [LOCALE_META[l].htmlLang, absolute(l)])),
      "x-default": absolute(DEFAULT_LOCALE),
    },
  };
}

/**
 * Builds per-page metadata with canonical, `hreflang`, Open Graph and X/Twitter
 * tags. Async because it reads the request's locale, so pages export it as
 * `generateMetadata` rather than a static `metadata` object.
 */
export async function pageMetadata({
  title,
  description,
  path,
  keywords,
  noIndex,
  type = "website",
  publishedTime,
  modifiedTime,
}: PageMetadataInput): Promise<Metadata> {
  const locale = await getLocale();
  const alternates = localizedAlternates(path, locale);
  const url = alternates?.canonical as string;
  const snippet = clampDescription(description);

  return {
    title: seoTitle(title),
    description: snippet,
    keywords,
    alternates,
    robots: noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      ...(type === "article"
        ? {
            type: "article" as const,
            ...(publishedTime ? { publishedTime } : {}),
            ...(modifiedTime ?? publishedTime ? { modifiedTime: modifiedTime ?? publishedTime ?? undefined } : {}),
          }
        : { type: "website" as const }),
      siteName: BRAND.name,
      locale: LOCALE_META[locale].ogLocale,
      alternateLocale: LOCALES.filter((l) => l !== locale).map((l) => LOCALE_META[l].ogLocale),
      title,
      description: snippet,
      url,
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: snippet,
      images: [DEFAULT_OG_IMAGE.url],
    },
  };
}

export const SEO_KEYWORDS = {
  primary: [
    "UPSC coaching Pune",
    "IAS coaching Pune",
    "UPSC classes Pune",
    "UPSC institute Pune",
  ],
  secondary: [
    "UPSC foundation course Pune",
    "UPSC prelims coaching Pune",
    "UPSC mains coaching Pune",
    "UPSC optional coaching Pune",
    "UPSC mentorship Pune",
    "IAS classes Pune",
  ],
} as const;
