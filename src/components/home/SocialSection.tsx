import { ArrowUpRight, Play } from "lucide-react";

import { Section } from "@/components/layout/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { SocialIcon, type SocialIconName } from "@/components/ui/SocialIcon";
import { TrackedAnchor } from "@/components/ui/TrackedLink";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { BRAND, SOCIAL_LINKS, YOUTUBE } from "@/lib/constants/site";

const CHANNEL_CONTENT = [
  "Daily current affairs analysis",
  "Topic explainers from our faculty",
  "Answer writing walkthroughs",
  "Strategy sessions for each stage",
];

/**
 * YouTube and social integration.
 *
 * `YOUTUBE.featuredVideoIds` is empty until the channel has published videos,
 * so the block invites visitors to the channel rather than rendering dead
 * embeds. Add ids and the players appear with no other change.
 */
export function SocialSection() {
  const videoIds = YOUTUBE.featuredVideoIds.slice(0, 3);

  return (
    <Section tone="paper" id="social" containerSize="wide">
      <div className="grid gap-8 lg:grid-cols-12 lg:items-start lg:gap-12">
        <div className="border-t-2 border-indigo pt-5 lg:col-span-7">
          <Eyebrow>YouTube &amp; Social</Eyebrow>
          <h2 className="mt-4 text-h2 font-bold text-indigo lg:text-h2-lg">
            Watch a class before you ever speak to us.
          </h2>
          <p className="mt-5 max-w-xl text-body text-ink-secondary sm:text-body-lg">
            Our teaching is public. Current affairs analysis, subject explainers and answer writing
            sessions go up on YouTube, free, for anyone preparing — enrolled or not.
          </p>

          <ul className="mt-7 grid sm:grid-cols-2 sm:gap-x-8">
            {CHANNEL_CONTENT.map((item) => (
              <li
                key={item}
                className="flex gap-3 border-t border-line py-3 text-body text-ink-secondary"
              >
                <span aria-hidden className="mt-2.5 size-2 shrink-0 bg-chilli" />
                {item}
              </li>
            ))}
          </ul>

          <TrackedAnchor
            href={YOUTUBE.channelUrl}
            target="_blank"
            rel="noreferrer"
            event={ANALYTICS_EVENTS.socialClick}
            payload={{ network: "youtube", location: "home-social" }}
            className="mt-7 inline-flex h-13 items-center justify-center gap-2 bg-indigo px-6 text-body font-semibold text-white transition-colors hover:bg-indigo-900"
          >
            <Play aria-hidden className="size-4.5" />
            Subscribe on YouTube
          </TrackedAnchor>
        </div>

        <div className="lg:col-span-5">
          {videoIds.length > 0 ? (
            <ul className="grid gap-4">
              {videoIds.map((id) => (
                <li key={id} className="overflow-hidden border border-line">
                  <iframe
                    title={`${BRAND.name} on YouTube`}
                    src={`https://www.youtube-nocookie.com/embed/${id}`}
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                    className="aspect-video w-full border-0"
                  />
                </li>
              ))}
            </ul>
          ) : (
            <div className="border-2 border-indigo bg-white p-7">
              <span className="flex size-12 items-center justify-center bg-indigo text-white">
                <Play aria-hidden className="size-5" />
              </span>
              <h3 className="mt-5 text-h4 font-bold text-indigo">The channel is just starting</h3>
              <p className="mt-3 text-body text-ink-secondary">
                We would rather link you to an empty channel honestly than embed someone else&apos;s
                video here. Subscribe now and the first sessions reach you as they are published.
              </p>
              <p className="mt-5 text-small text-ink-secondary">{YOUTUBE.handle}</p>
            </div>
          )}

          <ul className="mt-5 grid gap-3 sm:grid-cols-3">
            {SOCIAL_LINKS.map((social) => (
              <li key={social.label}>
                <TrackedAnchor
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  event={ANALYTICS_EVENTS.socialClick}
                  payload={{
                    network: social.label.toLowerCase(),
                    location: "home-social",
                  }}
                  className="flex items-center justify-between gap-2 border border-line bg-white px-4 py-3 text-small font-medium text-indigo transition-colors hover:border-indigo"
                >
                  <span className="flex items-center gap-2.5">
                    <SocialIcon name={social.icon as SocialIconName} className="size-6" />
                    {social.label}
                  </span>
                  <ArrowUpRight aria-hidden className="size-4 shrink-0" />
                </TrackedAnchor>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
