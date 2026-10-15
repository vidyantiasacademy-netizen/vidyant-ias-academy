import { mobileRoute, ok, pathId } from "@/lib/mobile/http";
import { getDocumentLink } from "@/lib/mobile/views";

/** A ten-minute signed URL for the lesson's handout, after the access check. */
export const GET = mobileRoute(
  async (_request: Request, ctx: RouteContext<"/api/mobile/v1/lessons/[lessonId]/document">) => {
    const { lessonId } = await ctx.params;
    return ok(await getDocumentLink(pathId(lessonId)));
  },
);
