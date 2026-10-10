"use client";

/**
 * Small per-browser memory for conversion prompts: "this visitor already sent
 * a form", "the exit offer was shown on this date".
 *
 * A convenience only. Storage can be blocked, cleared or missing (private
 * windows, strict privacy settings), so every read and write is guarded, and
 * losing it means at worst an offer is shown once more — never an error.
 */

/** Set when any lead form succeeds, so prompts stop asking for what we have. */
export const LEAD_SUBMITTED_KEY = "vidyant:lead-submitted";

export function readFlag(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeFlag(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Storage unavailable — the prompt may show again, which is acceptable.
  }
}
