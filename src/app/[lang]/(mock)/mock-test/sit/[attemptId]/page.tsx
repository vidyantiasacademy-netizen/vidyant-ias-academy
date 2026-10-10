import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { MockRunner } from "@/components/mock-test/MockRunner";
import { ButtonLink } from "@/components/ui/Button";
import { BRAND, ROUTES } from "@/lib/constants/site";
import { isAppError } from "@/lib/errors";
import { readAttemptToken } from "@/lib/mock-test/access";
import { mockTestService } from "@/services/mock-tests/mock-test.service";

/**
 * A visitor's mock test sitting — instructions, then the paper.
 *
 * Outside the marketing layout on purpose, like the student exam route: no
 * header, no footer, no sticky call-to-action bar. Every link off this screen
 * is a way to abandon a timed paper.
 */
export const metadata: Metadata = {
  title: `Free mock test | ${BRAND.name}`,
  robots: { index: false, follow: false },
};

export default async function MockSittingPage({
  params,
}: PageProps<"/[lang]/mock-test/sit/[attemptId]">) {
  const { attemptId } = await params;

  let state;
  try {
    state = await mockTestService.open(attemptId, await readAttemptToken(attemptId));
  } catch (error) {
    if (isAppError(error)) return <Unavailable message={error.message} />;
    throw error;
  }

  if (state.stage === "finished") redirect(`/mock-test/result/${attemptId}`);

  return <MockRunner initial={state} />;
}

function Unavailable({ message }: { message: string }) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-paper p-6">
      <div className="w-full max-w-lg border border-line bg-white p-7 text-center sm:p-9">
        <h1 className="text-h3 font-bold">This paper cannot be opened here</h1>
        <p className="mt-3 text-body text-ink-secondary">{message}</p>
        <p className="mt-3 text-small text-ink-secondary">
          A sitting opens only in the browser it was started in. If you started on another
          device, register again there with the same mobile number to continue.
        </p>
        <div className="mt-7">
          <ButtonLink href={ROUTES.mockTest} variant="secondary">
            Back to the mock test
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
