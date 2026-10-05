import { ArrowRight, GraduationCap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils/cn";
import type { Faculty } from "@/types";

interface FacultyCardProps {
  member: Faculty;
  className?: string;
}

export function FacultyCard({ member, className }: FacultyCardProps) {
  return (
    <Card
      as="article"
      interactive
      padding="none"
      className={cn("flex h-full flex-col overflow-hidden", className)}
    >
      <div className="relative aspect-4/5 w-full bg-paper">
        {member.image ? (
          <Image
            src={member.image}
            alt={`${member.name}, ${member.subject} faculty at vidyantIAS`}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        ) : (
          <div
            role="img"
            aria-label={`Photograph pending for ${member.subject} faculty`}
            className="absolute inset-0 border-b border-line bg-[radial-gradient(110%_90%_at_20%_0%,#ffffff_0%,var(--color-paper-200)_70%)]"
          >
            <GraduationCap
              aria-hidden
              className="absolute left-1/2 top-1/2 size-10 -translate-x-1/2 -translate-y-1/2 text-kesar-600/60"
            />
          </div>
        )}
        {member.isPlaceholder ? (
          <Badge tone="kesar" className="absolute left-4 top-4">
            Profile pending
          </Badge>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-h4 font-semibold">{member.name}</h3>
        <p className="mt-1.5 text-small font-medium uppercase tracking-[0.08em] text-kesar-600">
          {member.subject}
        </p>
        {member.experience ? (
          <p className="mt-3 text-small text-ink-secondary">{member.experience}</p>
        ) : null}
        {member.specialisations.length > 0 ? (
          <p className="mt-4 text-small text-ink-secondary">
            Specialises in:{" "}
            <span className="text-ink">{member.specialisations.join(" • ")}</span>
          </p>
        ) : null}
        <Link
          href={`/faculty/${member.slug}`}
          className="group mt-6 inline-flex items-center gap-2 text-small font-semibold text-indigo transition-colors hover:text-kesar-600"
        >
          View Profile
          <ArrowRight
            aria-hidden
            className="size-4 transition-transform duration-200 ease-[var(--ease-brand)] group-hover:translate-x-1"
          />
        </Link>
      </div>
    </Card>
  );
}
