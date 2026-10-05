import type { Metadata, Viewport } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";

import { BRAND, SITE_URL } from "@/lib/constants/site";
import { SEO_KEYWORDS } from "@/lib/seo/metadata";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

/** Logotype only — the drawn name in the Kalam lockup, nothing else. */
const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
  variable: "--font-source-serif",
});

export const metadata: Metadata = {
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
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  formatDetection: { telephone: true, address: false, email: false },
};

export const viewport: Viewport = {
  themeColor: "#1d2470",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

/**
 * Document shell only. Public-site header/footer live in `(marketing)/layout.tsx`
 * via `SiteChrome`, so the `(student)` and `(admin)` portals can render their own
 * shells inside the same document.
 */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-IN" className={`${inter.variable} ${sourceSerif.variable} h-full`}>
      <body className="flex min-h-full flex-col bg-white antialiased">
        {children}
      </body>
    </html>
  );
}
