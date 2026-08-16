import { useSyncExternalStore } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Clock, Wrench, ShieldCheck, Building2, ChevronRight, CheckCircle2 } from "lucide-react";
import { PageHeader, Section } from "@/components/app/primitives";
import { facilityStore, getFacilitySnapshot } from "@/services/facilityStore";
import { bdt } from "@/lib/format";

export const Route = createFileRoute("/_admin/facility/asset-lifecycle")({
  head: () => ({
    meta: [
      { title: "Asset Lifecycle & Audit Timeline — Facility Core Service" },
      { name: "description", content: "Asset procurement, installation, operational history, maintenance, repairs, AMC renewals, and retirement timeline." },
    ],
  }),
  component: AssetLifecyclePage,
});

function AssetLifecyclePage() {
  const store = useSyncExternalStore(facilityStore.getSummary ? () => {} : () => {}, getFacilitySnapshot);
  const generator = store.assets[0];

  return (
    <>
      <PageHeader
        title="Asset Lifecycle Audit & Event Timeline"
        description="Comprehensive audit trail of asset events: Procurement → Installation → Operation → Maintenance → AMC Renewals → Replacement."
        breadcrumb={["Facility", "Asset Lifecycle"]}
      />

      <div className="space-y-6 p-4 sm:p-6">
        <Section title={`Lifecycle Timeline for ${generator?.name ?? "Primary Asset"}`} description={`Asset Code: ${generator?.assetCode} · Location: ${generator?.buildingName}`}>
          <div className="relative border-l-2 border-primary/30 ml-4 pl-6 space-y-6">
            {store.lifecycleEvents.map((evt) => (
              <div key={evt.id} className="relative space-y-1 bg-card rounded-xl border border-border p-4 shadow-sm">
                <div className="absolute -left-[31px] top-4 grid size-6 place-items-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  ✓
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-primary">{evt.eventType}</span>
                  <span className="text-xs text-muted-foreground">{evt.date}</span>
                </div>
                <h4 className="font-semibold text-sm text-foreground">{evt.title}</h4>
                <p className="text-xs text-muted-foreground">{evt.description}</p>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground border-t border-border/50 pt-2 mt-2">
                  <span>By: {evt.performedBy}</span>
                  {evt.cost && <span className="font-bold text-foreground">Cost: {bdt(evt.cost)}</span>}
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </>
  );
}
