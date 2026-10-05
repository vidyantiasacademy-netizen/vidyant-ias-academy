"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import type { ExamSecurityPolicy, ProctorEventType } from "@/types/db";

/**
 * Browser-side invigilation for a live paper.
 *
 * What this hook is: the sensor. It notices the things a browser can notice —
 * the window losing focus, fullscreen being left, a copy or a right-click, a
 * second tab on the same paper — refuses what it can refuse, and reports each
 * one to the server, which is where the counting and the consequence live.
 *
 * What it is not: a guarantee. Everything here runs in code the student
 * controls; a determined one can disable it. That is designed around rather
 * than argued with — the answer key is never sent to the browser, the clock is
 * the server's, and a window that stops reporting also stops sending the
 * heartbeat the sitting needs to stay open. So tampering is visible, and the
 * worst it buys is a paper that submits itself.
 *
 * Deliberately *not* included: devtools detection by window-size or timing
 * heuristics. Both fire on a docked inspector that was never opened, on a
 * zoomed page and on a slow phone, and a false accusation on an exam is far more
 * expensive than a missed one. Reading the DOM gains a student nothing anyway —
 * the key is not in it.
 */

export type ProctorReport = (type: ProctorEventType, detail?: string) => void;

interface UseProctorOptions {
  policy: ExamSecurityPolicy;
  /** Off before the paper starts and after it is submitted. */
  enabled: boolean;
  /** Identifies this sitting to the tab-collision channel. */
  attemptId: string;
  report: ProctorReport;
  /** Another window claimed this paper. The runner locks itself. */
  onSecondWindow: () => void;
}

/** Shortcuts refused during a paper, with the label written to the log. */
const BLOCKED_KEYS: { label: string; match: (event: KeyboardEvent) => boolean }[] = [
  { label: "copy", match: (e) => mod(e) && key(e, "c") },
  { label: "cut", match: (e) => mod(e) && key(e, "x") },
  { label: "paste", match: (e) => mod(e) && key(e, "v") },
  { label: "print", match: (e) => mod(e) && key(e, "p") },
  { label: "save", match: (e) => mod(e) && key(e, "s") },
  { label: "find", match: (e) => mod(e) && key(e, "f") },
  { label: "view-source", match: (e) => mod(e) && key(e, "u") },
  { label: "devtools", match: (e) => e.key === "F12" },
  { label: "devtools", match: (e) => mod(e) && e.shiftKey && /^[ijc]$/i.test(e.key) },
  { label: "print-screen", match: (e) => e.key === "PrintScreen" },
];

function mod(event: KeyboardEvent): boolean {
  return event.ctrlKey || event.metaKey;
}

function key(event: KeyboardEvent, letter: string): boolean {
  return event.key.toLowerCase() === letter;
}

/**
 * Fullscreen state, read from the browser rather than mirrored into React state.
 *
 * `useSyncExternalStore` is the right shape for this: the DOM owns the fact, the
 * component only observes it. Mirroring it into state with an effect would also
 * put a render between leaving fullscreen and the paper being covered, which is
 * exactly the window a student would use.
 */
function subscribeToFullscreen(onChange: () => void): () => void {
  document.addEventListener("fullscreenchange", onChange);
  return () => document.removeEventListener("fullscreenchange", onChange);
}

function isFullscreenNow(): boolean {
  return Boolean(document.fullscreenElement);
}

/** Nothing to subscribe to: whether the API exists does not change. */
function subscribeToNothing(): () => void {
  return () => {};
}

function fullscreenApiExists(): boolean {
  return typeof document.documentElement.requestFullscreen === "function";
}

