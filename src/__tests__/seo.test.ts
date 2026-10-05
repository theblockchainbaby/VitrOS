import { beforeEach, describe, expect, it, vi } from "vitest";
import sitemap from "@/app/sitemap";

const { getAllSlugs } = vi.hoisted(() => ({ getAllSlugs: vi.fn() }));

vi.mock("@/sanity/queries", () => ({ getAllSlugs }));

beforeEach(() => {
  getAllSlugs.mockResolvedValue(["tissue-culture-records"]);
});

describe("public search sitemap", () => {
  it("includes public articles and excludes account and workspace pages", async () => {
    const entries = await sitemap();
    const urls = entries.map(({ url }) => url);

    expect(urls).toContain("https://vitroslabs.com/blog/tissue-culture-records");
    expect(urls).not.toContain("https://vitroslabs.com/login");
    expect(urls).not.toContain("https://vitroslabs.com/signup");
    expect(urls).not.toContain("https://vitroslabs.com/vessels");
    expect(new Set(urls).size).toBe(urls.length);
  });

  it("keeps public routes available if the CMS cannot be reached", async () => {
    getAllSlugs.mockRejectedValue(new Error("Content service is unavailable"));
    const entries = await sitemap();

    expect(entries.map(({ url }) => url)).toContain("https://vitroslabs.com/features");
    expect(entries.every(({ url }) => new URL(url).origin === "https://vitroslabs.com")).toBe(true);
    expect(entries.every(({ lastModified }) => lastModified === undefined)).toBe(true);
  });

  it("skips missing slugs and encodes article paths without duplicates", async () => {
    getAllSlugs.mockResolvedValue([null, "", "one article", "one article", "nested/path"]);
    const entries = await sitemap();
    const articleUrls = entries.map(({ url }) => url).filter((url) => url.includes("/blog/"));

    expect(articleUrls).toEqual([
      "https://vitroslabs.com/blog/one%20article",
      "https://vitroslabs.com/blog/nested%2Fpath",
    ]);
  });
});
