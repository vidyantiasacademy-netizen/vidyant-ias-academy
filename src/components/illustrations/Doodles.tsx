import type { SVGProps } from "react";

/**
 * Small hand-drawn marks shared by the illustrations: the four-point sparkle
 * and the handwritten note. Both inherit `currentColor` from the parent SVG.
 */
export function Sparkle({ x, y, size = 8 }: { x: number; y: number; size?: number }) {
  const s = size;
  return (
    <path
      d={`M${x} ${y - s}Q${x} ${y} ${x + s} ${y}Q${x} ${y} ${x} ${y + s}Q${x} ${y} ${x - s} ${y}Q${x} ${y} ${x} ${y - s}Z`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  );
}

/** A note in the handwriting face. Decoration only — the parent SVG is aria-hidden. */
export function HandNote({ children, ...props }: SVGProps<SVGTextElement>) {
  return (
    <text fill="currentColor" style={{ fontFamily: "var(--font-hand)" }} {...props}>
      {children}
    </text>
  );
}
