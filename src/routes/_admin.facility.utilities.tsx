import { useSyncExternalStore, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle, CheckCircle2, Flame, Gauge, Plus, Search, Sun, Zap, Droplets,
  TrendingUp, Activity, X,
} from "lucide-react";
import { PageHeader, Section, KpiCard, StatusBadge } from "@/components/app/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { facilityStore, getFacilitySnapshot } from "@/services/facilityStore";
import { bdt } from "@/lib/format";
import type { UtilityType } from "@/types/facility";

export const Route = createFileRoute("/_admin/facility/utilities")({
  head: () => ({
    meta: [
      { title: "Utility Monitoring & Metering — Facility Core Service" },
      { name: "description", content: "Community utility monitoring: Electricity, Water, Gas, Fuel, Solar production, meter readings, consumption spike alerts." },
    ],
  }),
  component: FacilityUtilitiesPage,
});

function FacilityUtilitiesPage() {
  const store = useSyncExternalStore(facilityStore.getSummary ? () => {} : () => {}, getFacilitySnapshot);
  const [selectedMeterId, setSelectedMeterId] = useState(store.meters[0]?.id ?? "");
  const [readingInput, setReadingInput] = useState("");
  const [readerName, setReaderName] = useState("Caretaker Jamal Uddin");
  const [showReadingModal, setShowReadingModal] = useState(false);

  const selectedMeter = store.meters.find((m) => m.id === selectedMeterId) ?? store.meters[0];

  const handleRecordReading = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMeter || !readingInput) return;
    const val = Number(readingInput);
    if (val < selectedMeter.currentReading) {
      alert(`Reading cannot be less than previous reading (${selectedMeter.currentReading} ${selectedMeter.unit})`);
      return;
    }
    facilityStore.recordUtilityReading({
      meterId: selectedMeter.id,
      currentReading: val,
      readerName,
      readingSource: "Manual",
    });
    setShowReadingModal(false);
    setReadingInput("");
  };

  return (
    <>
      <PageHeader
        title="Utility Monitoring & Energy Management"
        description="Electricity, Water, Gas, Fuel & Solar energy meters. Track consumption trends, manual/IoT readings & abnormal spikes."
        breadcrumb={["Facility", "Utilities"]}
        actions={
          <Button size="sm" onClick={() => setShowReadingModal(true)}>
            <Plus className="mr-1.5 size-4" /> Record Meter Reading
          </Button>
        }
      />

      <div className="space-y-6 p-4 sm:p-6">
        {/* Active Spikes / Alerts */}
        {store.utilityAlerts.some((a) => !a.resolved) && (
          <div className="rounded-xl border border-red-300 bg-red-50 dark:bg-red-950/30 p-4 space-y-2">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-semibold text-sm">
              <AlertTriangle className="size-4 animate-bounce" />
              <span>Abnormal Utility Consumption Spike Detected</span>
            </div>
            {store.utilityAlerts.filter((a) => !a.resolved).map((a) => (
              <p key={a.id} className="text-xs text-red-600 dark:text-red-300">
                • {a.buildingName} ({a.utilityType}): {a.description}
              </p>
            ))}
          </div>
        )}

        {/* Meters Grid */}
        <Section title="Community & Building Utility Meters" description="DESCO, WASA & Titas gas sub-meters">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {store.meters.map((meter) => (
              <div key={meter.id} className="rounded-xl border border-border bg-card p-4 space-y-3 shadow-sm hover:border-primary/40 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {meter.utilityType === "Electricity" ? <Zap className="size-5 text-amber-500" /> :
                     meter.utilityType === "Water" ? <Droplets className="size-5 text-blue-500" /> :
                     meter.utilityType === "Gas" ? <Flame className="size-5 text-orange-500" /> :
                     <Sun className="size-5 text-yellow-500" />}
                    <div>
                      <span className="font-mono text-xs font-bold text-primary">{meter.meterCode}</span>
                      <h3 className="font-semibold text-sm text-foreground">{meter.utilityType} Meter</h3>
                    </div>
                  </div>
                  <StatusBadge value={meter.status} />
                </div>

                <div className="rounded-lg bg-muted/40 p-3 space-y-1 text-xs">
                  <p>Building: <strong>{meter.buildingName}</strong> ({meter.commonAreaName})</p>
                  <p>Serial #: <span className="font-mono">{meter.serialNumber}</span></p>
                  <div className="flex justify-between border-t border-border/60 pt-2 mt-2">
                    <span className="text-muted-foreground">Previous: {meter.previousReading} {meter.unit}</span>
                    <span className="font-bold text-foreground">Current: {meter.currentReading} {meter.unit}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-muted-foreground">Rate: BDT {meter.ratePerUnit}/{meter.unit}</span>
                  <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => { setSelectedMeterId(meter.id); setShowReadingModal(true); }}>
                    Record Reading
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Reading Logs & Consumption Table */}
        <Section title="Recent Reading Logs & Consumption Breakdown" description="Manual, Scheduled & IoT sensor imports">
          <div className="divide-y divide-border rounded-xl border border-border bg-card overflow-hidden text-xs">
            <div className="grid grid-cols-6 gap-2 bg-muted/60 p-3 font-semibold text-muted-foreground">
              <span>Date</span>
              <span>Meter & Building</span>
              <span>Utility</span>
              <span>Consumption</span>
              <span>Source</span>
              <span className="text-right">Total Cost</span>
            </div>
            {store.readings.map((r) => (
              <div key={r.id} className="grid grid-cols-6 gap-2 p-3 items-center hover:bg-muted/20">
                <span>{r.readingDate}</span>
                <span className="font-medium text-foreground">{r.buildingName} ({r.meterCode})</span>
                <span>{r.utilityType}</span>
                <span className="font-bold">{r.consumption} {r.unit}</span>
                <span><Badge variant="outline" className="text-[10px]">{r.readingSource}</Badge></span>
                <span className="text-right font-mono font-bold text-primary">{bdt(r.costBDT)}</span>
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* Record Reading Modal */}
      {showReadingModal && selectedMeter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <form onSubmit={handleRecordReading} className="w-full max-w-md rounded-xl border border-border bg-card p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-semibold text-sm">Record Reading for {selectedMeter.meterCode}</h3>
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowReadingModal(false)}><X className="size-4" /></Button>
            </div>
            <div className="space-y-3 text-xs">
              <p>Utility: <strong>{selectedMeter.utilityType}</strong> ({selectedMeter.buildingName})</p>
              <p>Previous Reading: <strong className="font-mono">{selectedMeter.currentReading} {selectedMeter.unit}</strong></p>
              <div>
                <Label className="text-xs">New Current Reading ({selectedMeter.unit}) *</Label>
                <Input
                  required
                  type="number"
                  min={selectedMeter.currentReading}
                  className="mt-1"
                  placeholder={`At least ${selectedMeter.currentReading}`}
                  value={readingInput}
                  onChange={(e) => setReadingInput(e.target.value)}
                />
              </div>
              <div>
                <Label className="text-xs">Reader Name</Label>
                <Input className="mt-1" value={readerName} onChange={(e) => setReaderName(e.target.value)} />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowReadingModal(false)}>Cancel</Button>
              <Button type="submit" size="sm">Save Reading</Button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
