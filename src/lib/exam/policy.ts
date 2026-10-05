import type { ExamSecurityPolicy, ProctorEventType, Test } from "@/types/db";

/**
 * The exam-integrity policy, and the one place its numbers are written down.
 *
 * Imported by both sides on purpose: the server enforces these values, and the
 * browser needs the same numbers to warn a student *before* a limit is reached
 * ("one tab switch left"). A warning that disagrees with the enforcement is
 * worse than none, so there is no second copy.
 *
 * Nothing secret lives here. The thresholds being known to a student does not
 * help them — the answer key never leaves the server, and the counters are
 * incremented server-side from events the browser cannot suppress without
 * stopping its own heartbeat, which finalises the paper anyway.
 */

/**
 * Applied to any paper whose `security` is `null`.
 *
 * `maxFocusLosses: 2` is a deliberate tolerance rather than zero. A real
 * student's window loses focus for reasons that are not cheating — an OS
 * notification, a dropped call banner, a screen reader taking focus — and a
 * paper that submits itself on the first blur would generate more complaints
 * than it catches cheats. The third blur is a pattern, not an accident.
 */
export const DEFAULT_EXAM_SECURITY: ExamSecurityPolicy = {
  requireFullscreen: true,
  shuffleQuestions: true,
  shuffleOptions: true,
  blockCopyPaste: true,
  maxFocusLosses: 2,
  maxViolationScore: 8,
  autoSubmitOnViolation: true,
  watermark: true,
};

/**
 * What each event costs against `maxViolationScore`.
 *
 * Leaving fullscreen and opening a second window are weighted above a blur
 * because both are deliberate: neither happens while a student is reading a
 * question. The "restored" events and a dropped connection cost nothing — they
 * are recorded so that a disputed paper can be reconstructed, not punished.
 */
export const VIOLATION_WEIGHTS: Record<ProctorEventType, number> = {
  fullscreenExit: 3,
  fullscreenRestored: 0,
  focusLoss: 2,
  focusRestored: 0,
  blockedCopy: 1,
  blockedPaste: 1,
  blockedShortcut: 1,
  blockedContextMenu: 1,
  secondWindow: 4,
  sessionTakeover: 2,
  networkLoss: 0,
  autoSubmit: 0,
};

/** Heartbeat interval. Also the resolution at which the server timer resyncs. */
export const HEARTBEAT_SECONDS = 15;

/**
 * How long an attempt may go unheard from before the sweeper finalises it.
 *
 * Four missed heartbeats. Shorter would submit a paper over a lift ride through
 * a tunnel; much longer and a student who closed the laptop at the halfway mark
 * keeps an open attempt that blocks their own retry.
 */
export const STALE_ATTEMPT_SECONDS = HEARTBEAT_SECONDS * 4;

/**
 * Grace granted on the deadline before a write is refused.
 *
 * The client submits its last answer as the timer hits zero; without a few
 * seconds of slack, normal network latency loses that answer. The grace is
 * applied to writes only — the countdown the student sees is the real one.
 */
export const EXPIRY_GRACE_SECONDS = 10;

/** Cap on logged events per attempt, so a scripted event flood cannot bill us. */
export const MAX_PROCTOR_EVENTS_PER_ATTEMPT = 300;

export function resolveExamSecurity(test: Pick<Test, "security">): ExamSecurityPolicy {
  return { ...DEFAULT_EXAM_SECURITY, ...(test.security ?? {}) };
}

/** Student-facing wording for each rule, shown on the instructions screen. */
export function describeExamRules(policy: ExamSecurityPolicy): string[] {
  const rules: string[] = [
    "The timer runs on our server. Closing the window, losing your connection or running out of battery does not pause it.",
    "Your paper is submitted and scored automatically when the time is over.",
  ];

  if (policy.requireFullscreen) {
    rules.push(
      "The paper opens in fullscreen. Leaving fullscreen is recorded, and you will be asked to return to it before you can continue.",
    );
  }

  rules.push(
    policy.maxFocusLosses > 0
      ? `Switching to another tab, window or app is recorded. After ${policy.maxFocusLosses} such switches${
          policy.autoSubmitOnViolation ? ", your paper is submitted as it stands" : ", your invigilator is notified"
        }.`
      : "Switching to another tab, window or app is not allowed at any point.",
  );

  if (policy.blockCopyPaste) {
    rules.push(
      "Copying, pasting, right-clicking, printing and the developer shortcuts are disabled for the duration of the paper.",
    );
  }

  if (policy.shuffleQuestions || policy.shuffleOptions) {
    rules.push(
      "Question and option order is different for every student, so a question number or an option letter from someone else will not match your paper.",
    );
  }

  rules.push(
    "Only one window may have this paper open. Starting it elsewhere ends this sitting.",
  );

  return rules;
}
