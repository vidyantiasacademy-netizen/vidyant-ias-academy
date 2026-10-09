"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { removeQuestionAction, setTestStatusAction } from "@/lib/exam/authoring-actions";
import type { PublishStatus } from "@/types/db";

/**
 * The two small buttons on a paper's page. Both re-check everything on the
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
