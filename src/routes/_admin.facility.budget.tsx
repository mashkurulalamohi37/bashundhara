import { useSyncExternalStore } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Wallet, PiggyBank, TrendingUp, AlertCircle, BarChart2,
} from "lucide-react";
import { PageHeader, Section } from "@/components/app/primitives";
import { facilityStore, getFacilitySnapshot } from "@/services/facilityStore";
import { bdt } from "@/lib/format";

export const Route = createFileRoute("/_admin/facility/budget")({
  head: () => ({
    meta: [
      { title: "Facility Budget & Variance — Facility Core Service" },
      { name: "description", content: "Facility OPEX & CAPEX budget allocations: Maintenance, Utilities, Housekeeping, AMC, Asset Replacements." },
    ],
  }),
  component: FacilityBudgetPage,
});

function FacilityBudgetPage() {
  const store = useSyncExternalStore(facilityStore.getSummary ? () => {} : () => {}, getFacilitySnapshot);

  return (
    <>
      <PageHeader
        title="Facility OPEX & CAPEX Budgeting"
        description="Allocated budgets vs actual spent and committed expenditure across community operational categories."
        breadcrumb={["Facility", "Budget"]}
      />

      <div className="space-y-6 p-4 sm:p-6">
        <Section title="Fiscal Year 2025–2026 Facility Category Budgets" description="Formula: Remaining = Allocated - Actual Spent - Committed">
          <div className="grid gap-4 sm:grid-cols-2">
            {store.budgets.map((b) => {
              const spentPct = Math.round((b.actualSpentBDT / b.allocatedBDT) * 100);
              return (
                <div key={b.id} className="rounded-xl border border-border bg-card p-5 space-y-3 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-base text-foreground">{b.category}</h3>
                      <p className="text-xs text-muted-foreground">Fiscal Year: {b.fiscalYear}</p>
                    </div>
                    <span className="font-mono text-sm font-bold text-primary">{bdt(b.allocatedBDT)}</span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Spent: <strong>{bdt(b.actualSpentBDT)}</strong> ({spentPct}%)</span>
                      <span>Remaining: <strong className="text-emerald-600 dark:text-emerald-400">{bdt(b.remainingBDT)}</strong></span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${Math.min(100, spentPct)}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Section>
      </div>
    </>
  );
}
