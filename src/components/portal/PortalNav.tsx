"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils/cn";

import type { PortalNavItem } from "./PortalShell";

/**
 * The portal's tab bar.
 *
 * A Client Component only because the active tab needs the current path.
 * `PortalShell` itself stays a Server Component, so the pages under it keep
 * rendering on the server.
 *
 * Drawn as folder tabs on an Ink Indigo band: the labels sit in the dark, and
 * the current one is a pale panel with its top corners rounded, lifted onto a
 * hairline that runs the width of the band. The page below continues out of
 * that panel, which is what makes the metaphor read — a row of buttons would
 * compete with the real buttons on the page beneath, and a navigation is not an
 * action.
 *
 * No saffron here. The accent under the active tab is white, so the one kesar
 * moment on a page stays whatever the page itself is highlighting.
 *
 * Rendered at the top of the page body rather than in the header. On a phone
 * the band scrolls horizontally rather than collapsing into a menu: a handful
 * of destinations is too few to hide behind a hamburger, and students switch
 * between them constantly. The track is `w-max min-w-full`, so the band and its
 * hairline reach the far edge whether the tabs overflow or leave room to spare.
 */
export function PortalNav({ nav, title }: { nav: PortalNavItem[]; title: string }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label={title}
      // Full-bleed to the container's gutter on a phone, so the band reads as a
      // band rather than a floating card.
      className="focus-invert -mx-4 overflow-x-auto sm:mx-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <div className="flex w-max min-w-full items-end gap-1 border-b border-white/35 bg-indigo px-2 pt-2 sm:gap-2 sm:rounded-t-lg sm:px-3 sm:pt-3">
        {nav.map((item) => {
          // `/dashboard` must not light up on `/dashboard/services`, so the
          // prefix rule applies to every tab except the exact-match home one.
          const isActive =
            item.exact !== false
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                // `-mb-px` pulls each tab's own bottom border over the band's
                // hairline, so the active accent covers the line instead of
                // stacking a second one under it.
                "-mb-px shrink-0 border-b-[3px] px-4 py-3 text-small font-semibold transition-colors sm:px-5",
                isActive
                  ? "rounded-t-lg border-white bg-indigo-100 text-indigo"
                  : "border-transparent text-white/75 hover:text-white",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
