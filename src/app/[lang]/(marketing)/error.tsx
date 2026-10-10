"use client";

import { RefreshCw, TriangleAlert } from "lucide-react";
import { useEffect } from "react";

import { Button, ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { ROUTES } from "@/lib/constants/site";

export default function GlobalRouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surfaced in server logs / error reporting once a provider is wired up.
    console.error(error);
  }, [error]);

  return (
    <Container className="flex flex-col items-start py-20 sm:py-28">
      <span className="flex size-12 items-center justify-center border-2 border-indigo bg-white text-indigo">
        <TriangleAlert aria-hidden className="size-6" />
      </span>
      <h1 className="mt-7 text-h1 font-bold">Something went wrong.</h1>
      <p className="mt-4 max-w-xl text-body text-ink-secondary sm:text-body-lg">
        The page could not be loaded. Please try again — if it keeps happening, call the
        centre and we will help you directly.
      </p>
      <div className="mt-9 flex flex-col gap-3 sm:flex-row">
        <Button onClick={reset} size="lg">
          <RefreshCw aria-hidden className="size-4.5" />
          Try again
        </Button>
        <ButtonLink href={ROUTES.contact} variant="secondary" size="lg">
          Contact the centre
        </ButtonLink>
      </div>
    </Container>
  );
}
