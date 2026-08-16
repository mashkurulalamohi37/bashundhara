import { useSyncExternalStore } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, ShieldCheck, FileText, AlertCircle, Wrench } from "lucide-react";
import { PageHeader, Section, StatusBadge } from "@/components/app/primitives";
import { facilityStore, getFacilitySnapshot } from "@/services/facilityStore";

export const Route = createFileRoute("/_admin/facility/inspections")({
  head: () => ({
    meta: [
      { title: "Facility Inspections — Facility Core Service" },
      { name: "description", content: "Facility Inspection System: Safety, Electrical, Fire, Lift, Water quality, Corrective action workflows." },
    ],
  }),
  component: FacilityInspectionsPage,
});

function FacilityInspectionsPage() {
  const store = useSyncExternalStore(facilityStore.getSummary ? () => {} : () => {}, getFacilitySnapshot);

  return (
    <>
      <PageHeader
        title="Facility Inspections & Corrective Action System"
        description="Safety, Electrical, Fire, Lift and Building Envelope inspections. Failed findings trigger corrective Work Orders."
        breadcrumb={["Facility", "Inspections"]}
      />

      <div className="space-y-6 p-4 sm:p-6">
        <Section title="Recent Facility Inspections Log" description="Inspections conducted by internal officers & external authorities">
          <div className="divide-y divide-border rounded-xl border border-border bg-card overflow-hidden text-xs">
            <div className="grid grid-cols-6 gap-2 bg-muted/60 p-3 font-semibold text-muted-foreground">
              <span>Code & Type</span>
              <span>Inspection Target</span>
              <span>Inspector</span>
              <span>Date</span>
              <span>Findings Summary</span>
              <span className="text-right">Outcome</span>
            </div>
            {store.inspections.map((ins) => (
              <div key={ins.id} className="grid grid-cols-6 gap-2 p-3 items-center hover:bg-muted/20">
                <div>
                  <span className="font-mono font-bold text-primary">{ins.inspectionCode}</span>
                  <p className="text-[10px] text-muted-foreground">{ins.type} Inspection</p>
                </div>
                <span className="font-medium">{ins.targetName}</span>
                <span>{ins.assignedInspector}</span>
                <span>{ins.scheduledDate}</span>
                <span className="truncate">{ins.findings}</span>
                <span className="text-right"><StatusBadge value={ins.status} /></span>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </>
  );
}
