import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Bell, ChevronsLeft, ChevronsRight, Globe, LogOut, Menu, Moon, Search, Shield, Siren, Sun, UserCog,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/i18n";
import { navForRole } from "./nav";
import { ROLE_LABELS } from "@/services/authService";
import { notificationService, searchService, emergencyService } from "@/services";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { StatusBadge } from "./primitives";

function SidebarNav({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  const { user } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const groups = navForRole(user?.role ?? "community_admin");

  return (
    <nav className="flex-1 space-y-4 overflow-y-auto px-2 py-3" aria-label="Main navigation">
      {groups.map((group) => (
        <div key={group.title}>
          {!collapsed ? (
            <p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/45">
              {group.title}
            </p>
          ) : null}
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
              const Icon = item.icon;
              return (
                <li key={item.to}>
                  <Link
                    to={item.to as never}
                    onClick={onNavigate}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      "flex items-center gap-2.5 rounded px-2 py-1.5 text-sm text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                      active && "bg-sidebar-accent font-medium text-sidebar-accent-foreground",
                      collapsed && "justify-center px-0",
                    )}
                  >
                    <Icon className={cn("size-4 shrink-0", active && "text-sidebar-primary")} />
                    {!collapsed ? <span className="truncate">{item.label}</span> : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function Brand({ collapsed }: { collapsed: boolean }) {
  const { t } = useI18n();
  return (
    <div className={cn("flex items-center gap-2.5 border-b border-sidebar-border px-3 py-3", collapsed && "justify-center px-0")}>
      <span className="grid size-8 shrink-0 place-items-center rounded bg-sidebar-primary text-sidebar-primary-foreground">
        <Shield className="size-4" />
      </span>
      {!collapsed ? (
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold text-sidebar-accent-foreground">{t.app.name}</span>
          <span className="block truncate text-[10px] uppercase tracking-wider text-sidebar-foreground/50">
            {t.app.tagline}
          </span>
        </span>
      ) : null}
    </div>
  );
}

function GlobalSearch() {
  const { t } = useI18n();
  const [term, setTerm] = useState("");
  const navigate = useNavigate();
  const { data = [] } = useQuery({
    queryKey: ["search", term],
    queryFn: () => searchService.global(term),
    enabled: term.trim().length > 1,
  });

  return (
    <div className="relative hidden max-w-md flex-1 md:block">
      <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        placeholder={t.common.searchPlaceholder}
        aria-label="Global search"
        className="h-9 pl-8"
      />
      {term.trim().length > 1 ? (
        <div className="absolute left-0 right-0 top-11 z-50 max-h-80 overflow-y-auto rounded-md border border-border bg-popover p-1 shadow-lg">
          {data.length === 0 ? (
            <p className="px-3 py-4 text-sm text-muted-foreground">No matches for “{term}”.</p>
          ) : (
            data.map((hit) => (
              <button
                key={`${hit.category}-${hit.id}`}
                type="button"
                className="flex w-full items-center justify-between gap-3 rounded px-3 py-2 text-left text-sm hover:bg-accent"
                onClick={() => {
                  setTerm("");
                  void navigate({ to: hit.to as never });
                }}
              >
                <span className="min-w-0">
                  <span className="block truncate font-medium">{hit.label}</span>
                  <span className="block truncate text-xs text-muted-foreground">{hit.meta}</span>
                </span>
                <span className="shrink-0 rounded border border-border px-1.5 py-0.5 text-[10px] uppercase text-muted-foreground">
                  {hit.category}
                </span>
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}

function useTheme() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const stored = window.localStorage.getItem("bra.theme") === "dark";
    setDark(stored);
    document.documentElement.classList.toggle("dark", stored);
  }, []);
  const toggle = () => {
    setDark((d) => {
      const next = !d;
      document.documentElement.classList.toggle("dark", next);
      window.localStorage.setItem("bra.theme", next ? "dark" : "light");
      return next;
    });
  };
  return { dark, toggle };
}

export function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const { locale, setLocale, t } = useI18n();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationService.all(),
  });
  const { data: emergencies = [] } = useQuery({
    queryKey: ["emergencies"],
    queryFn: () => emergencyService.all(),
  });
  const unread = notifications.filter((n) => !n.read).length;
  const active = emergencies.filter((e) => e.status !== "resolved").length;

  return (
    <div className="flex min-h-screen bg-background">
      <aside
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex",
          collapsed ? "w-16" : "w-64",
        )}
      >
        <Brand collapsed={collapsed} />
        <SidebarNav collapsed={collapsed} />
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className="flex items-center justify-center gap-2 border-t border-sidebar-border py-2 text-xs text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronsRight className="size-4" /> : <><ChevronsLeft className="size-4" /> Collapse</>}
        </button>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-14 items-center gap-2 border-b border-border bg-card px-3 sm:px-4">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 bg-sidebar p-0 text-sidebar-foreground">
              <SheetHeader className="sr-only">
                <SheetTitle>Navigation</SheetTitle>
              </SheetHeader>
              <Brand collapsed={false} />
              <SidebarNav collapsed={false} onNavigate={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>

          <GlobalSearch />

          <div className="ml-auto flex items-center gap-1.5">
            <Link
              to="/emergency"
              className={cn(
                "hidden items-center gap-1.5 rounded border px-2 py-1 text-xs font-medium sm:flex",
                active > 0
                  ? "border-destructive/40 bg-destructive/10 text-destructive"
                  : "border-border text-muted-foreground",
              )}
            >
              <Siren className="size-3.5" />
              {active > 0 ? `${active} active emergency` : "No active emergency"}
            </Link>

            <span className="hidden rounded border border-border px-2 py-1 text-xs text-muted-foreground xl:block">
              {t.app.community}
            </span>

            <Button
              variant="ghost"
              size="icon"
              aria-label={`Switch language, current ${locale === "en" ? "English" : "Bangla"}`}
              onClick={() => setLocale(locale === "en" ? "bn" : "en")}
            >
              <Globe className="size-4" />
              <span className="sr-only">{locale}</span>
            </Button>
            <Button variant="ghost" size="icon" aria-label="Toggle theme" onClick={toggle}>
              {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative" aria-label={`${unread} unread notifications`}>
                  <Bell className="size-4" />
                  {unread > 0 ? (
                    <span className="absolute right-1 top-1 grid size-4 place-items-center rounded-full bg-destructive text-[9px] font-semibold text-destructive-foreground">
                      {unread}
                    </span>
                  ) : null}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                  Notifications
                  <Link to="/notifications" className="text-xs font-normal text-primary hover:underline">
                    View all
                  </Link>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.slice(0, 6).map((n) => (
                  <DropdownMenuItem key={n.id} className="flex flex-col items-start gap-1">
                    <span className="flex w-full items-center justify-between gap-2">
                      <span className="truncate text-sm font-medium">{n.title}</span>
                      <StatusBadge value={n.severity} />
                    </span>
                    <span className="text-xs text-muted-foreground">{n.createdAt}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded border border-border px-2 py-1 text-left hover:bg-accent"
                >
                  <span className="grid size-7 place-items-center rounded bg-primary text-xs font-semibold text-primary-foreground">
                    {user?.avatarInitials}
                  </span>
                  <span className="hidden min-w-0 sm:block">
                    <span className="block truncate text-xs font-medium">{user?.name}</span>
                    <span className="block truncate text-[10px] text-muted-foreground">
                      {user ? ROLE_LABELS[user.role] : ""}
                    </span>
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>{user?.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => void navigate({ to: "/profile" })}>
                  <UserCog className="size-4" /> My profile
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => void navigate({ to: "/resident/dashboard" })}>
                  <Shield className="size-4" /> Resident portal
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onSelect={async () => {
                    await logout();
                    void navigate({ to: "/login", replace: true });
                  }}
                >
                  <LogOut className="size-4" /> {t.common.signOut}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}