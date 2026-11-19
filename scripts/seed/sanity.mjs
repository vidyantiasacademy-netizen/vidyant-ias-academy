/**
 * Shared plumbing for the Sanity seed scripts: an authenticated client, and a
 * converter from the seeds' plain-text format to Portable Text.
 */
import { createClient } from "@sanity/client";

export function sanityFlags() {
  return {
    replace: process.argv.includes("--replace"),
    dryRun: process.argv.includes("--dry-run"),
  };
}

/**
 * Write client. Credentials come from `sanity exec --with-user-token`
 * (SANITY_AUTH_TOKEN, the CLI login) or an explicit SANITY_API_WRITE_TOKEN.
 */
export function seedClient({ dryRun }) {
  try {
    process.loadEnvFile(".env.local");
  } catch {
    // `sanity exec` has already loaded it.
  }

  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
  const token = process.env.SANITY_AUTH_TOKEN ?? process.env.SANITY_API_WRITE_TOKEN;

  if (!projectId) {
    console.error("NEXT_PUBLIC_SANITY_PROJECT_ID must be set in .env.local.");
    process.exit(1);
  }

  if (!token && !dryRun) {
    console.error(
      "No write credentials. Run `npx sanity login` and then the npm seed script, " +
        "or set SANITY_API_WRITE_TOKEN for this one command.",
    );
    process.exit(1);
  }

  console.log(`Sanity project: ${projectId}/${dataset}${dryRun ? " (dry run)" : ""}\n`);

  return createClient({ projectId, dataset, token, apiVersion: "2026-01-01", useCdn: false });
}

/**
 * Seed body → Portable Text. A string is a paragraph; `{ h2 }`, `{ h3 }` are
 * headings; `{ quote }` is a blockquote; `{ bullets: [] }`, `{ numbers: [] }`
 * are lists.
 */
export function blocks(body) {
  const items = typeof body === "string" ? body.split(/\n{2,}/) : body;
  const out = [];

  const block = (text, extra = {}) => {
    const index = out.length;
    out.push({
      _type: "block",
      _key: `b${index}`,
      style: "normal",
      markDefs: [],
      children: [{ _type: "span", _key: `b${index}s`, text, marks: [] }],
      ...extra,
    });
  };

  for (const item of items) {
    if (typeof item === "string") block(item);
    else if (item.h2) block(item.h2, { style: "h2" });
    else if (item.h3) block(item.h3, { style: "h3" });
    else if (item.quote) block(item.quote, { style: "blockquote" });
    else if (item.bullets) item.bullets.forEach((text) => block(text, { listItem: "bullet", level: 1 }));
    else if (item.numbers) item.numbers.forEach((text) => block(text, { listItem: "number", level: 1 }));
  }

  return out;
}

/** Plain text of a seed body, for reading-time estimates. */
export function wordCount(body) {
  const items = typeof body === "string" ? [body] : body;

  return items
    .flatMap((item) =>
      typeof item === "string" ? [item] : (item.bullets ?? item.numbers ?? [item.h2 ?? item.h3 ?? ""]),
    )
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;
}

/** Queue every document, then commit once — all or nothing. */
export async function commitAll(client, documents, { replace, dryRun }) {
  const transaction = client.transaction();

  for (const document of documents) {
    console.log(`  ${replace ? "replace" : "create-if-missing"}  ${document._id}`);

    if (replace) transaction.createOrReplace(document);
    else transaction.createIfNotExists(document);
  }

  if (!dryRun) {
    await transaction.commit({ visibility: "async" });
    console.log(`\nCommitted ${documents.length} documents (published, no drafts.* prefix).`);
  }
}
