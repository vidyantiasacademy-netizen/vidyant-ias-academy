"use client";

import {
  ANALYTICS_EVENTS,
  type AnalyticsEvent,
  type AnalyticsPayload,
} from "./events";

import { GA_MEASUREMENT_ID } from "./config";

/**
 * Provider-agnostic analytics facade.
 *
 * With a GA4 id configured, events go out as `gtag("event", …)` — GA4 ignores
 * plain objects pushed onto `dataLayer`, so the GTM-style record alone would
 * be dropped. Without one, the GTM-style record is queued instead, for a Tag
 * Manager container or Meta Pixel to consume later. Swap only `dispatch` to
 * change providers.
 */

interface DataLayerRecord extends AnalyticsPayload {
  event: string;
}

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

/**
 * The stock gtag shim. It must push the `arguments` object itself, not an
 * array — gtag.js tells its own commands apart from GTM records by that type.
 * Calls made before gtag.js has loaded wait in the queue and are sent on load.
 */
function gtag(..._args: unknown[]): void;
function gtag() {
  window.dataLayer = window.dataLayer ?? [];
  // eslint-disable-next-line prefer-rest-params
  window.dataLayer.push(arguments);
}

function dispatch({ event, ...params }: DataLayerRecord) {
  if (typeof window === "undefined") return;

  if (GA_MEASUREMENT_ID) {
    gtag("event", event, params);
  } else {
    window.dataLayer = window.dataLayer ?? [];
    window.dataLayer.push({ event, ...params });
  }

  if (process.env.NODE_ENV === "development") {
    console.debug("[analytics]", event, params);
  }
}

export function track(event: AnalyticsEvent, payload: AnalyticsPayload = {}) {
  dispatch({ event, ...payload });
}

export function trackPageView(path: string, title?: string) {
  track(ANALYTICS_EVENTS.pageView, { path, title });
}

export { ANALYTICS_EVENTS };
export type { AnalyticsEvent, AnalyticsPayload };
