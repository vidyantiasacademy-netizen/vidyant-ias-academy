"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Flag, Loader2, ShieldAlert } from "lucide-react";

import { ExamTimer } from "@/components/exam/ExamTimer";
import { QuestionPalette, type PaletteState } from "@/components/exam/QuestionPalette";
import { QuestionPanel } from "@/components/exam/QuestionPanel";
import { useProctor, type ProctorReport } from "@/components/exam/useProctor";
import { Button } from "@/components/ui/Button";
import {
  heartbeatAction,
  reportProctorEventAction,
  saveAnswerAction,
  submitExamAction,
} from "@/lib/exam/actions";
import { HEARTBEAT_SECONDS } from "@/lib/exam/policy";
import type { ExamPayload } from "@/lib/exam/types";

/**
 * The live MCQ paper.
 *
 * Three things make this component trustworthy, and none of them are in it:
 *
 *  1. The questions it renders have no answer key — the server stripped
 *     `correctOptionIds` before sending them, so the network tab holds nothing
 *     the screen does not.
 *  2. The countdown is a copy of a server number, resynced every heartbeat.
 *  3. Every write carries the attempt's session token, so this window stops
 *     being able to write the moment the paper is opened somewhere else.
 *
 * What *is* in it: the sensors (`useProctor`), an answer queue that survives a
 * flaky connection, and the honest handling of being locked out — a student
 * whose sitting ended should be told plainly and sent to their scorecard, not
 * left looking at a frozen paper.
 */

type Lock =
  | { kind: "evicted"; message: string }
  | { kind: "terminated"; message: string }
  | { kind: "finished"; message: string };

interface ExamRunnerProps {
  payload: ExamPayload;
  test: {
    id: string;
    title: string;
    totalMarks: number;
    negativeMarksPerQuestion: number;
  };
  /** Identity drawn faintly across the paper, or `null` to omit it. */
  watermark: string | null;
  resultHref: string;
}

const SAVE_DEBOUNCE_MS = 700;

