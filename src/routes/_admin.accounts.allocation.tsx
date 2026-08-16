import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader, KpiCard, Section, StatusBadge, TableSkeleton } from "@/components/app/primitives";
import { Button } from "@/components/ui/button";
import { allocationResultService, allocationRuleService } from "@/services";
import { bdt, titleize } from "@/lib/format";

export const Route = createFileRoute("/_admin/accounts/allocation")({
  head: () => ({
    meta: [
      { title: "Cost Allocation — Bashundhara R/A" },
      { name: "description", content: "Share common costs across flats by equal split, flat size, metered use or percentage." },
      { property: "og:title", content: "Cost Allocation — Bashundhara R/A" },
      { property: "og:description", content: "Share common costs across flats by equal split, flat size, metered use or percentage." },
    ],
  }),
  component: Page,
});

function Page() {
  const rules = useQuery({ queryKey: ["allocation-rules"], queryFn: () => allocationRuleService.all() });
  const results = useQuery({ queryKey: ["allocation-results"], queryFn: () => allocationResultService.all() });
  const [selected, setSelected] = useState<string | null>(null);
  const list = rules.data ?? [];
  const active = selected ?? list[0]?.id ?? null;
  const rule = list.find((r) => r.id === active);
  const split = (results.data ?? []).filter((r) => r.ruleId === active);

  return (
    <>
      <PageHeader
        title="Cost Allocation"
        description="Every shared cost is distributed to flats on a defined, auditable basis before it is billed."
        breadcrumb={["Accounts", "Cost Allocation"]}
        actions={<Button size="sm" onClick={() => toast.success("Allocation run started", { description: "All active rules will post to resident ledgers." })}>Run all allocations</Button>}
      />
      <div className="space-y-4 p-4 sm:p-6">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-md bg-border lg:grid-cols-4">
          <KpiCard label="Active rules" value={list.length} tone="primary" />
          <KpiCard label="Allocated value" value={bdt(list.reduce((s, r) => s + r.amount, 0), true)} tone="info" />
          <KpiCard label="Posted rules" value={list.filter((r) => r.posted).length} tone="success" />
          <KpiCard label="Pending posting" value={list.filter((r) => !r.posted).length} tone="warning" />
        </div>

        <div className="grid gap-4 lg:grid-cols-5">
          <Section title="Allocation rules" className="lg:col-span-3">
            {rules.isLoading ? <TableSkeleton rows={8} cols={4} /> : (
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-muted/40 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2 text-left">Rule</th>
                    <th className="px-4 py-2 text-left">Method</th>
                    <th className="px-4 py-2 text-right">Amount</th>
                    <th className="px-4 py-2 text-right">Targets</th>
                    <th className="px-4 py-2 text-left">Posted</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((r) => (
                    <tr key={r.id}
                      onClick={() => setSelected(r.id)}
                      className={`cursor-pointer border-b border-border last:border-0 hover:bg-accent/50 ${r.id === active ? "bg-accent/60" : ""}`}>
                      <td className="px-4 py-2">{r.name}<span className="block text-xs text-muted-foreground">{r.costType} · {r.buildingId}</span></td>
                      <td className="px-4 py-2">{titleize(r.method)}</td>
                      <td className="tabular px-4 py-2 text-right">{bdt(r.amount)}</td>
                      <td className="tabular px-4 py-2 text-right">{r.targets}</td>
                      <td className="px-4 py-2"><StatusBadge value={r.posted ? "posted" : "pending"} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Section>

          <Section
            title={rule ? `Split preview — ${rule.name}` : "Split preview"}
            description={rule ? `${titleize(rule.method)} basis · last run ${rule.lastRunOn}` : ""}
            className="lg:col-span-2"
            actions={rule ? (
              <Button size="sm" onClick={() => toast.success("Allocation posted", { description: `${bdt(rule.amount)} charged across ${rule.targets} flats.` })}>
                Post allocation
              </Button>
            ) : null}
          >
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/40 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-2 text-left">Flat</th>
                  <th className="px-4 py-2 text-left">Basis</th>
                  <th className="px-4 py-2 text-right">Share</th>
                  <th className="px-4 py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {split.map((s) => (
                  <tr key={s.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-2">{s.flat}</td>
                    <td className="px-4 py-2 text-muted-foreground">{s.basis}</td>
                    <td className="tabular px-4 py-2 text-right">{s.share}%</td>
                    <td className="tabular px-4 py-2 text-right">{bdt(s.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>
        </div>
      </div>
    </>
  );
}
