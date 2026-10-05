"use client";

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: React.ReactNode }) {
  return <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
    <div className="min-w-0"><h1 className="text-[28px] font-semibold leading-tight tracking-tight sm:text-[30px] [overflow-wrap:anywhere]">{title}</h1>{description && <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p>}</div>
    {actions && <div className="flex min-w-0 max-w-full flex-wrap items-center gap-2 lg:justify-end [&>*]:max-w-full">{actions}</div>}
  </div>;
}
