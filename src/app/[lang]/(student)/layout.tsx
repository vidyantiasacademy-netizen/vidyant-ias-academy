import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PortalShell, type PortalNavItem } from "@/components/portal/PortalShell";
import { STUDENT_BACK_LINKS } from "@/components/portal/back-links";
import { ToastProvider } from "@/components/ui/Toast";
import { AuthProvider } from "@/lib/auth/AuthProvider";
import { isAtLeast } from "@/lib/auth/roles";
import { getCurrentUserProfile, requireAuthPage } from "@/lib/auth/server";

/**
 * Student portal.
 *
 * The guard lives here rather than in each page: a layout runs before every
 * route beneath it, so adding a page under `(student)/` cannot accidentally
 * ship unauthenticated. Pages still call `requireAuth()` through the services
 * they use, because a Server Action in one of them is reachable without ever
 * rendering this layout.
 */
export const metadata: Metadata = {
  title: "Student Portal",
  robots: { index: false, follow: false },
};

const NAV: PortalNavItem[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/classroom", label: "Classroom", exact: false },
  { href: "/dashboard/prelims", label: "Prelims Test Series", exact: false },
  { href: "/dashboard/mains", label: "Mains Test Series", exact: false },
  { href: "/dashboard/services", label: "Services", exact: false },
  { href: "/", label: "Website" },
];

// Route groups are transparent in the URL, so this layout sits at "/" like the
// marketing and admin ones.
export default async function StudentLayout({ children }: LayoutProps<"/[lang]">) {
  const session = await requireAuthPage("/dashboard");

  // Staff who land here are sent to their own portal. The proxy cannot do this
  // — it never verifies the cookie, so it does not know the role.
  if (isAtLeast(session.role, "COUNSELLOR")) redirect("/admin");

  const profile = await getCurrentUserProfile();

  return (
    <AuthProvider>
      <ToastProvider>
        <PortalShell
          title="Student Portal"
          nav={NAV}
          backLinks={STUDENT_BACK_LINKS}
          userLabel={profile?.displayName ?? session.email ?? "Signed in"}
        >
          {children}
        </PortalShell>
      </ToastProvider>
    </AuthProvider>
  );
}