export function ExamRunner({ payload, test, watermark, resultHref }: ExamRunnerProps) {
  const router = useRouter();
  const { attemptId, sessionToken, policy, questions } = payload;

  const [answers, setAnswers] = useState<Record<string, string[]>>(() =>
    Object.fromEntries(
      payload.answers.map((answer) => [answer.questionId, answer.selectedOptionIds]),
    ),
  );
  const [marked, setMarked] = useState<Set<string>>(new Set());
  const [seen, setSeen] = useState<Set<string>>(
    () => new Set(questions.length > 0 ? [questions[0].id] : []),
  );
  const [index, setIndex] = useState(0);
  const [remaining, setRemaining] = useState(payload.remainingSeconds);
  const [focusLossesLeft, setFocusLossesLeft] = useState(payload.focusLossesLeft);
  const [lock, setLock] = useState<Lock | null>(null);
  const [sync, setSync] = useState<"idle" | "saving" | "error">("idle");
  const [notice, setNotice] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const question = questions[index];

  // ── Leaving the sitting ────────────────────────────────────────────────────

  const finishedRef = useRef(false);

  const leave = useCallback(
    (lockState: Lock) => {
      if (finishedRef.current) return;
      finishedRef.current = true;

      setLock(lockState);

      if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});

      // A beat on the message before the scorecard: a paper that vanishes the
      // instant it ends reads as a crash, and a student who was auto-submitted
      // needs to know why before the screen changes.
      window.setTimeout(() => router.replace(resultHref), 2500);
    },
    [resultHref, router],
  );

  // ── The answer queue ───────────────────────────────────────────────────────

  const pending = useRef(new Map<string, string[]>());
  const flushTimer = useRef<number | null>(null);
  const secondsOnQuestion = useRef(new Map<string, number>());
  // Set on mount rather than at render: reading the clock while rendering makes
  // the component's output depend on when React happened to run it.
  const enteredAt = useRef(0);

  useEffect(() => {
    enteredAt.current = Date.now();
  }, []);

  const accrueTime = useCallback((questionId: string | undefined) => {
    if (!questionId || enteredAt.current === 0) return;

    const elapsed = Math.round((Date.now() - enteredAt.current) / 1000);
    enteredAt.current = Date.now();

    secondsOnQuestion.current.set(
      questionId,
      (secondsOnQuestion.current.get(questionId) ?? 0) + Math.max(0, elapsed),
    );
  }, []);

  /**
   * Sends every queued answer. Awaited before submit, so the last click a
   * student makes cannot be the one that never reached us.
   */
  const flush = useCallback(async () => {
    if (pending.current.size === 0) return;

    const batch = [...pending.current.entries()];
    pending.current.clear();
    setSync("saving");

    for (const [questionId, selectedOptionIds] of batch) {
      const result = await saveAnswerAction({
        attemptId,
        sessionToken,
        questionId,
        selectedOptionIds,
        timeSpentSeconds: Math.min(
          3600,
          secondsOnQuestion.current.get(questionId) ?? 0,
        ),
      });

      if (result.ok) continue;

      if (result.error === "CONFLICT") {
        leave({ kind: "evicted", message: result.message });
        return;
      }

      // Anything else — offline, a dropped action — goes back in the queue and
      // is retried on the next flush. The student is told it is unsaved rather
      // than left to assume it was.
      pending.current.set(questionId, selectedOptionIds);
      setSync("error");
      return;
    }

    setSync("idle");
  }, [attemptId, leave, sessionToken]);

  const queueSave = useCallback(
    (questionId: string, selectedOptionIds: string[]) => {
      pending.current.set(questionId, selectedOptionIds);

      if (flushTimer.current) window.clearTimeout(flushTimer.current);
      flushTimer.current = window.setTimeout(() => void flush(), SAVE_DEBOUNCE_MS);
    },
    [flush],
  );

  // Retry whatever is stuck as soon as the connection is back.
  useEffect(() => {
    const onOnline = () => void flush();
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, [flush]);

  function select(optionIds: string[]) {
    if (!question || lock) return;

    setAnswers((current) => ({ ...current, [question.id]: optionIds }));
    accrueTime(question.id);
    queueSave(question.id, optionIds);
  }

  function goTo(nextIndex: number) {
    const clamped = Math.min(Math.max(nextIndex, 0), questions.length - 1);
    accrueTime(question?.id);

    setIndex(clamped);
    setSeen((current) => new Set(current).add(questions[clamped].id));
    void flush();
  }

  // ── Invigilation ───────────────────────────────────────────────────────────

  const report = useCallback<ProctorReport>(
    (type, detail) => {
      void (async () => {
        const result = await reportProctorEventAction({
          attemptId,
          sessionToken,
          type,
          detail: detail ?? null,
          // Recorded so a tampered clock is visible next to the server's own
          // timestamp on the same row.
          clientTime: new Date().toISOString(),
        });

        if (!result.ok) {
          if (result.error === "CONFLICT") {
            leave({ kind: "evicted", message: result.message });
          }
          return;
        }

        setFocusLossesLeft(result.data.focusLossesLeft);

        if (result.data.status !== "in-progress") {
          leave({
            kind: "terminated",
            message:
              result.data.terminationReason === "expired"
                ? "Your time was over, so the paper has been submitted."
                : "Your paper has been submitted because the exam rules were broken. Your invigilator has the details.",
          });
          return;
        }

        if (type === "focusLoss" && result.data.focusLossesLeft <= 1) {
          setNotice(
            result.data.focusLossesLeft === 0
              ? "Last warning: the next time you leave this window, your paper will be submitted as it stands."
              : "You have one more tab switch before your paper is submitted automatically.",
          );
        }
      })();
    },
    [attemptId, leave, sessionToken],
  );

  const onSecondWindow = useCallback(() => {
    leave({
      kind: "evicted",
      message:
        "This paper is now open in another window of this browser. Continue there — this window has been closed out of the sitting.",
    });
  }, [leave]);

  const { isFullscreen, fullscreenSupported, enterFullscreen } = useProctor({
    policy,
    enabled: !lock && !submitting,
    attemptId,
    report,
    onSecondWindow,
  });

  // ── Submit ─────────────────────────────────────────────────────────────────

  const submit = useCallback(
    async ({ auto }: { auto: boolean }) => {
      if (finishedRef.current || submitting) return;

      setSubmitting(true);
      setConfirming(false);
      accrueTime(question?.id);
      await flush();

      const result = await submitExamAction({ attemptId, sessionToken });

      if (!result.ok && result.error !== "CONFLICT") {
        // A failed submit with time left is recoverable; the student should get
        // the paper back rather than a dead end.
        setSubmitting(false);
        setNotice(`${result.message} Your answers are saved — try again.`);
        return;
      }

      leave({
        kind: auto ? "terminated" : "finished",
        message: auto
          ? "Your time is over. The paper has been submitted and is being scored."
          : "Your paper has been submitted.",
      });
    },
    [accrueTime, attemptId, flush, leave, question?.id, sessionToken, submitting],
  );

  // ── The clock ──────────────────────────────────────────────────────────────

  // Ticks locally between heartbeats. It is a display: the authority is
  // `expiresAt` on the server, which is what refuses a late write.
  useEffect(() => {
    if (lock) return;

    const id = window.setInterval(() => {
      setRemaining((seconds) => Math.max(0, seconds - 1));
    }, 1000);

    return () => window.clearInterval(id);
  }, [lock]);

  useEffect(() => {
    if (remaining > 0 || lock || finishedRef.current) return;
    void submit({ auto: true });
  }, [lock, remaining, submit]);

  const warnedAt = useRef<Set<number>>(new Set());

  useEffect(() => {
    for (const mark of [300, 60]) {
      if (remaining <= mark && remaining > mark - 2 && !warnedAt.current.has(mark)) {
        warnedAt.current.add(mark);
        setNotice(`${mark / 60} minute${mark === 60 ? "" : "s"} left.`);
      }
    }
  }, [remaining]);

  // ── Heartbeat ──────────────────────────────────────────────────────────────

  useEffect(() => {
    if (lock) return;

    const beat = async () => {
      const result = await heartbeatAction({ attemptId, sessionToken });

      if (!result.ok) {
        if (result.error === "CONFLICT") {
          leave({ kind: "evicted", message: result.message });
        }
        // A missed beat over a bad connection is not an incident. The sweeper
        // only steps in after several in a row.
        return;
      }

      setRemaining(result.data.remainingSeconds);
      setFocusLossesLeft(result.data.focusLossesLeft);

      if (result.data.status !== "in-progress") {
        leave({
          kind: "terminated",
          message:
            result.data.terminationReason === "violations"
              ? "Your paper has been submitted because the exam rules were broken."
              : "Your time was over, so the paper has been submitted.",
        });
      }
    };

    const id = window.setInterval(() => void beat(), HEARTBEAT_SECONDS * 1000);
    return () => window.clearInterval(id);
  }, [attemptId, leave, lock, sessionToken]);

  // ── Derived state ──────────────────────────────────────────────────────────

  const paletteStates = useMemo<PaletteState[]>(
    () =>
      questions.map((candidate) => {
        if (marked.has(candidate.id)) return "marked";
        if ((answers[candidate.id]?.length ?? 0) > 0) return "answered";
        return seen.has(candidate.id) ? "seen" : "untouched";
      }),
    [answers, marked, questions, seen],
  );

  const answeredCount = paletteStates.filter((state) => state === "answered").length;

  if (lock) {
    return (
      <ExamClosed
        title={
          lock.kind === "finished" ? "Paper submitted" : "This sitting has ended"
        }
        message={lock.message}
      />
    );
  }

  if (!question) {
    return (
      <ExamClosed
        title="This paper has no questions yet"
        message="Nothing has been published against this test. Please tell the centre — your attempt has not been used up."
      />
    );
  }

  const needsFullscreen =
    policy.requireFullscreen && fullscreenSupported && !isFullscreen;

  return (
    <div className="flex min-h-dvh flex-col bg-paper select-none">
      {/* Warnings and clock milestones. Discrete messages rather than a live
          per-second timer, which no screen reader user could sit through. */}
      <p aria-live="assertive" className="sr-only">
        {notice}
      </p>

      <header className="sticky top-0 z-20 border-b border-line bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-3 px-5 py-3 sm:px-8 lg:px-12">
          <div className="min-w-0">
            <h1 className="truncate text-body-lg font-semibold">{test.title}</h1>
            <p className="text-small text-ink-secondary tabular-nums">
              {answeredCount} of {questions.length} answered · {test.totalMarks} marks
              {test.negativeMarksPerQuestion > 0
                ? ` · −${test.negativeMarksPerQuestion} per wrong answer`
                : ""}
            </p>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <SyncBadge state={sync} />
            <ExamTimer seconds={remaining} />
            <Button
              variant="primary"
              size="sm"
              onClick={() => setConfirming(true)}
              disabled={submitting}
            >
              Submit paper
            </Button>
          </div>
        </div>

        {notice ? (
          <p className="border-t border-line bg-kesar-100 px-4 py-2 text-small font-semibold text-kesar-700 sm:px-6">
            {notice}
          </p>
        ) : null}
      </header>

      <div className="mx-auto grid w-full max-w-7xl flex-1 gap-6 px-5 py-6 sm:px-8 lg:grid-cols-[1fr_17rem] lg:px-12">
        <div className="min-w-0">
          <QuestionPanel
            question={question}
            index={index}
            total={questions.length}
            selected={answers[question.id] ?? []}
            onSelect={select}
            watermark={policy.watermark ? watermark : null}
          />

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => goTo(index - 1)}
              disabled={index === 0}
            >
              Previous
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => select([])}
              disabled={(answers[question.id]?.length ?? 0) === 0}
            >
              Clear response
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                setMarked((current) => {
                  const next = new Set(current);
                  if (next.has(question.id)) next.delete(question.id);
                  else next.add(question.id);
                  return next;
                })
              }
            >
              <Flag aria-hidden className="size-4" />
              {marked.has(question.id) ? "Unmark" : "Mark for review"}
            </Button>

            <Button
              variant="primary"
              size="sm"
              className="ml-auto"
              onClick={() => goTo(index + 1)}
              disabled={index === questions.length - 1}
            >
              Save & next
            </Button>
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <h2 className="text-small font-semibold">Question palette</h2>
          <div className="mt-4">
            <QuestionPalette states={paletteStates} current={index} onJump={goTo} />
          </div>

          {policy.maxFocusLosses > 0 ? (
            <p className="mt-6 flex gap-2 text-small text-ink-secondary">
              <ShieldAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
              <span>
                Invigilated sitting. {focusLossesLeft} tab switch
                {focusLossesLeft === 1 ? "" : "es"} left before the paper is
                submitted automatically.
              </span>
            </p>
          ) : null}
        </aside>
      </div>

      {needsFullscreen ? (
        // The paper is covered, not merely dimmed: a student who leaves
        // fullscreen to read something else must not be able to read the
        // question at the same time.
        <Blocker
          title="Return to fullscreen to continue"
          message="This paper runs in fullscreen. Leaving it has been recorded. Your timer is still running."
          action={
            <Button variant="primary" onClick={() => void enterFullscreen()}>
              Return to fullscreen
            </Button>
          }
        />
      ) : null}

      {confirming ? (
        <Blocker
          title="Submit your paper?"
          message={
            answeredCount === questions.length
              ? "All questions are answered. Once submitted, the paper cannot be reopened."
              : `${questions.length - answeredCount} question${
                  questions.length - answeredCount === 1 ? "" : "s"
                } are unanswered. Once submitted, the paper cannot be reopened.`
          }
          action={
            <div className="flex flex-wrap gap-3">
              <Button
                variant="primary"
                onClick={() => void submit({ auto: false })}
                disabled={submitting}
              >
                {submitting ? "Submitting…" : "Submit and finish"}
              </Button>
              <Button
                variant="secondary"
                onClick={() => setConfirming(false)}
                disabled={submitting}
              >
                Keep working
              </Button>
            </div>
          }
        />
      ) : null}
    </div>
  );
}

