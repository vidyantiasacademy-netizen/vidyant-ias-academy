import { mobileRoute, ok, parseBody, pathId } from "@/lib/mobile/http";
import { saveProgress } from "@/lib/mobile/views";
import { lessonProgressSchema } from "@/lib/validation/mobile";

export const PUT = mobileRoute(
  async (request: Request, ctx: RouteContext<"/api/mobile/v1/lessons/[lessonId]/progress">) => {
    const { lessonId } = await ctx.params;
    const body = await parseBody(request, lessonProgressSchema);
    return ok(await saveProgress(pathId(lessonId), body));
  },
);
