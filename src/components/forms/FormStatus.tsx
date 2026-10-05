import { AlertTriangle, CheckCircle2 } from "lucide-react";
import type { ReactNode } from "react";

export function FormError({ children }: { children: ReactNode }) {
  return (
    <p
      role="alert"
      className="flex items-start gap-2.5 rounded-md border border-danger/25 bg-danger-50 px-4 py-3 text-small text-danger"
    >
      <AlertTriangle aria-hidden className="mt-0.5 size-4 shrink-0" />
      {children}
    </p>
  );
}

export function FormSuccess({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div
      role="status"
      className="rounded-lg border border-line bg-white p-7 sm:p-9"
    >
      <span className="flex size-12 items-center justify-center rounded-full bg-success-50 text-success">
        <CheckCircle2 aria-hidden className="size-6" />
      </span>
      <h2 className="mt-5 text-h3 font-semibold">{title}</h2>
      <p className="mt-3 text-body text-ink-secondary">{description}</p>
      {action ? <div className="mt-7">{action}</div> : null}
    </div>
  );
}
