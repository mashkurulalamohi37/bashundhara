import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/module-page";
import { budgetService } from "@/services";
import type { Column } from "@/components/app/data-table";
import { StatusBadge } from "@/components/app/primitives";
import { bdt } from "@/lib/format";

export const Route = createFileRoute("/_admin/finance/budget")({
  head: () => ({
    meta: [
      { title: "Budgets — Bashundhara R/A" },
      { name: "description", content: "Community and building budget lines with planned versus actual spend tracking." },
      { property: "og:title", content: "Budgets — Bashundhara R/A" },
      { property: "og:description", content: "Community and building budget lines with planned versus actual spend tracking." },
    ],
  }),
  component: Page,
});

const columns: Column<any>[] = [
  { key: "id", header: "Budget", className: "tabular" },
  { key: "buildingId", header: "Building", hideOnMobile: true },
  { key: "category", header: "Category", render: (r) => <span className="font-medium">{String(r.category)}</span> },
  { key: "period", header: "Period", hideOnMobile: true },
  { key: "planned", header: "Planned", render: (r) => <span className="tabular">{bdt(Number(r.planned))}</span> },
  { key: "actual", header: "Actual", render: (r) => <span className="tabular">{bdt(Number(r.actual))}</span> },
  { key: "status", header: "Status", render: (r) => <StatusBadge value={String(r.status)} /> },
];

function Page() {
  return (
    <ModulePage
      title="Budgets"
      description="Community and building budget lines with planned versus actual spend tracking."
      breadcrumb={["Finance", "Budget"]}
      service={budgetService as never}
      queryKey="finance-budgets"
      columns={columns}
      filters={[]}
      createFields={[
  { name: "category", label: "Category", required: true },
  { name: "period", label: "Period (YYYY-MM)", required: true },
  { name: "planned", label: "Planned amount (BDT)", type: "number", required: true },
]}
      createLabel="Add budget line"
    />
  );
}
