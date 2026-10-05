"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { ButtonLink } from "@/components/ui/Button";
import { signOut } from "@/lib/auth/client";
import { ROUTES } from "@/lib/constants/site";

/**
 * Runs the sign-out and sends the visitor home.
 *
 * `signOut()` clears the server cookie before the client state, so the two
 * never disagree. If anything fails the page says so instead of silently
 * leaving someone signed in on a shared machine.
 */
export function SignOutScreen() {
  const router = useRouter();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    signOut()
      .then(() => {
        if (cancelled) return;
        router.replace(ROUTES.home);
        router.refresh();
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <div className="py-10 text-center">
      <h1 className="text-h2 font-semibold">
        {failed ? "Could not sign you out" : "Signing you out…"}
      </h1>

      <p className="mt-3 text-body text-ink-secondary">
        {failed
          ? "Your session is still open. Check your connection and try again."
          : "One moment."}
      </p>

      {failed ? (
        <ButtonLink href="/signout" variant="secondary" className="mt-6">
          Try again
        </ButtonLink>
      ) : null}
    </div>
  );
}
