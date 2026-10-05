/** Lifecycle colors are categorical; operational health has its own semantic palette. */
export const STAGE_ORDER = ["initiation", "multiplication", "rooting", "acclimation", "hardening"];
export const STAGE_COLORS: Record<string, string> = Object.fromEntries(STAGE_ORDER.map((stage, index) => [stage, `var(--chart-${index + 1})`]));
export const HEALTH_COLORS: Record<string, string> = {
  healthy: "var(--status-success)", stable: "var(--status-neutral)",
  slow_growth: "var(--status-warning)", vitrified: "var(--status-warning)",
  critical: "var(--status-critical)", necrotic: "var(--status-critical)", dead: "var(--status-critical)",
};
