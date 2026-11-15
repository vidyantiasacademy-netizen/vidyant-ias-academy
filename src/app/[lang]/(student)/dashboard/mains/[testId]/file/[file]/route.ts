import { NextResponse } from "next/server";

import { toAppError } from "@/lib/errors";
import { answerWritingService } from "@/services/answer-writing/answer-writing.service";

/**
 * Opens one file of a Mains paper for the signed-in student:
 *
 * - `paper` — the question paper (and records when they first opened it);
 * - `1`, `2`, … — one of their own uploaded pages, by position;
 * - `checked-copy` — their evaluated copy, once it is released.
 *
 * A redirect to a freshly signed URL, rather than a signed URL rendered into the
 * page: those expire in minutes, and a student who leaves the paper's page open
 * through a three-hour paper must still be able to click the link. The service
 * does the authorisation; this route only picks which file.
 */
export async function GET(
  _request: Request,
  ctx: RouteContext<"/[lang]/dashboard/mains/[testId]/file/[file]">,
) {
  const { testId, file } = await ctx.params;

  try {
    let url: string;

    if (file === "paper") {
      url = await answerWritingService.openQuestionPaper(testId);
    } else if (file === "checked-copy") {
      url = await answerWritingService.getOwnFileUrl(testId, "checked-copy");
    } else if (/^[1-9]\d{0,2}$/.test(file)) {
      url = await answerWritingService.getOwnFileUrl(testId, Number(file) - 1);
    } else {
      return new NextResponse("Not found.", { status: 404 });
    }

    // The signed URL is a short-lived credential: nothing may cache the hop.
    return NextResponse.redirect(url, { status: 302, headers: { "cache-control": "no-store" } });
  } catch (error) {
    // Opened in a new tab, so a readable sentence beats a JSON body.
    const appError = toAppError(error);
    return new NextResponse(appError.message, {
      status: appError.status,
      headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" },
    });
  }
}
