import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

interface PhoneMockupProps {
  children: ReactNode;
  className?: string;
  /** Background behind the status bar — match the app header it sits on. */
  statusBarTone?: "indigo" | "light";
}

/** Brushed-titanium band: light catching the rounded edge from the top left. */
const TITANIUM =
  "linear-gradient(145deg, #e4e2de 0%, #9a9792 22%, #d3d0ca 48%, #7b7873 76%, #c7c4be 100%)";

/**
 * A modern iPhone drawn in CSS: titanium band with side buttons, black
 * bezel, rounded display, Dynamic Island, iOS status bar and home indicator.
 * Drawn rather than a PNG frame so it stays sharp at any density and costs
 * nothing on a 3G connection. Proportions follow a 6.1" Pro handset
 * (71.6 × 146.6 mm).
 *
 * The device is deliberately the one rounded, shadowed object on a square,
 * flat page — it reads as a real phone, not a UI card.
 *
 * `children` is the app screen below the status bar; it should fill the
 * height (`flex-1`) so the home indicator stays pinned to the bottom.
 */
export function PhoneMockup({ children, className, statusBarTone = "indigo" }: PhoneMockupProps) {
  const dark = statusBarTone === "indigo";

  return (
    <div className={cn("relative mx-auto w-full max-w-[18.5rem]", className)}>
      {/* Side buttons sit just outside the band: action + volume on the
          left, side (power) button on the right. */}
      <SideButton side="left" top="17%" height="5.5%" />
      <SideButton side="left" top="25.5%" height="9.5%" />
      <SideButton side="left" top="37%" height="9.5%" />
      <SideButton side="right" top="28%" height="14%" />

      <div
        className="relative aspect-[71.6/146.6] rounded-[3.1rem] p-[3px] shadow-[0_40px_70px_-30px_rgb(13_17_56/0.55),0_18px_30px_-18px_rgb(13_17_56/0.35)]"
        style={{ backgroundImage: TITANIUM }}
      >
        {/* Bezel */}
        <div className="h-full rounded-[2.95rem] bg-black p-[0.55rem]">
          {/* Display */}
          <div className="relative flex h-full flex-col overflow-hidden rounded-[2.45rem] bg-white">
            {/* Status bar: time left of the island, indicators right of it. */}
            <div
              aria-hidden
              className={cn(
                "relative flex h-12 shrink-0 items-center justify-between pr-5 pl-7 pt-1",
                dark ? "bg-indigo text-white" : "bg-white text-ink",
              )}
            >
              <span className="text-[0.9375rem] font-semibold tracking-[-0.01em]">9:41</span>
              <span className="flex items-center gap-1">
                <CellularGlyph />
                <WifiGlyph />
                <BatteryGlyph />
              </span>
            </div>

            {/* Dynamic Island, with the front camera's lens at its right end. */}
            <span
              aria-hidden
              className="absolute top-[0.55rem] left-1/2 flex h-[1.6rem] w-[31%] -translate-x-1/2 items-center justify-end rounded-full bg-black pr-2"
            >
              <span className="size-2 rounded-full bg-[#1b1d2e] ring-1 ring-[#2a2d44]" />
            </span>

            <div className="flex min-h-0 flex-1 flex-col">{children}</div>

            {/* Home indicator */}
            <div aria-hidden className="flex h-6 shrink-0 items-center justify-center bg-white">
              <span className="h-[5px] w-[36%] rounded-full bg-ink" />
            </div>

            {/* Faint glass sheen across the display. */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgb(255_255_255/0.14)_0%,transparent_32%)]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function SideButton({ side, top, height }: { side: "left" | "right"; top: string; height: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "absolute w-[3px]",
        side === "left" ? "-left-[2px] rounded-l-[2px]" : "-right-[2px] rounded-r-[2px]",
      )}
      style={{ top, height, backgroundImage: TITANIUM }}
    />
  );
}

/** iOS cellular bars: four rising, rounded columns. */
function CellularGlyph() {
  return (
    <svg viewBox="0 0 18 12" className="h-[0.6rem] w-auto" fill="currentColor">
      <rect x="0" y="8" width="3" height="4" rx="1" />
      <rect x="5" y="5.5" width="3" height="6.5" rx="1" />
      <rect x="10" y="3" width="3" height="9" rx="1" />
      <rect x="15" y="0" width="3" height="12" rx="1" />
    </svg>
  );
}

/** iOS Wi-Fi fan: three arcs over a dot. */
function WifiGlyph() {
  return (
    <svg viewBox="0 0 16 12" className="h-[0.6rem] w-auto" fill="currentColor">
      <path d="M8 2.4c2.3 0 4.4.9 6 2.4l1.2-1.3A10.4 10.4 0 0 0 8 .6 10.4 10.4 0 0 0 .8 3.5L2 4.8a8.6 8.6 0 0 1 6-2.4Z" />
      <path d="M8 5.9c1.4 0 2.6.5 3.6 1.4l1.2-1.3A7 7 0 0 0 8 4.1 7 7 0 0 0 3.2 6l1.2 1.3c1-.9 2.2-1.4 3.6-1.4Z" />
      <path d="M8 9.3c.5 0 .9.2 1.2.5L8 11.2 6.8 9.8c.3-.3.7-.5 1.2-.5Z" />
    </svg>
  );
}

/** iOS battery: rounded outline, near-full charge, terminal cap. */
function BatteryGlyph() {
  return (
    <svg viewBox="0 0 27 13" className="h-[0.65rem] w-auto">
      <rect x="0.5" y="0.5" width="23" height="12" rx="3.6" fill="none" stroke="currentColor" strokeOpacity="0.4" />
      <rect x="2" y="2" width="18" height="9" rx="2.2" fill="currentColor" />
      <path d="M25 4.4v4.2c.8-.3 1.4-1.1 1.4-2.1s-.6-1.8-1.4-2.1Z" fill="currentColor" fillOpacity="0.45" />
    </svg>
  );
}
