"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { PageLoading, PageError } from "@/components/page-state";
import { PageHeader } from "@/components/page-header";
import { ACTIVITY_TYPES } from "@/lib/constants";
import { exportToCSV, flattenActivityForExport } from "@/lib/csv-export";
import type { Activity } from "@/lib/types";
import { format } from "date-fns";

export default function ActivityPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("all");
  const [error, setError] = useState("");

  const loadActivities = useCallback(() => {
    const params = new URLSearchParams({ limit: "200" });
    if (typeFilter !== "all") params.set("type", typeFilter);

    fetch(`/api/activities?${params}`)
      .then((r) => { if (!r.ok) throw new Error("Activity could not be loaded."); return r.json(); })
      .then(setActivities)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [typeFilter]);
  useEffect(() => { loadActivities(); }, [loadActivities]);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <PageHeader
        title="Activity Log"
        description="Latest 200 matching operations in your workspace"
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              disabled={loading || !!error || activities.length === 0}
              variant="outline"
              size="sm"
              onClick={() => {
                const rows = activities.map((a) => flattenActivityForExport(a as unknown as Record<string, unknown>));
                exportToCSV(rows, "activity-export");
              }}
            >
              Export shown rows
            </Button>
            <Select value={typeFilter} onValueChange={(value) => { setLoading(true); setError(""); setTypeFilter(value); }}>
              <SelectTrigger className="w-full sm:w-48" aria-label="Activity type">
                <SelectValue placeholder="Filter type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {ACTIVITY_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
      />

      {loading ? (
        <PageLoading label="Loading activity…" />
      ) : error ? (<PageError message={error} retry={() => { setLoading(true); setError(""); loadActivities(); }} />) : activities.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            {typeFilter === "all" ? "No activity recorded yet" : "No matching activity in this view"}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-4">
            <div className="space-y-0">
              {activities.map((a, i) => (
                <div key={a.id}>
                  {i > 0 && <Separator className="my-3" />}
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium capitalize">{a.type.replace(/_/g, " ")}</span>
                        {a.vessel && (
                          <Link href={`/vessels/${a.vessel.id}`} className="font-mono text-sm text-primary hover:underline break-all">
                            {a.vessel.barcode}
                          </Link>
                        )}
                      </div>
                      {a.notes && <p className="text-sm text-muted-foreground mt-0.5">{a.notes}</p>}
                      {a.user && <p className="text-xs text-muted-foreground">by {a.user.name}</p>}
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {format(new Date(a.createdAt), "MMM d, h:mm a")}
                    </span>
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
