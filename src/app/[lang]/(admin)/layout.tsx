import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ADMIN_BACK_LINKS } from "@/components/portal/back-links";
import { PortalShell, type PortalNavItem } from "@/components/portal/PortalShell";
import { ToastProvider } from "@/components/ui/Toast";
import { AuthProvider } from "@/lib/auth/AuthProvider";
import { isAtLeast, isSuperAdmin } from "@/lib/auth/roles";
import { getCurrentUserProfile, requireAuthPage } from "@/lib/auth/server";

/**
 * Admin and faculty portal.
 *
 * Gated at COUNSELLOR and above — the lowest staff rank. Each page inside
 * narrows further (a counsellor sees enquiries, not the question bank), and
 * every service call re-checks, so this layout is the coarse filter rather than
 * the authorisation.
 */
export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

const OVERVIEW: PortalNavItem = { href: "/admin", label: "Overview" };
const COURSES: PortalNavItem = { href: "/admin/courses", label: "Courses", exact: false };
const TESTS: PortalNavItem = { href: "/admin/tests", label: "Tests", exact: false };
const USERS: PortalNavItem = { href: "/admin/users", label: "Users", exact: false };
const WEBSITE: PortalNavItem = { href: "/", label: "Website" };

export default async function AdminLayout({ children }: LayoutProps<"/[lang]">) {
  const session = await requireAuthPage("/admin");

  // Students who guess the URL are sent to their own portal, not shown a 403:
  // the fact that an admin area exists is not a secret, but its shape is.
  if (!isAtLeast(session.role, "COUNSELLOR")) redirect("/dashboard");

  const profile = await getCurrentUserProfile();

  // Tabs a role cannot use are left out rather than shown and refused.
  const nav = isSuperAdmin(session.role)
    ? [OVERVIEW, COURSES, TESTS, USERS, WEBSITE]
    : isAtLeast(session.role, "FACULTY")
      ? [OVERVIEW, COURSES, TESTS, WEBSITE]
      : [OVERVIEW, COURSES, WEBSITE];

  return (
    <AuthProvider>
      <ToastProvider>
        <PortalShell
          title="Admin"
          nav={nav}
          backLinks={ADMIN_BACK_LINKS}
          userLabel={`${profile?.displayName ?? session.email ?? "Staff"} · ${session.role}`}
        >
          {children}
        </PortalShell>
      </ToastProvider>
    </AuthProvider>
  );
}
