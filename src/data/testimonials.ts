import type { Testimonial } from "@/types";

/**
 * NO TESTIMONIALS ARE PUBLISHED YET.
 *
 * vidyantIAS will not display written or video testimonials until a student has
 * given consent and the quote is verifiable. Nothing here is invented.
 *
 * To publish: add an entry with `isPlaceholder: false`, `status: "published"`.
 * The UI shows an honest empty state while this list has no published entries.
 */
const testimonials: Testimonial[] = [];

export const publishedTestimonials = testimonials.filter(
  (item) => item.status === "published" && !item.isPlaceholder,
);
