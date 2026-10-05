"use client";

import Link from "next/link";
import type { ComponentProps, MouseEvent } from "react";

import { ButtonLink, type ButtonVariants } from "@/components/ui/Button";
import { track, type AnalyticsEvent, type AnalyticsPayload } from "@/lib/analytics";

type TrackedProps = {
  event: AnalyticsEvent;
  payload?: AnalyticsPayload;
};

/** Button-styled link that reports a conversion event before navigating. */
export function TrackedButtonLink({
  event,
  payload,
  onClick,
  ...props
}: ComponentProps<typeof ButtonLink> & ButtonVariants & TrackedProps) {
  function handleClick(e: MouseEvent<HTMLAnchorElement>) {
    track(event, payload);
    onClick?.(e);
  }

  return <ButtonLink onClick={handleClick} {...props} />;
}

/** Plain link that reports a conversion event before navigating. */
export function TrackedLink({
  event,
  payload,
  onClick,
  ...props
}: ComponentProps<typeof Link> & TrackedProps) {
  function handleClick(e: MouseEvent<HTMLAnchorElement>) {
    track(event, payload);
    onClick?.(e);
  }

  return <Link onClick={handleClick} {...props} />;
}

/** External link (tel:, wa.me) with tracking — not routed by next/link. */
export function TrackedAnchor({
  event,
  payload,
  onClick,
  ...props
}: ComponentProps<"a"> & TrackedProps) {
  function handleClick(e: MouseEvent<HTMLAnchorElement>) {
    track(event, payload);
    onClick?.(e);
  }

  return <a onClick={handleClick} {...props} />;
}
