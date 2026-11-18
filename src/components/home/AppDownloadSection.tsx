import {
  ArrowRight,
  Bell,
  BellRing,
  BookOpen,
  ChartColumnIncreasing,
  ChartLine,
  Check,
  ClipboardList,
  House,
  Layers,
  MonitorPlay,
  Smartphone,
  UserRound,
} from "lucide-react";

import { Section } from "@/components/layout/Section";
import { BrandMark } from "@/components/ui/BrandMark";
import { ButtonLink, buttonStyles } from "@/components/ui/Button";
import { SectionArt } from "@/components/ui/SectionArt";
import { PhoneMockup } from "@/components/ui/PhoneMockup";
import { TrackedAnchor } from "@/components/ui/TrackedLink";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { APP, BRAND, ROUTES, whatsappUrl } from "@/lib/constants/site";
import { cn } from "@/lib/utils/cn";

const WEEK = [
  { day: "Mon", date: 13 },
  { day: "Tue", date: 14 },
  { day: "Wed", date: 15, today: true },
  { day: "Thu", date: 16 },
  { day: "Fri", date: 17 },
];

const TODAY_PLAN = [
  { task: "Watch Polity lecture", time: "45 mins", done: true },
  { task: "Revise notes", time: "30 mins", done: true },
  { task: "Attempt 30 MCQs", time: "30 mins" },
  { task: "Read the daily news summary", time: "15 mins" },
];

const SUBJECTS = [
  { name: "Polity", value: 80 },
  { name: "Modern History", value: 65 },
  { name: "Current Affairs", value: 72 },
  { name: "General Science", value: 60 },
];

const APP_NAV = [
  { icon: House, label: "Home", active: true },
  { icon: BookOpen, label: "Classes" },
  { icon: ChartLine, label: "Progress" },
  { icon: UserRound, label: "Profile" },
];

const WEEKLY_GOAL = { done: 6, of: 7, percent: 85 };

/** Official Google Play mark: the four-colour Play triangle. */
function PlayGlyph() {
  return (
    <svg aria-hidden viewBox="30 336.7 120.9 129.2" className="size-6">
      <path
        fill="#FFD400"
        d="M119.2 421.2c15.3-8.4 27-14.8 28-15.3 3.2-1.7 6.5-6.2 0-9.7-2.1-1.1-13.4-7.3-28-15.3l-20.1 20.2 20.1 20.1Z"
      />
      <path
        fill="#FF3333"
        d="m99.1 401.1-64.2 64.7c1.5.2 3.2-.2 5.2-1.3 4.2-2.3 48.8-26.7 79.1-43.3l-20.1-20.1Z"
      />
      <path
        fill="#48FF48"
        d="m99.1 401.1 20.1-20.2s-74.6-40.7-79.1-43.1c-1.7-1-3.6-1.3-5.3-1l64.3 64.3Z"
      />
      <path
        fill="#3BCCFF"
        d="m99.1 401.1-64.3-64.3c-2.6.6-4.8 2.9-4.8 7.6v113.8c0 4.3 1.7 7.4 4.9 7.7l64.2-64.8Z"
      />
    </svg>
  );
}

/**
 * Primary app action. Until `APP.available` it never links to a listing that
 * does not exist: it asks to be told on WhatsApp the day the app launches.
 * Android only: there is no App Store app.
 */
function StoreButton() {
  const className = cn(
    buttonStyles({ variant: "kesar", size: "lg" }),
    "h-15 rounded-xl px-6 shadow-soft hover:bg-indigo hover:text-white",
  );

  return APP.available && APP.android ? (
    <TrackedAnchor
      href={APP.android}
      target="_blank"
      rel="noreferrer"
      event={ANALYTICS_EVENTS.appDownloadClick}
      payload={{ platform: "android", location: "home-app" }}
      className={className}
    >
      <PlayGlyph />
      Download on Google Play
    </TrackedAnchor>
  ) : (
    <TrackedAnchor
      href={whatsappUrl(`Hi ${BRAND.name}, please let me know when the student app is available.`)}
      target="_blank"
      rel="noreferrer"
      event={ANALYTICS_EVENTS.whatsappClick}
      payload={{ location: "home-app" }}
      className={className}
    >
      <BellRing aria-hidden className="size-5" />
      Notify me at launch
    </TrackedAnchor>
  );
}

