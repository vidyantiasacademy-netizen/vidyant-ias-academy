import type { Locale } from "@/i18n/config";
import { ROUTES, SITE_URL } from "@/lib/constants/site";
import {
  ATTEMPT_OPTIONS,
  ATTENDANCE_MODES,
  COUNSELLING_SLOTS,
  nameField,
} from "@/lib/validation/schemas";

import { BOT_COPY, GREETING, LANGUAGE_BUTTONS, RESTART_WORDS } from "./copy";
import type { BotInput, BotState, Interest, Outgoing } from "./types";

/**
 * The bot's conversation, as a pure function: state + what the person did →
 * the next state, the replies, and whether the lead should be written.
 *
 * No I/O here, so a Firestore transaction can re-run it safely on contention
 * and every branch can be checked without a phone.
 */

/** What each menu choice is called on the enquiry, in counsellor English. */
export const INTEREST_LABELS: Record<Interest, string> = {
  courses: "Courses and syllabus",
  fees: "Fees and instalments",
  counselling: "Free counselling",
  mock: "Free mock test",
  human: "Talk to a counsellor",
};

const MENU_ORDER: Interest[] = ["courses", "fees", "counselling", "mock", "human"];

export interface FlowContext {
  /** The WhatsApp profile name, which the person may not want on file. */
  profileName: string | null;
  /** True when the last message is old enough that the chat starts over. */
  expired: boolean;
}

export interface FlowResult {
  state: BotState;
  replies: Outgoing[];
  /** Set when the enquiry should be created or brought up to date. */
  lead: { note?: string } | null;
  /** The person asked for a human: the bot should go quiet. */
  handoff: boolean;
}

export function isRestart(input: BotInput): boolean {
  return input.kind === "text" && RESTART_WORDS.has(input.text.trim().toLowerCase());
}

function fresh(previous: BotState | null): BotState {
  const locale = previous?.locale ?? null;
  return {
    locale,
    step: locale ? "menu" : "language",
    interest: null,
    attempt: null,
    mode: null,
    preferredTime: null,
    // A name the person confirmed once is still theirs on a later visit.
    name: previous?.name ?? null,
  };
}

function siteLink(locale: Locale, path: string): string {
  return `${SITE_URL}${locale === "en" ? "" : `/${locale}`}${path}`;
}

/** Index from a reply id such as `attempt:2`, bounded by the option list. */
function pick(id: string, prefix: string, options: readonly unknown[]): number | null {
  if (!id.startsWith(`${prefix}:`)) return null;
  const index = Number(id.slice(prefix.length + 1));
  return Number.isInteger(index) && index >= 0 && index < options.length ? index : null;
}

// ------------------------------------------------------------------ prompts

/** The message that asks for the current step. */
function prompt(state: BotState, profileName: string | null): Outgoing[] {
  if (state.step === "language" || !state.locale) {
    return [{ type: "buttons", body: GREETING, buttons: [...LANGUAGE_BUTTONS] }];
  }

  const copy = BOT_COPY[state.locale];

  switch (state.step) {
    case "menu":
      return [
        {
          type: "list",
          body: copy.menuBody,
          button: copy.menuButton,
          rows: MENU_ORDER.map((interest) => ({ id: `menu:${interest}`, ...copy.menu[interest] })),
        },
      ];
    case "attempt":
      return [
        {
          type: "list",
          body: copy.attemptBody,
          button: copy.chooseButton,
          rows: copy.attempts.map((title, index) => ({ id: `attempt:${index}`, title })),
        },
      ];
    case "mode":
      return [
        {
          type: "buttons",
          body: copy.modeBody,
          buttons: copy.modes.map((title, index) => ({ id: `mode:${index}`, title })),
        },
      ];
    case "name-confirm":
      return [
        {
          type: "buttons",
          body: copy.nameConfirm(profileName ?? ""),
          buttons: [
            { id: "name:yes", title: copy.nameYes },
            { id: "name:no", title: copy.nameNo },
          ],
        },
      ];
    case "name-input":
      return [{ type: "text", body: copy.nameInput }];
    case "slot":
      return [
        {
          type: "buttons",
          body: copy.slotBody,
          buttons: copy.slots.map((title, index) => ({ id: `slot:${index}`, title })),
        },
      ];
    case "done":
      return [{ type: "text", body: copy.idle }];
  }
}

/** After the attendance mode: confirm the profile name, ask for one, or skip ahead. */
function nameStep(state: BotState, profileName: string | null): BotState["step"] {
  if (state.name) return "slot";
  return profileName && nameField.safeParse(profileName).success ? "name-confirm" : "name-input";
}

// --------------------------------------------------------------------- flow

