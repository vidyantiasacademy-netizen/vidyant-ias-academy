"use client";

import { Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition, type SubmitEvent } from "react";

import type { CourseOption } from "@/components/admin/TestForm";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";
import { createMainsPaperAction, updateMainsPaperAction } from "@/lib/answer-writing/staff-actions";
import { isoToIstInput, istInputToIso } from "@/lib/exam/ist";
import type { MainsQuestionSlot, Test } from "@/types/db";

/**
 * Creates or edits a Mains answer-writing paper's settings and marking scheme.
 * The question paper PDF is uploaded on the paper's own page, once it exists —
 * its storage path is named after the paper.
 *
 * The scheme is what evaluators mark against, question by question; the paper's
 * question count and total marks are computed from it, so they cannot disagree.
 */

interface SlotRow {
  label: string;
  maxMarks: string;
  wordLimit: string;
}

const toRow = (slot: MainsQuestionSlot): SlotRow => ({
  label: slot.label,
  maxMarks: String(slot.maxMarks),
  wordLimit: slot.wordLimit === null ? "" : String(slot.wordLimit),
});

function rows(count: number, start: number, maxMarks: number, wordLimit: number | null): SlotRow[] {
  return Array.from({ length: count }, (_, index) =>
    toRow({ label: `Q${start + index}`, maxMarks, wordLimit }),
  );
}

/** Common UPSC Mains shapes, so nobody types twenty rows by hand. */
const PRESETS: { label: string; durationMinutes: number; scheme: () => SlotRow[] }[] = [
  {
    label: "GS paper — 10 × 10 + 10 × 15 marks",
    durationMinutes: 180,
    scheme: () => [...rows(10, 1, 10, 150), ...rows(10, 11, 15, 250)],
  },
  {
    label: "Essay — 2 × 125 marks",
    durationMinutes: 180,
    scheme: () => rows(2, 1, 125, 1100),
  },
  {
    label: "Daily practice — 2 × 10 marks",
    durationMinutes: 20,
    scheme: () => rows(2, 1, 10, 150),
  },
];

function errorFor(errors: Record<string, string[]>, key: string): string | undefined {
  return errors[key]?.[0];
}

