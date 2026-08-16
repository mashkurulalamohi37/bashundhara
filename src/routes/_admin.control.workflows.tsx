import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Check, CircleDot, Clock, X } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, KpiCard, Section, StatusBadge, TableSkeleton } from "@/components/app/primitives";
import { Button } from "@/components/ui/button";
import { workflowService } from "@/services";
import { bdt } from "@/lib/format";

export const Route = createFileRoute("/_admin/control/workflows")({
  head: () => ({
    meta: [
      { title: "Approval Workflows — Bashundhara R/A" },
      { name: "description", content: "Multi-step approval chains for purchases, budgets, refunds, passes and period closing." },
      { property: "og:title", content: "Approval Workflows — Bashundhara R/A" },
      { property: "og:description", content: "Multi-step approval chains for purchases, budgets, refunds, passes and period closing." },
    ],
  }),
  component: Page,
});

const STATE_ICON = {
  completed: Check,
  current: CircleDot,
  upcoming: Clock,
  rejected: X,
} as const;

const STATE_CLASS = {
  completed: "bg-success/15 text-success border-success/30",
  current: "bg-primary-soft text-accent-foreground border-primary/30",
  upcoming: "bg-muted text-muted-foreground border-border",
  rejected: "bg-destructive/12 text-destructive border-destructive/30",
} as const;

function Page() {
  const q = useQuery({ queryKey: ["workflows"], queryFn: () => workflowService.all() });
  const [selected, setSelected] = useState<string | null>(null);
  const list = q.data ?? [];
  const active = selected ?? list[0]?.id ?? null;
  const wf = list.find((w) => w.id === active);

  return (
    <>
      <PageHeader
        title="Approval Workflows"
        description="Nothing of consequence happens without a recorded approval chain, actor and timestamp."
        breadcrumb={["Control", "Workflows"]}
      />
      <div className="space-y-4 p-4 sm:p-6">
        <div className="grid grid-cols-3 gap-px overflow-hidden rounded-md bg-border">
          <KpiCard label="Pending approvals" value={list.filter((w) => w.status === "pending").length} tone="warning" />
          <KpiCard label="Approved" value={list.filter((w) => w.status === "approved").length} tone="success" />
          <KpiCard label="Rejected" value={list.filter((w) => w.status === "rejected").length} tone="danger" />
        </div>

        <div className="grid gap-4 lg:grid-cols-5">
          <Section title="Approval queue" className="lg:col-span-3">
            {q.isLoading ? <TableSkeleton rows={10} cols={4} /> : (
              <div className="max-h-[600px] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 border-b border-border bg-muted/60 text-xs uppercase text-muted-foreground">
                    <tr>
                      <th className="px-4 py-2 text-left">Request</th>
                      <th className="px-4 py-2 text-left">Type</th>
                      <th className="px-4 py-2 text-right">Amount</th>
                      <th className="px-4 py-2 text-left">Step</th>
                      <th className="px-4 py-2 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((w) => (
                      <tr key={w.id}
                        onClick={() => setSelected(w.id)}
                        className={`cursor-pointer border-b border-border last:border-0 hover:bg-accent/50 ${w.id === active ? "bg-accent/60" : ""}`}>
                        <td className="px-4 py-2">{w.subject}<span className="block text-xs text-muted-foreground">{w.id} · {w.requestedBy}</span></td>
                        <td className="px-4 py-2">{w.type}</td>
                        <td className="tabular px-4 py-2 text-right">{bdt(w.amount)}</td>
                        <td className="px-4 py-2 text-muted-foreground">{w.currentStep} / {w.steps.length}</td>
                        <td className="px-4 py-2"><StatusBadge value={w.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Section>

          <Section
            title={wf ? `Approval chain — ${wf.subject}` : "Approval chain"}
            description={wf ? `${wf.type} · requested ${wf.requestedOn} by ${wf.requestedBy}` : ""}
            className="lg:col-span-2"
          >
            <ol className="space-y-3 p-4">
              {(wf?.steps ?? []).map((s) => {
                const Icon = STATE_ICON[s.state];
                return (
                  <li key={s.step} className="flex gap-3">
                    <span className={`mt-0.5 grid size-7 shrink-0 place-items-center rounded-full border ${STATE_CLASS[s.state]}`}>
                      <Icon className="size-3.5" />
                    </span>
                    <div className="min-w-0 flex-1 border-b border-border pb-3 last:border-0">
                      <p className="text-sm font-medium">Step {s.step} · {s.role}</p>
                      <p className="text-xs text-muted-foreground">{s.actor}{s.timestamp ? ` · ${s.timestamp}` : ""}</p>
                      {s.comment ? <p className="mt-1 text-sm">{s.comment}</p> : null}
                    </div>
                  </li>
                );
              })}
            </ol>
            {wf && wf.status === "pending" ? (
              <div className="flex gap-2 border-t border-border p-4">
                <Button size="sm" onClick={() => toast.success(`${wf.id} approved`, { description: "Moved to the next approver." })}>Approve step</Button>
                <Button size="sm" variant="outline" onClick={() => toast.success(`${wf.id} returned for clarification`)}>Return</Button>
                <Button size="sm" variant="destructive" onClick={() => toast.success(`${wf.id} rejected`)}>Reject</Button>
              </div>
            ) : null}
          </Section>
        </div>
      </div>
    </>
  );
}
