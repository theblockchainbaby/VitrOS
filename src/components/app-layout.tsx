"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts";
import { WelcomeModal } from "@/components/welcome-modal";
import { NotificationBell } from "@/components/notification-bell";
import { ThemeToggle } from "@/components/theme-toggle";
import { hasWorkspaceShell } from "@/lib/page-layout";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  if (!hasWorkspaceShell(pathname, status === "authenticated")) return <>{children}</>;
  const workspaceName = (session?.user as { organizationName?: string } | undefined)?.organizationName;
  return (
    <SidebarProvider>
      <a href="#workspace-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-3 focus:text-primary-foreground">Skip to content</a>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-3 border-b bg-background/95 px-4 backdrop-blur-sm md:px-7">
          <div className="flex min-w-0 items-center gap-3"><SidebarTrigger className="size-9 shrink-0" /><span className="h-4 border-l" /><Link href="/" className="truncate text-sm font-medium">{workspaceName || "Lab workspace"}</Link></div>
          <div className="flex shrink-0 items-center gap-1"><ThemeToggle /><NotificationBell /></div>
        </header>
        <div id="workspace-content" tabIndex={-1} className="workspace-content mx-auto w-full min-w-0 max-w-[1440px] flex-1 p-4 outline-none md:p-7 lg:p-8">
          {status === "authenticated" && pathname !== "/onboarding" && <WelcomeModal />}
          {status === "authenticated" && <KeyboardShortcuts />}
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
