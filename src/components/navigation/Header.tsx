"use client";

import { Menu, Phone, Search, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import {
  AccountDrawerLinks,
  AccountMenu,
  useAccount,
} from "@/components/navigation/AccountMenu";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/ui/Logo";
import { TrackedAnchor, TrackedButtonLink } from "@/components/ui/TrackedLink";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { CONTACT, CTA, MOBILE_NAV, PRIMARY_NAV, ROUTES } from "@/lib/constants/site";
import { cn } from "@/lib/utils/cn";

export function Header() {
  const pathname = usePathname();
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

  // The drawer hangs off the bottom of the header, and the header does not
  // always sit at the top of the viewport: the notification strip scrolls away
  // above it. Measure instead of assuming a height, and re-measure on resize —
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
      className={cn(
        "sticky top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-200",
        scrolled
          ? "border-b border-line bg-white/85 backdrop-blur-md"
          : "border-b border-transparent bg-white",
      )}
    >
      <Container size="wide">
        <div className="flex h-16 items-center justify-between gap-4 sm:h-20 lg:h-24 lg:gap-10 xl:gap-16">
          <span className="flex items-center">
            <Logo size="md" priority />
          </span>

          <nav aria-label="Primary" className="hidden lg:block">
            {/* Seven links plus two buttons is a tight bar at exactly 1024px,
                so the gaps open up only once there is room at xl. */}
            <ul className="flex items-center gap-5 xl:gap-7">
              {PRIMARY_NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className={cn(
                      "relative whitespace-nowrap text-small font-medium transition-colors",
                      isActive(item.href)
                        ? "text-indigo"
                        : "text-ink-secondary hover:text-indigo",
                    )}
                  >
                    {item.label}
                    {isActive(item.href) ? (
                      <span
                        aria-hidden
                        className="absolute -bottom-1.5 left-0 h-0.5 w-full bg-kesar-600"
                      />
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="hidden items-center gap-3 lg:flex xl:gap-5">
            <Link
              href={ROUTES.search}
              aria-label="Search vidyantIAS"
              className="flex size-9 items-center justify-center rounded-md text-ink-secondary transition-colors hover:bg-paper hover:text-indigo"
            >
              <Search aria-hidden className="size-4.5" />
            </Link>
            <AccountMenu account={account} />
            {/* Counselling is the softer ask, so it yields to Enroll Now when
                the bar gets tight. */}
            <TrackedButtonLink
              href={CTA.counselling.href}
              variant="secondary"
              className="hidden whitespace-nowrap xl:inline-flex"
              event={ANALYTICS_EVENTS.counsellingClick}
              payload={{ location: "header" }}
            >
              Free Counselling
            </TrackedButtonLink>
            <TrackedButtonLink
              href={CTA.enrol.href}
              variant="primary"
              className="whitespace-nowrap"
              event={ANALYTICS_EVENTS.enrolClick}
              payload={{ location: "header" }}
            >
              {CTA.enrol.label}
            </TrackedButtonLink>
          </div>

          <div className="flex items-center gap-1 lg:hidden">
            <Link
              href={ROUTES.search}
              aria-label="Search vidyantIAS"
              className="flex size-11 items-center justify-center rounded-md text-indigo transition-colors hover:bg-paper"
            >
              <Search aria-hidden className="size-5" />
            </Link>
            <TrackedAnchor
              href={`tel:${CONTACT.phoneHref}`}
              event={ANALYTICS_EVENTS.phoneClick}
              payload={{ location: "header" }}
              aria-label={`Call ${CONTACT.phoneDisplay}`}
              className="flex size-11 items-center justify-center rounded-md text-indigo transition-colors hover:bg-paper"
            >
              <Phone aria-hidden className="size-5" />
            </TrackedAnchor>
            <Button
              variant="ghost"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
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
          className="fixed inset-x-0 top-16 bottom-0 z-40 overflow-y-auto border-t border-line bg-white sm:top-20 lg:hidden"
        >
          <Container className="py-6">
            <nav aria-label="Mobile">
              <ul className="divide-y divide-line">
                {MOBILE_NAV.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={closeMenu}
                      aria-current={isActive(item.href) ? "page" : undefined}
                      className={cn(
                        "flex items-center justify-between py-3.5 text-body font-medium",
                        isActive(item.href) ? "text-kesar-600" : "text-indigo",
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

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
                {CTA.enrol.label}
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
                {CTA.counselling.label}
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
                {CTA.brochure.label}
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
                  {CTA.login.label}
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
