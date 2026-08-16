import { useSyncExternalStore } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Wallet, DollarSign, FileText, CheckCircle2, TrendingUp, Landmark,
} from "lucide-react";
import { PageHeader, Section, StatusBadge } from "@/components/app/primitives";
import { facilityStore, getFacilitySnapshot } from "@/services/facilityStore";
import { bdt } from "@/lib/format";

export const Route = createFileRoute("/_admin/facility/costing")({
  head: () => ({
    meta: [
      { title: "Facility Costing & Accounts Integration — Facility Core Service" },
      { name: "description", content: "Facility cost breakdown by asset, building, work order, and accounts general ledger posting." },
    ],
  }),
  component: FacilityCostingPage,
});

function FacilityCostingPage() {
  const store = useSyncExternalStore(facilityStore.getSummary ? () => {} : () => {}, getFacilitySnapshot);

  return (
    <>
      <PageHeader
        title="Facility Costing & General Ledger Journal Integration"
        description="Every work order, parts consumption, utility bill & AMC payment posts directly to the central Accounts Module."
        breadcrumb={["Facility", "Costing"]}
      />

      <div className="space-y-6 p-4 sm:p-6">
        {/* Cost Records Table */}
        <Section title="Facility Financial Events & Cost Bookings" description="Direct integration with 5210 · Repairs & Maintenance Accounts Ledger">
          <div className="overflow-x-auto rounded-xl border border-border bg-card">
            <div className="divide-y divide-border min-w-[640px] text-xs">
              <div className="grid grid-cols-6 gap-2 bg-muted/60 p-3 font-semibold text-muted-foreground">
                <span>Date</span>
                <span>Category & Description</span>
                <span>Building & Asset</span>
                <span>Work Order / Voucher Ref</span>
                <span>General Ledger Account</span>
                <span className="text-right">Amount (BDT)</span>
              </div>
              {store.costRecords.map((c) => (
                <div key={c.id} className="grid grid-cols-6 gap-2 p-3 items-center hover:bg-muted/20">
                  <span>{c.date}</span>
                  <div className="space-y-0.5">
                    <p className="font-semibold text-foreground">{c.description}</p>
                    <p className="text-[10px] text-muted-foreground">{c.category}</p>
                  </div>
                  <span>{c.buildingName} {c.assetName ? `(${c.assetName})` : ""}</span>
                  <span className="font-mono text-primary font-medium">{c.workOrderRef ?? "DIRECT"}</span>
                  <span className="font-mono">{c.accountLedgerRef}</span>
                  <span className="text-right font-mono font-bold text-base text-foreground">{bdt(c.amountBDT)}</span>
                </div>
              ))}
            </div>
          </div>
        </Section>
      </div>
    </>
  );
}
