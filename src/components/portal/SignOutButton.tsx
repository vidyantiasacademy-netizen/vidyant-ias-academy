"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { signOut } from "@/lib/auth/client";

/**
 * Sign-out, for the portal header.
 *
 * `signOut()` clears the server session cookie *before* the client state, so
 * the two never disagree. `router.refresh()` then discards the RSC payload
 * that was rendered for the signed-in user.
 */
export function SignOutButton() {
  const router = useRouter();
  const [isBusy, setBusy] = useState(false);

  return (
    <button
      type="button"
      disabled={isBusy}
      onClick={async () => {
        setBusy(true);
        try {
          await signOut();
        } finally {
          router.replace("/");
          router.refresh();
        }
      }}
      className="flex items-center gap-2 px-3 py-2 text-small font-medium text-ink-secondary hover:bg-paper hover:text-ink disabled:opacity-55"
    >
      <LogOut aria-hidden className="size-4" />
      {isBusy ? "Signing out…" : "Sign out"}
    </button>
  );
}
