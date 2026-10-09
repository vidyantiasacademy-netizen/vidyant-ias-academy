"use client";

import { useState } from "react";

import { FacultyCard } from "@/components/faculty/FacultyCard";
import { cn } from "@/lib/utils/cn";
import type { Faculty, FacultyArea } from "@/types";

interface FacultyFiltersProps {
  members: Faculty[];
  filters: { id: FacultyArea | "all"; label: string }[];
}

export function FacultyFilters({ members, filters }: FacultyFiltersProps) {
  const [active, setActive] = useState<FacultyArea | "all">("all");

  const visible =
    active === "all"
      ? members
      : members.filter((member) => member.areas.includes(active));

  return (
    <div>
      <div
        role="tablist"
        aria-label="Filter faculty by subject area"
        className="flex flex-wrap gap-2 border-b border-line pb-5"
      >
        {filters.map((filter) => {
          const isActive = filter.id === active;
          return (
            <button
              key={filter.id}
              role="tab"
              type="button"
              aria-selected={isActive}
              onClick={() => setActive(filter.id)}
              className={cn(
                "rounded-full px-4 py-2 text-small font-medium transition-colors",
                isActive
                  ? "bg-indigo-gradient text-white"
                  : "border border-line text-ink-secondary hover:border-indigo hover:text-indigo",
              )}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      {visible.length > 0 ? (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {visible.map((member) => (
            <li key={member.id}>
              <FacultyCard member={member} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-8 text-body text-ink-secondary">
          No faculty are listed for this area yet. Ask the academic team which batches are
          running.
        </p>
      )}

      <p aria-live="polite" className="mt-6 text-small text-ink-muted">
        Showing {visible.length} of {members.length} faculty.
      </p>
    </div>
  );
}
