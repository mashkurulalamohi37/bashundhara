import { useSyncExternalStore, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  CheckCircle2, Clock, Plus, Search, Timer, Wrench, ShieldCheck, CheckSquare,
  AlertTriangle, Calendar,
} from "lucide-react";
import { PageHeader, Section, StatusBadge } from "@/components/app/primitives";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { facilityStore, getFacilitySnapshot } from "@/services/facilityStore";
import { bdt } from "@/lib/format";
import type { PreventiveSchedule } from "@/types/facility";

export const Route = createFileRoute("/_admin/facility/preventive-maintenance")({
  head: () => ({
    meta: [
      { title: "Preventive Maintenance — Facility Core Service" },
      { name: "description", content: "Scheduled recurring maintenance routines for Generators, Lifts, Pumps, Electrical panels, and HVAC." },
    ],
  }),
  component: PreventiveMaintenancePage,
});

function PreventiveMaintenancePage() {
  const store = useSyncExternalStore(facilityStore.getSummary ? () => {} : () => {}, getFacilitySnapshot);
  const [selectedSchedule, setSelectedSchedule] = useState<PreventiveSchedule | null>(store.preventiveSchedules[0] ?? null);

  const handleCreateWorkOrderFromPM = (pm: PreventiveSchedule) => {
    facilityStore.createWorkOrder({
      assetId: pm.assetId,
      issue: `[PM Scheduled] ${pm.scheduleCode} — ${pm.assetName}`,
      description: `Preventive maintenance routine for ${pm.frequencyLabel}. Responsible: ${pm.responsiblePerson}`,
      priority: "normal",
      maintenanceType: "Preventive",
      assignedTechnician: pm.responsiblePerson,
      vendorName: pm.vendorName,
      estimatedCost: pm.estimatedCost,
    });
  };

  return (
    <>
      <PageHeader
        title="Preventive Maintenance Schedules & Checklists"
        description="Automated recurring routines for generators, elevators, water pumps, and fire safety systems to prevent breakdown."
        breadcrumb={["Facility", "Preventive Maintenance"]}
      />

      <div className="space-y-6 p-4 sm:p-6">
        {/* PM Schedules Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Schedules List */}
          <Section title="Recurring Maintenance Schedules" description="Active 30-day, 90-day and annual maintenance routines">
            <div className="divide-y divide-border">
              {store.preventiveSchedules.map((pm) => (
                <div
                  key={pm.id}
                  onClick={() => setSelectedSchedule(pm)}
                  className={`p-4 space-y-2 cursor-pointer transition-colors ${selectedSchedule?.id === pm.id ? "bg-primary/5 border-l-4 border-l-primary" : "hover:bg-muted/30"}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-primary">{pm.scheduleCode}</span>
                      <Badge variant="outline" className="text-[10px]">{pm.frequencyLabel}</Badge>
                    </div>
                    <StatusBadge value={pm.status} />
                  </div>
                  <h3 className="font-semibold text-sm text-foreground">{pm.assetName}</h3>
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                    <span>Last Done: {pm.lastCompletedDate}</span>
                    <span>Next Due: <strong className="text-foreground">{pm.nextDueDate}</strong></span>
                  </div>
                  <div className="flex items-center justify-between text-xs border-t border-border/50 pt-2">
                    <span className="text-muted-foreground">Vendor: {pm.vendorName ?? "Internal Team"}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs gap-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCreateWorkOrderFromPM(pm);
                      }}
                    >
                      <Wrench className="size-3" /> Issue Work Order
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Active Checklist Details */}
          {selectedSchedule && (
            <Section
              title={`Maintenance Checklist — ${selectedSchedule.scheduleCode}`}
              description={`Standard operating procedure for ${selectedSchedule.assetName}`}
            >
              <div className="p-4 space-y-4">
                <div className="rounded-lg bg-muted/40 p-3 space-y-1 text-xs">
                  <p>Asset Code: <strong className="font-mono text-primary">{selectedSchedule.assetCode}</strong></p>
                  <p>Responsible Officer: <strong>{selectedSchedule.responsiblePerson}</strong></p>
                  <p>Estimated Service Cost: <strong>{bdt(selectedSchedule.estimatedCost)}</strong></p>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Inspection Steps</p>
                  {selectedSchedule.checklist.map((item) => (
                    <div key={item.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-3 text-xs">
                      <div className="flex items-center gap-2">
                        <CheckSquare className={`size-4 ${item.result === "Pass" ? "text-emerald-500" : "text-muted-foreground"}`} />
                        <span>{item.task}</span>
                      </div>
                      <Badge variant={item.result === "Pass" ? "secondary" : "outline"} className="text-[10px]">
                        {item.result}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </Section>
          )}
        </div>
      </div>
    </>
  );
}
