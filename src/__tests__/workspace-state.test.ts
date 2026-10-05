import { afterEach, describe, expect, it, vi } from "vitest";
import { hasWorkspaceShell } from "@/lib/page-layout";
import { fetchWorkspaceJSON, loadTaskData } from "@/lib/workspace-data";

afterEach(() => vi.unstubAllGlobals());
describe("workspace boundaries", () => {
  it.each(["/login", "/signup", "/forgot-password", "/reset-password", "/blog", "/blog/a-guide", "/pricing", "/features", "/demo", "/why-vitros", "/offline", "/unsubscribed", "/studio"])('%s keeps public/account chrome even with a session', path => {
    expect(hasWorkspaceShell(path, false)).toBe(false);
    expect(hasWorkspaceShell(path, true)).toBe(false);
  });
  it("keeps the authenticated dashboard and billing in the workspace", () => {
    expect(hasWorkspaceShell("/", false)).toBe(false);
    expect(hasWorkspaceShell("/", true)).toBe(true);
    expect(hasWorkspaceShell("/admin/billing", true)).toBe(true);
  });
});
describe("operational data failures", () => {
  it("rejects a JSON HTTP error instead of treating it as empty data", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: "Unavailable" }), { status: 503 })));
    await expect(fetchWorkspaceJSON("/api/stats")).rejects.toThrow("503");
  });
  it("fails the task view if inventory is unavailable", async () => {
    vi.stubGlobal("fetch", vi.fn(async (url: string) => {
      if (url.includes("inventory")) return new Response("{}", { status: 500 });
      return Response.json(url === "/api/stats" ? { activeVessels: 4 } : []);
    }));
    await expect(loadTaskData()).rejects.toThrow("500");
  });
  it("rejects malformed successful responses instead of showing All Clear", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => Response.json({})));
    await expect(loadTaskData()).rejects.toThrow("Incomplete task data");
  });
  it("allows genuine zero results after every source succeeded", async () => {
    vi.stubGlobal("fetch", vi.fn(async (url: string) => Response.json(url === "/api/stats" ? { activeVessels: 0 } : [])));
    await expect(loadTaskData()).resolves.toMatchObject({ stats: { activeVessels: 0 }, overdue: [], today: [], week: [], inventory: [] });
  });
});
