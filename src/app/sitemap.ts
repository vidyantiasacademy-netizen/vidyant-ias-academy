import type { MetadataRoute } from "next";

import { publishedBlogPosts } from "@/data/blog";
import { publishedCourses } from "@/data/courses";
import { publishedCurrentAffairs } from "@/data/current-affairs";
import { ROUTES, SITE_URL } from "@/lib/constants/site";
import { getFacultyRoster } from "@/lib/faculty/roster";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const faculty = await getFacultyRoster();

  const staticRoutes: Array<{
    path: string;
    priority: number;
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  }> = [
    { path: ROUTES.home, priority: 1, changeFrequency: "weekly" },
    { path: ROUTES.courses, priority: 0.9, changeFrequency: "weekly" },
    { path: ROUTES.enrol, priority: 0.9, changeFrequency: "weekly" },
    { path: ROUTES.counselling, priority: 0.9, changeFrequency: "monthly" },
    { path: ROUTES.brochure, priority: 0.8, changeFrequency: "monthly" },
    { path: ROUTES.demo, priority: 0.9, changeFrequency: "monthly" },
    { path: ROUTES.about, priority: 0.8, changeFrequency: "monthly" },
    { path: ROUTES.faculty, priority: 0.8, changeFrequency: "monthly" },
    { path: ROUTES.results, priority: 0.7, changeFrequency: "monthly" },
    { path: ROUTES.testimonials, priority: 0.6, changeFrequency: "monthly" },
    { path: ROUTES.resources, priority: 0.7, changeFrequency: "weekly" },
    { path: ROUTES.currentAffairs, priority: 0.7, changeFrequency: "daily" },
    { path: ROUTES.quizzes, priority: 0.7, changeFrequency: "weekly" },
    { path: ROUTES.blog, priority: 0.7, changeFrequency: "weekly" },
    { path: ROUTES.events, priority: 0.7, changeFrequency: "weekly" },
    { path: ROUTES.contact, priority: 0.7, changeFrequency: "monthly" },
    { path: ROUTES.faq, priority: 0.6, changeFrequency: "monthly" },
    { path: ROUTES.privacy, priority: 0.3, changeFrequency: "yearly" },
    { path: ROUTES.terms, priority: 0.3, changeFrequency: "yearly" },
    { path: ROUTES.refund, priority: 0.3, changeFrequency: "yearly" },
  ];

  return [
    ...staticRoutes.map((route) => ({
      url: new URL(route.path, SITE_URL).toString(),
      lastModified: now,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...publishedCourses.map((course) => ({
      url: new URL(`/courses/${course.slug}`, SITE_URL).toString(),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...faculty.map((member) => ({
      url: new URL(`/faculty/${member.slug}`, SITE_URL).toString(),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...publishedBlogPosts.map((post) => ({
      url: new URL(`/blog/${post.slug}`, SITE_URL).toString(),
      lastModified: new Date(post.publishedAt),
      changeFrequency: "yearly" as const,
      priority: 0.5,
    })),
    ...publishedCurrentAffairs.map((item) => ({
      url: new URL(`/current-affairs/${item.slug}`, SITE_URL).toString(),
      lastModified: new Date(item.publishedAt),
      changeFrequency: "yearly" as const,
      priority: 0.5,
    })),
  ];
}
