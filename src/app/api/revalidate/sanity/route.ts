import { revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { parseBody } from "next-sanity/webhook";

import { SANITY_TAG, SANITY_TAGS } from "@/lib/sanity/queries";

/**
 * Sanity publish webhook → targeted cache invalidation.
 *
 * Without it, an editor publishing a current-affairs article waits for the
 * 10-minute revalidate window; with it, the article is live in a second and
 * nothing else is re-rendered.
 *
 * `parseBody` verifies the `sanity-webhook-signature` header against
 * `SANITY_REVALIDATE_SECRET`. An unsigned request is rejected — otherwise this
 * route is a free cache-flush endpoint for anyone who finds the URL.
 *
 * Configure at sanity.io/manage → API → Webhooks:
 *   URL      https://www.vidyantias.com/api/revalidate/sanity
 *   Dataset  production
 *   Trigger  Create, Update, Delete
 *   Filter   _type in ["blog","currentAffair","faculty","course","demoClass","freeResource","pyqPaper","faq","announcement","category","subject","tag","author","translation.metadata"]
 *   Projection  {_type, "slug": slug.current}
 *   Secret   the value of SANITY_REVALIDATE_SECRET
 */

interface WebhookPayload {
  _type: string;
  slug?: string;
}

/** Every type-level tag, for the taxonomy case where nothing narrower applies. */
const ALL_TAGS: string[] = Object.values(SANITY_TAGS);

/** Document type → the tags that have to die when it changes. */
function tagsFor({ _type, slug }: WebhookPayload): string[] {
  switch (_type) {
    case "blog":
      return slug ? [SANITY_TAGS.blog, SANITY_TAG.blogPost(slug)] : [SANITY_TAGS.blog];
    case "currentAffair":
      return slug
        ? [SANITY_TAGS.currentAffairs, SANITY_TAG.currentAffair(slug)]
        : [SANITY_TAGS.currentAffairs];
    case "faculty":
      return [SANITY_TAGS.faculty];
    case "course":
      return [SANITY_TAGS.courses];
    case "demoClass":
      return [SANITY_TAGS.demoClasses];
    case "freeResource":
      return [SANITY_TAGS.freeResources];
    case "pyqPaper":
      return [SANITY_TAGS.pyqPapers];
    case "faq":
      return [SANITY_TAGS.faqs];
    case "announcement":
      return [SANITY_TAGS.announcements];
    // A taxonomy rename changes titles inside every projection that
    // dereferences it, so there is nothing narrower to invalidate.
    case "category":
    case "subject":
    case "tag":
    case "author":
      return ALL_TAGS;
    // Linking or unlinking a translation decides which language version every
    // list shows (see `IN_LOCALE` in queries.ts). The metadata document does
    // not name its type cheaply, so invalidate everything.
    case "translation.metadata":
      return ALL_TAGS;
    default:
      return [];
  }
}

export async function POST(request: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;

  if (!secret) {
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 500 });
  }

  try {
    const { isValidSignature, body } = await parseBody<WebhookPayload>(request, secret);

    if (!isValidSignature) {
      return NextResponse.json({ ok: false, error: "invalid_signature" }, { status: 401 });
    }

    if (!body?._type) {
      return NextResponse.json({ ok: false, error: "missing_type" }, { status: 400 });
    }

    const tags = tagsFor(body);

    // `"max"` marks the tag stale and serves the cached copy while the next
    // request re-renders in the background — the right trade for editorial
    // content. `updateTag` (immediate, read-your-own-writes) is only available
    // inside a Server Action, which a webhook is not.
    for (const tag of tags) revalidateTag(tag, "max");

    return NextResponse.json({ ok: true, revalidated: tags });
  } catch (error) {
    console.error("[sanity] revalidation failed", error);
    return NextResponse.json({ ok: false, error: "revalidate_failed" }, { status: 500 });
  }
}
