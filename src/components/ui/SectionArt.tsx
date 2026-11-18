import { useId } from "react";

import { cn } from "@/lib/utils/cn";

/**
 * Abstract background art for homepage bands. Server-rendered inline SVG, no
 * client JavaScript, drawn only from palette tokens.
 *
 * Vocabulary (echoes the hero: the hills in the photo, the kesar swoosh under
 * "Right Direction."):
 *   - topographic contours — wobbly concentric rings, a map of the climb;
 *   - a kesar ribbon — one pen-stroke curve that draws itself in once
 *     (`kesar-draw`, flattened under prefers-reduced-motion);
 *   - a dot grid and a coral ring as small counterweights;
 *   - a soft kesar glow so the navy is not one flat slab.
 *
 * Contours and dots sit at 6–12% opacity, so text over them keeps its
 * contrast; the solid ribbon and ring stay at the section's edges, away from
 * copy. Ribbon and ring are hidden below `md` (phones get contours only).
 */

type Variant =
  | "programs"
  | "noticeboard"
  | "faq"
  | "paper-left"
  | "paper-right"
  | "soft-left"
  | "soft-right";

export function SectionArt({ variant, className }: { variant: Variant; className?: string }) {
  const dark = variant === "programs" || variant === "noticeboard" || variant === "faq";
  // Line colour for contours/dots: white on navy, navy on cream.
  const line = dark ? "text-white" : "text-indigo";

  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 -z-10", className)}>
      {variant === "programs" ? (
        <>
          <Glow className="-top-40 -right-40 size-[44rem]" />
          <Contours className={cn(line, "-top-56 -right-64 size-[52rem] opacity-[0.09]")} seed={1} />
          <Dots className={cn(line, "top-5 right-[22%] hidden h-14 w-44 opacity-20 lg:block")} />
          <Ribbon
            className="-right-24 -bottom-4 hidden h-36 w-[40rem] md:block"
            d="M8 190 C 160 200, 260 120, 380 150 S 540 60, 600 20"
          />
          <Ring className="right-[40%] bottom-16 hidden size-14 lg:block" />
        </>
      ) : null}

      {variant === "noticeboard" ? (
        <>
          <Glow className="-bottom-48 -left-48 size-[40rem]" />
          <Contours className={cn(line, "-bottom-72 -left-72 size-[56rem] opacity-[0.08]")} seed={2} />
          <Dots className={cn(line, "top-5 left-[34%] hidden h-14 w-44 opacity-20 lg:block")} />
          <Ribbon
            className="-top-6 -right-20 hidden h-28 w-[34rem] md:block"
            d="M8 30 C 120 110, 240 10, 360 80 S 540 150, 600 120"
          />
          <Ring className="top-6 left-[8%] hidden size-10 lg:block" />
        </>
      ) : null}

      {variant === "faq" ? (
        <>
          <Glow className="-right-40 -bottom-40 size-[42rem]" />
          <Contours className={cn(line, "-right-72 -bottom-80 size-[58rem] opacity-[0.08]")} seed={3} />
          <Contours className={cn(line, "-top-40 -left-48 size-[30rem] opacity-[0.07]")} seed={4} rings={6} />
          <Dots className={cn(line, "top-5 right-[12%] hidden h-14 w-44 opacity-20 lg:block")} />
          <Ribbon
            className="-bottom-6 -left-16 hidden h-28 w-[34rem] lg:block"
            d="M8 170 C 150 190, 250 110, 380 140 S 540 90, 600 60"
          />
        </>
      ) : null}

      {variant === "paper-left" ? (
        <>
          <Contours className={cn(line, "-top-64 -left-72 size-[48rem] opacity-[0.06]")} seed={5} />
          <Dots className={cn(line, "right-[5%] bottom-12 hidden h-24 w-40 opacity-[0.12] md:block")} />
          <Ring className="top-6 right-[30%] hidden size-10 lg:block" tone="coral" />
        </>
      ) : null}

      {/* Light bands: one large, soft peach pool, nothing else. */}
      {variant === "soft-left" ? (
        <Blob className="-bottom-56 -left-56 size-[38rem]" />
      ) : null}

      {variant === "soft-right" ? (
        <Blob className="-top-40 -right-56 size-[44rem]" />
      ) : null}

      {variant === "paper-right" ? (
        <>
          <Contours className={cn(line, "-right-72 -bottom-64 size-[48rem] opacity-[0.06]")} seed={6} />
          <Dots className={cn(line, "top-5 left-[30%] hidden h-14 w-40 opacity-[0.12] lg:block")} />
          <Ring className="bottom-5 left-[38%] hidden size-10 lg:block" tone="coral" />
        </>
      ) : null}
    </div>
  );
}

