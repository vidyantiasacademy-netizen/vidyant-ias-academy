"use client";

import {
  ANALYTICS_EVENTS,
  type AnalyticsEvent,
  type AnalyticsPayload,
} from "./events";

/**
 * Provider-agnostic analytics facade.
 *
 * No vendor SDK is wired up yet. Events are queued on `window.dataLayer`, which
 * GA4 / GTM / Meta Pixel can consume once credentials exist — swap only the
 * `dispatch` function below to change providers.
 */

interface DataLayerRecord extends AnalyticsPayload {
  event: string;
}

declare global {
  interface Window {
    dataLayer?: DataLayerRecord[];
  }
}

function dispatch(record: DataLayerRecord) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(record);
  if (process.env.NODE_ENV === "development") {
    console.debug("[analytics]", record.event, record);
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
