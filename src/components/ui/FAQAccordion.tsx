import { Minus, Plus } from "lucide-react";

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
    <div className={cn("divide-y divide-line border-t-2 border-b border-t-indigo border-b-line", className)}>
      {faqs.map((faq) => (
        <details key={faq.id} className="group py-1">
          <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-5 text-left [&::-webkit-details-marker]:hidden">
            <h3 className="text-body font-bold text-indigo sm:text-h4">
              {faq.question}
            </h3>
            <span
              aria-hidden
              className="flex size-10 shrink-0 items-center justify-center border-2 border-indigo text-indigo transition-colors duration-150 group-open:bg-indigo group-open:text-white"
            >
              <Plus className="size-4 group-open:hidden" />
              <Minus className="hidden size-4 group-open:block" />
            </span>
          </summary>
          <p className="max-w-3xl pb-6 text-body text-ink-secondary">{faq.answer}</p>
        </details>
      ))}
    </div>
  );
}
