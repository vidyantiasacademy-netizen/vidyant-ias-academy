"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import {
  publishDraftQuestionsAction,
  releaseResultsAction,
  removeQuestionAction,
  setTestStatusAction,
} from "@/lib/exam/authoring-actions";
import type { PublishStatus } from "@/types/db";

/**
 * The small buttons on a paper's page. Both re-check everything on the
 * server; the disabled states here only save a round trip that would be refused.
 */

export function PaperStatusButton({
  testId,
  status,
}: {
  testId: string;
  status: PublishStatus;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [pending, startTransition] = useTransition();

  const next: PublishStatus = status === "published" ? "draft" : "published";

  function run() {
    if (
      next === "published" &&
      !window.confirm("Publish this paper? Enrolled students will see it on their test calendar.")
    ) {
      return;
    }

    startTransition(async () => {
      const result = await setTestStatusAction({ testId, status: next });

      if (!result.ok) {
        showToast("error", result.message);
        return;
      }

      showToast("success", next === "published" ? "Paper published." : "Paper moved to draft.");
      router.refresh();
    });
  }

  return (
    <Button
      variant={next === "published" ? "primary" : "secondary"}
      size="sm"
      onClick={run}
      disabled={pending}
    >
      {pending ? "Saving…" : next === "published" ? "Publish paper" : "Move back to draft"}
    </Button>
  );
}

export function PublishDraftsButton({
  testId,
  count,
}: {
  testId: string;
  /** Draft questions on the paper, for the label and confirmation. */
  count: number;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [pending, startTransition] = useTransition();

  const noun = `${count} draft question${count === 1 ? "" : "s"}`;

  function run() {
    if (!window.confirm(`Publish ${noun}? They will count towards the paper.`)) return;

    startTransition(async () => {
      const result = await publishDraftQuestionsAction({ testId });

      if (!result.ok) {
        showToast("error", result.message);
        return;
      }

      const published = result.data.count;
      showToast(
        "success",
        `${published} question${published === 1 ? "" : "s"} published.`,
      );
      router.refresh();
    });
  }

  return (
    <Button variant="secondary" size="sm" onClick={run} disabled={pending}>
      {pending ? "Publishing…" : `Publish all drafts (${count})`}
    </Button>
  );
}

export function RemoveQuestionButton({
  testId,
  questionId,
  label,
}: {
  testId: string;
  questionId: string;
  /** "Question 4", for the confirmation and the screen-reader label. */
  label: string;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [pending, startTransition] = useTransition();

  function run() {
    if (!window.confirm(`Remove ${label} from this paper? It stays in the question bank.`)) return;

    startTransition(async () => {
      const result = await removeQuestionAction({ testId, questionId });

      if (!result.ok) {
        showToast("error", result.message);
        return;
      }

      showToast("success", `${label} removed.`);
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={run}
      disabled={pending}
      className="flex size-10 items-center justify-center text-ink-secondary hover:bg-paper hover:text-danger disabled:opacity-40"
      aria-label={`Remove ${label}`}
    >
      <Trash2 aria-hidden className="size-4" />
    </button>
  );
}

export function ReleaseResultsButton({
  testId,
  stillOpen,
}: {
  testId: string;
  /** The paper can still be started, so releasing shows the key to students yet to sit it. */
  stillOpen: boolean;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [pending, startTransition] = useTransition();

  function run() {
    const warning = stillOpen
      ? "\n\nThis paper is still open. Students who have not sat it yet could get the answer key from someone who has."
      : "";

    if (
      !window.confirm(
        `Release results now? Every student who has submitted will see their score, rank and answer key.${warning}`,
      )
    ) {
      return;
    }

    startTransition(async () => {
      const result = await releaseResultsAction({ testId });

      if (!result.ok) {
        showToast("error", result.message);
        return;
      }

      const { released, ranked } = result.data;
      showToast(
        "success",
        released > 0
          ? `Results released to ${released} student${released === 1 ? "" : "s"}.`
          : `Ranks refreshed for ${ranked} student${ranked === 1 ? "" : "s"}.`,
      );
      router.refresh();
    });
  }

  return (
    <Button size="sm" onClick={run} disabled={pending}>
      {pending ? "Releasing…" : "Release results now"}
    </Button>
  );
}
