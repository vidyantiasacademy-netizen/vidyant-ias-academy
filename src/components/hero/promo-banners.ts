import {
  BookOpenCheck,
  CalendarCheck2,
  ClipboardList,
  FileCheck2,
  MonitorPlay,
  UserRoundCheck,
  type LucideIcon,
} from "lucide-react";

import { ANALYTICS_EVENTS, type AnalyticsEvent } from "@/lib/analytics/events";
import { BRAND, CTA, EXAM_CYCLE, ROUTES } from "@/lib/constants/site";

/**
 * Homepage promotional banners — the rotating "advertisement" panel in the hero.
 *
 * House rules for anything added here:
 *   1. Every claim must be verifiable today. No selection counts, no student
 *      numbers, no discount percentages until vidyantIAS has them on record.
 *   2. `tag` is a factual qualifier ("Free", "Open now"), never manufactured
 *      scarcity.
 *   3. Every `href` must be a real route — the banner is an ad, not a dead end.
 *
 * TODO(institute): reorder, add or remove banners as campaigns change. The
 * carousel adapts to any count from one upwards.
 */
export interface PromoBanner {
  id: string;
  /** Small uppercase label above the headline. */
  eyebrow: string;
  /** Two or three words, rendered large. Shown on the dot labels too. */
  title: string;
  /** Second line of the headline, set in kesar. Optional. */
  titleAccent?: string;
  body: string;
  /** Factual qualifier shown as a pill beside the eyebrow. */
  tag?: string;
  icon: LucideIcon;
  primary: { label: string; href: string; event: AnalyticsEvent };
  secondary?: { label: string; href: string };
  /** Three short proof points along the bottom of the banner. */
  points: [string, string, string];
}

export const PROMO_BANNERS: PromoBanner[] = [
  {
    id: "admissions",
    eyebrow: `${EXAM_CYCLE.label} · ${BRAND.city}`,
    title: "Admissions are open.",
    titleAccent: "Foundation to Mains.",
    body: "Classroom and hybrid batches for Foundation, Prelims, Mains and Optional subjects — one mentor tracks you from day one.",
    tag: "Open now",
    icon: CalendarCheck2,
    primary: {
      label: CTA.enrol.label,
      href: CTA.enrol.href,
      event: ANALYTICS_EVENTS.enrolClick,
    },
    secondary: { label: "See all programmes", href: ROUTES.courses },
    points: ["Concept-led classes", "Fixed test calendar", "Personal mentor"],
  },
  {
    id: "demo",
    eyebrow: "Sit in before you decide",
    title: "Attend a live class.",
    titleAccent: "Pay nothing for it.",
    body: "Take a seat in a real concept class with our faculty, ask what you want, and judge the teaching for yourself.",
    tag: "Free",
    icon: MonitorPlay,
    primary: {
      label: CTA.demo.label,
      href: CTA.demo.href,
      event: ANALYTICS_EVENTS.demoClick,
    },
    secondary: { label: "How a class runs", href: `${ROUTES.home}#learning-system` },
    points: ["Real syllabus topic", "Faculty Q&A", "No payment online"],
  },
  {
    id: "counselling",
    eyebrow: "One-to-one with the academic team",
    title: "Get a preparation plan",
    titleAccent: "built around your attempt.",
    body: "Tell us where you are — first attempt, repeat attempt or working professional — and we map the programme, timeline and optional subject with you.",
    tag: "Free",
    icon: UserRoundCheck,
    primary: {
      label: CTA.counselling.label,
      href: CTA.counselling.href,
      event: ANALYTICS_EVENTS.counsellingClick,
    },
    secondary: { label: "Talk to us on WhatsApp", href: ROUTES.contact },
    points: ["30–45 minutes", "No obligation", "Fee options explained"],
  },
  {
    id: "mains",
    eyebrow: "Mains answer evaluation",
    title: "Every answer read",
    titleAccent: "and returned with a rewrite plan.",
    body: "Answer writing improves on feedback, not volume. Faculty mark your copy, mark the gap, and show the better structure.",
    icon: FileCheck2,
    primary: {
      label: "Explore the Mains Program",
      href: `${ROUTES.courses}/mains-program`,
      event: ANALYTICS_EVENTS.courseCtaClick,
    },
    secondary: { label: "Prelims & Mains test series", href: `${ROUTES.courses}/test-series` },
    points: ["GS-I to GS-IV & Essay", "Answer writing lab", "Model structures"],
  },
  {
    id: "resources",
    eyebrow: "Start with the syllabus, not a shortcut",
    title: "Download the UPSC",
    titleAccent: "starter kit and PYQ guide.",
    body: "Syllabus map, booklist, a weekly study template and a previous-year-question strategy note — the material we hand our own students.",
    tag: "Free",
    icon: BookOpenCheck,
    primary: {
      label: CTA.resources.label,
      href: ROUTES.resources,
      event: ANALYTICS_EVENTS.resourceDownload,
    },
    secondary: { label: CTA.brochure.label, href: CTA.brochure.href },
    points: ["Syllabus map", "Booklist", "Weekly template"],
  },
];

/**
 * Thin notice strip above the banner. Kept to three or four words each: this
 * line is read on a phone, in a hurry, often in sunlight.
 */
export const HERO_NOTICES: { id: string; icon: LucideIcon; text: string }[] = [
  {
    id: "cycle",
    icon: CalendarCheck2,
    text: `${EXAM_CYCLE.admissionNote} · ${EXAM_CYCLE.label}`,
  },
  { id: "mode", icon: MonitorPlay, text: "Classroom & hybrid batches" },
  { id: "tests", icon: ClipboardList, text: "Mains answer evaluation" },
];
