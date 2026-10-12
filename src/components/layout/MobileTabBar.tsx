"use client";

import { BookOpen, GraduationCap, House, MessageCircle, UserRound, type LucideIcon } from "lucide-react";

import { TrackedLink } from "@/components/ui/TrackedLink";
import { usePathnameWithoutLocale } from "@/i18n/usePathnameWithoutLocale";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { ROUTES } from "@/lib/constants/site";
import { cn } from "@/lib/utils/cn";

interface Tab {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Paths that light this tab up, besides `href` itself. */
  match: string[];
  /** The one conversion tab: a kesar glyph, so it reads as the action, not a page. */
  accent?: boolean;
}

const TABS: Tab[] = [
  { label: "Home", href: ROUTES.home, icon: House, match: [] },
  { label: "Courses", href: ROUTES.courses, icon: GraduationCap, match: [ROUTES.enrol] },
  {
    label: "Talk to us",
    href: ROUTES.counselling,
    icon: MessageCircle,
    match: [ROUTES.demo, ROUTES.contact],
    accent: true,
  },
  {
    label: "Learn",
    href: ROUTES.resources,
    icon: BookOpen,
    match: [ROUTES.currentAffairs, ROUTES.quizzes, ROUTES.mockTest, ROUTES.upscGuide],
  },
  { label: "Profile", href: ROUTES.login, icon: UserRound, match: ["/dashboard"] },
];

function isActive(pathname: string, tab: Tab) {
  if (tab.href === ROUTES.home) return pathname === ROUTES.home;
  return [tab.href, ...tab.match].some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

/**
 * Phone navigation (below `md`): Home, Courses, Learn and Profile as a fixed
 * tab bar in the mock's quiet style — the active tab in kesar — with free
 * counselling as the centre tab so the conversion action stays one tap away
 * on every page. Replaces `StickyMobileCta` on phones;
 * WhatsApp and call live on the counselling page and in the header bar.
 */
export function MobileTabBar() {
  const pathname = usePathnameWithoutLocale();

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line-strong bg-white pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="grid grid-cols-5">
        {TABS.map((tab) => {
          const active = isActive(pathname, tab);
          return (
            <li key={tab.label}>
              <TrackedLink
                href={tab.href}
                event={tab.accent ? ANALYTICS_EVENTS.counsellingClick : ANALYTICS_EVENTS.tabBarClick}
                payload={{ location: "mobile-tab-bar", tab: tab.label }}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex h-16 flex-col items-center justify-center gap-1 text-[0.8125rem] font-semibold transition-colors",
                  active ? "text-kesar-600" : tab.accent ? "text-indigo" : "text-ink-secondary",
                )}
              >
                {active ? (
                  <span aria-hidden className="absolute inset-x-5 top-0 h-0.5 bg-kesar" />
                ) : null}
                <tab.icon
                  aria-hidden
                  className={cn("size-6", tab.accent && !active && "text-kesar-600")}
                  strokeWidth={active || tab.accent ? 2.25 : 1.75}
                />
                {tab.label}
              </TrackedLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
