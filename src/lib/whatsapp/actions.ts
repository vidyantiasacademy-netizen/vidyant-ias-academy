"use server";

import { z } from "zod";

import { revalidateLocalizedPath } from "@/i18n/revalidate";
import { action, roleGuard } from "@/lib/auth/guards";
import { whatsappSessionService } from "@/services/whatsapp/session.service";

/** A counsellor's takeover lasts a week unless they hand the chat back sooner. */
const TAKEOVER_MS = 7 * 24 * 60 * 60 * 1000;

export const setWhatsAppBotPausedAction = action(
  roleGuard("COUNSELLOR"),
  z.object({
    enquiryId: z.string().trim().min(1).max(128),
    waId: z.string().regex(/^\d{8,15}$/),
    paused: z.boolean(),
  }),
  async (input) => {
    await whatsappSessionService.setPaused(
      input.waId,
      input.paused ? new Date(Date.now() + TAKEOVER_MS).toISOString() : null,
    );
    revalidateLocalizedPath(`/admin/leads/${input.enquiryId}`);
    return null;
  },
);
