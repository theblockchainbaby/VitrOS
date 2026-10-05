import { Badge } from "@/components/ui/badge";
import { VESSEL_STATUS_LABELS, HEALTH_STATUS_LABELS, STAGE_LABELS } from "@/lib/constants";
import { STAGE_COLORS } from "@/lib/design-tokens";

const healthStyles: Record<string, string> = {
  healthy: "bg-primary/8 text-primary border-primary/15",
  stable: "bg-muted text-foreground/80 border-border",
  critical: "bg-destructive/10 text-destructive border-destructive/20",
  slow_growth: "bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/20",
  necrotic: "bg-destructive/10 text-destructive border-destructive/20",
  vitrified: "bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/20",
  dead: "bg-destructive/10 text-destructive border-destructive/20",
};
export function StatusBadge({ status }: { status: string }) {
  return <Badge variant="outline" className={status === "ready_to_multiply" ? "bg-primary/8 text-primary border-primary/20" : "bg-muted/50 text-muted-foreground"}>{VESSEL_STATUS_LABELS[status] || status}</Badge>;
}
export function HealthBadge({ status }: { status: string }) {
  return <Badge variant="outline" className={healthStyles[status] || "bg-muted text-muted-foreground"}>{HEALTH_STATUS_LABELS[status] || status}</Badge>;
}
export function CultivarHealthBadge({ status }: { status: string }) {
  return <HealthBadge status={status} />;
}
export function StageBadge({ stage }: { stage: string }) {
  return <span className="inline-flex max-w-full items-center gap-1.5 rounded-md border bg-muted/40 px-2 py-1 text-xs font-medium text-foreground/80"><span aria-hidden="true" className="size-1.5 shrink-0 rounded-full" style={{ backgroundColor: STAGE_COLORS[stage] || "var(--muted-foreground)" }} />{STAGE_LABELS[stage] || stage}</span>;
}
