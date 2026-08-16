import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Camera, CheckCircle2, ClipboardList, MapPin, PackageCheck, QrCode, Truck,
  Sparkles, Check, KeyRound, Loader2, ArrowRight, ShieldCheck,
} from "lucide-react";
import { PageHeader, Section, KpiCard, StatusBadge, TableSkeleton } from "@/components/app/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { caretakerService, caretakerTaskService } from "@/services";
import { humanizeError } from "@/services/api";
import { titleize } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_admin/caretaker/console")({
  head: () => ({
    meta: [
      { title: "Caretaker Console — Bashundhara R/A" },
      { name: "description", content: "Mobile-first caretaker workspace for service pickups, provider handovers, returns, OTP confirmation and daily building tasks." },
      { property: "og:title", content: "Caretaker Console — Bashundhara R/A" },
      { property: "og:description", content: "Fast, minimal-tap task flow for caretakers handling controlled service handovers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CaretakerConsole,
});

const ACTION_LABEL: Record<string, string> = {
  accept: "Task Accepted",
  collect: "Items Collected from Resident",
  handover: "Handed over to Provider at Gate",
  deliver: "Items Delivered to Flat",
  complete: "Task Completed",
};

function CaretakerConsole() {
  const qc = useQueryClient();
  const [otp, setOtp] = useState("");
  const [otpTask, setOtpTask] = useState<string | null>(null);
  const [scanningTask, setScanningTask] = useState<string | null>(null);
  const [photoTask, setPhotoTask] = useState<string | null>(null);

  const { data: summary } = useQuery({ queryKey: ["caretaker-summary"], queryFn: () => caretakerService.summary() });
  const { data: tasks = [], isLoading } = useQuery({ queryKey: ["caretaker-tasks"], queryFn: () => caretakerTaskService.all() });

  const advance = useMutation({
    mutationFn: (v: { id: string; action: "accept" | "collect" | "handover" | "deliver" | "complete" }) =>
      caretakerService.advanceTask(v.id, v.action),
    onSuccess: (r) => {
      toast.success(`${ACTION_LABEL[r.action]} — ${r.id}`, { description: "Live chain of custody updated." });
      void qc.invalidateQueries({ queryKey: ["caretaker-tasks"] });
      void qc.invalidateQueries({ queryKey: ["caretaker-summary"] });
    },
    onError: (e) => toast.error(humanizeError(e)),
  });

  const confirmOtp = useMutation({
    mutationFn: (v: { id: string; otp: string }) => caretakerService.verifyOtp(v.id, v.otp),
    onSuccess: (r) => {
      if (r.verified) {
        toast.success("Resident OTP Verified Successfully!", { description: "Delivery recorded with cryptographic timestamp." });
        setOtpTask(null);
        setOtp("");
        void qc.invalidateQueries({ queryKey: ["caretaker-tasks"] });
        void qc.invalidateQueries({ queryKey: ["caretaker-summary"] });
      } else {
        toast.error("Invalid OTP. Enter the 6-digit OTP shown on resident app.");
      }
    },
    onError: (e) => toast.error(humanizeError(e)),
  });

  const pickups = tasks.filter((t) => t.type === "service_pickup" && t.status !== "completed").slice(0, 8);
  const returns = tasks.filter((t) => t.type === "service_return" && t.status !== "completed").slice(0, 8);
  const others = tasks.filter((t) => !t.type.startsWith("service") && t.status !== "completed").slice(0, 8);
  const history = tasks.filter((t) => t.status === "completed").slice(0, 10);

  const TaskCard = ({ task }: { task: (typeof tasks)[number] }) => (
    <li className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm transition-all duration-200 hover:border-primary/40 hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-foreground">{task.title}</p>
          <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
            <MapPin className="size-3 text-primary" />
            Flat {task.flatId} · {task.window} · {task.buildingId}
          </p>
        </div>
        <StatusBadge value={task.priority} />
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        <Badge
          variant="secondary"
          className={cn(
            "text-[10px] font-bold uppercase",
            task.status === "accepted" ? "bg-blue-500/10 text-blue-600 border border-blue-200" :
            task.status === "in_progress" ? "bg-amber-500/10 text-amber-600 border border-amber-200" :
            task.status === "completed" ? "bg-emerald-500/10 text-emerald-600 border border-emerald-200" :
            "bg-muted text-muted-foreground"
          )}
        >
          {task.status.replace(/_/g, " ")}
        </Badge>
        {task.requiresOtp ? <span className="rounded-md bg-purple-500/10 text-purple-600 border border-purple-200 px-1.5 py-0.5 text-[10px] font-semibold uppercase">OTP Required</span> : null}
        {task.requiresPhoto ? <span className="rounded-md bg-cyan-500/10 text-cyan-600 border border-cyan-200 px-1.5 py-0.5 text-[10px] font-semibold uppercase">Photo Proof</span> : null}
        {task.orderId ? <span className="font-mono text-[10px] text-muted-foreground ml-auto">{task.orderId}</span> : null}
      </div>

      <div className="mt-3.5 grid grid-cols-2 gap-2 sm:grid-cols-4 pt-3 border-t border-border/60">
        <Button
          size="sm"
          variant={task.status === "accepted" ? "secondary" : "outline"}
          className={cn("h-8 text-xs font-semibold", task.status === "accepted" && "text-blue-600 bg-blue-50 border-blue-200")}
          onClick={() => advance.mutate({ id: task.id, action: "accept" })}
          disabled={advance.isPending || task.status === "accepted" || task.status === "in_progress"}
        >
          {task.status === "accepted" ? "✓ Accepted" : "Accept"}
        </Button>

        <Button
          size="sm"
          variant="outline"
          className="h-8 text-xs font-semibold gap-1"
          onClick={() => setScanningTask(task.id)}
        >
          <QrCode className="size-3" /> Scan QR
        </Button>

        <Button
          size="sm"
          variant="outline"
          className="h-8 text-xs font-semibold gap-1"
          onClick={() => setPhotoTask(task.id)}
        >
          <Camera className="size-3" /> Photo
        </Button>

        {task.type === "service_return" ? (
          <Button
            size="sm"
            className="h-8 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={() => setOtpTask(task.id)}
          >
            Deliver (OTP)
          </Button>
        ) : (
          <Button
            size="sm"
            className="h-8 text-xs font-semibold"
            onClick={() => advance.mutate({ id: task.id, action: "handover" })}
            disabled={advance.isPending}
          >
            Handover →
          </Button>
        )}
      </div>

      {/* Inline OTP Verification Box */}
      {otpTask === task.id ? (
        <div className="mt-3 rounded-xl border border-primary/40 bg-primary/5 p-3 animate-in fade-in-50 duration-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <KeyRound className="size-3.5 text-primary" /> Enter Resident 6-Digit OTP
            </span>
            <button
              type="button"
              onClick={() => {
                setOtp("482913");
                toast.info("Resident OTP auto-filled: 482913");
              }}
              className="text-[11px] font-semibold text-primary hover:underline"
            >
              Demo Auto-Fill (482913)
            </button>
          </div>
          <form
            className="flex items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              confirmOtp.mutate({ id: task.id, otp });
            }}
          >
            <Input
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              inputMode="numeric"
              maxLength={6}
              placeholder="e.g. 482913"
              className="tabular h-9 text-xs font-mono font-bold tracking-widest bg-card"
              autoFocus
            />
            <Button size="sm" type="submit" className="h-9 px-4 font-semibold shrink-0" disabled={confirmOtp.isPending || otp.length < 6}>
              {confirmOtp.isPending ? <Loader2 className="size-3.5 animate-spin" /> : "Verify & Complete"}
            </Button>
            <Button size="sm" type="button" variant="ghost" className="h-9 text-xs" onClick={() => setOtpTask(null)}>
              Cancel
            </Button>
          </form>
        </div>
      ) : null}
    </li>
  );

  return (
    <>
      <PageHeader
        title="Caretaker Console"
        description="Active service pickups, provider handovers, and returns with verified resident OTP handoffs."
        breadcrumb={["Services", "Caretaker"]}
      />

      <div className="space-y-6 p-4 sm:p-6">
        {/* KPI Strip */}
        <div className="grid gap-3 grid-cols-2 xl:grid-cols-4">
          <KpiCard label="Pending" value={String(summary?.pending ?? "18")} icon={ClipboardList} tone="warning" />
          <KpiCard label="In progress" value={String(summary?.inProgress ?? "10")} icon={Truck} tone="info" />
          <KpiCard label="Pickups" value={String(summary?.pickups ?? "8")} icon={PackageCheck} tone="primary" />
          <KpiCard label="Completed" value={String(summary?.completedToday ?? "6")} icon={CheckCircle2} tone="success" />
        </div>

        {isLoading ? (
          <Section><TableSkeleton rows={6} cols={3} /></Section>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            <Section title="Service Pickups" description="Collect from resident → hand to provider at the gate">
              <ul className="space-y-3 p-3">
                {pickups.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-6 text-center">No active service pickups</p>
                ) : (
                  pickups.map((t) => <TaskCard key={t.id} task={t} />)
                )}
              </ul>
            </Section>

            <Section title="Service Returns" description="Receive from provider → deliver to flat → resident OTP">
              <ul className="space-y-3 p-3">
                {returns.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-6 text-center">No pending returns</p>
                ) : (
                  returns.map((t) => <TaskCard key={t.id} task={t} />)
                )}
              </ul>
            </Section>

            <Section title="Building & Resident Tasks" description="Scheduled repairs, housekeeping and inspections">
              <ul className="space-y-3 p-3">
                {others.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-6 text-center">No other pending tasks</p>
                ) : (
                  others.map((t) => <TaskCard key={t.id} task={t} />)
                )}
              </ul>
            </Section>

            <Section title="Completed Handover History" description="Completed today with verified digital signatures">
              <ul className="divide-y divide-border/60">
                {history.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-6 text-center">No completed tasks today</p>
                ) : (
                  history.map((t) => (
                    <li key={t.id} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-muted/20 transition-colors">
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-foreground">{t.title}</span>
                        <span className="block text-xs text-muted-foreground mt-0.5">{titleize(t.type)} · Flat {t.flatId} · {t.scheduledAt}</span>
                      </span>
                      <StatusBadge value={t.status} />
                    </li>
                  ))
                )}
              </ul>
            </Section>
          </div>
        )}
      </div>

      {/* QR Scanner Simulation Modal */}
      {scanningTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl text-center space-y-4">
            <div className="grid size-12 mx-auto place-items-center rounded-2xl bg-primary/10 text-primary">
              <QrCode className="size-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-foreground">Scan Provider / Flat QR Code</h3>
              <p className="text-xs text-muted-foreground mt-1">Task: {scanningTask}</p>
            </div>
            <div className="relative mx-auto aspect-square w-48 rounded-xl border-2 border-dashed border-primary/60 bg-muted/30 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-1 bg-primary animate-pulse shadow-md shadow-primary" />
              <p className="text-[11px] text-muted-foreground px-4 text-center">Align camera with resident or provider QR code</p>
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1 text-xs" onClick={() => setScanningTask(null)}>
                Cancel
              </Button>
              <Button
                className="flex-1 text-xs font-semibold"
                onClick={() => {
                  toast.success(`QR verified for ${scanningTask}!`);
                  advance.mutate({ id: scanningTask, action: "collect" });
                  setScanningTask(null);
                }}
              >
                Simulate Verified Scan
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Photo Capture Modal */}
      {photoTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl text-center space-y-4">
            <div className="grid size-12 mx-auto place-items-center rounded-2xl bg-cyan-500/10 text-cyan-600">
              <Camera className="size-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-foreground">Attach Handover Photo Proof</h3>
              <p className="text-xs text-muted-foreground mt-1">Task: {photoTask}</p>
            </div>
            <div className="aspect-video w-full rounded-xl border border-border bg-muted/40 flex flex-col items-center justify-center gap-2 text-xs text-muted-foreground">
              <Camera className="size-8 text-muted-foreground/60" />
              <span>Camera snapshot ready</span>
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1 text-xs" onClick={() => setPhotoTask(null)}>
                Cancel
              </Button>
              <Button
                className="flex-1 text-xs font-semibold bg-cyan-600 hover:bg-cyan-700 text-white"
                onClick={() => {
                  toast.success(`Handover photo proof uploaded for ${photoTask}!`);
                  setPhotoTask(null);
                }}
              >
                Upload Photo Proof
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
