import { ArrowRight, Download, ListChecks, MonitorPlay } from "lucide-react";

import { SocialIcon } from "@/components/ui/SocialIcon";
import { TrackedAnchor, TrackedButtonLink, TrackedLink } from "@/components/ui/TrackedLink";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { CTA, whatsappUrl } from "@/lib/constants/site";

const PAYLOAD = { location: "home-hero" } as const;

const quietLink =
  "inline-flex min-h-11 items-center gap-2 text-small font-bold text-indigo underline decoration-line-strong decoration-2 underline-offset-4 transition-colors hover:decoration-kesar";

/**
 * The hero's actions, in three weights so the next step is never in doubt:
 * one kesar primary (the priced programme cards below, where a course can be
 * bought), one indigo-outlined secondary (the brochure — counselling is the
 * lead form beside the hero copy), and quiet text links for the
 * visitor who wants to try before they talk. Styled for the hero's light
 * wash — indigo type throughout.
 */
export function HeroActions() {
  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap [&>a]:whitespace-nowrap">
        <TrackedButtonLink
          href="#programs"
          variant="kesar"
          size="lg"
          className="w-full sm:w-auto"
          event={ANALYTICS_EVENTS.enrolClick}
          payload={{ ...PAYLOAD, action: "enrol" }}
        >
          See courses &amp; fees
          <ArrowRight aria-hidden className="size-5" />
        </TrackedButtonLink>
        {/* Counselling is the lead form beside these actions, so the second
            action is the brochure — the lighter commitment. */}
        <TrackedButtonLink
          href={CTA.brochure.href}
          variant="secondary"
          size="lg"
          event={ANALYTICS_EVENTS.brochureClick}
          payload={{ ...PAYLOAD, action: "brochure" }}
        >
          <Download aria-hidden className="size-5" />
          {CTA.brochure.label}
        </TrackedButtonLink>
      </div>

      <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-1">
        <li>
          <TrackedLink
            href={CTA.mockTest.href}
            event={ANALYTICS_EVENTS.mockTestClick}
            payload={{ ...PAYLOAD, action: "mock-test" }}
            className={quietLink}
          >
            <ListChecks aria-hidden className="size-4.5 shrink-0" />
            Take a free mock test
          </TrackedLink>
        </li>
        <li>
          <TrackedLink
            href={CTA.demo.href}
            event={ANALYTICS_EVENTS.demoClick}
            payload={{ ...PAYLOAD, action: "demo" }}
            className={quietLink}
          >
            <MonitorPlay aria-hidden className="size-4.5 shrink-0" />
            Attend a free demo class
          </TrackedLink>
        </li>
        {/* Below lg the sticky bottom bar has a WhatsApp button. */}
        <li className="hidden lg:block">
          <TrackedAnchor
            href={whatsappUrl()}
            target="_blank"
            rel="noreferrer"
            event={ANALYTICS_EVENTS.whatsappClick}
            payload={{ ...PAYLOAD, action: "whatsapp" }}
            className={quietLink}
          >
            <SocialIcon name="whatsapp" className="size-5 shrink-0" />
            Ask us on WhatsApp
          </TrackedAnchor>
        </li>
      </ul>
    </div>
  );
}
