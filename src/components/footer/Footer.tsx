import { Mail, MapPin, Phone } from "lucide-react";

import Link from "@/i18n/Link";
import { Container } from "@/components/ui/Container";
import { GeoRule } from "@/components/ui/Geometry";
import { SocialIcon, type SocialIconName } from "@/components/ui/SocialIcon";
import { Logo } from "@/components/ui/Logo";
import { TrackedAnchor } from "@/components/ui/TrackedLink";
import { format, type Dictionary } from "@/i18n/dictionaries";
import { getDictionary } from "@/i18n/server";
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
  nav,
  className,
}: {
  title: string;
  links: readonly { key: keyof Dictionary["nav"]; href: string }[];
  nav: Dictionary["nav"];
  className?: string;
}) {
  return (
    <div className={className}>
      <h3 className="border-t-2 border-kesar pt-3 text-small font-bold uppercase tracking-[0.08em] text-white">
        {title}
      </h3>
      <ul className="mt-4 space-y-3">
        {links.map((link) => (
          <li key={`${title}-${link.href}`}>
            <Link
              href={link.href}
              className="text-small text-white/80 transition-colors hover:text-kesar"
            >
              {nav[link.key]}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export async function Footer() {
  const dict = await getDictionary();

  return (
    <footer className="relative overflow-hidden bg-indigo-900 text-white focus-invert">
      <GeoRule />
      <Container size="wide" className="relative py-14 lg:py-20">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-12 lg:gap-x-8">
          <div className="sm:col-span-2 lg:col-span-4">
            <Logo tone="light" size="md" asStatic withTagline />
            <p className="mt-5 max-w-xs text-small text-white/80">{BRAND.tagline}</p>
            <ul className="mt-7 flex items-center gap-3">
              {SOCIAL_LINKS.map((social) => (
                  <li key={social.label}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={format(dict.footer.social, { network: social.label })}
                      className="flex size-10 items-center justify-center border-2 border-white/25 bg-white transition-colors hover:border-kesar"
                    >
                      <SocialIcon name={social.icon as SocialIconName} className="size-6" />
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
                  aria-label={dict.common.whatsappChat}
                  className="flex size-10 items-center justify-center border-2 border-white/25 bg-white transition-colors hover:border-kesar"
                >
                  <SocialIcon name="whatsapp" className="size-6" />
                </TrackedAnchor>
              </li>
            </ul>
          </div>

          <FooterColumn title={dict.footer.explore} links={FOOTER_NAV.explore} nav={dict.nav} className="lg:col-span-2 lg:col-start-6" />
          <FooterColumn title={dict.footer.resources} links={FOOTER_NAV.resources} nav={dict.nav} className="lg:col-span-2" />

          <div className="sm:col-span-2 lg:col-span-3">
            <h3 className="border-t-2 border-kesar pt-3 text-small font-bold uppercase tracking-[0.08em] text-white">
              {dict.footer.contact}
            </h3>
            <address className="mt-4 space-y-3 text-small not-italic text-white/80">
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
                  className="-my-3 inline-flex min-h-11 items-center transition-colors hover:text-kesar"
                >
                  {CONTACT.phoneDisplay}
                </TrackedAnchor>
              </p>
              <p className="flex gap-2.5">
                <Mail aria-hidden className="mt-0.5 size-4 shrink-0 text-kesar" />
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="-my-3 inline-flex min-h-11 items-center transition-colors hover:text-kesar"
                >
                  {CONTACT.email}
                </a>
              </p>
            </address>
            <ul className="mt-6 space-y-2 border-t border-white/15 pt-4 text-small text-white/75">
              {dict.footer.openingHours.map((entry) => (
                <li key={entry.days}>
                  {entry.days}: {entry.hours}
                </li>
              ))}
            </ul>
            <div className="mt-6 overflow-hidden border-2 border-white/20">
              <iframe
                title={`Map showing ${BRAND.name} in ${BRAND.city}`}
                src={CONTACT.mapsEmbedUrl}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="block h-48 w-full border-0"
              />
            </div>
            <a
              href={CONTACT.mapsDirectionsUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex min-h-11 items-center gap-2 text-small font-bold text-kesar transition-colors hover:text-white"
            >
              <MapPin aria-hidden className="size-4" />
              Get directions
            </a>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t-2 border-white/20 pt-7 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-small text-white/70">
            © {BRAND.foundedYear} {BRAND.name}. {dict.footer.rights}
          </p>
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {FOOTER_NAV.legal.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-small text-white/70 transition-colors hover:text-kesar"
                >
                  {dict.nav[link.key]}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </footer>
  );
}
