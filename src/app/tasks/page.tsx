"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { StageBadge, HealthBadge } from "@/components/status-badge";
import { PageError, PageLoading } from "@/components/page-state";
import { loadTaskData } from "@/lib/workspace-data";
import {
  AlertTriangle, Clock, FlaskConical, ArrowRight, CheckCircle2,
  Package, CalendarClock, Scissors,
} from "lucide-react";
import type { DashboardStats } from "@/lib/types";

interface SubcultureVessel {
  id: string;
  barcode: string;
  stage: string;
  healthStatus: string;
  explantCount: number;
  nextSubcultureDate: string;
  cultivar: { name: string } | null;
  location: { name: string } | null;
}

interface InventoryAlert {
  id: string;
  name: string;
  currentStock: number;
  reorderLevel: number;
  unit: string;
  category: string;
}

export default function TasksPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [overdueVessels, setOverdueVessels] = useState<SubcultureVessel[]>([]);
  const [todayVessels, setTodayVessels] = useState<SubcultureVessel[]>([]);
  const [weekVessels, setWeekVessels] = useState<SubcultureVessel[]>([]);
  const [lowInventory, setLowInventory] = useState<InventoryAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await loadTaskData();
      setStats(data.stats);
      setOverdueVessels(data.overdue as SubcultureVessel[]);
      setTodayVessels(data.today as SubcultureVessel[]);
      setWeekVessels(data.week as SubcultureVessel[]);
      setLowInventory((data.inventory as InventoryAlert[]).filter(item => item.currentStock <= item.reorderLevel));
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const totalUrgent = overdueVessels.length + todayVessels.length;
  const criticalCount = stats?.healthBreakdown?.find((health) => health.status === "critical")?.count || 0;

  const readyToMultiply = stats?.readyToMultiply || [];

  if (error) return <div className="space-y-6"><PageHeader title="Daily tasks" description="Subcultures, transfers and stock that need attention." /><PageError message="Task data is unavailable. No health or stock conclusions can be drawn until it loads." retry={loadData} /></div>;

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Daily Tasks" description="Overdue subcultures, transfers, and alerts" />
        <PageLoading label="Checking subcultures, vessel health and inventory…" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Daily Tasks"
        description="Overdue subcultures, transfers, and alerts"
      />

      {/* Priority summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className={totalUrgent > 0 ? "border-red-200 dark:border-red-900" : ""}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Scissors className="size-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Subcultures Due</p>
            </div>
            <p className={`text-2xl font-bold ${totalUrgent > 0 ? "text-red-500" : "text-primary"}`}>
              {totalUrgent > 0 ? totalUrgent : "None"}
            </p>
            {overdueVessels.length > 0 && (
              <p className="text-xs text-red-500 mt-1">{overdueVessels.length} overdue</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <FlaskConical className="size-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Ready to Multiply</p>
            </div>
            <p className="text-2xl font-bold">{readyToMultiply.length}</p>
          </CardContent>
        </Card>
        <Card className={criticalCount > 0 ? "border-amber-200 dark:border-amber-900" : ""}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="size-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Critical vessels</p>
            </div>
            <p className={`text-2xl font-bold ${criticalCount > 0 ? "text-amber-500" : "text-primary"}`}>
              {criticalCount.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card className={lowInventory.length > 0 ? "border-amber-200 dark:border-amber-900" : ""}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Package className="size-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Low Stock Items</p>
            </div>
            <p className={`text-2xl font-bold ${lowInventory.length > 0 ? "text-amber-500" : "text-primary"}`}>
              {lowInventory.length > 0 ? lowInventory.length : "None"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Overdue subcultures - URGENT */}
      {overdueVessels.length > 0 && (
        <Card className="border-red-200 dark:border-red-900">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-red-600">
              <AlertTriangle className="size-4" />
              Overdue Subcultures ({overdueVessels.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {overdueVessels.slice(0, expanded.overdue ? undefined : 20).map((v) => (
                <Link key={v.id} href={`/vessels/${v.id}`} className="block">
                  <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-3 py-3 rounded-lg bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors">
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                      <span className="font-mono text-sm font-medium [overflow-wrap:anywhere]">{v.barcode}</span>
                      <span className="text-sm">{v.cultivar?.name || "Unassigned cultivar"}</span>
                      <StageBadge stage={v.stage} />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-red-600">
                      <Clock className="size-3" />
                      Due {new Date(v.nextSubcultureDate).toLocaleDateString()}
                    </div>
                  </div>
                </Link>
              ))}
              {overdueVessels.length > 20 && (
                <Button variant="ghost" onClick={() => setExpanded(value => ({ ...value, overdue: !value.overdue }))}>{expanded.overdue ? "Show fewer" : `Show all ${overdueVessels.length} overdue vessels`}</Button>
              )}
            </div>
            <div className="mt-3">
              <Button asChild size="sm" variant="destructive">
                <Link href="/batch">Open batch workbench</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Today's subcultures */}
      {todayVessels.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarClock className="size-4 text-amber-500" />
              Due Today ({todayVessels.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {todayVessels.map((v) => (
                <Link key={v.id} href={`/vessels/${v.id}`} className="block">
                  <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-3 py-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 hover:bg-amber-100 dark:hover:bg-amber-950/40 transition-colors">
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                      <span className="font-mono text-sm font-medium [overflow-wrap:anywhere]">{v.barcode}</span>
                      <span className="text-sm">{v.cultivar?.name || "Unassigned cultivar"}</span>
                      <StageBadge stage={v.stage} />
                    </div>
                    <div className="flex items-center gap-2">
                      <HealthBadge status={v.healthStatus} />
                      <span className="text-xs text-muted-foreground font-mono">{v.explantCount} explants</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-3">
              <Button asChild size="sm">
                <Link href="/batch">Open batch workbench</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* This week's subcultures */}
      {weekVessels.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="size-4 text-blue-500" />
              Coming This Week ({weekVessels.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {weekVessels.slice(0, expanded.week ? undefined : 10).map((v) => (
                <Link key={v.id} href={`/vessels/${v.id}`} className="block">
                  <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-3 py-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors">
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                      <span className="font-mono text-sm font-medium [overflow-wrap:anywhere]">{v.barcode}</span>
                      <span className="text-sm">{v.cultivar?.name || "Unassigned cultivar"}</span>
                      <StageBadge stage={v.stage} />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(v.nextSubcultureDate).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                    </span>
                  </div>
                </Link>
              ))}
              {weekVessels.length > 10 && (
                <Button variant="ghost" onClick={() => setExpanded(value => ({ ...value, week: !value.week }))}>{expanded.week ? "Show fewer" : `Show all ${weekVessels.length} vessels this week`}</Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ready to multiply */}
      {readyToMultiply.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FlaskConical className="size-4 text-primary" />
              Ready to Multiply ({readyToMultiply.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {readyToMultiply.map((v) => (
                <Link key={v.id} href={`/multiply/${v.id}`} className="block">
                  <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-3 py-3 rounded-lg bg-green-50 dark:bg-green-950/20 hover:bg-green-100 dark:hover:bg-green-950/40 transition-colors">
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                      <span className="font-mono text-sm font-medium [overflow-wrap:anywhere]">{v.barcode}</span>
                      <span className="text-sm">{v.cultivarName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-mono">{v.explantCount} explants</span>
                      <ArrowRight className="size-3 text-primary" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Low inventory */}
      {lowInventory.length > 0 && (
        <Card className="border-amber-200 dark:border-amber-900">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-amber-600">
              <Package className="size-4" />
              Low Inventory ({lowInventory.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowInventory.map((item) => (
                <Link key={item.id} href={`/inventory/${item.id}`} className="block">
                  <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-3 py-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 hover:bg-amber-100 dark:hover:bg-amber-950/40 transition-colors">
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                      <span className="text-sm font-medium">{item.name}</span>
                      <Badge variant="outline" className="text-xs">{item.category}</Badge>
                    </div>
                    <div className="text-sm">
                      <span className="font-mono text-red-500">{item.currentStock}</span>
                      <span className="text-muted-foreground"> / {item.reorderLevel} {item.unit}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All clear state */}
      {totalUrgent === 0 && overdueVessels.length === 0 && criticalCount === 0 && todayVessels.length === 0 && readyToMultiply.length === 0 && lowInventory.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle2 className="size-12 mx-auto mb-4 text-primary" />
            <h3 className="text-lg font-medium">All Clear</h3>
            <p className="text-muted-foreground mt-1">No overdue subcultures, critical vessels, ready-to-multiply vessels or low-stock items were returned. Review this week’s work before starting a new batch.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
