import { Plus } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import type { Faq } from "@/types";

interface FAQAccordionProps {
  faqs: Pick<Faq, "id" | "question" | "answer">[];
  className?: string;
}

/**
 * Native disclosure elements — keyboard accessible with no client JavaScript.
 */
export function FAQAccordion({ faqs, className }: FAQAccordionProps) {
  return (
    <div className={cn("divide-y divide-line border-y border-line", className)}>
      {faqs.map((faq) => (
        <details key={faq.id} className="group py-1">
          <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-5 text-left [&::-webkit-details-marker]:hidden">
            <h3 className="text-body font-semibold text-indigo sm:text-h4">
              {faq.question}
            </h3>
            <span
              aria-hidden
              className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border border-line text-ink-secondary transition-transform duration-200 ease-[var(--ease-brand)] group-open:rotate-45 group-open:border-kesar-600 group-open:text-kesar-600"
            >
              <Plus className="size-4" />
            </span>
          </summary>
          <p className="max-w-3xl pb-6 text-body text-ink-secondary">{faq.answer}</p>
        </details>
      ))}
    </div>
  );
}
