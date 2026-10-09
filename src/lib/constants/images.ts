/**
 * Centralised image registry.
 *
 * Until vidyantIAS supplies real photography, components render designed
 * placeholders (see `components/ui/PlaceholderVisual`). Point an entry at a
 * file in /public/images and the component switches to the photo — no
 * component changes needed.
 */

export interface ImageRef {
  /** Path under /public, or null while awaiting real photography. */
  src: string | null;
  alt: string;
  /**
   * Set on stock photographs standing in for the institute's own. The value is
   * the Unsplash source, kept so each sample is easy to find and replace.
   */
  sample?: string;
  width?: number;
  height?: number;
}

export const IMAGES: Record<string, ImageRef> = {
  mentorshipSession: {
    src: "/images/Mentorship.png",
    alt: "vidyantIAS Mentorship Program 2027/2028: personalised mentorship, personalised study strategy, regular progress tracking, and doubt resolution with academic guidance",
    width: 1080,
    height: 1350,
  },
  // Programme-card photographs — SAMPLE stock (Unsplash licence), chosen to
  // echo the client's reference homepage. Cropped to the card's 3:2 panel.
  courseFoundation: {
    src: "/images/courses/foundation.webp",
    alt: "Rashtrapati Bhavan in New Delhi seen across its formal gardens",
    width: 1200,
    height: 800,
    sample: "https://unsplash.com/photos/pqhT3aTJM3Y",
  },
  coursePrelims: {
    src: "/images/courses/prelims.webp",
    alt: "A hand ticking off items on a handwritten checklist",
    width: 1200,
    height: 800,
    sample: "https://unsplash.com/photos/weJ7qyjHYwk",
  },
  courseMains: {
    src: "/images/courses/mains.webp",
    alt: "A student writing in a notebook at a desk by a window",
    width: 1200,
    height: 800,
    sample: "https://unsplash.com/photos/NXiIVnzBwZ8",
  },
  courseOptional: {
    src: "/images/courses/optional.webp",
    alt: "An open book resting on a stack of books",
    width: 1200,
    height: 800,
    sample: "https://unsplash.com/photos/9DaOYUYnOls",
  },
  // SAMPLE stock photography below (Unsplash licence) — replace each `src`
  // with the institute's own photograph and drop its `sample` field. Alt text
  // describes the photo itself, so none of it claims to show vidyantIAS.
  classroom: {
    src: "/images/sample/classroom.webp",
    alt: "Aspirants listening during a classroom lecture",
    width: 1600,
    height: 1201,
    sample: "https://unsplash.com/photos/rwmYLRgkjsE",
  },
  library: {
    src: "/images/sample/reading-room.webp",
    alt: "A student reading at a table in a quiet reading room lined with bookshelves",
    width: 1600,
    height: 1200,
    sample: "https://unsplash.com/photos/YhfxJpa_Ch0",
  },
  lectureHall: {
    src: "/images/sample/lecture-hall.webp",
    alt: "Students seated in a lecture hall facing a projector screen",
    width: 1600,
    height: 900,
    sample: "https://unsplash.com/photos/2uX_7L_10rM",
  },
  selfStudy: {
    src: "/images/sample/self-study.webp",
    alt: "A student reading notes between library shelves",
    width: 1600,
    height: 1067,
    sample: "https://unsplash.com/photos/YkxFTfqg0cA",
  },
  newspaper: {
    src: "/images/sample/newspaper.webp",
    alt: "Pages of an Indian daily newspaper spread out for reading",
    width: 1400,
    height: 1266,
    sample: "https://unsplash.com/photos/ePWaAwUn80k",
  },
};

export function getImage(key: keyof typeof IMAGES): ImageRef {
  return IMAGES[key];
}
