/**
 * Live Operations Board — real-time request management using the ops store.
 * This page replaces the static dispatch page with a live Kanban-style board
 * that reads from and writes to the in-memory opsStore.
 */
import { useSyncExternalStore, useState, useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  Activity, AlertTriangle, CheckCircle2, ChevronDown, ChevronUp,
  Clock, Filter, Loader2, Package, Phone, RefreshCw,
  Search, Siren, Truck, User, Wrench, Zap, ArrowRight,
  MessageSquare, Camera, MapPin, Timer, Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { opsStore, getSnapshot, subscribe } from "@/services/opsStore";
import { cn } from "@/lib/utils";
import type { OpsRequest, OpsTask, RequestStatus, RequestType } from "@/types/ops";

export const Route = createFileRoute("/_admin/control/ops-board")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Live Ops Board — Bashundhara R/A" },
      { name: "description", content: "Real-time request management and task dispatching for the Bashundhara R/A community." },
    ],
  }),
  component: OpsBoard,
});

const STATUS_COLS: { status: RequestStatus; label: string; color: string }[] = [
  { status: "new", label: "New", color: "bg-slate-100 dark:bg-slate-800" },
  { status: "assigned", label: "Assigned", color: "bg-blue-50 dark:bg-blue-950/30" },
  { status: "accepted", label: "Accepted", color: "bg-indigo-50 dark:bg-indigo-950/30" },
  { status: "in_progress", label: "In Progress", color: "bg-amber-50 dark:bg-amber-950/30" },
  { status: "escalated", label: "Escalated", color: "bg-red-50 dark:bg-red-950/30" },
  { status: "completed", label: "Completed", color: "bg-emerald-50 dark:bg-emerald-950/30" },
];

const TYPE_ICON: Partial<Record<RequestType, typeof Activity>> = {
  service: Package,
  visitor: User,
  maintenance: Wrench,
  package: Package,
  caretaker: Truck,
  emergency: Siren,
  utility: Zap,
  domestic_worker: User,
  delivery: Truck,
  complaint: MessageSquare,
  construction: Wrench,
  facility: Activity,
  parking: Activity,
  other: Activity,
};

const PRIORITY_COLOR: Record<string, string> = {
  urgent: "text-red-600 bg-red-50 border-red-200",
  high: "text-orange-600 bg-orange-50 border-orange-200",
  normal: "text-blue-600 bg-blue-50 border-blue-200",
  low: "text-muted-foreground bg-muted border-border",
};

const STATUS_TRANSITIONS: Partial<Record<RequestStatus, RequestStatus[]>> = {
  new: ["assigned", "escalated"],
  assigned: ["accepted", "escalated"],
  accepted: ["in_progress", "escalated"],
  in_progress: ["completed", "escalated"],
  escalated: ["in_progress", "completed"],
};

