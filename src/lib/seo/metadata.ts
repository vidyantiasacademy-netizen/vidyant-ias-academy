import type { Metadata } from "next";

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
  /** Path beginning with "/" — used for the canonical URL. */
  path: string;
  keywords?: string[];
  noIndex?: boolean;
}

/** Builds per-page metadata with canonical, Open Graph and X/Twitter tags. */
export function pageMetadata({
  title,
  description,
  path,
  keywords,
  noIndex,
}: PageMetadataInput): Metadata {
  const url = new URL(path, SITE_URL).toString();

  return {
    title,
    description,
    keywords,
    alternates: { canonical: url },
    robots: noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      type: "website",
      siteName: BRAND.name,
      locale: "en_IN",
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
