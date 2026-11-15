"use client";

import { Menu, Search, X } from "lucide-react";
import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";

import Link from "@/i18n/Link";
import { usePathnameWithoutLocale } from "@/i18n/usePathnameWithoutLocale";
import {
  AccountDrawerLinks,
  AccountMenu,
  useAccount,
} from "@/components/navigation/AccountMenu";
import { ContactBar } from "@/components/navigation/ContactBar";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/ui/Logo";
import { TrackedButtonLink } from "@/components/ui/TrackedLink";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { LanguageSwitcher } from "@/components/navigation/LanguageSwitcher";
import { useI18n } from "@/i18n/I18nProvider";
import { CTA, MOBILE_NAV, PRIMARY_NAV, ROUTES } from "@/lib/constants/site";
import { cn } from "@/lib/utils/cn";

/**
 * `notice` is the notification strip. It is sticky too, at the very top; the
 * navigation row pins directly under it (`--notice-strip-height`), and the
 * contact bar between them scrolls away with the page. The strip is passed in
 * rather than imported because it is a server component that reads the notice
 * schedule.
 */
export function Header({ notice }: { notice?: ReactNode }) {
  const pathname = usePathnameWithoutLocale();
  const { dict } = useI18n();
  // One request per header render; both the dropdown and the drawer read it.
  const account = useAccount();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [drawerTop, setDrawerTop] = useState<number>();
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // The drawer hangs off the bottom of the header, and where that is depends
  // on scroll: at the top of the page the notice strip and contact bar sit
  // above it. Measure instead of assuming a position.
  useEffect(() => {
    if (!menuOpen) return;
    function measure() {
      setDrawerTop(headerRef.current?.getBoundingClientRect().bottom);
    }
    measure();
    // Scroll too: a smooth scroll already in flight when the drawer opens
    // still moves the header, even with background scrolling locked.
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, { passive: true });
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure);
    };
  }, [menuOpen]);

  // Lock background scrolling and allow Escape to close while the drawer is open.
  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  const isHome = pathname === ROUTES.home;
  const activeSection = useActiveSection(isHome);

  function closeMenu() {
    setMenuOpen(false);
  }

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  // Already on the homepage: scroll to the section ourselves instead of a
  // client navigation, and keep the hash in the address bar so it can be
  // shared. `scrollIntoView` follows the CSS `scroll-behavior` (smooth, or
  // instant under reduced motion) and each section's `scroll-margin-top`.
  // Elsewhere the link navigates to `/#id` and the router scrolls on arrival.
  function onSectionClick(event: MouseEvent<HTMLAnchorElement>, id: string) {
    closeMenu();
    if (!isHome) return;
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    window.history.replaceState(null, "", `#${id}`);
    // Wait a frame so a closing drawer has released the body scroll lock.
    requestAnimationFrame(() => target.scrollIntoView());
  }

  return (
    <>
      {notice}
      <ContactBar />
      <header
        ref={headerRef}
        // Solid logo-navy bar, matching the hero's wave. No blur, no shadow —
        // once the page scrolls under it a 2px saffron rule appears.
        className={cn(
          "sticky top-(--notice-strip-height) z-50 border-b-2 bg-logo-navy transition-colors duration-150",
          scrolled ? "border-logo-saffron" : "border-logo-navy",
        )}
      >
        <Container size="wide">
          <div className="flex h-16 items-center justify-between gap-4 lg:h-18 lg:gap-8">
            <span className="flex items-center">
              <Logo tone="light" size="md" priority />
            </span>

            <nav aria-label={dict.nav.primary} className="hidden xl:block">
              {/* Seven links plus the actions need ~1070px even icon-only, so
                  the full bar starts at xl; below it the drawer takes over. */}
              <ul className="flex items-center gap-6 2xl:gap-7">
                {PRIMARY_NAV.map((item) => {
                  const active = activeSection === item.id;
                  return (
                    <li key={item.id}>
                      <Link
                        href={item.href}
                        onClick={(event) => onSectionClick(event, item.id)}
                        aria-current={active ? "location" : undefined}
                        className={cn(
                          "relative whitespace-nowrap text-small font-bold tracking-[-0.005em] transition-colors",
                          active ? "text-logo-saffron" : "text-white hover:text-logo-saffron",
                        )}
                      >
                        {dict.nav[item.key]}
                        {/* Active: a solid 4px saffron block under the label. */}
                        <span
                          aria-hidden
                          className={cn(
                            "absolute -bottom-2 left-0 h-1 w-full bg-logo-saffron transition-opacity duration-150",
                            active ? "opacity-100" : "opacity-0",
                          )}
                        />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="hidden shrink-0 items-center gap-4 xl:flex">
              {/* Icon-only below 2xl: the bar has no room for the label until then. */}
              <LanguageSwitcher
                labelClassName="sr-only 2xl:not-sr-only"
                linkClassName="text-white hover:bg-transparent hover:text-logo-saffron"
              />
              <Link
                href={ROUTES.search}
                aria-label={dict.common.search}
                className="flex size-10 items-center justify-center text-white transition-colors hover:text-logo-saffron"
              >
                <Search aria-hidden className="size-4.5" />
              </Link>
              <AccountMenu account={account} className="text-white hover:text-logo-saffron" />
              {/* Counselling is the softer ask, so it yields to Enroll Now until
                  2xl — below that the bar overflows the viewport with both. */}
              <TrackedButtonLink
                href={CTA.counselling.href}
                variant="outlineLight"
                className="hidden whitespace-nowrap hover:text-logo-navy 2xl:inline-flex"
                event={ANALYTICS_EVENTS.counsellingClick}
                payload={{ location: "header" }}
              >
                {dict.cta.counsellingShort}
              </TrackedButtonLink>
              <TrackedButtonLink
                href={CTA.enrol.href}
                variant="primary"
                className="whitespace-nowrap bg-logo-saffron-600 text-white hover:bg-white hover:text-logo-navy"
                event={ANALYTICS_EVENTS.enrolClick}
                payload={{ location: "header" }}
              >
                {dict.cta.enrol}
              </TrackedButtonLink>
            </div>

            <div className="flex items-center gap-1 xl:hidden">
              <Link
                href={ROUTES.search}
                aria-label={dict.common.search}
                className="flex size-11 items-center justify-center text-white transition-colors hover:bg-white hover:text-logo-navy"
              >
                <Search aria-hidden className="size-5" />
              </Link>
              <Button
                variant="ghost"
                aria-expanded={menuOpen}
                aria-controls="mobile-menu"
                aria-label={menuOpen ? dict.nav.closeMenu : dict.nav.openMenu}
                onClick={() => setMenuOpen((open) => !open)}
                className="size-11 px-0 text-white hover:bg-white hover:text-logo-navy"
              >
                {menuOpen ? (
                  <X aria-hidden className="size-5" />
                ) : (
                  <Menu aria-hidden className="size-5" />
                )}
              </Button>
            </div>
          </div>
        </Container>

        {menuOpen ? (
          <div
            id="mobile-menu"
            style={{ top: drawerTop }}
            className="fixed inset-x-0 top-16 bottom-0 z-40 overflow-y-auto bg-white lg:top-18 xl:hidden"
          >
            <Container className="py-6">
              <nav aria-label={dict.nav.mobile}>
                <h2 className="text-eyebrow font-bold uppercase tracking-[0.12em] text-ink-secondary">
                  {dict.nav.onThisPage}
                </h2>
                <ul className="mt-2 divide-y divide-line border-b border-line">
                  {PRIMARY_NAV.map((item) => {
                    const active = activeSection === item.id;
                    return (
                      <li key={item.id} className={item.onPhone ? undefined : "max-md:hidden"}>
                        <Link
                          href={item.href}
                          onClick={(event) => onSectionClick(event, item.id)}
                          aria-current={active ? "location" : undefined}
                          className={cn(
                            "flex items-center justify-between border-l-4 py-3.5 pl-3 text-body font-bold",
                            active
                              ? "border-indigo text-indigo"
                              : "border-transparent text-ink hover:text-indigo",
                          )}
                        >
                          {dict.nav[item.key]}
                        </Link>
                      </li>
                    );
                  })}
                </ul>

                <h2 className="mt-7 text-eyebrow font-bold uppercase tracking-[0.12em] text-ink-secondary">
                  {dict.nav.explorePages}
                </h2>
                <ul className="mt-2 divide-y divide-line border-b border-line">
                  {MOBILE_NAV.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={closeMenu}
                        aria-current={isActive(item.href) ? "page" : undefined}
                        className={cn(
                          "flex items-center justify-between border-l-4 py-3.5 pl-3 text-body font-bold",
                          isActive(item.href)
                            ? "border-indigo text-indigo"
                            : "border-transparent text-ink hover:text-indigo",
                        )}
                      >
                        {dict.nav[item.key]}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              <LanguageSwitcher className="mt-4 -ml-2.5" onNavigate={closeMenu} />

              <div className="mt-7 flex flex-col gap-3">
                <TrackedButtonLink
                  href={CTA.enrol.href}
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={closeMenu}
                  event={ANALYTICS_EVENTS.enrolClick}
                  payload={{ location: "mobile-menu" }}
                >
                  {dict.cta.enrol}
                </TrackedButtonLink>
                <TrackedButtonLink
                  href={CTA.counselling.href}
                  variant="secondary"
                  size="lg"
                  fullWidth
                  onClick={closeMenu}
                  event={ANALYTICS_EVENTS.counsellingClick}
                  payload={{ location: "mobile-menu" }}
                >
                  {dict.cta.counselling}
                </TrackedButtonLink>
                <TrackedButtonLink
                  href={CTA.brochure.href}
                  variant="secondary"
                  size="lg"
                  fullWidth
                  onClick={closeMenu}
                  event={ANALYTICS_EVENTS.brochureClick}
                  payload={{ location: "mobile-menu" }}
                >
                  {dict.cta.brochure}
                </TrackedButtonLink>
                {/* Signed in, the account block below replaces this. */}
                {account ? null : (
                  <TrackedButtonLink
                    href={ROUTES.login}
                    variant="ghost"
                    size="lg"
                    fullWidth
                    onClick={closeMenu}
                    event={ANALYTICS_EVENTS.loginClick}
                    payload={{ location: "mobile-menu" }}
                  >
                    {dict.cta.login}
                  </TrackedButtonLink>
                )}
              </div>

              <AccountDrawerLinks account={account} onNavigate={closeMenu} />
            </Container>
          </div>
        ) : null}
      </header>
    </>
  );
}

/**
 * Which homepage section is being read, for the nav's active marker: the last
 * nav section whose top has passed a line a third of the way down the
 * viewport. Above the first one (the hero) nothing is active; sections not in
 * the nav (orientation, app) keep the one before them lit.
 */
function useActiveSection(enabled: boolean) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let frame = 0;
    function update() {
      frame = 0;
      const line = window.innerHeight / 3;
      let current: string | null = null;
      for (const item of PRIMARY_NAV) {
        const section = document.getElementById(item.id);
        // Sections hidden on phones have no boxes, and a zero rect would read as "passed".
        if (!section || section.getClientRects().length === 0) continue;
        if (section.getBoundingClientRect().top <= line) current = item.id;
      }
      setActive(current);
    }
    function onScroll() {
      if (!frame) frame = requestAnimationFrame(update);
    }
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [enabled]);

  // Off the homepage a stale id from the last visit must not light a link.
  return enabled ? active : null;
}
