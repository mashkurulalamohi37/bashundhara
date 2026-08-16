import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/module-page";
import { invoiceService } from "@/services";
import type { Column } from "@/components/app/data-table";
import type { FieldDef } from "@/components/app/record-form";
import { StatusBadge } from "@/components/app/primitives";
import { bdt } from "@/lib/format";

export const Route = createFileRoute("/_admin/finance/invoices")({
  head: () => ({
    meta: [
      { title: "Invoices — Bashundhara R/A" },
      { name: "description", content: "Service charge and utility billing with payment status and ageing." },
      { property: "og:title", content: "Invoices — Bashundhara R/A" },
      { property: "og:description", content: "Service charge and utility billing with payment status and ageing." },
    ],
  }),
  component: Page,
});

const columns: Column<any>[] = [
    { key: "id", header: "Invoice", className: "tabular" },
    { key: "resident", header: "Resident", render: (r) => <span className="font-medium">{r.resident}</span> },
    { key: "propertyId", header: "Property", className: "tabular", hideOnMobile: true },
    { key: "block", header: "Block" },
    { key: "head", header: "Head", render: (r) => <StatusBadge value={String(r.head)} /> },
    { key: "amount", header: "Amount", render: (r) => <span className="tabular">{bdt(r.amount as number)}</span>, value: (r) => r.amount as number },
    { key: "paid", header: "Paid", render: (r) => <span className="tabular">{bdt(r.paid as number)}</span>, value: (r) => r.paid as number, hideOnMobile: true },
    { key: "dueDate", header: "Due date", hideOnMobile: true },
    { key: "status", header: "Status", render: (r) => <StatusBadge value={String(r.status)} /> },
];

const filters = [
  { key: "head", label: "Billing head", options: ["service_charge", "maintenance", "parking", "construction", "penalty", "utility"] },
  { key: "status", label: "Status", options: ["paid", "partial", "due", "overdue"] },
  { key: "block", label: "Block", options: ["Block A", "Block B", "Block C", "Block D", "Block E"] },
];

const createFields: FieldDef[] = [
  { name: "resident", label: "Resident name", type: "text", required: true },
  { name: "propertyId", label: "Property ID", type: "text", required: true },
  { name: "block", label: "Block", type: "select", required: true, options: ["Block A", "Block B", "Block C", "Block D", "Block E"] },
  { name: "head", label: "Billing head", type: "select", required: true, options: ["service_charge", "maintenance", "parking", "construction", "penalty", "utility"] },
  { name: "amount", label: "Amount (BDT)", type: "number", required: true },
  { name: "issueDate", label: "Issue date", type: "date", required: true },
  { name: "dueDate", label: "Due date", type: "date", required: true },
];

function Page() {
  return (
    <ModulePage
      title="Invoices"
      description="Service charge and utility billing with payment status and ageing."
      breadcrumb={["Finance", "Invoices"]}
      service={invoiceService as never}
      queryKey="invoices"
      columns={columns}
      filters={filters}
      createFields={createFields}
      createLabel="Create invoice"
      detailTitle={(r: any) => r.id}
    />
  );
}
