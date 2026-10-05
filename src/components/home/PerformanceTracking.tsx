import { Info } from "lucide-react";

import { Section } from "@/components/layout/Section";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { CTA } from "@/lib/constants/site";

/**
 * UI ILLUSTRATION ONLY.
 *
 * These figures demonstrate what the tracking view shows a student. They are
 * not any student's results and are labelled as a sample in the interface.
 */
const SAMPLE_METRICS = [
  { label: "Syllabus completion", value: 72 },
  { label: "Prelims", value: 78 },
  { label: "Mains", value: 64 },
  { label: "CSAT", value: 81 },
  { label: "Answer writing", value: 58 },
];

const SAMPLE_FOCUS = ["Economy", "Mains answer structure", "Current affairs"];

export function PerformanceTracking() {
  return (
    <Section id="performance-tracking" containerSize="wide">
      <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
        <div>
          <Eyebrow>Performance Tracking</Eyebrow>
          <h2 className="mt-4 text-h2 font-semibold lg:text-h2-lg">
            Know where you stand. Know what to improve.
          </h2>
          <p className="mt-5 text-body text-ink-secondary sm:text-body-lg">
            Every test, every evaluated answer and every review feeds one view of your
            preparation. Instead of a vague feeling about how it is going, you and your
            mentor work from the same picture — and you can see it change.
          </p>
          <ul className="mt-8 space-y-3 text-body text-ink">
            <li className="flex gap-3">
              <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-kesar" />
              Syllabus coverage tracked subject by subject
            </li>
            <li className="flex gap-3">
              <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-kesar" />
              Test performance separated by stage and paper
            </li>
            <li className="flex gap-3">
              <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-kesar" />
              A current focus list you revisit with your mentor
            </li>
          </ul>
          <ButtonLink href={CTA.counselling.href} variant="primary" className="mt-9">
            Talk to an Academic Counsellor
          </ButtonLink>
        </div>

        <figure className="rounded-xl border border-line bg-white p-5 shadow-[var(--shadow-card)] sm:p-7">
          <div className="flex items-center justify-between gap-4 border-b border-line pb-5">
            <div>
              <p className="text-eyebrow font-semibold uppercase text-ink-muted">
                Preparation overview
              </p>
              <p className="mt-1.5 text-h4 font-semibold text-indigo">Sample Student Dashboard</p>
            </div>
            <Badge tone="neutral">Illustration</Badge>
          </div>

          <dl className="mt-6 space-y-5">
            {SAMPLE_METRICS.map((metric) => (
              <div
                key={metric.label}
                className="grid grid-cols-[1fr_auto] items-baseline gap-x-4"
              >
                <dt className="text-small font-medium text-indigo">{metric.label}</dt>
                <dd className="text-small font-semibold text-ink-secondary">
                  {metric.value}%
                </dd>
                <div
                  aria-hidden
                  className="col-span-2 mt-2 h-2 w-full overflow-hidden rounded-full bg-paper-200"
                >
                  <div
                    className="h-full rounded-full bg-indigo"
                    style={{ width: `${metric.value}%` }}
                  />
                </div>
              </div>
            ))}
          </dl>

          <div className="mt-7 rounded-lg bg-paper p-5">
            <p className="text-eyebrow font-semibold uppercase text-ink-muted">Current focus</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {SAMPLE_FOCUS.map((item) => (
                <li key={item}>
                  <Badge tone="kesar">{item}</Badge>
                </li>
              ))}
            </ul>
          </div>

          <figcaption className="mt-5 flex gap-2.5 text-small text-ink-muted">
            <Info aria-hidden className="mt-0.5 size-4 shrink-0" />
            A sample interface built to show what the tracking view contains. The figures
            are illustrative and are not any student&apos;s results.
          </figcaption>
        </figure>
      </div>
    </Section>
  );
}
