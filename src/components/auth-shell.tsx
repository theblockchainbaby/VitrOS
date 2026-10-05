import { PublicBrand } from "@/components/public-site";
import Link from "next/link";

export function AuthShell({ children, title, description }: { children: React.ReactNode; title: string; description?: string }) {
  return <main className="flex min-h-dvh flex-col bg-background px-4 py-8 sm:py-12">
    <div className="mx-auto w-full max-w-md"><PublicBrand /></div>
    <div className="mx-auto my-auto w-full max-w-md py-10">
      <div className="rounded-xl border bg-card p-6 sm:p-8">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>}
        <div className="mt-7">{children}</div>
      </div>
      <p className="mt-6 text-center text-xs text-muted-foreground">Need a hand? <a className="underline underline-offset-4" href="mailto:support@vitroslabs.com">Contact support</a></p>
    </div>
    <div className="mx-auto flex w-full max-w-md justify-between gap-4 text-xs text-muted-foreground"><Link href="/">Back to VitrOS</Link><span>Tissue culture, connected.</span></div>
  </main>;
}
