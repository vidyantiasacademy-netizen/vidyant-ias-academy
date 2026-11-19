/**
 * Adds the sample page content (`scripts/seed/resource-content.mjs`) to the
 * free resources that already exist in Sanity, so `/resources/<slug>` has
 * something to render.
 *
 * Touches only the `content` field. A resource whose content an editor has
 * already written is left alone unless `--replace` is passed; a resource that
 * does not exist yet is skipped (create it with `seed:content:sanity`).
 *
 *   npm run seed:resources:sanity                 # set content where missing
 *   npm run seed:resources:sanity -- --replace    # overwrite with the sample copy
 *   npm run seed:resources:sanity -- --dry-run
 */
import { RESOURCE_CONTENT } from "./seed/resource-content.mjs";
import { blocks, sanityFlags, seedClient } from "./seed/sanity.mjs";

const flags = sanityFlags();
const client = seedClient(flags);

const ids = Object.keys(RESOURCE_CONTENT);
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
  transaction.patch(id, (patch) => (flags.replace ? patch.set({ content }) : patch.setIfMissing({ content })));
  queued += 1;
}

if (!flags.dryRun && queued > 0) {
  await transaction.commit({ visibility: "async" });
  console.log(`\nUpdated ${queued} resources.`);
} else {
  console.log(`\n${queued} resources would be updated.`);
}
