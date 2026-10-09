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
}: PageMetadataInput): Promise<Metadata> {
  const locale = await getLocale();
  const alternates = localizedAlternates(path, locale);
  const url = alternates?.canonical as string;

  return {
    title,
    description,
    keywords,
    alternates,
    robots: noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      type: "website",
      siteName: BRAND.name,
      locale: LOCALE_META[locale].ogLocale,
      alternateLocale: LOCALES.filter((l) => l !== locale).map((l) => LOCALE_META[l].ogLocale),
      title,
      description,
      url,
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
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
