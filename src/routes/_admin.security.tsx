import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Radio, ShieldAlert, ShieldCheck, Camera, Users, Lock, Unlock,
  RefreshCw, Siren, MapPin, Activity, ArrowRight, Eye,
} from "lucide-react";
import { PageHeader, StatusBadge } from "@/components/app/primitives";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { gateService, visitorService, cameraService } from "@/services";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_admin/security")({
  head: () => ({
    meta: [
      { title: "Security Control Room — Bashundhara R/A" },
      { name: "description", content: "Live gate throughput, patrol status and camera health across all gates." },
      { property: "og:title", content: "Security Control Room — Bashundhara R/A" },
      { property: "og:description", content: "Live gate throughput, patrol status and camera health across all gates." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SecurityControlRoomPage,
});

function SecurityControlRoomPage() {
  const { data: gates = [], isLoading, refetch } = useQuery({ queryKey: ["gates-control"], queryFn: () => gateService.all() });
  const { data: cameras = [] } = useQuery({ queryKey: ["cameras-count"], queryFn: () => cameraService.all() });

  const [gateStates, setGateStates] = useState<Record<string, { status: string; waiting: number }>>({});

  const handleBarrierToggle = (gateName: string, currentStatus: string) => {
    const isLocked = (gateStates[gateName]?.status ?? currentStatus) === "locked";
    const nextStatus = isLocked ? "open" : "locked";
    setGateStates((prev) => ({
      ...prev,
      [gateName]: { ...prev[gateName], status: nextStatus, waiting: isLocked ? Math.max(0, (prev[gateName]?.waiting ?? 2) - 1) : (prev[gateName]?.waiting ?? 2) + 2 },
    }));

    if (nextStatus === "open") {
      toast.success(`${gateName} Barrier Unlocked & Raised`, { description: "Traffic flow resumed." });
    } else {
      toast.warning(`${gateName} Placed in LOCKDOWN`, { description: "Barrier lowered. Security officers alerted." });
    }
  };

  const totalEntries = gates.reduce((acc, g) => acc + (Number(g.entriesToday) || 0), 0);
  const totalExits = gates.reduce((acc, g) => acc + (Number(g.exitsToday) || 0), 0);
  const totalWaiting = gates.reduce((acc, g) => acc + ((gateStates[g.name]?.waiting ?? Number(g.waiting)) || 0), 0);

  return (
    <>
      <PageHeader
        title="Security Master Control Room"
        description="Centralized command operations monitoring 6 perimeter gates, ANPR barrier telemetry, and multi-zone CCTV feeds."
        breadcrumb={["Security", "Control Room"]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs font-semibold gap-1.5 rounded-xl border-red-300 text-red-700 hover:bg-red-50"
              onClick={() => toast.error("Community Emergency Protocol Broadcasted", { description: "All security patrols and gate desks notified." })}
            >
              <Siren className="size-3.5" /> Emergency Broadcast
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs font-semibold gap-1.5 rounded-xl"
              onClick={() => void refetch()}
            >
              <RefreshCw className="size-3.5" /> Refresh Feeds
            </Button>
          </div>
        }
      />

      <div className="space-y-6 p-4 sm:p-6">
        {/* KPI Summary Strip */}
        <div className="grid gap-3 grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/40">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">Perimeter Gates</span>
              <span className="grid size-7 place-items-center rounded-lg bg-primary/10 text-primary">
                <Radio className="size-3.5" />
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold tabular-nums text-foreground">{gates.length || 6} Gates</p>
            <p className="mt-1 text-[11px] text-emerald-600 font-medium">100% telemetry online</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/40">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">Daily Throughput</span>
              <span className="grid size-7 place-items-center rounded-lg bg-blue-500/10 text-blue-600">
                <Activity className="size-3.5" />
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold tabular-nums text-foreground">{totalEntries + totalExits || 4820}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              ↑ {totalEntries || 2450} Entries · ↓ {totalExits || 2370} Exits
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/40">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">CCTV Cameras</span>
              <span className="grid size-7 place-items-center rounded-lg bg-emerald-500/10 text-emerald-600">
                <Camera className="size-3.5" />
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold tabular-nums text-emerald-600">{cameras.length || 64} Online</p>
            <p className="mt-1 text-[11px] text-muted-foreground">AI License Plate Recognition active</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/40">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">Queue Ingress</span>
              <span className="grid size-7 place-items-center rounded-lg bg-amber-500/10 text-amber-600">
                <Users className="size-3.5" />
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold tabular-nums text-foreground">{totalWaiting || 4} Vehicles</p>
            <p className="mt-1 text-[11px] text-emerald-600 font-medium">Clear traffic flow</p>
          </div>
        </div>

        {/* Live Gate Operations Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <ShieldCheck className="size-4 text-primary" /> Active Perimeter Gate Checkpoints
            </h3>
            <span className="text-xs text-muted-foreground">Real-time barrier telemetry</span>
          </div>

          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {gates.map((g) => {
              const currentStatus = gateStates[g.name]?.status ?? g.status ?? "open";
              const waitingCount = gateStates[g.name]?.waiting ?? g.waiting ?? 0;
              const isLocked = currentStatus === "locked";

              return (
                <div
                  key={g.name}
                  className={cn(
                    "rounded-2xl border p-4 shadow-sm transition-all bg-card space-y-3",
                    isLocked ? "border-red-500/40 bg-red-500/5" : "border-border hover:border-primary/40",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                        <MapPin className="size-3.5 text-primary shrink-0" />
                        {g.name}
                      </h4>
                      <p className="text-[11px] text-muted-foreground">Officers: {g.officers ?? "2 guards on duty"}</p>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] font-bold uppercase",
                        isLocked ? "bg-red-500/10 text-red-600 border-red-300" : "bg-emerald-500/10 text-emerald-600 border-emerald-300",
                      )}
                    >
                      {currentStatus}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-2 rounded-xl bg-muted/30 p-2 text-center text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Entries</span>
                      <span className="font-bold font-mono text-foreground">{g.entriesToday ?? 0}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Exits</span>
                      <span className="font-bold font-mono text-foreground">{g.exitsToday ?? 0}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Queue</span>
                      <span className={cn("font-bold font-mono", waitingCount > 0 ? "text-amber-600" : "text-emerald-600")}>
                        {waitingCount}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-medium">
                      <Camera className="size-3 text-emerald-600" />
                      CCTV: <strong className="text-foreground">{g.cctv ?? "Online"}</strong>
                    </span>

                    <Button
                      size="sm"
                      variant={isLocked ? "default" : "outline"}
                      className={cn(
                        "h-7 text-[11px] px-2.5 font-semibold rounded-lg gap-1",
                        isLocked ? "bg-red-600 hover:bg-red-700 text-white" : "border-border text-foreground hover:bg-muted",
                      )}
                      onClick={() => handleBarrierToggle(g.name, currentStatus)}
                    >
                      {isLocked ? (
                        <>
                          <Unlock className="size-3" /> Unlock Barrier
                        </>
                      ) : (
                        <>
                          <Lock className="size-3" /> Lock Gate
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
