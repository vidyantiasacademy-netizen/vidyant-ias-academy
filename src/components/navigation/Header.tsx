"use client";

import { Menu, Search, X } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";

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
 * `notice` is the notification strip. It renders inside the sticky header, so
 * it stays pinned with the navigation on scroll. It is passed in rather than
 * imported because it is a server component that reads the notice schedule.
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

  // The drawer hangs off the bottom of the header, and the header's height is
  // not fixed: the notification strip inside it may or may not be showing.
  // Measure instead of assuming a height, and re-measure on resize —
  // background scrolling is locked while the drawer is open, so nothing else
  // can move the header underneath it.
  useEffect(() => {
    if (!menuOpen) return;
    function measure() {
      setDrawerTop(headerRef.current?.getBoundingClientRect().bottom);
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
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

  function closeMenu() {
    setMenuOpen(false);
  }

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <header
      ref={headerRef}
      // Swiss bar: solid white, a hard 2px indigo rule underneath. No blur,
      // no shadow — scrolling only firms the rule, it never changes the fill.
      className={cn(
        "sticky top-0 z-50 border-b-2 bg-white transition-colors duration-150",
        scrolled ? "border-indigo" : "border-indigo/90",
      )}
    >
      {notice}
      <ContactBar />
      <Container size="wide">
        <div className="flex h-16 items-center justify-between gap-4 sm:h-18 lg:h-20 lg:gap-8">
          <span className="flex items-center">
            <Logo size="md" priority />
          </span>

          <nav aria-label={dict.nav.primary} className="hidden xl:block">
            {/* Seven links plus the actions need ~1070px even icon-only, so
                the full bar starts at xl; below it the drawer takes over. */}
            <ul className="flex items-center gap-6 2xl:gap-7">
              {PRIMARY_NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className={cn(
                      "relative whitespace-nowrap text-small font-bold tracking-[-0.005em] transition-colors",
                      isActive(item.href)
                        ? "text-indigo"
                        : "text-ink hover:text-indigo",
                    )}
                  >
                    {dict.nav[item.key]}
                    {/* Active: a solid 4px indigo block under the label. */}
                    <span
                      aria-hidden
                      className={cn(
                        "absolute -bottom-2 left-0 h-1 w-full bg-indigo transition-opacity duration-150",
                        isActive(item.href) ? "opacity-100" : "opacity-0",
                      )}
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="hidden shrink-0 items-center gap-4 xl:flex">
            {/* Icon-only below 2xl: the bar has no room for the label until then. */}
            <LanguageSwitcher labelClassName="sr-only 2xl:not-sr-only" />
            <Link
              href={ROUTES.search}
              aria-label={dict.common.search}
              className="flex size-10 items-center justify-center text-ink transition-colors hover:bg-indigo hover:text-white"
            >
              <Search aria-hidden className="size-4.5" />
            </Link>
            <AccountMenu account={account} />
            {/* Counselling is the softer ask, so it yields to Enroll Now until
                2xl — below that the bar overflows the viewport with both. */}
            <TrackedButtonLink
              href={CTA.counselling.href}
              variant="secondary"
              className="hidden whitespace-nowrap 2xl:inline-flex"
              event={ANALYTICS_EVENTS.counsellingClick}
              payload={{ location: "header" }}
            >
              {dict.cta.counsellingShort}
            </TrackedButtonLink>
            <TrackedButtonLink
              href={CTA.enrol.href}
              variant="primary"
              className="whitespace-nowrap"
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
              className="flex size-11 items-center justify-center text-indigo transition-colors hover:bg-indigo hover:text-white"
            >
              <Search aria-hidden className="size-5" />
            </Link>
            <Button
              variant="ghost"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? dict.nav.closeMenu : dict.nav.openMenu}
              onClick={() => setMenuOpen((open) => !open)}
              className="size-11 px-0"
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
          className="fixed inset-x-0 top-16 bottom-0 z-40 overflow-y-auto bg-white sm:top-18 lg:top-20 xl:hidden"
        >
          <Container className="py-6">
            <nav aria-label={dict.nav.mobile}>
              <ul className="divide-y divide-line border-b border-line">
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
  );
}
