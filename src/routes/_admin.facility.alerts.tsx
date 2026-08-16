import { useSyncExternalStore } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, Siren, ShieldCheck, Zap, Timer, FileWarning } from "lucide-react";
import { PageHeader, Section, StatusBadge } from "@/components/app/primitives";
import { facilityStore, getFacilitySnapshot } from "@/services/facilityStore";

export const Route = createFileRoute("/_admin/facility/alerts")({
  head: () => ({
    meta: [
      { title: "Facility Alert Center — Facility Core Service" },
      { name: "description", content: "Central Alert Center for facility spikes, equipment breakdown, AMC expiries, low stock, and SLA breaches." },
    ],
  }),
  component: FacilityAlertsPage,
});

function FacilityAlertsPage() {
  const store = useSyncExternalStore(facilityStore.getSummary ? () => {} : () => {}, getFacilitySnapshot);

  return (
    <>
      <PageHeader
        title="Central Facility Alert & Anomaly Center"
        description="Unified alert queue for equipment breakdown, utility spikes, overdue maintenance, AMC expiries and low stock."
        breadcrumb={["Facility", "Alerts"]}
      />

      <div className="space-y-6 p-4 sm:p-6">
        <Section title="Active Facility Alerts" description="Categorized by severity: Critical, High, Medium">
          <div className="space-y-3">
            {[
              { id: "ALT-01", type: "Utility Consumption Spike", target: "Water Meter MTR-WAT-BLD4 (Meghna Tower)", severity: "high", desc: "Water consumption spiked by 45% (2,700 m³ in 24h). Leakage suspected." },
              { id: "ALT-02", type: "Asset Breakdown", target: "Water Pump PMP-A-002", severity: "high", desc: "Bearing noise & mechanical seal leaking 5L/day. Work Order WO-FAC-1001 issued." },
              { id: "ALT-03", type: "AMC Expiring Soon", target: "KONE Lift AMC-2025-KNE-01", severity: "medium", desc: "Contract expires in 45 days. Renewal required with KONE Bangladesh Ltd." },
              { id: "ALT-04", type: "Compliance Certificate Expiring", target: "Fire Hydrant License CMP-FIRE-2026", severity: "medium", desc: "Fire safety clearance expires in 25 days. Re-inspection required." },
              { id: "ALT-05", type: "Low Inventory Stock", target: "Grundfos Seal Kit PRT-PMP-102", severity: "medium", desc: "Stock quantity is 2 (Reorder level: 3). Supplier order pending." },
            ].map((alt) => (
              <div key={alt.id} className="flex items-start justify-between rounded-xl border border-border bg-card p-4 text-xs shadow-sm">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={`size-4 ${alt.severity === "high" ? "text-red-500" : "text-amber-500"}`} />
                    <span className="font-semibold text-sm text-foreground">{alt.type}</span>
                    <StatusBadge value={alt.severity} />
                  </div>
                  <p className="text-muted-foreground font-medium">{alt.target}</p>
                  <p className="text-muted-foreground">{alt.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </>
  );
}
