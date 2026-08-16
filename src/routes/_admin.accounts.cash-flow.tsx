import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader, KpiCard, Section, TableSkeleton } from "@/components/app/primitives";
import { TrendAreaChart } from "@/components/app/charts";
import { reportingService } from "@/services";
import { bdt } from "@/lib/format";

export const Route = createFileRoute("/_admin/accounts/cash-flow")({
  head: () => ({
    meta: [
      { title: "Cash Flow — Bashundhara R/A" },
      { name: "description", content: "Operating, investing and financing cash movement with opening and closing cash." },
      { property: "og:title", content: "Cash Flow — Bashundhara R/A" },
      { property: "og:description", content: "Operating, investing and financing cash movement with opening and closing cash." },
    ],
  }),
  component: Page,
});

function Page() {
  const { data, isLoading } = useQuery({ queryKey: ["cash-flow"], queryFn: () => reportingService.cashFlow() });
  const block = (title: string, rows: { code: string; name: string; amount: number }[], total: number) => (
    <Section title={title}>
      <table className="w-full text-sm">
        <tbody>
          {rows.map((r, i) => (
            <tr key={`${title}-${r.code}-${i}`} className="border-b border-border last:border-0">
              <td className="px-4 py-2">{r.name}</td>
              <td className={`tabular px-4 py-2 text-right ${r.amount < 0 ? "text-destructive" : "text-success"}`}>{bdt(r.amount)}</td>
            </tr>
          ))}
          <tr className="bg-muted/40 font-semibold">
            <td className="px-4 py-2">Net {title.toLowerCase()}</td>
            <td className="tabular px-4 py-2 text-right">{bdt(total)}</td>
          </tr>
        </tbody>
      </table>
    </Section>
  );

  return (
    <>
      <PageHeader
        title="Cash Flow Statement"
        description="Where community money came from and where it went, across the last twelve months."
        breadcrumb={["Accounts", "Cash Flow"]}
      />
      <div className="space-y-4 p-4 sm:p-6">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-md bg-border lg:grid-cols-4">
          <KpiCard label="Opening cash" value={bdt(data?.openingCash ?? 0, true)} tone="neutral" />
          <KpiCard label="Net operating" value={bdt(data?.netOperating ?? 0, true)} tone="success" />
          <KpiCard label="Net investing" value={bdt(data?.netInvesting ?? 0, true)} tone="warning" />
          <KpiCard label="Closing cash" value={bdt(data?.closingCash ?? 0, true)} tone="primary" />
        </div>
        <Section title="Monthly cash movement">
          <div className="p-4">
            {isLoading ? <TableSkeleton rows={4} cols={3} /> : (
              <TrendAreaChart
                data={data?.monthly ?? []}
                xKey="month"
                series={[
                  { key: "inflow", label: "Inflow", color: "var(--color-chart-1)" },
                  { key: "outflow", label: "Outflow", color: "var(--color-chart-4)" },
                ]}
                height={280}
              />
            )}
          </div>
        </Section>
        <div className="grid gap-4 lg:grid-cols-3">
          {block("Operating activities", data?.operating ?? [], data?.netOperating ?? 0)}
          {block("Investing activities", data?.investing ?? [], data?.netInvesting ?? 0)}
          {block("Financing activities", data?.financing ?? [], data?.netFinancing ?? 0)}
        </div>
      </div>
    </>
  );
}
