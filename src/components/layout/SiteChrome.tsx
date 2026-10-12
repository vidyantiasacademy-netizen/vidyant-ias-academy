import type { ReactNode } from "react";

import { Footer } from "@/components/footer/Footer";
import { ExitIntentOffer } from "@/components/layout/ExitIntentOffer";
import { FloatingActions } from "@/components/layout/FloatingActions";
import { MobileTabBar } from "@/components/layout/MobileTabBar";
import { NotificationStrip } from "@/components/layout/NotificationStrip";
import { SocialRail } from "@/components/layout/SocialRail";
import { StickyMobileCta } from "@/components/layout/StickyMobileCta";
import { Header } from "@/components/navigation/Header";
import { getDictionary } from "@/i18n/server";

/**
 * Public-website chrome: header, footer and the conversion CTAs.
 *
 * It lives in a component rather than the root layout because the student and
 * admin portals render inside the same `<body>` but need their own shell. The
 * root `not-found.tsx` / `error.tsx` also use it directly — those files replace
 * the `(marketing)` layout when they render, so they would otherwise lose the
 * header and footer.
 */
export async function SiteChrome({ children }: { children: ReactNode }) {
  const dict = await getDictionary();

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:bg-indigo focus:px-4 focus:py-2.5 focus:text-small focus:font-bold focus:text-white"
      >
        {dict.common.skipToContent}
      </a>
      <Header notice={<NotificationStrip />} />
      <main id="main" className="flex-1 pb-[calc(5rem+env(safe-area-inset-bottom))] lg:pb-0">
        {children}
      </main>
      <Footer />
      <MobileTabBar />
      <StickyMobileCta />
      <SocialRail />
      <FloatingActions />
      <ExitIntentOffer />
    </>
  );
}
