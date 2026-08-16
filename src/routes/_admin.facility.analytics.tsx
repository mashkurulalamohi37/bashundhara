import { useSyncExternalStore } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { BarChart3, TrendingUp, Clock, ShieldCheck, Wrench, Zap } from "lucide-react";
import { PageHeader, Section, KpiCard } from "@/components/app/primitives";
import { facilityStore, getFacilitySnapshot } from "@/services/facilityStore";
import { bdt } from "@/lib/format";

export const Route = createFileRoute("/_admin/facility/analytics")({
  head: () => ({
    meta: [
      { title: "Facility Analytics & Downtime — Facility Core Service" },
      { name: "description", content: "Facility analytics: Asset availability, top 10 downtime assets, vendor SLA compliance, utility trends, preventive vs corrective ratio." },
    ],
  }),
  component: FacilityAnalyticsPage,
});

function FacilityAnalyticsPage() {
  const store = useSyncExternalStore(facilityStore.getSummary ? () => {} : () => {}, getFacilitySnapshot);
  const summary = facilityStore.getSummary();

  return (
    <>
      <PageHeader
        title="Facility Operations Analytics & Asset Downtime"
        description="Asset uptime performance, top downtime equipment, PM vs Corrective maintenance ratios, and vendor SLA benchmarks."
        breadcrumb={["Facility", "Analytics"]}
      />

      <div className="space-y-6 p-4 sm:p-6">
        {/* KPI Strip */}
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-md bg-border lg:grid-cols-4">
          <KpiCard label="Asset Uptime Availability" value="98.8%" hint="Overall equipment uptime" icon={ShieldCheck} tone="success" />
          <KpiCard label="PM vs Corrective Ratio" value="65% / 35%" hint="Target: >60% PM" icon={BarChart3} tone="info" />
          <KpiCard label="Avg Repair Resolution" value="3.2 Hours" hint="Work Order resolution time" icon={Clock} tone="primary" />
          <KpiCard label="Vendor SLA Compliance" value="96.2%" hint="On-time AMC visits" icon={TrendingUp} tone="success" />
        </div>

        {/* Top 10 Downtime Assets Table */}
        <Section title="Top Equipment by Downtime Hours (Last 90 Days)" description="Tracks cumulative asset unavailability and downtime root causes">
          <div className="divide-y divide-border rounded-xl border border-border bg-card overflow-hidden text-xs">
            <div className="grid grid-cols-5 gap-2 bg-muted/60 p-3 font-semibold text-muted-foreground">
              <span>Asset Code & Name</span>
              <span>Category</span>
              <span>Building</span>
              <span>Total Downtime</span>
              <span className="text-right">Primary Cause</span>
            </div>
            {[
              { code: "PMP-A-002", name: "Main Water Hydro-Pneumatic Pump System", cat: "Water Pump", building: "Meghna Tower", downtime: "18.5 Hours", cause: "Bearing seal leakage & mechanical repair" },
              { code: "LFT-A-001", name: "Passenger Elevator #1", cat: "Lift", building: "Meghna Tower", downtime: "4.2 Hours", cause: "Door sensor recalibration" },
              { code: "GEN-A-001", name: "Primary Diesel Generator 500kVA", cat: "Generator", building: "Meghna Tower", downtime: "2.0 Hours", cause: "Scheduled monthly PM ATS load test" },
            ].map((d) => (
              <div key={d.code} className="grid grid-cols-5 gap-2 p-3 items-center hover:bg-muted/20">
                <div>
                  <span className="font-mono font-bold text-primary">{d.code}</span>
                  <p className="font-medium text-foreground">{d.name}</p>
                </div>
                <span>{d.cat}</span>
                <span>{d.building}</span>
                <span className="font-bold text-red-600 dark:text-red-400">{d.downtime}</span>
                <span className="text-right text-muted-foreground">{d.cause}</span>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </>
  );
}
