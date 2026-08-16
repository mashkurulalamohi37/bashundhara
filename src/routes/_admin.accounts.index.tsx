import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowDownRight, ArrowUpRight, BookOpenCheck, Banknote, FileWarning, Landmark,
  PiggyBank, Receipt, Scale, TrendingUp, Wallet,
} from "lucide-react";
import { PageHeader, KpiCard, Section, StatLine, StatusBadge, TableSkeleton } from "@/components/app/primitives";
import { DonutChart, DualBarChart } from "@/components/app/charts";
import { Button } from "@/components/ui/button";
import { accountsDashboardService, reportingService } from "@/services";
import { bdt } from "@/lib/format";

export const Route = createFileRoute("/_admin/accounts/")({
  head: () => ({
    meta: [
      { title: "Accounts Dashboard — Bashundhara R/A" },
      { name: "description", content: "Community-wide accounting position: cash, receivables, payables, surplus and period status." },
      { property: "og:title", content: "Accounts Dashboard — Bashundhara R/A" },
      { property: "og:description", content: "Community-wide accounting position: cash, receivables, payables, surplus and period status." },
    ],
  }),
  component: Page,
});

const QUICK = [
  { to: "/accounts/journal", label: "Journal entries", icon: BookOpenCheck },
  { to: "/accounts/trial-balance", label: "Trial balance", icon: Scale },
  { to: "/accounts/profit-loss", label: "Income & expenditure", icon: TrendingUp },
  { to: "/accounts/balance-sheet", label: "Balance sheet", icon: Landmark },
  { to: "/accounts/receivables", label: "Receivables", icon: Receipt },
  { to: "/accounts/payables", label: "Payables", icon: FileWarning },
  { to: "/accounts/cash-bank", label: "Cash & bank", icon: Wallet },
  { to: "/accounts/reconciliation", label: "Reconciliation", icon: Banknote },
] as const;

function Page() {
  const dash = useQuery({ queryKey: ["accounts-dashboard"], queryFn: () => accountsDashboardService.summary() });
  const ar = useQuery({ queryKey: ["ar-aging"], queryFn: () => reportingService.arAging() });
  const ap = useQuery({ queryKey: ["ap-aging"], queryFn: () => reportingService.apAging() });
  const d = dash.data;

  return (
    <>
      <PageHeader
        title="Accounts Dashboard"
        description="Double-entry position for the whole community: funds, dues, liabilities and period control."
        breadcrumb={["Accounts", "Dashboard"]}
        actions={
          <>
            <Button asChild size="sm" variant="outline">
              <Link to="/accounts/periods">Period control</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/accounts/journal">New journal entry</Link>
            </Button>
          </>
        }
      />

      <div className="space-y-4 p-4 sm:p-6">
        {!d ? (
          <Section><TableSkeleton rows={6} cols={4} /></Section>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-md bg-border lg:grid-cols-5">
              <KpiCard label="Cash & bank" value={bdt(d.cashAndBank, true)} icon={Wallet} tone="primary" hint={`${d.openPeriods} open period(s)`} />
              <KpiCard label="Receivable" value={bdt(d.receivable, true)} icon={ArrowDownRight} tone="warning" hint={`${bdt(d.overdueReceivable, true)} overdue`} />
              <KpiCard label="Payable" value={bdt(d.payable, true)} icon={ArrowUpRight} tone="danger" hint={`${bdt(d.overduePayable, true)} overdue`} />
              <KpiCard label="Surplus (YTD)" value={bdt(d.surplusYtd, true)} icon={TrendingUp} tone="success" hint={`Collection rate ${d.collectionRate}%`} />
              <KpiCard label="Net asset value" value={bdt(d.netAssetValue, true)} icon={PiggyBank} tone="info" hint="After accumulated depreciation" />
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <Section title="Income vs expenditure" description="Last 12 months, all funds" className="lg:col-span-2">
                <div className="p-4">
                  <DualBarChart
                    data={d.monthly}
                    xKey="month"
                    series={[
                      { key: "revenue", label: "Income", color: "var(--color-chart-1)" },
                      { key: "expense", label: "Expenditure", color: "var(--color-chart-4)" },
                    ]}
                    height={260}
                  />
                </div>
              </Section>
              <Section title="Expenditure mix" description="Top cost heads">
                <div className="p-4">
                  <DonutChart data={d.expenseMix} height={260} />
                </div>
              </Section>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <Section title="Receivable ageing" description="Outstanding dues by bucket">
                <dl className="px-4 py-2">
                  {(ar.data?.summary ?? []).map((b) => (
                    <StatLine key={b.bucket} label={b.label} value={`${bdt(b.amount, true)} · ${b.count}`} />
                  ))}
                  <StatLine label="Total outstanding" value={<span className="font-semibold">{bdt(ar.data?.total ?? 0)}</span>} />
                </dl>
              </Section>
              <Section title="Payable ageing" description="Vendor and utility liabilities">
                <dl className="px-4 py-2">
                  {(ap.data?.summary ?? []).map((b) => (
                    <StatLine key={b.bucket} label={b.label} value={`${bdt(b.amount, true)} · ${b.count}`} />
                  ))}
                  <StatLine label="Total outstanding" value={<span className="font-semibold">{bdt(ap.data?.total ?? 0)}</span>} />
                </dl>
              </Section>
              <Section title="Control checks" description="Requires accountant attention">
                <dl className="px-4 py-2">
                  <StatLine label="Unposted draft entries" value={d.unpostedEntries} />
                  <StatLine label="Unmatched bank lines" value={d.reconciliationGap} />
                  <StatLine label="Open fiscal periods" value={d.openPeriods} />
                  <StatLine label="Income booked (YTD)" value={bdt(d.revenueYtd)} />
                  <StatLine label="Expenditure booked (YTD)" value={bdt(d.expenseYtd)} />
                </dl>
              </Section>
            </div>

            <Section title="Recent journal activity" description="Latest entries across all source modules">
              <ul className="divide-y divide-border">
                {d.recentEntries.map((e) => (
                  <li key={e.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{e.entryNo} · {e.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {e.date} · {e.lines[0]?.accountCode} → {e.lines[1]?.accountCode} · source: {e.source.replace(/_/g, " ")}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="tabular text-sm font-semibold">{bdt(e.totalDebit)}</span>
                      <StatusBadge value={e.status} />
                    </div>
                  </li>
                ))}
              </ul>
            </Section>

            <Section title="Accounting workspaces">
              <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
                {QUICK.map((q) => (
                  <Link key={q.to} to={q.to} className="flex items-center gap-3 bg-card p-4 text-sm hover:bg-accent">
                    <q.icon className="size-4 text-primary" />
                    {q.label}
                  </Link>
                ))}
              </div>
            </Section>
          </>
        )}
      </div>
    </>
  );
}
