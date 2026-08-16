import { useSyncExternalStore, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Stethoscope, CheckCircle2, Clock, Plus, ShieldCheck, X, FileText, AlertCircle,
} from "lucide-react";
import { PageHeader, Section, StatusBadge } from "@/components/app/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { facilityStore, getFacilitySnapshot } from "@/services/facilityStore";
import { bdt } from "@/lib/format";

export const Route = createFileRoute("/_admin/facility/biomedical")({
  head: () => ({
    meta: [
      { title: "Biomedical Equipment & Calibration — Facility Core Service" },
      { name: "description", content: "Community first-aid clinic & medical equipment management: patient monitors, ECG, oxygen, calibration schedules." },
    ],
  }),
  component: FacilityBiomedicalPage,
});

function FacilityBiomedicalPage() {
  const store = useSyncExternalStore(facilityStore.getSummary ? () => {} : () => {}, getFacilitySnapshot);
  const [showCalibModal, setShowCalibModal] = useState(false);
  const [calibResult, setCalibResult] = useState<"Pass" | "Fail" | "Adjusted">("Pass");
  const [certNo, setCertNo] = useState("NMI-ECG-2026-901");
  const [cost, setCost] = useState("15000");

  const equipment = store.biomedicalEquipment[0];

  const handleRecordCalib = (e: React.FormEvent) => {
    e.preventDefault();
    if (!equipment) return;
    facilityStore.recordCalibration({
      equipmentId: equipment.id,
      equipmentName: equipment.name,
      calibrationDate: new Date().toISOString().slice(0, 10),
      calibratedBy: "National Metrology Institute BD",
      certificateNumber: certNo,
      result: calibResult,
      costBDT: Number(cost) || 15000,
      nextDue: "2026-11-20",
    });
    setShowCalibModal(false);
  };

  return (
    <>
      <PageHeader
        title="Biomedical Equipment & Calibration Logs"
        description="Community Welfare Clinic & First-Aid Center medical diagnostic equipment, calibration schedules & certificates."
        breadcrumb={["Facility", "Biomedical Equipment"]}
        actions={
          <Button size="sm" onClick={() => setShowCalibModal(true)}>
            <Stethoscope className="mr-1.5 size-4" /> Record Calibration
          </Button>
        }
      />

      <div className="space-y-6 p-4 sm:p-6">
        {/* Equipment Cards */}
        <Section title="Community Clinic Medical Devices" description="Diagnostic monitors, ECG, Defibrillators & Oxygen systems">
          <div className="grid gap-4 sm:grid-cols-2">
            {store.biomedicalEquipment.map((bio) => (
              <div key={bio.id} className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-primary">{bio.equipmentCode}</span>
                    <h3 className="font-semibold text-base text-foreground mt-0.5">{bio.name}</h3>
                    <p className="text-xs text-muted-foreground">{bio.manufacturer} ({bio.model}) · SN: {bio.serialNumber}</p>
                  </div>
                  <StatusBadge value={bio.certificationStatus} />
                </div>

                <div className="rounded-lg bg-muted/40 p-3 space-y-1 text-xs">
                  <p>Location: <strong>{bio.clinicLocation}</strong></p>
                  <p>Responsible Officer: {bio.responsiblePerson}</p>
                  <p>Vendor: {bio.vendorName}</p>
                  <div className="flex justify-between border-t border-border/50 pt-2 mt-2">
                    <span>Last Calibration: {bio.lastCalibrationDate}</span>
                    <span>Next Calibration: <strong className="text-foreground">{bio.nextCalibrationDate}</strong></span>
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => setShowCalibModal(true)}>
                    <CheckCircle2 className="size-3.5" /> Log Calibration Test
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Calibration Logs Table */}
        <Section title="Historical Calibration Records & Certificates" description="Official Metrology & Biomedical Test Certificates">
          <div className="divide-y divide-border rounded-xl border border-border bg-card overflow-hidden text-xs">
            <div className="grid grid-cols-6 gap-2 bg-muted/60 p-3 font-semibold text-muted-foreground">
              <span>Date</span>
              <span>Device Name</span>
              <span>Calibrated By</span>
              <span>Certificate #</span>
              <span>Result</span>
              <span className="text-right">Cost</span>
            </div>
            {store.calibrationRecords.map((c) => (
              <div key={c.id} className="grid grid-cols-6 gap-2 p-3 items-center hover:bg-muted/20">
                <span>{c.calibrationDate}</span>
                <span className="font-medium">{c.equipmentName}</span>
                <span>{c.calibratedBy}</span>
                <span className="font-mono">{c.certificateNumber}</span>
                <span><Badge variant={c.result === "Pass" ? "secondary" : "destructive"} className="text-[10px]">{c.result}</Badge></span>
                <span className="text-right font-mono font-bold">{bdt(c.costBDT)}</span>
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* Record Calibration Modal */}
      {showCalibModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <form onSubmit={handleRecordCalib} className="w-full max-w-md rounded-xl border border-border bg-card p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-semibold text-sm">Log Biomedical Calibration Test</h3>
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowCalibModal(false)}><X className="size-4" /></Button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <Label className="text-xs">Certificate Number *</Label>
                <Input required className="mt-1 font-mono" value={certNo} onChange={(e) => setCertNo(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Test Result</Label>
                <select className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-xs" value={calibResult} onChange={(e) => setCalibResult(e.target.value as any)}>
                  <option value="Pass">Pass (Certified)</option>
                  <option value="Adjusted">Adjusted / Recalibrated</option>
                  <option value="Fail">Fail (Out of Service)</option>
                </select>
              </div>
              <div>
                <Label className="text-xs">Calibration Fee (BDT)</Label>
                <Input className="mt-1" type="number" value={cost} onChange={(e) => setCost(e.target.value)} />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowCalibModal(false)}>Cancel</Button>
              <Button type="submit" size="sm">Save Calibration Record</Button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
