import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/module-page";
import { procurementService } from "@/services";
import type { Column, FilterDef } from "@/components/app/data-table";
import type { FieldDef } from "@/components/app/record-form";
import { bdt, titleize } from "@/lib/format";
import { StatusBadge } from "@/components/app/primitives";

export const Route = createFileRoute("/_admin/inventory/procurement")({
  head: () => ({
    meta: [
      { title: "Procurement Pipeline — Bashundhara R/A" },
      { name: "description", content: "Request → approval → PO → goods receipt → vendor bill → payable → payment." },
      { property: "og:title", content: "Procurement Pipeline — Bashundhara R/A" },
      { property: "og:description", content: "Request → approval → PO → goods receipt → vendor bill → payable → payment." },
    ],
  }),
  component: Page,
});

/* eslint-disable @typescript-eslint/no-explicit-any */
const columns: Column<any>[] = [
  { key: "id", header: "Reference" },
  { key: "title", header: "Requirement" },
  { key: "vendor", header: "Vendor" },
  { key: "category", header: "Category" },
  { key: "amount", header: "Amount", render: (r) => <span className="tabular">{bdt(r.amount)}</span>, value: (r) => r.amount },
  { key: "requestedBy", header: "Requested by" },
  { key: "requestedOn", header: "Requested" },
  { key: "stage", header: "Stage", render: (r) => titleize(String(r.stage)) },
  { key: "poNo", header: "PO" },
  { key: "status", header: "Status", render: (r) => <StatusBadge value={r.status} /> },
];

const filters: FilterDef[] = [
  { key: "stage", label: "Stage", options: ["request", "approval", "purchase_order", "goods_receipt", "vendor_bill", "payable", "paid"] },
  { key: "status", label: "Status", options: ["open", "completed", "rejected"] },
];

const createFields: FieldDef[] = [
  { name: "title", label: "Requirement", required: true },
  { name: "vendor", label: "Vendor", required: true },
  { name: "category", label: "Category", type: "select", options: ["Electrical", "Mechanical", "Civil", "Cleaning", "Security", "Administration"], required: true },
  { name: "amount", label: "Estimated amount (BDT)", type: "number", required: true },
];

function Page() {
  return (
    <ModulePage
      title="Procurement Pipeline"
      description="Request → approval → PO → goods receipt → vendor bill → payable → payment."
      breadcrumb={["Inventory", "Procurement"]}
      service={procurementService as never}
      queryKey="inv-procurement"
      columns={columns}
      filters={filters}
      createFields={createFields}
      createLabel="Raise request"
    />
  );
}
