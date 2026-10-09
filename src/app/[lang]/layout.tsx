import type { Metadata, Viewport } from "next";
import { Inter, Kalam, Noto_Sans_Devanagari, Source_Serif_4 } from "next/font/google";

import { LOCALE_META, LOCALES } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/server";
import { I18nProvider } from "@/i18n/I18nProvider";
import { BRAND, SITE_URL } from "@/lib/constants/site";
import { SEO_KEYWORDS, localizedAlternates } from "@/lib/seo/metadata";

import "../globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

/**
 * Devanagari for the Hindi site. Inter has no Devanagari glyphs, so it sits
 * after Inter in `--font-sans`: Latin text keeps Inter, Hindi text falls
 * through to Noto. Not preloaded — the English site never needs it, and the
 * browser only fetches it when a Devanagari glyph is on the page.
 */
const devanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: false,
  variable: "--font-devanagari",
});

/** Logotype only — the drawn name in the Kalam lockup, nothing else. */
const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
  variable: "--font-source-serif",
});

/**
 * Handwriting for the doodle notes inside homepage illustrations — decoration
 * only, never body copy. Not preloaded: the notes are aria-hidden and below
 * the fold, so they may swap in late on a slow connection.
 */
const kalam = Kalam({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
  preload: false,
  variable: "--font-kalam",
});

/**
 * Every locale is known at build time. Anything else under `[lang]` is a 404 —
 * the proxy never produces one, but a request it skips (a missing `.png`)
 * would otherwise render the site with `lang = "logo.png"`.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: `${BRAND.name} — UPSC Coaching & Mentorship in ${BRAND.city}`,
      template: `%s | ${BRAND.name}`,
    },
    description: BRAND.description,
    applicationName: BRAND.name,
    keywords: [...SEO_KEYWORDS.primary, ...SEO_KEYWORDS.secondary],
    authors: [{ name: BRAND.name, url: SITE_URL }],
    creator: BRAND.name,
    publisher: BRAND.name,
    alternates: localizedAlternates("/", locale),
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large" },
    },
    formatDetection: { telephone: true, address: false, email: false },
  };
}

export const viewport: Viewport = {
  themeColor: "#1d2470",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

/**
 * Root layout — the document shell, once per locale.
 *
 * It sits under `[lang]` so `<html lang>` is right for each language. The
 * public-site header and footer live in `(marketing)/layout.tsx` via
 * `SiteChrome`, so the `(student)` and `(admin)` portals can render their own
 * shells inside the same document.
 */
export default async function RootLayout({ children }: LayoutProps<"/[lang]">) {
  const locale = await getLocale();
  const dict = await getDictionary();

  return (
    <html
      lang={LOCALE_META[locale].htmlLang}
      className={`${inter.variable} ${devanagari.variable} ${sourceSerif.variable} ${kalam.variable} h-full`}
    >
      <body className="flex min-h-full flex-col bg-white antialiased">
        <I18nProvider locale={locale} dict={dict}>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
