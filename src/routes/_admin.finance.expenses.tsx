import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/module-page";
import { expenseService } from "@/services";
import type { Column } from "@/components/app/data-table";
import type { FieldDef } from "@/components/app/record-form";
import { StatusBadge } from "@/components/app/primitives";
import { bdt } from "@/lib/format";

export const Route = createFileRoute("/_admin/finance/expenses")({
  head: () => ({
    meta: [
      { title: "Expenses — Bashundhara R/A" },
      { name: "description", content: "Community expenditure by category and vendor with approval workflow." },
      { property: "og:title", content: "Expenses — Bashundhara R/A" },
      { property: "og:description", content: "Community expenditure by category and vendor with approval workflow." },
    ],
  }),
  component: Page,
});

const columns: Column<any>[] = [
    { key: "id", header: "Expense ID", className: "tabular" },
    { key: "title", header: "Expense", render: (r) => <span className="font-medium">{r.title}</span> },
    { key: "category", header: "Category", render: (r) => <StatusBadge value={String(r.category)} /> },
    { key: "vendor", header: "Vendor", hideOnMobile: true },
    { key: "amount", header: "Amount", render: (r) => <span className="tabular">{bdt(r.amount as number)}</span>, value: (r) => r.amount as number },
    { key: "date", header: "Date", hideOnMobile: true },
    { key: "approvedBy", header: "Approved by", hideOnMobile: true },
    { key: "status", header: "Status", render: (r) => <StatusBadge value={String(r.status)} /> },
];

const filters = [
  { key: "status", label: "Status", options: ["approved", "pending", "rejected"] },
];

const createFields: FieldDef[] = [
  { name: "title", label: "Expense title", type: "text", required: true },
  { name: "category", label: "Category", type: "select", required: true, options: ["Security", "Cleaning", "Electricity", "Water", "Repairs", "Landscaping", "Administration", "IT"] },
  { name: "vendor", label: "Vendor", type: "text", required: true },
  { name: "amount", label: "Amount (BDT)", type: "number", required: true },
  { name: "date", label: "Expense date", type: "date", required: true },
];

function Page() {
  return (
    <ModulePage
      title="Expenses"
      description="Community expenditure by category and vendor with approval workflow."
      breadcrumb={["Finance", "Expenses"]}
      service={expenseService as never}
      queryKey="expenses"
      columns={columns}
      filters={filters}
      createFields={createFields}
      createLabel="Record expense"
      detailTitle={(r: any) => r.title}
    />
  );
}
