import { ArrowUpRight, Crosshair, Flame, Info, LineChart, MessageSquareText } from "lucide-react";

import { Section } from "@/components/layout/Section";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { CTA } from "@/lib/constants/site";

import { ScoreTrendChart } from "./ScoreTrendChart";

/**
 * UI ILLUSTRATION ONLY.
 *
 * These figures demonstrate what the tracking view shows a student. They are
 * not any student's results and are labelled as a sample in the interface.
 */
const SAMPLE_TREND = [
  { label: "M1", score: 84 },
  { label: "M2", score: 92 },
  { label: "M3", score: 89 },
  { label: "M4", score: 103 },
  { label: "M5", score: 111 },
  { label: "M6", score: 118 },
];

const SAMPLE_PAPERS = [
  { label: "Polity", value: 82 },
  { label: "History & Culture", value: 74 },
  { label: "Geography", value: 69 },
  { label: "Environment", value: 63 },
  { label: "Economy", value: 47 },
];

const SAMPLE_SYLLABUS = 72;
const SAMPLE_STREAK = 12;
const SAMPLE_FOCUS = ["Economy", "Mains answer structure", "Current affairs"];

const POINTS = [
  {
    icon: LineChart,
    text: "Every mock plotted, so you watch the line move — not guess at it",
  },
  {
    icon: Crosshair,
    text: "Subject-wise splits that show exactly where your marks leak",
  },
  {
    icon: MessageSquareText,
    text: "A focus list you and your mentor actually come back to",
  },
];

