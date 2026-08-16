import { useSyncExternalStore } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Layers, Building2, MapPin, ChevronRight, Wrench, ShieldCheck } from "lucide-react";
import { PageHeader, Section, StatusBadge } from "@/components/app/primitives";
import { facilityStore, getFacilitySnapshot } from "@/services/facilityStore";

export const Route = createFileRoute("/_admin/facility/structure")({
  head: () => ({
    meta: [
      { title: "Location Hierarchy & Facility Structure — Facility Core Service" },
      { name: "description", content: "Physical community hierarchy: Community -> Block -> Road -> Building -> Floor -> Common Area -> Facility -> Asset." },
    ],
  }),
  component: LocationHierarchyPage,
});

function LocationHierarchyPage() {
  const store = useSyncExternalStore(facilityStore.getSummary ? () => {} : () => {}, getFacilitySnapshot);

  return (
    <>
      <PageHeader
        title="Physical Community Location Hierarchy"
        description="Bashundhara R/A → Block A → Road 5 → Meghna Tower → Facility Areas & Linked Assets."
        breadcrumb={["Facility", "Location Structure"]}
      />

      <div className="space-y-6 p-4 sm:p-6">
        <Section title="Community Structural Tree View" description="Every asset is linked to its physical building, floor and equipment room">
          <div className="rounded-xl border border-border bg-card p-6 space-y-6 font-sans">
            {/* Tree Root */}
            <div className="flex items-center gap-2 font-bold text-base text-primary">
              <MapPin className="size-5" />
              <span>Bashundhara Residential Area (Community Root)</span>
            </div>

            {/* Block Level */}
            <div className="border-l-2 border-primary/40 ml-3 pl-6 space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2 font-semibold text-sm text-foreground">
                  <span className="rounded bg-primary/10 px-2 py-0.5 text-primary text-xs font-mono">BLOCK A</span>
                  <span>Road 5 (Meghna Tower Sector)</span>
                </div>

                {/* Building Level */}
                <div className="border-l-2 border-border ml-3 pl-6 space-y-4">
                  <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Building2 className="size-4 text-primary" />
                        <h4 className="font-bold text-sm">Meghna Tower (Building BLD-004)</h4>
                      </div>
                      <span className="text-xs text-muted-foreground">12 Floors · 48 Flats</span>
                    </div>

                    {/* Rooms & Facilities */}
                    <div className="grid gap-3 sm:grid-cols-2 text-xs pt-2">
                      <div className="rounded-md border border-border bg-card p-3 space-y-1">
                        <p className="font-semibold text-primary">⚡ Basement 1 — Generator Room B101</p>
                        <p className="text-muted-foreground font-mono text-[11px]">• GEN-A-001 Primary Diesel Generator 500kVA (Operational)</p>
                      </div>
                      <div className="rounded-md border border-border bg-card p-3 space-y-1">
                        <p className="font-semibold text-primary">🛗 Lift Shaft A — Floors 1 to 12</p>
                        <p className="text-muted-foreground font-mono text-[11px]">• LFT-A-001 KONE Passenger Elevator #1 (Operational)</p>
                      </div>
                      <div className="rounded-md border border-border bg-card p-3 space-y-1">
                        <p className="font-semibold text-amber-600 dark:text-amber-400">💧 Basement 2 — Pump Room B204</p>
                        <p className="text-muted-foreground font-mono text-[11px]">• PMP-A-002 Grundfos Water Pump (Under Maintenance)</p>
                      </div>
                      <div className="rounded-md border border-border bg-card p-3 space-y-1">
                        <p className="font-semibold text-primary">☀️ Rooftop Bay</p>
                        <p className="text-muted-foreground font-mono text-[11px]">• SOL-C-001 Rooftop Solar Array 45kWp (Operational)</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Section>
      </div>
    </>
  );
}
