"use client";

import { ChevronDown, ChevronUp, LayoutDashboard, LogOut, UserRound } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import Link from "@/i18n/Link";
import { TrackedLink } from "@/components/ui/TrackedLink";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { AUTH_CHANGED_EVENT } from "@/lib/auth/events";
import { ROUTES } from "@/lib/constants/site";
import { cn } from "@/lib/utils/cn";

/**
 * Signed-in account chip for the public site's header.
 *
 * The marketing pages are static and never load the Firebase Auth chunk, so
 * this asks the server who is signed in — one `no-store` request after
 * hydration — instead of reading the client SDK or cookies during render.
 * Either of those would make every public page dynamic.
 *
 * Until the answer arrives it renders the ordinary Login link, so a signed-out
 * visitor (the common case) sees no flicker and no layout shift.
 */

export interface Account {
  displayName: string;
  homeRoute: string;
  isStaff: boolean;
}

export function useAccount(): Account | null {
  const [account, setAccount] = useState<Account | null>(null);

  useEffect(() => {
    // Bumped per request, so a slow response from before a sign-out cannot
    // land after the fresh one and put the name back.
    let latest = 0;

    function load() {
      const request = ++latest;

      fetch("/api/auth/session", { cache: "no-store" })
        .then((response) => (response.ok ? response.json() : null))
        .then((body) => {
          if (request !== latest) return;

          setAccount(
            body?.signedIn
              ? {
                  displayName: body.displayName as string,
                  homeRoute: body.homeRoute as string,
                  isStaff: body.homeRoute === "/admin",
                }
              : null,
          );
        })
        .catch(() => undefined);
    }

    load();
    // The header stays mounted across client navigations, including to
    // /signout and back from /login, so it re-asks when the session changes.
    window.addEventListener(AUTH_CHANGED_EVENT, load);

    return () => {
      latest = -1;
      window.removeEventListener(AUTH_CHANGED_EVENT, load);
    };
  }, []);

  return account;
}

/** First name only — the header is tight, and surnames are long here. */
function shortName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name;
}

function initial(name: string): string {
  return name.trim().charAt(0).toUpperCase() || "?";
}

export function AccountMenu({
  account,
  className,
}: {
  account: Account | null;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent | TouchEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  // Signed out, or the answer has not arrived yet: the ordinary Login link.
  if (!account) {
    return (
      <TrackedLink
        href={ROUTES.login}
        event={ANALYTICS_EVENTS.loginClick}
        payload={{ location: "header" }}
        className={cn(
          "text-small font-bold text-ink transition-colors hover:text-indigo",
          className,
        )}
      >
        Login
      </TrackedLink>
    );
  }

  const portalLabel = account.isStaff ? "Admin portal" : "Student portal";

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
        className="flex h-10 items-center gap-2 pr-2 text-small font-bold text-indigo transition-colors hover:bg-paper"
      >
        <span className="flex size-10 items-center justify-center bg-indigo text-small font-bold text-white">
          {initial(account.displayName)}
        </span>
        <span className="max-w-28 truncate">{shortName(account.displayName)}</span>
        {open ? (
          <ChevronUp aria-hidden className="size-4" />
        ) : (
          <ChevronDown aria-hidden className="size-4" />
        )}
      </button>

      {open ? (
        <div
          role="menu"
          aria-label="Account"
          className="absolute right-0 top-full z-50 mt-2 w-60 border-2 border-indigo bg-white"
        >
          <p className="truncate border-b border-line px-4 py-3 text-small text-ink-secondary">
            Signed in as{" "}
            <span className="font-bold text-ink">{account.displayName}</span>
          </p>

          <Link
            role="menuitem"
            href={account.homeRoute}
            // The portal opens beside the public site, so the page the reader
            // was on stays where they left it.
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="flex min-h-11 items-center gap-2.5 px-4 py-2.5 text-small font-bold text-indigo transition-colors hover:bg-indigo hover:text-white"
          >
            <LayoutDashboard aria-hidden className="size-4" />
            {portalLabel}
          </Link>

          <Link
            role="menuitem"
            href="/signout"
            onClick={() => setOpen(false)}
            className="flex min-h-11 items-center gap-2.5 border-t border-line px-4 py-2.5 text-small font-bold text-ink-secondary transition-colors hover:bg-paper hover:text-ink"
          >
            <LogOut aria-hidden className="size-4" />
            Sign out
          </Link>
        </div>
      ) : null}
    </div>
  );
}

/**
 * The same thing for the mobile drawer, where a dropdown inside a scrolling
 * sheet is awkward: the two destinations are listed flat instead.
 */
export function AccountDrawerLinks({
  account,
  onNavigate,
}: {
  account: Account | null;
  onNavigate: () => void;
}) {
  if (!account) return null;

  return (
    <div className="mt-7 border-t-2 border-indigo pt-4">
      <p className="flex items-center gap-2 text-small text-ink-secondary">
        <UserRound aria-hidden className="size-4" />
        Signed in as{" "}
        <span className="font-bold text-ink">{account.displayName}</span>
      </p>

      <div className="mt-3 flex flex-col gap-2">
        <Link
          href={account.homeRoute}
          onClick={onNavigate}
          className="flex min-h-12 items-center justify-center bg-indigo px-4 py-3 text-center text-small font-bold text-white transition-colors hover:bg-indigo-900"
        >
          {account.isStaff ? "Admin portal" : "Student portal"}
        </Link>

        <Link
          href="/signout"
          onClick={onNavigate}
          className="flex min-h-12 items-center justify-center px-4 py-3 text-center text-small font-bold text-ink-secondary transition-colors hover:bg-paper hover:text-ink"
        >
          Sign out
        </Link>
      </div>
    </div>
  );
}
