import { PlayCircle, Quote } from "lucide-react";
import Image from "next/image";

import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils/cn";
import type { Testimonial } from "@/types";

export function TestimonialCard({
  testimonial,
  className,
}: {
  testimonial: Testimonial;
  className?: string;
}) {
  return (
    <Card as="figure" className={cn("flex h-full flex-col", className)}>
      <Quote aria-hidden className="size-7 text-kesar/70" />
      <blockquote className="mt-4 flex-1 text-body text-ink">
        {testimonial.quote}
      </blockquote>
      <figcaption className="mt-6 flex items-center gap-3 border-t border-line pt-5">
        {testimonial.image ? (
          <Image
            src={testimonial.image}
            alt={testimonial.name}
            width={44}
            height={44}
            className="size-11 rounded-full object-cover"
          />
        ) : (
          <span
            aria-hidden
            className="flex size-11 items-center justify-center rounded-full bg-paper text-small font-semibold text-indigo"
          >
            {testimonial.name.slice(0, 1)}
          </span>
        )}
        <span className="text-small">
          <span className="block font-semibold text-indigo">{testimonial.name}</span>
          <span className="text-ink-secondary">
            {testimonial.course} • {testimonial.year}
          </span>
        </span>
        {testimonial.videoUrl ? (
          <a
            href={testimonial.videoUrl}
            target="_blank"
            rel="noreferrer"
            className="ml-auto inline-flex items-center gap-1.5 text-small font-semibold text-indigo hover:text-kesar-600"
          >
            <PlayCircle aria-hidden className="size-4" />
            Watch
          </a>
        ) : null}
      </figcaption>
    </Card>
  );
}
