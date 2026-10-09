import { ArrowRight, Check, Clock } from "lucide-react";
import Image from "next/image";

import { Card } from "@/components/ui/Card";
import { TrackedLink } from "@/components/ui/TrackedLink";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { COURSE_CATEGORY_LABELS } from "@/lib/courses/labels";
import { cn } from "@/lib/utils/cn";
import type { Course } from "@/types";

interface CourseCardProps {
  course: Course;
  /** Shorter CTA label, e.g. "Explore Foundation". */
  ctaLabel?: string;
  /** Number of feature ticks to show before "+n more". */
  featureLimit?: number;
  className?: string;
  /** Shows the course photo above the card body, e.g. on the homepage strip. */
  showImage?: boolean;
}

export function CourseCard({
  course,
  ctaLabel = "View Program",
  featureLimit = 6,
  className,
  showImage = false,
}: CourseCardProps) {
  const href = `/courses/${course.slug}`;
  const features = course.features.slice(0, featureLimit);
  const remaining = course.features.length - features.length;
  const teachers = course.faculty;

  return (
    <Card
      as="article"
      interactive
      padding="none"
      className={cn("group/card @container flex h-full flex-col overflow-hidden", className)}
    >
      {showImage && course.image.src ? (
        <div className="relative aspect-3/2 overflow-hidden border-b border-line bg-paper">
          <Image
            src={course.image.src}
            alt={course.image.alt}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 46vw, 85vw"
            placeholder={course.image.lqip ? "blur" : "empty"}
            blurDataURL={course.image.lqip}
            className="object-cover transition-transform duration-500 ease-[var(--ease-brand)] group-hover/card:scale-[1.03]"
          />
        </div>
      ) : null}
      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <p className="text-eyebrow font-semibold uppercase text-kesar-600">
          {COURSE_CATEGORY_LABELS[course.category]}
        </p>
        <h3 className="mt-3 text-h3 font-semibold">
          <TrackedLink
            href={href}
            event={ANALYTICS_EVENTS.courseView}
            payload={{ course: course.id, location: "course-card" }}
            className="transition-colors hover:text-kesar-600"
          >
            {course.title}
          </TrackedLink>
        </h3>
        <p className="mt-3 text-body text-ink-secondary">{course.shortDescription}</p>

        <p className="mt-5 inline-flex items-center gap-2 text-small text-ink-secondary">
          <Clock aria-hidden className="size-4 text-kesar-600" />
          {course.duration}
        </p>

        <ul className="mt-5 grid gap-2 @lg:grid-cols-2">
          {features.map((feature) => (
            <li key={feature} className="flex items-start gap-2 text-small text-ink">
              <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-kesar-600" />
              {feature}
            </li>
          ))}
          {remaining > 0 ? (
            <li className="text-small text-ink-muted">+{remaining} more</li>
          ) : null}
        </ul>

        {teachers.length > 0 ? (
          <p className="mt-6 text-small text-ink-muted">
            Faculty:{" "}
            <span className="text-ink-secondary">
              {teachers.map((teacher) => teacher.subject.split(",")[0]).join(" • ")}
            </span>
          </p>
        ) : null}
      </div>

      <div className="border-t border-line px-6 py-4 sm:px-7">
        <TrackedLink
          href={href}
          event={ANALYTICS_EVENTS.courseCtaClick}
          payload={{ course: course.id, location: "course-card" }}
          className="group inline-flex items-center gap-2 text-small font-semibold text-indigo transition-colors hover:text-kesar-600"
        >
          {ctaLabel}
          <ArrowRight
            aria-hidden
            className="size-4 transition-transform duration-200 ease-[var(--ease-brand)] group-hover:translate-x-1"
          />
        </TrackedLink>
      </div>
    </Card>
  );
}
