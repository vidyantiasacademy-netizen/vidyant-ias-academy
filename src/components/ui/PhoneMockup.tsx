import type { ReactNode } from "react";

import { BatteryFull, Signal, Wifi } from "lucide-react";

import { cn } from "@/lib/utils/cn";

interface PhoneMockupProps {
  children: ReactNode;
  className?: string;
  /** Background behind the status bar — match the app header it sits on. */
  statusBarTone?: "indigo" | "light";
}

/**
 * A modern Android handset drawn in CSS: bezel, punch-hole camera, side keys,
 * status bar and gesture handle. Drawn rather than a PNG frame so it stays
 * sharp at any density and costs nothing on a 3G connection.
 *
 * `children` is the app screen below the status bar; it should fill the
 * height (`flex-1`) so the gesture handle stays pinned to the bottom.
 */
export function PhoneMockup({ children, className, statusBarTone = "indigo" }: PhoneMockupProps) {
  const dark = statusBarTone === "indigo";

  return (
    <div className={cn("relative mx-auto w-full max-w-[18.5rem]", className)}>
      {/* Side keys sit behind the frame so only their edge shows. */}
      <span aria-hidden className="absolute top-[18%] -left-[3px] h-10 w-[4px] rounded-l-sm bg-[#2b2d35]" />
      <span aria-hidden className="absolute top-[26%] -left-[3px] h-16 w-[4px] rounded-l-sm bg-[#2b2d35]" />
      <span aria-hidden className="absolute top-[22%] -right-[3px] h-20 w-[4px] rounded-r-sm bg-[#2b2d35]" />

      {/* Frame: a thin metal rim around a black bezel. */}
      <div className="relative aspect-[9/19.5] rounded-[3rem] bg-[#1a1b22] p-[3px] shadow-[var(--shadow-panel),0_2px_6px_rgb(17_17_17/0.25)]">
        <div className="h-full rounded-[2.85rem] bg-ink p-[0.55rem] shadow-[inset_0_0_0_1px_rgb(255_255_255/0.08)]">
          <div className="relative flex h-full flex-col overflow-hidden rounded-[2.35rem] bg-paper">
            {/* Status bar */}
            <div
              aria-hidden
              className={cn(
                "relative flex h-9 shrink-0 items-center justify-between px-6 pt-1 text-[0.8125rem] leading-none font-semibold",
                dark ? "bg-indigo-gradient text-white" : "bg-white text-ink",
              )}
            >
              <span>9:41</span>
              <span className="absolute top-2.5 left-1/2 size-3.5 -translate-x-1/2 rounded-full bg-[#050507] ring-2 ring-[#15161c]" />
              <span className="flex items-center gap-1">
                <Signal className="size-3.5" strokeWidth={2.5} />
                <Wifi className="size-3.5" strokeWidth={2.5} />
                <BatteryFull className="size-4" strokeWidth={2} />
              </span>
            </div>

            <div className="flex min-h-0 flex-1 flex-col">{children}</div>

            {/* Gesture handle */}
            <div aria-hidden className="flex h-5 shrink-0 items-center justify-center bg-white">
              <span className="h-1 w-24 rounded-full bg-ink/80" />
            </div>

            {/* Faint glass reflection across the screen. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgb(255_255_255/0.14)_0%,rgb(255_255_255/0)_38%)]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