function SyncBadge({ state }: { state: "idle" | "saving" | "error" }) {
  if (state === "idle") return null;

  return (
    <span
      className={
        state === "error"
          ? "bg-danger-50 px-2.5 py-1 text-small font-semibold text-danger"
          : "inline-flex items-center gap-1.5 text-small text-ink-secondary"
      }
    >
      {state === "error" ? (
        "Not saved — retrying"
      ) : (
        <>
          <Loader2 aria-hidden className="size-3.5 animate-spin" />
          Saving
        </>
      )}
    </span>
  );
}

function Blocker({
  title,
  message,
  action,
}: {
  title: string;
  message: string;
  action: ReactNode;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex items-center justify-center bg-indigo-950/92 p-6"
    >
      <div className="w-full max-w-lg bg-white p-7 sm:p-9">
        <h2 className="text-h3 font-bold">{title}</h2>
        <p className="mt-3 text-body text-ink-secondary">{message}</p>
        <div className="mt-6">{action}</div>
      </div>
    </div>
  );
}

function ExamClosed({ title, message }: { title: string; message: string }) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-paper p-6">
      <div className="w-full max-w-lg border border-line bg-white p-7 text-center sm:p-9">
        <h1 className="text-h3 font-bold">{title}</h1>
        <p className="mt-3 text-body text-ink-secondary">{message}</p>
        <p className="mt-6 text-small text-ink-secondary">Taking you to your result…</p>
      </div>
    </div>
  );
}
