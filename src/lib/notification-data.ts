export interface WorkspaceNotification {
  id: string;
  type: string;
  severity: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export async function loadUnreadNotifications(signal?: AbortSignal): Promise<{ alerts: WorkspaceNotification[]; unreadCount: number }> {
  const response = await fetch("/api/alerts?unread=true", { signal });
  if (!response.ok) throw new Error("Notifications could not be loaded");
  const data = await response.json();
  if (!Array.isArray(data.alerts) || typeof data.unreadCount !== "number") throw new Error("Incomplete notification data");
  return data;
}

export async function markNotificationsRead(alertIds: string[]) {
  const response = await fetch("/api/alerts", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ alertIds, action: "read" }),
  });
  if (!response.ok) throw new Error("Notifications could not be marked read");
}
