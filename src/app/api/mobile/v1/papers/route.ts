import { mobileRoute, ok } from "@/lib/mobile/http";
import { listPapers } from "@/lib/mobile/views";

export const GET = mobileRoute(async () => ok(await listPapers()));
