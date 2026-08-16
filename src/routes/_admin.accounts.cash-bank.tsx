import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/module-page";
import { cashBankService } from "@/services";
import type { Column, FilterDef } from "@/components/app/data-table";
import type { FieldDef } from "@/components/app/record-form";
import { bdt, titleize } from "@/lib/format";
import { StatusBadge } from "@/components/app/primitives";

export const Route = createFileRoute("/_admin/accounts/cash-bank")({
  head: () => ({
    meta: [
      { title: "Cash & Bank Accounts — Bashundhara R/A" },
      { name: "description", content: "Operating, reserve and petty cash accounts with reconciliation status." },
      { property: "og:title", content: "Cash & Bank Accounts — Bashundhara R/A" },
      { property: "og:description", content: "Operating, reserve and petty cash accounts with reconciliation status." },
    ],
  }),
  component: Page,
});

/* eslint-disable @typescript-eslint/no-explicit-any */
const columns: Column<any>[] = [
  { key: "name", header: "Account" },
  { key: "kind", header: "Type", render: (r) => titleize(String(r.kind)) },
  { key: "bank", header: "Bank" },
  { key: "accountNo", header: "Account no" },
  { key: "scope", header: "Scope" },
  { key: "balance", header: "Balance", render: (r) => <span className="tabular">{bdt(r.balance)}</span>, value: (r) => r.balance },
  { key: "lastReconciledOn", header: "Last reconciled" },
  { key: "reconciliationStatus", header: "Reconciliation", render: (r) => <StatusBadge value={r.reconciliationStatus} /> },
];

const filters: FilterDef[] = [
  { key: "kind", label: "Type", options: ["bank", "cash"] },
  { key: "reconciliationStatus", label: "Reconciliation", options: ["reconciled", "in_progress", "pending"] },
];

const createFields: FieldDef[] = [
  { name: "name", label: "Account name", required: true },
  { name: "kind", label: "Type", type: "select", options: ["bank", "cash"], required: true },
  { name: "bank", label: "Bank" },
  { name: "accountNo", label: "Account number" },
  { name: "branch", label: "Branch" },
  { name: "openingBalance", label: "Opening balance (BDT)", type: "number", required: true },
];

function Page() {
  return (
    <ModulePage
      title="Cash & Bank Accounts"
      description="Operating, reserve and petty cash accounts with reconciliation status."
      breadcrumb={["Accounts", "Cash & Bank"]}
      service={cashBankService as never}
      queryKey="acc-cash-bank"
      columns={columns}
      filters={filters}
      createFields={createFields}
      createLabel="Add account"
    />
  );
}
