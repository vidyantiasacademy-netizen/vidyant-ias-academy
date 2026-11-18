import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

export interface FieldProps {
  id: string;
  label: string;
  /** Every field states required or optional explicitly. */
  required?: boolean;
  hint?: string;
  error?: string;
  className?: string;
  /** `onDark`: white label and kesar accents, for a field on a navy panel. */
  tone?: "default" | "onDark";
  children: ReactNode;
}

export function Field({
  id,
  label,
  required = false,
  hint,
  error,
  className,
  tone = "default",
  children,
}: FieldProps) {
  const dark = tone === "onDark";
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className={cn("text-small font-bold", dark ? "text-white" : "text-indigo")}>
        {label}{" "}
        {required ? (
          <span className={dark ? "text-kesar" : "text-kesar-600"} aria-hidden>
            *
          </span>
        ) : (
          <span className={cn("font-normal", dark ? "text-white/75" : "text-ink-muted")}>(optional)</span>
        )}
        {required ? <span className="sr-only">(required)</span> : null}
      </label>
      {hint ? (
        <p id={`${id}-hint`} className={cn("text-small", dark ? "text-white/80" : "text-ink-secondary")}>
          {hint}
        </p>
      ) : null}
      {children}
      {error ? (
        <p
          id={`${id}-error`}
          role="alert"
          className={cn("flex items-start gap-1.5 text-small font-medium", dark ? "text-kesar" : "text-danger")}
        >
          <span aria-hidden className={cn("mt-[0.45em] size-1.5 shrink-0", dark ? "bg-kesar" : "bg-danger")} />
          {error}
        </p>
      ) : null}
    </div>
  );
}

export const controlStyles = [
  "w-full rounded-md border-2 bg-white px-3.5 py-2.5 text-body text-ink",
  "placeholder:text-ink-muted",
  "border-line-strong transition-colors duration-150",
  "hover:border-ink-muted focus:border-indigo focus:outline-2 focus:outline-offset-2 focus:outline-[var(--focus-ring)]",
  "disabled:cursor-not-allowed disabled:bg-paper disabled:text-ink-muted",
  "aria-invalid:border-danger aria-invalid:bg-danger-50/40 aria-invalid:outline-danger",
].join(" ");
