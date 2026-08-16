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
  const isEmergency = request.priority === "urgent" || request.type === "emergency";

  function handleQuickAdvance(e: React.MouseEvent) {
    e.stopPropagation();
    const transitions = STATUS_TRANSITIONS[request.status] ?? [];
    if (transitions.length > 0) {
      const nextStatus = transitions[0];
      opsStore.setRequestStatus(request.id, nextStatus);
      toast.success(`Moved to ${nextStatus.replace(/_/g, " ")}`);
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => e.key === "Enter" && onSelect()}
      className={cn(
        "group relative cursor-pointer rounded-xl border bg-card p-3.5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
        isEmergency
          ? "border-red-500/60 bg-red-500/5 shadow-sm shadow-red-500/10 hover:border-red-500"
          : request.status === "escalated"
          ? "border-red-400 bg-red-50/60 dark:bg-red-950/30"
          : "border-border hover:border-primary/50",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2.5 min-w-0">
          <span className={cn(
            "grid size-7 shrink-0 place-items-center rounded-lg text-xs",
            isEmergency ? "bg-red-500 text-white animate-pulse" : "bg-primary/10 text-primary"
          )}>
            <Icon className="size-3.5" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-foreground group-hover:text-primary transition-colors">{request.title}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground truncate">
              {request.requesterName} · Flat {request.flatId}
            </p>
          </div>
        </div>
        <span className={cn("shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider", PRIORITY_COLOR[request.priority])}>
          {request.priority}
        </span>
      </div>

      {request.assigneeName && (
        <div className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground bg-muted/40 rounded px-2 py-1">
          <User className="size-3 text-muted-foreground" />
          <span className="truncate">{request.assigneeName}</span>
        </div>
      )}

      {/* SLA & Task Progress Bar */}
      <div className="mt-2.5 flex items-center justify-between gap-1 border-t border-border/60 pt-2 text-[10px]">
        <div className="flex items-center gap-1">
          <Timer className={cn("size-3", overSla ? "text-red-500 animate-pulse" : "text-muted-foreground")} />
          <span className={cn("font-medium", overSla ? "text-red-600 font-bold" : "text-muted-foreground")}>
            {elapsed}m {overSla ? "(SLA breached)" : `/ ${request.slaMinutes}m`}
          </span>
        </div>
        {myTasks.length > 0 && (
          <span className="font-medium text-muted-foreground">
            {doneTasks}/{myTasks.length} tasks
          </span>
        )}
      </div>

      {/* Quick Move Button on Hover */}
      {request.status !== "completed" && (
        <div className="mt-2 pt-1 flex justify-end opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={handleQuickAdvance}
            className="inline-flex items-center gap-1 rounded bg-primary/10 hover:bg-primary hover:text-primary-foreground px-2 py-1 text-[10px] font-semibold text-primary transition-colors"
          >
            Advance <ArrowRight className="size-2.5" />
          </button>
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
  const [statusView, setStatusView] = useState<RequestStatus | "all">("all");
  const [selected, setSelected] = useState<OpsRequest | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const filtered = store.requests.filter((r) => {
    if (typeFilter !== "all" && r.type !== typeFilter) return false;
    if (statusView !== "all" && r.status !== statusView) return false;
    if (!showCompleted && statusView === "all" && r.status === "completed") return false;
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

  const activeStatuses = statusView !== "all"
    ? STATUS_COLS.filter((s) => s.status === statusView)
    : showCompleted
    ? STATUS_COLS
    : STATUS_COLS.filter((s) => s.status !== "completed");

  // KPI calculations
  const total = store.requests.length;
  const urgent = store.requests.filter((r) => r.priority === "urgent" || r.priority === "high").length;
  const escalated = store.requests.filter((r) => r.status === "escalated").length;
  const inProgress = store.requests.filter((r) => r.status === "in_progress").length;
  const completed = store.requests.filter((r) => r.status === "completed").length;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-muted/10">
      {/* Top Bar */}
      <div className="shrink-0 border-b border-border bg-card px-4 py-3 sm:px-6 shadow-sm">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-base font-bold flex items-center gap-2">
                <span className="grid size-7 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Activity className="size-4" />
                </span>
                Live Operations Board
              </h1>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Real-time dispatch · {total} requests active · {escalated > 0 ? <span className="text-red-500 font-semibold">{escalated} escalated</span> : "SLA monitored"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search requests, flats, names…"
                className="h-8 pl-8 text-xs w-48 sm:w-60"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2 top-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              )}
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as RequestType | "all")}
              className="h-8 rounded-lg border border-border bg-background px-2.5 text-xs font-medium"
            >
              <option value="all">All Request Types</option>
              <option value="emergency">🚨 Emergency</option>
              <option value="maintenance">🔧 Maintenance</option>
              <option value="visitor">👤 Visitor Pass</option>
              <option value="service">📦 Service Delivery</option>
              <option value="caretaker">🛠️ Caretaker</option>
            </select>

            <Button
              size="sm"
              variant="outline"
              className={cn("h-8 text-xs gap-1.5", showCompleted && "bg-primary/10 text-primary border-primary/40")}
              onClick={() => setShowCompleted(!showCompleted)}
            >
              {showCompleted ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
              {showCompleted ? "Hide Completed" : "Show Completed"}
            </Button>

            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={() => {
                setLastRefresh(new Date());
                toast.success("Board refreshed");
              }}
              title="Refresh Board"
            >
              <RefreshCw className="size-3.5" />
            </Button>
          </div>
        </div>

        {/* Quick View Status Filter Chips */}
        <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 text-xs custom-scrollbar">
          {[
            { id: "all", label: "All Columns", count: total, color: "text-foreground" },
            { id: "new", label: "New", count: store.requests.filter(r => r.status === "new").length, color: "text-blue-600" },
            { id: "in_progress", label: "In Progress", count: inProgress, color: "text-amber-600" },
            { id: "escalated", label: "🚨 Escalated", count: escalated, color: "text-red-600" },
            { id: "completed", label: "Completed", count: completed, color: "text-emerald-600" },
          ].map((chip) => (
            <button
              key={chip.id}
              type="button"
              onClick={() => setStatusView(chip.id as any)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold transition-all shrink-0",
                statusView === chip.id
                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
              )}
            >
              <span>{chip.label}</span>
              <span className={cn(
                "rounded-full px-1.5 py-0.2 text-[10px] font-bold",
                statusView === chip.id ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
              )}>
                {chip.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Empty Search / Filter Alert */}
      {filtered.length === 0 && (search || typeFilter !== "all" || statusView !== "all") && (
        <div className="mx-6 my-4 flex items-center justify-between rounded-xl border border-dashed border-border bg-card p-4 text-xs shadow-sm">
          <span className="text-muted-foreground">
            No requests found matching your current filter criteria.
          </span>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs"
            onClick={() => {
              setSearch("");
              setTypeFilter("all");
              setStatusView("all");
            }}
          >
            Reset Filters
          </Button>
        </div>
      )}

      {/* Kanban Columns Canvas */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-4 custom-scrollbar">
        <div className="flex h-full gap-3 min-w-max pb-2">
          {activeStatuses.map((col) => {
            const colRequests = filtered.filter((r) => r.status === col.status);
            return (
              <div
                key={col.status}
                className="flex w-64 sm:w-72 shrink-0 flex-col rounded-2xl border border-border/80 bg-card/60 backdrop-blur-sm shadow-sm overflow-hidden"
              >
                {/* Column Header */}
                <div className={cn("flex items-center justify-between border-b border-border/70 px-3.5 py-2.5", col.color)}>
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-primary" />
                    <span className="text-xs font-bold uppercase tracking-wider">{col.label}</span>
                  </div>
                  <span className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums",
                    col.status === "escalated" ? "bg-red-500 text-white" : "bg-muted text-muted-foreground",
                  )}>
                    {colRequests.length}
                  </span>
                </div>

                {/* Card Stream */}
                <div className="flex-1 space-y-2.5 overflow-y-auto p-3 custom-scrollbar">
                  {colRequests.length === 0 ? (
                    <div className="mt-8 flex flex-col items-center justify-center text-center text-muted-foreground/40 text-xs py-4">
                      <CheckCircle2 className="size-6 mb-1 text-muted-foreground/30" />
                      No {col.label.toLowerCase()} requests
                    </div>
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
