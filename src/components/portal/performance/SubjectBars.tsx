import { TriangleAlert } from "lucide-react";

import { WEAK_SUBJECT_PERCENT, type SubjectStat } from "@/lib/exam/analytics";

/**
 * Share of marks won per subject, weakest first.
 *
 * Every bar is the same hue — length carries the magnitude, and colouring the
 * weak ones red would make the colour depend on rank. The "needs work" call-out
 * is a status, so it travels as an icon and a word beside the bar rather than as
 * a paint job on it.
 */
export function SubjectBars({ subjects }: { subjects: SubjectStat[] }) {
  return (
    <ul className="space-y-4">
      {subjects.map((subject) => {
        const weak = subject.percent < WEAK_SUBJECT_PERCENT;
        const width = Math.max(0, Math.min(100, subject.percent));

        return (
          <li
            key={subject.subject}
            title={`${subject.subject}: ${subject.score} / ${subject.totalMarks} marks · ${subject.correctCount} correct, ${subject.wrongCount} wrong`}
          >
            <div className="flex items-baseline justify-between gap-3 text-small">
              <span className="flex min-w-0 items-center gap-2 font-semibold">
                <span className="truncate">{subject.subject}</span>
                {weak ? (
                  <span className="inline-flex shrink-0 items-center gap-1 text-eyebrow font-bold uppercase text-chilli-700">
                    <TriangleAlert aria-hidden className="size-3.5" />
                    Needs work
                  </span>
                ) : null}
              </span>
              <span className="shrink-0 tabular-nums">
                <span className="font-semibold">{subject.percent}%</span>
                <span className="text-ink-secondary">
                  {subject.accuracy !== null ? ` · ${subject.accuracy}% accurate` : ""}
                </span>
              </span>
            </div>

            <div className="mt-2 h-2.5 bg-paper">
              <div
                className="h-full bg-indigo-700 transition-[width] duration-500"
                style={{ width: `${width}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
