import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/module-page";
import { accountingProjectService } from "@/services";
import type { Column, FilterDef } from "@/components/app/data-table";
import type { FieldDef } from "@/components/app/record-form";
import { bdt } from "@/lib/format";
import { StatusBadge } from "@/components/app/primitives";

export const Route = createFileRoute("/_admin/accounts/projects")({
  head: () => ({
    meta: [
      { title: "Project & Job Costing — Bashundhara R/A" },
      { name: "description", content: "Budget versus actual cost per project, split by purchases, labour and vendor cost." },
      { property: "og:title", content: "Project & Job Costing — Bashundhara R/A" },
      { property: "og:description", content: "Budget versus actual cost per project, split by purchases, labour and vendor cost." },
    ],
  }),
  component: Page,
});

/* eslint-disable @typescript-eslint/no-explicit-any */
const columns: Column<any>[] = [
  { key: "id", header: "Project" },
  { key: "name", header: "Name" },
  { key: "category", header: "Category" },
  { key: "budget", header: "Budget", render: (r) => <span className="tabular">{bdt(r.budget)}</span>, value: (r) => r.budget },
  { key: "purchases", header: "Purchases", render: (r) => <span className="tabular">{bdt(r.purchases)}</span>, value: (r) => r.purchases },
  { key: "labor", header: "Labour", render: (r) => <span className="tabular">{bdt(r.labor)}</span>, value: (r) => r.labor },
  { key: "vendorCost", header: "Vendor", render: (r) => <span className="tabular">{bdt(r.vendorCost)}</span>, value: (r) => r.vendorCost },
  { key: "actual", header: "Actual", render: (r) => <span className="tabular">{bdt(r.actual)}</span>, value: (r) => r.actual },
  { key: "variance", header: "Variance", render: (r) => <span className="tabular">{bdt(r.variance)}</span>, value: (r) => r.variance },
  { key: "status", header: "Status", render: (r) => <StatusBadge value={r.status} /> },
];

const filters: FilterDef[] = [
  { key: "status", label: "Status", options: ["planning", "in_progress", "on_hold", "completed"] },
  { key: "category", label: "Category", options: ["Civil", "Electrical", "Mechanical", "Safety", "Environment"] },
];

const createFields: FieldDef[] = [
  { name: "name", label: "Project name", required: true },
  { name: "category", label: "Category", type: "select", options: ["Civil", "Electrical", "Mechanical", "Safety", "Environment"], required: true },
  { name: "budget", label: "Budget (BDT)", type: "number", required: true },
  { name: "startDate", label: "Start date", type: "date", required: true },
  { name: "endDate", label: "Target end date", type: "date" },
];

function Page() {
  return (
    <ModulePage
      title="Project & Job Costing"
      description="Budget versus actual cost per project, split by purchases, labour and vendor cost."
      breadcrumb={["Accounts", "Projects"]}
      service={accountingProjectService as never}
      queryKey="acc-projects"
      columns={columns}
      filters={filters}
      createFields={createFields}
      createLabel="Create project"
    />
  );
}
