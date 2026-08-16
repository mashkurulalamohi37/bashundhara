import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Siren, PhoneCall, ShieldAlert, CheckCircle2, Search, RefreshCw,
  Clock, MapPin, AlertTriangle, Users, HeartPulse, Flame, ArrowRight,
} from "lucide-react";
import { PageHeader, StatusBadge } from "@/components/app/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { emergencyService } from "@/services";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_admin/emergency")({
  head: () => ({
    meta: [
      { title: "Emergency Response Command — Bashundhara R/A Security" },
      { name: "description", content: "Active panic alerts, dispatched teams and response times." },
      { property: "og:title", content: "Emergency Response Command — Bashundhara R/A Security" },
      { property: "og:description", content: "Active panic alerts, dispatched teams and response times." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: EmergencyResponsePage,
});

function EmergencyResponsePage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [localStatuses, setLocalStatuses] = useState<Record<string, string>>({});

  const { data: emergencies = [], isLoading, refetch } = useQuery({
    queryKey: ["emergencies"],
    queryFn: () => emergencyService.all(),
  });

  const handleDispatch = (id: string, type: string, location: string) => {
    setLocalStatuses((prev) => ({ ...prev, [id]: "in_progress" }));
    toast.success(`Quick Response Team Dispatched to ${location}`, {
      description: `ETA: 3 mins · Sirens enabled. Medical officer on route.`,
    });
  };

  const handleResolve = (id: string) => {
    setLocalStatuses((prev) => ({ ...prev, [id]: "resolved" }));
    toast.success(`Emergency Alert ${id} Resolved`, {
      description: "Incident documented and closed in emergency log.",
    });
  };

  const filteredEmergencies = emergencies.filter((e) => {
    const currentStatus = localStatuses[e.id] ?? e.status;
    if (statusFilter !== "all" && currentStatus !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        e.id.toLowerCase().includes(q) ||
        e.type.toLowerCase().includes(q) ||
        e.resident?.toLowerCase().includes(q) ||
        e.location?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const activeCount = emergencies.filter((e) => (localStatuses[e.id] ?? e.status) === "active" || (localStatuses[e.id] ?? e.status) === "open").length;

  return (
    <>
      <PageHeader
        title="Emergency Operations & Crisis Response Command"
        description="Immediate response coordination for resident panic buttons, fire alarms, medical distress, and perimeter intrusion triggers."
        breadcrumb={["Security", "Emergency"]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              className="text-xs font-semibold gap-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-xs"
              onClick={() => toast.error("Community Sirens Activated", { description: "Broadcast sent to all block security towers." })}
            >
              <Siren className="size-3.5 animate-pulse" /> Activate Sirens
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs font-semibold gap-1.5 rounded-xl"
              onClick={() => void refetch()}
            >
              <RefreshCw className="size-3.5" /> Sync Alerts
            </Button>
          </div>
        }
      />

      <div className="space-y-6 p-4 sm:p-6">
        {/* Active Emergency Alert Flash Banner */}
        {activeCount > 0 && (
          <div className="relative overflow-hidden rounded-2xl border border-red-500/40 bg-red-500/10 p-4 sm:p-5 shadow-sm text-foreground animate-pulse">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-xl bg-red-600 text-white font-bold shrink-0">
                  <Siren className="size-5" />
                </div>
                <div>
                  <h3 className="font-bold text-red-600 dark:text-red-400 text-sm sm:text-base">
                    {activeCount} Active Emergency Alert{activeCount > 1 ? "s" : ""} Requiring Response
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Quick Response Patrols alerted. Maintain live radio communication on Channel 1.
                  </p>
                </div>
              </div>

              <Button
                size="sm"
                className="h-8.5 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl gap-1.5"
                onClick={() => toast.success("All 4 Quick Response Teams placed on maximum alert")}
              >
                <PhoneCall className="size-3.5" /> Dispatch All QRTs
              </Button>
            </div>
          </div>
        )}

        {/* KPI Strip */}
        <div className="grid gap-3 grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/40">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">Active Alerts</span>
              <span className="grid size-7 place-items-center rounded-lg bg-red-500/10 text-red-600">
                <Siren className="size-3.5" />
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold tabular-nums text-red-600">{activeCount}</p>
            <p className="mt-1 text-[11px] text-red-600 font-medium">Awaiting final resolution</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/40">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">Avg Response Time</span>
              <span className="grid size-7 place-items-center rounded-lg bg-emerald-500/10 text-emerald-600">
                <Clock className="size-3.5" />
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold tabular-nums text-emerald-600">3.8 mins</p>
            <p className="mt-1 text-[11px] text-emerald-600 font-medium">Under 5-min SLA threshold</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/40">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">Active QRT Units</span>
              <span className="grid size-7 place-items-center rounded-lg bg-blue-500/10 text-blue-600">
                <Users className="size-3.5" />
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold tabular-nums text-foreground">4 Teams</p>
            <p className="mt-1 text-[11px] text-muted-foreground">Patrol vehicle + paramedic</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/40">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">Resolved Total</span>
              <span className="grid size-7 place-items-center rounded-lg bg-primary/10 text-primary">
                <CheckCircle2 className="size-3.5" />
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold tabular-nums text-foreground">
              {emergencies.filter((e) => (localStatuses[e.id] ?? e.status) === "resolved").length || 38}
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">100% resolution rate</p>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Search alert ID, type, resident, or location…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 pl-9 text-xs rounded-xl"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-2.5 text-xs text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1 sm:pb-0">
            {[
              { id: "all", label: "All Alerts" },
              { id: "active", label: "Active" },
              { id: "in_progress", label: "In Progress" },
              { id: "resolved", label: "Resolved" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-semibold transition-all shrink-0",
                  statusFilter === tab.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "border border-border bg-muted/30 text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Emergency Log Table */}
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-xs text-muted-foreground">Loading emergency incidents…</div>
          ) : filteredEmergencies.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground">
              No emergency incidents found matching your filter
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border bg-muted/40 text-muted-foreground uppercase tracking-wider text-[10px] font-semibold">
                  <tr>
                    <th className="px-4 py-3">Alert ID</th>
                    <th className="px-4 py-3">Emergency Type</th>
                    <th className="px-4 py-3">Raised By</th>
                    <th className="px-4 py-3">Location</th>
                    <th className="px-4 py-3">Assigned Team</th>
                    <th className="px-4 py-3 text-center">Response Speed</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-right">Dispatch Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredEmergencies.map((e) => {
                    const status = localStatuses[e.id] ?? e.status;
                    return (
                      <tr key={e.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-mono font-bold text-red-600">{e.id}</td>
                        <td className="px-4 py-3 font-semibold text-foreground flex items-center gap-1.5">
                          {e.type?.toLowerCase().includes("fire") ? <Flame className="size-3.5 text-amber-600" /> :
                           e.type?.toLowerCase().includes("medical") ? <HeartPulse className="size-3.5 text-red-600" /> :
                           <AlertTriangle className="size-3.5 text-amber-600" />}
                          {e.type}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground font-medium">{e.resident}</td>
                        <td className="px-4 py-3 text-foreground font-medium flex items-center gap-1">
                          <MapPin className="size-3 text-primary shrink-0" />
                          {e.location}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground font-medium">{e.team ?? "QRT Unit 1"}</td>
                        <td className="px-4 py-3 text-center font-mono font-bold text-foreground">
                          {e.responseMins ?? "4"} mins
                        </td>
                        <td className="px-4 py-3 text-center">
                          <StatusBadge value={String(status)} />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {status === "resolved" ? (
                              <span className="text-[11px] text-muted-foreground font-medium">Closed</span>
                            ) : status === "in_progress" ? (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-[11px] px-2.5 font-semibold text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                                onClick={() => handleResolve(e.id)}
                              >
                                Mark Resolved
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                className="h-7 text-[11px] px-2.5 font-semibold bg-red-600 hover:bg-red-700 text-white"
                                onClick={() => handleDispatch(e.id, e.type, e.location)}
                              >
                                Dispatch Team
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
