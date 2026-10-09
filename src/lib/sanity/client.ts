import { createClient, type QueryParams, type SanityClient } from "next-sanity";

import { AppError, ERROR_CODES } from "@/lib/errors";

import {
  SANITY_API_VERSION,
  SANITY_DATASET,
  SANITY_PROJECT_ID,
  SANITY_REVALIDATE,
  isSanityConfigured,
} from "./env";

/**
 * Sanity read client.
 *
 * `useCdn: true` serves published content from Sanity's edge cache, which is
 * what every public page wants. Draft previews need the opposite plus a token,
 * so they get their own client below rather than a flag on this one.
 *
 * Created lazily, not at module scope: `createClient` throws
 * "Configuration must contain `projectId`" on construction, which during
 * `next build` fails page-data collection for every route that merely imports
 * this module — including before the CMS project exists.
 */
let cached: SanityClient | null = null;

export function getSanityClient(): SanityClient {
  if (!isSanityConfigured()) {
    throw new AppError(ERROR_CODES.CONFIG_ERROR, {
      cause: new Error("NEXT_PUBLIC_SANITY_PROJECT_ID is not set"),
    });
  }

  cached ??= createClient({
    projectId: SANITY_PROJECT_ID,
    dataset: SANITY_DATASET,
    apiVersion: SANITY_API_VERSION,
    useCdn: true,
    perspective: "published",
  });

  return cached;
}

/**
 * Draft-aware client for Next.js Draft Mode. Server-only: it carries a token.
 *
 * Never import this into a Client Component — `SANITY_API_READ_TOKEN` would be
 * inlined into the browser bundle.
 */
export function getDraftClient() {
  const token = process.env.SANITY_API_READ_TOKEN;

  if (!token) {
    throw new AppError(ERROR_CODES.CONFIG_ERROR, {
      cause: new Error("SANITY_API_READ_TOKEN is required for draft previews"),
    });
  }

  return getSanityClient().withConfig({
    token,
    useCdn: false,
    perspective: "drafts",
    stega: true,
  });
}

export interface SanityFetchOptions {
  /** Seconds. Defaults to `SANITY_REVALIDATE.stable`. */
  revalidate?: number | false;
  /** Cache tags, so a Sanity webhook can revalidate exactly what changed. */
  tags?: string[];
}

/**
 * The only way the app reads from Sanity.
 *
 * Centralised so that caching is a decision made once rather than per call
 * site, and so an unconfigured project returns the caller's fallback instead of
 * throwing — the public site must keep building before the CMS exists, which is
 * exactly where it is today.
 */
export async function sanityFetch<T>(
  query: string,
  params: QueryParams = {},
  { revalidate = SANITY_REVALIDATE.stable, tags = [] }: SanityFetchOptions = {},
): Promise<T | null> {
  if (!isSanityConfigured()) return null;

  try {
    // Both: `revalidate` is the ceiling if no webhook ever fires, `tags` let the
    // Sanity webhook invalidate immediately on publish.
    // In development nothing can deliver the webhook to localhost, so a cached
    // result would hide Studio edits for up to `revalidate` seconds.
    return await getSanityClient().fetch<T>(query, params, {
      next: { revalidate: process.env.NODE_ENV === "development" ? 0 : revalidate, tags },
    });
  } catch (error) {
    // A CMS outage degrades a section, it does not take down the page. Callers
    // fall back to `src/data/*` or render an empty state.
    console.error("[sanity] query failed", error);
    return null;
  }
}
