"use client";

import { FileText, KeyRound, Search, X } from "lucide-react";
import { useDeferredValue, useMemo, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { PyqPaper } from "@/lib/sanity/types";
import { cn } from "@/lib/utils/cn";

import {
  PYQ_CATEGORIES,
  buildCatalogue,
  countPapers,
  filterCatalogue,
  formatSize,
  type PyqFilters,
  type PyqStage,
} from "./catalogue";

/**
 * The PYQ shelf: every paper, grouped by category, searchable.
 *
 * The whole catalogue is in the page already (about a thousand rows), so
 * filtering is in memory and instant — no request per keystroke, which on a
 * patchy connection would be the difference between usable and not.
 *
 * Each row is a paper and its years are the links, because that is how
 * students revise PYQs: one paper, year after year, to see what UPSC keeps
 * coming back to.
 */

const STAGES: { id: PyqStage | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "prelims", label: "Prelims" },
  { id: "mains", label: "Mains" },
];

const INITIAL: PyqFilters = { query: "", stage: "all", category: "all", year: "all" };

export function PyqLibrary({ papers }: { papers: PyqPaper[] }) {
  const catalogue = useMemo(() => buildCatalogue(papers), [papers]);
  const years = useMemo(
    () => [...new Set(papers.map((paper) => paper.year))].sort((a, b) => b - a),
    [papers],
  );
  const present = useMemo(() => new Set(catalogue.map((row) => row.category)), [catalogue]);

  const [filters, setFilters] = useState<PyqFilters>(INITIAL);
  // Typing stays responsive while a broad query re-renders hundreds of links.
  const deferred = useDeferredValue(filters);

  const visible = useMemo(() => filterCatalogue(catalogue, deferred), [catalogue, deferred]);
  const total = useMemo(() => countPapers(catalogue), [catalogue]);
  const shown = countPapers(visible);

  const categories = PYQ_CATEGORIES.filter(
    (category) =>
      present.has(category.id) && (filters.stage === "all" || category.stage === filters.stage),
  );
  const isFiltered =
    filters.query !== "" || filters.stage !== "all" || filters.category !== "all" || filters.year !== "all";

  const update = (patch: Partial<PyqFilters>) => setFilters((current) => ({ ...current, ...patch }));

  if (total === 0) {
    return (
      <EmptyState
        icon={<FileText aria-hidden className="size-6" />}
        title="No papers yet"
        description="Previous-year papers appear here as soon as they are published."
      />
    );
  }

  return (
    <div>
      <div className="grid gap-4 border-b border-line pb-6 md:grid-cols-[1fr_auto]">
        <label className="relative block">
          <span className="sr-only">Search papers</span>
          <Search
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-ink-muted"
          />
          <Input
            type="search"
            value={filters.query}
            onChange={(event) => update({ query: event.target.value })}
            placeholder="Search — “GS 3”, “sociology 2019”, “ethics”, “CSAT”"
            className="pr-11 pl-11 [&::-webkit-search-cancel-button]:hidden"
            autoComplete="off"
            spellCheck={false}
          />
          {filters.query ? (
            <button
              type="button"
              onClick={() => update({ query: "" })}
              aria-label="Clear search"
              className="absolute top-1/2 right-2 flex size-8 -translate-y-1/2 items-center justify-center text-ink-muted hover:text-indigo"
            >
              <X aria-hidden className="size-4" />
            </button>
          ) : null}
        </label>

        <label className="flex items-center gap-3">
          <span className="text-small font-bold text-indigo">Year</span>
          <Select
            value={String(filters.year)}
            onChange={(event) =>
              update({ year: event.target.value === "all" ? "all" : Number(event.target.value) })
            }
            className="min-w-36"
          >
            <option value="all">All years</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </Select>
        </label>

        <div className="flex flex-col gap-3 md:col-span-2">
          <div role="group" aria-label="Stage" className="flex flex-wrap gap-2">
            {STAGES.map((stage) => (
              <Chip
                key={stage.id}
                active={filters.stage === stage.id}
                onClick={() => {
                  const category = PYQ_CATEGORIES.find((entry) => entry.id === filters.category);
                  // A Mains category makes no sense once Prelims is chosen.
                  const keep = stage.id === "all" || category?.stage === stage.id;
                  update({ stage: stage.id, category: keep ? filters.category : "all" });
                }}
                strong
              >
                {stage.label}
              </Chip>
            ))}
          </div>

          <div role="group" aria-label="Category" className="flex flex-wrap gap-2">
            <Chip active={filters.category === "all"} onClick={() => update({ category: "all" })}>
              All categories
            </Chip>
            {categories.map((category) => (
              <Chip
                key={category.id}
                active={filters.category === category.id}
                onClick={() => update({ category: category.id })}
              >
                {filters.stage === "all" ? category.label : category.label.replace(/^\w+ · /, "")}
              </Chip>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p aria-live="polite" className="text-small text-ink-muted">
          {isFiltered ? `${shown} of ${total} papers` : `${total} papers`}, {years.at(-1)}–{years[0]}.
        </p>
        {isFiltered ? (
          <Button variant="ghost" size="sm" onClick={() => setFilters(INITIAL)}>
            <X aria-hidden className="size-4" />
            Clear filters
          </Button>
        ) : null}
      </div>

      {visible.length === 0 ? (
        <EmptyState
          className="mt-6"
          icon={<Search aria-hidden className="size-6" />}
          title="No papers match"
          description="Try the subject instead of the paper number, or clear the year and category filters."
          action={
            <Button variant="secondary" size="sm" onClick={() => setFilters(INITIAL)}>
              Clear filters
            </Button>
          }
        />
      ) : (
        <div className="mt-6 flex flex-col gap-10">
          {PYQ_CATEGORIES.map((category) => {
            const rows = visible.filter((row) => row.category === category.id);
            if (rows.length === 0) return null;

            return (
              <section key={category.id} aria-labelledby={`pyq-${category.id}`}>
                <div className="flex flex-wrap items-baseline justify-between gap-2 border-b-2 border-indigo pb-3">
                  <h2 id={`pyq-${category.id}`} className="text-h4 font-bold text-indigo">
                    {category.label}
                  </h2>
                  <p className="text-small text-ink-muted">{category.description}</p>
                </div>

                <ul className="divide-y divide-line">
                  {rows.map((row) => (
                    <li
                      key={row.key}
                      className="grid gap-3 py-4 sm:grid-cols-[minmax(10rem,14rem)_1fr] sm:gap-6"
                    >
                      <h3 className="text-body font-bold text-ink">{row.title}</h3>
                      <div className="flex flex-col gap-2.5">
                        {row.lines.map((line) => (
                          <div
                            key={line.label ?? "single"}
                            className="flex flex-wrap items-center gap-1.5"
                          >
                            {line.label ? (
                              <span className="mr-1 w-16 shrink-0 text-small font-semibold text-ink-secondary">
                                {line.label}
                              </span>
                            ) : null}
                            {line.papers.map((paper) => (
                              <YearLink key={paper._id} paper={paper} />
                            ))}
                          </div>
                        ))}
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Chip({
  active,
  strong = false,
  onClick,
  children,
}: {
  active: boolean;
  strong?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "inline-flex h-10 items-center border px-4 text-small transition-colors",
        strong ? "font-bold" : "font-medium",
        active
          ? "border-indigo bg-indigo text-white"
          : "border-line text-ink-secondary hover:border-indigo hover:text-indigo",
      )}
    >
      {children}
    </button>
  );
}

/** One year of one paper: opens the PDF, with the answer key beside it when there is one. */
function YearLink({ paper }: { paper: PyqPaper }) {
  const details = [formatSize(paper.size), paper.pageCount ? `${paper.pageCount} pages` : null]
    .filter(Boolean)
    .join(", ");
  const name = `${paper.paper}, ${paper.stage === "prelims" ? "Prelims" : "Mains"} ${paper.year}`;

  return (
    <span className="inline-flex">
      <a
        href={paper.url!}
        target="_blank"
        rel="noopener noreferrer"
        title={details ? `${name} — PDF, ${details}` : `${name} — PDF`}
        aria-label={`${name}, PDF${details ? `, ${details}` : ""}`}
        className="inline-flex h-9 min-w-14 items-center justify-center border border-line bg-white px-3 text-small font-semibold tabular-nums text-indigo transition-colors hover:border-indigo hover:bg-indigo hover:text-white"
      >
        {paper.year}
      </a>
      {paper.answerKeyUrl ? (
        <a
          href={paper.answerKeyUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${name}, answer key`}
          title="Answer key"
          className="-ml-px inline-flex h-9 w-9 items-center justify-center border border-line bg-kesar-100 text-kesar-700 transition-colors hover:border-indigo hover:bg-indigo hover:text-white"
        >
          <KeyRound aria-hidden className="size-4" />
        </a>
      ) : null}
    </span>
  );
}
