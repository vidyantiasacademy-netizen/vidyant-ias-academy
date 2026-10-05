"use client";

import { NextStudio } from "next-sanity/studio";

import config from "../../../../sanity.config";

/**
 * Client boundary for the studio.
 *
 * `sanity.config.ts` has to be imported from inside a Client Component, not
 * from the page. The `sanity` package pulls in `swr`, whose `react-server`
 * entry point exports no default — so resolving the config in the RSC graph
 * fails the build with "Export default doesn't exist in target module". From
 * here it resolves against the browser entry point instead, which is the only
 * one the studio ever actually runs in.
 */
export function Studio() {
  return <NextStudio config={config} />;
}
