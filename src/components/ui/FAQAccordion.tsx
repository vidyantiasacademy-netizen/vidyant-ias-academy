import {
  CalendarDays,
  CircleHelp,
  FileCheck2,
  GraduationCap,
  Laptop,
  MapPin,
  Minus,
  PlayCircle,
  Plus,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils/cn";
import type { Faq } from "@/types";

interface FAQAccordionProps {
  faqs: Pick<Faq, "id" | "question" | "answer">[];
  className?: string;
  /** On a navy band: white questions on translucent cards, kesar accents. */
  onDark?: boolean;
  /** Lead each question with an icon tile picked from its wording. */
  withIcons?: boolean;
}

/** Topic → icon, matched against the question text (first match wins). */
const ICONS: [RegExp, LucideIcon][] = [
  [/beginner|start|fresher|new to/i, GraduationCap],
  [/online|hybrid|offline|classroom/i, Laptop],
  [/record/i, PlayCircle],
  [/mentor/i, UsersRound],
  [/evaluat|answer writing|test/i, FileCheck2],
  [/located|address|where|centre|center/i, MapPin],
  [/demo|batch|schedule|when|date/i, CalendarDays],
];

function iconFor(question: string): LucideIcon {
  return ICONS.find(([pattern]) => pattern.test(question))?.[1] ?? CircleHelp;
}

/**
 * Native disclosure elements — keyboard accessible with no client JavaScript.
 * Each question is a rounded card; the open one lifts with a kesar edge.
 */
export function FAQAccordion({ faqs, className, onDark = false, withIcons = false }: FAQAccordionProps) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {faqs.map((faq) => {
        const Icon = iconFor(faq.question);
        return (
          <details
            key={faq.id}
            className={cn(
              "group rounded-[1rem] border transition-colors duration-200",
              onDark
                ? "border-white/12 bg-white/[0.04] hover:border-white/30 open:border-kesar/60 open:bg-white/[0.07]"
                : "border-line/70 bg-[linear-gradient(90deg,color-mix(in_oklab,var(--color-kesar-100)_45%,#fff)_0%,#fff_70%)] shadow-soft hover:shadow-soft-hover open:border-kesar/60",
            )}
          >
            <summary
              className={cn(
                "flex cursor-pointer list-none items-center gap-4 px-4 py-3.5 text-left sm:px-5 [&::-webkit-details-marker]:hidden",
                withIcons ? "sm:gap-5" : "py-4",
              )}
            >
              {withIcons ? (
                <span
                  aria-hidden
                  className={cn(
                    "flex size-11 shrink-0 items-center justify-center rounded-[0.75rem] sm:size-12",
                    onDark ? "bg-kesar/15 text-kesar" : "bg-kesar-100 text-kesar-500",
                  )}
                >
                  <Icon className="size-5 sm:size-6" strokeWidth={1.75} />
                </span>
              ) : null}
              <h3
                className={cn(
                  "flex-1 text-body font-bold leading-snug transition-colors duration-200 sm:text-body-lg",
                  onDark ? "text-white group-hover:text-kesar" : "text-indigo group-hover:text-indigo-700",
                )}
              >
                {faq.question}
              </h3>
              <span
                aria-hidden
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-full transition-colors duration-200",
                  onDark
                    ? "text-white group-open:bg-kesar group-open:text-indigo-900"
                    : "text-indigo group-open:bg-indigo group-open:text-white",
                )}
              >
                <Plus className="size-5 group-open:hidden" />
                <Minus className="hidden size-5 group-open:block" />
              </span>
            </summary>
            <p
              className={cn(
                "max-w-[65ch] px-4 pb-5 text-body sm:px-5 sm:pr-16",
                withIcons && "sm:pl-[5.25rem]",
                onDark ? "text-white/85" : "text-ink-secondary",
              )}
            >
              {faq.answer}
            </p>
          </details>
        );
      })}
    </div>
  );
}