export function PerformanceTracking() {
  const latest = SAMPLE_TREND.at(-1)!.score;
  const lift = latest - SAMPLE_TREND[0].score;
  const weakest = SAMPLE_PAPERS.reduce((a, b) => (b.value < a.value ? b : a));

  return (
    <Section id="performance-tracking" containerSize="wide">
      <div className="grid items-center gap-8 lg:grid-cols-12 lg:gap-12">
        <div className="border-t-2 border-indigo pt-5 lg:col-span-5">
          <Eyebrow>Performance Tracking</Eyebrow>
          <h2 className="mt-4 text-h2 font-bold lg:text-h2-lg">
            Vibes don&apos;t clear Prelims. <span className="text-indigo">Data does.</span>
          </h2>
          <p className="mt-5 text-body text-ink-secondary sm:text-body-lg">
            Every test, every evaluated answer and every review feeds one live view of your prep. No
            more &ldquo;I think it&apos;s going okay&rdquo; — you and your mentor read the same
            numbers and watch them move.
          </p>
          <ul className="mt-6 text-body text-ink">
            {POINTS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex gap-3.5 border-t border-line py-3">
                <span className="flex size-9 shrink-0 items-center justify-center border border-indigo text-indigo">
                  <Icon aria-hidden className="size-[18px]" />
                </span>
                <span className="pt-1">{text}</span>
              </li>
            ))}
          </ul>
          <ButtonLink href={CTA.counselling.href} variant="primary" className="mt-7">
            Talk to an Academic Counsellor
          </ButtonLink>
        </div>

        <figure className="border-2 border-indigo bg-paper p-3 sm:p-4 lg:col-span-7">
          {/* Header */}
          <div className="flex items-center justify-between gap-3 px-2 pb-3 pt-1">
            <div className="flex items-center gap-2.5">
              <span aria-hidden className="inline-flex size-2.5 rounded-full bg-success" />
              <p className="text-small font-semibold text-indigo">Your prep, at a glance</p>
            </div>
            <Badge tone="neutral" className="bg-white">
              Sample
            </Badge>
          </div>

          {/* KPI tiles */}
          <dl className="grid grid-cols-3 gap-2 sm:gap-3">
            <div className="border border-line bg-white p-3 sm:p-4">
              <dt className="text-eyebrow font-semibold uppercase text-ink-muted">Syllabus</dt>
              <dd className="mt-2 flex items-center gap-2">
                <svg viewBox="0 0 36 36" aria-hidden className="hidden size-9 -rotate-90 sm:block">
                  <circle
                    cx="18"
                    cy="18"
                    r="15"
                    fill="none"
                    strokeWidth="4"
                    className="stroke-paper-200"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="15"
                    fill="none"
                    strokeWidth="4"
                    pathLength={100}
                    strokeDasharray={`${SAMPLE_SYLLABUS} 100`}
                    className="stroke-indigo"
                  />
                </svg>
                <span className="text-h4 font-bold tabular-nums text-indigo">
                  {SAMPLE_SYLLABUS}%
                </span>
              </dd>
            </div>
            <div className="border border-line bg-white p-3 sm:p-4">
              <dt className="text-eyebrow font-semibold uppercase text-ink-muted">Last mock</dt>
              <dd className="mt-2">
                <span className="text-h4 font-bold tabular-nums text-indigo">{latest}</span>
                <span className="text-small tabular-nums text-ink-muted">/200</span>
                <span className="mt-0.5 flex items-center gap-0.5 text-small font-semibold tabular-nums text-success">
                  <ArrowUpRight aria-hidden className="size-4" />+{lift}
                  <span className="sr-only"> since first mock</span>
                </span>
              </dd>
            </div>
            <div className="border border-line bg-white p-3 sm:p-4">
              <dt className="text-eyebrow font-semibold uppercase text-ink-muted">Streak</dt>
              <dd className="mt-2 flex flex-wrap items-center gap-x-1.5">
                <Flame aria-hidden className="size-5 shrink-0 text-kesar-600" />
                <span className="text-h4 font-bold tabular-nums text-indigo">{SAMPLE_STREAK}</span>
                <span className="text-small text-ink-muted">days</span>
              </dd>
            </div>
          </dl>

          {/* Trend + subject split */}
          <div className="mt-2 grid gap-2 sm:mt-3 sm:gap-3 md:grid-cols-[1.25fr_1fr]">
            <div className="border border-line bg-white p-4">
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-small font-semibold text-indigo">Prelims mock trend</p>
                <p className="text-eyebrow uppercase text-ink-muted">GS I · /200</p>
              </div>
              <div className="mt-3">
                <ScoreTrendChart
                  points={SAMPLE_TREND}
                  max={200}
                  domain={[70, 130]}
                  ticks={[70, 90, 110, 130]}
                />
              </div>
            </div>

            {/* Secondary panels are kept to md+ so the mock stays one screen tall on phones. */}
            <div className="hidden border border-line bg-white p-4 md:block">
              <p className="text-small font-semibold text-indigo">Accuracy by subject</p>
              <dl className="mt-4 space-y-3.5">
                {SAMPLE_PAPERS.map((paper) => {
                  const isWeakest = paper === weakest;
                  return (
                    <div key={paper.label}>
                      <div className="flex items-baseline justify-between gap-2">
                        <dt className="flex items-center gap-2 text-small text-ink">
                          {paper.label}
                          {isWeakest ? (
                            <span className="bg-kesar-100 px-2 text-[13px] font-semibold text-kesar-700">
                              needs reps
                            </span>
                          ) : null}
                        </dt>
                        <dd className="text-small font-semibold tabular-nums text-ink-secondary">
                          {paper.value}%
                        </dd>
                      </div>
                      <div aria-hidden className="mt-1.5 h-2 w-full overflow-hidden bg-paper-200">
                        <div className="h-full bg-indigo" style={{ width: `${paper.value}%` }} />
                      </div>
                    </div>
                  );
                })}
              </dl>
            </div>
          </div>

          {/* Focus + mentor note */}
          <div className="mt-3 hidden gap-3 md:grid md:grid-cols-2">
            <div className="border border-line bg-white p-4">
              <p className="text-eyebrow font-semibold uppercase text-ink-muted">
                This week&apos;s focus
              </p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {SAMPLE_FOCUS.map((item) => (
                  <li key={item}>
                    <Badge tone="kesar">{item}</Badge>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-indigo p-4 text-white">
              <p className="text-eyebrow font-semibold uppercase text-kesar">Mentor note</p>
              <p className="mt-2 text-small leading-snug">
                &ldquo;Six mocks, steady climb — love that. {weakest.label} is the leak now: two PYQ
                sets before Sunday, then we review.&rdquo;
              </p>
            </div>
          </div>

          <figcaption className="mt-3 flex gap-2.5 px-2 pb-1 text-small text-ink-muted">
            <Info aria-hidden className="mt-0.5 size-4 shrink-0" />A sample interface built to show
            what the tracking view contains. The figures are illustrative and are not any
            student&apos;s results.
          </figcaption>
        </figure>
      </div>
    </Section>
  );
}
