"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";

import { ExamRunner } from "@/components/exam/ExamRunner";
import { Button } from "@/components/ui/Button";
import { openExamAction } from "@/lib/exam/actions";
import type { ExamPayload } from "@/lib/exam/types";

/**
 * The last screen before a paper, and the gesture that starts it.
 *
 * Fullscreen can only be entered from a real user action, and a page navigation
 * drops it. So the paper is fetched *without* navigating: this one click enters
 * fullscreen and then asks the server for the sitting, and the runner mounts in
 * place with fullscreen already held.
 *
 * It also means the clock does not start while the student is still reading. The
 * attempt — and therefore `expiresAt` — is created by the click, not by the page
 * load, so a slow connection on the way in does not cost exam time.
 */
export function ExamGate({
  test,
  rules,
  watermark,
  resultHref,
}: {
  test: {
    id: string;
    title: string;
    totalMarks: number;
    questionCount: number;
    durationMinutes: number;
    negativeMarksPerQuestion: number;
  };
  rules: string[];
  watermark: string | null;
  resultHref: string;
}) {
  const router = useRouter();
  const [payload, setPayload] = useState<ExamPayload | null>(null);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const begin = useCallback(async () => {
    setStarting(true);
    setError(null);

    // Requested before the round trip, while the click is still the current
    // user gesture. A browser that refuses is handled inside the runner, which
    // falls back to an advisory warning rather than locking the student out.
    try {
      await document.documentElement.requestFullscreen?.({ navigationUI: "hide" });
    } catch {
      /* Not available on this browser — the runner takes it from here. */
    }

    const result = await openExamAction({ testId: test.id });

    if (!result.ok) {
      setStarting(false);
      setError(result.message);
      return;
    }

    if (result.data.finished) {
      router.replace(resultHref);
      return;
    }

    setPayload(result.data);
  }, [resultHref, router, test.id]);

  if (payload) {
    return (
      <ExamRunner
        payload={payload}
        test={test}
        watermark={watermark}
        resultHref={resultHref}
      />
    );
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-paper p-4 sm:p-6">
      <div className="w-full max-w-2xl border border-line bg-white p-6 sm:p-9">
        <p className="flex items-center gap-2 text-eyebrow font-semibold uppercase text-ink-secondary">
          <ShieldCheck aria-hidden className="size-4" />
          Invigilated paper
        </p>

        <h1 className="mt-3 text-h2 font-bold">{test.title}</h1>

        <dl className="mt-6 grid grid-cols-2 gap-4 bg-paper p-5 sm:grid-cols-4">
          {[
            ["Questions", String(test.questionCount)],
            ["Marks", String(test.totalMarks)],
            ["Duration", `${test.durationMinutes} min`],
            [
              "Negative",
              test.negativeMarksPerQuestion > 0
                ? `−${test.negativeMarksPerQuestion}`
                : "None",
            ],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-eyebrow font-semibold uppercase text-ink-secondary">
                {label}
              </dt>
              <dd className="mt-1 text-body-lg font-semibold tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>

        <h2 className="mt-8 text-body-lg font-semibold">Before you begin</h2>
        <ul className="mt-3 space-y-2 text-body text-ink-secondary">
          {rules.map((rule) => (
            <li key={rule} className="flex gap-2">
              <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-kesar" />
              <span>{rule}</span>
            </li>
          ))}
        </ul>

        {error ? (
          <p
            role="alert"
            className="mt-6 bg-danger-50 px-4 py-3 text-small font-semibold text-danger"
          >
            {error}
          </p>
        ) : null}

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Button
            variant="primary"
            size="lg"
            onClick={() => void begin()}
            disabled={starting}
          >
            {starting ? "Opening paper…" : "Start the paper"}
          </Button>
          <p className="text-small text-ink-secondary">
            The timer starts when you press this.
          </p>
        </div>
      </div>
    </div>
  );
}
