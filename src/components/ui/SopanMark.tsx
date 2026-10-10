import {
  SOPAN_INTERVIEW,
  SOPAN_MAINS,
  SOPAN_PRELIMS,
  SOPAN_RADIUS,
  SOPAN_TRANSFORM,
  SOPAN_VIEWBOX,
} from "@/lib/brand/sopan";

/**
 * Sopan — the VidyantIAS brand mark.
 *
 * Prelims and Mains are drawn in `currentColor`, so the mark inherits whatever
 * surface it sits on (indigo on white, white on indigo, black on a photocopy).
 *
 * The top step — Interview, selected — is the one saffron element in the whole
 * identity: it stands for the student. In `mono` it takes `currentColor` with
 * the rest, for one-colour printing, stamps and photocopied notes.
 */

interface SopanMarkProps {
  /** Draws the top step in `currentColor` instead of kesar. */
  mono?: boolean;
  className?: string;
  /** Mark-only usage outside a labelled control — otherwise stays decorative. */
  title?: string;
}

export function SopanMark({ mono = false, className, title }: SopanMarkProps) {
  return (
    <svg
      viewBox={`0 0 ${SOPAN_VIEWBOX.width} ${SOPAN_VIEWBOX.height}`}
      fill="none"
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <g transform={SOPAN_TRANSFORM}>
        <g fill="currentColor">
          {[...SOPAN_PRELIMS, SOPAN_MAINS].map((step) => (
            <rect key={`${step.x}-${step.y}`} {...step} rx={SOPAN_RADIUS} />
          ))}
        </g>
        <rect
          {...SOPAN_INTERVIEW}
          rx={SOPAN_RADIUS}
          fill={mono ? "currentColor" : "var(--color-kesar)"}
        />
      </g>
    </svg>
  );
}
