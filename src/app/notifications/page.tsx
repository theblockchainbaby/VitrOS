"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { PageLoading, PageError } from "@/components/page-state";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/page-header";
import { ALERT_TYPES } from "@/lib/constants";
import { formatDistanceToNow } from "date-fns";

interface Alert {
  id: string;
  type: string;
  severity: string;
  title: string;
  message: string;
  entityType: string | null;
  entityId: string | null;
  isRead: boolean;
  isDismissed: boolean;
  createdAt: string;
}

const ALERT_TYPE_LABELS: Record<string, string> = {
  subculture_due: "Subculture Due",
  low_inventory: "Low Inventory",
  environment_out_of_range: "Environment Alert",
  contamination_spike: "Contamination Spike",
};

export default function NotificationsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("all");
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);

  const fetchAlerts = useCallback(() => {
    setLoading(true); setError("");
    const params = new URLSearchParams();
    if (typeFilter !== "all") params.set("type", typeFilter);
    fetch(`/api/alerts?${params}`)
      .then((r) => { if (!r.ok) throw new Error("Notifications could not be loaded."); return r.json(); })
      .then((data) => setAlerts(data.alerts || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [typeFilter]);

  useEffect(() => { fetchAlerts(); }, [fetchAlerts]);

  const updateAlerts = async (ids: string[], action: "read" | "dismiss") => {
    setUpdating(true);
    try {
      const response = await fetch("/api/alerts", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ alertIds: ids, action }) });
      if (!response.ok) throw new Error("Could not update notifications. Please try again.");
      fetchAlerts();
    } catch (err) { toast.error(err instanceof Error ? err.message : "Could not update notifications."); }
    finally { setUpdating(false); }
  };
  const markAsRead = (ids: string[]) => updateAlerts(ids, "read");
  const dismiss = (ids: string[]) => updateAlerts(ids, "dismiss");
  const recordLink = (alert: Alert) => {
    const routes: Record<string, string> = { vessel: "/vessels", inventory: "/inventory", location: "/locations", cultivar: "/cultivars", clone_line: "/clone-lines" };
    if (alert.entityId && alert.entityType && routes[alert.entityType]) return `${routes[alert.entityType]}/${encodeURIComponent(alert.entityId)}`;
    return alert.type === "environment_out_of_range" ? "/environment" : alert.type === "contamination_spike" ? "/analytics" : null;
  };

  const unreadCount = alerts.filter((a) => !a.isRead).length;

  const severityBadge = (severity: string) => {
    switch (severity) {
      case "critical": return <Badge variant="destructive">Critical</Badge>;
      case "warning": return <Badge className="bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200">Warning</Badge>;
      default: return <Badge variant="secondary">Info</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <PageHeader
        title="Notifications"
        description={loading ? "Loading notifications…" : error ? "Workspace alerts" : `${unreadCount} unread in this view · latest 100 alerts`}
        actions={
          <div className="flex flex-wrap gap-2">
            {unreadCount > 0 && (
              <Button
                disabled={updating}
                variant="outline"
                size="sm"
                onClick={() => markAsRead(alerts.filter((a) => !a.isRead).map((a) => a.id))}
              >
                Mark All Read
              </Button>
            )}
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-48" aria-label="Notification type"><SelectValue placeholder="Filter" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {ALERT_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>{ALERT_TYPE_LABELS[t] || t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
      />

      {loading ? (
        <PageLoading label="Loading notifications…" />
      ) : error ? (<PageError message={error} retry={fetchAlerts} />) : alerts.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            No notifications
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-4">
            <div className="space-y-0">
              {alerts.map((alert, i) => (
                <div key={alert.id}>
                  {i > 0 && <Separator className="my-3" />}
                  <div className={`flex flex-col sm:flex-row items-start gap-3 ${!alert.isRead ? "bg-accent/30 -mx-2 px-2 py-1 rounded-md" : ""}`}>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        {severityBadge(alert.severity)}
                        <span className="text-xs text-muted-foreground">
                          {ALERT_TYPE_LABELS[alert.type] || alert.type}
                        </span>
                        {!alert.isRead && <span className="h-2 w-2 rounded-full bg-blue-500" />}
                      </div>
                      <p className="text-sm font-medium">{alert.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{alert.message}</p>
                      {recordLink(alert) && <Link className="mt-2 inline-block text-sm font-medium text-primary hover:underline" href={recordLink(alert)!}>Open related record →</Link>}
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      {!alert.isRead && (
                        <Button disabled={updating} variant="ghost" size="sm" onClick={() => markAsRead([alert.id])}>
                          Read
                        </Button>
                      )}
                      <Button disabled={updating} variant="ghost" size="sm" onClick={() => dismiss([alert.id])}>
                        Dismiss
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
