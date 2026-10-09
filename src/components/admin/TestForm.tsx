"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type SubmitEvent } from "react";

import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";
import { createTestAction, updateTestAction } from "@/lib/exam/authoring-actions";
import { isoToIstInput, istInputToIso } from "@/lib/exam/ist";
import { DEFAULT_EXAM_SECURITY, VIOLATION_WEIGHTS } from "@/lib/exam/policy";
import type { ExamSecurityPolicy, Test } from "@/types/db";

/**
 * Creates or edits a paper's settings — not its questions, which are added one
 * at a time on the paper's own page.
 *
 * When `lockReason` is set the paper is published or has been sat, and the
 * fields that decide timing and scoring are disabled here as well as refused by
 * the action: a form that lets someone type a change the server will reject is
 * a form that wastes their time.
 */

export interface CourseOption {
  id: string;
  title: string;
  status: string;
}

const KIND_LABELS = {
  "prelims-mcq": "Prelims GS (MCQ)",
  csat: "CSAT",
  sectional: "Sectional",
} as const;

type McqKind = keyof typeof KIND_LABELS;

const BOOLEAN_RULES: { key: keyof ExamSecurityPolicy; label: string }[] = [
  { key: "requireFullscreen", label: "Require fullscreen" },
  { key: "shuffleQuestions", label: "Shuffle question order per student" },
  { key: "shuffleOptions", label: "Shuffle option order per student" },
  { key: "blockCopyPaste", label: "Block copy, paste and right-click" },
  { key: "autoSubmitOnViolation", label: "Submit automatically when a limit is reached" },
  { key: "watermark", label: "Watermark the paper with the student's roll number" },
];

function errorFor(errors: Record<string, string[]>, key: string): string | undefined {
  return errors[key]?.[0];
}

