"use client";

import { Clock, Flag, ListChecks, Loader2, MinusCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { ExamTimer } from "@/components/exam/ExamTimer";
import { QuestionPalette, type PaletteState } from "@/components/exam/QuestionPalette";
import { QuestionPanel } from "@/components/exam/QuestionPanel";
import { Button } from "@/components/ui/Button";
import { track } from "@/lib/analytics";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { beginMockAction, saveMockAnswersAction, submitMockAction } from "@/lib/mock-test/actions";
import type { MockInstructions, MockSitting, PublicPaper } from "@/lib/mock-test/types";

/**
 * The free mock test, from instructions to submit.
 *
 * It looks like the real CBT — one question at a time, the palette, the
 * server's clock — because part of what a visitor is trying out is the exam
 * itself. It is lighter than the student runner on purpose: no fullscreen
 * lock, no tab-switch budget, no single-window rule. A free practice paper at
 * home is not the place to make a first impression by locking someone's screen.
 *
 * Answers are kept here and saved as a whole sheet a couple of seconds after
 * the last change, and again when the tab is hidden, rather than one request
 * per click. The server's deadline decides what counts; the countdown shown is
 * a copy of it, resynced on every save.
 */

const SAVE_DELAY_MS = 2500;

const resultHref = (attemptId: string) => `/mock-test/result/${attemptId}`;

export function MockRunner({ initial }: { initial: MockInstructions | MockSitting }) {
  const router = useRouter();
  const [sitting, setSitting] = useState<MockSitting | null>(
    initial.stage === "sitting" ? initial : null,
  );
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function begin() {
    setStarting(true);
    setError(null);

    const result = await beginMockAction({ attemptId: initial.attemptId });

    if (!result.ok) {
      setError(result.message);
      setStarting(false);
      return;
    }

    if (result.data.stage === "sitting") {
      track(ANALYTICS_EVENTS.mockTestStart, { testId: result.data.paper.id });
      setSitting(result.data);
    } else {
      router.replace(resultHref(initial.attemptId));
    }
  }

  if (sitting) return <Sitting sitting={sitting} />;

  if (initial.stage !== "instructions") return null;

  return (
    <Instructions
      paper={initial.paper}
      firstName={initial.firstName}
      starting={starting}
      error={error}
      onBegin={() => void begin()}
    />
  );
}

function Instructions({
  paper,
  firstName,
  starting,
  error,
  onBegin,
}: {
  paper: PublicPaper;
  firstName: string;
  starting: boolean;
  error: string | null;
  onBegin: () => void;
}) {
  const facts: { icon: ReactNode; label: string }[] = [
    { icon: <ListChecks aria-hidden className="size-4" />, label: `${paper.questionCount} questions · ${paper.totalMarks} marks` },
    { icon: <Clock aria-hidden className="size-4" />, label: `${paper.durationMinutes} minutes` },
    ...(paper.negativeMarksPerQuestion > 0
      ? [{ icon: <MinusCircle aria-hidden className="size-4" />, label: `−${paper.negativeMarksPerQuestion} for each wrong answer` }]
      : []),
  ];

  return (
    <div className="flex min-h-dvh items-center justify-center bg-paper p-4 sm:p-6">
      <div className="w-full max-w-2xl border-2 border-indigo bg-white">
        <div aria-hidden className="h-1.5 bg-kesar" />
        <div className="p-6 sm:p-9">
          <p className="text-eyebrow font-semibold uppercase text-kesar-600">Free UPSC mock test</p>
          <h1 className="mt-2 text-h2 font-bold text-indigo">{paper.title}</h1>
          <p className="mt-3 text-body text-ink-secondary">
            You&apos;re registered, {firstName}. Read this once, then begin when you&apos;re ready —
            the clock has not started.
          </p>

          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-small font-medium text-ink">
            {facts.map((fact) => (
              <li key={fact.label} className="flex items-center gap-2">
                {fact.icon}
                {fact.label}
              </li>
            ))}
          </ul>

          <h2 className="mt-8 text-h4 font-bold">How it works</h2>
          <ul className="mt-3 space-y-2 text-body text-ink-secondary">
            {[
              "The timer runs on our server. Closing the tab does not pause it — come back from the same browser to continue.",
              "Your answers save automatically as you go.",
              "When time is up, the paper is submitted with whatever you have answered.",
              paper.negativeMarksPerQuestion > 0
                ? "Wrong answers lose marks, exactly as in the real Prelims. An unanswered question costs nothing."
                : "There is no negative marking on this paper.",
              "Sit it the way you will sit the real exam: in one go, without notes.",
            ].map((rule) => (
              <li key={rule} className="flex gap-3">
                <span aria-hidden className="mt-[0.6em] size-1.5 shrink-0 bg-kesar" />
                {rule}
              </li>
            ))}
          </ul>

          {error ? (
            <p role="alert" className="mt-6 bg-danger-50 px-4 py-3 text-small font-medium text-danger">
              {error}
            </p>
          ) : null}

          <div className="mt-8">
            <Button size="lg" onClick={onBegin} disabled={starting}>
              {starting ? "Opening the paper…" : "Begin the test"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Sitting({ sitting }: { sitting: MockSitting }) {
  const router = useRouter();
  const { questions, paper, attemptId } = sitting;

  const [answers, setAnswers] = useState<Record<string, string[]>>(sitting.answers);
  const [index, setIndex] = useState(0);
  const [marked, setMarked] = useState<Set<string>>(() => new Set());
  const [seen, setSeen] = useState<Set<string>>(() => new Set(questions[0] ? [questions[0].id] : []));
  const [remaining, setRemaining] = useState(sitting.remainingSeconds);
  const [sync, setSync] = useState<"idle" | "saving" | "error">("idle");
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Refs, so timers and the visibility handler always see the latest sheet.
  // Set when the countdown starts, not during render: render must be pure.
  const deadline = useRef<number | null>(null);
  const answersRef = useRef(answers);
  const dirty = useRef(false);
  const saving = useRef(false);
  const finished = useRef(false);

  const save = useCallback(async () => {
    if (!dirty.current || saving.current || finished.current) return;

    saving.current = true;
    dirty.current = false;
    setSync("saving");

    const result = await saveMockAnswersAction({ attemptId, answers: answersRef.current });
    saving.current = false;

    if (result.ok) {
      deadline.current = Date.now() + result.data.remainingSeconds * 1000;
      setSync("idle");
    } else {
      // Kept dirty so the next change or the next timer tick retries it.
      dirty.current = true;
      setSync("error");
    }
  }, [attemptId]);

  const submit = useCallback(
    async (auto: boolean) => {
      if (finished.current) return;
      finished.current = true;
      setSubmitting(true);
      setSubmitError(null);

      const result = await submitMockAction({ attemptId, answers: answersRef.current });

      if (!result.ok) {
        finished.current = false;
        setSubmitting(false);
        setSubmitError(result.message);
        return;
      }

      track(ANALYTICS_EVENTS.mockTestSubmit, { testId: paper.id, auto });
      router.replace(resultHref(attemptId));
    },
    [attemptId, paper.id, router],
  );

  // The countdown, recomputed from the deadline so a throttled background tab
  // does not drift.
  useEffect(() => {
    deadline.current ??= Date.now() + sitting.remainingSeconds * 1000;

    const timer = window.setInterval(() => {
      const left = Math.max(0, Math.round(((deadline.current ?? 0) - Date.now()) / 1000));
      setRemaining(left);
      if (left === 0) void submit(true);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [submit, sitting.remainingSeconds]);

  // Debounced save after the last change.
  useEffect(() => {
    if (!dirty.current) return;
    const timer = window.setTimeout(() => void save(), SAVE_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [answers, save]);

  // Save straight away when the visitor switches away — the moment a closed
  // laptop or a swiped-away tab would otherwise lose the last answers.
  useEffect(() => {
    function onHide() {
      if (document.visibilityState === "hidden") void save();
    }
    document.addEventListener("visibilitychange", onHide);
    return () => document.removeEventListener("visibilitychange", onHide);
  }, [save]);

  function select(optionIds: string[]) {
    const question = questions[index];
    if (!question) return;

    const next = { ...answersRef.current, [question.id]: optionIds };
    answersRef.current = next;
    dirty.current = true;
    setAnswers(next);
  }

  function goTo(target: number) {
    const bounded = Math.min(Math.max(target, 0), questions.length - 1);
    const question = questions[bounded];
    if (question) setSeen((current) => new Set(current).add(question.id));
    setIndex(bounded);
  }

  const answeredCount = useMemo(
    () => questions.filter((question) => (answers[question.id]?.length ?? 0) > 0).length,
    [answers, questions],
  );

  const paletteStates: PaletteState[] = questions.map((question) => {
    if (marked.has(question.id)) return "marked";
    if ((answers[question.id]?.length ?? 0) > 0) return "answered";
    if (seen.has(question.id)) return "seen";
    return "untouched";
  });

  const question = questions[index];
  if (!question) return null;

  const unanswered = questions.length - answeredCount;

  return (
    <div className="flex min-h-dvh flex-col bg-paper">
      <header className="sticky top-0 z-20 border-b border-line bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3 sm:px-6">
          <div className="min-w-0">
            <h1 className="truncate text-body-lg font-semibold">{paper.title}</h1>
            <p className="text-small text-ink-secondary tabular-nums">
              {answeredCount} of {questions.length} answered · {paper.totalMarks} marks
              {paper.negativeMarksPerQuestion > 0 ? ` · −${paper.negativeMarksPerQuestion} per wrong answer` : ""}
            </p>
          </div>

          <div className="ml-auto flex items-center gap-3">
            {sync === "saving" ? (
              <span className="inline-flex items-center gap-1.5 text-small text-ink-secondary">
                <Loader2 aria-hidden className="size-3.5 animate-spin" />
                Saving
              </span>
            ) : sync === "error" ? (
              <span className="bg-danger-50 px-2.5 py-1 text-small font-semibold text-danger">
                Not saved — retrying
              </span>
            ) : null}
            <ExamTimer seconds={remaining} />
            <Button size="sm" onClick={() => setConfirming(true)} disabled={submitting}>
              Submit
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-7xl flex-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_17rem]">
        <div className="min-w-0">
          <QuestionPanel
            question={question}
            index={index}
            total={questions.length}
            selected={answers[question.id] ?? []}
            onSelect={select}
            watermark={null}
          />

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Button variant="secondary" size="sm" onClick={() => goTo(index - 1)} disabled={index === 0}>
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
              size="sm"
              className="ml-auto"
              onClick={() => goTo(index + 1)}
              disabled={index === questions.length - 1}
            >
              Save &amp; next
            </Button>
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <h2 className="text-small font-semibold">Question palette</h2>
          <div className="mt-4">
            <QuestionPalette states={paletteStates} current={index} onJump={goTo} />
          </div>
        </aside>
      </div>

      {confirming || submitting || submitError ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="mock-submit-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-indigo-950/92 p-6"
        >
          <div className="w-full max-w-lg bg-white p-7 sm:p-9">
            <h2 id="mock-submit-title" className="text-h3 font-bold">
              {submitting ? "Scoring your paper…" : "Submit your paper?"}
            </h2>
            <p className="mt-3 text-body text-ink-secondary">
              {submitting
                ? "Working out your score and your rank among everyone who has taken this test."
                : unanswered === 0
                  ? "All questions are answered. Once submitted, the paper cannot be reopened."
                  : `${unanswered} question${unanswered === 1 ? " is" : "s are"} unanswered. Once submitted, the paper cannot be reopened.`}
            </p>

            {submitError ? (
              <p role="alert" className="mt-4 bg-danger-50 px-4 py-3 text-small font-medium text-danger">
                {submitError}
              </p>
            ) : null}

            {submitting ? null : (
              <div className="mt-6 flex flex-wrap gap-3">
                <Button onClick={() => void submit(false)}>Submit and see my rank</Button>
                {remaining > 0 ? (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setConfirming(false);
                      setSubmitError(null);
                    }}
                  >
                    Keep working
                  </Button>
                ) : null}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
