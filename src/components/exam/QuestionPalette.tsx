"use client";

import { cn } from "@/lib/utils/cn";

/**
 * The question grid, as in the real CBT: every question reachable in one click,
 * with its state visible without opening it.
 *
 * The numbers are positions in *this* student's permuted paper, not identifiers.
 * Two students comparing "number 12" are comparing different questions, which is
 * the point of the shuffle — so nothing here exposes a question id.
 *
 * State is drawn with shape and fill rather than colour alone (a filled square
 * for answered, a ring for review, a hairline for seen-and-skipped): roughly one
 * in twelve male students cannot rely on a red/green distinction, and an exam is
 * not the place to find that out.
 */

export type PaletteState = "answered" | "marked" | "seen" | "untouched";

const STATE_STYLES: Record<PaletteState, string> = {
  answered: "bg-indigo text-white border-indigo",
  marked: "bg-indigo-100 text-indigo-900 border-indigo-700 ring-2 ring-indigo-700/30",
  seen: "bg-white text-ink border-line-strong",
  untouched: "bg-paper text-ink-secondary border-paper-200",
};

const STATE_LABELS: Record<PaletteState, string> = {
  answered: "answered",
  marked: "marked for review",
  seen: "seen, not answered",
  untouched: "not visited",
};

export function QuestionPalette({
  states,
  current,
  onJump,
}: {
  states: PaletteState[];
  current: number;
  onJump: (index: number) => void;
}) {
  return (
    <div>
      <ul className="grid grid-cols-6 gap-2 sm:grid-cols-8 lg:grid-cols-5">
        {states.map((state, index) => (
          <li key={index}>
            <button
              type="button"
              onClick={() => onJump(index)}
              aria-current={index === current ? "true" : undefined}
              aria-label={`Question ${index + 1}, ${STATE_LABELS[state]}`}
              className={cn(
                "flex size-10 items-center justify-center border text-small font-semibold tabular-nums",
                "transition-[background-color,border-color,transform] duration-150",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]",
                STATE_STYLES[state],
                index === current && "ring-2 ring-offset-2 ring-ink",
              )}
            >
              {index + 1}
            </button>
          </li>
        ))}
      </ul>

      <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-2 text-eyebrow uppercase text-ink-secondary">
        {(Object.keys(STATE_STYLES) as PaletteState[]).map((state) => (
          <div key={state} className="flex items-center gap-2">
            <dt aria-hidden className={cn("size-3.5 border", STATE_STYLES[state])} />
            <dd>{STATE_LABELS[state]}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
