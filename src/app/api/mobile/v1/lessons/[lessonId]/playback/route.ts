import { mobileRoute, ok, pathId } from "@/lib/mobile/http";
import { getPlayback } from "@/lib/mobile/views";

/** A signed, expiring stream URL — minted after the lesson access check. */
export const GET = mobileRoute(
  async (_request: Request, ctx: RouteContext<"/api/mobile/v1/lessons/[lessonId]/playback">) => {
    const { lessonId } = await ctx.params;
    return ok(await getPlayback(pathId(lessonId)));
  },
);
