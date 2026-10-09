
import { Section } from "@/components/layout/Section";
import { SignOutScreen } from "@/components/navigation/SignOutScreen";
import { pageMetadata } from "@/lib/seo/metadata";

/**
 * Sign-out, reachable from the public site's account menu.
 *
 * It is a page rather than a button in the header because a complete sign-out
 * needs the Firebase client SDK — clearing only the session cookie would leave
 * the browser's own auth state intact, and the next portal visit would silently
 * mint a fresh cookie from it. Keeping that chunk on this one route is what
 * lets every other marketing page stay free of it.
 */
export const generateMetadata = () => pageMetadata({
  title: "Signing out",
  description: "Signing you out of the vidyantIAS student platform.",
  path: "/signout",
  noIndex: true,
});

export default function SignOutPage() {
  return (
    <Section containerSize="narrow">
      <SignOutScreen />
    </Section>
  );
}
