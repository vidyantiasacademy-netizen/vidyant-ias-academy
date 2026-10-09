"use client";

import { ArrowLeft } from "lucide-react";

import Link from "@/i18n/Link";
import { usePathnameWithoutLocale } from "@/i18n/usePathnameWithoutLocale";

import { resolveBackLink, type PortalBackLink as BackLink } from "./back-links";

/**
 * The way out of a portal detail page, above the tabs.
 *
 * It sits at the very top of the page body because that is where the way out
 * belongs — below the tab strip it read as part of the page's own content, next
 * to the heading, and a reader scanning down met it after the title it was
 * meant to precede.
 *
 * A Client Component for the same reason the tabs are: the current path is what
 * decides whether there is anything to go back to.
 */
export function PortalBackLink({ links }: { links: BackLink[] }) {
  const pathname = usePathnameWithoutLocale();
  const back = resolveBackLink(pathname, links);

  if (!back) return null;

  return (
    <Link
      href={back.href}
      className="mb-5 inline-flex items-center gap-2 text-small font-semibold text-ink-secondary transition-colors hover:text-indigo"
    >
      <ArrowLeft aria-hidden className="size-4" />
      {back.label}
    </Link>
  );
}
