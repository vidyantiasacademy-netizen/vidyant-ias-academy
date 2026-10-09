"use client";

import { useState } from "react";

import { cn } from "@/lib/utils/cn";

export interface TrendPoint {
  label: string;
  score: number;
}

interface ScoreTrendChartProps {
  points: TrendPoint[];
  /** Highest possible score — shown in the tooltip, not the axis. */
  max: number;
  /** Visible y-range. A line chart does not need a zero baseline. */
  domain: [number, number];
  ticks: number[];
}

const W = 280;
const H = 160;
const PAD = { top: 12, right: 16, bottom: 28, left: 34 };

/**
 * Single-series line chart, inline SVG so it costs nothing on 3G. Hit columns
 * are real buttons laid over the plot: hover, tap and keyboard focus all show
 * the same tooltip. The latest point is the student, so it is the one kesar mark.
 */
export function ScoreTrendChart({
  points,
  max,
  domain,
  ticks,
}: ScoreTrendChartProps) {
  const [active, setActive] = useState<number | null>(null);
  const last = points.length - 1;

  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;
  const x = (i: number) => PAD.left + (plotW * i) / last;
  const y = (v: number) =>
    PAD.top + plotH * (1 - (v - domain[0]) / (domain[1] - domain[0]));
  const path = points
    .map((p, i) => `${i ? "L" : "M"}${x(i)},${y(p.score)}`)
    .join(" ");

  const shown = active ?? last;
  const prev = shown > 0 ? points[shown - 1].score : null;
  const delta = prev === null ? null : points[shown].score - prev;

  return (
    <div>
      <div className="relative">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-auto w-full overflow-visible"
          role="img"
          aria-label={`Mock scores rising from ${points[0].score} to ${points[last].score} out of ${max} across ${points.length} mocks`}
        >
          {ticks.map((t) => (
            <line
              key={t}
              x1={PAD.left}
              x2={W - PAD.right}
              y1={y(t)}
              y2={y(t)}
              className="stroke-line"
              strokeDasharray={t === domain[0] ? undefined : "2 4"}
            />
          ))}

          {active !== null ? (
            <line
              x1={x(active)}
              x2={x(active)}
              y1={PAD.top}
              y2={PAD.top + plotH}
              className="stroke-line-strong"
            />
          ) : null}

          <path
            d={path}
            fill="none"
            className="stroke-indigo"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {points.map((p, i) => (
            <circle
              key={p.label}
              cx={x(i)}
              cy={y(p.score)}
              r={i === last ? 5.5 : i === active ? 4.5 : 3.5}
              strokeWidth={2}
              className={cn(
                "stroke-white transition-[r] duration-150",
                i === last ? "fill-kesar" : "fill-indigo",
              )}
            />
          ))}
        </svg>

        {/* Axis labels live in HTML so they stay 13px however wide the SVG scales. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 text-[13px] leading-none tabular-nums text-ink-muted"
        >
          {ticks.map((t) => (
            <span
              key={t}
              className="absolute -translate-y-1/2 pr-2 text-right"
              style={{
                top: `${(y(t) / H) * 100}%`,
                right: `${(1 - PAD.left / W) * 100}%`,
              }}
            >
              {t}
            </span>
          ))}
          {points.map((p, i) => (
            <span
              key={p.label}
              className={cn(
                "absolute bottom-0 -translate-x-1/2",
                i === shown && "font-semibold text-indigo",
              )}
              style={{ left: `${(x(i) / W) * 100}%` }}
            >
              {p.label}
            </span>
          ))}
        </div>

        {/* Hit columns — wider than the marks, one per mock. */}
        <div
          className="absolute inset-y-0 flex"
          style={{
            left: `${((PAD.left - plotW / last / 2) / W) * 100}%`,
            right: `${((PAD.right - plotW / last / 2) / W) * 100}%`,
          }}
          onMouseLeave={() => setActive(null)}
        >
          {points.map((p, i) => (
            <button
              key={p.label}
              type="button"
              className="flex-1 cursor-pointer rounded-md focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-indigo"
              aria-label={`${p.label}: ${p.score} out of ${max}`}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
              onClick={() => setActive(i)}
            />
          ))}
        </div>
      </div>

      <p
        aria-live="polite"
        className="mt-3 flex flex-wrap items-baseline gap-x-2 text-[13px] text-ink-secondary"
      >
        <span className="font-semibold text-indigo">{points[shown].label}</span>
        <span className="tabular-nums">
          <span className="font-semibold text-ink">{points[shown].score}</span>/
          {max}
        </span>
        {delta !== null ? (
          <span className="tabular-nums">
            {delta >= 0 ? "▲" : "▼"} {Math.abs(delta)} vs previous
          </span>
        ) : null}
      </p>
    </div>
  );
}
