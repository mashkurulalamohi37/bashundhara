import { useSyncExternalStore, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  CheckCircle2, Clock, Plus, Search, Sparkles, Trash2, UserCheck, X, Camera, CheckSquare,
  AlertCircle, Star, ShieldCheck,
} from "lucide-react";
import { PageHeader, Section, StatusBadge } from "@/components/app/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { facilityStore, getFacilitySnapshot } from "@/services/facilityStore";
import type { HousekeepingTask } from "@/types/facility";

export const Route = createFileRoute("/_admin/facility/housekeeping")({
  head: () => ({
    meta: [
      { title: "Housekeeping & Sanitation — Facility Core Service" },
      { name: "description", content: "Housekeeping operations: common area cleaning, parking sweeping, waste management, quality scoring, and supervisor inspections." },
    ],
  }),
  component: FacilityHousekeepingPage,
});

function FacilityHousekeepingPage() {
  const store = useSyncExternalStore(facilityStore.getSummary ? () => {} : () => {}, getFacilitySnapshot);
  const [inspectTask, setInspectTask] = useState<HousekeepingTask | null>(null);
  const [score, setScore] = useState<"Excellent" | "Good" | "Needs Improvement" | "Failed">("Excellent");
  const [supervisorNotes, setSupervisorNotes] = useState("Lobby spotless and well sanitized.");

  const handleInspectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspectTask) return;
    facilityStore.inspectHousekeepingTask(inspectTask.id, score, supervisorNotes);
    setInspectTask(null);
  };

  const handleToggleComplete = (t: HousekeepingTask) => {
    facilityStore.updateHousekeepingTask(t.id, t.status === "Completed" ? "In Progress" : "Completed", true);
  };

  return (
    <>
      <PageHeader
        title="Housekeeping, Sanitation & Waste Operations"
        description="Daily cleaning schedules, common area sanitation, supervisor quality scoring, and waste collection management."
        breadcrumb={["Facility", "Housekeeping"]}
      />

      <div className="space-y-6 p-4 sm:p-6">
        {/* Cleaning Tasks Grid */}
        <Section title="Daily Cleaning & Sanitation Tasks" description="Lobby, parking, staircases, rooftop and community hall">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
            {store.housekeepingTasks.map((t) => (
              <div key={t.id} className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-primary">{t.taskCode}</span>
                    <h3 className="font-semibold text-base text-foreground mt-0.5">{t.taskName}</h3>
                    <p className="text-xs text-muted-foreground">{t.location} ({t.buildingName})</p>
                  </div>
                  <StatusBadge value={t.status} />
                </div>

                <div className="rounded-lg bg-muted/40 p-3 space-y-1.5 text-xs">
                  <p>Assigned Staff: <strong>{t.assignedStaff}</strong></p>
                  <p>Schedule: {t.frequency} ({t.startTime} – {t.dueTime})</p>
                  {t.supervisorScore && (
                    <p className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                      <Star className="size-3.5 fill-current" /> Score: {t.supervisorScore} ({t.supervisorNotes})
                    </p>
                  )}
                </div>

                {/* Checklist */}
                <div className="space-y-1.5">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase">Task Checklist</p>
                  {t.checklist.map((c) => (
                    <div key={c.id} className="flex items-center justify-between text-xs rounded bg-background p-2 border border-border/50">
                      <span>• {c.task}</span>
                      <Badge variant={c.result === "Pass" ? "secondary" : "outline"} className="text-[10px]">
                        {c.result}
                      </Badge>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between border-t border-border pt-3 text-xs">
                  <Button
                    size="sm"
                    variant={t.status === "Completed" ? "secondary" : "default"}
                    className="h-8 text-xs gap-1"
                    onClick={() => handleToggleComplete(t)}
                  >
                    <CheckCircle2 className="size-3.5" />
                    {t.status === "Completed" ? "Completed (Toggle)" : "Mark Complete"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs gap-1"
                    onClick={() => { setInspectTask(t); setScore("Excellent"); }}
                  >
                    <ShieldCheck className="size-3.5" /> Supervisor Inspect
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Waste Management */}
        <Section title="Community Waste Management & Recycling Operations" description="Waste collection zones, crew schedules and pickup tracking">
          <div className="divide-y divide-border rounded-xl border border-border bg-card overflow-hidden text-xs">
            <div className="grid grid-cols-5 gap-2 bg-muted/60 p-3 font-semibold text-muted-foreground">
              <span>Zone / Building</span>
              <span>Waste Type</span>
              <span>Assigned Crew</span>
              <span>Schedule</span>
              <span className="text-right">Status</span>
            </div>
            {store.wasteCollections.map((w) => (
              <div key={w.id} className="grid grid-cols-5 gap-2 p-3 items-center hover:bg-muted/20">
                <span className="font-medium">{w.buildingName} ({w.zone})</span>
                <span><Badge variant="outline" className="text-[10px]">{w.wasteType}</Badge></span>
                <span>{w.collectionStaff}</span>
                <span>{w.collectionSchedule}</span>
                <span className="text-right"><StatusBadge value={w.pickupStatus} /></span>
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* Supervisor Inspection Modal */}
      {inspectTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <form onSubmit={handleInspectSubmit} className="w-full max-w-md rounded-xl border border-border bg-card p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-semibold text-sm">Quality Inspection for {inspectTask.taskCode}</h3>
              <Button type="button" variant="ghost" size="sm" onClick={() => setInspectTask(null)}><X className="size-4" /></Button>
            </div>
            <div className="space-y-3 text-xs">
              <p>Task: <strong>{inspectTask.taskName}</strong></p>
              <p>Staff: {inspectTask.assignedStaff} ({inspectTask.location})</p>
              <div>
                <Label className="text-xs">Supervisor Score *</Label>
                <select className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-xs" value={score} onChange={(e) => setScore(e.target.value as any)}>
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Needs Improvement">Needs Improvement (Auto Corrective Task)</option>
                  <option value="Failed">Failed (Auto Corrective Task)</option>
                </select>
              </div>
              <div>
                <Label className="text-xs">Inspection Notes & Comments</Label>
                <textarea className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-xs resize-none" rows={2} value={supervisorNotes} onChange={(e) => setSupervisorNotes(e.target.value)} />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setInspectTask(null)}>Cancel</Button>
              <Button type="submit" size="sm">Submit Inspection</Button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
