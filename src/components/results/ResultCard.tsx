import { BadgeCheck } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils/cn";
import type { Result } from "@/types";

const stageLabels: Record<Result["stage"], string> = {
  prelims: "Prelims Qualified",
  mains: "Mains Qualified",
  interview: "Interview Qualified",
  final: "Final Selection",
};

export function ResultCard({ result, className }: { result: Result; className?: string }) {
  return (
    <Card as="article" className={cn("flex h-full flex-col", className)}>
      <div className="flex items-center justify-between gap-3">
        <Badge tone="neutral">{result.year}</Badge>
        {result.verified ? (
          <span className="inline-flex items-center gap-1.5 text-small font-medium text-success">
            <BadgeCheck aria-hidden className="size-4" />
            Verified
          </span>
        ) : null}
      </div>
      <h3 className="mt-4 text-h4 font-semibold">{result.studentName}</h3>
      <p className="mt-1 text-small font-medium uppercase tracking-[0.08em] text-kesar-600">
        {stageLabels[result.stage]}
        {result.rank ? ` • AIR ${result.rank}` : ""}
      </p>
      {result.optional ? (
        <p className="mt-3 text-small text-ink-secondary">Optional: {result.optional}</p>
      ) : null}
      {result.note ? (
        <p className="mt-3 text-small text-ink-secondary">{result.note}</p>
      ) : null}
    </Card>
  );
}
