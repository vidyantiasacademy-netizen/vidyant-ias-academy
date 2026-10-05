"use client";

import { Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition, type SubmitEvent } from "react";

import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { useToast } from "@/components/ui/Toast";
import { saveQuestionAction } from "@/lib/exam/authoring-actions";
import { cn } from "@/lib/utils/cn";
import type { Difficulty, Question } from "@/types/db";

/**
 * Writes one MCQ onto a paper.
 *
 * Options are kept as a plain list and lettered at save time, so removing
 * option B re-letters C to B and the marked answer moves with it. Students never
 * see these letters — the runner shuffles options per attempt — they exist so
 * the answer key reads naturally to the faculty member checking it.
 */

const MIN_OPTIONS = 2;
const MAX_OPTIONS = 8;
const LETTERS = "abcdefgh";

interface OptionDraft {
  text: string;
  correct: boolean;
}

function blankOptions(): OptionDraft[] {
  return Array.from({ length: 4 }, () => ({ text: "", correct: false }));
}

export function QuestionForm({
  testId,
  question,
  defaults,
}: {
  testId: string;
  /** Omitted when adding a question. */
  question?: Question;
  /** Pre-filled for a new question from the paper's own settings. */
  defaults: { subject: string; marks: number };
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const [multiple, setMultiple] = useState(question?.kind === "mcq-multiple");
  const [statement, setStatement] = useState(question?.statement ?? "");
  const [options, setOptions] = useState<OptionDraft[]>(
    question
      ? question.options.map((option) => ({
          text: option.text,
          correct: question.correctOptionIds.includes(option.id),
        }))
      : blankOptions(),
  );
  const [marks, setMarks] = useState(String(question?.marks ?? defaults.marks));
  const [subject, setSubject] = useState(question?.subject ?? defaults.subject);
  const [topic, setTopic] = useState(question?.topic ?? "");
  const [difficulty, setDifficulty] = useState<Difficulty>(question?.difficulty ?? "moderate");
  const [isPyq, setIsPyq] = useState(Boolean(question?.pyq));
  const [pyqExam, setPyqExam] = useState(question?.pyq?.exam ?? "UPSC CSE Prelims");
  const [pyqYear, setPyqYear] = useState(String(question?.pyq?.year ?? ""));
  const [explanation, setExplanation] = useState(question?.explanation ?? "");
  const [draft, setDraft] = useState(question?.status === "draft");

  function updateOption(index: number, patch: Partial<OptionDraft>) {
    setOptions((current) =>
      current.map((option, i) => {
        if (i === index) return { ...option, ...patch };
        // A single-answer question has one key: marking one unmarks the rest.
        if (patch.correct && !multiple) return { ...option, correct: false };
        return option;
      }),
    );
  }

  function switchKind(nextMultiple: boolean) {
    setMultiple(nextMultiple);
    if (!nextMultiple) {
      // Keep the first marked answer only, rather than silently saving a
      // single-answer question with two keys.
      let kept = false;
      setOptions((current) =>
        current.map((option) => {
          const correct = option.correct && !kept;
          if (correct) kept = true;
          return { ...option, correct };
        }),
      );
    }
  }

  function reset() {
    setStatement("");
    setOptions(blankOptions());
    setTopic("");
    setExplanation("");
    setPyqYear("");
    setErrors({});
  }

  function save(addAnother: boolean) {
    const lettered = options.map((option, index) => ({
      id: LETTERS[index],
      text: option.text.trim(),
      correct: option.correct,
    }));

    const payload = {
      kind: multiple ? "mcq-multiple" : "mcq-single",
      subject: subject.trim(),
      topic: topic.trim() || null,
      difficulty,
      pyq: isPyq ? { exam: pyqExam.trim(), year: Number(pyqYear) } : null,
      statement: statement.trim(),
      imagePath: question?.imagePath ?? null,
      options: lettered.map(({ id, text }) => ({ id, text })),
      correctOptionIds: lettered.filter((option) => option.correct).map((option) => option.id),
      modelAnswer: null,
      explanation: explanation.trim() || null,
      marks: Number(marks),
      status: draft ? "draft" : "published",
    };

    startTransition(async () => {
      const result = await saveQuestionAction({
        testId,
        questionId: question?.id ?? null,
        question: payload,
      });

      if (!result.ok) {
        setErrors(result.fieldErrors ?? {});
        showToast("error", result.message);
        return;
      }

      showToast("success", question ? "Question saved." : "Question added.");

      if (addAnother) {
        reset();
        router.refresh();
        document.getElementById("statement")?.focus();
      } else {
        router.push(`/admin/tests/${testId}`);
        router.refresh();
      }
    });
  }

  function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    save((event.submitter as HTMLButtonElement | null)?.value === "another");
  }

  const optionError = errors.options?.[0] ?? errors.correctOptionIds?.[0];

  return (
    <form onSubmit={submit} noValidate className="space-y-6">
      <Card padding="md" className="space-y-5">
        <fieldset>
          <legend className="text-small font-medium text-indigo">Answer type</legend>
          <div className="mt-2 flex flex-wrap gap-5 text-body">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="kind"
                className="size-4 accent-indigo"
                checked={!multiple}
                onChange={() => switchKind(false)}
              />
              One correct option
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="kind"
                className="size-4 accent-indigo"
                checked={multiple}
                onChange={() => switchKind(true)}
              />
              More than one correct option
            </label>
          </div>
        </fieldset>

        <Field
          id="statement"
          label="Question"
          required
          hint="Statement-style questions: put each statement on its own line."
          error={errors.statement?.[0]}
        >
          <Textarea
            id="statement"
            rows={6}
            value={statement}
            onChange={(event) => setStatement(event.target.value)}
            aria-invalid={Boolean(errors.statement) || undefined}
          />
        </Field>

        <fieldset aria-describedby={optionError ? "options-error" : undefined}>
          <legend className="text-small font-medium text-indigo">
            Options{" "}
            <span className="font-normal text-ink-secondary">
              — mark the correct {multiple ? "ones" : "one"}
            </span>
          </legend>

          <ol className="mt-3 space-y-3">
            {options.map((option, index) => (
              <li key={index} className="flex items-center gap-3">
                <label
                  className={cn(
                    "flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-md border text-small font-semibold uppercase transition-colors",
                    option.correct
                      ? "border-success bg-success-50 text-success"
                      : "border-line-strong text-ink-secondary hover:border-indigo",
                  )}
                >
                  <input
                    type={multiple ? "checkbox" : "radio"}
                    name="correct"
                    className="sr-only"
                    checked={option.correct}
                    onChange={(event) => updateOption(index, { correct: event.target.checked })}
                  />
                  {LETTERS[index]}
                  <span className="sr-only">
                    {option.correct ? " — marked correct" : " — mark as correct"}
                  </span>
                </label>

                <Input
                  aria-label={`Option ${LETTERS[index].toUpperCase()}`}
                  value={option.text}
                  onChange={(event) => updateOption(index, { text: event.target.value })}
                />

                <button
                  type="button"
                  onClick={() => setOptions((current) => current.filter((_, i) => i !== index))}
                  disabled={options.length <= MIN_OPTIONS}
                  className="flex size-10 shrink-0 items-center justify-center rounded-md text-ink-secondary hover:bg-paper hover:text-danger disabled:opacity-40"
                  aria-label={`Remove option ${LETTERS[index].toUpperCase()}`}
                >
                  <X aria-hidden className="size-4" />
                </button>
              </li>
            ))}
          </ol>

          {options.length < MAX_OPTIONS ? (
            <Button
              variant="ghost"
              size="sm"
              className="mt-3"
              onClick={() => setOptions((current) => [...current, { text: "", correct: false }])}
            >
              <Plus aria-hidden className="size-4" />
              Add option
            </Button>
          ) : null}

          {optionError ? (
            <p id="options-error" role="alert" className="mt-2 text-small font-medium text-danger">
              {optionError}
            </p>
          ) : null}
        </fieldset>

        <Field
          id="explanation"
          label="Explanation"
          hint="Shown to students with the answer key, once results are released."
          error={errors.explanation?.[0]}
        >
          <Textarea
            id="explanation"
            rows={4}
            value={explanation}
            onChange={(event) => setExplanation(event.target.value)}
          />
        </Field>
      </Card>

      <Card padding="md" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Field id="marks" label="Marks" required error={errors.marks?.[0]}>
          <Input
            id="marks"
            type="number"
            inputMode="decimal"
            min={0}
            step="any"
            value={marks}
            onChange={(event) => setMarks(event.target.value)}
          />
        </Field>
        <Field id="subject" label="Subject" required error={errors.subject?.[0]}>
          <Input
            id="subject"
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            placeholder="Polity"
          />
        </Field>
        <Field id="topic" label="Topic" error={errors.topic?.[0]}>
          <Input
            id="topic"
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
            placeholder="Fundamental Rights"
          />
        </Field>
        <Field id="difficulty" label="Difficulty" required>
          <Select
            id="difficulty"
            value={difficulty}
            onChange={(event) => setDifficulty(event.target.value as Difficulty)}
          >
            <option value="easy">Easy</option>
            <option value="moderate">Moderate</option>
            <option value="hard">Hard</option>
          </Select>
        </Field>

        <label className="flex items-center gap-3 text-body sm:col-span-2 lg:col-span-4">
          <input
            type="checkbox"
            className="size-4 accent-indigo"
            checked={isPyq}
            onChange={(event) => setIsPyq(event.target.checked)}
          />
          This is a previous-year question
        </label>

        {isPyq ? (
          <>
            <Field id="pyqExam" label="Exam" required error={errors.pyq?.[0]} className="sm:col-span-1 lg:col-span-3">
              <Input id="pyqExam" value={pyqExam} onChange={(event) => setPyqExam(event.target.value)} />
            </Field>
            <Field id="pyqYear" label="Year" required>
              <Input
                id="pyqYear"
                type="number"
                inputMode="numeric"
                min={1950}
                max={2100}
                value={pyqYear}
                onChange={(event) => setPyqYear(event.target.value)}
              />
            </Field>
          </>
        ) : null}

        <label className="flex items-start gap-3 text-body sm:col-span-2 lg:col-span-4">
          <input
            type="checkbox"
            className="mt-1 size-4 accent-indigo"
            checked={draft}
            onChange={(event) => setDraft(event.target.checked)}
          />
          <span>
            Keep as draft
            <span className="block text-small text-ink-secondary">
              A draft question is left out of the paper and does not count towards its total.
            </span>
          </span>
        </label>
      </Card>

      <div className="flex flex-wrap justify-end gap-3">
        <ButtonLink href={`/admin/tests/${testId}`} variant="ghost">
          Cancel
        </ButtonLink>
        {question ? null : (
          <Button type="submit" variant="secondary" value="another" disabled={pending}>
            Save and add another
          </Button>
        )}
        <Button type="submit" value="done" disabled={pending}>
          {pending ? "Saving…" : "Save question"}
        </Button>
      </div>
    </form>
  );
}
