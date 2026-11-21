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

/**
 * Every canonical, sitemap entry and JSON-LD `@id` is built from this URL, so a
 * production build carrying a copied `.env` value would point Google at
 * localhost on every page. Fail the build instead of shipping that.
 */
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
if (
  process.env.VERCEL_ENV === "production" &&
  siteUrl &&
  (!siteUrl.startsWith("https://") || /localhost|127\.0\.0\.1/.test(siteUrl))
) {
  throw new Error(
    `NEXT_PUBLIC_SITE_URL must be the public https origin in production, got "${siteUrl}".`,
  );
}

/**
 * Baseline response headers for every route.
 *
 * Not yet a full Content-Security-Policy: GA4, Clarity, Firebase Auth, Google
 * sign-in, Sanity Studio and the map and video embeds each need their own
 * sources, and a wrong policy breaks pages silently. `frame-ancestors` is the
 * part that is safe to ship now (it replaces X-Frame-Options in modern
 * browsers; both are sent for older ones).
 */
const SECURITY_HEADERS = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },
  // The free practice quizzes became PYQ tests; keep old links and indexed URLs working.
  redirects() {
    return [
      { source: "/quizzes", destination: "/pyq-test", permanent: true },
      { source: "/hi/quizzes", destination: "/hi/pyq-test", permanent: true },
    ];
  },
  // The note-PDF route reads the watermark from disk at request time; file
  // tracing cannot see a path built at runtime, so ship it explicitly.
  outputFileTracingIncludes: {
    "/[lang]/notes/[slug]/pdf": ["./src/assets/note-watermark.png"],
  },
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
    // AVIF first (typically 20–30% smaller than WebP), WebP as the fallback.
    formats: ["image/avif", "image/webp"],
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
