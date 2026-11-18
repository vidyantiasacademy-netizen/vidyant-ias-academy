"use client";

import Image from "next/image";

import { QuestionStatement } from "@/components/exam/QuestionStatement";
import type { ExamQuestion } from "@/lib/exam/types";
import { cn } from "@/lib/utils/cn";

/**
 * One question. One at a time, as the real CBT shows it.
 *
 * Showing the whole paper at once would be kinder to read and much easier to
 * photograph: a single screenshot would carry a hundred questions out of the
 * sitting. One question per screen makes leaking a paper a hundred deliberate
 * actions instead of one, and matches what the student will face in the exam
 * hall.
 *
 * Option letters are positional (A, B, C…) and the order is this attempt's own,
 * so the letter a student reads is not the letter anyone else reads.
 */

const LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H"];

export function QuestionPanel({
  question,
  index,
  total,
  selected,
  onSelect,
  watermark,
}: {
  question: ExamQuestion;
  index: number;
  total: number;
  selected: string[];
  onSelect: (optionIds: string[]) => void;
  /** Identity drawn across the paper. `null` turns the watermark off. */
  watermark: string | null;
}) {
  const multiple = question.kind === "mcq-multiple";

  function toggle(optionId: string) {
    if (!multiple) {
      onSelect(selected[0] === optionId ? [] : [optionId]);
      return;
    }

    onSelect(
      selected.includes(optionId)
        ? selected.filter((id) => id !== optionId)
        : [...selected, optionId],
    );
  }

  return (
    <div className="relative overflow-hidden border border-line bg-white p-6 sm:p-8">
      {watermark ? (
        // Deterrent, not protection: it survives a photograph of the screen and
        // makes the source of a leaked paper obvious. Low contrast so it does
        // not fight the question text, and inert to pointers and screen readers.
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 select-none overflow-hidden"
        >
          <div className="-rotate-12 whitespace-nowrap text-center text-h3 font-semibold leading-[3.5] text-ink/[0.045]">
            {Array.from({ length: 8 }, (_, line) => (
              <div key={line}>{`${watermark}  ·  `.repeat(6)}</div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="relative">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <p className="text-eyebrow font-semibold uppercase text-ink-secondary">
            Question {index + 1} of {total}
            {question.subject ? ` · ${question.subject}` : ""}
          </p>
          <p className="text-small text-ink-secondary tabular-nums">
            {question.marks} {question.marks === 1 ? "mark" : "marks"}
            {multiple ? " · more than one answer" : ""}
          </p>
        </div>

        <QuestionStatement statement={question.statement} className="mt-4 text-body-lg" />

        {question.imageUrl ? (
          <Image
            src={question.imageUrl}
            alt=""
            width={960}
            height={540}
            unoptimized
            className="mt-5 h-auto w-full max-w-xl border border-line"
          />
        ) : null}

        <ul className="mt-6 space-y-3">
          {question.options.map((option, optionIndex) => {
            const isSelected = selected.includes(option.id);

            return (
              <li key={option.id}>
                <label
                  className={cn(
                    "flex cursor-pointer items-start gap-3 border p-4 transition-[background-color,border-color] duration-150",
                    isSelected
                      ? "border-indigo bg-indigo-100"
                      : "border-line bg-white hover:border-line-strong",
                  )}
                >
                  <input
                    type={multiple ? "checkbox" : "radio"}
                    name={`question-${question.id}`}
                    checked={isSelected}
                    onChange={() => toggle(option.id)}
                    className="mt-1 size-4 accent-[var(--color-indigo)]"
                  />
                  <span className="text-body">
                    <span className="mr-2 font-semibold">
                      {LETTERS[optionIndex] ?? optionIndex + 1}.
                    </span>
                    {option.text}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
