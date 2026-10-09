import type { Metadata } from "next";
import { CalendarClock, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { BRAND } from "@/lib/constants/site";
import { describeExamRules, resolveExamSecurity } from "@/lib/exam/policy";
import { testService } from "@/services/tests/test.service";

/**
 * A paper's own page: what it is, when it is open, how it is invigilated, and the
 * one button that matters.
 *
 * The rules are listed here as well as on the exam screen on purpose. A student
 * should be able to read them while they still have the choice of when to sit —
 * the copy on the gate, seconds before the timer starts, is a reminder, not an
 * opportunity to decide.
 */
export const metadata: Metadata = {
  title: `Paper | ${BRAND.name}`,
  robots: { index: false, follow: false },
};

function windowLabel(opensAt: string | null, closesAt: string | null): string {
  if (!opensAt) return "Date to be announced";

  const format = (value: string) =>
    new Date(value).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
    });

  return closesAt ? `${format(opensAt)} — ${format(closesAt)}` : format(opensAt);
}

export default async function PaperPage({
  params,
}: PageProps<"/[lang]/dashboard/tests/[testId]">) {
  const { testId } = await params;

  // `getTest` is the authorisation: it refuses a draft paper and one from a
  // course this student has not enrolled in.
  const test = await testService.getTest(testId);
  const attempt = await testService.findOwnAttempt(testId);
  const policy = resolveExamSecurity(test);

  const now = new Date().toISOString();
  const notOpenYet = Boolean(test.opensAt && now < test.opensAt);
  const closed = Boolean(test.closesAt && now > test.closesAt);
  const isDescriptive = test.kind === "mains-descriptive";
  const finished = attempt && attempt.status !== "in-progress";

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-h2 font-semibold">{test.title}</h1>
          <p className="mt-2 text-body text-ink-secondary">
            {test.questionCount} questions · {test.totalMarks} marks ·{" "}
            {test.durationMinutes} minutes
            {test.negativeMarksPerQuestion > 0
              ? ` · −${test.negativeMarksPerQuestion} per wrong answer`
              : ""}
          </p>
        </div>

        {attempt ? (
          <Badge tone={finished ? "success" : "indigo"}>
            {attempt.status === "in-progress" ? "In progress" : "Submitted"}
          </Badge>
        ) : null}
      </div>

      <p className="mt-6 flex flex-wrap items-center gap-2 text-small text-ink-secondary">
        <CalendarClock aria-hidden className="size-4 text-kesar-600" />
        {windowLabel(test.opensAt, test.closesAt)}
        {test.subject ? ` · ${test.subject}` : ""}
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        {finished ? (
          <ButtonLink href={`/dashboard/tests/${test.id}/result`} variant="primary">
            View scorecard
          </ButtonLink>
        ) : isDescriptive ? (
          <p className="text-body text-ink-secondary">
            This is a descriptive paper. Write it by hand within the window above and
            upload the photographed answer sheet from Services — it is evaluated by
            faculty, not scored here.
          </p>
        ) : notOpenYet ? (
          <p className="text-body text-ink-secondary">
            The paper opens at the time shown above.
          </p>
        ) : closed ? (
          <p className="text-body text-ink-secondary">This paper has closed.</p>
        ) : (
          <ButtonLink href={`/exam/${test.id}`} variant="primary" size="lg">
            {attempt ? "Resume the paper" : "Start the paper"}
          </ButtonLink>
        )}
      </div>

      {!isDescriptive && !finished ? (
        <Card tone="paper" padding="md" className="mt-10">
          <h2 className="flex items-center gap-2 text-body-lg font-semibold">
            <ShieldCheck aria-hidden className="size-5 text-indigo" />
            How this paper is invigilated
          </h2>

          <ul className="mt-4 space-y-2 text-body text-ink-secondary">
            {describeExamRules(policy).map((rule) => (
              <li key={rule} className="flex gap-2">
                <span
                  aria-hidden
                  className="mt-2 size-1.5 shrink-0 rounded-full bg-indigo-gradient"
                />
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
    </>
  );
}
