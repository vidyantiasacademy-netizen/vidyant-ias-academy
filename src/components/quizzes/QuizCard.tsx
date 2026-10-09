import { ArrowRight, Clock, ListChecks } from "lucide-react";

import Link from "@/i18n/Link";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { QUIZ_STAGE_LABELS } from "@/data/quizzes";
import { cn } from "@/lib/utils/cn";
import type { Quiz } from "@/types";

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
  }).format(new Date(iso));
}

/**
 * A quiz is only a link when `href` is set. Announced-but-not-open quizzes
 * render as a dated card that says so, rather than a button that goes nowhere.
 */
export function QuizCard({ quiz, className }: { quiz: Quiz; className?: string }) {
  const isOpen = Boolean(quiz.href);

  return (
    <Card
      as="article"
      interactive={isOpen}
      className={cn("flex h-full flex-col", className)}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge>{QUIZ_STAGE_LABELS[quiz.stage]}</Badge>
        <Badge tone="neutral">{quiz.subject}</Badge>
      </div>

      <h3 className="mt-4 text-h4 font-semibold">
        {isOpen ? (
          <Link
            href={quiz.href as string}
            className="transition-colors hover:text-kesar-600"
          >
            {quiz.title}
          </Link>
        ) : (
          quiz.title
        )}
      </h3>

      <p className="mt-3 flex-1 text-small text-ink-secondary">{quiz.description}</p>

      <dl className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-small text-ink-muted">
        <div className="flex items-center gap-2">
          <dt className="sr-only">Questions</dt>
          <ListChecks aria-hidden className="size-4 text-kesar-600" />
          <dd>{quiz.questionCount} questions</dd>
        </div>
        <div className="flex items-center gap-2">
          <dt className="sr-only">Duration</dt>
          <Clock aria-hidden className="size-4 text-kesar-600" />
          <dd>{quiz.durationMinutes} minutes</dd>
        </div>
      </dl>

      {isOpen ? (
        <Link
          href={quiz.href as string}
          className="group mt-4 inline-flex items-center gap-2 text-small font-semibold text-indigo transition-colors hover:text-kesar-600"
        >
          Attempt this quiz
          <ArrowRight
            aria-hidden
            className="size-4 transition-transform duration-200 ease-[var(--ease-brand)] group-hover:translate-x-1"
          />
        </Link>
      ) : (
        <p className="mt-4 text-small font-medium text-kesar-700">
          Opens {formatDate(quiz.publishedAt)}
        </p>
      )}
    </Card>
  );
}
