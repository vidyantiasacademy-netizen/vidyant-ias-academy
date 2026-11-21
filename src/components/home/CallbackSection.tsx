import Image from "next/image";

import { StageCallbackForm } from "@/components/forms/StageCallbackForm";
import { Container } from "@/components/ui/Container";

/**
 * Phones only (below `md`): a short callback form framed as a plan for the
 * student's attempt — a photograph header with one line over it, and the
 * form card rising over the photo's lower edge. Wider screens reach
 * counselling from the hero, the contact section and the closing CTA.
 */
export function CallbackSection() {
  return (
    <section id="callback" aria-labelledby="callback-heading" className="bg-white pb-10 md:hidden">
      <div className="relative h-52 overflow-hidden">
        {/* Lazy and phone-only, so it never competes with the hero image. */}
        <Image
          src="/images/hero-study-overlook.webp"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-[85%_40%]"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-linear-to-r from-indigo-900/85 via-indigo-900/40 to-indigo-900/0"
        />
        <p className="absolute top-6 left-4 max-w-[9ch] text-small leading-tight font-bold tracking-[0.08em] text-white uppercase sm:left-6">
          A more prepared India
          <span aria-hidden className="mt-2 block h-0.5 w-8 bg-kesar" />
        </p>
      </div>

      <Container className="relative z-10 -mt-16">
        <div className="rounded-2xl border border-line-strong border-t-4 border-t-kesar bg-white p-5">
          <h2 id="callback-heading" className="text-h2 leading-tight font-bold text-indigo">
            Get a clear plan for your attempt.
          </h2>
          <p className="mt-2 text-body text-ink-secondary">
            A free, no-obligation conversation with our academic team.
          </p>
          <div className="mt-5">
            <StageCallbackForm />
          </div>
        </div>
      </Container>
    </section>
  );
}
