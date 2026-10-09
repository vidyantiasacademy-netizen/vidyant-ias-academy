/**
 * Card rail: a snap-scrolling strip on phones and tablets that becomes a grid
 * from `lg`. Keeps long card lists from stacking into several screens of
 * scrolling on mobile. Class strings are written out in full for Tailwind.
 */
const RAIL_BASE =
  "-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-3 sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:mx-0 lg:grid lg:gap-5 lg:overflow-visible lg:px-0 lg:pb-0";

export const railList = {
  3: `${RAIL_BASE} lg:grid-cols-3`,
  4: `${RAIL_BASE} lg:grid-cols-4`,
} as const;

export const railItem = "w-[85%] shrink-0 snap-start sm:w-[46%] lg:w-auto";
