import { HandNote, Sparkle } from "@/components/illustrations/Doodles";
import { cn } from "@/lib/utils/cn";

const LINE = {
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

const BUILDING = "var(--color-indigo-900)";
const FIGURE = "var(--color-indigo-950)";
const KESAR = "var(--color-kesar)";

/**
 * Closing-band scene for indigo surfaces: an aspirant, seen from behind,
 * looking at Delhi — India Gate and the Rashtrapati Bhavan dome — under a
 * rising kesar sun. White line work on indigo; the sun is a wash, so the
 * solid kesar button beside it stays the strongest saffron on the band.
 */
export function SkylineIllustration({ className }: { className?: string }) {
  const columns = Array.from({ length: 11 }, (_, i) => 252 + i * 9.6);

  return (
    <svg
      aria-hidden
      focusable="false"
      viewBox="0 0 400 300"
      className={cn("h-auto w-full text-white", className)}
    >
      {/* Rising sun */}
      <circle cx="300" cy="150" r="62" fill={KESAR} opacity="0.22" />
      <circle cx="300" cy="150" r="62" fill="none" stroke={KESAR} strokeWidth="2" opacity="0.8" />
      <circle cx="300" cy="150" r="80" fill="none" stroke={KESAR} strokeWidth="1.25" strokeDasharray="2 8" strokeLinecap="round" opacity="0.6" />

      <g opacity="0.7">
        <Sparkle x={52} y={70} />
        <Sparkle x={196} y={96} size={5} />
        <path d="M150 62q5-5 10 0q5-5 10 0M176 48q4-4 8 0q4-4 8 0" {...LINE} strokeWidth="1.5" fill="none" />
      </g>

      {/* Rashtrapati Bhavan */}
      <g {...LINE} strokeOpacity="0.85" fill={BUILDING}>
        <rect x="236" y="200" width="128" height="34" />
        <path d="M230 200h140" />
        {columns.map((x) => (
          <path key={x} d={`M${x} 205v24`} strokeWidth="1.25" fill="none" />
        ))}
        <rect x="276" y="184" width="48" height="16" />
        <path d="M273 184a27 27 0 0 1 54 0Z" />
        <path d="M300 157v-17" fill="none" />
        <path d="M301 140l11 4-11 4Z" fill={KESAR} stroke="none" />
      </g>

      {/* India Gate */}
      <g {...LINE} strokeOpacity="0.85" fill={BUILDING}>
        <path d="M168 234v-50h40v50h-12v-24a8 8 0 0 0-16 0v24Z" />
        <rect x="164" y="176" width="48" height="8" />
        <path d="M176 176v-8h24v8" />
        <path d="M182 168a6 6 0 0 1 12 0" fill="none" />
      </g>

      {/* Trees and the ground line */}
      <g {...LINE} strokeOpacity="0.7" fill={BUILDING}>
        <path d="M222 234v-12M222 222c-10 0-10-16 0-18c10 2 10 18 0 18Z" />
        <path d="M382 234v-14M382 220c-12 0-12-20 0-22c12 2 12 22 0 22Z" />
      </g>
      <path d="M0 234H400" {...LINE} strokeOpacity="0.6" fill="none" />
      <path d="M150 248H260M290 248H360" {...LINE} strokeWidth="1.25" strokeDasharray="2 8" strokeOpacity="0.45" fill="none" />

      {/* The aspirant, from behind */}
      <g {...LINE} strokeOpacity="0.9" fill={FIGURE}>
        <path d="M44 300c2-40 18-60 50-62c32 2 48 22 50 62Z" />
        <rect x="76" y="250" width="36" height="42" rx="9" />
        <path d="M84 250v-8M104 250v-8" fill="none" />
        <circle cx="94" cy="214" r="18" />
        <path d="M80 206q14-14 30 0" fill="none" strokeOpacity="0.5" />
      </g>
      <path d="M84 266h20" {...LINE} stroke={KESAR} strokeWidth="2.5" fill="none" />

      <g opacity="0.92">
        <HandNote x="40" y="128" fontSize="20" transform="rotate(-6 40 128)">
          Disciplined today,
        </HandNote>
        <HandNote x="54" y="154" fontSize="20" transform="rotate(-6 54 154)">
          brighter tomorrow.
        </HandNote>
      </g>
    </svg>
  );
}
