import { useSyncExternalStore, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle, CheckCircle2, Clock, Plus, RefreshCw, Search, ShieldCheck,
  Building2, Calendar, FileText, UserCheck, X,
} from "lucide-react";
import { PageHeader, Section, StatusBadge } from "@/components/app/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { facilityStore, getFacilitySnapshot } from "@/services/facilityStore";
import { bdt } from "@/lib/format";
import type { AMCContract } from "@/types/facility";

export const Route = createFileRoute("/_admin/facility/amc")({
  head: () => ({
    meta: [
      { title: "AMC & Contract Management — Facility Core Service" },
      { name: "description", content: "Annual Maintenance Contracts (AMC) for Generators, Lifts, HVAC, Pumps; contract expiries, renewal alerts, vendor visits." },
    ],
  }),
  component: FacilityAMCPage,
});

function FacilityAMCPage() {
  const store = useSyncExternalStore(facilityStore.getSummary ? () => {} : () => {}, getFacilitySnapshot);
  const [selectedAmc, setSelectedAmc] = useState<AMCContract | null>(null);
  const [renewMonths, setRenewMonths] = useState(12);

  const handleRenew = (amcId: string) => {
    facilityStore.renewAMCContract(amcId, renewMonths);
    setSelectedAmc(null);
  };

  const handleSimulateArrival = (visitId: string) => {
    facilityStore.recordVendorVisitArrival(visitId, `PAS-VND-${Math.floor(100 + Math.random() * 900)}`);
  };

  return (
    <>
      <PageHeader
        title="AMC & Contract Management"
        description="Annual Maintenance Contracts (AMC), vendor SLA compliance, contract expiry countdown, and vendor visit gate verifications."
        breadcrumb={["Facility", "AMC Contracts"]}
      />

      <div className="space-y-6 p-4 sm:p-6">
        {/* AMC Expiry Alert Banner */}
        {store.amcContracts.some((a) => a.status === "Expiring Soon") && (
          <div className="rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-950/30 p-4 space-y-1">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-semibold text-sm">
              <AlertTriangle className="size-4" />
              <span>AMC Expiry Notice: 1 or more Annual Contracts require attention!</span>
            </div>
            <p className="text-xs text-amber-700 dark:text-amber-400">
              KONE Comprehensive Lift AMC expires in 45 days. Review terms and renew contract to maintain breakdown coverage.
            </p>
          </div>
        )}

        {/* AMC Contracts Grid */}
        <Section title="Active Annual Maintenance Contracts (AMC)" description="Service agreements, SLAs, and included maintenance visits">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
            {store.amcContracts.map((amc) => (
              <div key={amc.id} className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-sm hover:border-primary/40 transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-primary">{amc.contractCode}</span>
                    <h3 className="font-semibold text-base text-foreground mt-0.5">{amc.serviceType}</h3>
                    <p className="text-xs text-muted-foreground">{amc.vendorName} · Asset: <strong>{amc.assetName}</strong></p>
                  </div>
                  <StatusBadge value={amc.status} />
                </div>

                <div className="rounded-lg bg-muted/40 p-3 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Contract Period:</span>
                    <span className="font-medium">{amc.startDate} to {amc.endDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Contract Value:</span>
                    <span className="font-bold text-primary">{bdt(amc.contractValueBDT)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">SLA Response:</span>
                    <span>{amc.slaResponseHours} Hours Breakdown SLA</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Visit Frequency:</span>
                    <span>{amc.visitFrequency} Visits</span>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground space-y-1">
                  <p><strong>Included:</strong> {amc.includedServices}</p>
                </div>

                <div className="flex items-center justify-between border-t border-border pt-3 text-xs">
                  <span className="text-muted-foreground">Payment: {amc.paymentTerms}</span>
                  <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => setSelectedAmc(amc)}>
                    <RefreshCw className="size-3.5" /> Renew AMC
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Scheduled Vendor Visits Table */}
        <Section title="Scheduled AMC Vendor Visits & Security Gate Verification" description="Integration with Gate Desk Access Control">
          <div className="overflow-x-auto rounded-xl border border-border bg-card">
            <div className="divide-y divide-border min-w-[640px] text-xs">
              <div className="grid grid-cols-6 gap-2 bg-muted/60 p-3 font-semibold text-muted-foreground">
                <span>Date</span>
                <span>Vendor & Contract</span>
                <span>Target Asset</span>
                <span>Technician</span>
                <span>Security Pass</span>
                <span className="text-right">Gate Status</span>
              </div>
              {store.amcVisits.map((v) => (
                <div key={v.id} className="grid grid-cols-6 gap-2 p-3 items-center hover:bg-muted/20">
                  <span>{v.scheduledDate}</span>
                  <span className="font-medium">{v.vendorName} ({v.contractCode})</span>
                  <span>{v.assetName}</span>
                  <span>{v.technicianName} ({v.technicianPhone})</span>
                  <span className="font-mono">{v.securityPassId ?? "Pending Pass"}</span>
                  <span className="text-right flex items-center justify-end gap-2">
                    <StatusBadge value={v.gateArrivalStatus} />
                    {v.gateArrivalStatus === "Expected" && (
                      <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => handleSimulateArrival(v.id)}>
                        Arrived at Gate
                      </Button>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Section>
      </div>

      {/* Renew Modal */}
      {selectedAmc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-semibold text-sm">Renew Contract {selectedAmc.contractCode}</h3>
              <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedAmc(null)}><X className="size-4" /></Button>
            </div>
            <div className="space-y-3 text-xs">
              <p>Vendor: <strong>{selectedAmc.vendorName}</strong></p>
              <p>Asset: {selectedAmc.assetName}</p>
              <p>Current Expiry: {selectedAmc.endDate}</p>
              <div>
                <Label className="text-xs">Renewal Extension</Label>
                <select className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-xs" value={renewMonths} onChange={(e) => setRenewMonths(Number(e.target.value))}>
                  <option value={12}>12 Months (1 Year)</option>
                  <option value={24}>24 Months (2 Years)</option>
                  <option value={6}>6 Months</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setSelectedAmc(null)}>Cancel</Button>
              <Button size="sm" onClick={() => handleRenew(selectedAmc.id)}>Confirm Renewal</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
