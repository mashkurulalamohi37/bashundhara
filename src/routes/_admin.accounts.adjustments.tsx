import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/module-page";
import { adjustmentService } from "@/services";
import type { Column, FilterDef } from "@/components/app/data-table";
import type { FieldDef } from "@/components/app/record-form";
import { bdt, titleize } from "@/lib/format";
import { StatusBadge } from "@/components/app/primitives";

export const Route = createFileRoute("/_admin/accounts/adjustments")({
  head: () => ({
    meta: [
      { title: "Refunds & Adjustments — Bashundhara R/A" },
      { name: "description", content: "Refunds, credit and debit notes, overpayments, cancellations and reversals." },
      { property: "og:title", content: "Refunds & Adjustments — Bashundhara R/A" },
      { property: "og:description", content: "Refunds, credit and debit notes, overpayments, cancellations and reversals." },
    ],
  }),
  component: Page,
});

/* eslint-disable @typescript-eslint/no-explicit-any */
const columns: Column<any>[] = [
  { key: "id", header: "Reference" },
  { key: "date", header: "Date" },
  { key: "kind", header: "Type", render: (r) => titleize(String(r.kind)) },
  { key: "reference", header: "Against" },
  { key: "party", header: "Party" },
  { key: "originalAmount", header: "Original", render: (r) => <span className="tabular">{bdt(r.originalAmount)}</span>, value: (r) => r.originalAmount },
  { key: "amount", header: "Adjusted", render: (r) => <span className="tabular">{bdt(r.amount)}</span>, value: (r) => r.amount },
  { key: "reason", header: "Reason" },
  { key: "status", header: "Status", render: (r) => <StatusBadge value={r.status} /> },
];

const filters: FilterDef[] = [
  { key: "kind", label: "Type", options: ["full_refund", "partial_refund", "credit_note", "debit_note", "overpayment", "deposit_refund", "cancellation", "payment_reversal"] },
  { key: "status", label: "Status", options: ["requested", "approved", "posted", "rejected"] },
];

const createFields: FieldDef[] = [
  { name: "kind", label: "Adjustment type", type: "select", options: ["full_refund", "partial_refund", "credit_note", "debit_note", "overpayment", "deposit_refund", "cancellation", "payment_reversal"], required: true },
  { name: "reference", label: "Against reference", required: true },
  { name: "party", label: "Party", required: true },
  { name: "amount", label: "Adjustment amount (BDT)", type: "number", required: true },
  { name: "reason", label: "Reason", type: "textarea", required: true },
];

function Page() {
  return (
    <ModulePage
      title="Refunds & Adjustments"
      description="Refunds, credit and debit notes, overpayments, cancellations and reversals."
      breadcrumb={["Accounts", "Adjustments"]}
      service={adjustmentService as never}
      queryKey="acc-adjustments"
      columns={columns}
      filters={filters}
      createFields={createFields}
      createLabel="Raise adjustment"
    />
  );
}
