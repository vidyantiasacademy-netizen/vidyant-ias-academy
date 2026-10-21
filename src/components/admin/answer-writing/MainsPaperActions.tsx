"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { releaseEvaluationsAction, setMainsPaperStatusAction } from "@/lib/answer-writing/staff-actions";
import type { PublishStatus } from "@/types/db";

/**
 * The small buttons on a Mains paper's page. Each re-checks on the server; a
 * disabled state here only saves a round trip that would be refused.
 */

export function MainsPaperStatusButton({
  testId,
  status,
  blocker,
}: {
  testId: string;
  status: PublishStatus;
  /** Why it cannot be published yet. */
  blocker: string | null;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [pending, startTransition] = useTransition();

  const next: PublishStatus = status === "published" ? "draft" : "published";

  function run() {
    if (
      next === "published" &&
      !window.confirm("Publish this paper? Enrolled students will see it and can download it once it opens.")
    ) {
      return;
    }

    startTransition(async () => {
      const result = await setMainsPaperStatusAction({ testId, status: next });

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
      disabled={pending || (next === "published" && blocker !== null)}
      title={next === "published" ? (blocker ?? undefined) : undefined}
    >
      {pending ? "Saving…" : next === "published" ? "Publish paper" : "Move back to draft"}
    </Button>
  );
}

export function ReleaseEvaluationsButton({
  testId,
  held,
}: {
  testId: string;
  /** Evaluated copies their students cannot see yet. */
  held: number;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [pending, startTransition] = useTransition();

  function run() {
    const question =
      held > 0
        ? `Release ${held} evaluated cop${held === 1 ? "y" : "ies"} now? Each student is notified and sees their marks, rank, checked copy and feedback.`
        : "Refresh the ranks of every evaluated copy? Do this after correcting marks on a copy that is already out.";

    if (!window.confirm(question)) return;

    startTransition(async () => {
      const result = await releaseEvaluationsAction({ testId });

      if (!result.ok) {
        showToast("error", result.message);
        return;
      }

      const { released, ranked } = result.data;
      showToast(
        "success",
        released > 0
          ? `Released to ${released} student${released === 1 ? "" : "s"} and ranked.`
          : `Ranks refreshed for ${ranked} cop${ranked === 1 ? "y" : "ies"}.`,
      );
      router.refresh();
    });
  }

  return (
    <Button variant={held > 0 ? "primary" : "secondary"} size="sm" onClick={run} disabled={pending}>
      {pending ? "Releasing…" : held > 0 ? `Release ${held} and rank` : "Refresh ranks"}
    </Button>
  );
}