/* ---- pieces ------------------------------------------------------------ */

/** Soft kesar light pooled in one corner. */
function Glow({ className }: { className: string }) {
  return (
    <div
      className={cn(
        "absolute rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--color-kesar)_22%,transparent),transparent)]",
        className,
      )}
    />
  );
}

/** A pale, solid-edged peach disc fading out at its rim. */
function Blob({ className }: { className: string }) {
  return (
    <div
      className={cn(
        "absolute rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--color-kesar-100)_90%,transparent)_55%,transparent)]",
        className,
      )}
    />
  );
}

/** Topographic contour rings: concentric, gently irregular closed curves. */
function Contours({ className, seed, rings = 11 }: { className: string; seed: number; rings?: number }) {
  return (
    <svg viewBox="-100 -100 200 200" className={cn("absolute", className)} fill="none">
      {Array.from({ length: rings }, (_, i) => (
        <path
          key={i}
          d={contourPath(14 + i * (84 / rings), seed + i * 0.35)}
          stroke="currentColor"
          // Every fourth line is an "index contour", drawn heavier.
          strokeWidth={i % 4 === 3 ? 2 : 1}
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  );
}

/** A patch of dots, 16px apart. */
function Dots({ className }: { className: string }) {
  const id = `dots${useId().replace(/:/g, "")}`;
  return (
    <svg className={cn("absolute", className)}>
      <defs>
        <pattern id={id} width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.6" fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

/** The kesar pen-stroke: a thick curve with a thin echo, drawn in once. */
function Ribbon({ className, d }: { className: string; d: string }) {
  return (
    <svg viewBox="0 0 608 220" preserveAspectRatio="none" className={cn("absolute", className)} fill="none">
      <path
        d={d}
        pathLength={1}
        className="kesar-draw stroke-kesar"
        strokeWidth={10}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d={d}
        transform="translate(0 22)"
        pathLength={1}
        className="kesar-draw kesar-draw-delay stroke-chilli opacity-60"
        strokeWidth={2}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/** A small open ring — kesar on navy, coral on cream. */
function Ring({ className, tone = "kesar" }: { className: string; tone?: "kesar" | "coral" }) {
  return (
    <svg viewBox="0 0 40 40" className={cn("absolute", className)} fill="none">
      <circle cx="20" cy="20" r="16" strokeWidth="3" className={tone === "coral" ? "stroke-chilli" : "stroke-kesar"} />
      <circle cx="20" cy="20" r="5" className={tone === "coral" ? "fill-chilli" : "fill-kesar"} />
    </svg>
  );
}

/** Closed wobbly ring of radius `r`; deterministic, so SSR and hydration agree. */
function contourPath(r: number, seed: number) {
  const steps = 72;
  const points: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const k =
      1 +
      0.07 * Math.sin(3 * t + seed) +
      0.045 * Math.sin(5 * t + seed * 1.7) +
      0.025 * Math.sin(8 * t + seed * 2.3);
    const x = (Math.cos(t) * r * k).toFixed(2);
    const y = (Math.sin(t) * r * k * 0.86).toFixed(2);
    points.push(`${i === 0 ? "M" : "L"}${x} ${y}`);
  }
  return `${points.join(" ")}Z`;
}
