import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ClipboardList, CheckCircle2, Truck, PackageCheck, AlertTriangle,
  ArrowRight, Search, Plus, User, MapPin, Calendar, Clock,
  Filter, Check, ArrowRightLeft,
} from "lucide-react";
import { PageHeader, Section, KpiCard, StatusBadge, TableSkeleton } from "@/components/app/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { caretakerTaskService, caretakerService } from "@/services";
import { humanizeError } from "@/services/api";
import { titleize } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_admin/services/caretaker")({
  head: () => ({
    meta: [
      { title: "Caretaker Tasks — Bashundhara R/A" },
      { name: "description", content: "Operational task queue for caretakers — pickups, returns, handovers, maintenance and resident requests." },
      { property: "og:title", content: "Caretaker Tasks — Bashundhara R/A" },
      { property: "og:description", content: "Operational task queue for caretakers — pickups, returns, handovers, maintenance and resident requests." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CaretakerTasksPage,
});

function CaretakerTasksPage() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: summary } = useQuery({ queryKey: ["caretaker-summary"], queryFn: () => caretakerService.summary() });
  const { data: tasks = [], isLoading } = useQuery({ queryKey: ["caretaker-tasks"], queryFn: () => caretakerTaskService.all() });

  const advance = useMutation({
    mutationFn: (v: { id: string; action: "accept" | "collect" | "handover" | "deliver" | "complete" }) =>
      caretakerService.advanceTask(v.id, v.action),
    onSuccess: (r) => {
      toast.success(`Task ${r.id} advanced!`, { description: `Action: ${r.action}` });
      void qc.invalidateQueries({ queryKey: ["caretaker-tasks"] });
      void qc.invalidateQueries({ queryKey: ["caretaker-summary"] });
    },
    onError: (e) => toast.error(humanizeError(e)),
  });

  const filteredTasks = tasks.filter((t) => {
    if (typeFilter !== "all" && t.type !== typeFilter) return false;
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q) ||
        t.flatId?.toLowerCase().includes(q) ||
        t.caretakerName?.toLowerCase().includes(q) ||
        t.buildingId?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <>
      <PageHeader
        title="Caretaker Operations & Tasks"
        description="Active queue for building staff — service pickups, provider handovers, inspections, and resident assistance."
        breadcrumb={["Services", "Caretaker Tasks"]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs font-semibold"
              onClick={() => void navigate({ to: "/caretaker/console" })}
            >
              <Truck className="size-3.5" /> Mobile Console
            </Button>
          </div>
        }
      />

      <div className="space-y-6 p-4 sm:p-6">
        {/* KPI Strip */}
        <div className="grid gap-3 grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/40">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">Pending Queue</span>
              <span className="grid size-7 place-items-center rounded-lg bg-amber-500/10 text-amber-600">
                <ClipboardList className="size-3.5" />
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold tabular-nums text-foreground">{summary?.pending ?? "18"}</p>
            <p className="mt-1 text-[11px] text-amber-600 font-medium">Awaiting staff pickup</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/40">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">In Progress</span>
              <span className="grid size-7 place-items-center rounded-lg bg-blue-500/10 text-blue-600">
                <Truck className="size-3.5" />
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold tabular-nums text-foreground">{summary?.inProgress ?? "10"}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">Active in building transit</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/40">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">Service Pickups</span>
              <span className="grid size-7 place-items-center rounded-lg bg-primary/10 text-primary">
                <PackageCheck className="size-3.5" />
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold tabular-nums text-foreground">{summary?.pickups ?? "8"}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">Gate handovers scheduled</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/40">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">Completed Today</span>
              <span className="grid size-7 place-items-center rounded-lg bg-emerald-500/10 text-emerald-600">
                <CheckCircle2 className="size-3.5" />
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold tabular-nums text-emerald-600">{summary?.completedToday ?? "6"}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">Verified with OTP / sign</p>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Search by task, flat, building, or caretaker…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 pl-9 text-xs"
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
              { id: "all", label: "All Types" },
              { id: "service_pickup", label: "Pickups" },
              { id: "service_return", label: "Returns" },
              { id: "maintenance", label: "Maintenance" },
              { id: "inspection", label: "Inspections" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setTypeFilter(tab.id)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-semibold transition-all shrink-0",
                  typeFilter === tab.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "border border-border bg-muted/30 text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {tab.label}
              </button>
            ))}

            <div className="h-4 w-px bg-border mx-1" />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-8.5 rounded-lg border border-border bg-background px-2.5 text-xs font-medium shrink-0"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Tasks Data Table */}
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          {isLoading ? (
            <TableSkeleton rows={6} cols={6} />
          ) : filteredTasks.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground">
              <ClipboardList className="size-8 mx-auto mb-2 text-muted-foreground/50" />
              No tasks found matching your filters
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border bg-muted/40 text-muted-foreground uppercase tracking-wider text-[10px] font-semibold">
                  <tr>
                    <th className="px-4 py-3">Task ID</th>
                    <th className="px-4 py-3">Task Details</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Location</th>
                    <th className="px-4 py-3">Assigned Caretaker</th>
                    <th className="px-4 py-3">Scheduled</th>
                    <th className="px-4 py-3">Priority</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredTasks.map((t) => (
                    <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-primary">{t.id}</td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-foreground block">{t.title}</span>
                        {t.orderId && <span className="text-[10px] text-muted-foreground font-mono">{t.orderId}</span>}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="text-[10px] capitalize font-medium">
                          {t.type.replace(/_/g, " ")}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground font-medium">
                        Flat {t.flatId} · {t.buildingId}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
                          <User className="size-3 text-primary" /> {t.caretakerName ?? "Unassigned"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground font-mono">
                        {t.scheduledAt ?? t.window ?? "Today"}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge value={t.priority} />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <StatusBadge value={t.status} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        {t.status === "pending" ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-[11px] px-2.5 font-semibold"
                            onClick={() => advance.mutate({ id: t.id, action: "accept" })}
                            disabled={advance.isPending}
                          >
                            Accept
                          </Button>
                        ) : t.status === "accepted" ? (
                          <Button
                            size="sm"
                            className="h-7 text-[11px] px-2.5 font-semibold bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={() => advance.mutate({ id: t.id, action: "collect" })}
                            disabled={advance.isPending}
                          >
                            Start
                          </Button>
                        ) : t.status === "in_progress" ? (
                          <Button
                            size="sm"
                            className="h-7 text-[11px] px-2.5 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                            onClick={() => advance.mutate({ id: t.id, action: "complete" })}
                            disabled={advance.isPending}
                          >
                            Complete
                          </Button>
                        ) : (
                          <span className="text-[11px] text-emerald-600 font-semibold">✓ Done</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
