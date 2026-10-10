import { ArrowRight } from "lucide-react";

import Link from "@/i18n/Link";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils/cn";
import type { BlogPost } from "@/types";

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

export function BlogCard({ post, className }: { post: BlogPost; className?: string }) {
  return (
    <Card as="article" interactive className={cn("flex h-full flex-col", className)}>
      <Badge tone="neutral">{post.category}</Badge>
      <h3 className="mt-4 text-h4 font-bold">
        <Link href={`/blog/${post.slug}`} className="transition-colors hover:text-indigo">
          {post.title}
        </Link>
      </h3>
      <p className="mt-3 flex-1 text-small text-ink-secondary">{post.excerpt}</p>
      <p className="mt-6 text-small text-ink-muted">
        {post.author} • {formatDate(post.publishedAt)} • {post.readingTimeMinutes} min read
      </p>
      <Link
        href={`/blog/${post.slug}`}
        className="group mt-4 inline-flex items-center gap-2 text-small font-semibold text-indigo transition-colors hover:text-indigo-900 hover:underline underline-offset-4"
      >
        Read article
        <ArrowRight
          aria-hidden
          className="size-4"
        />
      </Link>
    </Card>
  );
}
