/** Never interpret a failed response as empty operational data. */
export async function fetchWorkspaceJSON<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`Request failed (${response.status})`);
  return response.json() as Promise<T>;
}
export async function loadTaskData() {
  const [stats, overdue, today, week, inventory] = await Promise.all([
    fetchWorkspaceJSON<import("@/lib/types").DashboardStats>("/api/stats"),
    fetchWorkspaceJSON<unknown[]>("/api/vessels/due-subculture?range=overdue"),
    fetchWorkspaceJSON<unknown[]>("/api/vessels/due-subculture?range=today"),
    fetchWorkspaceJSON<unknown[]>("/api/vessels/due-subculture?range=week"),
    fetchWorkspaceJSON<unknown[]>("/api/inventory?filter=low_stock"),
  ]);
  if (!stats || typeof stats.activeVessels !== "number" || ![overdue, today, week, inventory].every(Array.isArray)) throw new Error("Incomplete task data");
  return { stats, overdue, today, week, inventory };
}
