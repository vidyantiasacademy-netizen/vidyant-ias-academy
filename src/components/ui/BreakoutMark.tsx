import { BREAKOUT_BREAK, BREAKOUT_DISC, BREAKOUT_VIEWBOX } from "@/lib/brand/breakout";

/**
 * Breakout — the VidyantIAS brand mark.
 *
 * The disc is drawn in `currentColor`, so the mark inherits whatever surface
 * it sits on (indigo on white, white on indigo, black on a photocopy); the V
 * is a hole, so the surface shows through it.
 *
 * The arm breaking out of the disc is the one saffron element in the whole
 * identity: it stands for the student. In `mono` it takes `currentColor` with
 * the rest, for one-colour printing, stamps and photocopied notes.
 */

interface BreakoutMarkProps {
  /** Draws the break in `currentColor` instead of kesar. */
  mono?: boolean;
  className?: string;
  /** Mark-only usage outside a labelled control — otherwise stays decorative. */
  title?: string;
}

const { x, y, width, height } = BREAKOUT_VIEWBOX;

export function BreakoutMark({ mono = false, className, title }: BreakoutMarkProps) {
  return (
    <svg
      viewBox={`${x} ${y} ${width} ${height}`}
      fill="none"
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <path d={BREAKOUT_DISC} fill="currentColor" />
      <path d={BREAKOUT_BREAK} fill={mono ? "currentColor" : "var(--color-logo-saffron)"} />
    </svg>
  );
}
