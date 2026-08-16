import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/module-page";
import { buildingExpenseService } from "@/services";
import type { Column } from "@/components/app/data-table";
import { StatusBadge } from "@/components/app/primitives";
import { bdt } from "@/lib/format";

export const Route = createFileRoute("/_admin/building/expenses")({
  head: () => ({
    meta: [
      { title: "Building Expenses — Bashundhara R/A" },
      { name: "description", content: "Every building expense attributed to a common area, floor or individual flat, with approver and invoice." },
      { property: "og:title", content: "Building Expenses — Bashundhara R/A" },
      { property: "og:description", content: "Every building expense attributed to a common area, floor or individual flat, with approver and invoice." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

/* eslint-disable @typescript-eslint/no-explicit-any */
const columns: Column<any>[] = [
  { key: "id", header: "Expense ID", className: "tabular" },
  { key: "buildingId", header: "Building" },
  { key: "category", header: "Category" },
  { key: "scope", header: "Scope", render: (r) => <StatusBadge value={String(r.scope ?? "—")} /> },
  { key: "scopeRef", header: "Attributed to", hideOnMobile: true },
  { key: "amount", header: "Amount", render: (r) => <span className="tabular">{bdt(Number(r.amount ?? 0))}</span>, value: (r) => Number(r.amount ?? 0) },
  { key: "vendor", header: "Vendor", hideOnMobile: true },
  { key: "paymentMethod", header: "Method", hideOnMobile: true },
  { key: "approvedBy", header: "Approved by", hideOnMobile: true },
  { key: "status", header: "Status", render: (r) => <StatusBadge value={String(r.status ?? "—")} /> },
];

const filters = [{ key: "scope", label: "Scope", options: ["common_area", "building_area", "floor", "flat"] }, { key: "status", label: "Status", options: ["paid", "approved", "pending", "rejected"] }];

function Page() {
  return (
    <ModulePage
      title="Building Expenses"
      description="Every building expense attributed to a common area, floor or individual flat, with approver and invoice."
      breadcrumb={["Building", "Expenses"]}
      service={buildingExpenseService as never}
      queryKey="building-expenses"
      columns={columns}
      filters={filters}
      detailTitle={(r: any) => `${r.id}`}
    />
  );
}
