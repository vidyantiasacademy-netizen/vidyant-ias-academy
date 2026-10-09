import { toPlainText } from "next-sanity";

import type { PortableTextBlocks } from "./types";

/**
 * Portable Text → one plain string, for cards, meta descriptions, JSON-LD and
 * the FAQ accordion.
 *
 * `PortableTextBlocks` is `unknown[]` (see `types.ts`), so the cast lives here
 * once rather than at every call site.
 */
export function plainText(blocks: PortableTextBlocks | null | undefined): string {
  if (!blocks || blocks.length === 0) return "";

  return toPlainText(blocks as Parameters<typeof toPlainText>[0]).trim();
}
