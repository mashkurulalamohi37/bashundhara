import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Building2, Car, ShieldCheck, Users, Wallet, Wrench } from "lucide-react";
import { PageHeader, Section, KpiCard, StatusBadge, TableSkeleton } from "@/components/app/primitives";
import { TrendAreaChart, DualBarChart, DonutChart } from "@/components/app/charts";
import { CommunityMap } from "@/components/app/community-map";
import { dashboardService } from "@/services";
import * as db from "@/mock/data";
import { bdt, num } from "@/lib/format";

export const Route = createFileRoute("/_admin/dashboard")({
  head: () => ({
    meta: [
      { title: "Command Center — Bashundhara R/A" },
      { name: "description", content: "Live community command center: residents, gate activity, incidents, maintenance SLA and collections for Bashundhara R/A." },
      { property: "og:title", content: "Community Command Center — Bashundhara R/A" },
      { property: "og:description", content: "Real-time operational overview of Bashundhara Residential Area." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { data, isLoading } = useQuery({ queryKey: ["dashboard"], queryFn: () => dashboardService.summary() });
  const { data: services = [] } = useQuery({ queryKey: ["service-health"], queryFn: () => dashboardService.infrastructureStatus() });

  return (
    <>
      <PageHeader
        title="Community Command Center"
        description="Bashundhara Residential Area, Dhaka — live operational overview across security, services and finance."
        breadcrumb={["Overview", "Command Center"]}
      />
      <div className="space-y-4 p-4 sm:p-6">
        {isLoading || !data ? (
          <TableSkeleton rows={4} cols={4} />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard label="Residents" value={num(data.residents)} hint={`${num(data.families)} families`} icon={Users} tone="neutral" />
            <KpiCard label="Properties" value={num(data.properties)} hint={`${num(data.occupied)} occupied · ${num(data.vacant)} vacant`} icon={Building2} tone="neutral" />
            <KpiCard label="Visitors today" value={num(data.visitorsToday)} hint={`${num(data.vehicleEntriesToday)} vehicle entries`} icon={Car} tone="info" />
            <KpiCard label="Officers on duty" value={num(data.officersOnDuty)} hint={`${data.camerasOnline}/${data.camerasTotal} cameras online`} icon={ShieldCheck} tone="success" />
            <KpiCard label="Open complaints" value={num(data.openComplaints)} hint="Across all departments" icon={Wrench} tone="warning" />
            <KpiCard label="Active emergencies" value={num(data.activeEmergencies)} hint="Response teams dispatched" icon={AlertTriangle} tone={data.activeEmergencies > 0 ? "danger" : "success"} />
            <KpiCard label="Collection this month" value={bdt(data.collectionThisMonth, true)} hint={`${bdt(data.outstanding, true)} outstanding`} icon={Wallet} tone="success" />
            <KpiCard label="Pending approvals" value={num(data.pendingApprovals)} hint="Visitor passes & bookings" icon={ShieldCheck} tone="warning" />
          </div>
        )}

        <div className="grid gap-4 xl:grid-cols-3">
          <Section title="Visitor & delivery volume" description="Last 14 days" className="xl:col-span-2">
            <div className="p-3">
              <TrendAreaChart
                data={db.visitorTrend}
                xKey="day"
                series={[
                  { key: "visitors", label: "Visitors", color: "var(--color-chart-1)" },
                  { key: "deliveries", label: "Deliveries", color: "var(--color-chart-2)" },
                ]}
              />
            </div>
          </Section>
          <Section title="Service health" description="Core community services">
            <ul className="divide-y divide-border">
              {services.map((s) => (
                <li key={s.name} className="flex items-center justify-between gap-3 px-4 py-2.5">
                  <span className="min-w-0">
                    <span className="block text-sm font-medium">{s.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">{s.detail}</span>
                  </span>
                  <StatusBadge value={s.status} />
                </li>
              ))}
            </ul>
          </Section>
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          <Section title="Collection vs outstanding" description="Rolling 12 months (BDT)" className="xl:col-span-2">
            <div className="p-3">
              <DualBarChart
                data={db.collectionTrend}
                xKey="month"
                series={[
                  { key: "collected", label: "Collected", color: "var(--color-chart-1)" },
                  { key: "outstanding", label: "Outstanding", color: "var(--color-chart-4)" },
                ]}
              />
            </div>
          </Section>
          <Section title="Complaints by category" description="Current open volume">
            <div className="p-3">
              <DonutChart
                data={db.complaintsByCategory.slice(0, 6).map((c, i) => ({
                  name: c.category,
                  value: c.count,
                  color: `var(--color-chart-${(i % 5) + 1})`,
                }))}
              />
            </div>
          </Section>
        </div>

        <Section title="Community map" description="Blocks, gates, CCTV, incidents and emergencies">
          <div className="p-3">
            <CommunityMap markers={db.mapMarkers} />
          </div>
        </Section>
      </div>
    </>
  );
}
