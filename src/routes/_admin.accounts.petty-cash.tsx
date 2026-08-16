import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/module-page";
import { pettyCashService } from "@/services";
import type { Column, FilterDef } from "@/components/app/data-table";
import type { FieldDef } from "@/components/app/record-form";
import { bdt, titleize } from "@/lib/format";
import { StatusBadge } from "@/components/app/primitives";

export const Route = createFileRoute("/_admin/accounts/petty-cash")({
  head: () => ({
    meta: [
      { title: "Petty Cash — Bashundhara R/A" },
      { name: "description", content: "Day-to-day petty cash issues, replenishments and approvals with running balance." },
      { property: "og:title", content: "Petty Cash — Bashundhara R/A" },
      { property: "og:description", content: "Day-to-day petty cash issues, replenishments and approvals with running balance." },
    ],
  }),
  component: Page,
});

/* eslint-disable @typescript-eslint/no-explicit-any */
const columns: Column<any>[] = [
  { key: "id", header: "Voucher" },
  { key: "date", header: "Date" },
  { key: "purpose", header: "Purpose" },
  { key: "category", header: "Category" },
  { key: "kind", header: "Kind", render: (r) => titleize(String(r.kind)) },
  { key: "amount", header: "Amount", render: (r) => <span className="tabular">{bdt(r.amount)}</span>, value: (r) => r.amount },
  { key: "balanceAfter", header: "Balance", render: (r) => <span className="tabular">{bdt(r.balanceAfter)}</span>, value: (r) => r.balanceAfter },
  { key: "submittedBy", header: "Submitted by" },
  { key: "approvalStatus", header: "Approval", render: (r) => <StatusBadge value={r.approvalStatus} /> },
];

const filters: FilterDef[] = [
  { key: "kind", label: "Kind", options: ["expense", "replenishment", "opening"] },
  { key: "approvalStatus", label: "Approval", options: ["pending", "approved", "rejected"] },
  { key: "category", label: "Category", options: ["Maintenance", "Administration", "Cleaning", "Security", "Utilities"] },
];

const createFields: FieldDef[] = [
  { name: "date", label: "Date", type: "date", required: true },
  { name: "purpose", label: "Purpose", required: true },
  { name: "category", label: "Category", type: "select", options: ["Maintenance", "Administration", "Cleaning", "Security", "Utilities"], required: true },
  { name: "kind", label: "Kind", type: "select", options: ["expense", "replenishment"], required: true },
  { name: "amount", label: "Amount (BDT)", type: "number", required: true },
  { name: "receiptRef", label: "Receipt reference" },
];

function Page() {
  return (
    <ModulePage
      title="Petty Cash"
      description="Day-to-day petty cash issues, replenishments and approvals with running balance."
      breadcrumb={["Accounts", "Petty Cash"]}
      service={pettyCashService as never}
      queryKey="acc-petty-cash"
      columns={columns}
      filters={filters}
      createFields={createFields}
      createLabel="Record voucher"
    />
  );
}
