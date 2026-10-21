import { TriangleAlert } from "lucide-react";

import { ANSWER_RUBRIC, RUBRIC_MAX, RUBRIC_SCALE } from "@/lib/answer-writing/rubric";
import type { RubricKey } from "@/types/db";

/**
 * The answer-writing rubric as bars — one copy's scores, a student's average
 * across copies, or a batch's average on one paper.
 *
 * Same treatment as `SubjectBars`: one hue, length carries the value, and the
 * weakest criterion is called out with an icon and a word rather than a colour.
 */
export function RubricBars({
  scores,
  weakest = null,
}: {
  /** 1–5, decimals allowed for averages. `null` for an unscored criterion. */
  scores: Partial<Record<RubricKey, number | null>>;
  /** The criterion to call out as the one to work on. */
  weakest?: RubricKey | null;
}) {
  return (
    <ul className="space-y-4">
      {ANSWER_RUBRIC.map(({ key, label, description }) => {
        const value = scores[key] ?? null;
        const width = value === null ? 0 : (value / RUBRIC_MAX) * 100;
        const word = value !== null && Number.isInteger(value) ? RUBRIC_SCALE[value] : null;

        return (
          <li key={key} title={description}>
            <div className="flex items-baseline justify-between gap-3 text-small">
              <span className="flex min-w-0 items-center gap-2 font-semibold">
                <span className="truncate">{label}</span>
                {weakest === key ? (
                  <span className="inline-flex shrink-0 items-center gap-1 text-eyebrow font-bold uppercase text-chilli-700">
                    <TriangleAlert aria-hidden className="size-3.5" />
                    Focus here
                  </span>
                ) : null}
              </span>
              <span className="shrink-0 tabular-nums">
                {value === null ? (
                  <span className="text-ink-secondary">Not scored</span>
                ) : (
                  <>
                    <span className="font-semibold">
                      {value} / {RUBRIC_MAX}
                    </span>
                    {word ? <span className="text-ink-secondary"> · {word}</span> : null}
                  </>
                )}
              </span>
            </div>

            <div className="mt-2 h-2.5 bg-paper" aria-hidden>
              <div
                className="h-full bg-indigo-700 transition-[width] duration-500"
                style={{ width: `${width}%` }}
              />
            </div>
            <p className="mt-1.5 text-small text-ink-secondary">{description}</p>
          </li>
        );
      })}
    </ul>
  );
}
