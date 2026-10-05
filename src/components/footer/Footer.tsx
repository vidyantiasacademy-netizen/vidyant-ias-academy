import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import Link from "next/link";

import { Container } from "@/components/ui/Container";
import { SocialIcon, type SocialIconName } from "@/components/ui/SocialIcon";
import { Logo } from "@/components/ui/Logo";
import { TrackedAnchor } from "@/components/ui/TrackedLink";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import {
  BRAND,
  CONTACT,
  FOOTER_NAV,
  SOCIAL_LINKS,
  whatsappUrl,
} from "@/lib/constants/site";

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: readonly { label: string; href: string }[];
}) {
  return (
    <div>
      <h3 className="text-small font-semibold uppercase text-white">
        {title}
      </h3>
      <ul className="mt-4 space-y-3">
        {links.map((link) => (
          <li key={`${title}-${link.href}`}>
            <Link
              href={link.href}
              className="text-small text-white/70 transition-colors hover:text-kesar"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="bg-indigo text-white focus-invert">
      <Container size="wide" className="py-14 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <Logo tone="light" size="md" asStatic />
            <p className="mt-5 max-w-xs text-small text-white/70">{BRAND.tagline}</p>
            <ul className="mt-7 flex items-center gap-3">
              {SOCIAL_LINKS.map((social) => (
                  <li key={social.label}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`${BRAND.name} on ${social.label}`}
                      className="flex size-10 items-center justify-center rounded-md border border-white/15 text-white/80 transition-colors hover:border-kesar hover:text-kesar"
                    >
                      <SocialIcon name={social.icon as SocialIconName} />
                    </a>
                  </li>
              ))}
              <li>
                <TrackedAnchor
                  href={whatsappUrl()}
                  target="_blank"
                  rel="noreferrer"
                  event={ANALYTICS_EVENTS.whatsappClick}
                  payload={{ location: "footer" }}
                  aria-label={`Chat with ${BRAND.name} on WhatsApp`}
                  className="flex size-10 items-center justify-center rounded-md border border-white/15 text-white/80 transition-colors hover:border-kesar hover:text-kesar"
                >
                  <MessageCircle aria-hidden className="size-4.5" />
                </TrackedAnchor>
              </li>
            </ul>
          </div>

          <FooterColumn title="Explore" links={FOOTER_NAV.explore} />
          <FooterColumn title="Resources" links={FOOTER_NAV.resources} />

          <div>
            <h3 className="text-small font-semibold uppercase text-white">
              Contact
            </h3>
            <address className="mt-4 space-y-3 text-small not-italic text-white/70">
              <p className="flex gap-2.5">
                <MapPin aria-hidden className="mt-0.5 size-4 shrink-0 text-kesar" />
                <span>{CONTACT.addressLines.join(", ")}</span>
              </p>
              <p className="flex gap-2.5">
                <Phone aria-hidden className="mt-0.5 size-4 shrink-0 text-kesar" />
                <TrackedAnchor
                  href={`tel:${CONTACT.phoneHref}`}
                  event={ANALYTICS_EVENTS.phoneClick}
                  payload={{ location: "footer" }}
                  className="transition-colors hover:text-kesar"
                >
                  {CONTACT.phoneDisplay}
                </TrackedAnchor>
              </p>
              <p className="flex gap-2.5">
                <Mail aria-hidden className="mt-0.5 size-4 shrink-0 text-kesar" />
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="transition-colors hover:text-kesar"
                >
                  {CONTACT.email}
                </a>
              </p>
            </address>
            <ul className="mt-6 space-y-2 text-small text-white/60">
              {CONTACT.openingHours.map((entry) => (
                <li key={entry.days}>
                  {entry.days}: {entry.hours}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-7 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-small text-white/55">
            © {BRAND.foundedYear} {BRAND.name}. All rights reserved.
          </p>
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {FOOTER_NAV.legal.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-small text-white/55 transition-colors hover:text-kesar"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </footer>
  );
}
