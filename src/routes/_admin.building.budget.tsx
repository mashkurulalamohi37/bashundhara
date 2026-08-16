import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader, Section, KpiCard, StatusBadge, TableSkeleton } from "@/components/app/primitives";
import { DualBarChart } from "@/components/app/charts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { budgetService, buildingService } from "@/services";
import { bdt } from "@/lib/format";

export const Route = createFileRoute("/_admin/building/budget")({
  head: () => ({
    meta: [
      { title: "Building Budget — Bashundhara R/A" },
      { name: "description", content: "Monthly and annual building budget planning with budget versus actual variance by category." },
      { property: "og:title", content: "Building Budget — Bashundhara R/A" },
      { property: "og:description", content: "Plan security, staff, utility, lift and maintenance budgets and track variance." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: BudgetPage,
});

function BudgetPage() {
  const [buildingId, setBuildingId] = useState("all");
  const { data: buildings = [] } = useQuery({ queryKey: ["buildings"], queryFn: () => buildingService.all() });
  const { data: rows = [], isLoading } = useQuery({ queryKey: ["budgets"], queryFn: () => budgetService.all() });

  const scoped = buildingId === "all" ? rows : rows.filter((r) => r.buildingId === buildingId);
  const byCategory = Object.values(
    scoped.reduce<Record<string, { category: string; planned: number; actual: number }>>((acc, r) => {
      acc[r.category] ??= { category: r.category, planned: 0, actual: 0 };
      acc[r.category]!.planned += r.planned;
      acc[r.category]!.actual += r.actual;
      return acc;
    }, {}),
  );
  const planned = byCategory.reduce((s, r) => s + r.planned, 0);
  const actual = byCategory.reduce((s, r) => s + r.actual, 0);

  return (
    <>
      <PageHeader
        title="Building Budget"
        description="Plan by category and track actual spend — variance highlights where the building is over budget."
        breadcrumb={["Building Management", "Budget"]}
        actions={
          <Select value={buildingId} onValueChange={setBuildingId}>
            <SelectTrigger className="h-9 w-56"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All buildings</SelectItem>
              {buildings.map((b) => <SelectItem key={b.id} value={b.id}>{b.name} · {b.road}</SelectItem>)}
            </SelectContent>
          </Select>
        }
      />
      <div className="space-y-4 p-4 sm:p-6">
        <div className="grid gap-px overflow-hidden rounded-md sm:grid-cols-3">
          <KpiCard label="Planned" value={bdt(planned, true)} hint="Approved budget" tone="info" />
          <KpiCard label="Actual" value={bdt(actual, true)} hint="Spend to date" tone="warning" />
          <KpiCard label="Variance" value={bdt(planned - actual, true)} hint={planned - actual >= 0 ? "Within budget" : "Over budget"} tone={planned - actual >= 0 ? "success" : "danger"} />
        </div>

        <Section title="Budget vs actual" description="By expense category">
          <div className="p-3">
            <DualBarChart
              data={byCategory as unknown as Record<string, string | number>[]}
              xKey="category"
              series={[
                { key: "planned", label: "Planned", color: "var(--color-chart-2)" },
                { key: "actual", label: "Actual", color: "var(--color-chart-4)" },
              ]}
              height={280}
            />
          </div>
        </Section>

        <Section title="Category detail">
          {isLoading ? (
            <TableSkeleton rows={8} cols={5} />
          ) : (
            <ul className="divide-y divide-border">
              {scoped.slice(0, 40).map((r) => (
                <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5">
                  <span className="min-w-0">
                    <span className="block text-sm font-medium">{r.category}</span>
                    <span className="block text-xs text-muted-foreground">{r.buildingId} · {r.period}</span>
                  </span>
                  <span className="flex items-center gap-4">
                    <span className="tabular text-xs text-muted-foreground">planned {bdt(r.planned)}</span>
                    <span className="tabular text-sm">{bdt(r.actual)}</span>
                    <StatusBadge value={r.status} />
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>
    </>
  );
}
