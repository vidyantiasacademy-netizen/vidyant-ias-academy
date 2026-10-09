import { notFound } from "next/navigation";

/**
 * Catch-all for unmatched URLs under `[lang]`.
 *
 * The root layout lives inside `[lang]`, so there is no `app/not-found.tsx` to
 * catch a URL that matches no route. Routing them here and calling
 * `notFound()` renders `[lang]/not-found.tsx` inside the root layout, with the
 * site chrome and in the reader's language.
 */
export default function CatchAll() {
  notFound();
}