function chooseInterest(
  state: BotState,
  interest: Interest,
  context: FlowContext,
): FlowResult {
  const locale = state.locale ?? "en";
  const copy = BOT_COPY[locale];
  const note = `WhatsApp: chose "${INTEREST_LABELS[interest]}".`;
  const base: BotState = { ...state, locale, interest };

  if (interest === "human") {
    return {
      state: { ...base, step: "done" },
      replies: [{ type: "text", body: copy.handoff }],
      lead: { note: "WhatsApp: asked to talk to a counsellor. The bot is paused for 24 hours." },
      handoff: true,
    };
  }

  if (interest === "mock") {
    return {
      state: { ...base, step: "done" },
      replies: [{ type: "text", body: copy.mock(siteLink(locale, ROUTES.mockTest)) }],
      lead: { note },
      handoff: false,
    };
  }

  const intro =
    interest === "courses"
      ? copy.coursesIntro(siteLink(locale, ROUTES.courses))
      : interest === "fees"
        ? copy.feesIntro
        : copy.counsellingIntro;

  const next: BotState = { ...base, step: "attempt" };
  return {
    state: next,
    replies: [{ type: "text", body: intro }, ...prompt(next, context.profileName)],
    lead: { note },
    handoff: false,
  };
}

export function advance(
  previous: BotState | null,
  input: BotInput,
  context: FlowContext,
): FlowResult {
  const restarting = !previous || context.expired || isRestart(input);
  const state = restarting ? fresh(previous) : previous;
  const reply = input.kind === "reply" ? input.id : null;

  const stay = (extra?: Outgoing): FlowResult => ({
    state,
    replies: extra ? [extra, ...prompt(state, context.profileName)] : prompt(state, context.profileName),
    lead: null,
    handoff: false,
  });

  // The language and the menu answer from anywhere: an old message's buttons
  // still work, and they are how a person starts over.
  if (reply === "lang:en" || reply === "lang:hi") {
    const next: BotState = { ...state, locale: reply === "lang:en" ? "en" : "hi", step: "menu" };
    return { state: next, replies: prompt(next, context.profileName), lead: null, handoff: false };
  }

  const menuChoice = reply ? MENU_ORDER.find((interest) => reply === `menu:${interest}`) : undefined;
  if (menuChoice) return chooseInterest(state, menuChoice, context);

  // A greeting, a restart word, or a stale chat: show where they are now.
  if (restarting) return stay();

  const copy = BOT_COPY[state.locale ?? "en"];
  const nudge: Outgoing = { type: "text", body: copy.tapAnOption };

  switch (state.step) {
    case "language":
    case "menu":
      return stay(nudge);

    case "attempt": {
      const index = reply ? pick(reply, "attempt", ATTEMPT_OPTIONS) : null;
      if (index === null) return stay(nudge);
      const next: BotState = { ...state, attempt: ATTEMPT_OPTIONS[index], step: "mode" };
      return { state: next, replies: prompt(next, context.profileName), lead: {}, handoff: false };
    }

    case "mode": {
      const index = reply ? pick(reply, "mode", ATTENDANCE_MODES) : null;
      if (index === null) return stay(nudge);
      const chosen: BotState = { ...state, mode: ATTENDANCE_MODES[index] };
      const next: BotState = { ...chosen, step: nameStep(chosen, context.profileName) };
      return { state: next, replies: prompt(next, context.profileName), lead: {}, handoff: false };
    }

    case "name-confirm": {
      if (reply === "name:yes" && context.profileName) {
        const next: BotState = { ...state, name: context.profileName.trim(), step: "slot" };
        return { state: next, replies: prompt(next, context.profileName), lead: {}, handoff: false };
      }
      if (reply === "name:no") {
        const next: BotState = { ...state, step: "name-input" };
        return { state: next, replies: prompt(next, context.profileName), lead: null, handoff: false };
      }
      return stay(nudge);
    }

    case "name-input": {
      const parsed = input.kind === "text" ? nameField.safeParse(input.text) : null;
      if (!parsed?.success) {
        return { state, replies: [{ type: "text", body: copy.nameInvalid }], lead: null, handoff: false };
      }
      const next: BotState = { ...state, name: parsed.data, step: "slot" };
      return { state: next, replies: prompt(next, context.profileName), lead: {}, handoff: false };
    }

    case "slot": {
      const index = reply ? pick(reply, "slot", COUNSELLING_SLOTS) : null;
      if (index === null) return stay(nudge);
      const locale = state.locale ?? "en";
      const next: BotState = { ...state, preferredTime: COUNSELLING_SLOTS[index], step: "done" };
      const firstName = (next.name ?? "").split(/\s+/)[0] ?? "";
      return {
        state: next,
        replies: [
          {
            type: "text",
            body: copy.done(firstName, copy.slots[index] ?? "", siteLink(locale, ROUTES.courses)),
          },
        ],
        lead: { note: "WhatsApp: answered every question. Ready for a call." },
        handoff: false,
      };
    }

    case "done":
      return { state, replies: [{ type: "text", body: copy.idle }], lead: null, handoff: false };
  }
}
