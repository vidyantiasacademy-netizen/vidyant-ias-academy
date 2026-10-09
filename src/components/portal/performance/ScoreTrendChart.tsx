"use client";

import { useEffect, useRef, useState } from "react";

import type { TrendPoint } from "@/lib/exam/analytics";

/**
 * Score over time, as a share of each paper's marks.
 *
 * Percent rather than raw score because papers differ in size — a 120 on a 200
 * paper and a 60 on a 100 paper are the same performance and must sit at the
 * same height. Points are spaced evenly by sitting rather than by date: the gap
 * between two mocks says nothing about the student, and a calendar axis would
 * crush a busy fortnight into a smear.
 *
 * Measured to its container so axis text stays at its real size on a phone
 * instead of scaling down with a fixed viewBox.
 */

const HEIGHT = 240;
const PAD = { top: 16, right: 16, bottom: 32, left: 40 };
const GRID = [0, 25, 50, 75, 100];

function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export function ScoreTrendChart({
  points,
  average,
}: {
  points: TrendPoint[];
  average: number | null;
}) {
  const frame = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(640);
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    const node = frame.current;
    if (!node) return;

    const observer = new ResizeObserver(([entry]) => {
      setWidth(Math.max(280, Math.round(entry.contentRect.width)));
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Negative marking can take a paper below zero; the axis follows it down
  // rather than clipping the worst sitting off the chart.
  const floor = Math.min(0, Math.floor(Math.min(...points.map((p) => p.percent)) / 25) * 25);
  const domain = [floor, 100] as const;
  const grid = floor < 0 ? [floor, ...GRID] : GRID;

  const plotWidth = width - PAD.left - PAD.right;
  const plotHeight = HEIGHT - PAD.top - PAD.bottom;

  const x = (index: number) =>
    PAD.left + (points.length === 1 ? plotWidth / 2 : (index / (points.length - 1)) * plotWidth);
  const y = (percent: number) =>
    PAD.top + (1 - (percent - domain[0]) / (domain[1] - domain[0])) * plotHeight;

  const path = points
    .map((point, index) => `${index === 0 ? "M" : "L"}${x(index)},${y(point.percent)}`)
    .join(" ");

  function nearest(clientX: number, target: SVGSVGElement) {
    const left = target.getBoundingClientRect().left;
    const offset = clientX - left - PAD.left;
    const index =
      points.length === 1 ? 0 : Math.round((offset / plotWidth) * (points.length - 1));
    return Math.min(points.length - 1, Math.max(0, index));
  }

  const hovered = active === null ? null : points[active];
  const last = points.length - 1;

  return (
    <div ref={frame} className="relative">
      <svg
        width={width}
        height={HEIGHT}
        role="img"
        aria-label={`Score trend across ${points.length} papers, latest ${points[last].percent}%`}
        className="block touch-pan-y select-none"
        onPointerMove={(event) => setActive(nearest(event.clientX, event.currentTarget))}
        onPointerLeave={() => setActive(null)}
      >
        {grid.map((value) => (
          <g key={value}>
            <line
              x1={PAD.left}
              x2={width - PAD.right}
              y1={y(value)}
              y2={y(value)}
              stroke="var(--color-line)"
              strokeWidth={1}
              strokeDasharray={value === 0 ? undefined : "2 4"}
            />
            <text
              x={PAD.left - 8}
              y={y(value)}
              dy="0.32em"
              textAnchor="end"
              className="fill-ink-secondary text-[12px] tabular-nums"
            >
              {value}%
            </text>
          </g>
        ))}

        {average !== null && points.length > 1 ? (
          <g>
            <line
              x1={PAD.left}
              x2={width - PAD.right}
              y1={y(average)}
              y2={y(average)}
              stroke="var(--color-kesar-600)"
              strokeWidth={1}
              strokeDasharray="6 4"
            />
            <text
              x={width - PAD.right}
              y={y(average) - 6}
              textAnchor="end"
              className="fill-kesar-700 text-[12px] font-semibold tabular-nums"
            >
              Average {average}%
            </text>
          </g>
        ) : null}

        {hovered && active !== null ? (
          <line
            x1={x(active)}
            x2={x(active)}
            y1={PAD.top}
            y2={HEIGHT - PAD.bottom}
            stroke="var(--color-line-strong)"
            strokeWidth={1}
          />
        ) : null}

        <path
          d={path}
          fill="none"
          stroke="var(--color-indigo-700)"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {points.map((point, index) => {
          const emphasised = index === active || (active === null && index === last);
          return (
            <circle
              key={point.attemptId}
              cx={x(index)}
              cy={y(point.percent)}
              r={emphasised ? 5 : 3}
              fill={emphasised ? "var(--color-indigo-700)" : "white"}
              stroke="var(--color-indigo-700)"
              strokeWidth={2}
            />
          );
        })}

        <text
          x={x(0)}
          y={HEIGHT - 10}
          textAnchor={points.length === 1 ? "middle" : "start"}
          className="fill-ink-secondary text-[12px]"
        >
          {shortDate(points[0].date)}
        </text>
        {points.length > 1 ? (
          <text
            x={x(last)}
            y={HEIGHT - 10}
            textAnchor="end"
            className="fill-ink-secondary text-[12px]"
          >
            {shortDate(points[last].date)}
          </text>
        ) : null}
      </svg>

      {hovered && active !== null ? (
        <div
          role="status"
          className="pointer-events-none absolute top-2 z-10 w-56 border border-line bg-white p-3 text-small shadow-md"
          style={
            x(active) > width / 2
              ? { right: width - x(active) + 12 }
              : { left: x(active) + 12 }
          }
        >
          <p className="font-semibold leading-snug">{hovered.title}</p>
          <p className="mt-1 text-ink-secondary">{shortDate(hovered.date)}</p>
          <p className="mt-2 tabular-nums">
            <span className="font-semibold">{hovered.percent}%</span>
            <span className="text-ink-secondary">
              {" "}
              · {hovered.score} / {hovered.totalMarks}
            </span>
          </p>
          {hovered.rank !== null ? (
            <p className="text-ink-secondary tabular-nums">
              Rank {hovered.rank}
              {hovered.percentile !== null ? ` · ${hovered.percentile} pctl` : ""}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
