import { mobileRoute, ok } from "@/lib/mobile/http";
import { listMistakes } from "@/lib/mobile/views";

/** Questions answered wrongly on the student's recent released papers. */
export const GET = mobileRoute(async (request: Request) => {
  const subject = new URL(request.url).searchParams.get("subject")?.slice(0, 80) ?? null;
  return ok(await listMistakes(subject));
});
