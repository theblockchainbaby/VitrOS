"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Bell, Loader2 } from "lucide-react";
import { loadUnreadNotifications, markNotificationsRead, type WorkspaceNotification } from "@/lib/notification-data";

export function NotificationBell() {
  const [alerts, setAlerts] = useState<WorkspaceNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [updateError, setUpdateError] = useState(false);
  const [markingIds, setMarkingIds] = useState<string[]>([]);
  const activeRequest = useRef<AbortController | null>(null);
  const saving = useRef(false);

  const fetchAlerts = useCallback(async () => {
    if (saving.current) return;
    activeRequest.current?.abort();
    const controller = new AbortController();
    activeRequest.current = controller;
    setLoading(true);
    setLoadError(false);
    try {
      const data = await loadUnreadNotifications(controller.signal);
      if (controller.signal.aborted) return;
      setAlerts(data.alerts.slice(0, 5));
      setUnreadCount(data.unreadCount);
    } catch {
      if (!controller.signal.aborted) setLoadError(true);
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 60000);
    return () => {
      clearInterval(interval);
      activeRequest.current?.abort();
    };
  }, [fetchAlerts]);

  const markAsRead = async (ids: string[]) => {
    if (saving.current || ids.length === 0) return;
    activeRequest.current?.abort();
    saving.current = true;
    setLoading(false);
    setMarkingIds(ids);
    setUpdateError(false);
    try {
      await markNotificationsRead(ids);
      setAlerts(previous => previous.filter(alert => !ids.includes(alert.id)));
      setUnreadCount(previous => Math.max(0, previous - ids.length));
      saving.current = false;
      await fetchAlerts();
    } catch {
      setUpdateError(true);
    } finally {
      saving.current = false;
      setMarkingIds([]);
    }
  };

  const severityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "text-red-500";
      case "warning": return "text-amber-500";
      default: return "text-blue-500";
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label={loadError ? "Notifications, update unavailable" : unreadCount ? `Notifications, ${unreadCount} unread` : "Notifications"}>
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-w-[calc(100vw-2rem)]">
        <div className="px-3 py-2 flex flex-wrap items-center justify-between gap-1">
          <span className="text-sm font-medium">Notifications</span>
          {alerts.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-8"
              disabled={markingIds.length > 0 || loading}
              onClick={() => markAsRead(alerts.map((a) => a.id))}
            >
              {markingIds.length > 0 ? "Marking read…" : "Mark shown read"}
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        {loadError && <div role="alert" className="px-3 py-3 text-sm"><p>Notifications couldn’t be refreshed.{alerts.length > 0 ? " Shown notifications may be out of date." : ""}</p><Button variant="outline" size="sm" className="mt-2" onClick={fetchAlerts}>Try again</Button></div>}
        {updateError && <p role="alert" className="px-3 py-3 text-sm text-destructive">Couldn’t mark notifications read. Your selection is unchanged; try again.</p>}
        {loading && <p role="status" className="flex items-center gap-2 px-3 py-3 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" aria-hidden="true" />Loading notifications…</p>}
        {!loading && !loadError && alerts.length === 0 ? (
          <div className="px-3 py-4 text-sm text-muted-foreground text-center">
            No new notifications
          </div>
        ) : (
          alerts.map((alert) => (
            <DropdownMenuItem
              key={alert.id}
              className="flex flex-col items-start gap-1 px-3 py-2 cursor-pointer"
              disabled={markingIds.length > 0 || loading}
              onSelect={(event) => { event.preventDefault(); markAsRead([alert.id]); }}
            >
              <div className="flex items-center gap-2 w-full">
                <span className={`text-xs font-medium ${severityColor(alert.severity)}`}>
                  {alert.severity.toUpperCase()}
                </span>
                {!alert.isRead && <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />}
              </div>
              <p className="text-sm font-medium">{alert.title}</p>
              <p className="text-xs text-muted-foreground line-clamp-1">{alert.message}</p>
            </DropdownMenuItem>
          ))
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/notifications" className="text-center text-sm text-muted-foreground w-full justify-center">
            View all notifications
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
