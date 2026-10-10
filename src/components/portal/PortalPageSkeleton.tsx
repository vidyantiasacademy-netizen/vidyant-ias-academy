import { Skeleton } from "@/components/ui/Skeleton";

/**
 * Loading state for a portal tab, rendered by the portals' `loading.tsx`.
 *
 * Its real job is less the picture than the boundary. Every portal page reads
 * the session cookie, so every one is dynamic, and Next does not prefetch a
 * dynamic route at all unless it has a `loading.js` above it. Without one, a tab
 * click left the previous page frozen until the session check and the
 * Firestore read had both come back.
 *
 * Drawn inside `PortalShell`, so the header and tab bar stay put and only the
 * area under the tabs pulses: a heading, its intro line, then a short list —
 * the shape most portal pages share.
 */
export function PortalPageSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">Loading…</span>

      <Skeleton className="h-9 w-48" />
      <Skeleton className="mt-3 h-5 w-full max-w-xl" />

      <ul aria-hidden className="mt-8 space-y-3">
        {Array.from({ length: rows }, (_, index) => (
          <li
            key={index}
            className="flex items-center gap-6 border border-line bg-white px-5 py-4"
          >
            <div className="min-w-0 flex-1">
              <Skeleton className="h-5 w-2/3 max-w-sm" />
              <Skeleton className="mt-2 h-4 w-1/2 max-w-xs" />
            </div>
            <Skeleton className="h-6 w-20" />
          </li>
        ))}
      </ul>
    </div>
  );
}
