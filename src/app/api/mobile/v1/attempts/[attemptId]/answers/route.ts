import { mobileRoute, ok, parseBody, pathId } from "@/lib/mobile/http";
import { saveAnswerSchema } from "@/lib/validation/entities";
import { testService } from "@/services/tests/test.service";

/**
 * Saves one answer. `testService.saveAnswer` checks ownership, the session
 * token, the server deadline, that the question is on this paper and that the
 * options exist on it. Idempotent: the answer id is attempt + question.
 */
export const POST = mobileRoute(
  async (request: Request, ctx: RouteContext<"/api/mobile/v1/attempts/[attemptId]/answers">) => {
    const { attemptId } = await ctx.params;
    const body = await parseBody(request, saveAnswerSchema, { attemptId: pathId(attemptId) });
    await testService.saveAnswer({
      attemptId: body.attemptId,
      sessionToken: body.sessionToken,
      questionId: body.questionId,
      selectedOptionIds: body.selectedOptionIds ?? [],
      timeSpentSeconds: body.timeSpentSeconds,
    });
    return ok({ saved: true });
  },
);
