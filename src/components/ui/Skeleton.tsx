import { cn } from "@/lib/utils/cn";

/** Neutral loading block. Never animated beyond a slow pulse. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("animate-pulse rounded-md bg-paper-200/80", className)}
    />
  );
}

/** Card-shaped placeholder used by route-level loading states. */
export function CardSkeleton() {
  return (
    <div className="rounded-lg border border-line p-6">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="mt-4 h-6 w-3/4" />
      <Skeleton className="mt-3 h-4 w-full" />
      <Skeleton className="mt-2 h-4 w-5/6" />
      <Skeleton className="mt-6 h-4 w-28" />
    </div>
  );
}

export function CardGridSkeleton({
  count = 6,
  columns = "lg:grid-cols-3",
}: {
  count?: number;
  columns?: string;
}) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 lg:gap-5", columns)}>
      {Array.from({ length: count }, (_, index) => (
        <CardSkeleton key={index} />
      ))}
    </div>
  );
}
