import { useEffect } from "react";
import { Outlet, createFileRoute, useNavigate, Link, useRouterState } from "@tanstack/react-router";
import {
  Bell, Building2, CalendarDays, CreditCard, Home, LogOut, Megaphone, Siren, Sparkles,
  Store, Truck, UserCog, Users, Wrench, ClipboardList, ParkingSquare, LayoutGrid,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/resident")({
  ssr: false,
  component: ResidentLayout,
});

export const RESIDENT_NAV = [
  { to: "/resident/dashboard", label: "Home", icon: Home },
  { to: "/resident/community", label: "Community", icon: LayoutGrid },
  { to: "/resident/family", label: "Family", icon: Users },
  { to: "/resident/property", label: "My Property", icon: Building2 },
  { to: "/resident/visitors", label: "Visitors", icon: ClipboardList },
  { to: "/resident/vehicles", label: "Vehicles", icon: Truck },
  { to: "/resident/parking", label: "Parking", icon: ParkingSquare },
  { to: "/resident/services", label: "Services", icon: Sparkles },
  { to: "/resident/nearby", label: "Nearby", icon: Store },
  { to: "/resident/complaints", label: "Complaints", icon: Wrench },
  { to: "/resident/payments", label: "Payments", icon: CreditCard },
  { to: "/resident/bookings", label: "Bookings", icon: CalendarDays },
  { to: "/resident/announcements", label: "Announcements", icon: Megaphone },
  { to: "/resident/emergency", label: "Emergency", icon: Siren },
  { to: "/resident/profile", label: "Profile", icon: UserCog },
] as const;

const MOBILE_NAV = ["/resident/dashboard", "/resident/community", "/resident/services", "/resident/nearby", "/resident/profile"];

function ResidentLayout() {
  const { ready, isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (ready && !isAuthenticated) void navigate({ to: "/login", replace: true });
  }, [ready, isAuthenticated, navigate]);

  if (!ready || !isAuthenticated) {
    return (
      <div className="space-y-3 p-6">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border bg-card px-4 py-2.5">
        <Link to="/resident/dashboard" className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded bg-primary text-sm font-bold text-primary-foreground">BR</span>
          <span className="hidden text-sm font-semibold sm:block">Resident Portal</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link to="/resident/announcements" className="rounded p-2 hover:bg-accent" aria-label="Announcements">
            <Bell className="size-4" />
          </Link>
          <span className="hidden text-xs text-muted-foreground sm:block">{user?.name} · {user?.block}</span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              void logout().then(() => navigate({ to: "/login", replace: true }));
            }}
          >
            <LogOut className="size-4" /> Sign out
          </Button>
        </div>
      </header>

      <div className="flex">
        <aside className="hidden w-56 shrink-0 border-r border-border bg-sidebar p-2 lg:block">
          <nav className="space-y-0.5" aria-label="Resident navigation">
            {RESIDENT_NAV.map((i) => {
              const active = pathname === i.to;
              const Icon = i.icon;
              return (
                <Link
                  key={i.to}
                  to={i.to}
                  className={cn(
                    "flex items-center gap-2.5 rounded px-2 py-1.5 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    active && "bg-sidebar-accent font-medium text-sidebar-accent-foreground",
                  )}
                >
                  <Icon className="size-4" /> {i.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <main className="min-w-0 flex-1 pb-20 lg:pb-0">
          <Outlet />
        </main>
      </div>

      {/* Floating SOS Emergency Button */}
      {pathname !== "/resident/emergency" && (
        <Link
          to="/resident/emergency"
          className="fixed bottom-16 right-4 z-40 flex items-center gap-2 rounded-full bg-destructive px-4 py-3 font-bold text-white shadow-2xl transition-all hover:scale-105 hover:bg-destructive/90 animate-bounce lg:bottom-6 lg:right-6"
          aria-label="Trigger Emergency SOS"
        >
          <Siren className="size-5 animate-pulse" />
          <span className="text-xs tracking-wide uppercase">Emergency SOS</span>
        </Link>
      )}

      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-border bg-card lg:hidden" aria-label="Resident quick navigation">
        {RESIDENT_NAV.filter((i) => MOBILE_NAV.includes(i.to)).map((i) => {
          const Icon = i.icon;
          const active = pathname === i.to;
          return (
            <Link key={i.to} to={i.to} className={cn("flex flex-col items-center gap-0.5 py-2 text-[11px]", active ? "text-primary" : "text-muted-foreground")}>
              <Icon className="size-4" /> {i.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
