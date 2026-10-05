"use client";

import { CircleCheck, TriangleAlert, X } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { cn } from "@/lib/utils/cn";

/**
 * Transient confirmations and failures — "Photograph updated", "That file could
 * not be saved".
 *
 * A toast is for feedback on something the user just did and can do nothing
 * further about. Anything they must act on (a field to correct, a payment to
 * retry) belongs in the page next to the control, not here: a message that
 * disappears on a timer is not a place to put instructions.
 *
 * Accessibility:
 *  - each toast carries its own live-region role, `status` for a success and
 *    `alert` for a failure, so a screen reader waits for a pause before
 *    reading the first and interrupts for the second. The viewport itself is
 *    not a live region — announcing twice is worse than not announcing;
 *  - a failure stays on screen roughly twice as long, because a message you
 *    did not expect takes longer to read than one you did;
 *  - the dismiss button is real and focusable, so the message is never
 *    something the keyboard cannot get rid of;
 *  - the entrance animation is a plain class, so the global
 *    `prefers-reduced-motion` override in `globals.css` flattens it.
 *
 * Mount the provider inside a portal layout, the way `AuthProvider` is mounted,
 * rather than the root layout — the marketing pages stay fully static and must
 * not pull a client chunk they never use.
 */

export type ToastTone = "success" | "error";

interface Toast {
  id: number;
  tone: ToastTone;
  message: string;
}

interface ToastApi {
  showToast: (tone: ToastTone, message: string) => void;
}

/** How long each tone stays up. A failure is read more slowly than a success. */
const DISMISS_MS: Record<ToastTone, number> = {
  success: 5000,
  error: 9000,
};

/** Older toasts are dropped past this; a stack taller than the thumb is noise. */
const MAX_VISIBLE = 3;

const ToastContext = createContext<ToastApi | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);
  const timers = useRef(new Map<number, number>());

  const dismiss = useCallback((id: number) => {
    const timer = timers.current.get(id);

    if (timer !== undefined) {
      window.clearTimeout(timer);
      timers.current.delete(id);
    }

    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (tone: ToastTone, message: string) => {
      const id = nextId.current++;

      setToasts((current) => [...current, { id, tone, message }].slice(-MAX_VISIBLE));

      timers.current.set(
        id,
        window.setTimeout(() => dismiss(id), DISMISS_MS[tone]),
      );
    },
    [dismiss],
  );

  // A navigation away mid-timer would otherwise leave the timeout running
  // against an unmounted provider.
  useEffect(() => {
    const pending = timers.current;

    return () => {
      pending.forEach((timer) => window.clearTimeout(timer));
      pending.clear();
    };
  }, []);

  const value = useMemo<ToastApi>(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}

      {/* Bottom of the viewport on a phone, where the thumb already is; out of
          the way at the bottom-right on a desktop. `pointer-events-none` on the
          stack so an empty viewport never swallows a click on the page. */}
      <div className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-90">
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onDismiss={() => dismiss(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastCard({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const isError = toast.tone === "error";

  return (
    <div
      role={isError ? "alert" : "status"}
      className={cn(
        "toast-enter pointer-events-auto flex items-start gap-3 rounded-md border bg-white p-4 shadow-[var(--shadow-panel)]",
        isError ? "border-danger/25" : "border-success/25",
      )}
    >
      {isError ? (
        <TriangleAlert aria-hidden className="mt-0.5 size-5 shrink-0 text-danger" />
      ) : (
        <CircleCheck aria-hidden className="mt-0.5 size-5 shrink-0 text-success" />
      )}

      <p className="min-w-0 flex-1 text-small text-ink">{toast.message}</p>

      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        className="-m-1 shrink-0 rounded-sm p-1 text-ink-secondary transition-colors hover:text-ink"
      >
        <X aria-hidden className="size-4" />
      </button>
    </div>
  );
}

export function useToast(): ToastApi {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used inside <ToastProvider>.");
  }

  return context;
}
