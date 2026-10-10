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
 * A handset reduced to its essentials in CSS: a flat square-cut bezel,
 * punch-hole camera, status bar and gesture handle. Drawn rather than a PNG frame so it stays
 * sharp at any density and costs nothing on a 3G connection.
 *
 * `children` is the app screen below the status bar; it should fill the
 * height (`flex-1`) so the gesture handle stays pinned to the bottom.
 */
export function PhoneMockup({ children, className, statusBarTone = "indigo" }: PhoneMockupProps) {
  const dark = statusBarTone === "indigo";

  return (
    <div className={cn("relative mx-auto w-full max-w-[18.5rem]", className)}>
      {/* Frame: a flat ink bezel, square-cut — no gloss, no shadow. */}
      <div className="relative aspect-[9/19.5] border-2 border-ink bg-ink p-[0.45rem]">
        <div className="relative flex h-full flex-col overflow-hidden bg-paper">
          {/* Status bar */}
          <div
            aria-hidden
            className={cn(
              "relative flex h-9 shrink-0 items-center justify-between px-6 pt-1 text-[0.8125rem] leading-none font-semibold",
              dark ? "bg-indigo text-white" : "bg-white text-ink",
            )}
          >
            <span>9:41</span>
            <span className="absolute top-2.5 left-1/2 size-3.5 -translate-x-1/2 rounded-full bg-ink" />
            <span className="flex items-center gap-1">
              <Signal className="size-3.5" strokeWidth={2.5} />
              <Wifi className="size-3.5" strokeWidth={2.5} />
              <BatteryFull className="size-4" strokeWidth={2} />
            </span>
          </div>

          <div className="flex min-h-0 flex-1 flex-col">{children}</div>

          {/* Gesture handle */}
          <div aria-hidden className="flex h-5 shrink-0 items-center justify-center bg-white">
            <span className="h-1 w-24 bg-ink/80" />
          </div>
        </div>
      </div>
    </div>
  );
}
