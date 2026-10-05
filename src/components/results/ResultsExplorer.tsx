"use client";

import { useMemo, useState } from "react";

import { ResultCard } from "@/components/results/ResultCard";
import { cn } from "@/lib/utils/cn";
import type { ExamStage, Result } from "@/types";

const STAGE_FILTERS: { id: ExamStage | "all"; label: string }[] = [
  { id: "all", label: "All stages" },
  { id: "prelims", label: "Prelims" },
  { id: "mains", label: "Mains" },
  { id: "interview", label: "Interview" },
  { id: "final", label: "Final" },
];

export function ResultsExplorer({ results }: { results: Result[] }) {
  const [year, setYear] = useState<string>("all");
  const [stage, setStage] = useState<ExamStage | "all">("all");

  const years = useMemo(
    () => Array.from(new Set(results.map((item) => item.year))).sort((a, b) => Number(b) - Number(a)),
    [results],
  );

  const visible = results.filter(
    (item) =>
      (year === "all" || item.year === year) && (stage === "all" || item.stage === stage),
  );

  return (
    <div>
      <div className="flex flex-col gap-5 border-b border-line pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div
          role="tablist"
          aria-label="Filter results by exam stage"
          className="flex flex-wrap gap-2"
        >
          {STAGE_FILTERS.map((filter) => {
            const isActive = filter.id === stage;
            return (
              <button
                key={filter.id}
                role="tab"
                type="button"
                aria-selected={isActive}
                onClick={() => setStage(filter.id)}
                className={cn(
                  "rounded-full px-4 py-2 text-small font-medium transition-colors",
                  isActive
                    ? "bg-indigo text-white"
                    : "border border-line text-ink-secondary hover:border-indigo hover:text-indigo",
                )}
              >
                {filter.label}
              </button>
            );
          })}
        </div>

        <label className="flex items-center gap-2.5 text-small font-medium text-indigo">
          Year
          <select
            value={year}
            onChange={(event) => setYear(event.target.value)}
            className="rounded-md border border-line-strong bg-white px-3 py-2 text-small"
          >
            <option value="all">All years</option>
            {years.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
        {visible.map((result) => (
          <li key={result.id}>
            <ResultCard result={result} />
          </li>
        ))}
      </ul>

      <p aria-live="polite" className="mt-6 text-small text-ink-muted">
        Showing {visible.length} of {results.length} verified results.
      </p>
    </div>
  );
}
