import { cn } from "@/lib/utils/cn";

/*
 * Bauhaus geometry — the selective Bauhaus element of the Swiss system.
 *
 * Three forms (circle, square, triangle) in the three primaries the palette
 * already holds: indigo (blue), kesar (yellow), chilli (red). One composition
 * per hero or band, flat fills, hard edges, no strokes that wobble. Always
 * aria-hidden and never behind copy: compositions sit in a column of their
 * own from `lg`, and shrink to a corner mark below that.
 */

type Surface = "light" | "dark";

/** Fill for the "blue" slot: indigo on light surfaces, white on indigo. */
const blue = (surface: Surface) =>
  surface === "dark" ? "var(--color-white, #fff)" : "var(--color-indigo)";

interface GeoCompositionProps {
  /** `dark` when the composition sits on an indigo band. */
  surface?: Surface;
  className?: string;
}

/**
 * The full composition: a quarter circle, a square, a triangle and a bar,
 * locked to a 4×4 module grid so every edge lines up. Size it with the
 * className (it fills its box, aspect 1:1).
 */
export function GeoComposition({ surface = "light", className }: GeoCompositionProps) {
  return (
    <svg
      aria-hidden
      focusable="false"
      viewBox="0 0 400 400"
      className={cn("pointer-events-none block", className)}
    >
      {/* Square — kesar, top-left module pair. */}
      <rect x="0" y="0" width="200" height="200" fill="var(--color-kesar)" />
      {/* Quarter circle — blue, swinging from the centre point. */}
      <path d="M200 0A200 200 0 0 1 400 200H200Z" fill={blue(surface)} />
      {/* Full circle — red, bottom-left. */}
      <circle cx="100" cy="300" r="100" fill="var(--color-chilli)" />
      {/* Triangle — blue outline weight, bottom-right. */}
      <path d="M200 400L400 200V400Z" fill={surface === "dark" ? "var(--color-kesar)" : "var(--color-ink)"} />
      {/* Hairline construction lines: the module grid made visible. */}
      <g
        stroke={surface === "dark" ? "rgb(255 255 255 / 0.25)" : "var(--color-line-strong)"}
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
      >
        <path d="M0 200H400M200 0V400" />
      </g>
    </svg>
  );
}

interface GeoMarkProps {
  shape: "circle" | "square" | "triangle";
  tone?: "indigo" | "kesar" | "chilli" | "ink" | "white";
  className?: string;
}

const markTones = {
  indigo: "text-indigo",
  kesar: "text-kesar",
  chilli: "text-chilli",
  ink: "text-ink",
  white: "text-white",
} as const;

/** A single Bauhaus form — section markers, list bullets, small accents. */
export function GeoMark({ shape, tone = "kesar", className }: GeoMarkProps) {
  return (
    <svg
      aria-hidden
      focusable="false"
      viewBox="0 0 10 10"
      className={cn("inline-block size-3 shrink-0", markTones[tone], className)}
    >
      {shape === "circle" ? <circle cx="5" cy="5" r="5" fill="currentColor" /> : null}
      {shape === "square" ? <rect width="10" height="10" fill="currentColor" /> : null}
      {shape === "triangle" ? <path d="M0 10L5 0L10 10Z" fill="currentColor" /> : null}
    </svg>
  );
}

/** The three forms in a row — the system's signature, used once per band. */
export function GeoTriad({ className, surface = "light" }: GeoCompositionProps) {
  return (
    <span aria-hidden className={cn("inline-flex items-center gap-1.5", className)}>
      <GeoMark shape="circle" tone="chilli" />
      <GeoMark shape="square" tone="kesar" />
      <GeoMark shape="triangle" tone={surface === "dark" ? "white" : "indigo"} />
    </span>
  );
}

type Corner = "top-right" | "bottom-left" | "top-left" | "bottom-right";

const cornerPositions: Record<Corner, string> = {
  "top-right": "top-0 right-0",
  "bottom-left": "bottom-0 left-0 rotate-180",
  "top-left": "top-0 left-0 -scale-x-100",
  "bottom-right": "bottom-0 right-0 -scale-y-100",
};

interface GeoCornersProps {
  corners?: Corner[];
  size?: "sm" | "md";
  className?: string;
}

const cornerSizes = {
  sm: "size-20 sm:size-24",
  md: "size-28 sm:size-36 lg:size-44",
} as const;

/**
 * Corner mark for an indigo band: a kesar quarter circle with a chilli
 * square nested in its corner. The parent must be `relative overflow-hidden`
 * and its content `relative` so it paints above.
 */
export function GeoCorners({ corners = ["top-right"], size = "md", className }: GeoCornersProps) {
  return (
    <>
      {corners.map((corner) => (
        <svg
          key={corner}
          aria-hidden
          focusable="false"
          viewBox="0 0 100 100"
          className={cn("pointer-events-none absolute", cornerPositions[corner], cornerSizes[size], className)}
        >
          <path d="M100 0V100A100 100 0 0 1 0 0Z" fill="var(--color-kesar)" />
          <rect x="70" y="0" width="30" height="30" fill="var(--color-chilli)" />
        </svg>
      ))}
    </>
  );
}

/**
 * A ruled band of the three primaries — a hard Bauhaus stripe across the top
 * edge of a dense surface (the footer), where shapes would crowd the text.
 */
export function GeoRule({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-x-0 top-0 flex h-2", className)}>
      <span className="w-1/2 bg-kesar" />
      <span className="w-1/4 bg-chilli" />
      <span className="w-1/4 bg-white" />
    </div>
  );
}
