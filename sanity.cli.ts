import { defineCliConfig } from "sanity/cli";

/**
 * Sanity CLI configuration — what `npx sanity <command>` (exec, documents,
 * typegen, dataset) talks to.
 *
 * The CLI loads `.env*` files into `process.env` before reading this file, so
 * the same variables the Next.js app uses apply here; no second copy of the
 * project id.
 */
export default defineCliConfig({
  api: {
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  },
});
