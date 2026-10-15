import { mobileRoute, ok, parseBody } from "@/lib/mobile/http";
import { deletionRequestSchema } from "@/lib/validation/mobile";
import { accountRequestService } from "@/services/account/account-request.service";

/**
 * In-app account deletion, as the App Store and Play require. Files a request
 * the centre processes within `ACCOUNT_DELETION_SLA_DAYS` — see
 * `account-request.service.ts` for why it is not an immediate delete.
 */
export const POST = mobileRoute(async (request: Request) => {
  const body = await parseBody(request, deletionRequestSchema);
  return ok(await accountRequestService.requestAccountDeletion(body), 201);
});
