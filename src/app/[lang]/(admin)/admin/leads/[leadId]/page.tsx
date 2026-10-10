import type { Metadata } from "next";
import { Mail, MessageCircle, Phone } from "lucide-react";

import { LeadWorkbench } from "@/components/admin/LeadWorkbench";
import { WhatsAppBotCard } from "@/components/admin/WhatsAppBotCard";
import { Badge } from "@/components/ui/Badge";
import { buttonStyles } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { isAtLeast } from "@/lib/auth/roles";
import { getCurrentUserProfile } from "@/lib/auth/server";
import {
  ENQUIRY_STATUS_LABELS,
  ENQUIRY_STATUS_TONES,
  formLabel,
  whatsappHref,
  whatsappOpener,
} from "@/lib/enquiries/labels";
import { formatIst } from "@/lib/exam/ist";
import { enquiryService } from "@/services/enquiries/enquiry.service";
import { userService } from "@/services/users/user.service";
import { whatsappSessionService } from "@/services/whatsapp/session.service";

import { orNotFound, requireRolePage } from "../../page-guards";

export const metadata: Metadata = {
  title: "Lead",
  robots: { index: false, follow: false },
};

/** `graduationYear` → "Graduation year". Form answers are stored under their field names. */
function humanise(key: string): string {
  const spaced = key.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[_-]+/g, " ").toLowerCase();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function answerText(value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) return value.length ? value.join(", ") : null;
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export default async function LeadPage({ params }: PageProps<"/[lang]/admin/leads/[leadId]">) {
  const { leadId } = await params;
  const session = await requireRolePage(`/admin/leads/${leadId}`, "COUNSELLOR");

  const enquiry = await orNotFound(enquiryService.getById(leadId));
  const canAssign = isAtLeast(session.role, "ADMIN");
  // Set by the WhatsApp bot on the enquiries it creates.
  const waId = typeof enquiry.answers.whatsappId === "string" ? enquiry.answers.whatsappId : null;

  const [names, profile, staff, bot] = await Promise.all([
    enquiryService.getStaffNames([
      ...enquiry.activity.map((entry) => entry.by),
      ...(enquiry.assignedTo ? [enquiry.assignedTo] : []),
    ]),
    getCurrentUserProfile(),
    canAssign ? userService.listStaff() : Promise.resolve(null),
    waId ? whatsappSessionService.getStatus(waId) : Promise.resolve(null),
  ]);

  const answers = Object.entries(enquiry.answers)
    .filter(([key]) => key !== "whatsappId")
    .map(([key, value]) => [humanise(key), answerText(value)] as const)
    .filter((entry): entry is readonly [string, string] => entry[1] !== null);

  const counsellorFirstName = profile?.displayName?.split(/\s+/)[0];
  const whatsapp = whatsappHref(
    enquiry.phone,
    whatsappOpener(enquiry.name, enquiry.form, counsellorFirstName),
  );

  const history = [...enquiry.activity].sort((a, b) => b.at.localeCompare(a.at));

  // Read once per request, like the leads list.
  const now = new Date().toISOString();

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-h2 font-bold">{enquiry.name}</h1>
            <Badge tone={ENQUIRY_STATUS_TONES[enquiry.status]}>
              {ENQUIRY_STATUS_LABELS[enquiry.status]}
            </Badge>
          </div>
          <p className="mt-2 text-body text-ink-secondary">
            {formLabel(enquiry.form)} · received {formatIst(enquiry.createdAt)}
            {enquiry.assignedTo
              ? ` · owner ${enquiry.assignedTo === session.uid ? "you" : (names[enquiry.assignedTo] ?? "former staff")}`
              : " · unassigned"}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <a href={`tel:+91${enquiry.phone}`} className={buttonStyles({ size: "sm" })}>
            <Phone aria-hidden className="size-4" />
            Call {enquiry.phone}
          </a>
          <a
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonStyles({ size: "sm", variant: "secondary" })}
          >
            <MessageCircle aria-hidden className="size-4" />
            WhatsApp
          </a>
          {enquiry.email ? (
            <a href={`mailto:${enquiry.email}`} className={buttonStyles({ size: "sm", variant: "ghost" })}>
              <Mail aria-hidden className="size-4" />
              Email
            </a>
          ) : null}
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-6">
          <Card padding="md">
            <h2 className="text-h4 font-bold">What they told us</h2>
            <dl className="mt-4 grid gap-x-6 gap-y-3 text-small sm:grid-cols-[12rem_minmax(0,1fr)]">
              <dt className="text-ink-secondary">Mobile</dt>
              <dd>{enquiry.phone}</dd>
              <dt className="text-ink-secondary">Email</dt>
              <dd className="break-all">{enquiry.email ?? "—"}</dd>
              <dt className="text-ink-secondary">Came from</dt>
              <dd>
                {enquiry.source}
                {enquiry.campaign ? ` · campaign ${enquiry.campaign}` : ""}
              </dd>
              {enquiry.page ? (
                <>
                  <dt className="text-ink-secondary">Form page</dt>
                  <dd className="break-all">{enquiry.page}</dd>
                </>
              ) : null}
              {answers.map(([label, value]) => (
                <div key={label} className="contents">
                  <dt className="text-ink-secondary">{label}</dt>
                  <dd className="break-words">{value}</dd>
                </div>
              ))}
            </dl>
          </Card>

          <Card padding="md">
            <h2 className="text-h4 font-bold">History</h2>
            {history.length === 0 ? (
              <p className="mt-4 text-body text-ink-secondary">
                No calls logged yet. Log each call, even an unanswered one — the next counsellor
                needs to know it was tried.
              </p>
            ) : (
              <ol className="mt-4 divide-y divide-line">
                {history.map((entry, index) => (
                  <li key={`${entry.at}-${index}`} className="py-3">
                    <p className="text-small text-ink-secondary">
                      {formatIst(entry.at)} ·{" "}
                      {entry.by === "system" ? "Website" : (names[entry.by] ?? "Former staff")}
                    </p>
                    <p className="mt-1 whitespace-pre-line text-body">{entry.note}</p>
                  </li>
                ))}
              </ol>
            )}
          </Card>
        </div>

        <div className="space-y-5">
          {waId && bot ? (
            <WhatsAppBotCard
              enquiryId={enquiry.id}
              waId={waId}
              pausedUntil={bot.pausedUntil && bot.pausedUntil > now ? bot.pausedUntil : null}
              lastInboundAt={bot.lastInboundAt}
            />
          ) : null}
          <LeadWorkbench
            // Remount after every save, so the inputs show what the server now holds.
            key={enquiry.updatedAt}
            enquiryId={enquiry.id}
            status={enquiry.status}
            followUpAt={enquiry.followUpAt}
            assignedTo={enquiry.assignedTo}
            currentUid={session.uid}
            staff={
              staff
                ?.filter((person) => person.isActive && isAtLeast(person.role, "COUNSELLOR"))
                .map((person) => ({ uid: person.uid, name: person.displayName })) ?? null
            }
          />
        </div>
      </div>
    </>
  );
}
