import {
  ClipboardList,
  FileCheck2,
  GraduationCap,
  Laptop,
  UserRoundCheck,
} from "lucide-react";

import { Container } from "@/components/ui/Container";

/**
 * Capability strip — deliberately non-numeric. No student counts or selection
 * figures are shown until vidyantIAS has verified numbers to publish.
 */
const PILLARS = [
  { icon: GraduationCap, label: "Expert Faculty" },
  { icon: UserRoundCheck, label: "Personal Mentorship" },
  { icon: ClipboardList, label: "Structured Testing" },
  { icon: FileCheck2, label: "Mains Answer Evaluation" },
  { icon: Laptop, label: "Hybrid Learning" },
];

export function TrustBar() {
  return (
    <section aria-label="What vidyantIAS provides" className="border-b border-line bg-paper">
      <Container size="wide">
        <ul className="grid grid-cols-2 gap-x-6 gap-y-4 py-6 sm:grid-cols-3 lg:grid-cols-5 lg:gap-x-8">
          {PILLARS.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-2.5">
              <Icon aria-hidden className="size-5 shrink-0 text-indigo" strokeWidth={1.75} />
              <span className="text-small font-bold text-indigo">{label}</span>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
