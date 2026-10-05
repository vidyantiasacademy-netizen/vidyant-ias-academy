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
  width?: number;
  height?: number;
}

export const IMAGES: Record<string, ImageRef> = {
  mentorshipSession: {
    src: null, // TODO(institute): mentor and student in a one-to-one review.
    alt: "A vidyantIAS mentor reviewing a student's test performance",
    width: 1000,
    height: 1200,
  },
  classroom: {
    src: null, // TODO(institute): classroom photograph.
    alt: "A vidyantIAS classroom in Pune",
    width: 1200,
    height: 800,
  },
  library: {
    src: null, // TODO(institute): library / reading room photograph.
    alt: "The vidyantIAS reading room",
    width: 1200,
    height: 800,
  },
};

export function getImage(key: keyof typeof IMAGES): ImageRef {
  return IMAGES[key];
}
