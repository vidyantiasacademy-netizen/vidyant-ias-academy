import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";
import type { Resource } from "@/types";

/**
 * Small desk-still-life illustrations for the homepage resource cards —
 * inline SVG drawn only from palette tokens, so they cost nothing on 3G.
 * The scene is picked from the resource's wording, then its type.
 */

type Scene = "compass" | "books" | "syllabus" | "pyq" | "planner" | "news";

const SCENES: [RegExp, Scene][] = [
  [/syllabus/i, "syllabus"],
  [/pyq|previous year|past paper/i, "pyq"],
  [/plan|timetable|schedule|calendar/i, "planner"],
  [/book|reading list|ncert/i, "books"],
  [/current affairs|news|editorial|monthly/i, "news"],
];

export function sceneFor(resource: Pick<Resource, "title" | "type">): Scene {
  const matched = SCENES.find(([pattern]) => pattern.test(resource.title))?.[1];
  if (matched) return matched;
  if (resource.type === "pyq") return "pyq";
  if (resource.type === "current-affairs") return "news";
  return "compass";
}

const C = {
  navy: "var(--color-indigo)",
  navySoft: "var(--color-indigo-700)",
  kesar: "var(--color-kesar)",
  kesarDeep: "var(--color-kesar-500)",
  wash: "var(--color-kesar-100)",
  paper: "var(--color-paper)",
  paper2: "var(--color-paper-200)",
  line: "var(--color-line-strong)",
  white: "#fff",
  leaf: "#6f9a52",
  leafDark: "#4f7a3a",
};

export function ResourceIllustration({ scene, className }: { scene: Scene; className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 220 170" className={cn("pointer-events-none", className)} fill="none">
      {/* Peach pool of light behind every scene. */}
      <ellipse cx="140" cy="120" rx="105" ry="80" fill={C.wash} opacity="0.9" />
      <ellipse cx="128" cy="160" rx="80" ry="7" fill={C.navy} opacity="0.08" />
      {SCENE_ART[scene]}
    </svg>
  );
}

function Leaves({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M0 0 C -4 -20, 2 -38, 14 -50 C 16 -32, 10 -14, 0 0Z" fill={C.leaf} />
      <path d="M0 0 C 10 -14, 26 -22, 40 -22 C 30 -8, 16 -2, 0 0Z" fill={C.leafDark} />
      <path d="M0 0 C -10 -10, -24 -14, -34 -10 C -24 0, -12 2, 0 0Z" fill={C.leaf} />
      <path d="M0 0 L 12 -46 M0 0 L 36 -20" stroke={C.leafDark} strokeWidth="1" opacity="0.6" />
    </g>
  );
}

