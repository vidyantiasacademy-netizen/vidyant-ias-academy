import { mobileRoute, ok, pathId } from "@/lib/mobile/http";
import { getLessonDetail } from "@/lib/mobile/views";

export const GET = mobileRoute(
  async (_request: Request, ctx: RouteContext<"/api/mobile/v1/lessons/[lessonId]">) => {
    const { lessonId } = await ctx.params;
    return ok(await getLessonDetail(pathId(lessonId)));
  },
);
