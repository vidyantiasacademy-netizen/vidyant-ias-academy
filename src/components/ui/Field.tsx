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
  children: ReactNode;
}

export function Field({
  id,
  label,
  required = false,
  hint,
  error,
  className,
  children,
}: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-small font-bold text-indigo">
        {label}{" "}
        {required ? (
          <span className="text-kesar-600" aria-hidden>
            *
          </span>
        ) : (
          <span className="font-normal text-ink-muted">(optional)</span>
        )}
        {required ? <span className="sr-only">(required)</span> : null}
      </label>
      {hint ? (
        <p id={`${id}-hint`} className="text-small text-ink-secondary">
          {hint}
        </p>
      ) : null}
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-small font-medium text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export const controlStyles = [
  "w-full border-2 bg-white px-3.5 py-2.5 text-body text-ink",
  "placeholder:text-ink-muted",
  "border-line-strong transition-colors duration-150",
  "hover:border-ink-muted focus:border-indigo focus:outline-2 focus:outline-offset-1 focus:outline-[var(--focus-ring)]",
  "disabled:cursor-not-allowed disabled:bg-paper disabled:text-ink-muted",
  "aria-invalid:border-danger aria-invalid:outline-danger",
].join(" ");
