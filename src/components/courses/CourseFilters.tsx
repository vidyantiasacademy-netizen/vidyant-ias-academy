"use client";

import { useState } from "react";

import { CourseCard } from "@/components/courses/CourseCard";
import { cn } from "@/lib/utils/cn";
import type { Course, CourseCategory } from "@/types";

interface CourseFiltersProps {
  courses: Course[];
  filters: { id: CourseCategory | "all"; label: string }[];
}

export function CourseFilters({ courses, filters }: CourseFiltersProps) {
  const [active, setActive] = useState<CourseCategory | "all">("all");

  const visible =
    active === "all" ? courses : courses.filter((course) => course.category === active);

  return (
    <div>
      <div
        role="tablist"
        aria-label="Filter programs"
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
                "inline-flex h-10 items-center border px-4 text-small font-medium transition-colors",
                isActive
                  ? "border-indigo bg-indigo text-white"
                  : "border-line text-ink-secondary hover:border-indigo hover:text-indigo",
              )}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      <ul className="mt-8 grid gap-4 md:grid-cols-2 lg:gap-5">
        {visible.map((course) => (
          <li key={course.id}>
            <CourseCard course={course} />
          </li>
        ))}
      </ul>

      <p aria-live="polite" className="mt-6 text-small text-ink-muted">
        Showing {visible.length} of {courses.length} programs.
      </p>
    </div>
  );
}
