import { STAGES, STAGE_LABELS } from "@/lib/constants";
import { STAGE_COLORS } from "@/lib/design-tokens";

export function StagePipeline({ currentStage, className }: { currentStage: string; className?: string }) {
  const currentIndex = STAGES.indexOf(currentStage as typeof STAGES[number]);
  return <ol aria-label="Culture lifecycle" className={`grid min-w-0 gap-2 sm:grid-cols-5 ${className || ""}`}>
    {STAGES.map((stage, index) => <li key={stage} aria-current={index === currentIndex ? "step" : undefined} className={`flex min-w-0 items-center gap-2 rounded-md border px-2.5 py-2 sm:flex-col sm:text-center ${index === currentIndex ? "border-primary/30 bg-primary/5 font-medium" : "border-transparent text-muted-foreground"}`}>
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full border bg-card text-xs" style={{ borderColor: index <= currentIndex ? STAGE_COLORS[stage] : undefined }} aria-label={index < currentIndex ? "Completed" : `Stage ${index + 1}`}>{index < currentIndex ? "✓" : index + 1}</span>
      <span className="min-w-0 text-xs [overflow-wrap:anywhere]">{STAGE_LABELS[stage]}</span>
    </li>)}
  </ol>;
}
