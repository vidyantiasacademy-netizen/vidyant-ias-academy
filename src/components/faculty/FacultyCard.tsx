import { ArrowRight, GraduationCap } from "lucide-react";
import Image from "next/image";

import Link from "@/i18n/Link";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils/cn";
import type { Faculty } from "@/types";

interface FacultyCardProps {
  member: Faculty;
  /** Smaller photo, padding and type below `sm`, for homepage rails on phones. */
  compact?: boolean;
  className?: string;
}

export function FacultyCard({ member, compact = false, className }: FacultyCardProps) {
  return (
    <Card
      as="article"
      interactive
      padding="none"
      className={cn("flex h-full flex-col overflow-hidden", className)}
    >
      <div className={cn("relative aspect-4/5 w-full bg-paper", compact && "max-sm:aspect-square")}>
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
            className="absolute inset-0 flex items-center justify-center border-b border-line bg-paper-200"
          >
            <GraduationCap
              aria-hidden
              className="size-10 text-indigo/50"
            />
          </div>
        )}
        {member.isPlaceholder ? (
          <Badge tone="kesar" className={cn("absolute left-4 top-4", compact && "max-sm:left-3 max-sm:top-3")}>
            Profile pending
          </Badge>
        ) : null}
      </div>

      <div className={cn("flex flex-1 flex-col p-6", compact && "max-sm:p-4")}>
        <h3 className={cn("text-h4 font-bold", compact && "max-sm:text-body-lg")}>{member.name}</h3>
        <p className="mt-1.5 text-small font-medium uppercase tracking-[0.08em] text-kesar-600">
          {member.subject}
        </p>
        {member.experience ? (
          <p className="mt-3 text-small text-ink-secondary">{member.experience}</p>
        ) : null}
        {member.specialisations.length > 0 ? (
          <p className={cn("mt-4 text-small text-ink-secondary", compact && "max-sm:hidden")}>
            Specialises in:{" "}
            <span className="text-ink">{member.specialisations.join(" • ")}</span>
          </p>
        ) : null}
        <Link
          href={`/faculty/${member.slug}`}
          className={cn(
            "group mt-6 inline-flex items-center gap-2 text-small font-semibold text-indigo transition-colors hover:text-indigo-900 hover:underline underline-offset-4",
            compact && "max-sm:mt-4",
          )}
        >
          View Profile
          <ArrowRight
            aria-hidden
            className="size-4"
          />
        </Link>
      </div>
    </Card>
  );
}
