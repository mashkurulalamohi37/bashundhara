import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, KpiCard, Section, TableSkeleton } from "@/components/app/primitives";
import { DualBarChart } from "@/components/app/charts";
import { Button } from "@/components/ui/button";
import { reportingService } from "@/services";
import { bdt } from "@/lib/format";

export const Route = createFileRoute("/_admin/accounts/profit-loss")({
  head: () => ({
    meta: [
      { title: "Income & Expenditure — Bashundhara R/A" },
      { name: "description", content: "Community income and expenditure statement with monthly trend and surplus margin." },
      { property: "og:title", content: "Income & Expenditure — Bashundhara R/A" },
      { property: "og:description", content: "Community income and expenditure statement with monthly trend and surplus margin." },
    ],
  }),
  component: Page,
});

function Page() {
  const { data, isLoading } = useQuery({ queryKey: ["profit-loss"], queryFn: () => reportingService.profitLoss() });
  const table = (title: string, rows: { code: string; name: string; amount: number }[], total: number) => (
    <Section title={title}>
      <table className="w-full text-sm">
        <tbody>
          {rows.map((r) => (
            <tr key={r.code} className="border-b border-border last:border-0">
              <td className="tabular px-4 py-2 text-xs text-muted-foreground">{r.code}</td>
              <td className="px-2 py-2">{r.name}</td>
              <td className="tabular px-4 py-2 text-right">{bdt(r.amount)}</td>
            </tr>
          ))}
          <tr className="bg-muted/40 font-semibold">
            <td className="px-4 py-2" colSpan={2}>Total {title.toLowerCase()}</td>
            <td className="tabular px-4 py-2 text-right">{bdt(total)}</td>
          </tr>
        </tbody>
      </table>
    </Section>
  );

  return (
    <>
      <PageHeader
        title="Income & Expenditure"
        description="Statement for the current fiscal year to 15 August 2026, all funds consolidated."
        breadcrumb={["Accounts", "Income & Expenditure"]}
        actions={
          <Button size="sm" variant="outline" onClick={() => toast.success("Statement export queued")}>
            <Download className="size-4" /> Export
          </Button>
        }
      />
      <div className="space-y-4 p-4 sm:p-6">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-md bg-border lg:grid-cols-4">
          <KpiCard label="Total income" value={bdt(data?.totalRevenue ?? 0, true)} tone="success" />
          <KpiCard label="Total expenditure" value={bdt(data?.totalExpense ?? 0, true)} tone="danger" />
          <KpiCard label="Surplus" value={bdt(data?.surplus ?? 0, true)} tone="primary" />
          <KpiCard label="Surplus margin" value={`${data?.margin ?? 0}%`} tone="info" />
        </div>
        <Section title="Monthly income vs expenditure">
          <div className="p-4">
            {isLoading ? <TableSkeleton rows={4} cols={3} /> : (
              <DualBarChart
                data={data?.monthly ?? []}
                xKey="month"
                series={[
                  { key: "revenue", label: "Income", color: "var(--color-chart-1)" },
                  { key: "expense", label: "Expenditure", color: "var(--color-chart-4)" },
                ]}
                height={280}
              />
            )}
          </div>
        </Section>
        <div className="grid gap-4 lg:grid-cols-2">
          {table("Income", data?.revenue ?? [], data?.totalRevenue ?? 0)}
          {table("Expenditure", data?.expenses ?? [], data?.totalExpense ?? 0)}
        </div>
      </div>
    </>
  );
}
