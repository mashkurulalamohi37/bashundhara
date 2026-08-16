import { useSyncExternalStore } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Wrench, ShieldCheck, Timer, AlertCircle, CheckCircle2 } from "lucide-react";
import { PageHeader, Section } from "@/components/app/primitives";
import { facilityStore, getFacilitySnapshot } from "@/services/facilityStore";

export const Route = createFileRoute("/_admin/facility/maintenance")({
  head: () => ({
    meta: [
      { title: "Maintenance Management — Facility Core Service" },
      { name: "description", content: "Facility maintenance strategies: Preventive, Corrective, Emergency, Breakdown, Inspection, Predictive." },
    ],
  }),
  component: FacilityMaintenancePage,
});

function FacilityMaintenancePage() {
  const store = useSyncExternalStore(facilityStore.getSummary ? () => {} : () => {}, getFacilitySnapshot);

  return (
    <>
      <PageHeader
        title="Facility Maintenance Strategies & Workflows"
        description="Preventive, Corrective, Breakdown, Emergency & Predictive maintenance routines for community infrastructure."
        breadcrumb={["Facility", "Maintenance"]}
      />

      <div className="space-y-6 p-4 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { type: "Preventive", desc: "Scheduled 30-day/90-day servicing routines to avoid equipment failure.", link: "/facility/preventive-maintenance" },
            { type: "Corrective", desc: "Work order jobs issued to repair identified defects and mechanical seal leaks.", link: "/facility/work-orders" },
            { type: "Breakdown & Emergency", desc: "Immediate 15–30 min SLA response for lift entrapments, generator outages, or main water leaks.", link: "/facility/work-orders" },
          ].map((m) => (
            <div key={m.type} className="rounded-xl border border-border bg-card p-5 space-y-3 shadow-sm">
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <Wrench className="size-4 text-primary" /> {m.type}
              </h3>
              <p className="text-xs text-muted-foreground">{m.desc}</p>
              <Link to={m.link} className="text-xs font-semibold text-primary hover:underline block pt-2">
                Manage {m.type} →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