export function TestForm({
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

  const [courseId, setCourseId] = useState(test?.courseId ?? courses[0]?.id ?? "");
  const [title, setTitle] = useState(test?.title ?? "");
  const [kind, setKind] = useState<McqKind>(
    test && test.kind !== "mains-descriptive" ? test.kind : "prelims-mcq",
  );
  const [subject, setSubject] = useState(test?.subject ?? "");
  const [questionCount, setQuestionCount] = useState(String(test?.questionCount ?? 100));
  const [totalMarks, setTotalMarks] = useState(String(test?.totalMarks ?? 200));
  const [durationMinutes, setDurationMinutes] = useState(String(test?.durationMinutes ?? 120));
  const [negativeMarks, setNegativeMarks] = useState(
    String(test?.negativeMarksPerQuestion ?? 0.66),
  );
  const [opensAt, setOpensAt] = useState(isoToIstInput(test?.opensAt ?? null));
  const [closesAt, setClosesAt] = useState(isoToIstInput(test?.closesAt ?? null));
  const [resultsFrom, setResultsFrom] = useState(
    isoToIstInput(test?.resultsVisibleFrom ?? null),
  );
  const [customSecurity, setCustomSecurity] = useState(Boolean(test?.security));
  const [security, setSecurity] = useState<ExamSecurityPolicy>(
    test?.security ?? DEFAULT_EXAM_SECURITY,
  );

  const locked = lockReason !== null;

  function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const fields = {
      courseId,
      batchId: test?.batchId ?? null,
      title: title.trim(),
      kind,
      subject: subject.trim() || null,
      questionCount: Number(questionCount),
      totalMarks: Number(totalMarks),
      durationMinutes: Number(durationMinutes),
      negativeMarksPerQuestion: Number(negativeMarks),
      opensAt: istInputToIso(opensAt),
      closesAt: istInputToIso(closesAt),
      resultsVisibleFrom: istInputToIso(resultsFrom),
      security: customSecurity ? security : null,
    };

    startTransition(async () => {
      const result = test
        ? await updateTestAction({ testId: test.id, fields })
        : await createTestAction(fields);

      if (!result.ok) {
        setErrors(result.fieldErrors ?? {});
        showToast("error", result.message);
        return;
      }

      setErrors({});
      showToast("success", test ? "Paper settings saved." : "Paper created as a draft.");
      router.push(`/admin/tests/${result.data.id}`);
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-6">
      {lockReason ? (
        <p className="border border-line-strong bg-paper px-4 py-3 text-small text-ink">
          {lockReason}
        </p>
      ) : null}

      <Card padding="md" className="grid gap-5 sm:grid-cols-2">
        <Field id="title" label="Title" required error={errorFor(errors, "title")} className="sm:col-span-2">
          <Input
            id="title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Prelims Mock 01 — GS Paper I"
            aria-invalid={Boolean(errors.title) || undefined}
            required
          />
        </Field>

        <Field
          id="courseId"
          label="Course"
          required
          hint="Only students enrolled in this course can sit the paper."
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

        <Field id="kind" label="Paper type" required>
          <Select
            id="kind"
            value={kind}
            onChange={(event) => setKind(event.target.value as McqKind)}
            disabled={locked}
          >
            {Object.entries(KIND_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          id="subject"
          label="Subject"
          hint="For a sectional paper, e.g. Polity. Leave blank for a full-length paper."
          error={errorFor(errors, "subject")}
          className="sm:col-span-2"
        >
          <Input id="subject" value={subject} onChange={(event) => setSubject(event.target.value)} />
        </Field>
      </Card>

      <Card padding="md">
        <h2 className="text-h4 font-semibold">Marking and time</h2>
        <p className="mt-1 text-small text-ink-secondary">
          The paper can only be published once its questions add up to exactly these numbers.
        </p>

        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Field id="questionCount" label="Questions" required error={errorFor(errors, "questionCount")}>
            <Input
              id="questionCount"
              type="number"
              inputMode="numeric"
              min={1}
              max={500}
              value={questionCount}
              onChange={(event) => setQuestionCount(event.target.value)}
              disabled={locked}
            />
          </Field>
          <Field id="totalMarks" label="Total marks" required error={errorFor(errors, "totalMarks")}>
            <Input
              id="totalMarks"
              type="number"
              inputMode="decimal"
              min={1}
              step="any"
              value={totalMarks}
              onChange={(event) => setTotalMarks(event.target.value)}
              disabled={locked}
            />
          </Field>
          <Field
            id="durationMinutes"
            label="Duration (minutes)"
            required
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
          <Field
            id="negativeMarks"
            label="Negative marks per wrong answer"
            required
            error={errorFor(errors, "negativeMarksPerQuestion")}
          >
            <Input
              id="negativeMarks"
              type="number"
              inputMode="decimal"
              min={0}
              max={5}
              step="any"
              value={negativeMarks}
              onChange={(event) => setNegativeMarks(event.target.value)}
              disabled={locked}
            />
          </Field>
        </div>
      </Card>

      <Card padding="md">
        <h2 className="text-h4 font-semibold">Schedule</h2>
        <p className="mt-1 text-small text-ink-secondary">
          All times are Indian Standard Time. Leave a time blank for no limit.
        </p>

        <div className="mt-5 grid gap-5 sm:grid-cols-3">
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
            label="Closes"
            hint="No new attempt may start after this."
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
            label="Answer key visible from"
            hint="Blank shows each student their key as soon as they submit."
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
        <h2 className="text-h4 font-semibold">Invigilation</h2>

        <label className="mt-4 flex items-start gap-3 text-body">
          <input
            type="checkbox"
            className="mt-1 size-4 accent-indigo"
            checked={!customSecurity}
            onChange={(event) => setCustomSecurity(!event.target.checked)}
            disabled={locked}
          />
          <span>
            Use the institute default
            <span className="block text-small text-ink-secondary">
              Fullscreen, shuffled questions and options, copy-paste blocked, two tab switches
              allowed, watermark on.
            </span>
          </span>
        </label>

        {customSecurity ? (
          <div className="mt-5 space-y-3 border-t border-line pt-5">
            {BOOLEAN_RULES.map(({ key, label }) => (
              <label key={key} className="flex items-center gap-3 text-body">
                <input
                  type="checkbox"
                  className="size-4 accent-indigo"
                  checked={Boolean(security[key])}
                  onChange={(event) =>
                    setSecurity((current) => ({ ...current, [key]: event.target.checked }))
                  }
                  disabled={locked}
                />
                {label}
              </label>
            ))}

            <div className="grid gap-5 pt-2 sm:grid-cols-2">
              <Field id="maxFocusLosses" label="Tab switches allowed" required>
                <Input
                  id="maxFocusLosses"
                  type="number"
                  min={0}
                  max={20}
                  value={security.maxFocusLosses}
                  onChange={(event) =>
                    setSecurity((current) => ({
                      ...current,
                      maxFocusLosses: Number(event.target.value),
                    }))
                  }
                  disabled={locked}
                />
              </Field>
              <Field
                id="maxViolationScore"
                label="Violation budget"
                required
                hint={`Leaving fullscreen costs ${VIOLATION_WEIGHTS.fullscreenExit}, a tab switch ${VIOLATION_WEIGHTS.focusLoss}, a blocked copy ${VIOLATION_WEIGHTS.blockedCopy}.`}
              >
                <Input
                  id="maxViolationScore"
                  type="number"
                  min={1}
                  max={100}
                  value={security.maxViolationScore}
                  onChange={(event) =>
                    setSecurity((current) => ({
                      ...current,
                      maxViolationScore: Number(event.target.value),
                    }))
                  }
                  disabled={locked}
                />
              </Field>
            </div>
          </div>
        ) : null}
      </Card>

      <div className="flex flex-wrap justify-end gap-3">
        <ButtonLink href={test ? `/admin/tests/${test.id}` : "/admin/tests"} variant="ghost">
          Cancel
        </ButtonLink>
        <Button type="submit" disabled={pending || courses.length === 0}>
          {pending ? "Saving…" : test ? "Save settings" : "Create draft paper"}
        </Button>
      </div>
    </form>
  );
}
