import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Banknote, Building2, Receipt, Users, Wallet, Wrench } from "lucide-react";
import { PageHeader, Section, KpiCard, StatusBadge } from "@/components/app/primitives";
import { DualBarChart } from "@/components/app/charts";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  buildingFinanceService, buildingService, buildingStaffService, purchaseRequestService, tenantService,
} from "@/services";
import { bdt, titleize } from "@/lib/format";

export const Route = createFileRoute("/_admin/building/overview")({
  head: () => ({
    meta: [
      { title: "Building Owner Dashboard — Bashundhara R/A" },
      { name: "description", content: "Building ERP command view: income, expenses, net position, pending rent, utility and vendor dues, staff payroll and procurement." },
      { property: "og:title", content: "Building Owner Dashboard — Bashundhara R/A" },
      { property: "og:description", content: "Multi-building financial and operational control for building owners and managers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: OwnerDashboard,
});

function OwnerDashboard() {
  const [buildingId, setBuildingId] = useState<string>("all");
  const { data: buildings = [] } = useQuery({ queryKey: ["buildings"], queryFn: () => buildingService.all() });
  const { data: pnl } = useQuery({ queryKey: ["building-pnl", buildingId], queryFn: () => buildingFinanceService.pnl(buildingId) });
  const { data: tenants = [] } = useQuery({ queryKey: ["tenants"], queryFn: () => tenantService.all() });
  const { data: staff = [] } = useQuery({ queryKey: ["building-staff"], queryFn: () => buildingStaffService.all() });
  const { data: purchases = [] } = useQuery({ queryKey: ["purchase-requests"], queryFn: () => purchaseRequestService.all() });

  const scoped = <T extends { buildingId: string }>(rows: T[]) =>
    buildingId === "all" ? rows : rows.filter((r) => r.buildingId === buildingId);
  const scopedTenants = scoped(tenants);
  const pendingApprovals = scoped(purchases).filter((p) => p.status === "pending_approval" || p.status === "requested");

  return (
    <>
      <PageHeader
        title="Building Owner Dashboard"
        description="Financial and operational position across your buildings — income, expenses, rent, dues and approvals."
        breadcrumb={["Building Management", "Owner Dashboard"]}
        actions={
          <Select value={buildingId} onValueChange={setBuildingId}>
            <SelectTrigger className="h-9 w-56"><SelectValue placeholder="All buildings" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All buildings</SelectItem>
              {buildings.map((b) => (
                <SelectItem key={b.id} value={b.id}>{b.name} · {b.road}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />
      <div className="space-y-4 p-4 sm:p-6">
        <div className="grid gap-px overflow-hidden rounded-md sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard label="Monthly income" value={bdt(pnl?.totalRevenue ?? 0, true)} hint="Rent, parking, service charges" icon={Wallet} tone="success" />
          <KpiCard label="Expenses" value={bdt(pnl?.totalExpense ?? 0, true)} hint="Staff, utilities, maintenance" icon={Receipt} tone="warning" />
          <KpiCard label="Net income" value={bdt(pnl?.net ?? 0, true)} hint="Revenue less expenses" icon={Banknote} tone={(pnl?.net ?? 0) >= 0 ? "success" : "danger"} />
          <KpiCard label="Buildings" value={buildingId === "all" ? String(buildings.length) : "1"} hint="Under management" icon={Building2} tone="info" />
        </div>

        <div className="grid gap-px overflow-hidden rounded-md sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard label="Pending rent" value={bdt(pnl?.pendingRent ?? 0, true)} hint="Uncollected this cycle" icon={Wallet} tone="warning" />
          <KpiCard label="Utility due" value={bdt(pnl?.utilityDue ?? 0, true)} hint="Electricity, water, gas, generator" icon={Receipt} tone="warning" />
          <KpiCard label="Vendor due" value={bdt(pnl?.vendorDue ?? 0, true)} hint="Payable to contracted vendors" icon={Wrench} tone="danger" />
          <KpiCard label="Staff salary" value={bdt(pnl?.staffSalary ?? 0, true)} hint={`${scoped(staff).length} building staff`} icon={Users} tone="neutral" />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Section title="Revenue vs expenses" description="Last five months" className="lg:col-span-2">
            <div className="p-3">
              <DualBarChart
                data={(pnl?.monthly ?? []) as unknown as Record<string, string | number>[]}
                xKey="month"
                series={[
                  { key: "revenue", label: "Revenue", color: "var(--color-chart-1)" },
                  { key: "expense", label: "Expenses", color: "var(--color-chart-3)" },
                ]}
                height={260}
              />
            </div>
          </Section>
          <Section title="Top expense categories">
            <ul className="divide-y divide-border">
              {(pnl?.expenses ?? []).slice(0, 8).map((e) => (
                <li key={e.label} className="flex items-center justify-between gap-3 px-4 py-2.5">
                  <span className="truncate text-sm">{e.label}</span>
                  <span className="tabular text-sm font-medium">{bdt(e.amount, true)}</span>
                </li>
              ))}
            </ul>
          </Section>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Section
            title="Rent position"
            description="Tenants with due or overdue rent"
            actions={<Link to="/building/rent" className="text-xs text-primary hover:underline">Rent ledger</Link>}
          >
            <ul className="divide-y divide-border">
              {scopedTenants.filter((t) => t.paymentStatus !== "paid").slice(0, 7).map((t) => (
                <li key={t.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{t.name}</span>
                    <span className="block text-xs text-muted-foreground">{t.flatId} · due day {t.rentDueDay} · owner {t.ownerName}</span>
                  </span>
                  <span className="flex items-center gap-3">
                    <span className="tabular text-sm">{bdt(t.monthlyRent)}</span>
                    <StatusBadge value={t.paymentStatus} />
                  </span>
                </li>
              ))}
            </ul>
          </Section>

          <Section
            title="Approvals waiting on you"
            description="Thresholds: under ৳5,000 caretaker · ৳5,000–৳50,000 manager · above ৳50,000 owner"
            actions={<Link to="/building/procurement" className="text-xs text-primary hover:underline">Procurement</Link>}
          >
            <ul className="divide-y divide-border">
              {pendingApprovals.slice(0, 7).map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{p.item}</span>
                    <span className="block text-xs text-muted-foreground">{p.id} · {p.vendor} · {titleize(p.approvalTier)}</span>
                  </span>
                  <span className="flex items-center gap-3">
                    <span className="tabular text-sm">{bdt(p.estimatedCost)}</span>
                    <StatusBadge value={p.status} />
                  </span>
                </li>
              ))}
            </ul>
          </Section>
        </div>
      </div>
    </>
  );
}
