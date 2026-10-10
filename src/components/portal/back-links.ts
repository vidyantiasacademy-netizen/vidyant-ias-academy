/**
 * Where "back" goes from a portal detail page.
 *
 * The link is drawn by `PortalBackLink` above the tab strip, which means the
 * shell renders it and the page does not — a page cannot put anything above a
 * layout's own output. The route is therefore declared here rather than in the
 * page, and the longest matching prefix wins.
 *
 * Only pages that are *not* themselves a tab need an entry. A tab is already
 * reachable from the strip, so a back link on one would point at the thing the
 * user can see.
 */

export interface PortalBackLink {
  /** Path prefix this applies to, trailing slash included. */
  prefix: string;
  href: string;
  label: string;
}

export const STUDENT_BACK_LINKS: PortalBackLink[] = [
  { prefix: "/dashboard/services/", href: "/dashboard/services", label: "Back to services" },
  { prefix: "/dashboard/courses/", href: "/dashboard", label: "Back to dashboard" },
  // A paper and its scorecard both belong to the Prelims calendar. Mains papers
  // are not sat in the runner, so they never land here.
  { prefix: "/dashboard/tests/", href: "/dashboard/prelims", label: "Back to the test series" },
];

export const ADMIN_BACK_LINKS: PortalBackLink[] = [
  { prefix: "/admin/courses/", href: "/admin/courses", label: "Back to courses" },
  { prefix: "/admin/tests/", href: "/admin/tests", label: "Back to tests" },
  { prefix: "/admin/users/", href: "/admin/users", label: "Back to users" },
  { prefix: "/admin/leads/", href: "/admin/leads", label: "Back to leads" },
];

/** Longest prefix wins, so a deeper section can override a shallower one. */
export function resolveBackLink(
  pathname: string,
  links: PortalBackLink[],
): PortalBackLink | null {
  return (
    links
      .filter((link) => pathname.startsWith(link.prefix))
      .sort((a, b) => b.prefix.length - a.prefix.length)[0] ?? null
  );
}
