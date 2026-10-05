import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("public content availability", () => {
  it("allows importing queries without CMS configuration and reports unavailable content", async () => {
    vi.stubEnv("NEXT_PUBLIC_SANITY_PROJECT_ID", "");
    vi.stubEnv("NEXT_PUBLIC_SANITY_DATASET", "");
    const queries = await import("@/sanity/queries");
    await expect(queries.getAllPosts()).rejects.toThrow("Content service is unavailable");
    await expect(queries.getPostBySlug("example")).rejects.toThrow("Content service is unavailable");
    await expect(queries.getAllSlugs()).rejects.toThrow("Content service is unavailable");
  });
});