function Pen({ x, y, angle }: { x: number; y: number; angle: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle})`}>
      <rect x="-3" y="0" width="7" height="58" rx="3.5" fill={C.navy} />
      <rect x="-3" y="14" width="7" height="4" fill={C.kesar} />
      <path d="M-3 58 L 0.5 70 L 4 58Z" fill={C.kesarDeep} />
    </g>
  );
}

function Book({ x, y, w, h, cover, tilt = 0 }: { x: number; y: number; w: number; h: number; cover: string; tilt?: number }) {
  return (
    <g transform={`rotate(${tilt} ${x + w / 2} ${y + h / 2})`}>
      <rect x={x} y={y} width={w} height={h} rx="3" fill={cover} />
      <rect x={x + 4} y={y + h - 6} width={w - 8} height="4" rx="1" fill={C.white} opacity="0.9" />
      <rect x={x} y={y} width={w} height="3" rx="1.5" fill={C.white} opacity="0.18" />
    </g>
  );
}

const SCENE_ART: Record<Scene, ReactNode> = {
  compass: (
    <g>
      <Book x={70} y={128} w={136} h={26} cover={C.navy} />
      <rect x="74" y="148" width="128" height="4" fill={C.paper} />
      <circle cx="140" cy="94" r="36" fill={C.kesarDeep} />
      <circle cx="140" cy="94" r="30" fill={C.white} />
      <circle cx="140" cy="94" r="30" stroke={C.line} strokeWidth="1.5" />
      <rect x="135" y="52" width="10" height="8" rx="2" fill={C.kesarDeep} />
      <circle cx="140" cy="49" r="5" stroke={C.kesarDeep} strokeWidth="3" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
        <line
          key={a}
          x1="140"
          y1="68"
          x2="140"
          y2={a % 90 === 0 ? 74 : 71}
          stroke={C.navy}
          strokeWidth="1.5"
          transform={`rotate(${a} 140 94)`}
        />
      ))}
      <path d="M140 94 L 152 76 L 143 97Z" fill={C.kesarDeep} />
      <path d="M140 94 L 128 112 L 137 91Z" fill={C.navy} />
      <circle cx="140" cy="94" r="3" fill={C.navy} />
    </g>
  ),
  books: (
    <g>
      <Leaves x={182} y={78} />
      <rect x="168" y="76" width="28" height="30" rx="5" fill={C.paper} stroke={C.line} />
      <Book x={78} y={128} w={110} h={26} cover={C.navySoft} />
      <Book x={86} y={104} w={104} h={24} cover={C.kesar} tilt={-2} />
      <Book x={80} y={80} w={108} h={24} cover={C.navy} tilt={1.5} />
    </g>
  ),
  syllabus: (
    <g>
      <g transform="rotate(-14 140 100)">
        <rect x="96" y="40" width="96" height="120" rx="6" fill={C.paper2} />
        <rect x="92" y="36" width="96" height="120" rx="6" fill={C.white} stroke={C.line} />
        <circle cx="140" cy="64" r="9" fill={C.wash} stroke={C.kesarDeep} strokeWidth="1.5" />
        <rect x="112" y="84" width="56" height="9" rx="2" fill={C.navy} />
        <rect x="118" y="99" width="44" height="6" rx="2" fill={C.navySoft} opacity="0.7" />
        <rect x="108" y="118" width="64" height="3" rx="1.5" fill={C.line} />
        <rect x="108" y="127" width="52" height="3" rx="1.5" fill={C.line} />
      </g>
      <Pen x={196} y={92} angle={28} />
    </g>
  ),
  pyq: (
    <g>
      <g transform="rotate(-10 130 100)">
        <rect x="82" y="34" width="100" height="126" rx="5" fill={C.white} stroke={C.line} />
        <text x="104" y="62" fontSize="17" fontWeight="800" fontStyle="italic" fill={C.navy} fontFamily="Georgia, serif">
          PYQ
        </text>
        {[78, 98, 118, 138].map((y) => (
          <g key={y}>
            <rect x="94" y={y} width="11" height="11" rx="2" stroke={C.navy} strokeWidth="1.6" />
            <path d={`M96 ${y + 5} l3 3 l5 -6`} stroke={C.navy} strokeWidth="1.8" strokeLinecap="round" />
            <rect x="112" y={y + 4} width="56" height="3" rx="1.5" fill={C.line} />
          </g>
        ))}
      </g>
      <Pen x={194} y={74} angle={24} />
    </g>
  ),
  planner: (
    <g>
      <Leaves x={196} y={84} />
      <path d="M86 156 L 104 58 L 192 58 L 204 156Z" fill={C.paper2} />
      <path d="M92 156 L 108 64 L 186 64 L 198 156Z" fill={C.white} stroke={C.line} />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <circle key={i} cx={114 + i * 11} cy="60" r="4.5" stroke={C.kesarDeep} strokeWidth="2.2" />
      ))}
      {[0, 1, 2, 3, 4].map((row) =>
        [0, 1, 2, 3, 4, 5].map((col) => (
          <rect
            key={`${row}-${col}`}
            x={110 + col * 13 - row * 1.6}
            y={82 + row * 14}
            width="8"
            height="7"
            rx="1"
            fill={row === 2 && col === 3 ? C.kesar : C.paper2}
          />
        )),
      )}
    </g>
  ),
  news: (
    <g>
      <g transform="rotate(-8 140 100)">
        <rect x="80" y="46" width="118" height="104" rx="4" fill={C.white} stroke={C.line} />
        <rect x="92" y="58" width="94" height="10" rx="2" fill={C.navy} />
        <rect x="92" y="76" width="42" height="34" rx="2" fill={C.wash} />
        {[76, 84, 92, 100, 108].map((y) => (
          <rect key={y} x="140" y={y} width="46" height="3" rx="1.5" fill={C.line} />
        ))}
        {[118, 126, 134].map((y) => (
          <rect key={y} x="92" y={y} width="94" height="3" rx="1.5" fill={C.line} />
        ))}
      </g>
      <Pen x={200} y={96} angle={30} />
    </g>
  ),
};