export function useProctor({
  policy,
  enabled,
  attemptId,
  report,
  onSecondWindow,
}: UseProctorOptions) {
  const isFullscreen = useSyncExternalStore(
    subscribeToFullscreen,
    isFullscreenNow,
    // Server render: assume not fullscreen, so the first client paint is the
    // honest one rather than a flash of an unguarded paper.
    () => false,
  );

  // iOS Safari has no `requestFullscreen` on an element, and some browsers refuse
  // the request outright. Enforcing fullscreen there would lock every phone
  // student out of the paper, so the requirement becomes advisory on a browser
  // that cannot honour it.
  const apiExists = useSyncExternalStore(
    subscribeToNothing,
    fullscreenApiExists,
    () => true,
  );
  const [denied, setDenied] = useState(false);
  const fullscreenSupported = apiExists && !denied;

  const reportRef = useRef(report);

  useEffect(() => {
    reportRef.current = report;
  }, [report]);

  const lastReportAt = useRef<Record<string, number>>({});

  /**
   * One report per kind per window. Without it, holding Ctrl+C sends a request
   * per keystroke — and the student's own connection is the one that suffers
   * first, mid-paper.
   */
  const throttledReport = useCallback((type: ProctorEventType, detail?: string) => {
    const now = Date.now();
    const previous = lastReportAt.current[type] ?? 0;
    const window = type === "focusLoss" || type === "fullscreenExit" ? 1500 : 3000;

    if (now - previous < window) return;

    lastReportAt.current[type] = now;
    reportRef.current(type, detail);
  }, []);

  const enterFullscreen = useCallback(async () => {
    if (!fullscreenApiExists()) {
      setDenied(true);
      return;
    }

    try {
      await document.documentElement.requestFullscreen({ navigationUI: "hide" });
    } catch {
      // A refused request is a browser policy, not a student's choice: it is
      // recorded once and the paper continues.
      setDenied(true);
      throttledReport("fullscreenExit", "unsupported");
    }
  }, [throttledReport]);

  // ── Fullscreen ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!enabled || !policy.requireFullscreen) return;

    const onChange = () => {
      throttledReport(
        isFullscreenNow() ? "fullscreenRestored" : "fullscreenExit",
      );
    };

    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, [enabled, policy.requireFullscreen, throttledReport]);

  // ── Focus ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!enabled) return;

    // `blur` and `visibilitychange` both fire for one tab switch. The throttle
    // collapses them, so a single switch costs a single violation.
    const onHidden = () => {
      if (document.visibilityState === "hidden") throttledReport("focusLoss", "hidden");
    };

    const onBlur = () => throttledReport("focusLoss", "blur");

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        throttledReport("focusRestored");
      }
    };

    document.addEventListener("visibilitychange", onHidden);
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("blur", onBlur);

    return () => {
      document.removeEventListener("visibilitychange", onHidden);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("blur", onBlur);
    };
  }, [enabled, throttledReport]);

  // ── Copy, paste, right-click, shortcuts ────────────────────────────────────
  useEffect(() => {
    if (!enabled || !policy.blockCopyPaste) return;

    const refuse = (type: ProctorEventType, detail?: string) => (event: Event) => {
      event.preventDefault();
      throttledReport(type, detail);
    };

    const onCopy = refuse("blockedCopy");
    const onCut = refuse("blockedCopy", "cut");
    const onPaste = refuse("blockedPaste");
    const onContextMenu = refuse("blockedContextMenu");
    const onSelectStart = (event: Event) => event.preventDefault();

    const onKeyDown = (event: KeyboardEvent) => {
      const blocked = BLOCKED_KEYS.find((candidate) => candidate.match(event));
      if (!blocked) return;

      event.preventDefault();
      throttledReport("blockedShortcut", blocked.label);
    };

    document.addEventListener("copy", onCopy);
    document.addEventListener("cut", onCut);
    document.addEventListener("paste", onPaste);
    document.addEventListener("contextmenu", onContextMenu);
    document.addEventListener("selectstart", onSelectStart);
    document.addEventListener("dragstart", onSelectStart);
    document.addEventListener("keydown", onKeyDown, { capture: true });

    return () => {
      document.removeEventListener("copy", onCopy);
      document.removeEventListener("cut", onCut);
      document.removeEventListener("paste", onPaste);
      document.removeEventListener("contextmenu", onContextMenu);
      document.removeEventListener("selectstart", onSelectStart);
      document.removeEventListener("dragstart", onSelectStart);
      document.removeEventListener("keydown", onKeyDown, { capture: true });
    };
  }, [enabled, policy.blockCopyPaste, throttledReport]);

  // ── A second tab on the same paper ─────────────────────────────────────────
  //
  // The server's session token is what actually stops two windows writing; this
  // only makes the detection instant instead of waiting for a heartbeat, and
  // tells the *older* window to lock itself.
  useEffect(() => {
    if (!enabled || typeof BroadcastChannel === "undefined") return;

    const channel = new BroadcastChannel(`exam:${attemptId}`);
    const self = crypto.randomUUID();

    channel.onmessage = (event: MessageEvent<{ kind: string; from: string }>) => {
      if (event.data?.from === self) return;

      if (event.data?.kind === "claim") {
        reportRef.current("secondWindow", "same-browser");
        onSecondWindow();
      }
    };

    channel.postMessage({ kind: "claim", from: self });

    return () => channel.close();
  }, [attemptId, enabled, onSecondWindow]);

  // ── Leaving the page ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!enabled) return;

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      // The browser shows its own wording; `preventDefault` is what triggers the
      // prompt. It cannot stop a close, only make an accidental one deliberate.
      event.preventDefault();
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [enabled]);

  return { isFullscreen, fullscreenSupported, enterFullscreen };
}