function RequestCard({ request, tasks, onSelect }: {
  request: OpsRequest;
  tasks: OpsTask[];
  onSelect: () => void;
}) {
  const Icon = TYPE_ICON[request.type] ?? Activity;
  const myTasks = tasks.filter((t) => t.requestId === request.id);
  const doneTasks = myTasks.filter((t) => t.status === "completed").length;
  const elapsed = Math.round((Date.now() - new Date(request.createdAt).getTime()) / 60000);
  const overSla = elapsed > request.slaMinutes;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => e.key === "Enter" && onSelect()}
      className={cn(
        "group cursor-pointer rounded-lg border border-border bg-card p-3 text-left transition-all hover:border-primary/50 hover:shadow-sm",
        request.status === "escalated" && "border-red-300 bg-red-50/50 dark:bg-red-950/20",
        request.status === "emergency" && "border-red-500 bg-red-100/50",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 min-w-0">
          <Icon className={cn("mt-0.5 size-3.5 shrink-0", request.status === "escalated" ? "text-red-500" : "text-primary")} />
          <div className="min-w-0">
            <p className="truncate text-xs font-medium">{request.title}</p>
            <p className="mt-0.5 text-[10px] text-muted-foreground">
              {request.requesterName} · Flat {request.flatId}
            </p>
          </div>
        </div>
        <span className={cn("shrink-0 rounded border px-1.5 py-0.5 text-[9px] font-semibold uppercase", PRIORITY_COLOR[request.priority])}>
          {request.priority}
        </span>
      </div>

      {request.assigneeName && (
        <p className="mt-1.5 text-[10px] text-muted-foreground">
          <User className="inline size-3 mr-0.5" />
          {request.assigneeName}
        </p>
      )}

      <div className="mt-2 flex items-center justify-between gap-1">
        <div className="flex items-center gap-1">
          <Timer className={cn("size-3", overSla ? "text-red-500" : "text-muted-foreground")} />
          <span className={cn("text-[10px]", overSla ? "text-red-600 font-semibold" : "text-muted-foreground")}>
            {elapsed}m {overSla ? "(SLA breached)" : `/ ${request.slaMinutes}m`}
          </span>
        </div>
        {myTasks.length > 0 && (
          <span className="text-[10px] text-muted-foreground">
            {doneTasks}/{myTasks.length} tasks
          </span>
        )}
      </div>

      {myTasks.length > 0 && (
        <div className="mt-1.5 h-1 rounded-full bg-muted overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all", doneTasks === myTasks.length ? "bg-emerald-500" : "bg-primary")}
            style={{ width: `${(doneTasks / myTasks.length) * 100}%` }}
          />
        </div>
      )}
    </div>
  );
}

