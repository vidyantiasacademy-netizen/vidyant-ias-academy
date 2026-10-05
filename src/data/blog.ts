import type { BlogPost } from "@/types";

/**
 * Blog articles. Empty until the editorial calendar begins — no sample article
 * is presented as published writing.
 *
 * TODO(content): publish the first posts, or connect a CMS to this data layer.
 */
export const blogPosts: BlogPost[] = [];

export const publishedBlogPosts = blogPosts.filter((post) => post.status === "published");

/** Editorial categories the blog will cover. Used for filters and preview copy. */
export const BLOG_CATEGORIES = [
  "Strategy",
  "Prelims",
  "Mains",
  "Optional",
  "Current Affairs",
  "Interview",
] as const;

export function blogPostBySlug(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}
