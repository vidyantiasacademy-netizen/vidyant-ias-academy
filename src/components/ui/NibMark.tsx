import { NIB_BODY, NIB_HOLE, NIB_SLIT, NIB_VIEWBOX } from "@/lib/brand/nib";

/**
 * Kalam — the VidyantIAS brand mark.
 *
 * The body is drawn in `currentColor`, so the mark inherits whatever surface it
 * sits on (indigo on white, white on indigo, black on a photocopy).
 *
 * The slit is a cut-out, not a white shape — `fillRule="evenodd"` punches it out
 * of the body so the background shows through, which is why the mark holds up
 * reversed and at 16px without a second artwork file.
 *
 * The breather hole is the one saffron element in the whole identity: it stands
 * for the student. In `mono` it is punched out with the slit instead, for
 * one-colour printing, stamps and photocopied notes.
 */

interface NibMarkProps {
  /** Punches the breather hole out instead of filling it with kesar. */
  mono?: boolean;
  className?: string;
  /** Mark-only usage outside a labelled control — otherwise stays decorative. */
  title?: string;
}

export function NibMark({ mono = false, className, title }: NibMarkProps) {
  return (
    <svg
      viewBox={`0 0 ${NIB_VIEWBOX.width} ${NIB_VIEWBOX.height}`}
      fill="none"
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <path
        d={
          mono
            ? `${NIB_BODY} ${NIB_SLIT} ${NIB_HOLE}`
            : `${NIB_BODY} ${NIB_SLIT}`
        }
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
      />
      {!mono ? <path d={NIB_HOLE} fill="var(--color-kesar)" /> : null}
    </svg>
  );
}
