"use client";

import { ExternalLink, FileCheck, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { useToast } from "@/components/ui/Toast";
import { scoreOf } from "@/lib/answer-writing/policy";
import { ANSWER_RUBRIC, RUBRIC_MAX, RUBRIC_SCALE, emptyRubric } from "@/lib/answer-writing/rubric";
import { saveEvaluationAction, startReviewAction } from "@/lib/answer-writing/staff-actions";
import { MEDIA_PATHS, UPLOAD_LIMITS, uniqueAssetName } from "@/lib/cloudinary/media-paths";
import { uploadFile } from "@/lib/cloudinary/upload";
import { cn } from "@/lib/utils/cn";
import type { AnswerSubmissionStatus, MainsEvaluation, MainsQuestionSlot, RubricScores } from "@/types/db";

/**
 * The evaluator's side of a copy: marks per question, the rubric, written
 * feedback, and the checked copy — the student's pages as the evaluator
 * annotated them, in whatever tool they mark with.
 *
 * "Save draft" keeps work in progress out of the student's sight; "Complete"
 * returns the copy. Both are re-validated on the server against the paper's
 * marking scheme, which is the only source of each question's maximum.
 */

interface QuestionState {
  attempted: boolean;
  marks: string;
  remark: string;
}

const SCALE = Array.from({ length: RUBRIC_MAX }, (_, index) => index + 1);

function initialQuestions(scheme: MainsQuestionSlot[], evaluation: MainsEvaluation | null): QuestionState[] {
  return scheme.map((slot, index) => {
    const saved = evaluation?.questions[index];
    const matches = saved && saved.label === slot.label;

    return {
      attempted: matches ? saved.attempted : true,
      marks: matches && saved.marksAwarded !== null ? String(saved.marksAwarded) : "",
      remark: matches ? (saved.remark ?? "") : "",
    };
  });
}

export function EvaluationForm({
  testId,
  studentUid,
  studentName,
  scheme,
  evaluation,
  status,
  heldBy,
  checkedCopyUrl,
  visibility,
}: {
  testId: string;
  studentUid: string;
  studentName: string;
  scheme: MainsQuestionSlot[];
  evaluation: MainsEvaluation | null;
  status: AnswerSubmissionStatus;
  /** Name of another evaluator currently holding the copy. */
  heldBy: string | null;
  checkedCopyUrl: string | null;
  /** When the student will see a completed copy — "straight away", "on 20 Oct…". */
  visibility: string;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();

  const [questions, setQuestions] = useState(() => initialQuestions(scheme, evaluation));
  const [rubric, setRubric] = useState<RubricScores>(evaluation?.rubric ?? emptyRubric());
  const [strengths, setStrengths] = useState(evaluation?.strengths ?? "");
  const [improvements, setImprovements] = useState(evaluation?.improvements ?? "");
  const [remarks, setRemarks] = useState(evaluation?.remarks ?? "");
  const [checkedCopyPath, setCheckedCopyPath] = useState(evaluation?.checkedCopyPath ?? null);
  const [newCopyName, setNewCopyName] = useState<string | null>(null);
  const [uploadPercent, setUploadPercent] = useState<number | null>(null);
  const [dirty, setDirty] = useState(false);

  const isEvaluated = status === "evaluated";
  const disabled = heldBy !== null || pending || uploadPercent !== null;
  const total = scheme.reduce((sum, slot) => sum + slot.maxMarks, 0);
  const score = scoreOf(
    questions.map((question) => ({
      attempted: question.attempted,
      marksAwarded: question.marks.trim() === "" ? null : Number(question.marks) || 0,
    })),
  );

  // An evaluator who closes the tab mid-copy should be asked first. In-app
  // navigation is not covered — the browser gives no hook for it.
  useEffect(() => {
    if (!dirty) return;

    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  function change<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value);
      setDirty(true);
    };
  }

  function updateQuestion(index: number, patch: Partial<QuestionState>) {
    setQuestions((current) => current.map((question, at) => (at === index ? { ...question, ...patch } : question)));
    setDirty(true);
  }

  async function uploadCheckedCopy(file: File) {
    setUploadPercent(0);

    try {
      const path = await uploadFile(
        MEDIA_PATHS.evaluatedCopy(testId, studentUid, uniqueAssetName(file.name)),
        file,
        { kind: "answerSheet", onProgress: setUploadPercent },
      );

      setCheckedCopyPath(path);
      setNewCopyName(file.name);
      setDirty(true);
      showToast("success", "Checked copy attached. Save to keep it.");
    } catch (error) {
      showToast("error", error instanceof Error ? error.message : "The checked copy could not be uploaded.");
    } finally {
      setUploadPercent(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function save(complete: boolean) {
    for (const [index, slot] of scheme.entries()) {
      const question = questions[index];
      if (!question.attempted || question.marks.trim() === "") continue;

      const value = Number(question.marks);
      if (!Number.isFinite(value) || value < 0 || value > slot.maxMarks || !Number.isInteger(value * 4)) {
        showToast("error", `${slot.label}: enter 0 to ${slot.maxMarks}, in steps of 0.25.`);
        return;
      }
    }

    if (
      complete &&
      !window.confirm(
        isEvaluated
          ? `Save these changes to ${studentName}'s evaluated copy?`
          : `Complete the evaluation (${score} / ${total})? ${studentName} will see it ${visibility}.`,
      )
    ) {
      return;
    }

    startTransition(async () => {
      const result = await saveEvaluationAction({
        testId,
        studentUid,
        questions: questions.map((question) => ({
          attempted: question.attempted,
          marksAwarded: question.attempted && question.marks.trim() !== "" ? Number(question.marks) : null,
          remark: question.remark,
        })),
        rubric,
        strengths,
        improvements,
        remarks,
        checkedCopyPath,
        complete,
      });

      if (!result.ok) {
        showToast("error", result.message);
        return;
      }

      setDirty(false);
      setNewCopyName(null);
      showToast(
        "success",
        !complete
          ? "Draft saved. The student cannot see it yet."
          : isEvaluated
            ? "Changes saved."
            : result.data.released
              ? "Evaluation complete. The student has been notified."
              : "Evaluation complete. It is held until results are released.",
      );
      router.refresh();
    });
  }

  function takeOver() {
    if (!window.confirm(`${heldBy} is marking this copy. Take it over? Their unsaved work is not kept.`)) return;

    startTransition(async () => {
      const result = await startReviewAction({ testId, studentUid, takeOver: true });

      if (!result.ok) {
        showToast("error", result.message);
        return;
      }

      showToast("success", "The copy is yours to evaluate.");
      router.refresh();
    });
  }

  return (
    <Card padding="md">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="text-h4 font-semibold">Evaluation</h2>
        <p className="text-body-lg font-bold tabular-nums text-indigo" aria-live="polite">
          {score} <span className="text-small font-semibold text-ink-secondary">/ {total}</span>
        </p>
      </div>

      {heldBy ? (
        <div className="mt-4 flex flex-wrap items-center gap-3 border border-line-strong bg-paper px-4 py-3">
          <UserRound aria-hidden className="size-4 text-indigo" />
          <p className="flex-1 text-small">{heldBy} is evaluating this copy.</p>
          <Button size="sm" variant="secondary" onClick={takeOver} disabled={pending}>
            Take over
          </Button>
        </div>
      ) : null}

      <fieldset className="mt-6" disabled={disabled}>
        <legend className="text-small font-bold uppercase tracking-wide text-ink-secondary">
          Marks by question
        </legend>

        <ol className="mt-3 divide-y divide-line border-y border-line">
          {scheme.map((slot, index) => {
            const question = questions[index];

            return (
              <li key={slot.label} className="py-3">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="w-14 font-semibold">{slot.label}</span>
                  <Input
                    aria-label={`${slot.label} marks out of ${slot.maxMarks}`}
                    type="number"
                    inputMode="decimal"
                    min={0}
                    max={slot.maxMarks}
                    step={0.25}
                    value={question.marks}
                    onChange={(event) => updateQuestion(index, { marks: event.target.value })}
                    disabled={!question.attempted}
                    className="h-10 w-24"
                  />
                  <span className="text-small text-ink-secondary">/ {slot.maxMarks}</span>
                  <label className="ml-auto flex items-center gap-2 text-small">
                    <input
                      type="checkbox"
                      className="size-4 accent-indigo"
                      checked={!question.attempted}
                      onChange={(event) =>
                        updateQuestion(index, { attempted: !event.target.checked, marks: "" })
                      }
                    />
                    Not attempted
                  </label>
                </div>
                <Input
                  aria-label={`Remark on ${slot.label}`}
                  value={question.remark}
                  onChange={(event) => updateQuestion(index, { remark: event.target.value })}
                  placeholder="Remark on this answer (optional)"
                  maxLength={1000}
                  className="mt-2 h-10 text-small"
                />
              </li>
            );
          })}
        </ol>
      </fieldset>

      <fieldset className="mt-6" disabled={disabled}>
        <legend className="text-small font-bold uppercase tracking-wide text-ink-secondary">Rubric</legend>

        <div className="mt-3 space-y-5">
          {ANSWER_RUBRIC.map(({ key, label, description }) => (
            <fieldset key={key}>
              <legend className="text-small font-bold text-indigo">{label}</legend>
              <p className="text-small text-ink-secondary">{description}</p>
              <div className="mt-2 grid grid-cols-5 gap-1">
                {SCALE.map((value) => {
                  const selected = rubric[key] === value;

                  return (
                    <label
                      key={value}
                      title={RUBRIC_SCALE[value]}
                      className={cn(
                        "flex h-10 cursor-pointer items-center justify-center border-2 text-small font-bold transition-colors",
                        "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--focus-ring)]",
                        "has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-55",
                        selected
                          ? "border-indigo bg-indigo text-white"
                          : "border-line-strong bg-white text-indigo hover:border-indigo",
                      )}
                    >
                      <input
                        type="radio"
                        name={`rubric-${key}`}
                        value={value}
                        checked={selected}
                        onChange={() => change(setRubric)({ ...rubric, [key]: value })}
                        className="sr-only"
                      />
                      {value}
                      <span className="sr-only"> — {RUBRIC_SCALE[value]}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-6 space-y-5" disabled={disabled}>
        <Field id="strengths" label="What worked">
          <Textarea
            id="strengths"
            rows={3}
            maxLength={2000}
            value={strengths}
            onChange={(event) => change(setStrengths)(event.target.value)}
            placeholder="e.g. Good use of Article 243G and the 2nd ARC; clear subheadings."
          />
        </Field>
        <Field id="improvements" label="What to improve">
          <Textarea
            id="improvements"
            rows={3}
            maxLength={2000}
            value={improvements}
            onChange={(event) => change(setImprovements)(event.target.value)}
            placeholder="e.g. Introductions restate the question — open with a fact or a definition instead."
          />
        </Field>
        <Field id="remarks" label="Overall remarks" required hint="Needed to complete the evaluation.">
          <Textarea
            id="remarks"
            rows={4}
            maxLength={4000}
            value={remarks}
            onChange={(event) => change(setRemarks)(event.target.value)}
          />
        </Field>

        <div>
          <p className="text-small font-bold text-indigo">
            Checked copy <span className="font-normal text-ink-muted">(optional)</span>
          </p>
          <p className="mt-1 text-small text-ink-secondary">
            The student&apos;s pages with your marks and comments on them — annotated in any PDF or
            stylus app, or scanned after marking by hand.
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <input
              ref={fileRef}
              type="file"
              accept={UPLOAD_LIMITS.answerSheet.mimeTypes.join(",")}
              className="sr-only"
              tabIndex={-1}
              aria-hidden
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void uploadCheckedCopy(file);
              }}
            />
            <Button variant="secondary" size="sm" onClick={() => fileRef.current?.click()}>
              <FileCheck aria-hidden className="size-4" />
              {uploadPercent !== null
                ? `Uploading… ${uploadPercent}%`
                : checkedCopyPath
                  ? "Replace checked copy"
                  : "Upload checked copy"}
            </Button>

            {newCopyName ? (
              <span className="text-small font-medium text-kesar-700">{newCopyName} — not saved yet</span>
            ) : checkedCopyUrl && checkedCopyPath ? (
              <a
                href={checkedCopyUrl}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-1.5 text-small font-semibold text-indigo underline"
              >
                Open current checked copy
                <ExternalLink aria-hidden className="size-3.5" />
              </a>
            ) : null}
          </div>
        </div>
      </fieldset>

      <div className="mt-8 flex flex-wrap gap-3 border-t border-line pt-5">
        {!isEvaluated ? (
          <Button variant="secondary" onClick={() => save(false)} disabled={disabled}>
            {pending ? "Saving…" : "Save draft"}
          </Button>
        ) : null}
        <Button onClick={() => save(true)} disabled={disabled}>
          {pending ? "Saving…" : isEvaluated ? "Save changes" : "Complete evaluation"}
        </Button>
      </div>
      {dirty ? (
        <p className="mt-3 text-small text-kesar-700" role="status">
          Unsaved changes.
        </p>
      ) : null}
    </Card>
  );
}
