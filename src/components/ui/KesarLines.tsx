import { cn } from "@/lib/utils/cn";

type Corner = "top-right" | "bottom-left" | "top-left" | "bottom-right";

interface KesarLinesProps {
  /** Corners to decorate. Two opposite corners frame a band without crowding it. */
  corners?: Corner[];
  /** `sm` for small surfaces such as card headers. */
  size?: "sm" | "md";
  className?: string;
}

const positions: Record<Corner, string> = {
  "top-right": "top-0 right-0",
  "bottom-left": "bottom-0 left-0 rotate-180",
  "top-left": "top-0 left-0 -scale-x-100",
  "bottom-right": "bottom-0 right-0 -scale-y-100",
};

const sizes = {
  sm: "w-40 sm:w-48",
  md: "w-60 sm:w-80 lg:w-[26rem]",
} as const;

/**
 * Kesar line-art for indigo surfaces — the stroke of the pen, ruled lines and
 * a few ink dots, drawn in the corner of a band. Thin and translucent on
 * purpose: it is texture, so the solid kesar call to action stays the one
 * saffron element that reads as "the student".
 *
 * The parent must be `relative overflow-hidden`, and its content `relative`
 * so it paints above the lines.
 */
export function KesarLines({
  corners = ["top-right", "bottom-left"],
  size = "md",
  className,
}: KesarLinesProps) {
  return (
    <>
      {corners.map((corner) => (
        <svg
          key={corner}
          aria-hidden
          focusable="false"
          viewBox="0 0 400 300"
          fill="none"
          className={cn(
            "pointer-events-none absolute text-kesar opacity-70 sm:opacity-100",
            positions[corner],
            sizes[size],
            className,
          )}
        >
          {/* Concentric arcs, centred on the corner. */}
          <g stroke="currentColor" strokeWidth="1.5" opacity="0.28">
            <path d="M400 70A70 70 0 0 1 330 0" />
            <path d="M400 120A120 120 0 0 1 280 0" />
            <path d="M400 170A170 170 0 0 1 230 0" strokeDasharray="2 9" strokeLinecap="round" />
          </g>

          {/* The pen stroke: one confident sweep with a fine shadow line beside it. */}
          <path
            className="kesar-draw"
            pathLength={1}
            d="M60 300C110 230 150 205 205 196C270 186 300 140 318 92C330 60 352 32 400 18"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.75"
          />
          <path
            className="kesar-draw kesar-draw-delay"
            pathLength={1}
            d="M96 300C140 246 178 226 226 218C290 207 322 166 342 118C356 86 372 66 400 56"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
            opacity="0.45"
          />

          {/* Ruled lines, like the margin of an answer sheet. */}
          <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4">
            <path d="M250 262H330" />
            <path d="M276 276H330" />
          </g>

          {/* Ink dots, as if shaken from the nib. */}
          <g fill="currentColor">
            <circle cx="205" cy="196" r="4.5" opacity="0.9" />
            <circle cx="180" cy="160" r="2.5" opacity="0.55" />
            <circle cx="160" cy="176" r="1.75" opacity="0.4" />
          </g>
        </svg>
      ))}
    </>
  );
}

/**
 * A single pen line drawn across the top edge of a dense indigo surface, such
 * as the footer, where corner art would run behind text. It sits inside the
 * surface's top padding, so it never crosses a word.
 */
export function KesarWave({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      focusable="false"
      viewBox="0 0 1200 40"
      preserveAspectRatio="none"
      fill="none"
      className={cn("pointer-events-none absolute inset-x-0 top-3 h-8 w-full text-kesar lg:top-5", className)}
    >
      <path
        className="kesar-draw"
        pathLength={1}
        d="M0 28C150 28 210 10 340 12C470 14 520 30 660 28C800 26 860 8 1000 10C1090 11 1150 20 1200 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        opacity="0.6"
      />
      <path
        d="M0 34C160 34 220 18 350 20C480 22 530 36 670 34C810 32 870 16 1010 18C1100 19 1150 26 1200 25"
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray="2 8"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        opacity="0.35"
      />
    </svg>
  );
}
