import type { Metadata } from "next";
import { Inbox, MessageCircle, Phone } from "lucide-react";

import Link from "@/i18n/Link";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  ENQUIRY_STATUSES,
  ENQUIRY_STATUS_LABELS,
  ENQUIRY_STATUS_TONES,
  formLabel,
  whatsappHref,
  whatsappOpener,
} from "@/lib/enquiries/labels";
import { formatIst } from "@/lib/exam/ist";
import { cn } from "@/lib/utils/cn";
import { enquiryService } from "@/services/enquiries/enquiry.service";
import type { EnquiryStatus } from "@/types/db";

import { requireRolePage } from "../page-guards";

export const metadata: Metadata = {
  title: "Leads",
  robots: { index: false, follow: false },
};

interface Filters {
  status?: EnquiryStatus;
  mine: boolean;
}

function listHref({ status, mine }: Filters, cursor?: string): string {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (mine) params.set("mine", "1");
  if (cursor) params.set("cursor", cursor);
  const query = params.toString();
  return query ? `/admin/leads?${query}` : "/admin/leads";
}

const filterLink = (active: boolean) =>
  cn(
    "inline-flex h-10 items-center border px-3 text-small font-medium transition-colors",
    active
      ? "border-indigo bg-indigo text-white"
      : "border-line text-ink-secondary hover:border-indigo hover:text-indigo",
  );

/**
 * The leads inbox: every website form submission, newest first.
 *
 * The page exists to shorten one number — the time between a form and the
 * first call. So the phone and WhatsApp buttons sit on the row itself, and a
 * follow-up that is overdue is the loudest thing in the table.
 */
export default async function LeadsPage({ searchParams }: PageProps<"/[lang]/admin/leads">) {
  const session = await requireRolePage("/admin/leads", "COUNSELLOR");

  const params = await searchParams;
  const filters: Filters = {
    status: ENQUIRY_STATUSES.find((value) => value === params.status),
    mine: params.mine === "1",
  };
  const cursor = typeof params.cursor === "string" ? params.cursor : null;

  const page = await enquiryService.list(
    { status: filters.status, assignedTo: filters.mine ? session.uid : undefined },
    { limit: 25, cursor },
  );

  const owners = await enquiryService.getStaffNames(
    page.items.map((enquiry) => enquiry.assignedTo).filter((uid): uid is string => Boolean(uid)),
  );

  // Read once per request, so every row is compared against the same instant.
  const now = new Date().toISOString();

  return (
    <>
      <div>
        <h1 className="text-h2 font-bold">Leads</h1>
        <p className="mt-2 text-body text-ink-secondary">
          Every website enquiry, newest first. Call a new lead within the hour — that is when
          they are still comparing institutes.
        </p>
      </div>

      <nav aria-label="Filter leads" className="mt-6 flex flex-wrap gap-2">
        {[undefined, ...ENQUIRY_STATUSES].map((value) => (
          <Link
            key={value ?? "all"}
            href={listHref({ ...filters, status: value })}
            aria-current={value === filters.status ? "page" : undefined}
            className={filterLink(value === filters.status)}
          >
            {value ? ENQUIRY_STATUS_LABELS[value] : "All"}
          </Link>
        ))}
        <span aria-hidden className="mx-1 w-px self-stretch bg-line" />
        <Link
          href={listHref({ ...filters, mine: !filters.mine })}
          aria-pressed={filters.mine}
          className={filterLink(filters.mine)}
        >
          Assigned to me
        </Link>
      </nav>

      <div className="mt-6">
        {page.items.length === 0 ? (
          <EmptyState
            icon={<Inbox aria-hidden className="size-5" />}
            title={cursor ? "No more leads" : "No leads here"}
            description={
              filters.status || filters.mine
                ? "Nothing matches this filter. Try All."
                : "Website form submissions appear here the moment they arrive."
            }
            action={
              filters.status || filters.mine ? (
                <ButtonLink href="/admin/leads" variant="secondary">Show all leads</ButtonLink>
              ) : undefined
            }
          />
        ) : (
          <Card padding="none" className="overflow-x-auto">
            <table className="w-full min-w-[56rem] text-left text-small">
              <thead className="border-b border-line text-ink-secondary">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">Lead</th>
                  <th scope="col" className="px-4 py-3 font-medium">Asked for</th>
                  <th scope="col" className="px-4 py-3 font-medium">Status</th>
                  <th scope="col" className="px-4 py-3 font-medium">Owner</th>
                  <th scope="col" className="px-4 py-3 font-medium">Next follow-up</th>
                  <th scope="col" className="px-4 py-3 font-medium">Received</th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    <span className="sr-only">Contact</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {page.items.map((enquiry) => {
                  const overdue = Boolean(enquiry.followUpAt && enquiry.followUpAt < now);
                  const courseSlug = enquiry.answers.courseSlug;

                  return (
                    <tr key={enquiry.id} className={cn(enquiry.status === "new" && "bg-chilli-100/30")}>
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/leads/${enquiry.id}`}
                          className="font-medium text-indigo underline decoration-line underline-offset-4 hover:decoration-indigo"
                        >
                          {enquiry.name}
                        </Link>
                        <span className="block text-ink-secondary">{enquiry.phone}</span>
                      </td>
                      <td className="px-4 py-3 text-ink-secondary">
                        <span className="block">{formLabel(enquiry.form)}</span>
                        {typeof courseSlug === "string" ? (
                          <span className="block">{courseSlug}</span>
                        ) : null}
                        {enquiry.source !== "website" ? (
                          <span className="block">via {enquiry.source}</span>
                        ) : null}
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={ENQUIRY_STATUS_TONES[enquiry.status]}>
                          {ENQUIRY_STATUS_LABELS[enquiry.status]}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-ink-secondary">
                        {enquiry.assignedTo
                          ? enquiry.assignedTo === session.uid
                            ? "You"
                            : (owners[enquiry.assignedTo] ?? "Former staff")
                          : "Unassigned"}
                      </td>
                      <td className={cn("px-4 py-3", overdue ? "font-bold text-danger" : "text-ink-secondary")}>
                        {enquiry.followUpAt ? (
                          <>
                            {overdue ? <span className="block">Overdue</span> : null}
                            {formatIst(enquiry.followUpAt)}
                          </>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3 text-ink-secondary">{formatIst(enquiry.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <a
                            href={`tel:+91${enquiry.phone}`}
                            aria-label={`Call ${enquiry.name}`}
                            className="inline-flex size-10 items-center justify-center text-indigo hover:bg-paper"
                          >
                            <Phone aria-hidden className="size-4" />
                          </a>
                          <a
                            href={whatsappHref(enquiry.phone, whatsappOpener(enquiry.name, enquiry.form))}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`WhatsApp ${enquiry.name}`}
                            className="inline-flex size-10 items-center justify-center text-success hover:bg-paper"
                          >
                            <MessageCircle aria-hidden className="size-4" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        )}

        {cursor || page.nextCursor ? (
          <div className="mt-4 flex justify-between gap-3">
            {cursor ? (
              <ButtonLink href={listHref(filters)} variant="ghost" size="sm">
                Back to newest
              </ButtonLink>
            ) : (
              <span />
            )}
            {page.nextCursor ? (
              <ButtonLink href={listHref(filters, page.nextCursor)} variant="secondary" size="sm">
                Next page
              </ButtonLink>
            ) : null}
          </div>
        ) : null}
      </div>
    </>
  );
}
