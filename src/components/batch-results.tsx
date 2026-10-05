import Link from "next/link";

export type BatchFailure = { barcode: string; error: string; id?: string };
export type BatchResult = { succeeded: number; total: number; failures: BatchFailure[] };

export function BatchResults({ result }: { result: BatchResult | null }) {
  if (!result) return null;
  return (
    <section aria-live="polite" aria-atomic="true" className="rounded-lg border bg-muted/40 p-4 space-y-2">
      <p className="font-medium text-sm">{result.succeeded} of {result.total} operations completed</p>
      {result.failures.length > 0 ? (
        <>
          <p className="text-sm text-muted-foreground">{result.failures.length} remaining in the queue. Review the errors, then retry the remaining records.</p>
          <ul className="space-y-1 text-sm">
            {result.failures.map((failure) => (
              <li key={failure.id || failure.barcode} className="break-words">
                {failure.id ? <Link className="font-mono underline underline-offset-4" href={`/vessels/${failure.id}`}>{failure.barcode}</Link> : <span className="font-mono">{failure.barcode}</span>}
                <span className="text-destructive"> — {failure.error}</span>
              </li>
            ))}
          </ul>
        </>
      ) : <p className="text-sm text-muted-foreground">The queue is complete. You can start another batch.</p>}
    </section>
  );
}