export function MainsPaperForm({
  courses,
  test,
  lockReason = null,
}: {
  courses: CourseOption[];
  /** Omitted when creating a paper. */
  test?: Test;
  lockReason?: string | null;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const [courseId, setCourseId] = useState(
    test?.courseId ??
      courses.find((course) => /mains/i.test(course.title))?.id ??
      courses[0]?.id ??
      "",
  );
  const [title, setTitle] = useState(test?.title ?? "");
  const [subject, setSubject] = useState(test?.subject ?? "");
  const [durationMinutes, setDurationMinutes] = useState(String(test?.durationMinutes ?? 180));
  const [opensAt, setOpensAt] = useState(isoToIstInput(test?.opensAt ?? null));
  const [closesAt, setClosesAt] = useState(isoToIstInput(test?.closesAt ?? null));
  const [resultsFrom, setResultsFrom] = useState(isoToIstInput(test?.resultsVisibleFrom ?? null));
  const [scheme, setScheme] = useState<SlotRow[]>(
    test?.markingScheme?.length ? test.markingScheme.map(toRow) : PRESETS[0].scheme(),
  );

  const locked = lockReason !== null;
  const totalMarks = scheme.reduce((sum, row) => sum + (Number(row.maxMarks) || 0), 0);

  function updateRow(index: number, patch: Partial<SlotRow>) {
    setScheme((current) => current.map((row, at) => (at === index ? { ...row, ...patch } : row)));
  }

  function addRow() {
    setScheme((current) => {
      const last = current.at(-1);
      return [
        ...current,
        {
          label: `Q${current.length + 1}`,
          maxMarks: last?.maxMarks ?? "10",
          wordLimit: last?.wordLimit ?? "150",
        },
      ];
    });
  }

  function applyPreset(index: number) {
    const preset = PRESETS[index];
    if (!preset) return;

    if (scheme.length > 0 && !window.confirm(`Replace the marking scheme with "${preset.label}"?`)) return;

    setScheme(preset.scheme());
    setDurationMinutes(String(preset.durationMinutes));
  }

  function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const fields = {
      courseId,
      title: title.trim(),
      subject: subject.trim() || null,
      durationMinutes: Number(durationMinutes),
      opensAt: istInputToIso(opensAt),
      closesAt: istInputToIso(closesAt),
      resultsVisibleFrom: istInputToIso(resultsFrom),
      markingScheme: scheme.map((row) => ({
        label: row.label.trim(),
        maxMarks: Number(row.maxMarks),
        wordLimit: row.wordLimit.trim() ? Number(row.wordLimit) : null,
      })),
    };

    startTransition(async () => {
      const result = test
        ? await updateMainsPaperAction({ testId: test.id, fields })
        : await createMainsPaperAction(fields);

      if (!result.ok) {
        setErrors(result.fieldErrors ?? {});
        showToast("error", result.message);
        return;
      }

      setErrors({});
      showToast("success", test ? "Paper settings saved." : "Paper created. Upload its question paper next.");
      router.push(`/admin/answer-writing/${result.data.id}`);
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-6">
      {lockReason ? (
        <p className="border border-line-strong bg-paper px-4 py-3 text-small text-ink">{lockReason}</p>
      ) : null}

      <Card padding="md" className="grid gap-5 sm:grid-cols-2">
        <Field id="title" label="Title" required error={errorFor(errors, "title")} className="sm:col-span-2">
          <Input
            id="title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="GS Paper II — Answer Writing Test 04"
            aria-invalid={Boolean(errors.title) || undefined}
            required
          />
        </Field>

        <Field
          id="courseId"
          label="Course"
          required
          hint="Only students enrolled in this course see the paper."
          error={errorFor(errors, "courseId")}
        >
          <Select
            id="courseId"
            value={courseId}
            onChange={(event) => setCourseId(event.target.value)}
            disabled={locked}
            required
          >
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
                {course.status === "published" ? "" : ` (${course.status})`}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          id="subject"
          label="Paper"
          hint="e.g. GS Paper II, Essay, Ethics. Used to group scores on the Performance board."
          error={errorFor(errors, "subject")}
        >
          <Input id="subject" value={subject} onChange={(event) => setSubject(event.target.value)} />
        </Field>
      </Card>

      <Card padding="md">
        <h2 className="text-h4 font-semibold">Schedule</h2>
        <p className="mt-1 text-small text-ink-secondary">
          All times are Indian Standard Time. The paper can be downloaded from the opening time and
          submitted until the deadline. Leave a time blank for no limit.
        </p>

        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Field
            id="durationMinutes"
            label="Writing time (minutes)"
            required
            hint="Shown to students as the time to write in. Advisory — the paper is written offline."
            error={errorFor(errors, "durationMinutes")}
          >
            <Input
              id="durationMinutes"
              type="number"
              inputMode="numeric"
              min={5}
              max={480}
              value={durationMinutes}
              onChange={(event) => setDurationMinutes(event.target.value)}
              disabled={locked}
            />
          </Field>
          <Field id="opensAt" label="Opens" error={errorFor(errors, "opensAt")}>
            <Input
              id="opensAt"
              type="datetime-local"
              value={opensAt}
              onChange={(event) => setOpensAt(event.target.value)}
              disabled={locked}
            />
          </Field>
          <Field
            id="closesAt"
            label="Submission deadline"
            hint="Can be extended at any time."
            error={errorFor(errors, "closesAt")}
          >
            <Input
              id="closesAt"
              type="datetime-local"
              value={closesAt}
              onChange={(event) => setClosesAt(event.target.value)}
            />
          </Field>
          <Field
            id="resultsFrom"
            label="Evaluations visible from"
            hint="Blank returns each copy as soon as it is evaluated."
            error={errorFor(errors, "resultsVisibleFrom")}
          >
            <Input
              id="resultsFrom"
              type="datetime-local"
              value={resultsFrom}
              onChange={(event) => setResultsFrom(event.target.value)}
            />
          </Field>
        </div>
      </Card>

      <Card padding="md">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-h4 font-semibold">Marking scheme</h2>
            <p className="mt-1 text-small text-ink-secondary">
              One row per question as printed on the paper. Evaluators award marks against these
              maximums.
            </p>
          </div>

          {!locked ? (
            <Select
              aria-label="Start from a preset"
              className="w-auto min-w-64"
              value=""
              onChange={(event) => applyPreset(Number(event.target.value))}
            >
              <option value="" disabled>
                Start from a preset…
              </option>
              {PRESETS.map((preset, index) => (
                <option key={preset.label} value={index}>
                  {preset.label}
                </option>
              ))}
            </Select>
          ) : null}
        </div>

        {errors.markingScheme?.[0] ? (
          <p role="alert" className="mt-4 text-small font-medium text-danger">
            {errors.markingScheme[0]}
          </p>
        ) : null}

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-112 text-left text-small">
            <thead className="text-ink-secondary">
              <tr>
                <th scope="col" className="pb-2 pr-3 font-semibold">Question</th>
                <th scope="col" className="pb-2 pr-3 font-semibold">Max marks</th>
                <th scope="col" className="pb-2 pr-3 font-semibold">Word limit</th>
                <th scope="col" className="pb-2">
                  <span className="sr-only">Remove</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {scheme.map((row, index) => (
                <tr key={index}>
                  <td className="py-1 pr-3">
                    <Input
                      aria-label={`Question ${index + 1} label`}
                      value={row.label}
                      onChange={(event) => updateRow(index, { label: event.target.value })}
                      maxLength={16}
                      disabled={locked}
                      className="w-28"
                    />
                  </td>
                  <td className="py-1 pr-3">
                    <Input
                      aria-label={`${row.label || `Question ${index + 1}`} maximum marks`}
                      type="number"
                      inputMode="decimal"
                      min={0.25}
                      max={100}
                      step={0.25}
                      value={row.maxMarks}
                      onChange={(event) => updateRow(index, { maxMarks: event.target.value })}
                      disabled={locked}
                      className="w-28"
                    />
                  </td>
                  <td className="py-1 pr-3">
                    <Input
                      aria-label={`${row.label || `Question ${index + 1}`} word limit`}
                      type="number"
                      inputMode="numeric"
                      min={10}
                      max={5000}
                      value={row.wordLimit}
                      onChange={(event) => updateRow(index, { wordLimit: event.target.value })}
                      placeholder="—"
                      disabled={locked}
                      className="w-28"
                    />
                  </td>
                  <td className="py-1">
                    {!locked ? (
                      <button
                        type="button"
                        onClick={() => setScheme((current) => current.filter((_, at) => at !== index))}
                        className="flex size-10 items-center justify-center text-ink-secondary hover:bg-paper hover:text-danger"
                        aria-label={`Remove ${row.label || `question ${index + 1}`}`}
                      >
                        <Trash2 aria-hidden className="size-4" />
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-4">
          <p className="text-small font-semibold text-indigo tabular-nums">
            {scheme.length} question{scheme.length === 1 ? "" : "s"} · {totalMarks} marks
          </p>
          {!locked ? (
            <Button variant="secondary" size="sm" onClick={addRow}>
              <Plus aria-hidden className="size-4" />
              Add question
            </Button>
          ) : null}
        </div>
      </Card>

      <div className="flex flex-wrap justify-end gap-3">
        <ButtonLink href={test ? `/admin/answer-writing/${test.id}` : "/admin/answer-writing"} variant="ghost">
          Cancel
        </ButtonLink>
        <Button type="submit" disabled={pending || courses.length === 0}>
          {pending ? "Saving…" : test ? "Save settings" : "Create draft paper"}
        </Button>
      </div>
    </form>
  );
}
