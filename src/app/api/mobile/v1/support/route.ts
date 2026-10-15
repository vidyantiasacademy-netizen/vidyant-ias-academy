import { mobileRoute, ok, parseBody } from "@/lib/mobile/http";
import { supportRequestSchema } from "@/lib/validation/mobile";
import { accountRequestService } from "@/services/account/account-request.service";

export const POST = mobileRoute(async (request: Request) => {
  const body = await parseBody(request, supportRequestSchema);
  return ok(await accountRequestService.requestSupport(body), 201);
});
