"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";
import { formatIst } from "@/lib/exam/ist";
import { setWhatsAppBotPausedAction } from "@/lib/whatsapp/actions";

/**
 * Whether the WhatsApp bot is answering this lead. A counsellor pauses it
 * before replying by hand, so the person never gets a menu in the middle of a
 * real conversation.
 */

interface WhatsAppBotCardProps {
  enquiryId: string;
  waId: string;
  /** Set only while the pause is still in force. */
  pausedUntil: string | null;
  lastInboundAt: string;
}

export function WhatsAppBotCard({ enquiryId, waId, pausedUntil, lastInboundAt }: WhatsAppBotCardProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [pending, startTransition] = useTransition();

  function setPaused(paused: boolean) {
    startTransition(async () => {
      const result = await setWhatsAppBotPausedAction({ enquiryId, waId, paused });
      if (!result.ok) {
        showToast("error", result.message);
        return;
      }
      showToast("success", paused ? "Bot paused. The chat is yours." : "Bot is answering again.");
      router.refresh();
    });
  }

  return (
    <Card padding="md" className="space-y-4">
      <h2 className="text-h4 font-bold">WhatsApp bot</h2>
      <p className="text-body text-ink-secondary">
        {pausedUntil
          ? `Paused until ${formatIst(pausedUntil)}. Reply to them yourself on WhatsApp.`
          : "Answering this chat automatically. Pause it before you reply by hand."}
      </p>
      <p className="text-small text-ink-secondary">Last message {formatIst(lastInboundAt)}</p>
      <Button
        size="sm"
        variant={pausedUntil ? "primary" : "secondary"}
        disabled={pending}
        onClick={() => setPaused(!pausedUntil)}
      >
        {pausedUntil ? "Resume bot" : "Pause bot"}
      </Button>
    </Card>
  );
}
