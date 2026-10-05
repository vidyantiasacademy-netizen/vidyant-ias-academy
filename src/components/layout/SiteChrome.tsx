import type { ReactNode } from "react";

import { Footer } from "@/components/footer/Footer";
import { FloatingActions } from "@/components/layout/FloatingActions";
import { NotificationStrip } from "@/components/layout/NotificationStrip";
import { StickyMobileCta } from "@/components/layout/StickyMobileCta";
import { Header } from "@/components/navigation/Header";

/**
 * Public-website chrome: header, footer and the conversion CTAs.
 *
 * It lives in a component rather than the root layout because the student and
 * admin portals render inside the same `<body>` but need their own shell. The
 * root `not-found.tsx` / `error.tsx` also use it directly — those files replace
 * the `(marketing)` layout when they render, so they would otherwise lose the
 * header and footer.
 */
export function SiteChrome({ children }: { children: ReactNode }) {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-indigo focus:px-4 focus:py-2.5 focus:text-small focus:font-semibold focus:text-white"
      >
        Skip to main content
      </a>
      <NotificationStrip />
      <Header />
      <main id="main" className="flex-1 pb-20 lg:pb-0">
        {children}
      </main>
      <Footer />
      <StickyMobileCta />
      <FloatingActions />
    </>
  );
}
