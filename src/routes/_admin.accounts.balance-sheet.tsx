import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, KpiCard, Section, TableSkeleton } from "@/components/app/primitives";
import { Button } from "@/components/ui/button";
import { reportingService } from "@/services";
import { bdt } from "@/lib/format";

export const Route = createFileRoute("/_admin/accounts/balance-sheet")({
  head: () => ({
    meta: [
      { title: "Balance Sheet — Bashundhara R/A" },
      { name: "description", content: "Statement of assets, liabilities and community funds as at the reporting date." },
      { property: "og:title", content: "Balance Sheet — Bashundhara R/A" },
      { property: "og:description", content: "Statement of assets, liabilities and community funds as at the reporting date." },
    ],
  }),
  component: Page,
});

function Page() {
  const { data, isLoading } = useQuery({ queryKey: ["balance-sheet"], queryFn: () => reportingService.balanceSheet() });
  const block = (title: string, rows: { code: string; name: string; amount: number }[], total: number) => (
    <Section title={title}>
      <table className="w-full text-sm">
        <tbody>
          {rows.map((r) => (
            <tr key={`${title}-${r.code}`} className="border-b border-border last:border-0">
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
        title="Balance Sheet"
        description="As at 15 August 2026 · consolidated community position."
        breadcrumb={["Accounts", "Balance Sheet"]}
        actions={<Button size="sm" variant="outline" onClick={() => toast.success("Balance sheet export queued")}><Download className="size-4" /> Export</Button>}
      />
      <div className="space-y-4 p-4 sm:p-6">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-md bg-border lg:grid-cols-4">
          <KpiCard label="Total assets" value={bdt(data?.totalAssets ?? 0, true)} tone="primary" />
          <KpiCard label="Total liabilities" value={bdt(data?.totalLiabilities ?? 0, true)} tone="danger" />
          <KpiCard label="Funds & equity" value={bdt(data?.totalEquity ?? 0, true)} tone="info" />
          <KpiCard label="Balance check" value={data?.balanced ? "Balanced" : "Out of balance"} tone={data?.balanced ? "success" : "danger"} hint="Assets = Liabilities + Funds" />
        </div>
        {isLoading ? <Section><TableSkeleton rows={8} cols={3} /></Section> : (
          <div className="grid gap-4 lg:grid-cols-2">
            {block("Assets", data?.assets ?? [], data?.totalAssets ?? 0)}
            <div className="space-y-4">
              {block("Liabilities", data?.liabilities ?? [], data?.totalLiabilities ?? 0)}
              {block("Funds & Equity", data?.equity ?? [], data?.totalEquity ?? 0)}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
