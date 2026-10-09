"use client";

import { useState } from "react";

import { ResourceCard } from "@/components/resources/ResourceCard";
import { cn } from "@/lib/utils/cn";
import type { Resource, ResourceTrack } from "@/types";

interface ResourceFiltersProps {
  resources: Resource[];
  filters: { id: ResourceTrack | "all"; label: string }[];
}

export function ResourceFilters({ resources, filters }: ResourceFiltersProps) {
  const [active, setActive] = useState<ResourceTrack | "all">("all");

  const visible =
    active === "all"
      ? resources
      : resources.filter((resource) => resource.tracks.includes(active));

  return (
    <div>
      <div
        role="tablist"
        aria-label="Filter resources"
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

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
        {visible.map((resource) => (
          <li key={resource.id}>
            <ResourceCard resource={resource} />
          </li>
        ))}
      </ul>

      <p aria-live="polite" className="mt-6 text-small text-ink-muted">
        Showing {visible.length} of {resources.length} resources.
      </p>
    </div>
  );
}
