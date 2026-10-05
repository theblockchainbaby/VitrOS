import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { getAllSlugs } from "@/sanity/queries";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const paths = ["/", "/features", "/pricing", "/demo", "/blog", "/why-vitros"];

  try {
    const slugs = await getAllSlugs();
    for (const slug of new Set(slugs)) {
      if (typeof slug === "string" && slug.trim()) {
        paths.push(`/blog/${encodeURIComponent(slug)}`);
      }
    }
  } catch {
    // CMS downtime must not hide the public site from the sitemap.
  }

  // Omit lastModified until a real content modification date is available.
  return paths.map((path) => ({ url: new URL(path, SITE_URL).toString() }));
}
