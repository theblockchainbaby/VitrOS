import { afterEach, describe, expect, it, vi } from "vitest";
import { loadUnreadNotifications, markNotificationsRead } from "@/lib/notification-data";

afterEach(() => vi.unstubAllGlobals());

describe("notification request outcomes", () => {
  it("does not interpret a failed request as no unread notifications", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: "Unavailable" }), { status: 503 })));
    await expect(loadUnreadNotifications()).rejects.toThrow();
  });

  it("rejects incomplete notification data", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ alerts: [] }))));
    await expect(loadUnreadNotifications()).rejects.toThrow();
  });

  it("keeps the full unread count alongside the returned notifications", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ alerts: [], unreadCount: 17 }))));
    await expect(loadUnreadNotifications()).resolves.toEqual({ alerts: [], unreadCount: 17 });
  });

  it("reports a failed mark-read update and sends only the selected IDs", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: "Denied" }), { status: 403 }));
    vi.stubGlobal("fetch", fetchMock);
    await expect(markNotificationsRead(["shown-1", "shown-2"])).rejects.toThrow();
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ alertIds: ["shown-1", "shown-2"], action: "read" });
  });
});
