import type { ReactNode } from "react";

import { PortalBackLink } from "@/components/portal/PortalBackLink";
import { PortalNav } from "@/components/portal/PortalNav";
import type { PortalBackLink as BackLink } from "@/components/portal/back-links";
import { SignOutButton } from "@/components/portal/SignOutButton";
import { Logo } from "@/components/ui/Logo";

/**
 * Shell for the student and admin portals.
 *
 * Deliberately not `SiteChrome`: the portal has no marketing header, no sticky
 * "Book Free Counselling" bar and no floating WhatsApp button. Someone who has
 * already paid should not be sold to.
 */

export interface PortalNavItem {
  href: string;
  label: string;
  /** False when the tab should also stay active on its child routes. */
  exact?: boolean;
}

export function PortalShell({
  children,
  nav,
  backLinks = [],
  title,
  userLabel,
}: {
  children: ReactNode;
  nav: PortalNavItem[];
  /** Detail routes that get a back link above the tabs. */
  backLinks?: BackLink[];
  title: string;
  /** Name or email of the signed-in user. */
  userLabel: string;
}) {
  return (
    <>
      <a
        href="#portal-main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-indigo focus:px-4 focus:py-2.5 focus:text-small focus:font-semibold focus:text-white"
      >
        Skip to main content
      </a>

      <header className="border-b border-line bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
          {/* `Logo` links to the homepage itself unless `asStatic` is set. */}
          <Logo tone="dark" size="sm" />

          <span className="hidden text-small font-semibold text-ink-secondary sm:inline">
            {title}
          </span>

          <span className="ml-auto hidden max-w-40 truncate text-small text-ink-secondary lg:inline">
            {userLabel}
          </span>

          <SignOutButton />
        </div>
      </header>

      <main id="portal-main" className="flex-1 bg-paper">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          {/* Way out first, then the tabs. Both live in the page rather than
              the header: on a phone the header is already carrying the logo,
              the name and sign-out, and a second row of links there pushes the
              page content below the fold. */}
          <PortalBackLink links={backLinks} />

          <PortalNav nav={nav} title={title} />

          <div className="mt-8">{children}</div>
        </div>
      </main>
    </>
  );
}
