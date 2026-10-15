import { mobileRoute, ok, parseBody } from "@/lib/mobile/http";
import { toBookmarkView } from "@/lib/mobile/views";
import { addBookmarkSchema, removeBookmarkSchema } from "@/lib/validation/mobile";
import { bookmarkService } from "@/services/bookmarks/bookmark.service";
import { BOOKMARK_KINDS, type BookmarkKind } from "@/types/db";

export const GET = mobileRoute(async (request: Request) => {
  const kind = new URL(request.url).searchParams.get("kind");
  const filter = (BOOKMARK_KINDS as readonly string[]).includes(kind ?? "")
    ? (kind as BookmarkKind)
    : undefined;

  return ok((await bookmarkService.listOwn(filter)).map(toBookmarkView));
});

export const POST = mobileRoute(async (request: Request) => {
  const body = await parseBody(request, addBookmarkSchema);
  return ok(toBookmarkView(await bookmarkService.addOwn(body)), 201);
});

export const DELETE = mobileRoute(async (request: Request) => {
  const body = await parseBody(request, removeBookmarkSchema);
  await bookmarkService.removeOwn(body.kind, body.refId);
  return ok({ removed: true });
});
