import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Camera, CheckCircle2, ClipboardList, MapPin, PackageCheck, QrCode, Truck,
} from "lucide-react";
import { PageHeader, Section, KpiCard, StatusBadge, TableSkeleton } from "@/components/app/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { caretakerService, caretakerTaskService } from "@/services";
import { humanizeError } from "@/services/api";
import { titleize } from "@/lib/format";

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
  accept: "Accept task",
  collect: "Collect items",
  handover: "Handover to provider",
  deliver: "Deliver to resident",
  complete: "Complete",
};

function CaretakerConsole() {
  const [otp, setOtp] = useState("");
  const [otpTask, setOtpTask] = useState<string | null>(null);
  const { data: summary } = useQuery({ queryKey: ["caretaker-summary"], queryFn: () => caretakerService.summary() });
  const { data: tasks = [], isLoading, refetch } = useQuery({ queryKey: ["caretaker-tasks"], queryFn: () => caretakerTaskService.all() });

  const advance = useMutation({
    mutationFn: (v: { id: string; action: "accept" | "collect" | "handover" | "deliver" | "complete" }) =>
      caretakerService.advanceTask(v.id, v.action),
    onSuccess: (r) => {
      toast.success(`${ACTION_LABEL[r.action]} — ${r.id}`, { description: "Chain of custody updated." });
      void refetch();
    },
    onError: (e) => toast.error(humanizeError(e)),
  });

  const confirmOtp = useMutation({
    mutationFn: (v: { id: string; otp: string }) => caretakerService.verifyOtp(v.id, v.otp),
    onSuccess: (r) => {
      if (r.verified) {
        toast.success("Resident OTP confirmed", { description: "Delivery recorded with timestamp." });
        setOtpTask(null);
        setOtp("");
      } else {
        toast.error("Enter the 6-digit OTP shown in the resident app.");
      }
    },
    onError: (e) => toast.error(humanizeError(e)),
  });

  const pickups = tasks.filter((t) => t.type === "service_pickup" && t.status !== "completed").slice(0, 8);
  const returns = tasks.filter((t) => t.type === "service_return" && t.status !== "completed").slice(0, 8);
  const others = tasks.filter((t) => !t.type.startsWith("service")).slice(0, 8);
  const history = tasks.filter((t) => t.status === "completed").slice(0, 10);

  const TaskCard = ({ task }: { task: (typeof tasks)[number] }) => (
    <li className="rounded-md border border-border bg-background p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{task.title}</p>
          <p className="text-xs text-muted-foreground">
            <MapPin className="mr-1 inline size-3" />
            Flat {task.flatId} · {task.window} · {task.buildingId}
          </p>
        </div>
        <StatusBadge value={task.priority} />
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <StatusBadge value={task.status} />
        {task.requiresOtp ? <span className="rounded border border-border px-1.5 py-0.5 text-[10px] uppercase text-muted-foreground">OTP</span> : null}
        {task.requiresPhoto ? <span className="rounded border border-border px-1.5 py-0.5 text-[10px] uppercase text-muted-foreground">Photo</span> : null}
        {task.orderId ? <span className="tabular text-[10px] text-muted-foreground">{task.orderId}</span> : null}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
        <Button size="sm" variant="outline" onClick={() => advance.mutate({ id: task.id, action: "accept" })}>Accept</Button>
        <Button size="sm" variant="outline" onClick={() => advance.mutate({ id: task.id, action: "collect" })}>
          <QrCode className="size-3.5" /> Scan
        </Button>
        <Button size="sm" variant="outline" onClick={() => toast.success("Photo attached to handover record")}>
          <Camera className="size-3.5" /> Photo
        </Button>
        {task.type === "service_return" ? (
          <Button size="sm" onClick={() => setOtpTask(task.id)}>Deliver</Button>
        ) : (
          <Button size="sm" onClick={() => advance.mutate({ id: task.id, action: "handover" })}>Handover</Button>
        )}
      </div>
      {otpTask === task.id ? (
        <form
          className="mt-2 flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            confirmOtp.mutate({ id: task.id, otp });
          }}
        >
          <Input value={otp} onChange={(e) => setOtp(e.target.value)} inputMode="numeric" maxLength={6} placeholder="Resident OTP" className="tabular h-9" />
          <Button size="sm" type="submit" disabled={confirmOtp.isPending}>Confirm</Button>
        </form>
      ) : null}
    </li>
  );

  return (
    <>
      <PageHeader
        title="Caretaker Console"
        description="Today's pickups, provider handovers and returns — built for fast, minimal-tap operation on a phone."
        breadcrumb={["Services", "Caretaker"]}
      />
      <div className="space-y-4 p-4 sm:p-6">
        <div className="grid gap-px overflow-hidden rounded-md grid-cols-2 xl:grid-cols-4">
          <KpiCard label="Pending" value={String(summary?.pending ?? "—")} icon={ClipboardList} tone="warning" />
          <KpiCard label="In progress" value={String(summary?.inProgress ?? "—")} icon={Truck} tone="info" />
          <KpiCard label="Pickups" value={String(summary?.pickups ?? "—")} icon={PackageCheck} tone="primary" />
          <KpiCard label="Completed" value={String(summary?.completedToday ?? "—")} icon={CheckCircle2} tone="success" />
        </div>

        {isLoading ? (
          <Section><TableSkeleton rows={6} cols={3} /></Section>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            <Section title="Service pickups" description="Collect from resident → hand to provider at the gate">
              <ul className="space-y-2 p-3">{pickups.map((t) => <TaskCard key={t.id} task={t} />)}</ul>
            </Section>
            <Section title="Service returns" description="Receive from provider → deliver to flat → resident OTP">
              <ul className="space-y-2 p-3">{returns.map((t) => <TaskCard key={t.id} task={t} />)}</ul>
            </Section>
            <Section title="Building & resident tasks">
              <ul className="space-y-2 p-3">{others.map((t) => <TaskCard key={t.id} task={t} />)}</ul>
            </Section>
            <Section title="Handover history" description="Completed today">
              <ul className="divide-y divide-border">
                {history.map((t) => (
                  <li key={t.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                    <span className="min-w-0">
                      <span className="block truncate text-sm">{t.title}</span>
                      <span className="block text-xs text-muted-foreground">{titleize(t.type)} · Flat {t.flatId} · {t.scheduledAt}</span>
                    </span>
                    <StatusBadge value={t.status} />
                  </li>
                ))}
              </ul>
            </Section>
          </div>
        )}
      </div>
    </>
  );
}
