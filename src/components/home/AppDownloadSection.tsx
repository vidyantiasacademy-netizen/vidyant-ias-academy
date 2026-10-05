import {
  BellRing,
  ClipboardCheck,
  Download,
  LineChart,
  PlayCircle,
  Smartphone,
} from "lucide-react";

import { Section } from "@/components/layout/Section";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { TrackedAnchor, TrackedButtonLink } from "@/components/ui/TrackedLink";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { APP, BRAND, CTA, whatsappUrl } from "@/lib/constants/site";

const APP_FEATURES = [
  { icon: PlayCircle, label: "Live and recorded classes" },
  { icon: ClipboardCheck, label: "Tests with instant analysis" },
  { icon: LineChart, label: "Your performance dashboard" },
  { icon: BellRing, label: "Batch, test and mentor reminders" },
];

const APP_SCREEN = [
  { label: "Today's class", value: "Polity — Judiciary" },
  { label: "Test due", value: "Prelims Sectional 04" },
  { label: "Mentor review", value: "Scheduled Saturday" },
];

/**
 * Student app block.
 *
 * `APP.available` is false until the app ships, so the block asks to be notified
 * instead of linking to a store listing that does not exist yet.
 */
export function AppDownloadSection() {
  return (
    <Section tone="paper" id="app" containerSize="wide">
      <div className="grid gap-12 lg:grid-cols-[1fr_0.8fr] lg:items-center lg:gap-16">
        <div>
          <Eyebrow>Student App</Eyebrow>
          <h2 className="mt-4 text-h2 font-semibold lg:text-h2-lg">
            Your classes, tests and mentor in one place.
          </h2>
          <p className="mt-5 max-w-xl text-body text-ink-secondary sm:text-body-lg">
            Enrolled students get the {BRAND.name} app: class recordings, the test
            calendar, answer evaluation feedback and the same performance dashboard your
            mentor sees.
          </p>

          <ul className="mt-9 grid gap-3 sm:grid-cols-2">
            {APP_FEATURES.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-3 text-body text-ink-secondary">
                <Icon aria-hidden className="size-4.5 shrink-0 text-kesar-600" />
                {label}
              </li>
            ))}
          </ul>

          {APP.available ? (
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              {APP.android ? (
                <TrackedAnchor
                  href={APP.android}
                  target="_blank"
                  rel="noreferrer"
                  event={ANALYTICS_EVENTS.appDownloadClick}
                  payload={{ platform: "android", location: "home-app" }}
                  className="inline-flex h-13 items-center justify-center gap-2 rounded-md bg-indigo px-6 text-body font-semibold text-white transition-colors hover:bg-indigo-700"
                >
                  <Download aria-hidden className="size-4.5" />
                  Get it on Android
                </TrackedAnchor>
              ) : null}
              {APP.ios ? (
                <TrackedAnchor
                  href={APP.ios}
                  target="_blank"
                  rel="noreferrer"
                  event={ANALYTICS_EVENTS.appDownloadClick}
                  payload={{ platform: "ios", location: "home-app" }}
                  className="inline-flex h-13 items-center justify-center gap-2 rounded-md border border-line-strong bg-white px-6 text-body font-semibold text-indigo transition-colors hover:border-indigo"
                >
                  <Download aria-hidden className="size-4.5" />
                  Download on iOS
                </TrackedAnchor>
              ) : null}
            </div>
          ) : (
            <>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <TrackedButtonLink
                  href="#callback"
                  variant="primary"
                  size="lg"
                  event={ANALYTICS_EVENTS.callbackClick}
                  payload={{ location: "home-app" }}
                >
                  Tell me when it launches
                </TrackedButtonLink>
                <TrackedAnchor
                  href={whatsappUrl(
                    `Hi ${BRAND.name}, please let me know when the student app is available.`,
                  )}
                  target="_blank"
                  rel="noreferrer"
                  event={ANALYTICS_EVENTS.whatsappClick}
                  payload={{ location: "home-app" }}
                  className="inline-flex h-13 items-center justify-center gap-2 rounded-md border border-line-strong bg-white px-6 text-body font-semibold text-indigo transition-colors hover:border-indigo"
                >
                  Ask on WhatsApp
                </TrackedAnchor>
              </div>
              <p className="mt-5 text-small text-ink-muted">
                The app is in development. Until it ships, classes, tests and feedback run
                through the centre and your mentor — nothing in the programme depends on it.
              </p>
            </>
          )}

          <ButtonLink href={CTA.courses.href} variant="link" className="mt-7 px-0">
            See what each programme includes
          </ButtonLink>
        </div>

        {/* Labelled UI illustration, not a screenshot of a shipped product. */}
        <div className="relative mx-auto w-full max-w-[20rem]">
          <div className="rounded-[2rem] border border-line-strong bg-white p-3 shadow-[var(--shadow-card-hover)]">
            <div className="rounded-[1.5rem] bg-indigo p-5 text-white">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-small font-semibold">
                  <Smartphone aria-hidden className="size-4 text-kesar" />
                  {BRAND.name}
                </span>
                <Badge tone="light">Preview</Badge>
              </div>

              <p className="mt-7 text-eyebrow font-semibold uppercase text-white/50">
                This week
              </p>
              <dl className="mt-3 space-y-2.5">
                {APP_SCREEN.map((row) => (
                  <div key={row.label} className="rounded-md bg-indigo-900/70 px-4 py-3">
                    <dt className="text-eyebrow font-semibold uppercase text-white/50">
                      {row.label}
                    </dt>
                    <dd className="mt-1 text-small font-medium text-white">{row.value}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-5 rounded-md border border-white/12 px-4 py-3">
                <p className="text-eyebrow font-semibold uppercase text-white/50">
                  Prelims readiness
                </p>
                <div aria-hidden className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/15">
                  <span className="block h-full w-[62%] rounded-full bg-kesar" />
                </div>
                <p className="mt-2.5 text-small text-white/70">Sample figure, not student data</p>
              </div>
            </div>
          </div>
          <p className="mt-4 text-center text-small text-ink-muted">
            Illustration of the student app interface
          </p>
        </div>
      </div>
    </Section>
  );
}
