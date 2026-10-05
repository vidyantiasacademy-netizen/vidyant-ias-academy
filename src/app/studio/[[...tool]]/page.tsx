import Link from "next/link";

import { isSanityConfigured } from "@/lib/sanity/env";

import { Studio } from "./Studio";

/**
 * Sanity Studio.
 *
 * `force-static` because the studio is a client-side application: the route
 * only has to serve the shell, and everything inside it talks to Sanity
 * directly from the browser.
 *
 * Access is controlled by the Sanity project's member list, not by our Firebase
 * roles — the studio never touches Firestore. Add `/studio` as a CORS origin in
 * `sanity.io/manage` or the login will fail with a CORS error.
 */
export const dynamic = "force-static";

export { metadata, viewport } from "next-sanity/studio";

export default function StudioPage() {
  // Without this guard the studio throws an unhandled client error on an
  // environment that has no Sanity project yet, which is the state the repo is
  // in today.
  if (!isSanityConfigured()) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-start gap-4 px-6 py-24">
        <h1 className="text-h2 font-semibold">Studio not configured</h1>
        <p className="text-body text-ink-secondary">
          Set <code>NEXT_PUBLIC_SANITY_PROJECT_ID</code> and{" "}
          <code>NEXT_PUBLIC_SANITY_DATASET</code> in your environment, then reload.
          See <code>docs/sanity.md</code> for the full setup.
        </p>
        <Link href="/" className="text-small font-semibold text-indigo underline">
          Back to the website
        </Link>
      </div>
    );
  }

  return <Studio />;
}
