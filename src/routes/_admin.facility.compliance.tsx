import { useSyncExternalStore } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  AlertCircle, CheckCircle2, Clock, FileWarning, ShieldCheck, FileText, Download,
} from "lucide-react";
import { PageHeader, Section, StatusBadge } from "@/components/app/primitives";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { facilityStore, getFacilitySnapshot } from "@/services/facilityStore";

export const Route = createFileRoute("/_admin/facility/compliance")({
  head: () => ({
    meta: [
      { title: "Compliance & Safety — Facility Core Service" },
      { name: "description", content: "Facility Regulatory & Safety Compliance: Fire safety, Lift inspection, RAJUK clearance, Environmental certificates." },
    ],
  }),
  component: FacilityCompliancePage,
});

function FacilityCompliancePage() {
  const store = useSyncExternalStore(facilityStore.getSummary ? () => {} : () => {}, getFacilitySnapshot);

  return (
    <>
      <PageHeader
        title="Regulatory Compliance & Safety Certification"
        description="Fire safety clearances, elevator fitness certificates, environmental compliance, and authority inspection tracking."
        breadcrumb={["Facility", "Compliance"]}
      />

      <div className="space-y-6 p-4 sm:p-6">
        {/* Compliance Table */}
        <Section title="Compliance Requirements & Certificate Directory" description="Track inspection standards, authorities and renewal dates">
          <div className="divide-y divide-border rounded-xl border border-border bg-card overflow-hidden text-xs">
            <div className="grid grid-cols-6 gap-2 bg-muted/60 p-3 font-semibold text-muted-foreground">
              <span>Requirement</span>
              <span>Authority / Standard</span>
              <span>Asset / Building</span>
              <span>Certificate #</span>
              <span>Expiry Date</span>
              <span className="text-right">Compliance Status</span>
            </div>
            {store.complianceRequirements.map((c) => (
              <div key={c.id} className="grid grid-cols-6 gap-2 p-3 items-center hover:bg-muted/20">
                <div>
                  <span className="font-semibold text-foreground">{c.requirementName}</span>
                  <p className="text-[10px] text-muted-foreground">{c.requirementCode}</p>
                </div>
                <span>{c.authorityStandard}</span>
                <span>{c.assetName ?? "Community-wide"}</span>
                <span className="font-mono font-medium">{c.certificateNumber}</span>
                <span>{c.expiryDate}</span>
                <span className="text-right"><StatusBadge value={c.status} /></span>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </>
  );
}
