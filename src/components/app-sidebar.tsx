"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  ScanBarcode,
  FlaskConical,
  Layers,
  Leaf,
  TestTubes,
  MapPin,
  Thermometer,
  Package,
  TrendingUp,
  BarChart3,
  FileText,
  ClipboardList,
  BookOpen,
  Tag,
  CreditCard,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  Users,
  GitBranch,
  ShoppingCart,
  Plug,
  CalendarClock,
  Trophy,
  MessageSquare,
} from "lucide-react";
import {
  Sidebar,
  useSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { USER_ROLE_LABELS } from "@/lib/constants";
import { PinSwitch } from "@/components/pin-switch";

const navGroups = [
  { label: "Workspace", items: [
    { href: "/", label: "Today", icon: LayoutDashboard },
    { href: "/scan", label: "Scan a vessel", icon: ScanBarcode },
    { href: "/tasks", label: "Daily tasks", icon: CalendarClock },
  ] },
  { label: "Cultures", items: [
    { href: "/vessels", label: "Vessels", icon: FlaskConical },
    { href: "/cultivars", label: "Cultivars", icon: Leaf },
    { href: "/clone-lines", label: "Clone lines", icon: GitBranch },
  ] },
  { label: "Lab operations", items: [
    { href: "/batch", label: "Batch operations", icon: Layers },
    { href: "/labels", label: "Labels", icon: Tag },
    { href: "/media", label: "Media", icon: TestTubes },
    { href: "/inventory", label: "Inventory", icon: Package },
    { href: "/locations", label: "Locations", icon: MapPin },
    { href: "/environment", label: "Environment", icon: Thermometer },
    { href: "/protocols", label: "Protocols", icon: BookOpen },
  ] },
  { label: "Planning & insights", items: [
    { href: "/demand-planning", label: "Demand planning", icon: ShoppingCart },
    { href: "/forecasting", label: "Forecasting", icon: TrendingUp },
    { href: "/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/team-performance", label: "Team performance", icon: Trophy },
    { href: "/reports", label: "Reports", icon: FileText },
    { href: "/activity", label: "Activity log", icon: ClipboardList },
    { href: "/assistant", label: "Lab assistant", icon: MessageSquare },
  ] },
  { label: "Settings", items: [
    { href: "/admin", label: "Workspace & team", icon: Settings },
    { href: "/integrations", label: "Connections & devices", icon: Plug },
    { href: "/admin/billing", label: "Billing", icon: CreditCard },
  ] },
];
const COLLAPSIBLE_GROUPS = new Set(["Lab operations", "Planning & insights", "Settings"]);
const matches = (path: string, href: string) => href === "/" || href === "/admin" ? path === href : path === href || path.startsWith(`${href}/`);

export function AppSidebar() {
  const pathname = usePathname();
  const { state, isMobile, setOpenMobile } = useSidebar();
  const { data: session } = useSession();
  const [pinSwitchOpen, setPinSwitchOpen] = useState(false);
  const [groupOverrides, setGroupOverrides] = useState<Record<string, boolean>>({});

  const user = session?.user;
  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";

  const isGroupVisible = (group: typeof navGroups[0]) =>
    groupOverrides[group.label] ?? (!COLLAPSIBLE_GROUPS.has(group.label) || group.items.some(item => matches(pathname, item.href)));
  const toggleGroup = (group: typeof navGroups[0]) => setGroupOverrides(previous => ({ ...previous, [group.label]: !isGroupVisible(group) }));

  return (
    <Sidebar collapsible="icon">
      <div className="px-4 py-5">
        <Link href="/" aria-label="VitrOS home" className="flex items-center gap-2.5 text-xl font-semibold tracking-tight">
          <Image src="/v-icon.png" alt="" width={32} height={32} className="size-8 object-contain" />
          <span className="group-data-[collapsible=icon]:hidden">Vitr<span className="text-primary">OS</span></span>
        </Link>
        <span className="mt-2 block truncate text-xs text-[var(--sidebar-muted-foreground)] group-data-[collapsible=icon]:hidden">
          {(user as Record<string, unknown> | undefined)?.organizationName as string || "Tissue culture workspace"}
        </span>
      </div>

      <SidebarContent>
        {navGroups.map((group) => {
          const isCollapsible = COLLAPSIBLE_GROUPS.has(group.label);
          const visible = state === "collapsed" || isGroupVisible(group);
          return (
            <SidebarGroup key={group.label}>
              {isCollapsible ? (
                <SidebarGroupLabel
                  asChild
                >
                  <button type="button" onClick={() => toggleGroup(group)} aria-expanded={visible} aria-controls={`nav-${group.label.replaceAll(" ", "-")}`} className="w-full cursor-pointer select-none text-[var(--sidebar-muted-foreground)]">
                    <ChevronRight className={`size-3 mr-1 transition-transform ${visible ? "rotate-90" : ""}`} />{group.label}
                  </button>
                </SidebarGroupLabel>
              ) : (
                <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
              )}
              {visible && (
                <SidebarGroupContent id={`nav-${group.label.replaceAll(" ", "-")}`}>
                  <SidebarMenu>
                    {group.items.map((item) => {
                      const isActive =
                        matches(pathname, item.href);
                      return (
                        <SidebarMenuItem key={item.href}>
                          <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
                            <Link href={item.href} onClick={() => { if (isMobile) setOpenMobile(false); }} aria-current={isActive ? "page" : undefined}>
                              <item.icon className="size-4" />
                              <span>{item.label}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              )}
            </SidebarGroup>
          );
        })}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/20 text-primary text-xs">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user?.name || "Not signed in"}</span>
                    <span className="truncate text-xs text-[var(--sidebar-muted-foreground)]">
                      {user?.role ? USER_ROLE_LABELS[user.role] || user.role : ""}
                    </span>
                  </div>
                  <ChevronDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56"
                side="top"
                align="start"
                sideOffset={4}
              >
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-[var(--sidebar-muted-foreground)]">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/admin">
                    <Settings className="mr-2 size-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setPinSwitchOpen(true)}>
                  <Users className="mr-2 size-4" />
                  Quick Switch (PIN)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/login" })}>
                  <LogOut className="mr-2 size-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <PinSwitch open={pinSwitchOpen} onOpenChange={setPinSwitchOpen} />
    </Sidebar>
  );
}
