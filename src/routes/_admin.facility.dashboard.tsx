import { useSyncExternalStore } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity, AlertTriangle, BadgeCheck, Boxes, Building2, CheckCircle2, Clock,
  FileWarning, Flame, Gauge, HardHat, Layers, LifeBuoy, PackageCheck, Radio,
  ShieldCheck, Siren, Sparkles, Stethoscope, Store, Timer, Truck, UserCheck,
  Wallet, Wrench, Zap, ArrowUpRight, ChevronRight, BarChart3,
} from "lucide-react";
import { PageHeader, Section, KpiCard, StatusBadge } from "@/components/app/primitives";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { facilityStore, getFacilitySnapshot } from "@/services/facilityStore";
import { bdt } from "@/lib/format";

export const Route = createFileRoute("/_admin/facility/dashboard")({
  head: () => ({
    meta: [
      { title: "Facility Control Center — Bashundhara R/A" },
      { name: "description", content: "Enterprise Facility Management System: assets, work orders, preventive maintenance, utilities, housekeeping, AMC, and compliance." },
    ],
  }),
  component: FacilityDashboardPage,
});

function FacilityDashboardPage() {
  const store = useSyncExternalStore(facilityStore.getSummary ? () => {} : () => {}, getFacilitySnapshot);
  const summary = facilityStore.getSummary();

  return (
    <>
      <PageHeader
        title="Facility Control Center"
        description="Physical infrastructure operating system — Bashundhara Residential Area community facilities."
        breadcrumb={["Facility", "Dashboard"]}
        actions={
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" asChild>
              <Link to="/facility/control-room">
                <Radio className="mr-1.5 size-4 text-red-500 animate-pulse" /> Live Control Room
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/facility/work-orders">
                <Wrench className="mr-1.5 size-4" /> Work Orders ({summary.openWorkOrders})
              </Link>
            </Button>
          </div>
        }
      />

      <div className="space-y-6 p-4 sm:p-6">
        {/* KPI Strip - Row 1 */}
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-md bg-border sm:grid-cols-3 xl:grid-cols-6">
          <KpiCard
            label="Total Assets"
            value={summary.totalAssets.toLocaleString()}
            hint={`${summary.activeAssets} active / ${summary.underMaintenanceAssets} maintenance`}
            icon={Building2}
            tone="primary"
          />
          <KpiCard
            label="Open Work Orders"
            value={String(summary.openWorkOrders)}
            hint={`${summary.criticalIssuesCount} critical priority`}
            icon={Wrench}
            tone={summary.criticalIssuesCount > 0 ? "warning" : "info"}
          />
          <KpiCard
            label="Preventive Due"
            value={String(summary.overdueMaintenanceCount)}
            hint="Scheduled maintenance"
            icon={Timer}
            tone={summary.overdueMaintenanceCount > 0 ? "warning" : "success"}
          />
          <KpiCard
            label="AMC Contracts"
            value={String(summary.activeAMCContracts)}
            hint={`${summary.amcExpiringSoonCount} expiring soon`}
            icon={ShieldCheck}
            tone={summary.amcExpiringSoonCount > 0 ? "warning" : "info"}
          />
          <KpiCard
            label="Monthly Utility"
            value={bdt(summary.monthlyUtilityCostBDT, true)}
            hint="Power, water & gas"
            icon={Zap}
            tone="neutral"
          />
          <KpiCard
            label="Compliance Alerts"
            value={String(summary.complianceAlertsCount)}
            hint={`${summary.expiredCertificatesCount} expired certificates`}
            icon={FileWarning}
            tone={summary.complianceAlertsCount > 0 ? "warning" : "success"}
          />
        </div>

        {/* Operational Modules Navigation Cards */}
        <Section title="Facility Management Core Services" description="Unified operational backbone for community assets, maintenance, utilities and compliance.">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { to: "/facility/assets", title: "Asset Management", desc: "1,284 assets · Generators, Lifts, Pumps, Electrical", icon: Building2, color: "text-blue-500 bg-blue-50 dark:bg-blue-950/30" },
              { to: "/facility/work-orders", title: "Work Orders & SLA", desc: `${summary.openWorkOrders} open jobs · Auto dispatch & parts tracking`, icon: Wrench, color: "text-amber-500 bg-amber-50 dark:bg-amber-950/30" },
              { to: "/facility/preventive-maintenance", title: "Preventive Maintenance", desc: "30-day / 90-day recurring schedules & checklists", icon: Timer, color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30" },
              { to: "/facility/utilities", title: "Utility Monitoring", desc: "Meters, manual/IoT readings & consumption spikes", icon: Zap, color: "text-purple-500 bg-purple-50 dark:bg-purple-950/30" },
              { to: "/facility/housekeeping", title: "Housekeeping & Waste", desc: "Sanitation schedules, supervisor quality inspections", icon: Sparkles, color: "text-teal-500 bg-teal-50 dark:bg-teal-950/30" },
              { to: "/facility/amc", title: "AMC & Vendor Contracts", desc: "Annual contracts, vendor visits & SLA scorecards", icon: ShieldCheck, color: "text-indigo-500 bg-indigo-50 dark:bg-indigo-950/30" },
              { to: "/facility/compliance", title: "Compliance & Safety", desc: "Fire safety, lift certification, RAJUK clearances", icon: FileWarning, color: "text-rose-500 bg-rose-50 dark:bg-rose-950/30" },
              { to: "/facility/biomedical", title: "Biomedical Equipment", desc: "Community clinic patient monitors & calibration", icon: Stethoscope, color: "text-cyan-500 bg-cyan-50 dark:bg-cyan-950/30" },
              { to: "/facility/inventory", title: "Spare Parts & Stock", desc: "Maintenance tools, electrical stock & reorder levels", icon: Boxes, color: "text-orange-500 bg-orange-50 dark:bg-orange-950/30" },
              { to: "/facility/costing", title: "Costing & Budgets", desc: "Facility expenses, accounts payable & cost allocation", icon: Wallet, color: "text-green-500 bg-green-50 dark:bg-green-950/30" },
              { to: "/facility/analytics", title: "Facility Analytics", desc: "Asset uptime, downtime analysis & vendor performance", icon: BarChart3, color: "text-sky-500 bg-sky-50 dark:bg-sky-950/30" },
              { to: "/facility/structure", title: "Location Hierarchy", desc: "Community → Block → Building → Room → Asset tree", icon: Layers, color: "text-slate-500 bg-slate-50 dark:bg-slate-950/30" },
            ].map((m) => {
              const Icon = m.icon;
              return (
                <Link
                  key={m.to}
                  to={m.to}
                  className="group flex flex-col justify-between rounded-xl border border-border/80 bg-card p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md dark:border-border/60 dark:hover:border-primary/60 dark:hover:shadow-primary/5"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className={`grid size-9 place-items-center rounded-lg ${m.color}`}>
                        <Icon className="size-5" />
                      </div>
                      <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                    </div>
                    <h3 className="mt-3 font-semibold text-sm">{m.title}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">{m.desc}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </Section>

        {/* Live Work Orders & Critical Items Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Active Work Orders */}
          <Section
            title="Active Facility Work Orders"
            description="Real-time jobs dispatched to technicians and vendors"
            actions={
              <Link to="/facility/work-orders" className="text-xs text-primary hover:underline">
                View all ({summary.openWorkOrders}) →
              </Link>
            }
          >
            <div className="divide-y divide-border">
              {store.workOrders.slice(0, 5).map((wo) => (
                <div key={wo.id} className="flex items-start justify-between p-3 text-xs hover:bg-muted/30">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-foreground">{wo.workOrderCode}</span>
                      <Badge variant={wo.priority === "high" ? "destructive" : "secondary"} className="text-[10px] uppercase">
                        {wo.priority}
                      </Badge>
                      <span className="text-muted-foreground">{wo.maintenanceType}</span>
                    </div>
                    <p className="font-medium text-sm text-foreground">{wo.issue}</p>
                    <p className="text-muted-foreground">{wo.assetName} · {wo.location}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <StatusBadge value={wo.status} />
                    <p className="text-[10px] text-muted-foreground">Tech: {wo.assignedTechnician}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* AMC Contracts & Expiries */}
          <Section
            title="AMC Contracts & Expiry Alerts"
            description="Annual Maintenance Contracts for critical community machinery"
            actions={
              <Link to="/facility/amc" className="text-xs text-primary hover:underline">
                Manage AMCs →
              </Link>
            }
          >
            <div className="divide-y divide-border">
              {store.amcContracts.map((amc) => (
                <div key={amc.id} className="flex items-center justify-between p-3 text-xs hover:bg-muted/30">
                  <div>
                    <p className="font-semibold text-foreground">{amc.serviceType}</p>
                    <p className="text-muted-foreground">{amc.vendorName} · Asset: {amc.assetName}</p>
                    <p className="mt-0.5 text-[10px] text-amber-600 dark:text-amber-400">
                      Ends: {amc.endDate} ({amc.visitFrequency} visits)
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <StatusBadge value={amc.status} />
                    <p className="font-mono text-xs">{bdt(amc.contractValueBDT)}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </div>
      </div>
    </>
  );
}
