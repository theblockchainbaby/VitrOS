import { AlertCircle, Inbox, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PageLoading({ label = "Loading workspace data…" }: { label?: string }) {
  return <div role="status" className="rounded-xl border bg-card p-6 space-y-5">
    <p className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" aria-hidden="true" />{label}</p>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4" aria-hidden="true">{[0,1,2,3].map(i => <div key={i} className="h-20 rounded-md bg-muted motion-safe:animate-pulse" />)}</div>
  </div>;
}
export function PageError({ title = "We couldn’t load this view", message, retry }: { title?: string; message: string; retry: () => void }) {
  return <div role="alert" className="rounded-xl border border-destructive/30 bg-card p-6 sm:p-8">
    <AlertCircle className="size-5 text-destructive mb-3" aria-hidden="true" />
    <h2 className="font-semibold">{title}</h2><p className="mt-1 mb-4 text-sm text-muted-foreground">{message}</p>
    <Button variant="outline" onClick={retry}>Try again</Button>
  </div>;
}
export function PageEmpty({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return <div className="rounded-xl border border-dashed bg-card p-8 text-center"><Inbox className="size-6 mx-auto text-muted-foreground mb-3" aria-hidden="true" /><h2 className="font-semibold">{title}</h2><p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">{description}</p>{action && <div className="mt-4">{action}</div>}</div>;
}
