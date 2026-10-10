import type { NextConfig } from "next";

/**
 * Student photos live in Cloudinary as `authenticated` assets and are served
 * through short-lived signed download URLs, so their host has to be allowed
 * explicitly. The path is pinned to this account's cloud rather than the whole
 * of `api.cloudinary.com`: without that, any Cloudinary account could be
 * rendered through our own image route.
 *
 * `search` is deliberately left open — a signed download URL carries its
 * expiry, signature and api key in the query string, so it can never match a
 * fixed value.
 *
 * The images themselves are passed through `unoptimized` at the call site —
 * the optimizer does not forward credentials, and caching a private photo
 * under a stable optimized URL is not something a signed URL should enable.
 */
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;

/**
 * Sanity serves editorial images (faculty photographs, cover images) from its
 * own CDN, under `/images/<projectId>/<dataset>/`. Pinned to this project id
 * for the same reason as Cloudinary above: a bare `cdn.sanity.io` would let any
 * Sanity project be rendered through our image route.
 */
const sanityProjectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // The 1 MB default is too small for a CSV question import: the client
      // caps the file at 2 MB (`MAX_IMPORT_BYTES`), and the parsed rows sent to
      // `importQuestionsAction` are a little larger than the file as JSON.
      bodySizeLimit: "4mb",
    },
    // Keep a visited dynamic page — in practice the portal tabs — in the client
    // cache for 30s (the default is 0), so flipping back to it skips the server
    // round trip. Stale data is not a
    // risk after an edit: every admin form ends in `router.refresh()` or a
    // `revalidatePath`, and both clear this cache.
    staleTimes: {
      dynamic: 30,
    },
  },
  images: {
    remotePatterns: [
      ...(cloudName
        ? [
            {
              protocol: "https" as const,
              hostname: "api.cloudinary.com",
              pathname: `/v1_1/${cloudName}/**`,
            },
          ]
        : []),
      ...(sanityProjectId
        ? [
            {
              protocol: "https" as const,
              hostname: "cdn.sanity.io",
              pathname: `/images/${sanityProjectId}/**`,
            },
          ]
        : []),
    ],
  },
};

export default nextConfig;
