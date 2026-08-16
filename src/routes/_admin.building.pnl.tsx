import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader, Section, KpiCard } from "@/components/app/primitives";
import { CategoryBarChart, DualBarChart } from "@/components/app/charts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { buildingFinanceService, buildingService } from "@/services";
import { bdt } from "@/lib/format";

export const Route = createFileRoute("/_admin/building/pnl")({
  head: () => ({
    meta: [
      { title: "Building P&L — Bashundhara R/A" },
      { name: "description", content: "Profit and loss per building: rent, parking and commercial revenue against staff, utility, security and maintenance expenses." },
      { property: "og:title", content: "Building P&L — Bashundhara R/A" },
      { property: "og:description", content: "Revenue, expenses and net income by building with monthly trend." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Pnl,
});

function Pnl() {
  const [buildingId, setBuildingId] = useState("all");
  const { data: buildings = [] } = useQuery({ queryKey: ["buildings"], queryFn: () => buildingService.all() });
  const { data: pnl } = useQuery({ queryKey: ["building-pnl", buildingId], queryFn: () => buildingFinanceService.pnl(buildingId) });

  return (
    <>
      <PageHeader
        title="Building Profit & Loss"
        description="Revenue and expenditure by building with category breakdown and monthly trend."
        breadcrumb={["Building Management", "P&L"]}
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
          <KpiCard label="Revenue" value={bdt(pnl?.totalRevenue ?? 0, true)} tone="success" />
          <KpiCard label="Expenses" value={bdt(pnl?.totalExpense ?? 0, true)} tone="warning" />
          <KpiCard label="Net income" value={bdt(pnl?.net ?? 0, true)} tone={(pnl?.net ?? 0) >= 0 ? "success" : "danger"} />
        </div>

        <Section title="Monthly trend">
          <div className="p-3">
            <DualBarChart
              data={(pnl?.monthly ?? []) as unknown as Record<string, string | number>[]}
              xKey="month"
              series={[
                { key: "revenue", label: "Revenue", color: "var(--color-chart-1)" },
                { key: "expense", label: "Expenses", color: "var(--color-chart-3)" },
              ]}
              height={280}
            />
          </div>
        </Section>

        <div className="grid gap-4 lg:grid-cols-2">
          <Section title="Revenue by source">
            <div className="p-3">
              <CategoryBarChart
                data={(pnl?.revenue ?? []).map((r) => ({ label: r.label, amount: r.amount }))}
                xKey="label"
                barKey="amount"
              />
            </div>
          </Section>
          <Section title="Expenses by category">
            <div className="p-3">
              <CategoryBarChart
                data={(pnl?.expenses ?? []).map((r) => ({ label: r.label, amount: r.amount }))}
                xKey="label"
                barKey="amount"
                color="var(--color-chart-3)"
              />
            </div>
          </Section>
        </div>
      </div>
    </>
  );
}
