"use client";

import { ChevronDown, LayoutDashboard, LogOut, UserRound } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

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
          "text-small font-medium text-ink-secondary transition-colors hover:text-indigo",
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
        className="flex items-center gap-2 rounded-md py-1.5 pl-1.5 pr-2 text-small font-medium text-indigo transition-colors hover:bg-paper"
      >
        <span className="flex size-8 items-center justify-center rounded-full bg-indigo text-small font-semibold text-white">
          {initial(account.displayName)}
        </span>
        <span className="max-w-28 truncate">{shortName(account.displayName)}</span>
        <ChevronDown
          aria-hidden
          className={cn("size-4 transition-transform", open && "rotate-180")}
        />
      </button>

      {open ? (
        <div
          role="menu"
          aria-label="Account"
          className="absolute right-0 top-full z-50 mt-2 w-60 rounded-lg border border-line bg-white p-2 shadow-[var(--shadow-card-hover)]"
        >
          <p className="truncate px-3 py-2 text-small text-ink-secondary">
            Signed in as{" "}
            <span className="font-semibold text-ink">{account.displayName}</span>
          </p>

          <Link
            role="menuitem"
            href={account.homeRoute}
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 rounded-md px-3 py-2.5 text-small font-semibold text-indigo hover:bg-paper"
          >
            <LayoutDashboard aria-hidden className="size-4" />
            {portalLabel}
          </Link>

          <Link
            role="menuitem"
            href="/signout"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 rounded-md px-3 py-2.5 text-small font-medium text-ink-secondary hover:bg-paper hover:text-ink"
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
    <div className="mt-7 rounded-lg border border-line bg-paper/60 p-4">
      <p className="flex items-center gap-2 text-small text-ink-secondary">
        <UserRound aria-hidden className="size-4" />
        Signed in as{" "}
        <span className="font-semibold text-ink">{account.displayName}</span>
      </p>

      <div className="mt-3 flex flex-col gap-2">
        <Link
          href={account.homeRoute}
          onClick={onNavigate}
          className="rounded-md bg-indigo px-4 py-3 text-center text-small font-semibold text-white"
        >
          {account.isStaff ? "Admin portal" : "Student portal"}
        </Link>

        <Link
          href="/signout"
          onClick={onNavigate}
          className="rounded-md px-4 py-3 text-center text-small font-medium text-ink-secondary"
        >
          Sign out
        </Link>
      </div>
    </div>
  );
}