function RequestDetailDrawer({ request, tasks, onClose }: {
  request: OpsRequest;
  tasks: OpsTask[];
  onClose: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const myTasks = tasks.filter((t) => t.requestId === request.id);

  async function changeStatus(status: RequestStatus) {
    setBusy(true);
    await new Promise((r) => setTimeout(r, 400));
    opsStore.setRequestStatus(request.id, status, note || undefined);
    toast.success(`Status updated to ${status.replace(/_/g, " ")}`);
    setBusy(false);
    setNote("");
  }

  async function completeTask(taskId: string) {
    setBusy(true);
    await new Promise((r) => setTimeout(r, 300));
    opsStore.updateTask(taskId, "completed", { photo: true });
    toast.success("Task completed");
    setBusy(false);
  }

  async function doEscalate() {
    setBusy(true);
    await new Promise((r) => setTimeout(r, 400));
    opsStore.escalate(request.id);
    toast.warning("Request escalated");
    setBusy(false);
  }

  const transitions = STATUS_TRANSITIONS[request.status] ?? [];

  return (
    <div className="fixed inset-0 z-40 flex">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative ml-auto flex h-full w-full max-w-lg flex-col border-l border-border bg-card shadow-2xl overflow-hidden">
        {/* Header */}
        <div className={cn(
          "border-b border-border px-5 py-4",
          request.status === "escalated" ? "bg-red-50 dark:bg-red-950/30" : request.type === "emergency" ? "bg-red-100 dark:bg-red-950/50" : "",
        )}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-muted-foreground">{request.id}</span>
                <Badge variant={request.status === "escalated" ? "destructive" : "secondary"} className="text-[10px]">
                  {request.status.replace(/_/g, " ")}
                </Badge>
              </div>
              <h2 className="mt-1 text-base font-semibold">{request.title}</h2>
              <p className="text-sm text-muted-foreground">{request.description}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
          </div>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span><User className="inline size-3 mr-0.5" />{request.requesterName}</span>
            <span><MapPin className="inline size-3 mr-0.5" />Flat {request.flatId} · {request.block}</span>
            <span><Clock className="inline size-3 mr-0.5" />{new Date(request.createdAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 px-5 py-4">
          {/* Assignment */}
          <div className="rounded-lg border border-border bg-muted/20 p-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Assignment</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              <span className="text-muted-foreground">Assigned role</span><span className="font-medium">{request.assignedRole}</span>
              <span className="text-muted-foreground">Assignee</span><span className="font-medium">{request.assigneeName ?? "Unassigned"}</span>
              <span className="text-muted-foreground">Department</span><span>{request.department}</span>
              <span className="text-muted-foreground">Priority</span>
              <span>
                <Badge variant="secondary" className="capitalize text-[10px]">{request.priority}</Badge>
              </span>
            </div>
          </div>

          {/* Access pass */}
          {request.accessPassId && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/30 p-3">
              <p className="text-xs font-medium text-amber-700 dark:text-amber-400 uppercase tracking-wide mb-1">
                <Shield className="inline size-3 mr-1" />Access pass issued
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-300 font-mono">{request.accessPassId}</p>
              {request.providerName && <p className="text-xs text-muted-foreground mt-0.5">Provider: {request.providerName}</p>}
            </div>
          )}

          {/* Tasks */}
          {myTasks.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Tasks ({myTasks.length})</p>
              <div className="space-y-2">
                {myTasks.map((task) => (
                  <div key={task.id} className={cn(
                    "flex items-start gap-3 rounded-md border p-3",
                    task.status === "completed" ? "border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20" : "border-border",
                  )}>
                    <CheckCircle2 className={cn("mt-0.5 size-4 shrink-0", task.status === "completed" ? "text-emerald-500" : "text-muted-foreground/30")} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{task.title}</p>
                      <p className="text-xs text-muted-foreground capitalize">{task.assignedRole} · {task.status.replace(/_/g, " ")}</p>
                      <div className="mt-1 flex gap-1">
                        {task.requiresOtp && <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">OTP required</span>}
                        {task.requiresPhoto && <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">Photo required</span>}
                      </div>
                    </div>
                    {task.status !== "completed" && (
                      <Button size="sm" variant="outline" className="shrink-0 text-xs" onClick={() => completeTask(task.id)} disabled={busy}>
                        {busy ? <Loader2 className="size-3 animate-spin" /> : <CheckCircle2 className="size-3" />}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timeline */}
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Timeline</p>
            <div className="space-y-0">
              {request.timeline.map((evt, i) => (
                <div key={evt.id} className="relative flex gap-3 pb-3 last:pb-0">
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      "size-2 rounded-full ring-2 ring-background mt-1.5",
                      evt.tone === "success" ? "bg-emerald-500" :
                      evt.tone === "danger" ? "bg-red-500" :
                      evt.tone === "warning" ? "bg-amber-500" : "bg-muted-foreground/40",
                    )} />
                    {i < request.timeline.length - 1 && <div className="mt-1 flex-1 w-px bg-border" />}
                  </div>
                  <div className="min-w-0 pb-2">
                    <p className="text-xs font-medium">{evt.label}</p>
                    {evt.detail && <p className="text-[10px] text-muted-foreground">{evt.detail}</p>}
                    <p className="text-[10px] text-muted-foreground">
                      {evt.actor} · {new Date(evt.at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="border-t border-border px-5 py-4 space-y-3">
          <Input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note (optional)…"
            className="text-sm"
          />
          <div className="flex flex-wrap gap-2">
            {transitions.map((s) => (
              <Button
                key={s}
                size="sm"
                variant={s === "completed" ? "default" : s === "escalated" ? "destructive" : "outline"}
                onClick={() => changeStatus(s)}
                disabled={busy}
                className="capitalize text-xs"
              >
                {busy ? <Loader2 className="mr-1 size-3 animate-spin" /> : null}
                → {s.replace(/_/g, " ")}
              </Button>
            ))}
            {request.status !== "escalated" && request.status !== "completed" && (
              <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700 text-xs" onClick={doEscalate} disabled={busy}>
                <AlertTriangle className="mr-1 size-3" /> Escalate
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function OpsBoard() {
  const store = useSyncExternalStore(subscribe, getSnapshot);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<RequestType | "all">("all");
  const [selected, setSelected] = useState<OpsRequest | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const filtered = store.requests.filter((r) => {
    if (typeFilter !== "all" && r.type !== typeFilter) return false;
    if (!showCompleted && r.status === "completed") return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        r.title.toLowerCase().includes(q) ||
        r.requesterName.toLowerCase().includes(q) ||
        r.flatId.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const activeStatuses = showCompleted ? STATUS_COLS : STATUS_COLS.filter((s) => s.status !== "completed");

  // KPI calculations
  const total = store.requests.length;
  const urgent = store.requests.filter((r) => r.priority === "urgent" || r.priority === "high").length;
  const escalated = store.requests.filter((r) => r.status === "escalated").length;
  const completed = store.requests.filter((r) => r.status === "completed").length;

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* Top bar */}
      <div className="shrink-0 border-b border-border bg-card px-4 py-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-base font-bold flex items-center gap-2">
                <Activity className="size-4 text-primary" />
                Live Ops Board
              </h1>
              <p className="text-xs text-muted-foreground">
                {total} requests · {escalated > 0 ? <span className="text-red-500 font-medium">{escalated} escalated · </span> : null}
                last refresh {lastRefresh.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2 size-3.5 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search requests…"
                className="h-8 pl-8 text-xs w-52"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as RequestType | "all")}
              className="h-8 rounded-md border border-border bg-background px-2 text-xs"
            >
              <option value="all">All types</option>
              <option value="service">Service</option>
              <option value="visitor">Visitor</option>
              <option value="maintenance">Maintenance</option>
              <option value="package">Package</option>
              <option value="caretaker">Caretaker</option>
              <option value="emergency">Emergency</option>
              <option value="delivery">Delivery</option>
            </select>
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs gap-1"
              onClick={() => setShowCompleted(!showCompleted)}
            >
              {showCompleted ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
              {showCompleted ? "Hide" : "Show"} completed
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={() => setLastRefresh(new Date())}
              title="Refresh"
            >
              <RefreshCw className="size-3.5" />
            </Button>
          </div>
        </div>

        {/* Mini KPIs */}
        <div className="mt-2 flex items-center gap-4 text-xs">
          {[
            { label: "Total", value: total, color: "text-foreground" },
            { label: "Urgent/High", value: urgent, color: "text-orange-600" },
            { label: "Escalated", value: escalated, color: "text-red-600" },
            { label: "Completed", value: completed, color: "text-emerald-600" },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex items-center gap-1">
              <span className="text-muted-foreground">{label}:</span>
              <span className={cn("font-semibold tabular-nums", color)}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Empty Search / Filter Alert */}
      {filtered.length === 0 && (search || typeFilter !== "all") && (
        <div className="mx-6 my-4 flex items-center justify-between rounded-xl border border-dashed border-border bg-muted/30 p-4 text-xs">
          <span className="text-muted-foreground">
            No requests found matching <strong>"{search}"</strong> {typeFilter !== "all" ? `in type ${typeFilter}` : ""}.
          </span>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs"
            onClick={() => {
              setSearch("");
              setTypeFilter("all");
            }}
          >
            Reset Filters
          </Button>
        </div>
      )}

      {/* Kanban columns */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex h-full gap-px bg-muted min-w-max">
          {activeStatuses.map((col) => {
            const colRequests = filtered.filter((r) => r.status === col.status);
            return (
              <div key={col.status} className={cn("flex w-72 shrink-0 flex-col", col.color)}>
                {/* Column header */}
                <div className="flex items-center justify-between px-3 py-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold">{col.label}</span>
                    <span className={cn(
                      "rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums",
                      col.status === "escalated" ? "bg-red-100 text-red-700" : "bg-muted-foreground/10 text-muted-foreground",
                    )}>
                      {colRequests.length}
                    </span>
                  </div>
                </div>

                {/* Cards */}
                <div className="flex-1 space-y-2 overflow-y-auto px-3 pb-3">
                  {colRequests.length === 0 ? (
                    <div className="mt-4 text-center text-xs text-muted-foreground/50">Empty</div>
                  ) : (
                    colRequests.map((req) => (
                      <RequestCard
                        key={req.id}
                        request={req}
                        tasks={store.tasks}
                        onSelect={() => setSelected(req)}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail drawer */}
      {selected && (
        <RequestDetailDrawer
          request={store.requests.find((r) => r.id === selected.id) ?? selected}
          tasks={store.tasks}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
