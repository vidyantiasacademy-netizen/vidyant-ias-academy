import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge does not know our custom font-size scale, so it would treat
 * `text-body` / `text-small` as *colour* utilities and drop `text-white`
 * alongside them. Registering the scale keeps size and colour independent.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "hero",
            "hero-lg",
            "h1",
            "h1-lg",
            "h2",
            "h2-lg",
            "h3",
            "h3-lg",
            "h4",
            "body",
            "body-lg",
            "small",
            "eyebrow",
          ],
        },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
