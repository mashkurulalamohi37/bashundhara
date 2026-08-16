import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/module-page";
import { costCenterService } from "@/services";
import type { Column } from "@/components/app/data-table";
import type { FieldDef } from "@/components/app/record-form";
import { bdt } from "@/lib/format";
import { StatusBadge } from "@/components/app/primitives";

export const Route = createFileRoute("/_admin/accounts/cost-centers")({
  head: () => ({
    meta: [
      { title: "Cost Centers — Bashundhara R/A" },
      { name: "description", content: "Departmental cost centers with budget, actual spend and variance." },
      { property: "og:title", content: "Cost Centers — Bashundhara R/A" },
      { property: "og:description", content: "Departmental cost centers with budget, actual spend and variance." },
    ],
  }),
  component: Page,
});

/* eslint-disable @typescript-eslint/no-explicit-any */
const columns: Column<any>[] = [
  { key: "code", header: "Code" },
  { key: "name", header: "Cost center" },
  { key: "head", header: "Head" },
  { key: "budget", header: "Budget", render: (r) => <span className="tabular">{bdt(r.budget)}</span>, value: (r) => r.budget },
  { key: "actual", header: "Actual", render: (r) => <span className="tabular">{bdt(r.actual)}</span>, value: (r) => r.actual },
  { key: "variance", header: "Variance", render: (r) => <span className="tabular">{bdt(r.variance)}</span>, value: (r) => r.variance },
  { key: "status", header: "Status", render: (r) => <StatusBadge value={r.status} /> },
];

const createFields: FieldDef[] = [
  { name: "code", label: "Code", required: true },
  { name: "name", label: "Cost center name", required: true },
  { name: "head", label: "Responsible head", required: true },
  { name: "budget", label: "Annual budget (BDT)", type: "number", required: true },
];

function Page() {
  return (
    <ModulePage
      title="Cost Centers"
      description="Departmental cost centers with budget, actual spend and variance."
      breadcrumb={["Accounts", "Cost Centers"]}
      service={costCenterService as never}
      queryKey="acc-cost-centers"
      columns={columns}
      
      createFields={createFields}
      createLabel="Add cost center"
    />
  );
}
