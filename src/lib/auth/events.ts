/**
 * Same-tab signal that the session cookie changed.
 *
 * Kept apart from `client.ts` so the public header can listen for it without
 * pulling the Firebase Auth chunk into every marketing page.
 */
export const AUTH_CHANGED_EVENT = "vid:auth-changed";

export function notifyAuthChanged(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
  }
}