const FEATURES = [
  { icon: MonitorPlay, label: "Live Classes" },
  { icon: Layers, label: "Study Material" },
  { icon: ClipboardList, label: "Mock Tests" },
  { icon: ChartColumnIncreasing, label: "Progress Tracking" },
  { icon: Smartphone, label: "Learn On\u2011the\u2011Go" },
];

/** Weekly-goal ring: kesar arc on a pale track. */
function GoalRing({ percent }: { percent: number }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative size-18 shrink-0">
      <svg aria-hidden viewBox="0 0 64 64" className="size-full -rotate-90">
        <circle cx="32" cy="32" r={r} fill="none" stroke="var(--color-paper-200)" strokeWidth="7" />
        <circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          stroke="var(--color-kesar)"
          strokeWidth="7"
          strokeDasharray={`${(c * percent) / 100} ${c}`}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-body font-bold text-indigo">
        {percent}%
      </span>
    </div>
  );
}

/**
 * Student app block: copy and store badges on the left, the phone with
 * today's plan in the middle, and a progress card overlapping its edge.
 * Every figure on the screens is a labelled sample, not student data.
 * Phones (below `md`) get the heading and store badges only.
 */
export function AppDownloadSection() {
  return (
    <Section
      tone="white"
      id="app"
      containerSize="wide"
      className="bg-[linear-gradient(105deg,#fff_0%,var(--color-paper)_48%,var(--color-kesar-100)_100%)]"
      art={<SectionArt variant="soft-right" />}
    >
      <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-10">
        <div>
          <p className="inline-flex items-center gap-2.5 rounded-xl bg-kesar-100 px-4 py-2 text-body font-bold text-indigo">
            <Smartphone aria-hidden className="size-5" strokeWidth={1.75} />
            {BRAND.name} App
          </p>
          <h2 className="mt-5 font-display text-h2 font-bold tracking-[-0.015em] text-indigo lg:text-h2-lg xl:text-[3.5rem] xl:leading-[1.08]">
            Your UPSC preparation companion,{" "}
            <em className="text-kesar-500">{APP.available ? "now on app." : "coming to app."}</em>
          </h2>
          <p className="mt-5 hidden max-w-[50ch] text-body text-ink-secondary sm:text-body-lg md:block">
            Plan your preparation, attend live classes, access study material, practise tests and
            track your progress — anytime, anywhere.
            {APP.available
              ? null
              : " Enrolled students use the student portal on the web today; the Android app is on its way."}
          </p>

          <div className="mt-6 flex flex-wrap gap-3 md:mt-8 sm:gap-4">
            <StoreButton />
            <ButtonLink
              href={ROUTES.login}
              variant="secondary"
              size="lg"
              className="h-15 rounded-xl bg-transparent px-6"
            >
              Open Student Portal
              <ArrowRight aria-hidden className="size-5" />
            </ButtonLink>
          </div>

          <ul className="mt-8 hidden grid-cols-5 rounded-2xl border border-white/80 bg-white/70 py-4 shadow-soft backdrop-blur-sm sm:grid lg:mt-10">
            {FEATURES.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="flex flex-col items-center gap-2 border-l border-line px-2 text-center first:border-l-0"
              >
                <Icon aria-hidden className="size-7 text-kesar-500" strokeWidth={1.75} />
                <span className="text-small leading-tight font-bold text-indigo">{label}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Labelled UI illustration, not a screenshot of a shipped product. */}
        <figure className="relative max-md:hidden">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-center sm:gap-0">
            <div className="relative w-full max-w-[17.5rem] shrink-0">
              <PhoneMockup statusBarTone="light">
                <div className="bg-white px-4 pt-2 pb-3">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-small font-semibold text-indigo">
                      <BrandMark className="h-6 w-auto" />
                      {BRAND.name}
                    </span>
                    <Bell aria-hidden className="size-4.5 text-ink-muted" />
                  </div>
                  <p className="mt-3 text-body font-semibold text-ink">Good morning!</p>
                  <p className="text-small text-ink-secondary">Let&apos;s keep going.</p>

                  <ol aria-hidden className="mt-3 grid grid-cols-5 gap-1.5">
                    {WEEK.map(({ day, date, today }) => (
                      <li
                        key={day}
                        className={cn(
                          "flex flex-col items-center rounded-lg py-1.5 leading-none",
                          today ? "bg-indigo text-white" : "bg-paper text-ink-secondary",
                        )}
                      >
                        <span className="text-[0.8125rem]">{day}</span>
                        <span className="mt-1 text-small font-semibold">{date}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="flex-1 overflow-hidden px-4 pt-3">
                  <p className="text-small font-semibold text-ink">Today&apos;s plan</p>
                  <ul className="mt-2 border-t border-line">
                    {TODAY_PLAN.map(({ task, time, done }) => (
                      <li
                        key={task}
                        className="flex items-center gap-2.5 border-b border-line bg-white px-1 py-2"
                      >
                        <span
                          aria-hidden
                          className={cn(
                            "flex size-5 shrink-0 items-center justify-center rounded-[0.3rem] border-2",
                            done ? "border-indigo bg-indigo text-white" : "border-line-strong",
                          )}
                        >
                          {done ? <Check className="size-3" strokeWidth={3} /> : null}
                        </span>
                        <span className="min-w-0">
                          <span
                            className={cn(
                              "block truncate text-[0.8125rem] font-medium leading-tight",
                              done ? "text-ink-muted line-through" : "text-ink",
                            )}
                          >
                            {task}
                          </span>
                          <span className="text-[0.8125rem] leading-tight text-ink-muted">
                            {time}
                          </span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <nav
                  aria-hidden
                  className="grid shrink-0 grid-cols-4 border-t border-line bg-white pt-2 pb-1"
                >
                  {APP_NAV.map(({ icon: Icon, label, active }) => (
                    <span
                      key={label}
                      className={cn(
                        "flex flex-col items-center gap-1 text-[0.8125rem] leading-none font-medium",
                        active ? "text-kesar-500" : "text-ink-muted",
                      )}
                    >
                      <Icon className="size-5" strokeWidth={active ? 2.25 : 1.75} />
                      {label}
                    </span>
                  ))}
                </nav>
              </PhoneMockup>
            </div>

            {/* Progress card, overlapping the phone's edge from sm. */}
            <div className="relative z-10 hidden w-full max-w-[17.5rem] rounded-[1.25rem] border border-white bg-white/95 p-5 shadow-soft-hover sm:-ml-8 sm:block sm:w-64 sm:self-start sm:mt-16">
              <p className="text-body font-bold text-indigo">Your progress</p>
              <div className="mt-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-small text-ink-secondary">Weekly goal</p>
                  <p className="mt-1 text-h4 font-bold text-ink">
                    {WEEKLY_GOAL.done}/{WEEKLY_GOAL.of}{" "}
                    <span className="text-small font-medium text-ink-secondary">days</span>
                  </p>
                </div>
                <GoalRing percent={WEEKLY_GOAL.percent} />
              </div>

              <p className="mt-4 text-small font-semibold text-ink">Subjects</p>
              <ul className="mt-2 space-y-2.5">
                {SUBJECTS.map(({ name, value }) => (
                  <li key={name}>
                    <div className="flex items-baseline justify-between text-[0.8125rem]">
                      <span className="text-ink-secondary">{name}</span>
                      <span className="font-bold text-indigo">{value}%</span>
                    </div>
                    <div aria-hidden className="mt-1 h-1.5 overflow-hidden rounded-full bg-paper-200">
                      <span className="block h-full rounded-full bg-kesar" style={{ width: `${value}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-[0.8125rem] text-ink-muted">
                Sample figures, not student data
              </p>
            </div>
          </div>

          <figcaption className="mt-6 text-center text-small text-ink-muted">
            Illustration of the student app interface
          </figcaption>
        </figure>
      </div>
    </Section>
  );
}
