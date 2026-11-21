/**
 * Adds the sample page content (`scripts/seed/resource-content.mjs`) to the
 * free resources that already exist in Sanity, so `/resources/<slug>` has
 * something to render.
 *
 * Touches only the `content` field — plus `title` and `description` from
 * `RESOURCE_META` when `--replace` is passed. A resource whose content an editor has
 * already written is left alone unless `--replace` is passed; a resource that
 * does not exist yet is skipped (create it with `seed:content:sanity`).
 *
 *   npm run seed:resources:sanity                 # set content where missing
 *   npm run seed:resources:sanity -- --replace    # overwrite with the sample copy
 *   npm run seed:resources:sanity -- --dry-run
 *   npm run seed:resources:sanity -- --replace --only pyq-strategy,study-planner
 */
import { RESOURCE_CONTENT, RESOURCE_META } from "./seed/resource-content.mjs";
import { blocks, sanityFlags, seedClient } from "./seed/sanity.mjs";

const flags = sanityFlags();
const client = seedClient(flags);

const onlyArg = process.argv.indexOf("--only");
const only = onlyArg > -1 ? process.argv[onlyArg + 1]?.split(",").filter(Boolean) : null;
const unknown = (only ?? []).filter((id) => !(id in RESOURCE_CONTENT));

if (unknown.length > 0) {
  console.error(`No seed content for: ${unknown.join(", ")}`);
  process.exit(1);
}

const ids = only ?? Object.keys(RESOURCE_CONTENT);
const existing = await client.fetch(
  `*[_type == "freeResource" && _id in $ids]{ _id, "hasContent": count(content) > 0 }`,
  { ids },
);
const found = new Map(existing.map((doc) => [doc._id, doc.hasContent]));

const transaction = client.transaction();
let queued = 0;

for (const id of ids) {
  if (!found.has(id)) {
    console.log(`  skip (no document)  ${id}`);
    continue;
  }
  if (found.get(id) && !flags.replace) {
    console.log(`  skip (has content)  ${id}`);
    continue;
  }

  const content = blocks(RESOURCE_CONTENT[id]);
  console.log(`  ${flags.replace ? "set" : "set-if-missing"}  ${id}.content (${content.length} blocks)`);
  // Title and description only on --replace: an editor's own wording wins otherwise.
  const meta = flags.replace ? (RESOURCE_META[id] ?? {}) : {};
  if (meta.title) console.log(`                     ${id}.title = "${meta.title}"`);
  transaction.patch(id, (patch) =>
    flags.replace ? patch.set({ content, ...meta }) : patch.setIfMissing({ content }),
  );
  queued += 1;
}

if (!flags.dryRun && queued > 0) {
  await transaction.commit({ visibility: "async" });
  console.log(`\nUpdated ${queued} resources.`);
} else {
  console.log(`\n${queued} resources would be updated.`);
}
