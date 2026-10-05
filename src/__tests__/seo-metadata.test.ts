import { beforeEach, describe, expect, it, vi } from "vitest";
import { metadata as rootMetadata } from "@/app/layout";
import { metadata as homeMetadata } from "@/app/page";
import { metadata as featuresMetadata } from "@/app/features/page";
import { metadata as pricingMetadata } from "@/app/pricing/page";
import { metadata as demoMetadata } from "@/app/demo/page";
import { metadata as whyMetadata } from "@/app/why-vitros/page";
import { metadata as blogMetadata } from "@/app/blog/page";
import { generateMetadata as articleMetadata } from "@/app/blog/[slug]/page";

const { getPostBySlug } = vi.hoisted(() => ({ getPostBySlug: vi.fn() }));

vi.mock("next/font/google", () => ({ Geist: () => ({}), Geist_Mono: () => ({}) }));
vi.mock("@/components/app-layout", () => ({ AppLayout: vi.fn() }));
vi.mock("@/components/home-page", () => ({ HomePage: vi.fn() }));
vi.mock("@/components/heartbeat-provider", () => ({ HeartbeatProvider: vi.fn() }));
vi.mock("@/components/public-site", () => ({ PublicPage: vi.fn(), ProductScreenshot: vi.fn() }));
vi.mock("@/sanity/queries", () => ({ getPostBySlug, getAllSlugs: vi.fn(), getAllPosts: vi.fn() }));
vi.mock("next/navigation", () => ({ notFound: () => { throw new Error("NEXT_HTTP_ERROR_FALLBACK;404"); } }));

beforeEach(() => {
  getPostBySlug.mockResolvedValue({
    title: "Keeping culture records",
    slug: "culture-records",
    excerpt: "A guide to vessel records.",
    author: "VitrOS Labs",
    publishedAt: "2026-10-01T00:00:00Z",
  });
});

describe("public and private page metadata", () => {
  it("does not let workspace routes inherit an indexable homepage canonical", () => {
    expect(rootMetadata.robots).toEqual({ index: false, follow: false });
    expect(rootMetadata.alternates?.canonical).toBeUndefined();
    expect(rootMetadata.openGraph).toBeUndefined();
  });

  it.each([
    ["/", homeMetadata],
    ["/features", featuresMetadata],
    ["/pricing", pricingMetadata],
    ["/demo", demoMetadata],
    ["/why-vitros", whyMetadata],
    ["/blog", blogMetadata],
  ] as const)("opts %s into indexing with its own canonical and social URL", (path, metadata) => {
    const expectedUrl = `https://vitroslabs.com${path}`;
    expect(metadata.robots).toEqual({ index: true, follow: true });
    expect(metadata.alternates?.canonical).toBe(expectedUrl);
    expect(metadata.openGraph).toMatchObject({ url: expectedUrl, title: metadata.title });
    expect(metadata.twitter).toMatchObject({ title: metadata.title, card: "summary_large_image" });
    expect(metadata.openGraph?.images).toBeTruthy();
  });

  it("gives a published article its own canonical and article metadata", async () => {
    const metadata = await articleMetadata({ params: Promise.resolve({ slug: "culture-records" }) });
    expect(metadata.alternates?.canonical).toBe("https://vitroslabs.com/blog/culture-records");
    expect(metadata.robots).toEqual({ index: true, follow: true });
    expect(metadata.openGraph).toMatchObject({
      type: "article",
      publishedTime: "2026-10-01T00:00:00Z",
    });
  });

  it("marks a CMS outage unavailable without turning it into a missing article", async () => {
    getPostBySlug.mockRejectedValue(new Error("Content service is unavailable"));
    const metadata = await articleMetadata({ params: Promise.resolve({ slug: "culture-records" }) });
    expect(metadata.title).toBe("Article unavailable | VitrOS");
    expect(metadata.robots).toMatchObject({ index: false });
    expect(metadata.alternates?.canonical).toBeUndefined();
  });

  it("returns the missing-page state only when the CMS confirms no article exists", async () => {
    getPostBySlug.mockResolvedValue(null);
    await expect(articleMetadata({ params: Promise.resolve({ slug: "missing" }) }))
      .rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;404");
  });
});
